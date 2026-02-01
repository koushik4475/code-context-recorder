import { EventEmitter } from 'events';
import { ContextType, ContextSource, StorageAdapter, CaptureConfig, BrowserActivity, GitContext } from '../types';
/**
 * ContextCapture handles the automatic and manual capture of code context
 */
export declare class ContextCapture extends EventEmitter {
    private storage;
    private config;
    private activityBuffer;
    private readonly ACTIVITY_BUFFER_TIME;
    constructor(storage: StorageAdapter, config: CaptureConfig);
    /**
     * Manually add context to a file
     */
    addContext(content: string, filePath: string, options?: {
        type?: ContextType;
        lineNumber?: number;
        tags?: string[];
        links?: string[];
        source?: ContextSource;
    }): Promise<string>;
    /**
     * Add voice note context
     */
    addVoiceNote(audioPath: string, duration: number, filePath: string, options?: {
        transcript?: string;
        lineNumber?: number;
        tags?: string[];
    }): Promise<string>;
    /**
     * Capture browser activity and associate with current file
     */
    captureBrowserActivity(activity: BrowserActivity, currentFile?: string): Promise<void>;
    /**
     * Get recent browser activities that might be relevant
     */
    getRecentBrowserActivity(): BrowserActivity[];
    /**
     * Capture git commit with context
     */
    captureGitCommit(gitContext: GitContext, additionalContext?: string): Promise<string>;
    /**
     * Add decision context with reasoning
     */
    addDecision(decision: string, reasoning: string, filePaths: string[], options?: {
        alternatives?: string[];
        tags?: string[];
        links?: string[];
    }): Promise<string>;
    /**
     * Link external ticket/issue to code
     */
    linkTicket(ticketId: string, ticketUrl: string, filePath: string, summary?: string): Promise<string>;
    /**
     * Extract tags from commit message
     */
    private extractTagsFromCommit;
    /**
     * Check if file should be excluded from capture
     */
    shouldExcludeFile(filePath: string): boolean;
    /**
     * Get capture statistics
     */
    getStats(): Promise<{
        totalContexts: number;
        byType: Record<string, number>;
        recentActivity: number;
    }>;
}
//# sourceMappingURL=ContextCapture.d.ts.map