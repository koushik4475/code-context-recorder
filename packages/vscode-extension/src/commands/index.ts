import * as vscode from 'vscode';
import { CodeContextRecorder, ContextType } from '@ccr/core';
import * as path from 'path';

/**
 * Register all VS Code commands
 */
export function registerCommands(
  context: vscode.ExtensionContext,
  recorder: CodeContextRecorder
): void {
  
  // Add Context
  context.subscriptions.push(
    vscode.commands.registerCommand('ccr.addContext', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
      }

      const filePath = vscode.workspace.asRelativePath(editor.document.uri.fsPath);
      const lineNumber = editor.selection.active.line + 1;

      const content = await vscode.window.showInputBox({
        prompt: 'Enter context for this code',
        placeHolder: 'Why did you write this code? What was the reasoning?',
        ignoreFocusOut: true
      });

      if (!content) return;

      // Ask for tags
      const tagsInput = await vscode.window.showInputBox({
        prompt: 'Add tags (comma-separated, optional)',
        placeHolder: 'bug-fix, performance, refactor',
        ignoreFocusOut: true
      });

      const tags = tagsInput
        ? tagsInput.split(',').map(t => t.trim()).filter(Boolean)
        : [];

      try {
        await recorder.addContext(content, filePath, {
          type: ContextType.TEXT,
          lineNumber,
          tags
        });

        vscode.window.showInformationMessage('Context added successfully');
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to add context: ${error}`);
      }
    })
  );

  // Add Voice Note
  context.subscriptions.push(
    vscode.commands.registerCommand('ccr.addVoiceNote', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
      }

      vscode.window.showInformationMessage(
        'Voice recording feature coming soon! For now, add text context instead.'
      );
      
      // TODO: Implement voice recording
      // This would use browser's MediaRecorder API or a native module
    })
  );

  // View Timeline
  context.subscriptions.push(
    vscode.commands.registerCommand('ccr.viewTimeline', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
      }

      const filePath = vscode.workspace.asRelativePath(editor.document.uri.fsPath);
      
      try {
        const timeline = await recorder.getFileTimeline(filePath);
        
        if (timeline.entries.length === 0) {
          vscode.window.showInformationMessage('No context found for this file');
          return;
        }

        // Create webview panel to show timeline
        const panel = vscode.window.createWebviewPanel(
          'ccr.timeline',
          `Timeline: ${path.basename(filePath)}`,
          vscode.ViewColumn.Two,
          { enableScripts: true }
        );

        panel.webview.html = getTimelineHtml(timeline, filePath);
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to get timeline: ${error}`);
      }
    })
  );

  // Search Context
  context.subscriptions.push(
    vscode.commands.registerCommand('ccr.search', async () => {
      const query = await vscode.window.showInputBox({
        prompt: 'Search context',
        placeHolder: 'Enter search query...',
        ignoreFocusOut: true
      });

      if (!query) return;

      try {
        const results = await recorder.search(query, { limit: 20 });
        
        if (results.length === 0) {
          vscode.window.showInformationMessage('No results found');
          return;
        }

        // Show results in quick pick
        const items = results.map(ctx => ({
          label: `$(note) ${ctx.content.substring(0, 60)}...`,
          description: ctx.fileAssociations[0]?.filePath || '',
          detail: `${ctx.type} - ${ctx.timestamp.toLocaleString()}`,
          context: ctx
        }));

        const selected = await vscode.window.showQuickPick(items, {
          placeHolder: `Found ${results.length} results`
        });

        if (selected && selected.context.fileAssociations[0]) {
          // Open file at line
          const file = selected.context.fileAssociations[0];
          const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
          if (workspaceFolder) {
            const uri = vscode.Uri.file(
              path.join(workspaceFolder.uri.fsPath, file.filePath)
            );
            const doc = await vscode.workspace.openTextDocument(uri);
            const editor = await vscode.window.showTextDocument(doc);
            
            if (file.lineStart) {
              const line = file.lineStart - 1;
              editor.selection = new vscode.Selection(line, 0, line, 0);
              editor.revealRange(new vscode.Range(line, 0, line, 0));
            }
          }
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Search failed: ${error}`);
      }
    })
  );

  // Add Decision
  context.subscriptions.push(
    vscode.commands.registerCommand('ccr.addDecision', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
      }

      const decision = await vscode.window.showInputBox({
        prompt: 'What decision did you make?',
        placeHolder: 'e.g., Use PostgreSQL instead of MongoDB',
        ignoreFocusOut: true
      });

      if (!decision) return;

      const reasoning = await vscode.window.showInputBox({
        prompt: 'What was the reasoning?',
        placeHolder: 'e.g., Better ACID guarantees for our use case',
        ignoreFocusOut: true,
        value: ''
      });

      if (!reasoning) return;

      const filePath = vscode.workspace.asRelativePath(editor.document.uri.fsPath);

      try {
        await recorder.addDecision(decision, reasoning, [filePath]);
        vscode.window.showInformationMessage('Decision recorded');
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to record decision: ${error}`);
      }
    })
  );

  // Link Ticket
  context.subscriptions.push(
    vscode.commands.registerCommand('ccr.linkTicket', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
      }

      const ticketId = await vscode.window.showInputBox({
        prompt: 'Ticket/Issue ID',
        placeHolder: 'e.g., JIRA-123, #456',
        ignoreFocusOut: true
      });

      if (!ticketId) return;

      const ticketUrl = await vscode.window.showInputBox({
        prompt: 'Ticket URL',
        placeHolder: 'https://...',
        ignoreFocusOut: true
      });

      if (!ticketUrl) return;

      const filePath = vscode.workspace.asRelativePath(editor.document.uri.fsPath);

      try {
        await recorder.linkTicket(ticketId, ticketUrl, filePath);
        vscode.window.showInformationMessage('Ticket linked');
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to link ticket: ${error}`);
      }
    })
  );

  // Show Recent Context
  context.subscriptions.push(
    vscode.commands.registerCommand('ccr.showRecent', async () => {
      const recent = await recorder.getRecent(10);
      
      const items = recent.map(ctx => ({
        label: `$(note) ${ctx.content.substring(0, 60)}...`,
        description: ctx.fileAssociations[0]?.filePath || '',
        detail: ctx.timestamp.toLocaleString()
      }));

      await vscode.window.showQuickPick(items, {
        placeHolder: 'Recent context entries'
      });
    })
  );

  // Show Analytics
  context.subscriptions.push(
    vscode.commands.registerCommand('ccr.showAnalytics', async () => {
      try {
        const analytics = await recorder.getAnalytics();
        
        const panel = vscode.window.createWebviewPanel(
          'ccr.analytics',
          'Code Context Analytics',
          vscode.ViewColumn.One,
          { enableScripts: true }
        );

        panel.webview.html = getAnalyticsHtml(analytics);
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to get analytics: ${error}`);
      }
    })
  );

  // Open Web Viewer
  context.subscriptions.push(
    vscode.commands.registerCommand('ccr.openWebViewer', () => {
      vscode.window.showInformationMessage(
        'Web viewer coming soon! Use the timeline and search commands for now.'
      );
      // TODO: Launch local web server
    })
  );
}

