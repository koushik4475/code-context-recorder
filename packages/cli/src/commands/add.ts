import { CodeContextRecorder, createDefaultConfig, ContextType } from '@ccr/core';
import * as fs from 'fs';
import * as path from 'path';

export async function addContextCommand(
  content: string,
  options: {
    file?: string;
    line?: string;
    tags?: string;
  }
) {
  try {
    // Find project root
    const projectPath = findProjectRoot();
    const config = createDefaultConfig(projectPath);
    
    const recorder = new CodeContextRecorder(config);
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
      type: ContextType.TEXT,
      lineNumber: options.line ? parseInt(options.line) : undefined,
      tags
    });

    console.log('✅ Context added successfully');
    
    await recorder.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

function findProjectRoot(): string {
  let currentDir = process.cwd();
  
  while (currentDir !== '/') {
    if (fs.existsSync(path.join(currentDir, '.git'))) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }
  
  return process.cwd();
}
