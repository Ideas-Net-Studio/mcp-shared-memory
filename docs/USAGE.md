# MCP Memory Server Usage Guide

This guide explains how to use the MCP Memory Server with any MCP-enabled tool to create and manage memories across chat sessions.

## Compatible MCP-Enabled Tools

This memory server works with all tools that support the Model Context Protocol, including:

### Development Tools
- **Claude Desktop** - Anthropic's desktop application
- **Cursor** - AI-powered code editor with native MCP support
- **Windsurf** - AI development environment with MCP integration
- **Cline** - VS Code extension for AI assistance
- **RooCode** - AI coding assistant
- **Antigravity** - AI development platform

### Terminal & Command Line Tools
- **Warp** - Modern terminal with AI features and MCP support
- **OpenCode** - AI coding assistant


### Other Tools
- **Any MCP-enabled application** - The protocol is tool-agnostic

> **Note**: Configuration methods may vary between tools, but the memory server functionality remains the same across all platforms.

## Setup

### 1. Install the MCP Memory Server

```bash
# Clone the repository
git clone https://github.com/Ideas-Net-Studio/mcp-shared-memory.git
cd mcp-shared-memory

# Install dependencies
npm install

# Build the project
npm run build
```

### 2. Configure Your MCP-Enabled Tool

The configuration method varies by tool, but the server configuration is similar across all platforms:

#### Claude Desktop
Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "memory": {
      "command": "node",
      "args": ["path/to/mcp-memory/dist/index.js"]
    }
  }
}
```

#### Cursor
1. Settings
2. Cursor Settings
3. MCPs sidebar icon
4. Add new global MCP Server
```json
{
  "name": "memory",
  "command": "node",
  "args": ["path/to/mcp-memory/dist/index.js"]
}
```

#### Windsurf
1. MCPs Icon
2. Look for MCPs button in the top right corner
3. Settings button in the top right corner
4. Add the memory server:
```json
{
  "mcpServers": {
    "memory": {
      "command": "node",
      "args": ["path/to/mcp-memory/dist/index.js"]
    }
  }
}
```

#### Cline (VS Code)
Add to your VS Code settings:
```json
{
  "mcpServers": {
    "memory": {
      "disabled": false,
      "timeout": 30,
      "type": "stdio",
      "command": "node",
      "args": [
        "path/to/mcp-memory/dist/index.js"
      ]
    }
  }
}
```

#### Warp
1. Open Warp Settings
2. Navigate to Features → MCP
3. Add the memory server configuration

#### Other Tools
Consult your tool's documentation for "MCP" or "Model Context Protocol" setup instructions. The configuration pattern is typically similar across tools.

> **Tip**: Use the absolute path to the `dist/index.js` file for reliable operation across different tools and working directories.

### 3. Configure Project Memory (Recommended)

For project-specific memory, create a configuration file in your project root. You can choose between hidden or visible files:

#### Option 1: Hidden Configuration (Recommended)
Create `.mcp-memory.json` (hidden file) in your project root:

```json
{
  "memoryDir": ".context/memory",
  "enabled": true,
  "description": "My FastAPI project"
}
```

#### Option 2: Visible Configuration
Create `mcp-memory.json` (visible file) in your project root:

```json
{
  "memoryDir": "memory",
  "enabled": true,
  "description": "My FastAPI project"
}
```

#### Configuration Options:
- `memoryDir`: Relative path to memory directory (default: `memory`)
- `enabled`: Enable/disable project memory (default: `true`)
- `description`: Optional description of your project

#### File Visibility Options:
- **Hidden files** (`.mcp-memory.json`): Not visible in normal file listings, cleaner project root
- **Visible files** (`mcp-memory.json`): Easy to see and discover, better for team collaboration

#### Memory Directory Visibility:
You can also control memory directory visibility through the `memoryDir` setting:

**Hidden Memory Directory:**
```json
{
  "memoryDir": ".context/memory",
  "enabled": true
}
```

**Visible Memory Directory:**
```json
{
  "memoryDir": "memory",
  "enabled": true
}
```

### 4. Alternative: Custom Memory Directory (Legacy)

You can also set a custom memory directory using an environment variable:

```json
{
  "mcpServers": {
    "memory": {
      "command": "node",
      "args": ["path/to/mcp-memory/dist/index.js"],
      "env": {
        "MEMORY_DIR": "/path/to/memory/directory"
      }
    }
  }
}
```

> **Note:** Project configuration takes precedence over environment variables.

## Memory Structure

Memories are stored in a hierarchical structure within your configured memory directory:

### Project-Specific Memory Structure

#### Hidden Configuration + Hidden Memory
```
/your-project-directory
  .mcp-memory.json          # Hidden project configuration
  .context/memory/          # Hidden project memory directory
    /entities/              # Information about specific entities
    /concepts/              # Abstract concepts or knowledge
    /sessions/              # Session-specific memories
    /index.json             # Lunr.js search index
    /metadata.json          # Overall memory metadata
    /README.md              # Auto-generated documentation
