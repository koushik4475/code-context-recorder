# Usage Guide

This guide will help you get started with Code Context Recorder and make the most of its features.

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [VS Code Extension](#vs-code-extension)
4. [CLI Usage](#cli-usage)
5. [Git Integration](#git-integration)
6. [Browser Extension](#browser-extension)
7. [Best Practices](#best-practices)
8. [Advanced Usage](#advanced-usage)

## Installation

### VS Code Extension

The easiest way to get started:

```bash
# From marketplace (coming soon)
code --install-extension code-context-recorder

# Or install from source
git clone https://github.com/yourusername/code-context-recorder.git
cd code-context-recorder
npm install
npm run build
cd packages/vscode-extension
npm run install-extension
```

### CLI

```bash
npm install -g @ccr/cli

# Or use locally in your project
npm install --save-dev @ccr/cli
```

### Git Hooks

```bash
# In your project directory
npx ccr-hooks install
```

## Quick Start

### 1. Initialize in Your Project

```bash
cd your-project
ccr init
```

This creates a `.ccrrc.json` configuration file.

### 2. Add Your First Context

**Via VS Code:**
- Press `Ctrl+Shift+C` (or `Cmd+Shift+C` on Mac)
- Enter your context
- Optionally add tags

**Via CLI:**
```bash
ccr add "Using Redis for caching because..." --file src/cache.ts --tags "decision,performance"
```

### 3. View Context

**Timeline view:**
```bash
ccr timeline src/cache.ts
```

**Search:**
```bash
ccr search "redis caching"
```

## VS Code Extension

### Commands

- `Ctrl+Shift+C`: Add context to current file
- `Ctrl+Shift+V`: Add voice note (coming soon)
- `Ctrl+Shift+T`: View file timeline
- `Ctrl+Shift+F`: Search contexts

### Sidebar

The CCR sidebar shows:
- **Recent Context**: Last 10 context entries
- **Current File Context**: All context for the active file
- **Statistics**: Quick stats about your context

### Hover Information

Hover over any line of code to see associated context automatically.

### Right-Click Menu

Right-click in any file to access CCR commands:
- Add Context
- Add Voice Note
- View Timeline
- Link Ticket

## CLI Usage

### Add Context

```bash
# Basic usage
ccr add "Context message" --file path/to/file.ts

# With line number
ccr add "Fixed bug in login" --file auth.ts --line 42

# With tags
ccr add "Refactored for performance" --file utils.ts --tags "refactor,perf"
```

### Search

```bash
# Basic search
ccr search "authentication"

# Filter by file
ccr search "bug" --file "*.test.ts"

# Filter by type
ccr search "decision" --type decision

# Limit results
ccr search "refactor" --limit 5
```

### Timeline

```bash
# View timeline for a file
ccr timeline src/components/Login.tsx

# Timeline for specific date range (coming soon)
ccr timeline src/api.ts --from 2024-01-01 --to 2024-02-01
```

### Statistics

```bash
ccr stats

# Output:
# Total Contexts: 247
# Avg per Commit: 2.3
# Most Documented Files:
#   - src/auth.ts (45)
#   - src/api.ts (32)
#   - src/utils.ts (28)
```

## Git Integration

### Automatic Context Capture

When you commit, CCR can optionally prompt for additional context:

```bash
git commit -m "Add authentication"

# CCR prompts:
# Would you like to add additional context? [y/n/voice]:
```

### Configuration

In `.ccrrc.json`:

```json
{
  "git": {
    "promptOnCommit": true,
    "autoCapture": true
  }
}
```

### Viewing Commit Context

```bash
# View context for a specific commit
ccr show abc123

# List commits with context
ccr commits --with-context
```

## Browser Extension

The browser extension (Chrome/Firefox) automatically tracks:
- Documentation pages you visit
- Stack Overflow questions
- GitHub issues and PRs
- Blog posts and tutorials

These are associated with your active file in VS Code.

### Installation

1. Build the extension:
   ```bash
   cd packages/browser-extension
   npm run build
   ```

2. Load in browser:
   - Chrome: Load `dist/` as unpacked extension
   - Firefox: Load `dist/` as temporary extension

### Privacy

All browser history is stored **locally** and never sent to servers.

Configure what's tracked in settings:

```json
{
  "capture": {
    "includeBrowserHistory": true,
    "browserHistoryDomains": [
      "stackoverflow.com",
      "github.com",
      "*.readthedocs.io"
    ]
  }
}
```

## Best Practices

### 1. Add Context When It Matters

Good times to add context:
- ✅ Making a non-obvious decision
- ✅ Implementing a workaround
- ✅ Choosing between alternatives
- ✅ Fixing a subtle bug
- ✅ Using an unusual pattern

Don't add context for:
- ❌ Self-explanatory code
- ❌ Standard patterns
- ❌ Obvious implementations

### 2. Be Specific and Actionable

**Bad:**
```
"Fixed bug"
```

**Good:**
```
"Fixed race condition in user login. The issue occurred when rapid
consecutive logins caused duplicate session creation. Solution:
added session locking using Redis distributed locks."
```

### 3. Link to External Resources

```bash
ccr add "Following the pattern from this article: https://..."
```

### 4. Record Decisions

Use the decision command for architecture choices:

```bash
ccr decision "Use PostgreSQL over MongoDB" \
  --reasoning "Need ACID transactions for financial data" \
  --alternatives "MongoDB,DynamoDB" \
  --files "src/db/*.ts"
```

### 5. Tag Consistently

Use consistent tags for easier searching:
- `decision` - Architecture/tech decisions
- `workaround` - Temporary workarounds
- `bug-fix` - Bug fixes
- `performance` - Performance optimizations
- `security` - Security-related changes
- `refactor` - Code refactoring

### 6. Regular Cleanup

Review and clean up old context:

```bash
# Find old unused context
ccr cleanup --older-than 6months --unused
```

## Advanced Usage

### Team Collaboration

Share context across team:

```bash
# Export contexts
ccr export --format json > contexts.json

# Import contexts
ccr import contexts.json
```

### Integration with Tools

#### Slack

```json
{
  "integrations": {
    "slack": {
      "enabled": true,
      "webhook": "https://hooks.slack.com/..."
    }
  }
}
```

Automatically posts to Slack when important decisions are recorded.

#### Linear/Jira

Link tickets automatically:

```bash
ccr link-ticket "PROJ-123" https://linear.app/... --file src/feature.ts
```

### Custom Scripts

Use the core API in your own scripts:

```typescript
import { CodeContextRecorder, createDefaultConfig } from '@ccr/core';

const recorder = new CodeContextRecorder(createDefaultConfig('./'));
await recorder.initialize();

await recorder.addContext('Custom context', 'file.ts');
```

### Analytics and Insights

```bash
# Generate report
ccr report --format html > report.html

# Find files with least context
ccr analyze --find-undocumented

# Team contributions
ccr contributors --since 2024-01-01
```

## Troubleshooting

### "Database locked" Error

This happens when multiple processes access the database:

```bash
# Close all VS Code windows
# Remove lock file
rm .ccr/contexts.db-wal
```

### Extension Not Working

```bash
# Reload VS Code
# Check output panel for errors
# Reinstall extension
code --uninstall-extension code-context-recorder
code --install-extension code-context-recorder
```

### Git Hooks Not Triggering

```bash
# Reinstall hooks
npx ccr-hooks install --force

# Check hook is executable
chmod +x .git/hooks/post-commit
```

## Getting Help

- 📖 [Documentation](https://code-context-recorder.dev/docs)
- 💬 [Discord Community](https://discord.gg/ccr)
- 🐛 [Report Issues](https://github.com/yourusername/code-context-recorder/issues)
- ✉️ Email: hello@code-context-recorder.dev
