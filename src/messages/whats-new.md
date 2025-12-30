**MCP Shared Memory v{VERSION} - What's New**

## New in v{VERSION}
- **Startup Banner**: Beautiful ASCII banner showing version and quick info
- **Update Notifications**: Automatic update checking (every 24 hours)
- **New Tools**: `whats_new` and `check_updates` for version information
- **Better Branding**: Consistent "shared-memory" naming across all configs

## Core Features
- **Multi-Tool Compatibility**: Works seamlessly across Claude Desktop, Cursor, Windsurf, Cline, RooCode, Warp, Antigravity, and more
- **Flexible Configuration**: Choose between hidden (.mcp-memory.json) and visible (mcp-memory.json) configuration files
- **Git Integration**: Easy sharing of project memories with teams
- **Full-Text Search**: Powered by Lunr.js for fast memory retrieval
- **Structured Storage**: Organized memory types (entities, concepts, sessions)
- **Cross-Tool Memory**: Same memory files work across all MCP-enabled platforms

## Quick Start
```json
{
  "mcpServers": {
    "shared-memory": {
      "command": "npx",
      "args": ["-y", "mcp-shared-memory"]
    }
  }
}
```

**Full Documentation**: {REPO_URL}/blob/main/docs/README.md
**Report Issues**: {REPO_URL}/issues
