import * as vscode from 'vscode';
import { CodeContextRecorder, createDefaultConfig } from '@ccr/core';
import { registerCommands } from './commands';
import { ContextTreeProvider } from './providers/ContextTreeProvider';
import { ContextHoverProvider } from './providers/ContextHoverProvider';
import { StatsTreeProvider } from './providers/StatsTreeProvider';

let recorder: CodeContextRecorder | null = null;

/**
 * Extension activation
 */
export async function activate(context: vscode.ExtensionContext) {
  console.log('Code Context Recorder is now active');

  // Get workspace folder
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showWarningMessage(
      'Code Context Recorder requires a workspace folder to be opened'
    );
    return;
  }

  // Initialize recorder
  const projectPath = workspaceFolder.uri.fsPath;
  const config = createDefaultConfig(projectPath);
  
  // Get user configuration
  const vsConfig = vscode.workspace.getConfiguration('ccr');
  config.capture.autoCapture = vsConfig.get('autoCapture', true);
  config.capture.includeBrowserHistory = vsConfig.get('includeBrowserHistory', true);
  config.storagePath = vsConfig.get('storagePath', '.ccr');
  config.capture.excludePatterns = vsConfig.get('excludePatterns', config.capture.excludePatterns);

  recorder = new CodeContextRecorder(config);
  
  try {
    await recorder.initialize();
    vscode.window.showInformationMessage('Code Context Recorder initialized');
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to initialize Code Context Recorder: ${error}`
    );
    return;
  }

  // Register commands
  registerCommands(context, recorder);

  // Register tree view providers
  const recentContextProvider = new ContextTreeProvider(recorder, 'recent');
  const fileContextProvider = new ContextTreeProvider(recorder, 'file');
  const statsProvider = new StatsTreeProvider(recorder);

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('ccr.recentContext', recentContextProvider),
    vscode.window.registerTreeDataProvider('ccr.fileContext', fileContextProvider),
    vscode.window.registerTreeDataProvider('ccr.stats', statsProvider)
  );

  // Register hover provider for showing context on hover
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      { scheme: 'file' },
      new ContextHoverProvider(recorder)
    )
  );

  // Watch for active editor changes to update file context view
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        fileContextProvider.refresh();
      }
    })
  );

  // Watch for file saves to potentially capture context
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(async (document) => {
      if (config.capture.autoCapture) {
        // Could prompt for context on save if needed
      }
    })
  );

  // Status bar item
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
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
export async function deactivate() {
  if (recorder) {
    await recorder.close();
  }
}

export function getRecorder(): CodeContextRecorder | null {
  return recorder;
}
