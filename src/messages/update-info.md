**Update Information for MCP Shared Memory**

## Current Version
• **Version**: v{VERSION}
• **Status**: ✅ Latest stable release

## How to Update
### Latest Version (Auto-updates)
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

### Pinned Version (Manual updates)
```json
{
  "mcpServers": {
    "shared-memory": {
      "command": "npx",
      "args": ["-y", "mcp-shared-memory@{VERSION}"]
    }
  }
}
```

## Stay Updated
• **GitHub Releases**: {REPO_URL}/releases
• **Documentation**: {REPO_URL}/blob/main/docs/CHANGELOG.md
• **Report Issues**: {REPO_URL}/issues

## Recommendation
For production use, pin to a specific version for stability:
`npx -y mcp-shared-memory@{VERSION}`

For development, use latest for new features:
`npx -y mcp-shared-memory`
