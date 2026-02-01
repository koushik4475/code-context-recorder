# Architecture

This document describes the technical architecture of Code Context Recorder.

## Overview

Code Context Recorder is a monorepo containing multiple interconnected packages that work together to capture, store, and retrieve code context.

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interfaces                          │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│ VS Code Ext │   CLI Tool  │   Browser   │   Web Viewer     │
│             │             │  Extension  │                  │
└──────┬──────┴──────┬──────┴──────┬──────┴────────┬─────────┘
       │             │             │               │
       └─────────────┴─────────────┴───────────────┘
                         │
                    ┌────▼────┐
                    │  Core   │  ◄── Main API
                    │ Package │
                    └────┬────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
     ┌────▼────┐    ┌────▼────┐   ┌────▼────┐
     │ Capture │    │ Storage │   │ Search  │
     └─────────┘    └─────────┘   └─────────┘
```

## Core Package

The `@ccr/core` package is the heart of the system. It provides:

### 1. Storage Layer

**Responsibility:** Persist and retrieve context entries

**Implementation:**
- Primary: SQLite database (better-sqlite3)
- Alternative: JSON file storage (for simplicity)
- Future: Cloud storage adapter

**Schema:**
```sql
contexts
  - id (PRIMARY KEY)
  - timestamp
  - type
  - content
  - source
  - metadata (JSON)

file_associations
  - context_id (FOREIGN KEY)
  - file_path
  - line_start
  - line_end
  - file_hash

tags
  - context_id (FOREIGN KEY)
  - tag

links
  - context_id (FOREIGN KEY)
  - url
  - title
```

**Design Decisions:**
- SQLite for zero-configuration, embedded database
- WAL mode for better concurrent access
- Separate tables for normalized data
- Indexes on frequently queried columns

### 2. Capture Layer

**Responsibility:** Capture context from various sources

**Components:**

**ContextCapture:**
- Handles manual context addition
- Processes git commits
- Buffers browser activity
- Links to external tickets

**Activity Buffer:**
- 5-minute sliding window
- Captures browser activity during coding
- Associated with commits automatically

**Design Decisions:**
- Event-driven architecture (EventEmitter)
- Buffer to correlate browser activity with code
- Automatic tag extraction from commits

### 3. Search Layer

**Responsibility:** Find context using queries

**Implementation:**
- MiniSearch for client-side full-text search
- Supports fuzzy matching and prefix search
- Ranking based on relevance
- Filtering by type, date, file, tags

**Features:**
- Semantic search across all fields
- Timeline generation for files
- Related context discovery
- Autocomplete suggestions

**Design Decisions:**
- Client-side search (no server needed)
- In-memory index for performance
- Incremental index updates

## VS Code Extension

**Architecture:**

```
Extension Host
├── Extension.ts (entry point)
├── Commands
│   ├── addContext
│   ├── viewTimeline
│   ├── search
│   └── ...
├── Providers
│   ├── TreeDataProvider (sidebar)
│   ├── HoverProvider (context on hover)
│   └── CodeLensProvider (inline context)
└── Views
    └── WebviewPanel (timeline, analytics)
```

**Communication:**
- Extension ↔ Core: Direct function calls
- Extension ↔ UI: Webview messaging
- Extension ↔ Git: Child process execution

**Design Decisions:**
- Singleton CodeContextRecorder instance
- Reactive tree views (auto-refresh on changes)
- Webviews for rich UI (timeline, analytics)
- VS Code configuration for user preferences

## CLI Tool

**Architecture:**

```
CLI (Commander.js)
├── Commands
│   ├── init
│   ├── add
│   ├── search
│   ├── timeline
│   └── stats
└── Utils
    ├── formatters
    └── helpers
```

**Design Decisions:**
- Commander.js for argument parsing
- Chalk for colored output
- Ora for spinners
- Inquirer for interactive prompts

## Git Hooks

**Flow:**

```
1. Developer commits
2. Git triggers post-commit hook
3. Hook collects git context
4. Hook prompts for additional context (optional)
5. Context saved via Core API
6. Recent browser activity attached
```

**Implementation:**
- Node.js script
- Uses git commands to extract info
- Non-blocking (doesn't fail commits)
- Respects configuration

## Browser Extension

**Architecture:**

```
Background Script
├── Tab Monitor
├── URL Tracker
└── Message Handler

Content Script
├── Page Info Extractor
└── VS Code Communicator

Popup
└── Recent Activity View
```

**Communication:**
- Browser Extension → VS Code: WebSocket (future)
- Browser Extension → Core: File-based IPC (current)

**Design Decisions:**
- Manifest V3 for modern browsers
- Minimal permissions (activeTab, tabs)
- Local storage only
- No network requests

## Data Flow

### Adding Context

```
User Action (VS Code/CLI)
    ↓
Command Handler
    ↓
