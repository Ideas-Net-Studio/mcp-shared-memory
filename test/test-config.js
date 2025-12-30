#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// Configuration detection test for v0.1.1 with multi-tool support
const testDir = './test-config-temp';
const hiddenConfigPath = path.join(testDir, '.mcp-memory.json');
const visibleConfigPath = path.join(testDir, 'mcp-memory.json');

// Cleanup function
function cleanup() {
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
    console.log('🧹 Cleaned up test directory');
  }
}

// Ensure cleanup on exit
process.on('exit', cleanup);
process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});
process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});

// Clean up and create test directory
if (fs.existsSync(testDir)) {
  fs.rmSync(testDir, { recursive: true, force: true });
}

fs.mkdirSync(testDir, { recursive: true });

console.log('=== MCP Memory Server Configuration Test ===\n');

// Test 1: Hidden configuration
console.log('1. Testing hidden configuration (.mcp-memory.json)...');
const hiddenConfig = {
  memoryDir: '.context/memory',
  enabled: true,
  description: 'Test project'
};
fs.writeFileSync(hiddenConfigPath, JSON.stringify(hiddenConfig, null, 2));

const result1 = spawn('node', ['../dist/index.js'], {
  cwd: testDir,
  stdio: ['pipe', 'pipe', 'pipe'],
  timeout: 3000
});

let output1 = '';
result1.stdout.on('data', (data) => {
  output1 += data.toString();
});
result1.stderr.on('data', (data) => {
  output1 += data.toString();
});

result1.on('close', (code) => {
  const hiddenTest = output1.includes('Using project memory directory') && 
                   output1.includes('.context/memory');
  console.log(hiddenTest ? '✅ Hidden config test PASSED' : '❌ Hidden config test FAILED');
  
  // Test 2: Visible configuration
  console.log('\n2. Testing visible configuration (mcp-memory.json)...');
  fs.rmSync(hiddenConfigPath);
  
  const visibleConfig = {
    memoryDir: 'memory',
    enabled: true,
    description: 'Test project'
  };
  fs.writeFileSync(visibleConfigPath, JSON.stringify(visibleConfig, null, 2));
  
  const result2 = spawn('node', ['../dist/index.js'], {
    cwd: testDir,
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 3000
  });
  
  let output2 = '';
  result2.stdout.on('data', (data) => {
    output2 += data.toString();
  });
  result2.stderr.on('data', (data) => {
    output2 += data.toString();
  });
  
  result2.on('close', (code2) => {
    const visibleTest = output2.includes('Using project memory directory') && 
                       output2.includes('memory');
    console.log(visibleTest ? '✅ Visible config test PASSED' : '❌ Visible config test FAILED');
    
    // Test 3: No configuration (global)
    console.log('\n3. Testing no configuration (global memory)...');
    fs.rmSync(visibleConfigPath);
    
    const result3 = spawn('node', ['../dist/index.js'], {
      cwd: testDir,
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 3000
    });
    
    let output3 = '';
    result3.stdout.on('data', (data) => {
      output3 += data.toString();
    });
    result3.stderr.on('data', (data) => {
      output3 += data.toString();
    });
    
    result3.on('close', (code3) => {
      const globalTest = output3.includes('Using global memory directory');
      console.log(globalTest ? '✅ Global config test PASSED' : '❌ Global config test FAILED');
      
      // Summary
      const allPassed = hiddenTest && visibleTest && globalTest;
      console.log('\n=== Test Summary ===');
      console.log(allPassed ? '🎉 All tests PASSED!' : '❌ Some tests FAILED');
      
      // Clean up
      fs.rmSync(testDir, { recursive: true, force: true });
      console.log('🧹 Cleaned up test directory');
      
      if (!allPassed) {
        process.exit(1);
      }
    });
    
    // Send a request to trigger output
    setTimeout(() => {
      result3.stdin.write('{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}\n');
      result3.stdin.end();
    }, 100);
  });
  
  // Send a request to trigger output
  setTimeout(() => {
    result2.stdin.write('{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}\n');
    result2.stdin.end();
  }, 100);
});

// Send a request to trigger output
setTimeout(() => {
  result1.stdin.write('{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}\n');
  result1.stdin.end();
}, 100);
