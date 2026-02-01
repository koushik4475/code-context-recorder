import { CodeContextRecorder, createDefaultConfig } from '@ccr/core';
import * as fs from 'fs';
import * as path from 'path';

function findProjectRoot(): string {
  let currentDir = process.cwd();
  while (currentDir !== path.dirname(currentDir)) {
    if (fs.existsSync(path.join(currentDir, '.git'))) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }
  return process.cwd();
}

export async function searchCommand(
  query: string,
  options: { file?: string; type?: string; limit?: string }
) {
  try {
    const projectPath = findProjectRoot();
    const config = createDefaultConfig(projectPath);
    const recorder = new CodeContextRecorder(config);
    await recorder.initialize();

    const results = await recorder.search(query, {
      filePattern: options.file,
      limit: options.limit ? parseInt(options.limit, 10) : 10
    });

    if (results.length === 0) {
      console.log('No contexts found.');
    } else {
      console.log(`Found ${results.length} context(s):\n`);
      results.forEach((r, i) => {
        console.log(`${i + 1}. [${r.type}] ${r.content.slice(0, 80)}...`);
        console.log(`   Files: ${r.fileAssociations.map((f) => f.filePath).join(', ')}`);
      });
    }

    await recorder.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}