ContextCapture.addContext()
    ↓
StorageAdapter.saveContext()
    ↓
SQLite Database
    ↓
Event Emitter (context:added)
    ↓
Update UI / Search Index
```

### Searching

```
User Query
    ↓
ContextSearch.search()
    ↓
MiniSearch Index
    ↓
Filter & Rank Results
    ↓
StorageAdapter.getContext() (for full entries)
    ↓
Return Results
```

### Git Commit

```
Git Commit
    ↓
Post-Commit Hook
    ↓
Collect Git Info
    ↓
Get Recent Browser Activity (from buffer)
    ↓
Prompt User (optional)
    ↓
ContextCapture.captureGitCommit()
    ↓
Save to Database
```

## Performance Considerations

### Storage

- **SQLite WAL mode:** Better concurrent read/write
- **Indexes:** Fast queries on common fields
- **Pragmas:** journal_mode=WAL, synchronous=NORMAL

### Search

- **In-memory index:** Fast search without disk I/O
- **Incremental updates:** Only index new entries
- **Lazy loading:** Build index on first search

### Memory

- **Activity buffer:** Limited to 5 minutes
- **Search results:** Paginated (default 50)
- **Database connections:** Connection pooling

## Security & Privacy

### Data Storage

- **Local-first:** All data stored locally by default
- **Encryption:** SQLite can use SQLCipher (future)
- **Sensitive data:** Automatic redaction of secrets

### Browser Extension

- **Minimal permissions:** Only activeTab and storage
- **No tracking:** No analytics or telemetry
- **No network:** All processing local

### Privacy Config

```json
{
  "privacy": {
    "excludePatterns": ["*.env", "secrets/**"],
    "redactSensitiveData": true,
    "localOnly": true
  }
}
```

## Scalability

### Current Limits

- **Contexts:** Tested up to 100,000 entries
- **Database size:** ~10MB per 10,000 contexts
- **Search speed:** <100ms for 50,000 contexts

### Future Improvements

- **Archiving:** Move old contexts to separate DB
- **Cloud sync:** Optional cloud backup
- **Team sharing:** Shared context repository

## Extension Points

### Custom Storage Adapters

```typescript
class CloudStorageAdapter implements StorageAdapter {
  async saveContext(entry: ContextEntry): Promise<string> {
    // Custom implementation
  }
  // ... other methods
}
```

### Custom Integrations

```typescript
recorder.on('context:added', async (context) => {
  // Send to Slack, Linear, etc.
});
```

### Plugins (Future)

```typescript
interface CCRPlugin {
  name: string;
  version: string;
  activate(recorder: CodeContextRecorder): void;
}
```

## Testing Strategy

### Unit Tests

- Core logic (capture, search, storage)
- Utilities and helpers
- Mock database for isolation

### Integration Tests

- Full workflows (add → search → retrieve)
- Multi-package interactions
- Git hook scenarios

### E2E Tests

- VS Code extension commands
- CLI workflows
- Browser extension integration

## Deployment

### VS Code Marketplace

- Automated via GitHub Actions
- Triggered on release tags
- VSCE publish

### npm Registry

- Automated via GitHub Actions
- Scoped packages (@ccr/*)
- Semantic versioning

### Browser Extension Stores

- Manual submission (Chrome/Firefox)
- Review process required

## Future Architecture

### Planned Additions

1. **Real-time Collaboration**
   - WebSocket server
   - Shared context updates
   - Conflict resolution

2. **AI Integration**
   - GPT-based context suggestions
   - Automatic summarization
   - Smart tagging

3. **Cloud Sync**
   - Optional cloud backup
   - Team repositories
   - Access control

4. **Mobile App**
   - View context on mobile
   - Voice note recording
   - Quick search

## Performance Benchmarks

```
Operation               | Time      | Notes
------------------------|-----------|------------------
Add context             | ~5ms      | Including DB write
Search (1K entries)     | ~10ms     | In-memory index
Search (10K entries)    | ~20ms     | In-memory index
Search (100K entries)   | ~50ms     | In-memory index
Get timeline (100 ctx)  | ~30ms     | Including DB reads
Build search index      | ~200ms    | For 10K entries
```

## Dependencies

### Core
- better-sqlite3: Database
- minisearch: Search engine
- uuid: ID generation
- zod: Schema validation

### VS Code Extension
- vscode: VS Code API
- @ccr/core: Core library

### CLI
- commander: CLI framework
- chalk: Terminal colors
- inquirer: Interactive prompts
- ora: Spinners

## Monitoring & Debugging

### Logging

- Development: Console logging
- Production: File-based logging (optional)
- Levels: error, warn, info, debug

### Error Handling

- Try-catch around all I/O
- User-friendly error messages
- Detailed logs for debugging

### Telemetry (Optional)

- Anonymous usage stats
- Error reporting
- Opt-in only
