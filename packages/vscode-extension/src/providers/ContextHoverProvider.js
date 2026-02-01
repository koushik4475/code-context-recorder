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
exports.ContextHoverProvider = void 0;
const vscode = __importStar(require("vscode"));
class ContextHoverProvider {
    constructor(recorder) {
        this.recorder = recorder;
    }
    async provideHover(document, position, token) {
        const filePath = vscode.workspace.asRelativePath(document.uri.fsPath);
        const lineNumber = position.line + 1;
        try {
            // Get timeline for this file
            const timeline = await this.recorder.getFileTimeline(filePath);
            // Find contexts that include this line
            const relevantContexts = timeline.entries.filter(entry => {
                return entry.fileAssociations.some(file => {
                    if (file.filePath !== filePath)
                        return false;
                    if (!file.lineStart)
                        return true;
                    if (!file.lineEnd)
                        return lineNumber === file.lineStart;
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
        }
        catch (error) {
            return null;
        }
    }
}
exports.ContextHoverProvider = ContextHoverProvider;
//# sourceMappingURL=ContextHoverProvider.js.map