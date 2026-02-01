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
exports.addContextCommand = addContextCommand;
const core_1 = require("@ccr/core");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function addContextCommand(content, options) {
    try {
        // Find project root
        const projectPath = findProjectRoot();
        const config = (0, core_1.createDefaultConfig)(projectPath);
        const recorder = new core_1.CodeContextRecorder(config);
        await recorder.initialize();
        // Get current file from git if not provided
        let filePath = options.file;
        if (!filePath) {
            console.error('Please specify a file with --file');
            process.exit(1);
        }
        // Parse tags
        const tags = options.tags
            ? options.tags.split(',').map(t => t.trim())
            : [];
        // Add context
        await recorder.addContext(content, filePath, {
            type: core_1.ContextType.TEXT,
            lineNumber: options.line ? parseInt(options.line) : undefined,
            tags
        });
        console.log('✅ Context added successfully');
        await recorder.close();
    }
    catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}
function findProjectRoot() {
    let currentDir = process.cwd();
    while (currentDir !== '/') {
        if (fs.existsSync(path.join(currentDir, '.git'))) {
            return currentDir;
        }
        currentDir = path.dirname(currentDir);
    }
    return process.cwd();
}
//# sourceMappingURL=add.js.map