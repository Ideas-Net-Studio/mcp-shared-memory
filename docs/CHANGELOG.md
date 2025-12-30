# Changelog

## v0.1.2 - User Experience & Version Management

### New Features
- **Startup Banner**: Beautiful ASCII art banner displayed on server start showing version and quick links
- **Update Notifications**: Automatic update checking system (runs every 24 hours)
- **Version Tools**: Added two new MCP tools for version information:
  - `whats_new`: Shows current version features and what's new
  - `check_updates`: Provides update information and instructions
- **Message Template System**: Dynamic message templates with variable replacement for consistent messaging

### Improvements
- **Better Branding**: Consistent "shared-memory" naming in all configuration examples
- **Professional Polish**: Enhanced user experience with informative startup messages
- **Self-Documenting**: Users can query the server directly about version and updates
- **Update Awareness**: Passive update checking keeps users informed without being intrusive

### Technical Changes
- Added `src/messages/` directory with message templates:
  - `startup-banner.md`: Server startup banner template
  - `whats-new.md`: What's new message template
  - `update-info.md`: Update instructions template
  - `utils.ts`: Template loading and processing utilities
- Updated server version tracking with `CURRENT_VERSION` constant
- Improved banner formatting with proper URL display

### Documentation Updates
- Updated README.md with version check hints
- Added instructions for checking what's new
- Updated configuration examples to use "shared-memory" naming

---

## v0.1.1 - Multi-Tool Compatibility & Enhanced Configuration

### Major Features
- **Multi-Tool Support**: Expanded compatibility from Claude Desktop to all MCP-enabled tools
- **Flexible Configuration**: Added support for both hidden (`.mcp-memory.json`) and visible (`mcp-memory.json`) configuration files
- **Cross-Tool Compatibility**: Same memory files work seamlessly across all MCP-enabled platforms

### Enhanced Features
- **File Visibility Options**: Users can choose between hidden and visible configuration files
- **Priority System**: Hidden configuration files take precedence when both exist
- **Universal Documentation**: Updated all documentation to be tool-agnostic
- **Improved Search**: Enhanced configuration detection with better error messages

### Technical Improvements
- **Enhanced `loadProjectConfig()`**: Now searches for both `.mcp-memory.json` and `mcp-memory.json`
- **Better Logging**: Added configuration file path logging for easier debugging
- **Backward Compatibility**: All existing configurations continue to work
- **Robust Error Handling**: Improved error messages for configuration issues

### Documentation Updates
- **README.md**: 
  - Added "Compatible Tools" section listing major MCP-enabled tools
  - Updated "Usage with MCP-Enabled Tools" with tool-specific configurations
  - Enhanced project structure examples for both hidden and visible approaches
  - Added comprehensive Git integration guidance

- **USAGE.md**:
  - Added extensive "Compatible MCP-Enabled Tools" section with categories
  - Detailed configuration instructions for Cursor, Windsurf, Cline, Warp, Antigravity, and RooCode
  - Added "Tool-Specific Considerations" section
  - Enhanced troubleshooting with tool-specific guidance
  - Updated all language to be inclusive of all MCP tools

### Tool Compatibility Added
- **Claude Desktop** - Anthropic's desktop application
- **Cursor** - AI-powered code editor with native MCP support
- **Windsurf** - AI development environment with MCP integration
- **Cline** - VS Code extension for AI assistance
- **RooCode** - AI coding assistant
- **Antigravity** - AI development platform
- **Warp** - Modern terminal with AI features and MCP support
- **OpenCode** - AI coding assistant
- **Any MCP-enabled application** - Protocol-agnostic support

### Configuration Examples
- Added example configuration files for both hidden and visible approaches
- Enhanced setup instructions for each major tool
- Improved Git integration with conditional commands
- Added troubleshooting for tool-specific issues

### Breaking Changes
- **Default memory directory changed** from `.context/memory` to `memory` for better visibility (users can still customize)
- **Documentation focus shifted** from Claude Desktop to universal MCP compatibility

### Bug Fixes
- Fixed path resolution issues in configuration examples
- Corrected typo in environment variable path
- Improved error messages for missing configurations
- Enhanced working directory awareness documentation

### Testing Improvements
- **Enhanced Test Suite**: Moved all tests to dedicated `/test` directory
- **Configuration Testing**: Added `test-config.js` for focused configuration detection testing
- **Robust Cleanup**: Implemented comprehensive cleanup mechanisms with signal handling
- **Test Organization**: 
  - `test-config.js`: Configuration detection tests (default)
  - `test-server.js`: Server functionality tests
  - `test-client.js`: Client operations tests
  - `test-build-memory.js`: Legacy build tests
- **Improved Reliability**: Added automatic cleanup on process exit, SIGINT, and SIGTERM
- **Better Documentation**: Created comprehensive test documentation with usage examples

### Documentation Reorganization
- **Professional Structure**: Moved detailed documentation to dedicated `/docs` folder
- **Improved Navigation**: 
  - Main `README.md`: Project overview and quick start guide
  - `docs/README.md`: Documentation index with clear descriptions
  - `docs/USAGE.md`: Complete usage guide (moved from root)
  - `docs/CHANGELOG.md`: Version history (moved from root)
  - `docs/instructions_template.md`: AI assistant template (moved from root)
- **Cleaner Project Root**: Reduced clutter in main project directory
- **Better Cross-References**: Updated all internal links and navigation
- **Enhanced User Experience**: Clear separation between overview and detailed documentation
- **Refined Styling**: Updated README.md section headers for cleaner, more professional appearance

---

## v0.1.0 - Initial Release

### Features
- Created a Model Context Protocol (MCP) server for Claude memory management
- Implemented memory storage using markdown files
- Added Lunr.js for memory indexing and search
- Implemented memory types: entity, concept, and session
- Added tagging and relationship capabilities
- Created a build_memory_store tool for initializing memory stores in specified directories
- Added comprehensive instructions template for Claude projects
- Designed for project-specific memory management within project directories

### Technical Improvements
- Used the official MCP SDK for compatibility with Claude Desktop
- Implemented proper type safety with TypeScript and Zod
- Added error handling for all operations
- Created test scripts to verify functionality

### Documentation
- Added README.md with usage instructions
- Created USAGE.md with detailed tool documentation
- Added instructions_template.md for Claude project instructions
- Created example configuration files for Claude Desktop
- Emphasized project-specific workflow and memory organization

### Next Steps
- Add more comprehensive tests
- Implement vector embeddings for semantic search
- Add memory prioritization based on importance and recency
- Create a web interface for memory visualization
- Add automatic tagging based on content analysis 