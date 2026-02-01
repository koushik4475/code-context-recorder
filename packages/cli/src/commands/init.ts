import { createDefaultConfig } from '@ccr/core';
import * as fs from 'fs';
import * as path from 'path';

export async function initCommand() {
  try {
    const projectPath = process.cwd();
    const config = createDefaultConfig(projectPath);

    const ccrDir = path.join(projectPath, '.ccr');
    if (!fs.existsSync(ccrDir)) {
      fs.mkdirSync(ccrDir, { recursive: true });
      console.log('✅ Created .ccr directory');
    }

    const configPath = path.join(projectPath, '.ccrrc.json');
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(
        configPath,
        JSON.stringify(
          {
            storagePath: config.storagePath,
            storageType: config.storageType,
            capture: config.capture
          },
          null,
          2
        )
      );
      console.log('✅ Created .ccrrc.json');
    }

    console.log('✅ Code Context Recorder initialized in', projectPath);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}
