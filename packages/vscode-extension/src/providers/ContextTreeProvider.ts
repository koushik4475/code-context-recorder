import * as vscode from 'vscode';
import { CodeContextRecorder, ContextEntry } from '@ccr/core';

export class ContextTreeProvider implements vscode.TreeDataProvider<ContextTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<ContextTreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(
    private recorder: CodeContextRecorder,
    private mode: 'recent' | 'file'
  ) {}

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: ContextTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: ContextTreeItem): Promise<ContextTreeItem[]> {
    if (element) {
      return [];
    }

    try {
      let contexts: ContextEntry[];

      if (this.mode === 'recent') {
        contexts = await this.recorder.getRecent(10);
      } else {
        // Get contexts for current file
        const editor = vscode.window.activeTextEditor;
        if (!editor) return [];

        const filePath = vscode.workspace.asRelativePath(editor.document.uri.fsPath);
        const timeline = await this.recorder.getFileTimeline(filePath);
        contexts = timeline.entries;
      }

      return contexts.map(ctx => new ContextTreeItem(ctx));
    } catch (error) {
      return [];
    }
  }
}

class ContextTreeItem extends vscode.TreeItem {
  constructor(public readonly context: ContextEntry) {
    super(
      context.content.substring(0, 50) + (context.content.length > 50 ? '...' : ''),
      vscode.TreeItemCollapsibleState.None
    );

    this.description = context.type;
    this.tooltip = new vscode.MarkdownString(`
**${context.type}**  
${context.content}

*${context.timestamp.toLocaleString()}*

${context.tags.length > 0 ? `Tags: ${context.tags.join(', ')}` : ''}
    `.trim());

    this.iconPath = new vscode.ThemeIcon(this.getIconForType(context.type));
  }

  private getIconForType(type: string): string {
    const icons: Record<string, string> = {
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
