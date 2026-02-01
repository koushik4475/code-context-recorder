import { EventEmitter } from 'events';
import { ProjectConfig, ContextEntry, SearchOptions, Timeline, AnalyticsData, ContextType, GitContext, BrowserActivity } from '../types';
/**
 * Main API for Code Context Recorder
 * This is the entry point for all integrations (CLI, VS Code, browser extension, etc.)
 */
export declare class CodeContextRecorder extends EventEmitter {
    private storage;
    private capture;
    private search;
    private config;
    private initialized;
    constructor(config: ProjectConfig);
    private createStorageAdapter;
    /**
     * Initialize the recorder
     */
    initialize(): Promise<void>;
    /**
     * Add context manually
     */
    addContext(content: string, filePath: string, options?: {
        type?: ContextType;
        lineNumber?: number;
        tags?: string[];
        links?: string[];
    }): Promise<string>;
    /**
     * Add voice note
     */
    addVoiceNote(audioPath: string, duration: number, filePath: string, options?: {
        transcript?: string;
        lineNumber?: number;
        tags?: string[];
    }): Promise<string>;
    /**
     * Record git commit with context
     */
    recordCommit(gitContext: GitContext, additionalContext?: string): Promise<string>;
    /**
     * Track browser activity
     */
    trackBrowserActivity(activity: BrowserActivity, currentFile?: string): Promise<void>;
    /**
     * Add decision context
     */
    addDecision(decision: string, reasoning: string, filePaths: string[], options?: {
        alternatives?: string[];
        tags?: string[];
        links?: string[];
    }): Promise<string>;
    /**
     * Link ticket/issue to code
     */
    linkTicket(ticketId: string, ticketUrl: string, filePath: string, summary?: string): Promise<string>;
    /**
     * Search contexts
     */
    search(query: string, options?: SearchOptions): Promise<ContextEntry[]>;
    /**
     * Get file timeline
     */
    getFileTimeline(filePath: string): Promise<Timeline>;
    /**
     * Get context by ID
     */
    getContext(id: string): Promise<ContextEntry | null>;
    /**
     * Get recent contexts
     */
    getRecent(limit?: number): Promise<ContextEntry[]>;
    /**
     * Delete context
     */
    deleteContext(id: string): Promise<boolean>;
    /**
     * Get analytics data
     */
    getAnalytics(): Promise<AnalyticsData>;
    /**
     * Export contexts to JSON
     */
    exportToJSON(): Promise<string>;
    /**
     * Get configuration
     */
    getConfig(): ProjectConfig;
    /**
     * Update configuration
     */
    updateConfig(updates: Partial<ProjectConfig>): void;
    private ensureInitialized;
    /**
     * Cleanup resources
     */
    close(): Promise<void>;
}
/**
 * Create a default configuration
 */
export declare function createDefaultConfig(projectPath: string): ProjectConfig;
//# sourceMappingURL=CodeContextRecorder.d.ts.map