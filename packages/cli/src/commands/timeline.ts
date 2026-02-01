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

export async function timelineCommand(filePath: string) {
  try {
    const projectPath = findProjectRoot();
    const config = createDefaultConfig(projectPath);
    const recorder = new CodeContextRecorder(config);
    await recorder.initialize();

    const timeline = await recorder.getFileTimeline(filePath);

    console.log(`Timeline for ${timeline.filePath} (${timeline.totalEntries} entries):\n`);
    timeline.entries.forEach((entry, i) => {
      console.log(`${i + 1}. [${entry.timestamp.toISOString()}] ${entry.type}: ${entry.content.slice(0, 60)}...`);
    });

    await recorder.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}
