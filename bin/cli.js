#!/usr/bin/env node

import {generate, generateBatch, getExportFormats} from '../dist/index.js';
import {readFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf8'),
);

function printHelp() {
  console.log(`
@neokaal/codenames - Memorable codename generator for releases, projects, and environments

Usage:
  codenames [options]

Options:
  -c, --count <number>       Number of codenames to generate (default: 1)
  --category <type>          Subject category: all, animals, plants (default: all)
  --casing <format>          Casing style: kebab, snake, camel, pascal, title (default: kebab)
  --json                     Output raw JSON with hex codes and metadata
  --export [version]         Print export snippets (git tag, docker tag, env var)
  -v, --version              Show package version
  -h, --help                 Show this help message

Examples:
  npx @neokaal/codenames
  npx @neokaal/codenames -c 5 --casing pascal
  npx @neokaal/codenames --category animals --casing snake
  npx @neokaal/codenames --json
  npx @neokaal/codenames --export v1.2.0
`);
}

export function runCli(args = process.argv.slice(2)) {
  let count = 1;
  let category = 'all';
  let casing = 'kebab';
  let jsonOutput = false;
  let exportVersion = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '-h' || arg === '--help') {
      printHelp();
      return 0;
    }

    if (arg === '-v' || arg === '--version') {
      console.log(pkg.version);
      return 0;
    }

    if (arg === '--json') {
      jsonOutput = true;
      continue;
    }

    if (arg === '-c' || arg === '--count') {
      const val = parseInt(args[++i], 10);
      if (isNaN(val) || val < 1) {
        console.error('Error: --count must be a positive integer.');
        return 1;
      }
      count = val;
      continue;
    }

    if (arg === '--category') {
      const val = args[++i];
      if (!['all', 'animals', 'plants'].includes(val)) {
        console.error(
          `Error: Invalid category "${val}". Must be one of: all, animals, plants.`,
        );
        return 1;
      }
      category = val;
      continue;
    }

    if (arg === '--casing') {
      const val = args[++i];
      if (!['kebab', 'snake', 'camel', 'pascal', 'title'].includes(val)) {
        console.error(
          `Error: Invalid casing "${val}". Must be one of: kebab, snake, camel, pascal, title.`,
        );
        return 1;
      }
      casing = val;
      continue;
    }

    if (arg === '--export') {
      const nextArg = args[i + 1];
      if (nextArg && !nextArg.startsWith('-')) {
        exportVersion = nextArg;
        i++;
      } else {
        exportVersion = 'v1.0.0';
      }
      continue;
    }

    console.error(`Error: Unknown option "${arg}". Run with --help for usage.`);
    return 1;
  }

  if (count === 1) {
    const item = generate({category, casing});

    if (exportVersion) {
      const formats = getExportFormats(item.slug, exportVersion);
      if (jsonOutput) {
        console.log(JSON.stringify({codename: item, export: formats}, null, 2));
      } else {
        console.log(`Codename: ${item.formatted}`);
        console.log(`Git Tag:  ${formats.gitTag}`);
        console.log(`Docker:   ${formats.dockerTag}`);
        console.log(`Env Var:  ${formats.envVar}`);
      }
      return 0;
    }

    if (jsonOutput) {
      console.log(JSON.stringify(item, null, 2));
    } else {
      console.log(item.formatted);
    }
  } else {
    const items = generateBatch(count, {category, casing});

    if (jsonOutput) {
      console.log(JSON.stringify(items, null, 2));
    } else {
      items.forEach(item => console.log(item.formatted));
    }
  }

  return 0;
}

// Execute directly if invoked via CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const exitCode = runCli();
  if (exitCode !== 0) {
    process.exit(exitCode);
  }
}

