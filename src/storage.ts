import fs from 'fs/promises';
import path from 'path';
import { Memory, Metadata, MemoryType } from './types.js';

// Default memory directory
const DEFAULT_MEMORY_DIR = './memory';

export class MemoryStorage {
  private memoryDir: string;
  
  constructor(memoryDir: string = DEFAULT_MEMORY_DIR) {
    this.memoryDir = memoryDir;
  }

  /**
   * Initialize the memory storage directory structure
   */
  async initialize(): Promise<void> {
    // Create main memory directory if it doesn't exist
    await fs.mkdir(this.memoryDir, { recursive: true });
    
    // Create subdirectories for each memory type
    await fs.mkdir(path.join(this.memoryDir, 'entities'), { recursive: true });
    await fs.mkdir(path.join(this.memoryDir, 'concepts'), { recursive: true });
    await fs.mkdir(path.join(this.memoryDir, 'sessions'), { recursive: true });
    
    // Create or load metadata
    await this.getOrCreateMetadata();
  }

  /**
   * Get or create metadata file
   */
  async getOrCreateMetadata(): Promise<Metadata> {
    const metadataPath = path.join(this.memoryDir, 'metadata.json');
    
    try {
      const data = await fs.readFile(metadataPath, 'utf-8');
      return JSON.parse(data) as Metadata;
    } catch (error) {
      // Create new metadata if file doesn't exist
      const metadata: Metadata = {
        lastUpdated: new Date().toISOString(),
        memoryCount: 0,
        indexVersion: 1
      };
      
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
      return metadata;
    }
  }

  /**
   * Update metadata
   */
  async updateMetadata(updates: Partial<Metadata>): Promise<Metadata> {
    const metadata = await this.getOrCreateMetadata();
    const updatedMetadata = { ...metadata, ...updates, lastUpdated: new Date().toISOString() };
    
    await fs.writeFile(
      path.join(this.memoryDir, 'metadata.json'),
      JSON.stringify(updatedMetadata, null, 2)
    );
    
    return updatedMetadata;
  }

  /**
   * Get the directory path for a memory type
   */
  private getTypeDirectory(type: MemoryType): string {
    const typeDirs: Record<MemoryType, string> = {
      entity: 'entities',
      concept: 'concepts',
      session: 'sessions'
    };
    
    return path.join(this.memoryDir, typeDirs[type]);
  }

  /**
   * Get the file path for a memory
   */
  private getMemoryPath(id: string, type: MemoryType): string {
    return path.join(this.getTypeDirectory(type), `${id}.md`);
  }

  /**
   * Convert a memory object to markdown format
   */
  private memoryToMarkdown(memory: Memory): string {
    const frontmatter = {
      id: memory.id,
      title: memory.title,
      type: memory.type,
      tags: memory.tags,
      created: memory.created,
      updated: memory.updated,
      related: memory.related,
      importance: memory.importance
    };
    
    return `---
${Object.entries(frontmatter)
  .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
  .join('\n')}
---

# ${memory.title}

${memory.content}`;
  }

  /**
   * Parse markdown to a memory object
   */
  private markdownToMemory(markdown: string, id: string): Memory {
    // Extract frontmatter
    const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    
    if (!frontmatterMatch) {
      throw new Error(`Invalid memory format for ${id}`);
    }
    
    const [, frontmatterStr, content] = frontmatterMatch;
    
    // Parse frontmatter
    const frontmatter: Record<string, any> = {};
    frontmatterStr.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length) {
        try {
          frontmatter[key.trim()] = JSON.parse(valueParts.join(':').trim());
        } catch {
          frontmatter[key.trim()] = valueParts.join(':').trim();
        }
      }
    });
    
    return {
      id: frontmatter.id || id,
      title: frontmatter.title || '',
      type: frontmatter.type || 'concept',
      tags: frontmatter.tags || [],
      created: frontmatter.created || new Date().toISOString(),
      updated: frontmatter.updated || new Date().toISOString(),
      related: frontmatter.related || [],
      importance: frontmatter.importance || 0.5,
      content: content.trim()
    };
  }

  /**
   * Save a memory to storage
   */
  async saveMemory(memory: Memory): Promise<void> {
    const filePath = this.getMemoryPath(memory.id, memory.type);
    const markdown = this.memoryToMarkdown(memory);
    
    await fs.writeFile(filePath, markdown);
    
    // Update metadata
    const metadata = await this.getOrCreateMetadata();
    await this.updateMetadata({ 
      memoryCount: metadata.memoryCount + 1,
      indexVersion: metadata.indexVersion + 1
    });
  }

  /**
   * Get a memory by ID and type
   */
  async getMemory(id: string, type: MemoryType): Promise<Memory | null> {
    try {
      const filePath = this.getMemoryPath(id, type);
      const markdown = await fs.readFile(filePath, 'utf-8');
      return this.markdownToMemory(markdown, id);
    } catch (error) {
      return null;
    }
  }

  /**
   * Update an existing memory
   */
  async updateMemory(memory: Memory): Promise<void> {
    const filePath = this.getMemoryPath(memory.id, memory.type);
    
    try {
      // Check if file exists
      await fs.access(filePath);
      
      // Update the memory
      const markdown = this.memoryToMarkdown({
        ...memory,
        updated: new Date().toISOString()
      });
      
      await fs.writeFile(filePath, markdown);
      
      // Update metadata
      await this.updateMetadata({ 
        indexVersion: (await this.getOrCreateMetadata()).indexVersion + 1
      });
    } catch (error) {
      throw new Error(`Memory ${memory.id} not found`);
    }
  }

  /**
   * Delete a memory
   */
  async deleteMemory(id: string, type: MemoryType): Promise<void> {
    const filePath = this.getMemoryPath(id, type);
    
    try {
      await fs.unlink(filePath);
      
      // Update metadata
      const metadata = await this.getOrCreateMetadata();
      await this.updateMetadata({ 
        memoryCount: Math.max(0, metadata.memoryCount - 1),
        indexVersion: metadata.indexVersion + 1
      });
    } catch (error) {
      // Ignore if file doesn't exist
    }
  }

  /**
   * List all memories
   */
  async listMemories(): Promise<Memory[]> {
    const memories: Memory[] = [];
    
    // Process each type directory
    for (const type of ['entity', 'concept', 'session'] as MemoryType[]) {
      const typeDir = this.getTypeDirectory(type);
      
      try {
        const files = await fs.readdir(typeDir);
        
        for (const file of files) {
          if (file.endsWith('.md')) {
            const id = path.basename(file, '.md');
            const filePath = path.join(typeDir, file);
            const content = await fs.readFile(filePath, 'utf-8');
            
            try {
              const memory = this.markdownToMemory(content, id);
              memories.push(memory);
            } catch (error) {
              console.error(`Error parsing memory ${id}:`, error);
            }
          }
        }
      } catch (error) {
        console.error(`Error reading directory ${typeDir}:`, error);
      }
    }
    
    return memories;
  }
} 