```

#### Visible Configuration + Visible Memory
```
/your-project-directory
  mcp-memory.json           # Visible project configuration
  memory/                   # Visible project memory directory
    /entities/              # Information about specific entities
    /concepts/              # Abstract concepts or knowledge
    /sessions/              # Session-specific memories
    /index.json             # Lunr.js search index
    /metadata.json          # Overall memory metadata
    /README.md              # Auto-generated documentation
```

### Global Memory Structure (Fallback)
```
~/mcp-memory/       # Global memory directory (when no project config found)
  /entities/         # Information about specific entities
  /concepts/         # Abstract concepts or knowledge
  /sessions/         # Session-specific memories
  /index.json        # Lunr.js search index
  /metadata.json     # Overall memory metadata
  /README.md         # Auto-generated documentation
```

This structure keeps all project-related memories organized and accessible within your project directory, ensuring that AI assistants maintain context specific to each project. The server automatically detects project configuration and routes memories to the appropriate location.

## Tool-Specific Considerations

### Working Directory Awareness
Different MCP tools may have different working directory contexts:

- **Claude Desktop**: Uses the directory where the application was started
- **Cursor/Windsurf**: Typically uses the current project directory
- **Cline**: Uses the VS Code workspace directory
- **Warp**: Uses the current terminal directory
- **Terminal-based tools**: Use the current working directory

**Important**: The memory server detects project configuration based on the tool's working directory when memory operations are performed.

### Tool Integration Tips

#### Development Environments (Cursor, Windsurf, Cline)
- Memory operations work seamlessly with project files
- AI assistants can remember code architecture, debugging solutions, and implementation decisions
- Project memories persist across different files and sessions within the same project

#### Terminal Tools (Warp, Antigravity)
- Memories work across terminal sessions and commands
- AI assistants can remember command patterns, debugging solutions, and workflow preferences
- Useful for maintaining context in long-running terminal sessions

#### Claude Desktop
- Full desktop application integration
- Memories work across different conversations and projects
- Ideal for comprehensive project knowledge management

### Cross-Tool Compatibility
- **Same memory files work across all tools**
- **No tool-specific configuration needed** in the memory server
- **Seamless switching** between tools while maintaining project context
- **Consistent behavior** regardless of which MCP tool you use

## Project-Specific Memory Management

This MCP server is designed for project-based work with any MCP-enabled tool. The configuration-based approach provides:

1. **Automatic project detection** - The server searches for `.mcp-memory.json` and `mcp-memory.json` in your current directory and parent directories
2. **Opt-in project memory** - Only projects with configuration files get local memory storage
3. **Flexible memory locations** - Each project can choose its own memory directory path
4. **File visibility options** - Choose between hidden (`.mcp-memory.json`) or visible (`mcp-memory.json`) configuration files
5. **Team collaboration** - Configuration and memories can be committed to version control
6. **Clean separation** - Projects without configuration use global memory (`~/.mcp-memory`)
7. **Cross-tool compatibility** - Same memories work across all MCP-enabled tools

### How It Works

1. **Project Detection**: When any MCP-enabled tool accesses memory, the server searches for both `.mcp-memory.json` and `mcp-memory.json`
2. **Priority System**: If both files exist, `.mcp-memory.json` (hidden) takes precedence
3. **Configuration Loading**: If found and enabled, uses the project-specific memory directory
4. **Memory Routing**: All memory operations are routed to the appropriate location
5. **Fallback Behavior**: Projects without configuration use global memory

### Recommended Project Workflow

1. **Setup**: Create a `.mcp-memory.json` or `mcp-memory.json` configuration file in your project root
2. **Choose Visibility**: Decide whether to use hidden (`.mcp-memory.json`) or visible (`mcp-memory.json`) configuration files
3. **Automatic Detection**: The server automatically detects and uses your project configuration
4. **Ongoing Work**: As you work with Claude, it will save important information to the project memory store
5. **Continuity**: In future sessions, Claude automatically retrieves relevant memories from the project
6. **Knowledge Building**: Over time, Claude builds a comprehensive knowledge base about your project
7. **Team Sharing**: Commit the configuration and memory files to share knowledge with your team

### Multi-Project Setup

- **Project A**: Has `.mcp-memory.json` → Uses project-specific memory
- **Project B**: Has `mcp-memory.json` → Uses project-specific memory  
- **Project C**: No configuration → Uses global memory
- **Priority**: If both configuration files exist, `.mcp-memory.json` (hidden) takes precedence

No manual switching required - the server handles everything automatically based on your current working directory.

## Available Tools

The MCP Memory Server provides the following tools:

### 1. build_memory_store (deprecated)

Build a new memory store in a specified directory.

```json
{
  "directory": "/path/to/memory/directory",
  "overwrite": false
}
```

**Note:** With the new configuration-based approach, you typically don't need to use this tool for project setup. The server automatically creates and manages the memory directory based on your `.mcp-memory.json` or `mcp-memory.json` configuration. This tool is mainly used for:
- Creating memory stores in custom locations
- Testing purposes
- Manual memory store management

### 2. create_memory

Create a new memory.

```json
{
  "title": "Meeting with John",
  "type": "session",
  "tags": ["meeting", "project-x"],
  "importance": 0.8,
  "content": "John mentioned that the deadline for Project X has been extended to next month."
}
```

### 3. update_memory

Update an existing memory.

```json
{
  "id": "memory-id",
  "title": "Updated title",
  "content": "Updated content"
}
```

### 4. delete_memory

Delete a memory.

```json
{
  "id": "memory-id"
}
```

### 5. get_memory

Get a memory by ID and type.

```json
{
  "id": "memory-id",
  "type": "entity"
}
```

### 6. search_memories

Search memories by query, type, and tags.

```json
{
  "query": "project deadline",
  "types": ["session", "entity"],
  "tags": ["meeting"],
  "limit": 5
}
```

### 7. list_memories

List memories with optional filtering by type and tags.

```json
{
  "types": ["concept"],
  "tags": ["important"],
  "limit": 10
}
```

### 8. add_tags

Add tags to a memory.

```json
{
  "id": "memory-id",
  "tags": ["important", "follow-up"]
}
```

### 9. remove_tags

Remove tags from a memory.

```json
{
  "id": "memory-id",
  "tags": ["follow-up"]
}
```

### 10. relate_memories

Create relationships between memories.

```json
{
  "sourceId": "memory-id",
  "targetIds": ["related-memory-id-1", "related-memory-id-2"]
}
```

### 11. unrelate_memories

Remove relationships between memories.

```json
{
  "sourceId": "memory-id",
  "targetIds": ["related-memory-id-1"]
}
```

### 12. rebuild_index

Rebuild the search index.

```json
{}
```

### 13. whats_new

Get information about what's new in the current version.

```json
{}
```

**Response**: Shows current version features, new additions, and quick start information.

### 14. check_updates

Check for update information and see how to update to the latest version.

```json
{}
```

**Response**: Provides current version, update instructions, and links to releases and documentation.

## Git Integration

Project memory can be integrated with version control for team collaboration:

### Setup Git Integration

```bash
# Add configuration to git (choose one based on your preference)
git add .mcp-memory.json    # For hidden configuration
# OR
git add mcp-memory.json      # For visible configuration

