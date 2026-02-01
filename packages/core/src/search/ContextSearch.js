"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextSearch = void 0;
const minisearch_1 = __importDefault(require("minisearch"));
/**
 * ContextSearch provides powerful search capabilities across all captured context
 */
class ContextSearch {
    constructor(storage) {
        this.isIndexed = false;
        this.storage = storage;
        this.searchIndex = new minisearch_1.default({
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
    async buildIndex() {
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
    async search(query, options) {
        if (!this.isIndexed) {
            await this.buildIndex();
        }
        let results = this.searchIndex.search(query, {
            limit: options?.limit || 50
        });
        // Get full context entries
        const contextIds = results.map(r => r.id);
        const contexts = [];
        for (const id of contextIds) {
            const ctx = await this.storage.getContext(id);
            if (ctx)
                contexts.push(ctx);
        }
        // Apply additional filters
        let filtered = contexts;
        if (options?.filePattern) {
            const pattern = new RegExp(options.filePattern);
            filtered = filtered.filter(ctx => ctx.fileAssociations.some(f => pattern.test(f.filePath)));
        }
        if (options?.types && options.types.length > 0) {
            filtered = filtered.filter(ctx => options.types.includes(ctx.type));
        }
        if (options?.tags && options.tags.length > 0) {
            filtered = filtered.filter(ctx => options.tags.some(tag => ctx.tags.includes(tag)));
        }
        if (options?.author) {
            filtered = filtered.filter(ctx => ctx.metadata.author === options.author);
        }
        if (options?.dateRange) {
            filtered = filtered.filter(ctx => ctx.timestamp >= options.dateRange.start &&
                ctx.timestamp <= options.dateRange.end);
        }
        return filtered;
    }
    /**
     * Get timeline for a specific file
     */
    async getFileTimeline(filePath) {
        const contexts = await this.storage.getContextsByFile(filePath);
        const entries = contexts.map(ctx => ({
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
    async findRelated(contextId, limit = 5) {
        const context = await this.storage.getContext(contextId);
        if (!context)
            return [];
        // Search using the content of this context
        const results = await this.search(context.content, { limit: limit + 1 });
        // Filter out the original context
        return results.filter(ctx => ctx.id !== contextId).slice(0, limit);
    }
    /**
     * Search by tags
     */
    async searchByTags(tags) {
        return this.search(tags.join(' '), { tags });
    }
    /**
     * Get contexts for a specific commit
     */
    async getCommitContext(commitHash) {
        return this.storage.getContextsByCommit(commitHash);
    }
    /**
     * Get recent contexts
     */
    async getRecent(limit = 10) {
        const allContexts = await this.storage.getAllContexts();
        return allContexts
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }
    /**
     * Find contexts by author
     */
    async getByAuthor(author) {
        const allContexts = await this.storage.getAllContexts();
        return allContexts.filter(ctx => ctx.metadata.author === author);
    }
    /**
     * Get contexts within date range
     */
    async getByDateRange(start, end) {
        return this.storage.getContextsByDateRange(start, end);
    }
    /**
     * Get autocomplete suggestions for search
     */
    async getSuggestions(partial) {
        if (!this.isIndexed) {
            await this.buildIndex();
        }
        const results = this.searchIndex.autoSuggest(partial, {
            limit: 10
        });
        return results.map(r => r.suggestion);
    }
    /**
     * Update search index with new context
     */
    async addToIndex(context) {
        if (!this.isIndexed)
            return;
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
    async removeFromIndex(contextId) {
        if (!this.isIndexed)
            return;
        this.searchIndex.remove({ id: contextId });
    }
}
exports.ContextSearch = ContextSearch;
//# sourceMappingURL=ContextSearch.js.map