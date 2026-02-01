import * as vscode from 'vscode';
import { CodeContextRecorder, ContextEntry } from '@ccr/core';
export declare class ContextTreeProvider implements vscode.TreeDataProvider<ContextTreeItem> {
    private recorder;
    private mode;
    private _onDidChangeTreeData;
    readonly onDidChangeTreeData: vscode.Event<ContextTreeItem | undefined>;
    constructor(recorder: CodeContextRecorder, mode: 'recent' | 'file');
    refresh(): void;
    getTreeItem(element: ContextTreeItem): vscode.TreeItem;
    getChildren(element?: ContextTreeItem): Promise<ContextTreeItem[]>;
}
declare class ContextTreeItem extends vscode.TreeItem {
    readonly context: ContextEntry;
    constructor(context: ContextEntry);
    private getIconForType;
}
export {};
//# sourceMappingURL=ContextTreeProvider.d.ts.map