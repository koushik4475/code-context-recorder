import * as vscode from 'vscode';
import { CodeContextRecorder } from '@ccr/core';

export class ContextHoverProvider implements vscode.HoverProvider {
  constructor(private recorder: CodeContextRecorder) {}

  async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Hover | null> {
    const filePath = vscode.workspace.asRelativePath(document.uri.fsPath);
    const lineNumber = position.line + 1;

    try {
      // Get timeline for this file
      const timeline = await this.recorder.getFileTimeline(filePath);
      
      // Find contexts that include this line
      const relevantContexts = timeline.entries.filter(entry => {
        return entry.fileAssociations.some(file => {
          if (file.filePath !== filePath) return false;
          if (!file.lineStart) return true;
          if (!file.lineEnd) return lineNumber === file.lineStart;
          return lineNumber >= file.lineStart && lineNumber <= file.lineEnd;
        });
      });

      if (relevantContexts.length === 0) {
        return null;
      }

      // Create markdown content
      const markdown = new vscode.MarkdownString();
      markdown.isTrusted = true;
      markdown.supportHtml = true;

      markdown.appendMarkdown('### 📝 Code Context\n\n');

      for (const ctx of relevantContexts.slice(0, 3)) {
        markdown.appendMarkdown(`**${ctx.type}** *(${ctx.timestamp.toLocaleDateString()})*\n\n`);
        markdown.appendMarkdown(`${ctx.content}\n\n`);
        
        if (ctx.tags.length > 0) {
          markdown.appendMarkdown(`*Tags: ${ctx.tags.join(', ')}*\n\n`);
        }
        
        markdown.appendMarkdown('---\n\n');
      }

      if (relevantContexts.length > 3) {
        markdown.appendMarkdown(`*+${relevantContexts.length - 3} more contexts*\n`);
      }

      return new vscode.Hover(markdown);
    } catch (error) {
      return null;
    }
  }
}
