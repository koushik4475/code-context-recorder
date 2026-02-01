"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextCapture = void 0;
const events_1 = require("events");
const types_1 = require("../types");
const uuid_1 = require("uuid");
/**
 * ContextCapture handles the automatic and manual capture of code context
 */
class ContextCapture extends events_1.EventEmitter {
    constructor(storage, config) {
        super();
        this.activityBuffer = [];
        this.ACTIVITY_BUFFER_TIME = 5 * 60 * 1000; // 5 minutes
        this.storage = storage;
        this.config = config;
    }
    /**
     * Manually add context to a file
     */
    async addContext(content, filePath, options) {
        const entry = {
            id: (0, uuid_1.v4)(),
            timestamp: new Date(),
            type: options?.type || types_1.ContextType.TEXT,
            content,
            metadata: {
                lineNumber: options?.lineNumber,
                links: options?.links
            },
            fileAssociations: [{ filePath }],
            tags: options?.tags || [],
            source: options?.source || types_1.ContextSource.MANUAL
        };
        const id = await this.storage.saveContext(entry);
        this.emit('context:added', entry);
        return id;
    }
    /**
     * Add voice note context
     */
    async addVoiceNote(audioPath, duration, filePath, options) {
        const entry = {
            id: (0, uuid_1.v4)(),
            timestamp: new Date(),
            type: types_1.ContextType.VOICE,
            content: options?.transcript || 'Voice note',
            metadata: {
                audioPath,
                duration,
                lineNumber: options?.lineNumber
            },
            fileAssociations: [{ filePath }],
            tags: options?.tags || [],
            source: types_1.ContextSource.VSCODE_EXTENSION
        };
        const id = await this.storage.saveContext(entry);
        this.emit('context:voice-added', entry);
        return id;
    }
    /**
     * Capture browser activity and associate with current file
     */
    async captureBrowserActivity(activity, currentFile) {
        if (!this.config.includeBrowserHistory)
            return;
        this.activityBuffer.push(activity);
        // Clean old activities
        const cutoff = Date.now() - this.ACTIVITY_BUFFER_TIME;
        this.activityBuffer = this.activityBuffer.filter(a => a.timestamp.getTime() > cutoff);
        this.emit('browser:activity', activity);
    }
    /**
     * Get recent browser activities that might be relevant
     */
    getRecentBrowserActivity() {
        const cutoff = Date.now() - this.ACTIVITY_BUFFER_TIME;
        return this.activityBuffer.filter(a => a.timestamp.getTime() > cutoff);
    }
    /**
     * Capture git commit with context
     */
    async captureGitCommit(gitContext, additionalContext) {
        const recentActivities = this.getRecentBrowserActivity();
        const links = recentActivities.map(a => a.url);
        // Build content from commit message and additional context
        let content = gitContext.message;
        if (additionalContext) {
            content += `

Additional Context:
${additionalContext}`;
        }
        if (recentActivities.length > 0) {
            content += `

Recent Research:
${recentActivities.map(a => `- ${a.title}: ${a.url}`).join('\n')}`;
        }
        const entry = {
            id: (0, uuid_1.v4)(),
            timestamp: gitContext.timestamp,
            type: types_1.ContextType.COMMIT,
            content,
            metadata: {
                author: gitContext.author,
                email: gitContext.email,
                commitHash: gitContext.commitHash,
                branch: gitContext.branch,
                links: links.length > 0 ? links : undefined
            },
            fileAssociations: gitContext.filesChanged.map(f => ({ filePath: f })),
            tags: this.extractTagsFromCommit(gitContext.message),
            source: types_1.ContextSource.GIT_HOOK
        };
        const id = await this.storage.saveContext(entry);
        this.emit('context:commit', entry);
        // Clear browser activity buffer after capturing
        this.activityBuffer = [];
        return id;
    }
    /**
     * Add decision context with reasoning
     */
    async addDecision(decision, reasoning, filePaths, options) {
        let content = `Decision: ${decision}

Reasoning:
${reasoning}`;
        if (options?.alternatives && options.alternatives.length > 0) {
            content += `

Alternatives Considered:
${options.alternatives.map((a, i) => `${i + 1}. ${a}`).join('\n')}`;
        }
        const entry = {
            id: (0, uuid_1.v4)(),
            timestamp: new Date(),
            type: types_1.ContextType.DECISION,
            content,
            metadata: {
                links: options?.links
            },
            fileAssociations: filePaths.map(f => ({ filePath: f })),
            tags: options?.tags || ['decision'],
            source: types_1.ContextSource.MANUAL
        };
        const id = await this.storage.saveContext(entry);
        this.emit('context:decision', entry);
        return id;
    }
    /**
     * Link external ticket/issue to code
     */
    async linkTicket(ticketId, ticketUrl, filePath, summary) {
        const content = summary || `Linked to ticket: ${ticketId}`;
        const entry = {
            id: (0, uuid_1.v4)(),
            timestamp: new Date(),
            type: types_1.ContextType.BUG_REPORT,
            content,
            metadata: {
                relatedTickets: [ticketId],
                links: [ticketUrl]
            },
            fileAssociations: [{ filePath }],
            tags: ['ticket', ticketId],
            source: types_1.ContextSource.MANUAL
        };
        const id = await this.storage.saveContext(entry);
        this.emit('context:ticket', entry);
        return id;
    }
    /**
     * Extract tags from commit message
     */
    extractTagsFromCommit(message) {
        const tags = [];
        // Extract conventional commit type
        const conventionalMatch = message.match(/^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?:/);
        if (conventionalMatch) {
            tags.push(conventionalMatch[1]);
        }
        // Extract words in brackets or hashtags
        const bracketTags = message.match(/\[([^\]]+)\]/g);
        if (bracketTags) {
            tags.push(...bracketTags.map(t => t.slice(1, -1).toLowerCase()));
        }
        const hashTags = message.match(/#(\w+)/g);
        if (hashTags) {
            tags.push(...hashTags.map(t => t.slice(1).toLowerCase()));
        }
        return [...new Set(tags)]; // Remove duplicates
    }
    /**
     * Check if file should be excluded from capture
     */
    shouldExcludeFile(filePath) {
        return this.config.excludePatterns.some(pattern => {
            const regex = new RegExp(pattern.replace(/\*/g, '.*'));
            return regex.test(filePath);
        });
    }
    /**
     * Get capture statistics
     */
    async getStats() {
        const allContexts = await this.storage.getAllContexts();
        const byType = {};
        allContexts.forEach(ctx => {
            byType[ctx.type] = (byType[ctx.type] || 0) + 1;
        });
        const last24h = allContexts.filter(ctx => ctx.timestamp.getTime() > Date.now() - 24 * 60 * 60 * 1000);
        return {
            totalContexts: allContexts.length,
            byType,
            recentActivity: last24h.length
        };
    }
}
exports.ContextCapture = ContextCapture;
//# sourceMappingURL=ContextCapture.js.map