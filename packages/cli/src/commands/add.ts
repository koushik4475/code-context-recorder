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
    const filePath = options.file;
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
      lineNumber: options.line ? parseInt(options.line, 10) : undefined,
      tags
    });

    console.log('✅ Context added successfully');

    await recorder.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

function findProjectRoot(startDir: string = process.cwd()): string {
  const fallbackDir = path.resolve(startDir);
  let currentDir = fallbackDir;

  // Compare each directory with its parent instead of assuming a POSIX root.
  // On Windows, the filesystem root is a drive path such as C:\, not '/'.
  while (true) {
    if (fs.existsSync(path.join(currentDir, '.git'))) {
      return currentDir;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
  }

  return fallbackDir;
}
