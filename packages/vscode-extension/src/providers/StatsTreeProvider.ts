import * as vscode from 'vscode';
import { CodeContextRecorder } from '@ccr/core';

export class StatsTreeProvider implements vscode.TreeDataProvider<StatsTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<StatsTreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private recorder: CodeContextRecorder) {}

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: StatsTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: StatsTreeItem): Promise<StatsTreeItem[]> {
    if (element) {
      return [];
    }

    try {
      const analytics = await this.recorder.getAnalytics();

      return [
        new StatsTreeItem(
          `Total Contexts: ${analytics.totalContexts}`,
          'graph-line'
        ),
        new StatsTreeItem(
          `Avg per Commit: ${analytics.averageContextsPerCommit.toFixed(1)}`,
          'git-commit'
        ),
        new StatsTreeItem(
          `Most Documented: ${analytics.mostContextedFiles[0]?.file || 'N/A'}`,
          'file'
        )
      ];
    } catch (error) {
      return [new StatsTreeItem('Error loading stats', 'error')];
    }
  }
}

class StatsTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private iconName: string
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.iconPath = new vscode.ThemeIcon(iconName);
  }
}
