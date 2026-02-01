import { StorageAdapter, ContextEntry } from '../types';
/**
 * SQLite storage adapter for Code Context Recorder
 * Provides persistent, file-based storage with full SQL query capabilities
 */
export declare class SQLiteStorageAdapter implements StorageAdapter {
    private db;
    private dbPath;
    constructor(storagePath: string);
    initialize(): Promise<void>;
    private createTables;
    private createIndexes;
    saveContext(entry: ContextEntry): Promise<string>;
    getContext(id: string): Promise<ContextEntry | null>;
    getContextsByFile(filePath: string): Promise<ContextEntry[]>;
    getContextsByCommit(commitHash: string): Promise<ContextEntry[]>;
    getContextsByDateRange(start: Date, end: Date): Promise<ContextEntry[]>;
    searchContexts(query: string): Promise<ContextEntry[]>;
    deleteContext(id: string): Promise<boolean>;
    updateContext(id: string, updates: Partial<ContextEntry>): Promise<boolean>;
    getAllContexts(): Promise<ContextEntry[]>;
    private buildContextEntry;
    close(): void;
}
//# sourceMappingURL=sqlite.d.ts.map