#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// Test configuration for v0.1.1 with multi-tool support
const testDir = './test-temp';
const hiddenConfigPath = path.join(testDir, '.mcp-memory.json');
const visibleConfigPath = path.join(testDir, 'mcp-memory.json');

// Cleanup function
function cleanup() {
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
    console.log('\n🧹 Cleaned up test directory');
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
  console.log(`Removed existing directory: ${testDir}`);
}

fs.mkdirSync(testDir, { recursive: true });
console.log(`Created test directory: ${testDir}`);

// Test 1: Hidden Configuration
console.log('\n=== Test 1: Hidden Configuration (.mcp-memory.json) ===');

const hiddenConfig = {
  memoryDir: '.context/memory',
  enabled: true,
  description: 'Test project with hidden configuration'
};

fs.writeFileSync(hiddenConfigPath, JSON.stringify(hiddenConfig, null, 2));
console.log('Created .mcp-memory.json configuration');

// Test server with hidden config
const server1 = spawn('node', ['../dist/index.js'], {
  cwd: testDir,
  stdio: ['pipe', 'pipe', process.stderr]
});

let hiddenConfigTestPassed = false;

server1.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('Hidden config server output:', output.trim());
  
  if (output.includes('Using project memory directory') && output.includes('.context/memory')) {
    hiddenConfigTestPassed = true;
    console.log('✅ Hidden configuration test PASSED');
  }
  
  // Also check for the tools list response
  if (output.includes('"result":{"tools"')) {
    console.log('✅ Server responded with tools list');
  }
});

server1.on('close', (code) => {
  console.log(`Hidden config server exited with code: ${code}`);
  
  // Test 2: Visible Configuration
  console.log('\n=== Test 2: Visible Configuration (mcp-memory.json) ===');
  
  // Remove hidden config and create visible config
  fs.rmSync(hiddenConfigPath);
  
  const visibleConfig = {
    memoryDir: 'memory',
    enabled: true,
    description: 'Test project with visible configuration'
  };
  
  fs.writeFileSync(visibleConfigPath, JSON.stringify(visibleConfig, null, 2));
  console.log('Created mcp-memory.json configuration');
  
  // Test server with visible config
  const server2 = spawn('node', ['../dist/index.js'], {
    cwd: testDir,
    stdio: ['pipe', 'pipe', process.stderr]
  });
  
  let visibleConfigTestPassed = false;
  
  server2.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('Visible config server output:', output.trim());
    
    if (output.includes('Using project memory directory') && output.includes('memory')) {
      visibleConfigTestPassed = true;
      console.log('✅ Visible configuration test PASSED');
    }
  });
  
  server2.on('close', (code2) => {
    console.log(`Visible config server exited with code: ${code2}`);
    
    // Test 3: No Configuration (Global Memory)
    console.log('\n=== Test 3: No Configuration (Global Memory) ===');
    
    // Remove visible config
    fs.rmSync(visibleConfigPath);
    console.log('Removed configuration files');
    
    // Test server with no config (should use global memory)
    const server3 = spawn('node', ['../dist/index.js'], {
      cwd: testDir,
      stdio: ['pipe', 'pipe', process.stderr]
    });
    
    let globalConfigTestPassed = false;
    
    server3.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('No config server output:', output.trim());
      
      if (output.includes('Using global memory directory')) {
        globalConfigTestPassed = true;
        console.log('✅ Global configuration test PASSED');
      }
    });
    
    server3.on('close', (code3) => {
      console.log(`No config server exited with code: ${code3}`);
      
      // Test 4: Priority Test (both files exist)
      console.log('\n=== Test 4: Priority Test (Both Files Exist) ===');
      
      // Create both configs - hidden should take precedence
      fs.writeFileSync(hiddenConfigPath, JSON.stringify(hiddenConfig, null, 2));
      fs.writeFileSync(visibleConfigPath, JSON.stringify(visibleConfig, null, 2));
      console.log('Created both configuration files');
      
      const server4 = spawn('node', ['../dist/index.js'], {
        cwd: testDir,
        stdio: ['pipe', 'pipe', process.stderr]
      });
      
      let priorityTestPassed = false;
      
      server4.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('Priority test server output:', output.trim());
        
        if (output.includes('Found configuration at:') && output.includes('.mcp-memory.json')) {
          priorityTestPassed = true;
          console.log('✅ Priority test PASSED (hidden config takes precedence)');
        }
      });
      
      server4.on('close', (code4) => {
        console.log(`Priority test server exited with code: ${code4}`);
        
        // Summary
        console.log('\n=== Test Summary ===');
        console.log(`Hidden config test: ${hiddenConfigTestPassed ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`Visible config test: ${visibleConfigTestPassed ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`Global config test: ${globalConfigTestPassed ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`Priority test: ${priorityTestPassed ? '✅ PASSED' : '❌ FAILED'}`);
        
        const allTestsPassed = hiddenConfigTestPassed && visibleConfigTestPassed && globalConfigTestPassed && priorityTestPassed;
        
        if (allTestsPassed) {
          console.log('\n🎉 All tests PASSED! MCP Memory Server v0.1.1 is working correctly.');
        } else {
          console.log('\n❌ Some tests FAILED. Please check the implementation.');
          process.exit(1);
        }
        
        // Clean up
        fs.rmSync(testDir, { recursive: true, force: true });
        console.log('\n🧹 Cleaned up test directory');
      });
      
      // Send a simple request to trigger the server
      setTimeout(() => {
        server4.stdin.write('{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}\n');
        server4.stdin.end();
      }, 100);
    });
    
    // Send a simple request to trigger the server
    setTimeout(() => {
      server3.stdin.write('{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}\n');
      server3.stdin.end();
    }, 100);
  });
});

// Send a simple request to trigger the server
setTimeout(() => {
  server1.stdin.write('{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}\n');
  server1.stdin.end();
}, 100);
