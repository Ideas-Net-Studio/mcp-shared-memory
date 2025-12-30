#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the message utilities (using dynamic import for ES modules)
let messageUtils;

console.log('Testing message template system...\n');

async function testMessageTemplates() {
  try {
    // Dynamically import the utils module
    const utilsPath = path.join(__dirname, '../dist/messages/utils.js');
    
    if (!fs.existsSync(utilsPath)) {
      throw new Error('Message utils not found. Please run "npm run build" first.');
    }
    
    messageUtils = await import(utilsPath);
    
    // Test 1: Verify template files exist
    console.log('1. Checking template files...');
    const messagesDir = path.join(__dirname, '../src/messages');
    const requiredTemplates = ['startup-banner.md', 'whats-new.md', 'update-info.md'];
    
    for (const template of requiredTemplates) {
      const templatePath = path.join(messagesDir, template);
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template file missing: ${template}`);
      }
      console.log(`   ✅ Found ${template}`);
    }
    
    // Test 2: Test startup banner generation
    console.log('\n2. Testing startup banner generation...');
    const testVersion = '0.1.2';
    const testRepoUrl = 'https://github.com/Ideas-Net-Studio/mcp-shared-memory';
    
    const banner = messageUtils.getStartupBanner(testVersion, testRepoUrl);
    
    if (!banner) {
      throw new Error('Startup banner is empty');
    }
    if (!banner.includes(testVersion)) {
      throw new Error('Startup banner missing version number');
    }
    if (!banner.includes('Structured memory management')) {
      throw new Error('Startup banner missing description');
    }
    if (!banner.includes('╔')) {
      throw new Error('Startup banner missing box drawing characters');
    }
    if (!banner.includes('Multi-tool compatibility')) {
      throw new Error('Startup banner missing feature list');
    }
    
    console.log('   ✅ Startup banner generated correctly');
    console.log(`   Banner length: ${banner.length} characters`);
    
    // Test 3: Test what's new message generation
    console.log('\n3. Testing what\'s new message generation...');
    const whatsNew = messageUtils.getWhatsNewMessage(testVersion, testRepoUrl);
    
    if (!whatsNew) {
      throw new Error('What\'s new message is empty');
    }
    if (!whatsNew.includes(testVersion)) {
      throw new Error('What\'s new message missing version number');
    }
    if (!whatsNew.includes('New in v0.1.2')) {
      throw new Error('What\'s new message missing new features section');
    }
    if (!whatsNew.includes(testRepoUrl)) {
      throw new Error('What\'s new message missing repository URL');
    }
    
    console.log('   ✅ What\'s new message generated correctly');
    console.log(`   Message length: ${whatsNew.length} characters`);
    
    // Test 4: Test update info message generation
    console.log('\n4. Testing update info message generation...');
    const updateInfo = messageUtils.getUpdateInfoMessage(testVersion, testRepoUrl);
    
    if (!updateInfo) {
      throw new Error('Update info message is empty');
    }
    if (!updateInfo.includes(testVersion)) {
      throw new Error('Update info message missing version number');
    }
    if (!updateInfo.includes('npx')) {
      throw new Error('Update info message missing npx instructions');
    }
    if (!updateInfo.includes(testRepoUrl)) {
      throw new Error('Update info message missing repository URL');
    }
    
    console.log('   ✅ Update info message generated correctly');
    console.log(`   Message length: ${updateInfo.length} characters`);
    
    // Test 5: Test template variable replacement
    console.log('\n5. Testing template variable replacement...');
    const testVars = {
      VERSION: '1.2.3',
      REPO_URL: 'https://example.com/test-repo'
    };
    
    const customBanner = messageUtils.getStartupBanner(testVars.VERSION, testVars.REPO_URL);
    const customWhatsNew = messageUtils.getWhatsNewMessage(testVars.VERSION, testVars.REPO_URL);
    const customUpdateInfo = messageUtils.getUpdateInfoMessage(testVars.VERSION, testVars.REPO_URL);
    
    if (!customBanner.includes('1.2.3')) {
      throw new Error('Template variable replacement failed for VERSION in banner');
    }
    if (!customWhatsNew.includes('1.2.3')) {
      throw new Error('Template variable replacement failed for VERSION in whats_new');
    }
    if (!customUpdateInfo.includes('https://example.com/test-repo')) {
      throw new Error('Template variable replacement failed for REPO_URL in update_info');
    }
    
    console.log('   ✅ Template variable replacement works correctly');
    
    console.log('\n🎉 All message template tests PASSED!');
    console.log('\nTest Summary:');
    console.log('  ✅ All template files exist');
    console.log('  ✅ Startup banner generation works');
    console.log('  ✅ What\'s new message generation works');
    console.log('  ✅ Update info message generation works');
    console.log('  ✅ Template variable replacement works');
    
  } catch (error) {
    console.error('\n❌ Message template test FAILED:', error.message);
    process.exit(1);
  }
}

// Run the test
testMessageTemplates();
