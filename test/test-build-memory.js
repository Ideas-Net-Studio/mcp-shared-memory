#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { MemoryService } from './dist/memory.js';

// Clean up test directories
const testCustomDir = './test-custom-memory';
if (fs.existsSync(testCustomDir)) {
  fs.rmSync(testCustomDir, { recursive: true, force: true });
  console.log(`Removed existing directory: ${testCustomDir}`);
}

// Test the buildMemoryStore method directly
async function testBuildMemoryStore() {
  try {
    console.log('Testing buildMemoryStore method...');
    
    // Create a memory service
    const memoryService = new MemoryService('./test-memory');
    
    // Initialize the memory service
    await memoryService.initialize();
    
    // Build a memory store in the custom directory
    await memoryService.buildMemoryStore({
      directory: testCustomDir,
      overwrite: true
    });
    
    console.log(`Memory store built in directory: ${testCustomDir}`);
    
    // Verify the directory structure
    if (fs.existsSync(testCustomDir) && 
        fs.existsSync(`${testCustomDir}/entities`) && 
        fs.existsSync(`${testCustomDir}/concepts`) && 
        fs.existsSync(`${testCustomDir}/sessions`) && 
        fs.existsSync(`${testCustomDir}/metadata.json`) && 
        fs.existsSync(`${testCustomDir}/index.json`) && 
        fs.existsSync(`${testCustomDir}/README.md`)) {
      console.log('Directory structure verified successfully!');
      
      // Print the README.md file
      console.log('\nREADME.md contents:');
      console.log(fs.readFileSync(path.join(testCustomDir, 'README.md'), 'utf-8'));
      
      console.log('\nAll tests completed successfully!');
    } else {
      console.error('Directory structure verification failed!');
      process.exit(1);
    }
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testBuildMemoryStore(); 