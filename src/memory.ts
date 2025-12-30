import { v4 as uuidv4 } from 'uuid';
import { 
  Memory, 
  CreateMemoryInput, 
  UpdateMemoryInput, 
  SearchResult, 
  MemoryType,
  BuildMemoryStoreInput
} from './types.js';
import { MemoryStorage } from './storage.js';
import { MemorySearch } from './search.js';
import fs from 'fs/promises';
import path from 'path';

export class MemoryService {
  private storage: MemoryStorage;
  private search: MemorySearch;
  
  constructor(memoryDir: string = './memory') {
    this.storage = new MemoryStorage(memoryDir);
    this.search = new MemorySearch(this.storage);
  }

  /**
   * Initialize the memory service
   */
  async initialize(): Promise<void> {
    await this.storage.initialize();
    await this.search.initialize();
  }

  /**
   * Build a new memory store in the specified directory
   */
  async buildMemoryStore(input: BuildMemoryStoreInput): Promise<void> {
    const { directory, overwrite = false } = input;
    
    try {
      // Check if directory exists
      try {
        await fs.access(directory);
        
        // If overwrite is false and directory exists, throw an error
        if (!overwrite) {
          throw new Error(`Directory ${directory} already exists. Use overwrite: true to force creation.`);
        }
      } catch (error) {
        // Directory doesn't exist, which is fine
      }
      
      // Create the directory structure
      await fs.mkdir(directory, { recursive: true });
      await fs.mkdir(path.join(directory, 'entities'), { recursive: true });
      await fs.mkdir(path.join(directory, 'concepts'), { recursive: true });
      await fs.mkdir(path.join(directory, 'sessions'), { recursive: true });
      
      // Create initial metadata
      const metadata = {
        lastUpdated: new Date().toISOString(),
        memoryCount: 0,
        indexVersion: 1
      };
      
      await fs.writeFile(
        path.join(directory, 'metadata.json'),
        JSON.stringify(metadata, null, 2)
      );
      
      // Create an empty index file
      const emptyIndex = {
        index: {},
        memories: {}
      };
      
      await fs.writeFile(
        path.join(directory, 'index.json'),
        JSON.stringify(emptyIndex, null, 2)
      );
      
      // Create a README file with instructions
      const readme = `# Memory Store

This directory contains memories created by Claude using the MCP Memory Server.

## Directory Structure

- /entities: Information about specific people, organizations, or objects
- /concepts: Information about abstract ideas, processes, or knowledge
- /sessions: Information about specific conversations or meetings
- index.json: Search index for efficient memory retrieval
- metadata.json: Metadata about the memory store

## File Format

Each memory is stored as a markdown file with frontmatter metadata:

\`\`\`markdown
---
id: "unique-id"
title: "Memory Title"
type: "entity|concept|session"
tags: ["tag1", "tag2"]
created: "2023-06-15T14:30:00Z"
updated: "2023-06-15T14:30:00Z"
related: ["other-memory-id1", "other-memory-id2"]
importance: 0.8
---

# Memory Title

Content of the memory...
\`\`\`

Created on: ${new Date().toISOString()}
`;
      
      await fs.writeFile(
        path.join(directory, 'README.md'),
        readme
      );
      
    } catch (error) {
      throw new Error(`Failed to build memory store: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Create a new memory
   */
  async createMemory(input: CreateMemoryInput): Promise<Memory> {
    const now = new Date().toISOString();
    
    const memory: Memory = {
      id: uuidv4(),
      title: input.title,
      type: input.type,
      tags: input.tags || [],
      created: now,
      updated: now,
      related: input.related || [],
      importance: input.importance || 0.5,
      content: input.content
    };
    
    await this.storage.saveMemory(memory);
    await this.search.addToIndex(memory);
    
    return memory;
  }

  /**
   * Get a memory by ID and type
   */
  async getMemory(id: string, type: MemoryType): Promise<Memory | null> {
    return this.storage.getMemory(id, type);
  }

  /**
   * Update an existing memory
   */
  async updateMemory(input: UpdateMemoryInput): Promise<Memory> {
    // Get the existing memory
    const existingMemory = await this.findMemoryById(input.id);
    
    if (!existingMemory) {
      throw new Error(`Memory ${input.id} not found`);
    }
    
    // Update the memory with new values
    const updatedMemory: Memory = {
      ...existingMemory,
      title: input.title || existingMemory.title,
      tags: input.tags || existingMemory.tags,
      related: input.related || existingMemory.related,
      importance: input.importance || existingMemory.importance,
      content: input.content || existingMemory.content,
      updated: new Date().toISOString()
    };
    
    await this.storage.updateMemory(updatedMemory);
    await this.search.updateIndex(updatedMemory);
    
    return updatedMemory;
  }

  /**
   * Delete a memory
   */
  async deleteMemory(id: string): Promise<void> {
    const memory = await this.findMemoryById(id);
    
    if (memory) {
      await this.storage.deleteMemory(id, memory.type);
      await this.search.removeFromIndex(id);
    }
  }

  /**
   * Search memories
   */
  async searchMemories(
    query: string,
    options: {
      types?: MemoryType[],
      tags?: string[],
      limit?: number
    } = {}
  ): Promise<SearchResult[]> {
    return this.search.search(query, options);
  }

  /**
   * List memories with optional filtering
   */
  async listMemories(
    options: {
      types?: MemoryType[],
      tags?: string[],
      limit?: number
    } = {}
  ): Promise<SearchResult[]> {
    return this.search.list(options);
  }

  /**
   * Add tags to a memory
   */
  async addTags(id: string, tags: string[]): Promise<Memory> {
    const memory = await this.findMemoryById(id);
    
    if (!memory) {
      throw new Error(`Memory ${id} not found`);
    }
    
    // Add new tags (avoiding duplicates)
    const updatedTags = [...new Set([...memory.tags, ...tags])];
    
    // Update the memory
    return this.updateMemory({
      id,
      tags: updatedTags
    });
  }

  /**
   * Remove tags from a memory
   */
  async removeTags(id: string, tags: string[]): Promise<Memory> {
    const memory = await this.findMemoryById(id);
    
    if (!memory) {
      throw new Error(`Memory ${id} not found`);
    }
    
    // Remove specified tags
    const updatedTags = memory.tags.filter(tag => !tags.includes(tag));
    
    // Update the memory
    return this.updateMemory({
      id,
      tags: updatedTags
    });
  }

  /**
   * Create relationships between memories
   */
  async relateMemories(sourceId: string, targetIds: string[]): Promise<Memory> {
    const memory = await this.findMemoryById(sourceId);
    
    if (!memory) {
      throw new Error(`Memory ${sourceId} not found`);
    }
    
    // Add new relations (avoiding duplicates)
    const updatedRelations = [...new Set([...memory.related, ...targetIds])];
    
    // Update the memory
    return this.updateMemory({
      id: sourceId,
      related: updatedRelations
    });
  }

  /**
   * Remove relationships between memories
   */
  async unrelateMemories(sourceId: string, targetIds: string[]): Promise<Memory> {
    const memory = await this.findMemoryById(sourceId);
    
    if (!memory) {
      throw new Error(`Memory ${sourceId} not found`);
    }
    
    // Remove specified relations
    const updatedRelations = memory.related.filter(id => !targetIds.includes(id));
    
    // Update the memory
    return this.updateMemory({
      id: sourceId,
      related: updatedRelations
    });
  }

  /**
   * Rebuild the search index
   */
  async rebuildIndex(): Promise<void> {
    await this.search.rebuildIndex();
  }

  /**
   * Find a memory by ID (searching all types)
   */
  private async findMemoryById(id: string): Promise<Memory | null> {
    // Try each memory type
    for (const type of ['entity', 'concept', 'session'] as MemoryType[]) {
      const memory = await this.storage.getMemory(id, type);
      if (memory) {
        return memory;
      }
    }
    
    return null;
  }
} 