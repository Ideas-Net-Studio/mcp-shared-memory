#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import path from "path";
import os from "os";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { 
  CreateMemorySchema, 
  UpdateMemorySchema, 
  SearchMemoriesSchema,
  ListMemoriesSchema,
  TagMemorySchema,
  RelateMemoriesSchema,
  BuildMemoryStoreSchema,
  MemoryTypeEnum,
  MemoryType
} from "./types.js";
import { MemoryService } from "./memory.js";
import { getStartupBanner, getWhatsNewMessage, getUpdateInfoMessage } from "./messages/utils.js";

// Configuration file interface
interface ProjectConfig {
  memoryDir?: string;
  enabled?: boolean;
  description?: string;
}

// Load project configuration from .mcp-memory.json or mcp-memory.json
function loadProjectConfig(): { config: ProjectConfig; projectDir: string } | null {
  // Start from process.cwd() which reflects the actual working directory
  let currentDir = process.cwd();
  
  // Search up directory tree for .mcp-memory.json or mcp-memory.json
  while (currentDir !== path.dirname(currentDir)) {
    // Try both hidden and visible configuration files
    const hiddenConfigPath = path.join(currentDir, '.mcp-memory.json');
    const visibleConfigPath = path.join(currentDir, 'mcp-memory.json');
    
    for (const configPath of [hiddenConfigPath, visibleConfigPath]) {
      if (fs.existsSync(configPath)) {
        try {
          const configContent = fs.readFileSync(configPath, 'utf8');
          const config = JSON.parse(configContent) as ProjectConfig;
          
          // Only enable if not explicitly disabled
          if (config.enabled !== false) {
            console.error(`Found configuration at: ${configPath}`);
            return {
              config: {
                memoryDir: config.memoryDir || '.context/memory',
                enabled: true,
                description: config.description
              },
              projectDir: currentDir
            };
          }
        } catch (error) {
          console.error(`Error reading ${path.basename(configPath)} in ${currentDir}: ${error}`);
        }
      }
    }
    
    currentDir = path.dirname(currentDir);
  }
  
  return null; // No project config found
}

// Resolve memory directory with project configuration
const projectConfig = loadProjectConfig();
let memoryDir: string;

if (projectConfig) {
  // Use project-specific memory directory
  memoryDir = path.resolve(projectConfig.projectDir, projectConfig.config.memoryDir!);
  console.error(`Using project memory directory: ${memoryDir}`);
  console.error(`Project: ${projectConfig.projectDir}`);
  if (projectConfig.config.description) {
    console.error(`Description: ${projectConfig.config.description}`);
  }
} else {
  // Use environment variable or default
  memoryDir = process.env.MEMORY_DIR || path.join(os.homedir(), '.mcp-memory');
  console.error(`Using global memory directory: ${memoryDir}`);
}

// Initialize memory service
const memoryService = new MemoryService(memoryDir);

// Load version from package.json
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const CURRENT_VERSION = packageJson.version;
const REPO_URL = "https://github.com/Ideas-Net-Studio/mcp-shared-memory";

// Initialize MCP server
const server = new Server({
  name: "mcp-shared-memory",
  version: CURRENT_VERSION
});

async function checkForUpdates() {
  try {
    // Show startup banner with current version info
    const banner = getStartupBanner(CURRENT_VERSION, REPO_URL);
    console.error(banner);
    
    // Check for updates periodically (every 24 hours)
    setTimeout(checkForUpdates, 24 * 60 * 60 * 1000);
  } catch (error) {
    // Silent fail - don't break the server if update check fails
  }
}

// Start update check
checkForUpdates();

// Register tools capability
server.registerCapabilities({
  tools: {
    listChanged: true
  }
});

// Set up tool list handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "build_memory_store",
        description: "Build a new memory store in the specified directory",
        inputSchema: zodToJsonSchema(BuildMemoryStoreSchema),
      },
      {
        name: "create_memory",
        description: "Create a new memory",
        inputSchema: zodToJsonSchema(CreateMemorySchema),
      },
      {
        name: "update_memory",
        description: "Update an existing memory",
        inputSchema: zodToJsonSchema(UpdateMemorySchema),
      },
      {
        name: "delete_memory",
        description: "Delete a memory",
        inputSchema: zodToJsonSchema(z.object({
          id: z.string()
        })),
      },
      {
        name: "get_memory",
        description: "Get a memory by ID and type",
        inputSchema: zodToJsonSchema(z.object({
          id: z.string(),
          type: MemoryTypeEnum
        })),
      },
      {
        name: "search_memories",
        description: "Search memories by query, type, and tags",
        inputSchema: zodToJsonSchema(SearchMemoriesSchema),
      },
      {
        name: "list_memories",
        description: "List memories with optional filtering by type and tags",
        inputSchema: zodToJsonSchema(ListMemoriesSchema),
      },
      {
        name: "add_tags",
        description: "Add tags to a memory",
        inputSchema: zodToJsonSchema(TagMemorySchema),
      },
      {
        name: "remove_tags",
        description: "Remove tags from a memory",
        inputSchema: zodToJsonSchema(TagMemorySchema),
      },
      {
        name: "relate_memories",
        description: "Create relationships between memories",
        inputSchema: zodToJsonSchema(RelateMemoriesSchema),
      },
      {
        name: "unrelate_memories",
        description: "Remove relationships between memories",
        inputSchema: zodToJsonSchema(RelateMemoriesSchema),
      },
      {
        name: "rebuild_index",
        description: "Rebuild the search index",
        inputSchema: zodToJsonSchema(z.object({})),
      },
      {
        name: "whats_new",
        description: "See what's new in the current version and get update information",
        inputSchema: zodToJsonSchema(z.object({})),
      },
      {
        name: "check_updates",
        description: "Check for newer versions and see update information",
        inputSchema: zodToJsonSchema(z.object({})),
      },
    ],
  };
});

