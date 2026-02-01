import MiniSearch from 'minisearch';
import {
  ContextEntry,
  StorageAdapter,
  SearchOptions,
  Timeline,
  TimelineEntry
} from '../types';

/**
 * ContextSearch provides powerful search capabilities across all captured context
 */
export class ContextSearch {
  private storage: StorageAdapter;
  private searchIndex: MiniSearch;
  private isIndexed: boolean = false;

  constructor(storage: StorageAdapter) {
    this.storage = storage;
    
    this.searchIndex = new MiniSearch({
      fields: ['content', 'tags', 'filePath', 'author'],
      storeFields: ['id', 'type', 'timestamp', 'content', 'tags'],
      searchOptions: {
        boost: { content: 2, tags: 3 },
        fuzzy: 0.2,
        prefix: true
      }
    });
  }

  /**
   * Build search index from all contexts
   */
  async buildIndex(): Promise<void> {
    const contexts = await this.storage.getAllContexts();
    
    const documents = contexts.map(ctx => ({
      id: ctx.id,
      content: ctx.content,
      tags: ctx.tags.join(' '),
      filePath: ctx.fileAssociations.map(f => f.filePath).join(' '),
      author: ctx.metadata.author || '',
      type: ctx.type,
      timestamp: ctx.timestamp.toISOString()
    }));

    this.searchIndex.addAll(documents);
    this.isIndexed = true;
  }

  /**
   * Search contexts with natural language query
   */
  async search(query: string, options?: SearchOptions): Promise<ContextEntry[]> {
    if (!this.isIndexed) {
      await this.buildIndex();
    }

    let results = this.searchIndex.search(query, { limit: options?.limit || 50 } as Record<string, unknown>);

    // Get full context entries
    const contextIds = results.map(r => r.id);
    const contexts: ContextEntry[] = [];

    for (const id of contextIds) {
      const ctx = await this.storage.getContext(id);
      if (ctx) contexts.push(ctx);
    }

    // Apply additional filters
    let filtered = contexts;

    if (options?.filePattern) {
      const pattern = new RegExp(options.filePattern);
      filtered = filtered.filter(ctx =>
        ctx.fileAssociations.some(f => pattern.test(f.filePath))
      );
    }

    if (options?.types && options.types.length > 0) {
      filtered = filtered.filter(ctx => options.types!.includes(ctx.type));
    }

    if (options?.tags && options.tags.length > 0) {
      filtered = filtered.filter(ctx =>
        options.tags!.some(tag => ctx.tags.includes(tag))
      );
    }

    if (options?.author) {
      filtered = filtered.filter(ctx => ctx.metadata.author === options.author);
    }

    if (options?.dateRange) {
      filtered = filtered.filter(ctx =>
        ctx.timestamp >= options.dateRange!.start &&
        ctx.timestamp <= options.dateRange!.end
      );
    }

    return filtered;
  }

  /**
   * Get timeline for a specific file
   */
  async getFileTimeline(filePath: string): Promise<Timeline> {
    const contexts = await this.storage.getContextsByFile(filePath);
    
    const entries: TimelineEntry[] = contexts.map(ctx => ({
      ...ctx,
      relatedEntries: [] // Can be enhanced to find related contexts
    }));

    return {
      filePath,
      entries,
      totalEntries: entries.length
    };
  }

  /**
   * Find related contexts based on similarity
   */
  async findRelated(contextId: string, limit: number = 5): Promise<ContextEntry[]> {
    const context = await this.storage.getContext(contextId);
    if (!context) return [];

    // Search using the content of this context
    const results = await this.search(context.content, { limit: limit + 1 });
    
    // Filter out the original context
    return results.filter(ctx => ctx.id !== contextId).slice(0, limit);
  }

  /**
   * Search by tags
   */
  async searchByTags(tags: string[]): Promise<ContextEntry[]> {
    return this.search(tags.join(' '), { tags });
  }

  /**
   * Get contexts for a specific commit
   */
  async getCommitContext(commitHash: string): Promise<ContextEntry[]> {
    return this.storage.getContextsByCommit(commitHash);
  }

  /**
   * Get recent contexts
   */
  async getRecent(limit: number = 10): Promise<ContextEntry[]> {
    const allContexts = await this.storage.getAllContexts();
    return allContexts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Find contexts by author
   */
  async getByAuthor(author: string): Promise<ContextEntry[]> {
    const allContexts = await this.storage.getAllContexts();
    return allContexts.filter(ctx => ctx.metadata.author === author);
  }

  /**
   * Get contexts within date range
   */
  async getByDateRange(start: Date, end: Date): Promise<ContextEntry[]> {
    return this.storage.getContextsByDateRange(start, end);
  }

  /**
   * Get autocomplete suggestions for search
   */
  async getSuggestions(partial: string): Promise<string[]> {
    if (!this.isIndexed) {
      await this.buildIndex();
    }

    const results = this.searchIndex.autoSuggest(partial, { limit: 10 } as Record<string, unknown>);

    return results.map(r => r.suggestion);
  }

  /**
   * Update search index with new context
   */
  async addToIndex(context: ContextEntry): Promise<void> {
    if (!this.isIndexed) return;

    this.searchIndex.add({
      id: context.id,
      content: context.content,
      tags: context.tags.join(' '),
      filePath: context.fileAssociations.map(f => f.filePath).join(' '),
      author: context.metadata.author || '',
      type: context.type,
      timestamp: context.timestamp.toISOString()
    });
  }

  /**
   * Remove from search index
   */
  async removeFromIndex(contextId: string): Promise<void> {
    if (!this.isIndexed) return;
    this.searchIndex.remove({ id: contextId });
  }
}
