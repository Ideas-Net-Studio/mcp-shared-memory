# MCP Memory Server

A Model Context Protocol (MCP) server that provides structured memory management across chat sessions for all MCP-enabled tools and applications, specifically designed for project-based work.

> 💡 **New in v0.1.2**: Version tracking and update notifications! Ask your AI assistant: "What's new in mcp-shared-memory?"

## Quick Start

### Usage with npx (Recommended)

You can run the server directly without installing it:

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

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/Ideas-Net-Studio/mcp-shared-memory.git
cd mcp-shared-memory

# Install and Build
npm install
npm run build

# Configure your MCP tool
{
  "mcpServers": {
    "shared-memory": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-memory/dist/index.js"]
    }
  }
}
```

## Documentation

| Document                                                      | Description                                       |
| ------------------------------------------------------------- | ------------------------------------------------- |
| **[USAGE.md](docs/USAGE.md)**                                 | Complete usage guide with setup for all MCP tools |
| **[CHANGELOG.md](docs/CHANGELOG.md)**                         | Version history and release notes                 |
| **[instructions_template.md](docs/instructions_template.md)** | AI assistant instructions template                |
| **[CONTRIBUTING.md](docs/CONTRIBUTING.md)**                   | Contribution guidelines and workflow              |

## Compatible Tools

Works with any MCP-enabled tool:

- **Claude Desktop** - Anthropic's desktop application
- **Cursor** - AI-powered code editor
- **Windsurf** - AI development environment
- **Cline** - VS Code extension for AI assistance
- **RooCode** - AI coding assistant
- **Warp** - Modern terminal with AI features
- **Antigravity** - AI development platform
- **And more...** - Any tool supporting the Model Context Protocol

## Key Features

- **Project-Specific Memory**: Store memories within project directories
- **Flexible Configuration**: Hidden or visible configuration files
- **Multi-Tool Support**: Works seamlessly across all MCP tools
- **Git Integration**: Share project memories with your team
- **Automatic Detection**: Smart project configuration detection
- **Structured Storage**: Organized memory with entities, concepts, and sessions

## Project Structure

Create a configuration file in your project root:

### Hidden Configuration (Recommended)

```json
{
  "memoryDir": ".context/memory",
  "enabled": true,
  "description": "My project"
}
```

File: `.mcp-memory.json`

### Visible Configuration

```json
{
  "memoryDir": "memory",
  "enabled": true,
  "description": "My project"
}
```

File: `mcp-memory.json`

## Testing

```bash
# Run configuration tests
npm test

# Run server tests
npm run test:server

# Run client tests
npm run test:client
```

## Development

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build
```

## Contributing

We welcome contributions! See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed guidelines on how to fork, modify, and submit PRs.

## License

MIT

---

> **For detailed documentation, see the [docs/](docs/) folder.**

> **🍴 Fork Status**: This is a fork of the original [ebailey78/mcp-memory](https://github.com/ebailey78/mcp-memory) repository, which appears to no longer be actively maintained. This fork continues development with multi-tool compatibility, enhanced configuration options, and improved testing.