// Set up tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  await memoryService.initialize();
  
  const { name: toolName, arguments: toolArgs } = request.params;
  
  // Ensure toolArgs is not undefined
  if (!toolArgs) {
    return {
      content: [
        {
          type: "text",
          text: `Error: No arguments provided for tool ${toolName}`
        }
      ],
      is_error: true
    };
  }
  
  try {
    switch (toolName) {
      case "build_memory_store": {
        const args = toolArgs as { directory: string; overwrite?: boolean };
        await memoryService.buildMemoryStore({
          directory: args.directory,
          overwrite: args.overwrite
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Memory store successfully built in directory: ${args.directory}`
            }
          ]
        };
      }
      
      case "create_memory": {
        const args = toolArgs as {
          title: string;
          type: MemoryType;
          tags?: string[];
          related?: string[];
          importance?: number;
          content: string;
        };
        
        const memory = await memoryService.createMemory({
          title: args.title,
          type: args.type,
          tags: args.tags,
          related: args.related,
          importance: args.importance,
          content: args.content
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Memory created with ID: ${memory.id}`
            }
          ]
        };
      }
      
      case "update_memory": {
        const args = toolArgs as {
          id: string;
          title?: string;
          tags?: string[];
          related?: string[];
          importance?: number;
          content?: string;
        };
        
        const memory = await memoryService.updateMemory({
          id: args.id,
          title: args.title,
          tags: args.tags,
          related: args.related,
          importance: args.importance,
          content: args.content
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Memory ${memory.id} updated successfully`
            }
          ]
        };
      }
      
      case "delete_memory": {
        const args = toolArgs as { id: string };
        await memoryService.deleteMemory(args.id);
        
        return {
          content: [
            {
              type: "text",
              text: `Memory ${args.id} deleted successfully`
            }
          ]
        };
      }
      
      case "get_memory": {
        const args = toolArgs as { id: string; type: MemoryType };
        const memory = await memoryService.getMemory(args.id, args.type);
        
        if (!memory) {
          return {
            content: [
              {
                type: "text",
                text: `Memory ${args.id} not found`
              }
            ],
            is_error: true
          };
        }
        
        return {
          content: [
            {
              type: "json",
              json: memory
            }
          ]
        };
      }
      
      case "search_memories": {
        const args = toolArgs as {
          query: string;
          types?: MemoryType[];
          tags?: string[];
          limit?: number;
        };
        
        const results = await memoryService.searchMemories(
          args.query,
          {
            types: args.types,
            tags: args.tags,
            limit: args.limit
          }
        );
        
        return {
          content: [
            {
              type: "json",
              json: results
            }
          ]
        };
      }
      
      case "list_memories": {
        const args = toolArgs as {
          types?: MemoryType[];
          tags?: string[];
          limit?: number;
        };
        
        const results = await memoryService.listMemories({
          types: args.types,
          tags: args.tags,
          limit: args.limit
        });
        
        return {
          content: [
            {
              type: "json",
              json: results
            }
          ]
        };
      }
      
      case "add_tags": {
        const args = toolArgs as { id: string; tags: string[] };
        const memory = await memoryService.addTags(args.id, args.tags);
        
        return {
          content: [
            {
              type: "text",
              text: `Tags added to memory ${memory.id}`
            }
          ]
        };
      }
      
      case "remove_tags": {
        const args = toolArgs as { id: string; tags: string[] };
        const memory = await memoryService.removeTags(args.id, args.tags);
        
        return {
          content: [
            {
              type: "text",
              text: `Tags removed from memory ${memory.id}`
            }
          ]
        };
      }
      
      case "relate_memories": {
        const args = toolArgs as { sourceId: string; targetIds: string[] };
        const memory = await memoryService.relateMemories(args.sourceId, args.targetIds);
        
        return {
          content: [
            {
              type: "text",
              text: `Relationships created for memory ${memory.id}`
            }
          ]
        };
      }
      
      case "unrelate_memories": {
        const args = toolArgs as { sourceId: string; targetIds: string[] };
        const memory = await memoryService.unrelateMemories(args.sourceId, args.targetIds);
        
        return {
          content: [
            {
              type: "text",
              text: `Relationships removed for memory ${memory.id}`
            }
          ]
        };
      }
      
      case "rebuild_index": {
        await memoryService.rebuildIndex();
        
        return {
          content: [
            {
              type: "text",
              text: "Search index rebuilt successfully"
            }
          ]
        };
      }
      
      case "whats_new": {
        const whatsNewContent = getWhatsNewMessage(CURRENT_VERSION, REPO_URL);
        
        return {
          content: [
            {
              type: "text",
              text: whatsNewContent
            }
          ]
        };
      }
      
      case "check_updates": {
        const updateInfo = getUpdateInfoMessage(CURRENT_VERSION, REPO_URL);
        
        return {
          content: [
            {
              type: "text",
              text: updateInfo
            }
          ]
        };
      }
      
      default:
        return {
          content: [
            {
              type: "text",
              text: `Unknown tool: ${toolName}`
            }
          ],
          is_error: true
        };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error: ${errorMessage}` }],
      is_error: true,
    };
  }
});

// Start server
async function runServer() {
  try {
    await memoryService.initialize();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP Memory Server running on stdio");
  } catch (error) {
    console.error("Error initializing server:", error);
    process.exit(1);
  }
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
}); 