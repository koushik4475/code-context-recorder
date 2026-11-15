<div align="center">

# Code Context Recorder | Preserve Developer Decisions and Code Change Rationale

Code Context Recorder is a developer-tool project focused on preserving the reasoning behind code changes. It aims to capture implementation context that Git diffs and inline comments do not explain, helping teams understand why a design decision was made during future maintenance, debugging, and onboarding. Explore the examples and setup instructions to see the current workflow and integration status.


### *Never Lose the WHY Behind Your Code Again*

<img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"/>
<img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"/>
<img src="https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white" alt="TypeScript"/>
<img src="https://img.shields.io/badge/VS_Code-007ACC?logo=visual-studio-code&logoColor=white" alt="VS Code"/>

[🚀 Quick Start](#-quick-start) • [📖 Documentation](#-features) • [🎯 Demo](#-see-it-in-action) • [💬 Community](#-community)

---

<img alt="Code Context Recorder Hero" src="https://raw.githubusercontent.com/koushik4475/code-context-recorder/main/assets/hero-banner.svg" width="800px">

</div>

---

## 💥 The Problem

<table>
<tr>
<td width="50%">

**Ever experienced this?** 🤔

```diff
- "Why did we do it this way?"
- "Who wrote this and why??"
- "What was the reasoning here?"
- Lost critical context forever
- Hours debugging old code
- New devs can't understand decisions
```

</td>
<td width="50%">

**Git tracks *WHAT* changed**  
**Comments explain *HOW* it works**  
**But nothing captures *WHY***

<br/>

> *"The most valuable code isn't the code itself—it's the context around it."*

</td>
</tr>
</table>

---

## ✨ The Solution

Code Context Recorder is your **team's knowledge time machine** ⏰

Automatically captures and preserves the complete story behind your code:

<div align="center">

| Feature | Description | Status |
|---------|-------------|--------|
| 📚 **Research Tracking** | Links to Stack Overflow, docs, GitHub issues you referenced | ✅ Ready |
| 💬 **Decision History** | Associated Slack threads, meeting notes, bug tickets | ✅ Ready |
| 🎤 **Voice Notes** | Audio explanations of tricky decisions | 🚧 Coming Soon |
| ⏱️ **Timeline View** | Replay the entire decision-making process | ✅ Ready |
| 🔍 **AI Search** | Find context using natural language | ✅ Ready |
| 👥 **Team Sync** | Share context across your entire team | 🚧 Coming Soon |

</div>

---

## 🎯 See It In Action

### 🎬 Adding Context to Your Code

<div align="center">

```mermaid
graph LR
    A[🖊️ You Write Code] --> B[🤔 Add Context]
    B --> C[💾 Auto-Saved]
    C --> D[🔍 Searchable Forever]
    D --> E[👥 Team Knowledge]
    
    style A fill:#4CAF50,stroke:#2E7D32,color:#fff
    style B fill:#2196F3,stroke:#1565C0,color:#fff
    style C fill:#FF9800,stroke:#E65100,color:#fff
    style D fill:#9C27B0,stroke:#6A1B9A,color:#fff
    style E fill:#F44336,stroke:#C62828,color:#fff
```

</div>

<table>
<tr>
<td width="50%">

### 📝 Before CCR
```javascript
// TODO: Fix this later
function calculatePrice(items) {
  return items.reduce((a,b) => 
    a + b.price * 0.87, 0);
}
```
*Why 0.87? Nobody knows anymore* 😰

</td>
<td width="50%">

### ✅ With CCR
```javascript
// Context: Using 0.87 multiplier for bulk discount
// Decision: After meeting with sales team
// Ticket: JIRA-1234
function calculatePrice(items) {
  return items.reduce((a,b) => 
    a + b.price * 0.87, 0);
}
```
*Full context preserved forever* 🎉

</td>
</tr>
</table>

### 🎥 Live Demo

<div align="center">

**[Open Interactive Demo](demo.html)** — Try Code Context Recorder in your browser

</div>

---

## 🚀 Quick Start

### Installation is a breeze! Choose your path:

<details open>
<summary><b>🎨 VS Code Extension (Recommended)</b></summary>

```bash
# Install from VS Code Marketplace (Coming Soon)
code --install-extension code-context-recorder

# Or install from source
git clone https://github.com/koushik4475/code-context-recorder.git
cd code-context-recorder
npm install
npm run build
cd packages/vscode-extension
npm run install-extension
```
*On Windows PowerShell use `;` instead of `&&` between commands, or run each line separately.*

**Keyboard Shortcuts:**
- `Ctrl+Shift+C` - Add context
- `Ctrl+Shift+T` - View timeline
- `Ctrl+Shift+F` - Search contexts
- `Ctrl+Shift+V` - Voice note (coming soon)

</details>

<details>
<summary><b>💻 CLI Tool</b></summary>

```bash
# Install globally
npm install -g @ccr/cli

# Or use in your project
npm install --save-dev @ccr/cli

# Initialize in your project
ccr init
```

</details>

<details>
<summary><b>🔗 Git Hooks</b></summary>

```bash
# Automatically prompt for context on commits
cd your-project
npx ccr-hooks install
```

</details>

---

## 🎨 Features

<div align="center">

### 🔥 Core Capabilities

</div>

<table>
<tr>
<td width="33%" align="center">

### 📊 Smart Timeline
![Timeline Icon](https://img.shields.io/badge/Timeline-4CAF50?style=for-the-badge&logo=timeline&logoColor=white)

View complete decision history for any file with beautiful visual timeline

</td>
<td width="33%" align="center">

### 🎯 Instant Search
![Search Icon](https://img.shields.io/badge/Search-2196F3?style=for-the-badge&logo=search&logoColor=white)

Find context using natural language queries in milliseconds

</td>
<td width="33%" align="center">

### 🔄 Auto-Capture
![Auto Icon](https://img.shields.io/badge/Auto-FF9800?style=for-the-badge&logo=automatic&logoColor=white)

Automatically links browser research to your commits

</td>
</tr>
</table>

### 💡 Usage Examples

<details>
<summary><b>📝 Recording Context</b></summary>

```bash
# Add context to current file
ccr add "Chose this approach because X API was deprecated" --file src/auth.ts

# Add context with links
ccr add "Following this pattern: https://..." --file src/auth.ts

# Record important decisions (use add with a clear message)
ccr add "Decision: Use PostgreSQL over MongoDB. Need ACID transactions for financial data." --file src/db.ts --tags "decision,architecture"
```

</details>

<details>
<summary><b>🔍 Searching Context</b></summary>

```bash
# Natural language search
ccr search "why did we choose PostgreSQL over MongoDB"

# Search by file pattern
ccr search "authentication" --file "*.ts"

# Search by type
ccr search "decision" --type decision
```

</details>

<details>
<summary><b>📈 View Analytics</b></summary>

```bash
# Show project statistics
ccr stats

# Output:
# 📊 Total Contexts: 247
# 📈 Avg per Commit: 2.3
# 🔥 Most Documented Files:
#    ├─ src/auth.ts (45)
#    ├─ src/api.ts (32)
#    └─ src/utils.ts (28)
```

</details>

<details>
<summary><b>⏱️ View Timeline</b></summary>

```bash
# See complete history for a file
ccr timeline src/components/Auth.tsx
ccr timeline src/api.ts
```

</details>

---

## 🏗️ Architecture

<div align="center">

```mermaid
graph TB
    subgraph "User Interfaces"
        A[VS Code Extension]
        B[CLI Tool]
        C[Browser Extension]
        D[Web Viewer]
    end
    
    subgraph "Core Engine"
        E[Context Capture]
        F[Storage Layer]
        G[Search Engine]
    end
    
    subgraph "Integrations"
        H[Git Hooks]
        I[Slack]
        J[Linear/Jira]
    end
    
    A --> E
    B --> E
    C --> E
    D --> G
    E --> F
    F --> G
    H --> E
    E --> I
    E --> J
    
    style A fill:#007ACC,stroke:#005A9C,color:#fff
    style B fill:#4CAF50,stroke:#2E7D32,color:#fff
    style C fill:#FF9800,stroke:#E65100,color:#fff
    style D fill:#9C27B0,stroke:#6A1B9A,color:#fff
    style E fill:#2196F3,stroke:#1565C0,color:#fff
    style F fill:#F44336,stroke:#C62828,color:#fff
    style G fill:#00BCD4,stroke:#00838F,color:#fff
```

</div>

### 📦 Project Structure

```
code-context-recorder/
├── 🎯 packages/
│   ├── core/              # TypeScript core library
│   ├── vscode-extension/  # VS Code integration
│   ├── cli/               # Command-line interface
│   ├── git-hooks/         # Git integration
│   ├── browser-extension/ # Browser tracking
│   └── web-viewer/        # React web UI
├── 📖 docs/               # Documentation
└── 🧪 tests/              # Test suites
```

---

## 🎨 Tech Stack

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![VS Code](https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)

</div>

<table>
<tr>
<td>

**Core**
- TypeScript (Strict Mode)
- Node.js
- SQLite (better-sqlite3)

</td>
<td>

**Search**
- MiniSearch
- Full-text indexing
- Fuzzy matching

</td>
<td>

**UI**
- VS Code Extension API
- React + TailwindCSS
- WebExtensions API

</td>
</tr>
</table>

---

## 📊 Configuration

Create `.ccrrc.json` in your project root:

```json
{
  "storage": {
    "type": "sqlite",
    "path": ".ccr"
  },
  "capture": {
    "autoCapture": true,
    "includeBrowserHistory": true,
    "includeVoiceNotes": true
  },
  "integrations": {
    "slack": { "enabled": false },
    "linear": { "enabled": false },
    "jira": { "enabled": false }
  },
  "privacy": {
    "excludePatterns": ["*.env", "*.key", "secrets/*"],
    "localOnly": true
  }
}
```

---

## 🗺️ Roadmap

<div align="center">

### Where We're Going 🚀

</div>

```mermaid
gantt
    title Code Context Recorder Development Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1
    Core Engine & Storage     :done, 2024-01-01, 30d
    VS Code Extension MVP     :done, 2024-01-15, 30d
    Git Hooks Integration     :done, 2024-02-01, 15d
    
    section Phase 2
    Voice Note Recording      :active, 2024-02-15, 30d
    Web Viewer UI             :active, 2024-02-20, 45d
    Browser Extension         :active, 2024-03-01, 30d
    
    section Phase 3
    Team Collaboration        :2024-04-01, 45d
    AI-Powered Features       :2024-05-01, 60d
    Mobile App                :2024-06-01, 90d
```

<details>
<summary><b>✅ Completed</b></summary>

- [x] Core storage and API
- [x] SQLite integration with WAL mode
- [x] VS Code extension MVP
- [x] Git hooks integration
- [x] Full-text search engine
- [x] Timeline visualization
- [x] CLI tool
- [x] Analytics dashboard

</details>

<details>
<summary><b>🚧 In Progress</b></summary>

- [ ] Voice note recording (60% complete)
- [ ] Browser extension (40% complete)
- [ ] Web viewer UI (30% complete)

</details>

<details>
<summary><b>🔮 Coming Soon</b></summary>

- [ ] Team collaboration features
- [ ] Slack/Linear/Jira integrations
- [ ] AI-powered context suggestions
- [ ] Semantic search improvements
- [ ] Mobile app for viewing context
- [ ] Real-time sync
- [ ] Cloud backup (optional)

</details>

---

## 🤝 Contributing

We ❤️ contributions! Check out our [Contributing Guide](CONTRIBUTING.md)

<div align="center">

### 🌟 Contributors

<a href="https://github.com/koushik4475/code-context-recorder/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=koushik4475/code-context-recorder" />
</a>

*Made with [contrib.rocks](https://contrib.rocks)*

</div>

### Development Setup

```bash
# Clone the repository
git clone https://github.com/koushik4475/code-context-recorder.git
cd code-context-recorder

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Build all packages
npm run build
```

---

## 📚 Documentation

<table>
<tr>
<td align="center">

### 📖 [Usage Guide](USAGE.md)
Learn how to use CCR effectively

</td>
<td align="center">

### 🏗️ [Architecture](ARCHITECTURE.md)
Technical deep-dive

</td>
<td align="center">

### 🤝 [Contributing](CONTRIBUTING.md)
Join the community

</td>
</tr>
</table>

---

## 🌟 Why Use Code Context Recorder?

<table>
<tr>
<td width="50%">

### 🎯 For Individual Developers

✅ Never forget why you wrote something  
✅ Resume work instantly after breaks  
✅ Build a knowledge base of your decisions  
✅ Improve code review quality  
✅ Learn from your past choices

</td>
<td width="50%">

### 👥 For Teams

✅ Onboard new developers 10x faster  
✅ Preserve institutional knowledge  
✅ Reduce time debugging legacy code  
✅ Improve team communication  
✅ Create living documentation

</td>
</tr>
</table>

---

## 💬 Community

<div align="center">

[![Discord](https://img.shields.io/badge/Discord-Join_Chat-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ccr)
[![Twitter](https://img.shields.io/badge/Twitter-Follow-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/codecontextrec)
[![GitHub Discussions](https://img.shields.io/badge/GitHub-Discussions-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/koushik4475/code-context-recorder/discussions)

</div>

- 💬 [Discord Server](https://discord.gg/ccr) - Get help and chat
- 🐛 [Issue Tracker](https://github.com/koushik4475/code-context-recorder/issues) - Report bugs
- 💡 [Discussions](https://github.com/koushik4475/code-context-recorder/discussions) - Share ideas
- 📧 Email: hello@code-context-recorder.dev

---

## 📄 License

Code Context Recorder is [MIT licensed](LICENSE).

---

## 🙏 Acknowledgments

Built with ❤️ by developers who are tired of losing context.

Special thanks to:
- The amazing open-source community
- Early adopters and beta testers
- All contributors who made this possible

---

<div align="center">

### ⭐ Star us on GitHub — it motivates us a lot!

[![Star History Chart](https://api.star-history.com/svg?repos=koushik4475/code-context-recorder&type=Date)](https://star-history.com/#koushik4475/code-context-recorder&Date)

---

**[⬆ Back to Top](#-code-context-recorder)**

</div>