function getTimelineHtml(timeline: any, filePath: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { 
          font-family: var(--vscode-font-family);
          padding: 20px;
          color: var(--vscode-foreground);
        }
        .timeline-entry {
          border-left: 2px solid var(--vscode-textLink-foreground);
          padding-left: 20px;
          margin-bottom: 30px;
          position: relative;
        }
        .timeline-entry::before {
          content: '';
          position: absolute;
          left: -6px;
          top: 0;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--vscode-textLink-foreground);
        }
        .timestamp {
          color: var(--vscode-descriptionForeground);
          font-size: 0.9em;
        }
        .type-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 3px;
          font-size: 0.8em;
          background: var(--vscode-badge-background);
          color: var(--vscode-badge-foreground);
        }
        .content {
          margin-top: 10px;
          white-space: pre-wrap;
        }
        .tags {
          margin-top: 10px;
        }
        .tag {
          display: inline-block;
          padding: 2px 6px;
          margin-right: 5px;
          background: var(--vscode-input-background);
          border-radius: 3px;
          font-size: 0.85em;
        }
      </style>
    </head>
    <body>
      <h1>Timeline: ${filePath}</h1>
      <p>${timeline.totalEntries} context entries</p>
      ${timeline.entries.map((entry: any) => `
        <div class="timeline-entry">
          <div>
            <span class="type-badge">${entry.type}</span>
            <span class="timestamp">${new Date(entry.timestamp).toLocaleString()}</span>
          </div>
          <div class="content">${entry.content}</div>
          ${entry.tags.length > 0 ? `
            <div class="tags">
              ${entry.tags.map((tag: string) => `<span class="tag">${tag}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </body>
    </html>
  `;
}

function getAnalyticsHtml(analytics: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: var(--vscode-font-family);
          padding: 20px;
          color: var(--vscode-foreground);
        }
        .stat-card {
          background: var(--vscode-input-background);
          padding: 15px;
          margin-bottom: 15px;
          border-radius: 5px;
        }
        .stat-value {
          font-size: 2em;
          font-weight: bold;
          color: var(--vscode-textLink-foreground);
        }
        .stat-label {
          color: var(--vscode-descriptionForeground);
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th, td {
          padding: 8px;
          text-align: left;
          border-bottom: 1px solid var(--vscode-panel-border);
        }
      </style>
    </head>
    <body>
      <h1>Code Context Analytics</h1>
      
      <div class="stat-card">
        <div class="stat-value">${analytics.totalContexts}</div>
        <div class="stat-label">Total Context Entries</div>
      </div>

      <div class="stat-card">
        <div class="stat-value">${analytics.averageContextsPerCommit.toFixed(1)}</div>
        <div class="stat-label">Average Contexts per Commit</div>
      </div>

      <h2>Most Documented Files</h2>
      <table>
        <tr><th>File</th><th>Contexts</th></tr>
        ${analytics.mostContextedFiles.slice(0, 10).map((f: any) => `
          <tr><td>${f.file}</td><td>${f.count}</td></tr>
        `).join('')}
      </table>

      <h2>Top Contributors</h2>
      <table>
        <tr><th>Author</th><th>Contexts</th></tr>
        ${analytics.topAuthors.map((a: any) => `
          <tr><td>${a.author}</td><td>${a.count}</td></tr>
        `).join('')}
      </table>
    </body>
    </html>
  `;
}
