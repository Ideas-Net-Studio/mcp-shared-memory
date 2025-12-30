# MCP Memory Server Tests

This directory contains test files for the MCP Memory Server v0.1.1 with multi-tool support and flexible configuration.

## Test Files

### `test-config.js` (Default Test)
**Purpose**: Tests the core configuration detection system
**Tests**:
- Hidden configuration (`.mcp-memory.json`)
- Visible configuration (`mcp-memory.json`) 
- Global memory fallback (no configuration)
- Configuration priority (hidden > visible > global)

**Run**: `npm test` or `npm run test`

### `test-server.js`
**Purpose**: Tests server functionality with project configuration
**Tests**:
- Tools listing
- Memory creation
- Memory search
- Memory listing

**Run**: `npm run test:server`

### `test-client.js`
**Purpose**: Tests client-side operations
**Tests**:
- Memory creation
- Memory search
- Memory listing

**Run**: `npm run test:client`

### `test-build-memory.js`
**Purpose**: Tests the build_memory_store functionality (legacy)
**Note**: This tests the old manual memory store building approach

**Run**: `npm run test:build`

## Configuration Testing

The tests verify the new v0.1.1 configuration system:

1. **Hidden Configuration**: `.mcp-memory.json` (takes precedence)
2. **Visible Configuration**: `mcp-memory.json` (for team collaboration)
3. **Global Fallback**: Uses `~/.mcp-memory` when no project config exists

## Test Structure

Each test:
1. Creates a temporary directory
2. Sets up project configuration
3. Spawns the MCP server with the test configuration
4. Sends JSON-RPC requests to test functionality
5. Verifies responses and behavior
6. **Automatically cleans up** temporary files on:
   - Successful completion
   - Process exit (normal or error)
   - Interrupt signals (Ctrl+C)
   - Termination signals

## Robust Cleanup

All tests include comprehensive cleanup that ensures:
- **No leftover directories** - Temporary test folders are always removed
- **Signal handling** - Cleanup runs on SIGINT, SIGTERM, and normal exit
- **Error resilience** - Even if tests fail, cleanup still executes
- **Process safety** - Multiple cleanup mechanisms prevent orphaned files

## Running Tests

```bash
# Run configuration tests (default)
npm test
npm run test:config

# Run specific test
npm run test:server
npm run test:client
npm run test:build
```

## Expected Output

All tests should show:
- ✅ Individual test passes
- 🎉 Overall success message
- 🧹 Cleanup completion

If any test fails, it will exit with code 1 and show an error message.
