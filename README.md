# Code Context Recorder 🎯

> Capture the WHY behind your code, not just the WHAT.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

## The Problem

Every developer has experienced this:

- Staring at old code wondering "Why did we do it this way?"
- Finding cryptic comments like "Don't delete this, it breaks everything" with zero context
- Spending hours debugging because critical decision context was lost
- Onboarding new developers who can't understand the reasoning behind architecture choices

**Git tracks WHAT changed. Comments explain HOW it works. But nothing captures WHY decisions were made.**

## The Solution

Code Context Recorder automatically captures and preserves the context around your code:

- 📚 **Research tracking**: Links to Stack Overflow, docs, GitHub issues you referenced
- 💬 **Decision history**: Associated Slack threads, meeting notes, bug tickets
- 🎤 **Voice notes**: Optional audio explanations of tricky decisions
- ⏱️ **Timeline view**: Replay the entire decision-making process months later
- 🔍 **AI-powered search**: Find context using natural language queries

## Architecture

```
code-context-recorder/
├── packages/
│   ├── core/              # Core logic, storage, and API
│   ├── vscode-extension/  # VS Code extension
│   ├── browser-extension/ # Chrome/Firefox extension for web tracking
│   ├── git-hooks/         # Git hook integrations
│   ├── cli/               # Command-line interface
│   └── web-viewer/        # Web UI for viewing context timelines
├── apps/
│   └── desktop/           # Electron desktop app (optional)
└── docs/                  # Documentation
```

## Quick Start

### 1. Install the VS Code Extension

```bash
# Clone the repository
git clone https://github.com/yourusername/code-context-recorder.git
cd code-context-recorder

# Install dependencies
npm install

# Build all packages
npm run build

# Install VS Code extension
cd packages/vscode-extension
npm run install-extension
```

### 2. Install Git Hooks

```bash
# In your project directory
npx ccr-hooks install
```

### 3. Install Browser Extension (Optional but Recommended)

- Chrome: Load `packages/browser-extension/dist` as unpacked extension
- Firefox: Load `packages/browser-extension/dist` as temporary extension

## Features

### 🎯 Automatic Context Capture

- **Browser Activity**: Tracks documentation, Stack Overflow, and GitHub visited while coding
- **Git Integration**: Links commits to context automatically
- **File Watching**: Detects when you're actively working on code
- **Smart Filtering**: Only captures relevant context, ignores noise

### 🎤 Voice Notes

Record quick voice explanations while coding:

```typescript
// Trigger voice note with keyboard shortcut (Ctrl+Shift+V)
// Automatically attached to current file and line
```

### 📊 Context Timeline

View the complete decision history for any file:

```bash
ccr timeline src/components/Auth.tsx
```

### 🔍 Semantic Search

Find context using natural language:

```bash
ccr search "why did we choose PostgreSQL over MongoDB"
ccr search "authentication flow decision"
```

### 👥 Team Collaboration

- Share context across team members
- Export context for onboarding docs
- Integration with Slack, Linear, Jira

## Usage Examples

### Recording Context Manually

```bash
# Add context to current file
ccr add "Chose this approach because X API was deprecated"

# Add context with links
ccr add "Following this pattern: https://..." --file src/auth.ts

# Add voice note
ccr voice --file src/utils/crypto.ts
```

### Viewing Context

```bash
# View timeline for file
ccr timeline src/auth.ts

# View context for specific commit
ccr show abc123

# Open web viewer
ccr web
```

### Git Hook Integration

Automatically prompts for context on commits:

```bash
git commit -m "Add authentication"
# Prompts: "Add optional context? (y/n/voice)"
# You can add text, voice note, or skip
```

## Configuration

Create `.ccrrc.json` in your project root:

```json
{
  "storage": {
    "type": "local", // or "sqlite", "cloud"
    "path": ".ccr"
  },
  "tracking": {
    "browser": true,
    "voice": true,
    "autoCapture": true
  },
  "integrations": {
    "slack": {
      "enabled": false,
      "webhook": ""
    },
    "linear": {
      "enabled": false,
      "apiKey": ""
    }
  },
  "privacy": {
    "excludePatterns": ["*.env", "*.key", "secrets/*"]
  }
}
```

## Tech Stack

- **Core**: TypeScript, Node.js
- **Storage**: SQLite, IndexedDB
- **VS Code Extension**: VS Code Extension API
- **Browser Extension**: WebExtensions API (Chrome/Firefox compatible)
- **Web Viewer**: React, TailwindCSS
- **Voice Recording**: Web Audio API
- **Search**: MiniSearch (client-side full-text search)

## Project Structure

```
packages/
├── core/
│   ├── src/
│   │   ├── storage/          # Storage adapters (SQLite, local, cloud)
│   │   ├── capture/          # Context capture logic
│   │   ├── search/           # Search and query engine
│   │   ├── integrations/     # Third-party integrations
│   │   └── api/              # Core API
│   └── package.json
│
├── vscode-extension/
│   ├── src/
│   │   ├── extension.ts      # Extension entry point
│   │   ├── commands/         # VS Code commands
│   │   ├── providers/        # Tree view, hover providers
│   │   └── views/            # Webview panels
│   └── package.json
│
├── browser-extension/
│   ├── src/
│   │   ├── background/       # Background script
│   │   ├── content/          # Content scripts
│   │   └── popup/            # Extension popup
│   └── manifest.json
│
├── git-hooks/
│   ├── hooks/
│   │   ├── post-commit
│   │   └── pre-push
│   └── install.js
│
├── cli/
│   ├── src/
│   │   ├── commands/         # CLI commands
│   │   └── index.ts
│   └── package.json
│
└── web-viewer/
    ├── src/
    │   ├── components/       # React components
    │   ├── pages/            # Page components
    │   └── App.tsx
    └── package.json
```

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Lint
npm run lint

# Build all packages
npm run build
```

## Roadmap

- [x] Core storage and API
- [x] VS Code extension MVP
- [x] Git hooks integration
- [x] Browser extension for web tracking
- [ ] Voice note recording
- [ ] Web viewer UI
- [ ] Semantic search
- [ ] Team collaboration features
- [ ] Slack/Linear/Jira integrations
- [ ] AI-powered context suggestions
- [ ] Mobile app for viewing context

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- 📖 [Documentation](https://code-context-recorder.dev/docs)
- 💬 [Discord Community](https://discord.gg/ccr)
- 🐛 [Report a Bug](https://github.com/yourusername/code-context-recorder/issues)
- 💡 [Request a Feature](https://github.com/yourusername/code-context-recorder/issues)

## Credits

Built with ❤️ by developers who are tired of losing context.

---

**Star ⭐ this repo if you find it useful!**
