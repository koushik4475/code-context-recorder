#!/usr/bin/env node

import { Command } from 'commander';
import { addContextCommand } from './commands/add';
import { searchCommand } from './commands/search';
import { timelineCommand } from './commands/timeline';
import { initCommand } from './commands/init';
import { statsCommand } from './commands/stats';

const program = new Command();

program
  .name('ccr')
  .description('Code Context Recorder - Capture the WHY behind your code')
  .version('0.1.0');

// Init command
program
  .command('init')
  .description('Initialize Code Context Recorder in current directory')
  .action(initCommand);

// Add context command
program
  .command('add <content>')
  .description('Add context to a file')
  .option('-f, --file <path>', 'File to add context to')
  .option('-l, --line <number>', 'Line number')
  .option('-t, --tags <tags>', 'Comma-separated tags')
  .action(addContextCommand);

// Search command
program
  .command('search <query>')
  .description('Search contexts')
  .option('-f, --file <pattern>', 'Filter by file pattern')
  .option('-t, --type <type>', 'Filter by context type')
  .option('-l, --limit <number>', 'Limit results', '10')
  .action(searchCommand);

// Timeline command
program
  .command('timeline <file>')
  .description('Show timeline for a file')
  .action(timelineCommand);

// Stats command
program
  .command('stats')
  .description('Show statistics')
  .action(statsCommand);

// Voice command (placeholder)
program
  .command('voice')
  .description('Record voice note')
  .option('-f, --file <path>', 'File to add voice note to')
  .action(() => {
    console.log('Voice recording coming soon!');
  });

// Web command (placeholder)
program
  .command('web')
  .description('Open web viewer')
  .action(() => {
    console.log('Web viewer coming soon!');
  });

program.parse();
