#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const add_1 = require("./commands/add");
const search_1 = require("./commands/search");
const timeline_1 = require("./commands/timeline");
const init_1 = require("./commands/init");
const stats_1 = require("./commands/stats");
const program = new commander_1.Command();
program
    .name('ccr')
    .description('Code Context Recorder - Capture the WHY behind your code')
    .version('0.1.0');
// Init command
program
    .command('init')
    .description('Initialize Code Context Recorder in current directory')
    .action(init_1.initCommand);
// Add context command
program
    .command('add <content>')
    .description('Add context to a file')
    .option('-f, --file <path>', 'File to add context to')
    .option('-l, --line <number>', 'Line number')
    .option('-t, --tags <tags>', 'Comma-separated tags')
    .action(add_1.addContextCommand);
// Search command
program
    .command('search <query>')
    .description('Search contexts')
    .option('-f, --file <pattern>', 'Filter by file pattern')
    .option('-t, --type <type>', 'Filter by context type')
    .option('-l, --limit <number>', 'Limit results', '10')
    .action(search_1.searchCommand);
// Timeline command
program
    .command('timeline <file>')
    .description('Show timeline for a file')
    .action(timeline_1.timelineCommand);
// Stats command
program
    .command('stats')
    .description('Show statistics')
    .action(stats_1.statsCommand);
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
//# sourceMappingURL=index.js.map