# Add memory directory (adjust path based on your memoryDir setting)
git add .context/memory/     # For hidden memory directory (.context/memory)
# OR
git add memory/               # For visible memory directory (memory)

git commit -m "Add project memory configuration"

# Recommended .gitignore for memory directory
echo "sessions/" > .context/memory/.gitignore    # For hidden memory
# OR
echo "sessions/" > memory/.gitignore              # For visible memory

echo "index.json" >> .context/memory/.gitignore  # For hidden memory
# OR
echo "index.json" >> memory/.gitignore            # For visible memory

echo "*.tmp" >> .context/memory/.gitignore       # For hidden memory
# OR
echo "*.tmp" >> memory/.gitignore                 # For visible memory
```

### What to Commit

#### ✅ Commit these files:
- `.mcp-memory.json` or `mcp-memory.json` - Project configuration
- `.context/memory/entities/` or `memory/entities/` - Entity memories
- `.context/memory/concepts/` or `memory/concepts/` - Concept memories  
- `.context/memory/metadata.json` or `memory/metadata.json` - Memory metadata
- `.context/memory/README.md` or `memory/README.md` - Auto-generated documentation

#### ❌ Exclude these files:
- `.context/memory/sessions/` or `memory/sessions/` - Session-specific memories
- `.context/memory/index.json` or `memory/index.json` - Search index (regenerated)
- Temporary files and caches

### Team Workflow

1. **Initial Setup**: One team member creates `.mcp-memory.json` or `mcp-memory.json` and commits it
2. **Knowledge Sharing**: Team members commit important memories to share knowledge
3. **Continuous Learning**: The team builds a shared knowledge base over time
4. **Onboarding**: New team members get immediate project context from memories

## Example AI Assistant Instructions

Here's an example of custom instructions you can add to your MCP-enabled tool to help AI assistants effectively use the memory system:

```
You have access to a memory system through the MCP memory server. Follow these steps for each interaction:

