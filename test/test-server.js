#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Test configuration for v0.1.1
const testDir = './test-server-temp';
const configPath = path.join(testDir, '.mcp-memory.json');

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
  console.log(`Removed existing directory: ${testDir}`);
}

fs.mkdirSync(testDir, { recursive: true });
console.log(`Created test directory: ${testDir}`);

// Create project configuration
const config = {
  memoryDir: '.context/memory',
  enabled: true,
  description: 'Test project for server functionality'
};

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('Created project configuration');

// Function to send a request to the MCP server
async function sendRequest(request) {
  return new Promise((resolve, reject) => {
    const server = spawn('node', ['../dist/index.js'], {
      cwd: testDir,
      stdio: ['pipe', 'pipe', 'inherit']
    });
    
    let responseData = '';
    
    server.stdout.on('data', (data) => {
      responseData += data.toString();
    });
    
    server.on('error', (error) => {
      reject(error);
    });
    
    server.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Server exited with code ${code}`));
      } else {
        try {
          const response = JSON.parse(responseData.trim());
          resolve(response);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}\nRaw response: ${responseData}`));
        }
      }
    });
    
    server.stdin.write(JSON.stringify(request) + '\n');
    server.stdin.end();
  });
}

// Test the server
async function testServer() {
  try {
    console.log('Testing MCP server with project configuration...');
    
    // Test 1: List tools
    console.log('\n1. Testing tools list...');
    const listToolsRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list'
    };
    
    const toolsResponse = await sendRequest(listToolsRequest);
    console.log('✅ Tools list response received');
    console.log(`Found ${toolsResponse.tools?.length || 0} tools`);
    
    // Test 2: Create a memory
    console.log('\n2. Testing memory creation...');
    const createMemoryRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'create_memory',
        arguments: {
          title: 'Test Memory',
          type: 'concept',
          tags: ['test', 'server'],
          content: 'This is a test memory created by the server test.'
        }
      }
    };
    
    const createResponse = await sendRequest(createMemoryRequest);
    console.log('✅ Memory creation response received');
    
    // Test 3: Search memories
    console.log('\n3. Testing memory search...');
    const searchRequest = {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'search_memories',
        arguments: {
          query: 'test'
        }
      }
    };
    
    const searchResponse = await sendRequest(searchRequest);
    console.log('✅ Memory search response received');
    
    // Test 4: List memories
    console.log('\n4. Testing memory listing...');
    const listRequest = {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'list_memories',
        arguments: {
          types: ['concept']
        }
      }
    };
    
    const listResponse = await sendRequest(listRequest);
    console.log('✅ Memory list response received');
    
    console.log('\n🎉 All server tests PASSED!');
    
    // Clean up
    fs.rmSync(testDir, { recursive: true, force: true });
    console.log('🧹 Cleaned up test directory');
    
  } catch (error) {
    console.error('❌ Server test FAILED:', error.message);
    process.exit(1);
  }
}

// Run the test
testServer(); 