import * as vscode from 'vscode';
import { CodeContextRecorder } from '@ccr/core';
export declare class ContextHoverProvider implements vscode.HoverProvider {
    private recorder;
    constructor(recorder: CodeContextRecorder);
    provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Promise<vscode.Hover | null>;
}
//# sourceMappingURL=ContextHoverProvider.d.ts.map