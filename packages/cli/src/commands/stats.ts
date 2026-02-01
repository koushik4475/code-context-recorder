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

export async function statsCommand() {
  try {
    const projectPath = findProjectRoot();
    const config = createDefaultConfig(projectPath);
    const recorder = new CodeContextRecorder(config);
    await recorder.initialize();

    const analytics = await recorder.getAnalytics();

    console.log('📊 Code Context Recorder Statistics\n');
    console.log(`Total contexts: ${analytics.totalContexts}`);
    console.log('\nBy type:');
    Object.entries(analytics.contextsByType).forEach(([type, count]) => {
      if (count > 0) console.log(`  ${type}: ${count}`);
    });
    console.log('\nMost contexted files:');
    analytics.mostContextedFiles.slice(0, 5).forEach(({ file, count }) => {
      console.log(`  ${file}: ${count}`);
    });

    await recorder.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}
