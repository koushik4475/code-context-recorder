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
exports.activate = activate;
exports.deactivate = deactivate;
exports.getRecorder = getRecorder;
const vscode = __importStar(require("vscode"));
const core_1 = require("@ccr/core");
const commands_1 = require("./commands");
const ContextTreeProvider_1 = require("./providers/ContextTreeProvider");
const ContextHoverProvider_1 = require("./providers/ContextHoverProvider");
const StatsTreeProvider_1 = require("./providers/StatsTreeProvider");
let recorder = null;
/**
 * Extension activation
 */
async function activate(context) {
    console.log('Code Context Recorder is now active');
    // Get workspace folder
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showWarningMessage('Code Context Recorder requires a workspace folder to be opened');
        return;
    }
    // Initialize recorder
    const projectPath = workspaceFolder.uri.fsPath;
    const config = (0, core_1.createDefaultConfig)(projectPath);
    // Get user configuration
    const vsConfig = vscode.workspace.getConfiguration('ccr');
    config.capture.autoCapture = vsConfig.get('autoCapture', true);
    config.capture.includeBrowserHistory = vsConfig.get('includeBrowserHistory', true);
    config.storagePath = vsConfig.get('storagePath', '.ccr');
    config.capture.excludePatterns = vsConfig.get('excludePatterns', config.capture.excludePatterns);
    recorder = new core_1.CodeContextRecorder(config);
    try {
        await recorder.initialize();
        vscode.window.showInformationMessage('Code Context Recorder initialized');
    }
    catch (error) {
        vscode.window.showErrorMessage(`Failed to initialize Code Context Recorder: ${error}`);
        return;
    }
    // Register commands
    (0, commands_1.registerCommands)(context, recorder);
    // Register tree view providers
    const recentContextProvider = new ContextTreeProvider_1.ContextTreeProvider(recorder, 'recent');
    const fileContextProvider = new ContextTreeProvider_1.ContextTreeProvider(recorder, 'file');
    const statsProvider = new StatsTreeProvider_1.StatsTreeProvider(recorder);
    context.subscriptions.push(vscode.window.registerTreeDataProvider('ccr.recentContext', recentContextProvider), vscode.window.registerTreeDataProvider('ccr.fileContext', fileContextProvider), vscode.window.registerTreeDataProvider('ccr.stats', statsProvider));
    // Register hover provider for showing context on hover
    context.subscriptions.push(vscode.languages.registerHoverProvider({ scheme: 'file' }, new ContextHoverProvider_1.ContextHoverProvider(recorder)));
    // Watch for active editor changes to update file context view
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor) {
            fileContextProvider.refresh();
        }
    }));
    // Watch for file saves to potentially capture context
    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(async (document) => {
        if (config.capture.autoCapture) {
            // Could prompt for context on save if needed
        }
    }));
    // Status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(note) CCR';
    statusBarItem.tooltip = 'Code Context Recorder - Click to add context';
    statusBarItem.command = 'ccr.addContext';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
    // Listen to recorder events
    recorder.on('context:added', () => {
        recentContextProvider.refresh();
        fileContextProvider.refresh();
        statsProvider.refresh();
    });
    // Store recorder in context for access by commands
    context.subscriptions.push({
        dispose: async () => {
            if (recorder) {
                await recorder.close();
            }
        }
    });
}
/**
 * Extension deactivation
 */
async function deactivate() {
    if (recorder) {
        await recorder.close();
    }
}
function getRecorder() {
    return recorder;
}
//# sourceMappingURL=extension.js.map