#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json to get version
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const version = packageJson.version;

console.log(`Injecting version ${version} into built code...`);

// Read the compiled index.js
const indexPath = path.join(__dirname, '../dist/index.js');
let content = fs.readFileSync(indexPath, 'utf-8');

// Replace the package.json loading code with hardcoded version
const pattern = /\/\/ Load version from package\.json\nconst packageJsonPath = path\.join\(__dirname, '\.\.\/package\.json'\);\nconst packageJson = JSON\.parse\(fs\.readFileSync\(packageJsonPath, 'utf-8'\)\);\nconst CURRENT_VERSION = packageJson\.version;/;

const replacement = `// Version injected at build time
const CURRENT_VERSION = "${version}";`;

if (!pattern.test(content)) {
  console.error('⚠️  Warning: Could not find version loading code to replace');
  console.error('This might mean the pattern has changed. Please update the inject-version.js script.');
  process.exit(1);
}

content = content.replace(pattern, replacement);

// Write back
fs.writeFileSync(indexPath, content, 'utf-8');

console.log('✅ Version injected successfully');
