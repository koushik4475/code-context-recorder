import * as vscode from 'vscode';
import { CodeContextRecorder } from '@ccr/core';
export declare class StatsTreeProvider implements vscode.TreeDataProvider<StatsTreeItem> {
    private recorder;
    private _onDidChangeTreeData;
    readonly onDidChangeTreeData: vscode.Event<StatsTreeItem | undefined>;
    constructor(recorder: CodeContextRecorder);
    refresh(): void;
    getTreeItem(element: StatsTreeItem): vscode.TreeItem;
    getChildren(element?: StatsTreeItem): Promise<StatsTreeItem[]>;
}
declare class StatsTreeItem extends vscode.TreeItem {
    readonly label: string;
    private iconName;
    constructor(label: string, iconName: string);
}
export {};
//# sourceMappingURL=StatsTreeProvider.d.ts.map