"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeContextRecorder = void 0;
exports.createDefaultConfig = createDefaultConfig;
const events_1 = require("events");
const sqlite_1 = require("../storage/sqlite");
const ContextCapture_1 = require("../capture/ContextCapture");
const ContextSearch_1 = require("../search/ContextSearch");
const types_1 = require("../types");
const path_1 = __importDefault(require("path"));
/**
 * Main API for Code Context Recorder
 * This is the entry point for all integrations (CLI, VS Code, browser extension, etc.)
 */
class CodeContextRecorder extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.initialized = false;
        this.config = config;
        // Initialize storage adapter based on config
        this.storage = this.createStorageAdapter();
        // Initialize capture and search
        this.capture = new ContextCapture_1.ContextCapture(this.storage, config.capture);
        this.search = new ContextSearch_1.ContextSearch(this.storage);
        // Forward events from capture
        this.capture.on('context:added', (entry) => this.emit('context:added', entry));
        this.capture.on('context:commit', (entry) => this.emit('context:commit', entry));
    }
    createStorageAdapter() {
        switch (this.config.storageType) {
            case 'sqlite':
                return new sqlite_1.SQLiteStorageAdapter(this.config.storagePath);
            case 'local':
                // TODO: Implement JSON file storage for simplicity
                return new sqlite_1.SQLiteStorageAdapter(this.config.storagePath);
            case 'cloud':
                // TODO: Implement cloud storage adapter
                return new sqlite_1.SQLiteStorageAdapter(this.config.storagePath);
            default:
                return new sqlite_1.SQLiteStorageAdapter(this.config.storagePath);
        }
    }
    /**
     * Initialize the recorder
     */
    async initialize() {
        if (this.initialized)
            return;
        await this.storage.initialize();
        await this.search.buildIndex();
        this.initialized = true;
        this.emit('initialized');
    }
    /**
     * Add context manually
     */
    async addContext(content, filePath, options) {
        this.ensureInitialized();
        const id = await this.capture.addContext(content, filePath, options);
        // Update search index
        const context = await this.storage.getContext(id);
        if (context) {
            await this.search.addToIndex(context);
        }
        return id;
    }
    /**
     * Add voice note
     */
    async addVoiceNote(audioPath, duration, filePath, options) {
        this.ensureInitialized();
        return this.capture.addVoiceNote(audioPath, duration, filePath, options);
    }
    /**
     * Record git commit with context
     */
    async recordCommit(gitContext, additionalContext) {
        this.ensureInitialized();
        return this.capture.captureGitCommit(gitContext, additionalContext);
    }
    /**
     * Track browser activity
     */
    async trackBrowserActivity(activity, currentFile) {
        this.ensureInitialized();
        return this.capture.captureBrowserActivity(activity, currentFile);
    }
    /**
     * Add decision context
     */
    async addDecision(decision, reasoning, filePaths, options) {
        this.ensureInitialized();
        return this.capture.addDecision(decision, reasoning, filePaths, options);
    }
    /**
     * Link ticket/issue to code
     */
    async linkTicket(ticketId, ticketUrl, filePath, summary) {
        this.ensureInitialized();
        return this.capture.linkTicket(ticketId, ticketUrl, filePath, summary);
    }
    /**
     * Search contexts
     */
    async search(query, options) {
        this.ensureInitialized();
        return this.search.search(query, options);
    }
    /**
     * Get file timeline
     */
    async getFileTimeline(filePath) {
        this.ensureInitialized();
        return this.search.getFileTimeline(filePath);
    }
    /**
     * Get context by ID
     */
    async getContext(id) {
        this.ensureInitialized();
        return this.storage.getContext(id);
    }
    /**
     * Get recent contexts
     */
    async getRecent(limit = 10) {
        this.ensureInitialized();
        return this.search.getRecent(limit);
    }
    /**
     * Delete context
     */
    async deleteContext(id) {
        this.ensureInitialized();
        const deleted = await this.storage.deleteContext(id);
        if (deleted) {
            await this.search.removeFromIndex(id);
        }
        return deleted;
    }
    /**
     * Get analytics data
     */
    async getAnalytics() {
        this.ensureInitialized();
        const allContexts = await this.storage.getAllContexts();
        const contextsByType = {};
        const fileContextCount = new Map();
        const authorContextCount = new Map();
        allContexts.forEach(ctx => {
            // Count by type
            contextsByType[ctx.type] = (contextsByType[ctx.type] || 0) + 1;
            // Count by file
            ctx.fileAssociations.forEach(f => {
                fileContextCount.set(f.filePath, (fileContextCount.get(f.filePath) || 0) + 1);
            });
            // Count by author
            if (ctx.metadata.author) {
                authorContextCount.set(ctx.metadata.author, (authorContextCount.get(ctx.metadata.author) || 0) + 1);
            }
        });
        // Get most contexted files
        const mostContextedFiles = Array.from(fileContextCount.entries())
            .map(([file, count]) => ({ file, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        // Get top authors
        const topAuthors = Array.from(authorContextCount.entries())
            .map(([author, count]) => ({ author, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        // Calculate trend (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const trendMap = new Map();
        allContexts
            .filter(ctx => ctx.timestamp >= thirtyDaysAgo)
            .forEach(ctx => {
            const date = ctx.timestamp.toISOString().split('T')[0];
            trendMap.set(date, (trendMap.get(date) || 0) + 1);
        });
        const contextTrend = Array.from(trendMap.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
        // Calculate average contexts per commit
        const commitContexts = allContexts.filter(ctx => ctx.type === types_1.ContextType.COMMIT);
        const averageContextsPerCommit = commitContexts.length > 0
            ? allContexts.length / commitContexts.length
            : 0;
        return {
            totalContexts: allContexts.length,
            contextsByType,
            mostContextedFiles,
            contextTrend,
            averageContextsPerCommit,
            topAuthors
        };
    }
    /**
     * Export contexts to JSON
     */
    async exportToJSON() {
        this.ensureInitialized();
        const allContexts = await this.storage.getAllContexts();
        return JSON.stringify(allContexts, null, 2);
    }
    /**
     * Get configuration
     */
    getConfig() {
        return this.config;
    }
    /**
     * Update configuration
     */
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        this.emit('config:updated', this.config);
    }
    ensureInitialized() {
        if (!this.initialized) {
            throw new Error('CodeContextRecorder not initialized. Call initialize() first.');
        }
    }
    /**
     * Cleanup resources
     */
    async close() {
        if (this.storage instanceof sqlite_1.SQLiteStorageAdapter) {
            this.storage.close();
        }
        this.initialized = false;
    }
}
exports.CodeContextRecorder = CodeContextRecorder;
/**
 * Create a default configuration
 */
function createDefaultConfig(projectPath) {
    return {
        projectPath,
        storagePath: path_1.default.join(projectPath, '.ccr'),
        storageType: 'sqlite',
        capture: {
            autoCapture: true,
            captureTypes: Object.values(types_1.ContextType),
            excludePatterns: [
                '*.env',
                '*.key',
                '*.pem',
                'node_modules/**',
                '.git/**',
                'dist/**',
                'build/**'
            ],
            includeBrowserHistory: true,
            includeVoiceNotes: true,
            maxVoiceDuration: 300 // 5 minutes
        },
        integrations: {
            slack: { enabled: false },
            linear: { enabled: false },
            jira: { enabled: false },
            github: { enabled: false }
        },
        privacy: {
            excludePatterns: ['*.env', '*.key', 'secrets/**'],
            redactSensitiveData: true,
            localOnly: true
        }
    };
}
//# sourceMappingURL=CodeContextRecorder.js.map