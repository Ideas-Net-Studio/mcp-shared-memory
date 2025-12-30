#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Test configuration for version tools
const testDir = './test-version-temp';
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
  description: 'Test project for version tools'
};

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('Created project configuration');

// Function to send a request to the MCP server
async function sendRequest(request, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const server = spawn('node', ['../dist/index.js'], {
      cwd: testDir,
      stdio: ['pipe', 'pipe', 'pipe'] // Capture stderr separately
    });
    
    let responseData = '';
    let stderrData = '';
    let resolved = false;
    
    // Set timeout to prevent hanging
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        server.kill('SIGTERM');
        reject(new Error(`Request timeout after ${timeoutMs}ms. Stderr: ${stderrData}`));
      }
    }, timeoutMs);
    
    server.stdout.on('data', (data) => {
      responseData += data.toString();
      
      // Try to parse response as soon as we get data
      try {
        const lines = responseData.split('\n').filter(line => line.trim());
        for (const line of lines) {
          try {
            const response = JSON.parse(line);
            if (response.id === request.id) {
              if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                server.kill('SIGTERM');
                resolve(response);
              }
              return;
            }
          } catch (e) {
            // Not valid JSON yet, continue
          }
        }
      } catch (e) {
        // Continue accumulating data
      }
    });
    
    server.stderr.on('data', (data) => {
      stderrData += data.toString();
    });
    
    server.on('error', (error) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        reject(error);
      }
    });
    
    server.on('close', (code) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        
        if (responseData.trim()) {
          try {
            const lines = responseData.split('\n').filter(line => line.trim());
            for (const line of lines) {
              try {
                const response = JSON.parse(line);
                if (response.id === request.id) {
                  resolve(response);
                  return;
                }
              } catch (e) {
                // Continue
              }
            }
            reject(new Error(`No matching response found. Got: ${responseData}`));
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}\nRaw: ${responseData}`));
          }
        } else {
          reject(new Error(`Server closed with no response. Exit code: ${code}\nStderr: ${stderrData}`));
        }
      }
    });
    
    // Send request
    try {
      server.stdin.write(JSON.stringify(request) + '\n');
      server.stdin.end();
    } catch (error) {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        reject(error);
      }
    }
  });
}

// Test the version tools
async function testVersionTools() {
  try {
    console.log('Testing version management tools...\n');
    
    // Test 1: whats_new tool
    console.log('1. Testing whats_new tool...');
    const whatsNewRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'whats_new',
        arguments: {}
      }
    };
    
    const whatsNewResponse = await sendRequest(whatsNewRequest);
    
    if (!whatsNewResponse.result || !whatsNewResponse.result.content) {
      throw new Error('whats_new tool returned invalid response');
    }
    
    const whatsNewContent = whatsNewResponse.result.content[0].text;
    
    // Verify response contains expected information
    if (!whatsNewContent.includes('v0.1.2')) {
      throw new Error('whats_new response missing version information');
    }
    if (!whatsNewContent.includes('New in v0.1.2')) {
      throw new Error('whats_new response missing new features section');
    }
    if (!whatsNewContent.includes('Multi-Tool Compatibility')) {
      throw new Error('whats_new response missing core features');
    }
    
    console.log('✅ whats_new tool works correctly');
    console.log(`   Response length: ${whatsNewContent.length} characters`);
    
    // Test 2: check_updates tool
    console.log('\n2. Testing check_updates tool...');
    const checkUpdatesRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'check_updates',
        arguments: {}
      }
    };
    
    const checkUpdatesResponse = await sendRequest(checkUpdatesRequest);
    
    if (!checkUpdatesResponse.result || !checkUpdatesResponse.result.content) {
      throw new Error('check_updates tool returned invalid response');
    }
    
    const updateContent = checkUpdatesResponse.result.content[0].text;
    
    // Verify response contains expected information
    if (!updateContent.includes('v0.1.2')) {
      throw new Error('check_updates response missing version information');
    }
    if (!updateContent.includes('npx')) {
      throw new Error('check_updates response missing update instructions');
    }
    if (!updateContent.includes('GitHub Releases')) {
      throw new Error('check_updates response missing release information');
    }
    
    console.log('✅ check_updates tool works correctly');
    console.log(`   Response length: ${updateContent.length} characters`);
    
    // Test 3: Verify tools are listed
    console.log('\n3. Verifying version tools are in tools list...');
    const listToolsRequest = {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/list'
    };
    
    const toolsResponse = await sendRequest(listToolsRequest);
    const tools = toolsResponse.result.tools;
    
    const hasWhatsNew = tools.some(tool => tool.name === 'whats_new');
    const hasCheckUpdates = tools.some(tool => tool.name === 'check_updates');
    
    if (!hasWhatsNew) {
      throw new Error('whats_new tool not found in tools list');
    }
    if (!hasCheckUpdates) {
      throw new Error('check_updates tool not found in tools list');
    }
    
    console.log('✅ Both version tools are properly registered');
    console.log(`   Total tools available: ${tools.length}`);
    
    console.log('\n🎉 All version tool tests PASSED!');
    console.log('\nTest Summary:');
    console.log('  ✅ whats_new tool responds correctly');
    console.log('  ✅ check_updates tool responds correctly');
    console.log('  ✅ Both tools are registered in tools list');
    console.log('  ✅ Responses contain expected version information');
    
    // Clean up
    cleanup();
    
  } catch (error) {
    console.error('\n❌ Version tools test FAILED:', error.message);
    cleanup();
    process.exit(1);
  }
}

// Run the test
testVersionTools();
