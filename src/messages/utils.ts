import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MessageTemplate {
  VERSION: string;
  REPO_URL: string;
}

/**
 * Load a message template and replace placeholders
 */
export function loadMessageTemplate(filename: string, variables: MessageTemplate): string {
  const filePath = path.join(__dirname, `${filename}.md`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace placeholders
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      content = content.replace(new RegExp(placeholder, 'g'), value);
    });
    
    return content;
  } catch (error) {
    console.error(`Failed to load message template: ${filename}`, error);
    return `Unable to load ${filename} template`;
  }
}

/**
 * Get the startup banner message
 */
export function getStartupBanner(version: string, repoUrl: string): string {
  return loadMessageTemplate('startup-banner', { VERSION: version, REPO_URL: repoUrl });
}

/**
 * Get the "what's new" message
 */
export function getWhatsNewMessage(version: string, repoUrl: string): string {
  return loadMessageTemplate('whats-new', { VERSION: version, REPO_URL: repoUrl });
}

/**
 * Get the update information message
 */
export function getUpdateInfoMessage(version: string, repoUrl: string): string {
  return loadMessageTemplate('update-info', { VERSION: version, REPO_URL: repoUrl });
}
