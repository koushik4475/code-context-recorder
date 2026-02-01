import { ContextEntry, StorageAdapter, SearchOptions, Timeline } from '../types';
/**
 * ContextSearch provides powerful search capabilities across all captured context
 */
export declare class ContextSearch {
    private storage;
    private searchIndex;
    private isIndexed;
    constructor(storage: StorageAdapter);
    /**
     * Build search index from all contexts
     */
    buildIndex(): Promise<void>;
    /**
     * Search contexts with natural language query
     */
    search(query: string, options?: SearchOptions): Promise<ContextEntry[]>;
    /**
     * Get timeline for a specific file
     */
    getFileTimeline(filePath: string): Promise<Timeline>;
    /**
     * Find related contexts based on similarity
     */
    findRelated(contextId: string, limit?: number): Promise<ContextEntry[]>;
    /**
     * Search by tags
     */
    searchByTags(tags: string[]): Promise<ContextEntry[]>;
    /**
     * Get contexts for a specific commit
     */
    getCommitContext(commitHash: string): Promise<ContextEntry[]>;
    /**
     * Get recent contexts
     */
    getRecent(limit?: number): Promise<ContextEntry[]>;
    /**
     * Find contexts by author
     */
    getByAuthor(author: string): Promise<ContextEntry[]>;
    /**
     * Get contexts within date range
     */
    getByDateRange(start: Date, end: Date): Promise<ContextEntry[]>;
    /**
     * Get autocomplete suggestions for search
     */
    getSuggestions(partial: string): Promise<string[]>;
    /**
     * Update search index with new context
     */
    addToIndex(context: ContextEntry): Promise<void>;
    /**
     * Remove from search index
     */
    removeFromIndex(contextId: string): Promise<void>;
}
//# sourceMappingURL=ContextSearch.d.ts.map