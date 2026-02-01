import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import {
  StorageAdapter,
  ContextEntry,
  ContextType,
  ContextSource,
  FileAssociation,
  ContextMetadata
} from '../types';

/**
 * SQLite storage adapter for Code Context Recorder
 * Provides persistent, file-based storage with full SQL query capabilities
 */
export class SQLiteStorageAdapter implements StorageAdapter {
  private db: Database.Database | null = null;
  private dbPath: string;

  constructor(storagePath: string) {
    this.dbPath = path.join(storagePath, 'contexts.db');
  }

  async initialize(): Promise<void> {
    // Ensure directory exists
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(this.dbPath);
    
    // Enable WAL mode for better concurrent access
    this.db.pragma('journal_mode = WAL');
    
    this.createTables();
    this.createIndexes();
  }

  private createTables(): void {
    if (!this.db) throw new Error('Database not initialized');

    // Main contexts table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS contexts (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        source TEXT NOT NULL,
        author TEXT,
        email TEXT,
        commit_hash TEXT,
        branch TEXT,
        duration INTEGER,
        audio_path TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      )
    `);

    // File associations table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS file_associations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        context_id TEXT NOT NULL,
        file_path TEXT NOT NULL,
        line_start INTEGER,
        line_end INTEGER,
        file_hash TEXT,
        FOREIGN KEY (context_id) REFERENCES contexts(id) ON DELETE CASCADE
      )
    `);

    // Tags table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        context_id TEXT NOT NULL,
        tag TEXT NOT NULL,
        FOREIGN KEY (context_id) REFERENCES contexts(id) ON DELETE CASCADE
      )
    `);

    // Links table (for storing URLs referenced)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        context_id TEXT NOT NULL,
        url TEXT NOT NULL,
        title TEXT,
        FOREIGN KEY (context_id) REFERENCES contexts(id) ON DELETE CASCADE
      )
    `);

    // Related items table (tickets, PRs, slack threads)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS related_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        context_id TEXT NOT NULL,
        item_type TEXT NOT NULL,
        item_id TEXT NOT NULL,
        FOREIGN KEY (context_id) REFERENCES contexts(id) ON DELETE CASCADE
      )
    `);
  }

  private createIndexes(): void {
    if (!this.db) throw new Error('Database not initialized');

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_contexts_timestamp ON contexts(timestamp);
      CREATE INDEX IF NOT EXISTS idx_contexts_type ON contexts(type);
      CREATE INDEX IF NOT EXISTS idx_contexts_commit ON contexts(commit_hash);
      CREATE INDEX IF NOT EXISTS idx_contexts_author ON contexts(author);
      CREATE INDEX IF NOT EXISTS idx_file_associations_path ON file_associations(file_path);
      CREATE INDEX IF NOT EXISTS idx_file_associations_context ON file_associations(context_id);
      CREATE INDEX IF NOT EXISTS idx_tags_tag ON tags(tag);
      CREATE INDEX IF NOT EXISTS idx_tags_context ON tags(context_id);
    `);
  }

  async saveContext(entry: ContextEntry): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = entry.id || uuidv4();
    
    const insertContext = this.db.prepare(`
      INSERT INTO contexts (
        id, timestamp, type, content, source, author, email,
        commit_hash, branch, duration, audio_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertContext.run(
      id,
      entry.timestamp.getTime(),
      entry.type,
      entry.content,
      entry.source,
      entry.metadata.author || null,
      entry.metadata.email || null,
      entry.metadata.commitHash || null,
      entry.metadata.branch || null,
      entry.metadata.duration || null,
      entry.metadata.audioPath || null
    );

    // Insert file associations
    if (entry.fileAssociations && entry.fileAssociations.length > 0) {
      const insertFile = this.db.prepare(`
        INSERT INTO file_associations (context_id, file_path, line_start, line_end, file_hash)
        VALUES (?, ?, ?, ?, ?)
      `);

      for (const file of entry.fileAssociations) {
        insertFile.run(
          id,
          file.filePath,
          file.lineStart || null,
          file.lineEnd || null,
          file.hash || null
        );
      }
    }

    // Insert tags
    if (entry.tags && entry.tags.length > 0) {
      const insertTag = this.db.prepare(`
        INSERT INTO tags (context_id, tag) VALUES (?, ?)
      `);

      for (const tag of entry.tags) {
        insertTag.run(id, tag);
      }
    }

    // Insert links
    if (entry.metadata.links && entry.metadata.links.length > 0) {
      const insertLink = this.db.prepare(`
        INSERT INTO links (context_id, url) VALUES (?, ?)
      `);

      for (const link of entry.metadata.links) {
        insertLink.run(id, link);
      }
    }

    return id;
  }

  async getContext(id: string): Promise<ContextEntry | null> {
    if (!this.db) throw new Error('Database not initialized');

    const context = this.db.prepare(`
      SELECT * FROM contexts WHERE id = ?
    `).get(id) as any;

    if (!context) return null;

    return this.buildContextEntry(context);
  }

  async getContextsByFile(filePath: string): Promise<ContextEntry[]> {
    if (!this.db) throw new Error('Database not initialized');

    const contexts = this.db.prepare(`
      SELECT DISTINCT c.* FROM contexts c
      JOIN file_associations fa ON c.id = fa.context_id
      WHERE fa.file_path = ?
      ORDER BY c.timestamp DESC
    `).all(filePath) as any[];

    return Promise.all(contexts.map(c => this.buildContextEntry(c)));
  }

  async getContextsByCommit(commitHash: string): Promise<ContextEntry[]> {
    if (!this.db) throw new Error('Database not initialized');

    const contexts = this.db.prepare(`
      SELECT * FROM contexts WHERE commit_hash = ?
      ORDER BY timestamp DESC
    `).all(commitHash) as any[];

    return Promise.all(contexts.map(c => this.buildContextEntry(c)));
  }

  async getContextsByDateRange(start: Date, end: Date): Promise<ContextEntry[]> {
    if (!this.db) throw new Error('Database not initialized');

    const contexts = this.db.prepare(`
      SELECT * FROM contexts 
      WHERE timestamp BETWEEN ? AND ?
      ORDER BY timestamp DESC
    `).all(start.getTime(), end.getTime()) as any[];

    return Promise.all(contexts.map(c => this.buildContextEntry(c)));
  }

  async searchContexts(query: string): Promise<ContextEntry[]> {
    if (!this.db) throw new Error('Database not initialized');

    // Simple full-text search (can be enhanced with FTS5)
    const contexts = this.db.prepare(`
      SELECT * FROM contexts 
      WHERE content LIKE ?
      ORDER BY timestamp DESC
      LIMIT 100
    `).all(`%${query}%`) as any[];

    return Promise.all(contexts.map(c => this.buildContextEntry(c)));
  }

  async deleteContext(id: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.prepare(`
      DELETE FROM contexts WHERE id = ?
    `).run(id);

    return result.changes > 0;
  }

  async updateContext(id: string, updates: Partial<ContextEntry>): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.prepare(`
      UPDATE contexts 
      SET content = COALESCE(?, content),
          updated_at = unixepoch()
      WHERE id = ?
    `).run(updates.content, id);

    return result.changes > 0;
  }

  async getAllContexts(): Promise<ContextEntry[]> {
    if (!this.db) throw new Error('Database not initialized');

    const contexts = this.db.prepare(`
      SELECT * FROM contexts ORDER BY timestamp DESC
    `).all() as any[];

    return Promise.all(contexts.map(c => this.buildContextEntry(c)));
  }

  private async buildContextEntry(row: any): Promise<ContextEntry> {
    if (!this.db) throw new Error('Database not initialized');

    // Get file associations
    const files = this.db.prepare(`
      SELECT * FROM file_associations WHERE context_id = ?
    `).all(row.id) as any[];

    // Get tags
    const tags = this.db.prepare(`
      SELECT tag FROM tags WHERE context_id = ?
    `).all(row.id).map((t: any) => t.tag);

    // Get links
    const links = this.db.prepare(`
      SELECT url FROM links WHERE context_id = ?
    `).all(row.id).map((l: any) => l.url);

    const metadata: ContextMetadata = {
      author: row.author,
      email: row.email,
      commitHash: row.commit_hash,
      branch: row.branch,
      duration: row.duration,
      audioPath: row.audio_path,
      links: links
    };

    const fileAssociations: FileAssociation[] = files.map((f: any) => ({
      filePath: f.file_path,
      lineStart: f.line_start,
      lineEnd: f.line_end,
      hash: f.file_hash
    }));

    return {
      id: row.id,
      timestamp: new Date(row.timestamp),
      type: row.type as ContextType,
      content: row.content,
      metadata,
      fileAssociations,
      tags,
      source: row.source as ContextSource
    };
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
