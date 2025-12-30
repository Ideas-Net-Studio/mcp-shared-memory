import { createServer } from 'http';
import { z } from 'zod';

// Define MCP server types
export interface ToolResponse {
  content: Array<{ type: string; text?: string; json?: any }>;
  isError?: boolean;
}

export type ToolHandler = (input: any) => Promise<ToolResponse>;

export interface Tool {
  name: string;
  description: string;
  inputSchema: any;
  handler: ToolHandler;
}

export class Server {
  private tools: Map<string, Tool> = new Map();

  /**
   * Register a tool with the server
   */
  registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * List all registered tools
   */
  listTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Call a tool by name
   */
  async callTool(name: string, input: any): Promise<ToolResponse> {
    const tool = this.tools.get(name);
    
    if (!tool) {
      return {
        content: [{ type: 'text', text: `Tool '${name}' not found` }],
        isError: true
      };
    }
    
    try {
      return await tool.handler(input);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: 'text', text: `Error: ${errorMessage}` }],
        isError: true
      };
    }
  }

  /**
   * Connect to a transport
   */
  async connect(transport: ServerTransport): Promise<void> {
    await transport.connect(this);
  }
}

export interface ServerTransport {
  connect(server: Server): Promise<void>;
}

/**
 * Simple stdio transport for MCP server
 */
export class StdioServerTransport implements ServerTransport {
  async connect(server: Server): Promise<void> {
    // Handle stdin/stdout communication
    process.stdin.setEncoding('utf8');
    
    let buffer = '';
    
    process.stdin.on('data', async (chunk) => {
      buffer += chunk;
      
      try {
        // Try to parse complete JSON objects
        const messages = this.extractJsonObjects(buffer);
        
        if (messages.length > 0) {
          // Update buffer to contain only unprocessed data
          const lastJsonEnd = buffer.lastIndexOf('}') + 1;
          buffer = buffer.slice(lastJsonEnd);
          
          // Process each complete message
          for (const message of messages) {
            await this.handleMessage(message, server);
          }
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });
    
    process.stdin.on('end', () => {
      console.error('stdin stream ended');
      process.exit(0);
    });
  }
  
  /**
   * Extract complete JSON objects from a string
   */
  private extractJsonObjects(str: string): any[] {
    const objects: any[] = [];
    let startIndex = str.indexOf('{');
    
    while (startIndex !== -1) {
      try {
        // Find a valid JSON object
        const substr = str.slice(startIndex);
        const parsed = JSON.parse(substr);
        objects.push(parsed);
        
        // Move past this object
        startIndex = str.indexOf('{', startIndex + 1);
      } catch (error) {
        // If parsing fails, try the next opening brace
        startIndex = str.indexOf('{', startIndex + 1);
      }
    }
    
    return objects;
  }
  
  /**
   * Handle an MCP message
   */
  private async handleMessage(message: any, server: Server): Promise<void> {
    try {
      if (message.type === 'list_tools') {
        // Handle list_tools request
        const tools = server.listTools().map(tool => ({
          name: tool.name,
          description: tool.description,
          input_schema: tool.inputSchema
        }));
        
        this.sendResponse({
          id: message.id,
          type: 'list_tools_response',
          tools
        });
      } else if (message.type === 'call_tool') {
        // Handle call_tool request
        const { tool_name, tool_input } = message;
        const response = await server.callTool(tool_name, tool_input);
        
        this.sendResponse({
          id: message.id,
          type: 'call_tool_response',
          content: response.content,
          is_error: response.isError || false
        });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      
      this.sendResponse({
        id: message.id,
        type: message.type === 'list_tools' ? 'list_tools_response' : 'call_tool_response',
        is_error: true,
        content: [{ 
          type: 'text', 
          text: `Error: ${error instanceof Error ? error.message : String(error)}` 
        }]
      });
    }
  }
  
  /**
   * Send a response to stdout
   */
  private sendResponse(response: any): void {
    process.stdout.write(JSON.stringify(response) + '\n');
  }
} 