import * as vscode from 'vscode';
import { CodeContextRecorder } from '@ccr/core';
/**
 * Extension activation
 */
export declare function activate(context: vscode.ExtensionContext): Promise<void>;
/**
 * Extension deactivation
 */
export declare function deactivate(): Promise<void>;
export declare function getRecorder(): CodeContextRecorder | null;
//# sourceMappingURL=extension.d.ts.map