1. Memory Retrieval:
   - At the beginning of each conversation, search your memory for relevant information using the search_memories tool.
   - Use queries related to the current conversation topic.
   - If you find relevant memories, incorporate that knowledge into your responses.

2. Memory Creation:
   - During conversations, identify important information worth remembering, such as:
     a) User preferences and personal details
     b) Project-specific information
     c) Important decisions or conclusions
     d) Action items or follow-ups

3. Memory Organization:
   - Store information about people as "entity" type memories
   - Store information about projects or topics as "concept" type memories
   - Store information about specific conversations as "session" type memories
   - Use tags to categorize memories (e.g., "important", "follow-up", "preference")
   - Create relationships between related memories

4. Memory Updates:
   - Update existing memories when you receive new information that changes or enhances what you already know
   - Add tags to memories to improve searchability
   - Create relationships between memories to build a knowledge graph

Remember to be selective about what you store in memory. Focus on information that will be useful in future conversations across any MCP-enabled tool.
```

## Memory File Format

Each memory is stored as a markdown file with frontmatter metadata:

```markdown
---
id: "unique-id"
title: "Memory Title"
type: "entity"
tags: ["tag1", "tag2"]
created: "2023-06-15T14:30:00Z"
updated: "2023-06-15T14:30:00Z"
related: ["other-memory-id1", "other-memory-id2"]
importance: 0.8
---

# Memory Title

Content of the memory...
```

## Tips for Effective Memory Usage

1. **Be Selective**: Store only important information that will be useful in future conversations.

2. **Use Consistent Tags**: Develop a consistent tagging system to make retrieval more effective.

3. **Create Relationships**: Connect related memories to build a knowledge graph.

4. **Use Specific Queries**: When searching memories, use specific queries that include key terms.

5. **Update Regularly**: Keep memories up-to-date by updating them when new information is available.

6. **Organize by Type**: Use the appropriate memory type (entity, concept, session) for different kinds of information.

7. **Set Importance**: Use the importance field to prioritize critical memories.

## Troubleshooting

If you encounter issues with the MCP Memory Server:

### Configuration Issues

1. **Project Configuration Not Found**: 
   - Ensure `.mcp-memory.json` or `mcp-memory.json` exists in your project root or parent directory
   - Check that the file contains valid JSON
   - Verify `"enabled": true` is set (or omit the enabled field)

2. **Memory Directory Not Created**:
   - The server automatically creates the memory directory on first use
   - Check file permissions for the parent directory
   - Try manually creating the directory to test permissions

3. **Wrong Memory Directory Being Used**:
   - Check the server logs to see which memory directory is being used
   - Verify your current working directory when starting your MCP tool
   - Ensure `.mcp-memory.json` or `mcp-memory.json` is in the correct location
   - **Priority**: If both files exist, `.mcp-memory.json` (hidden) takes precedence

### General Issues

4. **Check Logs**: Look for error messages in your MCP tool's logs. The server logs which memory directory it's using.

5. **Rebuild Index**: Try rebuilding the search index using the `rebuild_index` tool.

6. **Check Memory Directory**: Ensure the memory directory exists and is writable.

7. **Restart Your MCP Tool**: Sometimes a simple restart can resolve connection issues.

8. **Check Configuration**: Verify your MCP tool's configuration file is correctly configured.

9. **Test with Global Memory**: Temporarily remove `.mcp-memory.json` and `mcp-memory.json` to test if global memory works.

10. **Validate JSON**: Use a JSON validator to check your `.mcp-memory.json` or `mcp-memory.json` file for syntax errors.

### Tool-Specific Troubleshooting

#### Claude Desktop
- Check `claude_desktop_config.json` syntax
- Restart Claude Desktop completely
- Check Claude Desktop logs for MCP server errors

#### Cursor/Windsurf/Cline
- Verify MCP server configuration in tool settings
- Check tool-specific logs or console output
- Ensure the tool has proper file system permissions

#### Terminal Tools (Warp, Antigravity)
- Check current working directory
- Verify terminal permissions
- Test with absolute paths to the memory server

### Common Error Messages

- **"Using global memory directory"**: No project configuration found (expected if no `.mcp-memory.json` or `mcp-memory.json`)
- **"Using project memory directory"**: Project configuration found and loaded (expected behavior)
- **"Found configuration at: /path/to/.mcp-memory.json"**: Hidden configuration found and used
- **"Found configuration at: /path/to/mcp-memory.json"**: Visible configuration found and used
- **"Error reading .mcp-memory.json"**: Check JSON syntax and file permissions for hidden config
- **"Error reading mcp-memory.json"**: Check JSON syntax and file permissions for visible config
- **"Permission denied"**: Check directory permissions for memory location