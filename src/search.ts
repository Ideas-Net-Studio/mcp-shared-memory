import lunr from 'lunr';
import fs from 'fs/promises';
import path from 'path';
import { Memory, SearchResult, MemoryType } from './types.js';
import { MemoryStorage } from './storage.js';

export class MemorySearch {
  private indexPath: string;
  private storage: MemoryStorage;
  private index: lunr.Index | null = null;
  private memoryMap: Map<string, Memory> = new Map();
  
  constructor(storage: MemoryStorage, indexPath?: string) {
    this.storage = storage;
    // Use the memory directory from storage for the index path
    this.indexPath = indexPath || path.join(storage['memoryDir'], 'index.json');
  }

  /**
   * Initialize the search index
   */
  async initialize(): Promise<void> {
    try {
      // Try to load existing index
      await this.loadIndex();
    } catch (error) {
      // If index doesn't exist, build a new one
      await this.rebuildIndex();
    }
  }

  /**
   * Load the search index from disk
   */
  private async loadIndex(): Promise<void> {
    try {
      const indexData = await fs.readFile(this.indexPath, 'utf-8');
      const { index, memories } = JSON.parse(indexData);
      
      this.index = lunr.Index.load(index);
      this.memoryMap = new Map(Object.entries(memories));
    } catch (error) {
      throw new Error('Failed to load search index');
    }
  }

  /**
   * Save the search index to disk
   */
  private async saveIndex(): Promise<void> {
    if (!this.index) {
      throw new Error('Index not initialized');
    }
    
    const indexData = {
      index: this.index.toJSON(),
      memories: Object.fromEntries(this.memoryMap.entries())
    };
    
    // Ensure the directory exists
    const indexDir = path.dirname(this.indexPath);
    await fs.mkdir(indexDir, { recursive: true });
    
    await fs.writeFile(this.indexPath, JSON.stringify(indexData));
  }

  /**
   * Rebuild the search index from all memories
   */
  async rebuildIndex(): Promise<void> {
    // Get all memories from storage
    const memories = await this.storage.listMemories();
    
    // Build memory map for quick lookups
    this.memoryMap = new Map();
    for (const memory of memories) {
      this.memoryMap.set(memory.id, memory);
    }
    
    // Build Lunr index
    this.index = lunr(function() {
      this.ref('id');
      this.field('title', { boost: 10 });
      this.field('content');
      this.field('tags', { boost: 5 });
      this.field('type');
      
      // Add each memory to the index
      for (const memory of memories) {
        this.add({
          id: memory.id,
          title: memory.title,
          content: memory.content,
          tags: memory.tags.join(' '),
          type: memory.type
        });
      }
    });
    
    // Save the index to disk
    await this.saveIndex();
  }

  /**
   * Add a memory to the index
   */
  async addToIndex(memory: Memory): Promise<void> {
    if (!this.index) {
      await this.initialize();
    }
    
    // Update memory map
    this.memoryMap.set(memory.id, memory);
    
    // Rebuild index (for simplicity in this POC)
    // In a production system, we would use lunr.Index.prototype.update
    await this.rebuildIndex();
  }

  /**
   * Remove a memory from the index
   */
  async removeFromIndex(id: string): Promise<void> {
    if (!this.index) {
      await this.initialize();
    }
    
    // Remove from memory map
    this.memoryMap.delete(id);
    
    // Rebuild index (for simplicity in this POC)
    await this.rebuildIndex();
  }

  /**
   * Update a memory in the index
   */
  async updateIndex(memory: Memory): Promise<void> {
    await this.addToIndex(memory);
  }

  /**
   * Extract a preview snippet from memory content
   */
  private extractPreview(content: string, query: string, maxLength: number = 150): string {
    // Simple preview extraction - in a real system, this would be more sophisticated
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    
    // Try to find the query in the content
    const index = lowerContent.indexOf(lowerQuery);
    
    if (index >= 0) {
      // Calculate start and end positions for the preview
      const start = Math.max(0, index - 50);
      const end = Math.min(content.length, index + query.length + 100);
      
      // Extract the preview
      let preview = content.substring(start, end);
      
      // Add ellipsis if needed
      if (start > 0) preview = '...' + preview;
      if (end < content.length) preview = preview + '...';
      
      return preview;
    }
    
    // If query not found, return the beginning of the content
    return content.length > maxLength 
      ? content.substring(0, maxLength) + '...'
      : content;
  }

  /**
   * Search memories
   */
  async search(
    query: string, 
    options: { 
      types?: MemoryType[], 
      tags?: string[], 
      limit?: number 
    } = {}
  ): Promise<SearchResult[]> {
    if (!this.index) {
      await this.initialize();
    }
    
    const { types, tags, limit = 10 } = options;
    
    // Build Lunr query
    let lunrQuery = query;
    
    // Add type filters if specified
    if (types && types.length > 0) {
      lunrQuery += ' ' + types.map(type => `+type:${type}`).join(' ');
    }
    
    // Add tag filters if specified
    if (tags && tags.length > 0) {
      lunrQuery += ' ' + tags.map(tag => `+tags:${tag}`).join(' ');
    }
    
    try {
      // Execute search
      const results = this.index!.search(lunrQuery);
      
      // Map results to SearchResult objects
      return results
        .slice(0, limit)
        .map(result => {
          const memory = this.memoryMap.get(result.ref);
          
          if (!memory) {
            throw new Error(`Memory ${result.ref} not found in memory map`);
          }
          
          return {
            id: memory.id,
            title: memory.title,
            type: memory.type,
            tags: memory.tags,
            score: result.score,
            preview: this.extractPreview(memory.content, query),
            created: memory.created,
            updated: memory.updated
          };
        });
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  /**
   * List memories with optional filtering
   */
  async list(
    options: { 
      types?: MemoryType[], 
      tags?: string[], 
      limit?: number 
    } = {}
  ): Promise<SearchResult[]> {
    const { types, tags, limit } = options;
    
    // Get all memories from the map
    let memories = Array.from(this.memoryMap.values());
    
    // Filter by type if specified
    if (types && types.length > 0) {
      memories = memories.filter(memory => types.includes(memory.type));
    }
    
    // Filter by tags if specified
    if (tags && tags.length > 0) {
      memories = memories.filter(memory => 
        tags.some(tag => memory.tags.includes(tag))
      );
    }
    
    // Sort by updated date (newest first)
    memories.sort((a, b) => 
      new Date(b.updated).getTime() - new Date(a.updated).getTime()
    );
    
    // Apply limit if specified
    if (limit) {
      memories = memories.slice(0, limit);
    }
    
    // Convert to SearchResult format
    return memories.map(memory => ({
      id: memory.id,
      title: memory.title,
      type: memory.type,
      tags: memory.tags,
      score: 1.0, // Default score for listing
      preview: memory.content.substring(0, 150) + (memory.content.length > 150 ? '...' : ''),
      created: memory.created,
      updated: memory.updated
    }));
  }
} 