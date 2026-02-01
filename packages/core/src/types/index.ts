/**
 * Core type definitions for Code Context Recorder
 */

export interface ContextEntry {
  id: string;
  timestamp: Date;
  type: ContextType;
  content: string;
  metadata: ContextMetadata;
  fileAssociations: FileAssociation[];
  tags: string[];
  source: ContextSource;
}

export enum ContextType {
  TEXT = 'text',
  VOICE = 'voice',
  LINK = 'link',
  CODE_SNIPPET = 'code_snippet',
  COMMIT = 'commit',
  MEETING_NOTE = 'meeting_note',
  DECISION = 'decision',
  BUG_REPORT = 'bug_report',
  RESEARCH = 'research'
}

export enum ContextSource {
  MANUAL = 'manual',
  GIT_HOOK = 'git_hook',
  BROWSER_EXTENSION = 'browser_extension',
  VSCODE_EXTENSION = 'vscode_extension',
  CLI = 'cli',
  API = 'api'
}

export interface ContextMetadata {
  author?: string;
  email?: string;
  commitHash?: string;
  branch?: string;
  links?: string[];
  duration?: number; // for voice notes in seconds
  audioPath?: string; // for voice notes
  lineNumber?: number;
  columnNumber?: number;
  relatedTickets?: string[];
  relatedPRs?: string[];
  relatedSlackThreads?: string[];
}

export interface FileAssociation {
  filePath: string;
  lineStart?: number;
  lineEnd?: number;
  hash?: string; // file content hash for version tracking
}

export interface StorageAdapter {
  initialize(): Promise<void>;
  saveContext(entry: ContextEntry): Promise<string>;
  getContext(id: string): Promise<ContextEntry | null>;
  getContextsByFile(filePath: string): Promise<ContextEntry[]>;
  getContextsByCommit(commitHash: string): Promise<ContextEntry[]>;
  getContextsByDateRange(start: Date, end: Date): Promise<ContextEntry[]>;
  searchContexts(query: string): Promise<ContextEntry[]>;
  deleteContext(id: string): Promise<boolean>;
  updateContext(id: string, updates: Partial<ContextEntry>): Promise<boolean>;
  getAllContexts(): Promise<ContextEntry[]>;
}

export interface CaptureConfig {
  autoCapture: boolean;
  captureTypes: ContextType[];
  excludePatterns: string[];
  includeBrowserHistory: boolean;
  includeVoiceNotes: boolean;
  maxVoiceDuration: number; // in seconds
}

export interface ProjectConfig {
  projectPath: string;
  storagePath: string;
  storageType: 'sqlite' | 'local' | 'cloud';
  capture: CaptureConfig;
  integrations: IntegrationConfig;
  privacy: PrivacyConfig;
}

export interface IntegrationConfig {
  slack?: {
    enabled: boolean;
    webhook?: string;
    token?: string;
  };
  linear?: {
    enabled: boolean;
    apiKey?: string;
    teamId?: string;
  };
  jira?: {
    enabled: boolean;
    url?: string;
    email?: string;
    apiToken?: string;
  };
  github?: {
    enabled: boolean;
    token?: string;
  };
}

export interface PrivacyConfig {
  excludePatterns: string[];
  redactSensitiveData: boolean;
  localOnly: boolean;
}

export interface SearchOptions {
  filePattern?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  types?: ContextType[];
  tags?: string[];
  author?: string;
  limit?: number;
  offset?: number;
}

export interface Timeline {
  filePath: string;
  entries: TimelineEntry[];
  totalEntries: number;
}

export interface TimelineEntry extends ContextEntry {
  relatedEntries?: string[]; // IDs of related context entries
  codeSnapshot?: string; // code state at this point
}

export interface VoiceNote {
  id: string;
  contextId: string;
  audioPath: string;
  duration: number;
  transcript?: string;
  createdAt: Date;
}

export interface BrowserActivity {
  url: string;
  title: string;
  timestamp: Date;
  domain: string;
  category: ActivityCategory;
}

export enum ActivityCategory {
  DOCUMENTATION = 'documentation',
  STACKOVERFLOW = 'stackoverflow',
  GITHUB = 'github',
  BLOG = 'blog',
  VIDEO = 'video',
  OTHER = 'other'
}

export interface GitContext {
  commitHash: string;
  branch: string;
  author: string;
  email: string;
  message: string;
  timestamp: Date;
  filesChanged: string[];
  diff?: string;
}

export interface AnalyticsData {
  totalContexts: number;
  contextsByType: Record<ContextType, number>;
  mostContextedFiles: Array<{ file: string; count: number }>;
  contextTrend: Array<{ date: string; count: number }>;
  averageContextsPerCommit: number;
  topAuthors: Array<{ author: string; count: number }>;
}
