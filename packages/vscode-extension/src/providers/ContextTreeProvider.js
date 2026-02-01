"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextTreeProvider = void 0;
const vscode = __importStar(require("vscode"));
class ContextTreeProvider {
    constructor(recorder, mode) {
        this.recorder = recorder;
        this.mode = mode;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }
    getTreeItem(element) {
        return element;
    }
    async getChildren(element) {
        if (element) {
            return [];
        }
        try {
            let contexts;
            if (this.mode === 'recent') {
                contexts = await this.recorder.getRecent(10);
            }
            else {
                // Get contexts for current file
                const editor = vscode.window.activeTextEditor;
                if (!editor)
                    return [];
                const filePath = vscode.workspace.asRelativePath(editor.document.uri.fsPath);
                const timeline = await this.recorder.getFileTimeline(filePath);
                contexts = timeline.entries;
            }
            return contexts.map(ctx => new ContextTreeItem(ctx));
        }
        catch (error) {
            return [];
        }
    }
}
exports.ContextTreeProvider = ContextTreeProvider;
class ContextTreeItem extends vscode.TreeItem {
    constructor(context) {
        super(context.content.substring(0, 50) + (context.content.length > 50 ? '...' : ''), vscode.TreeItemCollapsibleState.None);
        this.context = context;
        this.description = context.type;
        this.tooltip = new vscode.MarkdownString(`
**${context.type}**  
${context.content}

*${context.timestamp.toLocaleString()}*

${context.tags.length > 0 ? `Tags: ${context.tags.join(', ')}` : ''}
    `.trim());
        this.iconPath = new vscode.ThemeIcon(this.getIconForType(context.type));
    }
    getIconForType(type) {
        const icons = {
            text: 'note',
            voice: 'mic',
            link: 'link',
            code_snippet: 'code',
            commit: 'git-commit',
            meeting_note: 'organization',
            decision: 'gist-fork',
            bug_report: 'bug',
            research: 'search'
        };
        return icons[type] || 'note';
    }
}
//# sourceMappingURL=ContextTreeProvider.js.map