import { EventEmitter } from 'events';
import { SQLiteStorageAdapter } from '../storage/sqlite';
import { ContextCapture } from '../capture/ContextCapture';
import { ContextSearch } from '../search/ContextSearch';
import {
  ProjectConfig,
  ContextEntry,
  StorageAdapter,
  SearchOptions,
  Timeline,
  AnalyticsData,
  ContextType,
  GitContext,
  BrowserActivity
} from '../types';
import path from 'path';

/**
 * Main API for Code Context Recorder
 * This is the entry point for all integrations (CLI, VS Code, browser extension, etc.)
 */
export class CodeContextRecorder extends EventEmitter {
  private storage: StorageAdapter;
  private capture: ContextCapture;
  private contextSearch: ContextSearch;
  private config: ProjectConfig;
  private initialized: boolean = false;

  constructor(config: ProjectConfig) {
    super();
    this.config = config;

    // Initialize storage adapter based on config
    this.storage = this.createStorageAdapter();
    
    // Initialize capture and search
    this.capture = new ContextCapture(this.storage, config.capture);
    this.contextSearch = new ContextSearch(this.storage);

    // Forward events from capture
    this.capture.on('context:added', (entry) => this.emit('context:added', entry));
    this.capture.on('context:commit', (entry) => this.emit('context:commit', entry));
  }

  private createStorageAdapter(): StorageAdapter {
    switch (this.config.storageType) {
      case 'sqlite':
        return new SQLiteStorageAdapter(this.config.storagePath);
      case 'local':
        // TODO: Implement JSON file storage for simplicity
        return new SQLiteStorageAdapter(this.config.storagePath);
      case 'cloud':
        // TODO: Implement cloud storage adapter
        return new SQLiteStorageAdapter(this.config.storagePath);
      default:
        return new SQLiteStorageAdapter(this.config.storagePath);
    }
  }

  /**
   * Initialize the recorder
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    await this.storage.initialize();
    await this.contextSearch.buildIndex();
    this.initialized = true;

    this.emit('initialized');
  }

  /**
   * Add context manually
   */
  async addContext(
    content: string,
    filePath: string,
    options?: {
      type?: ContextType;
      lineNumber?: number;
      tags?: string[];
      links?: string[];
    }
  ): Promise<string> {
    this.ensureInitialized();
    const id = await this.capture.addContext(content, filePath, options);
    
    // Update search index
    const context = await this.storage.getContext(id);
    if (context) {
      await this.contextSearch.addToIndex(context);
    }
    
    return id;
  }

  /**
   * Add voice note
   */
  async addVoiceNote(
    audioPath: string,
    duration: number,
    filePath: string,
    options?: {
      transcript?: string;
      lineNumber?: number;
      tags?: string[];
    }
  ): Promise<string> {
    this.ensureInitialized();
    return this.capture.addVoiceNote(audioPath, duration, filePath, options);
  }

  /**
   * Record git commit with context
   */
  async recordCommit(
    gitContext: GitContext,
    additionalContext?: string
  ): Promise<string> {
    this.ensureInitialized();
    return this.capture.captureGitCommit(gitContext, additionalContext);
  }

  /**
   * Track browser activity
   */
  async trackBrowserActivity(
    activity: BrowserActivity,
    currentFile?: string
  ): Promise<void> {
    this.ensureInitialized();
    return this.capture.captureBrowserActivity(activity, currentFile);
  }

  /**
   * Add decision context
   */
  async addDecision(
    decision: string,
    reasoning: string,
    filePaths: string[],
    options?: {
      alternatives?: string[];
      tags?: string[];
      links?: string[];
    }
  ): Promise<string> {
    this.ensureInitialized();
    return this.capture.addDecision(decision, reasoning, filePaths, options);
  }

  /**
   * Link ticket/issue to code
   */
  async linkTicket(
    ticketId: string,
    ticketUrl: string,
    filePath: string,
    summary?: string
  ): Promise<string> {
    this.ensureInitialized();
    return this.capture.linkTicket(ticketId, ticketUrl, filePath, summary);
  }

  /**
   * Search contexts
   */
  async search(query: string, options?: SearchOptions): Promise<ContextEntry[]> {
    this.ensureInitialized();
    return this.contextSearch.search(query, options);
  }

  /**
   * Get file timeline
   */
  async getFileTimeline(filePath: string): Promise<Timeline> {
    this.ensureInitialized();
    return this.contextSearch.getFileTimeline(filePath);
  }

  /**
   * Get context by ID
   */
  async getContext(id: string): Promise<ContextEntry | null> {
    this.ensureInitialized();
    return this.storage.getContext(id);
  }

  /**
   * Get recent contexts
   */
  async getRecent(limit: number = 10): Promise<ContextEntry[]> {
    this.ensureInitialized();
    return this.contextSearch.getRecent(limit);
  }

  /**
   * Delete context
   */
  async deleteContext(id: string): Promise<boolean> {
    this.ensureInitialized();
    const deleted = await this.storage.deleteContext(id);
    if (deleted) {
      await this.contextSearch.removeFromIndex(id);
    }
    return deleted;
  }

  /**
   * Get analytics data
   */
  async getAnalytics(): Promise<AnalyticsData> {
    this.ensureInitialized();
    
    const allContexts = await this.storage.getAllContexts();
    
    const contextsByType: Record<ContextType, number> = {} as any;
    const fileContextCount: Map<string, number> = new Map();
    const authorContextCount: Map<string, number> = new Map();

    allContexts.forEach(ctx => {
      // Count by type
      contextsByType[ctx.type] = (contextsByType[ctx.type] || 0) + 1;

      // Count by file
      ctx.fileAssociations.forEach(f => {
        fileContextCount.set(f.filePath, (fileContextCount.get(f.filePath) || 0) + 1);
      });

      // Count by author
      if (ctx.metadata.author) {
        authorContextCount.set(
          ctx.metadata.author,
          (authorContextCount.get(ctx.metadata.author) || 0) + 1
        );
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
    
    const trendMap = new Map<string, number>();
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
    const commitContexts = allContexts.filter(ctx => ctx.type === ContextType.COMMIT);
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
  async exportToJSON(): Promise<string> {
    this.ensureInitialized();
    const allContexts = await this.storage.getAllContexts();
    return JSON.stringify(allContexts, null, 2);
  }

  /**
   * Get configuration
   */
  getConfig(): ProjectConfig {
    return this.config;
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<ProjectConfig>): void {
    this.config = { ...this.config, ...updates };
    this.emit('config:updated', this.config);
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('CodeContextRecorder not initialized. Call initialize() first.');
    }
  }

  /**
   * Cleanup resources
   */
  async close(): Promise<void> {
    if (this.storage instanceof SQLiteStorageAdapter) {
      this.storage.close();
    }
    this.initialized = false;
  }
}

/**
 * Create a default configuration
 */
export function createDefaultConfig(projectPath: string): ProjectConfig {
  return {
    projectPath,
    storagePath: path.join(projectPath, '.ccr'),
    storageType: 'sqlite',
    capture: {
      autoCapture: true,
      captureTypes: Object.values(ContextType),
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
