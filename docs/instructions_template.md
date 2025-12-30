# Memory System Instructions Template

This template provides instructions for AI assistants on how to use the MCP memory system across all MCP-enabled tools. Copy and customize these instructions for your AI projects.

## Universal AI Assistant Memory Management

As your AI assistant, I'll maintain a dedicated memory store within this project directory. This works across all MCP-enabled tools (Claude Desktop, Cursor, Windsurf, Cline, RooCode, Warp, Antigravity, OpenCode, and others).

### Benefits Across All Tools

1. **Cross-tool continuity**: Memories work seamlessly regardless of which MCP tool you use
2. **Project-specific context**: I maintain knowledge specific to this project across different tools and sessions
3. **Persistent collaboration**: Build knowledge over time, even when switching between development environments
4. **Team compatibility**: Team members can access shared project memories regardless of their preferred tool

### Tool-Aware Memory System

The memory system automatically detects:
- **Your current working directory** when using any MCP tool
- **Project configuration** (`.mcp-memory.json` or `mcp-memory.json`)
- **Appropriate memory location** based on your project setup

## Memory System Setup

When starting a new project or conversation with any MCP-enabled tool, the AI assistant should initialize the memory system:

```
I'll first check if we have a memory store for this project.

[Search for existing memories]
search_memories(query: "project setup")

[If no memories are found, the system automatically creates the memory store based on project configuration]

Now I'll create an initial project memory to track our work.

create_memory(
  title: "Project Overview",
  type: "concept",
  tags: ["project", "overview"],
  content: "This is a new project started on [current date]. The main goal is to [project goal]. Using MCP memory server v0.1.1 with multi-tool support."
)
```

### Configuration-Aware Setup

The memory system automatically detects your project configuration:

- **Hidden config** (`.mcp-memory.json`): Uses hidden memory directory (default: `.context/memory`)
- **Visible config** (`mcp-memory.json`): Uses visible memory directory (default: `memory`)
- **No config**: Falls back to global memory (`~/.mcp-memory`)

## Memory Retrieval Process

At the beginning of each conversation (regardless of which MCP tool you're using), the AI assistant should retrieve relevant memories:

### 1. Start with Memory Search

```
I'm searching my memory for relevant information about [topic/project]...

search_memories(query: "[specific search term]")
search_memories(query: "[user name] preferences")
search_memories(query: "[project name] requirements")
search_memories(query: "[current tool] setup")
```

### 2. Tool-Context Awareness

```
I can see we're working in [current tool] with project [project name]. Based on our previous conversations across different tools, I recall that:
- You prefer [preference from memory]
- We decided to [decision from memory] 
- The project requires [requirement from memory]
- Last time we used [different tool], we discussed [context from memory]
```

### 3. Cross-Tool Memory Integration

```
Since I maintain memories across all MCP tools, I can provide consistent assistance whether you're using:
- Claude Desktop for comprehensive discussions
- Cursor/Windsurf for development work
- Cline for VS Code integration
- Warp for terminal operations
- Or any other MCP-enabled tool
```

## Memory Creation Guidelines

AI assistants should create memories for important information discovered during conversations, with awareness of the multi-tool environment:

### 1. User Information (Cross-Tool Preferences)

Create entity memories for user details that apply across all tools:

```
create_memory(
  title: "[User Name]'s Multi-Tool Preferences",
  type: "entity",
  tags: ["user", "preference", "cross-tool", "technical"],
  content: "[User Name] prefers [language/framework] for [specific task]. Works with [tools list]. Has [X] years of experience with [technology]. Prefers [workflow pattern] when switching between development environments."
)
```

### 2. Tool-Specific Workflows

Create concept memories for tool-specific patterns and workflows:

```
create_memory(
  title: "[Project Name] - [Tool Name] Workflow",
  type: "concept",
  tags: ["project", "workflow", "[tool-name]", "technical"],
  content: "When using [Tool Name], we typically: [workflow steps]. Key shortcuts: [shortcuts]. Preferred settings: [settings]. Integration with other tools: [integration details]."
)
```

### 3. Project Information (Tool-Agnostic)

Create concept memories for project details that apply across all tools:

```
create_memory(
  title: "[Project Name] Architecture",
  type: "concept",
  tags: ["project", "architecture", "technical", "cross-tool"],
  content: "The project uses [architecture pattern] with [technologies]. Key components include: [list components]. This architecture supports development in [tools list]."
)
```

### 4. Cross-Tool Decisions

Create concept memories for decisions that affect multiple tools:

```
create_memory(
  title: "Decision: [Decision Title] - Multi-Tool Impact",
  type: "concept",
  tags: ["decision", "project", "cross-tool", "[relevant category]"],
  content: "We decided to [decision]. This affects: [affected tools]. Rationale: [reasons]. Implementation in [different tools]: [implementation details]. Future considerations: [implications]."
)
```

### 5. Tool-Specific Sessions

Create session memories that include tool context:

```
create_memory(
  title: "[Tool Name] Session: [Date]",
  type: "session",
  tags: ["session", "[tool-name]", "meeting", "summary"],
  content: "Session in [Tool Name] on [date]. Key points:\n1. [Point 1]\n2. [Point 2]\n\nTool-specific insights:\n- [Tool-specific insight 1]\n- [Tool-specific insight 2]\n\nCross-tool implications:\n- [Implication 1]\n- [Implication 2]"
)
```

## Enhanced Memory Organization System

### Types (Tool-Aware)

Organize memories by type with tool awareness:

- **entity**: People, organizations, or objects (e.g., user profiles, team members, tool preferences)
- **concept**: Abstract ideas, processes, or knowledge (e.g., project requirements, technical decisions, cross-tool workflows)
- **session**: Specific conversations or meetings (e.g., tool-specific sessions, cross-tool summaries)

### Enhanced Tags

Use comprehensive tags to categorize memories across tools:

#### Tool-Related Tags
- `claude-desktop`, `cursor`, `windsurf`, `cline`, `roocode`, `warp`, `antigravity`, `opencode`
- `cross-tool`, `tool-specific`, `workflow`, `integration`

#### User-Related Tags
- `user`, `preference`, `background`, `contact`, `multi-tool`

#### Project-Related Tags
- `project`, `requirement`, `architecture`, `milestone`, `cross-tool`

#### Technical Tags
- `technical`, `code`, `design`, `bug`, `feature`, `implementation`

#### Action-Related Tags
- `task`, `follow-up`, `deadline`, `progress`, `next-steps`

#### Configuration Tags
- `config`, `setup`, `hidden-config`, `visible-config`, `memory-dir`

#### Importance Tags
- `important`, `critical`, `nice-to-have`, `urgent`

### Cross-Tool Relationships

Create relationships between related memories across different tools:

```
relate_memories(
  sourceId: "[memory-id-1]",
  targetIds: ["[memory-id-2]", "[memory-id-3]"]
)
```

Example relationships:
- User preferences ↔ Tool-specific workflows
- Project architecture ↔ Tool implementations
- Decisions ↔ Cross-tool implications
- Sessions ↔ Related project memories

## Tool-Specific Best Practices

### Development Environments (Cursor, Windsurf, Cline, RooCode)
- Focus on code architecture and implementation details
- Remember debugging solutions and code patterns
- Track file organization and project structure
- Maintain development workflow preferences

### Desktop Applications (Claude Desktop)
- Comprehensive project discussions and planning
- High-level decision making and strategy
- Cross-project coordination and knowledge transfer
- Detailed documentation and explanations

### Terminal Tools (Warp, Antigravity)
- Command patterns and terminal workflows
- Script automation and CLI preferences
- Development server management
- Build and deployment processes

### Cross-Tool Coordination
- Maintain consistency when switching between tools
- Remember tool-specific implementations of shared decisions
- Track which tool is best for which type of task
- Preserve context across tool transitions

## Enhanced Conversation Workflow

### Start of Conversation (Tool-Aware)

1. **Identify current tool and context**
2. **Search for relevant memories** about user, project, and current tool
3. **Acknowledge cross-tool context**: "I see we're working in [current tool]. Last time we used [different tool], we discussed [topic]..."
4. **Retrieve tool-specific preferences** and workflows

### During Conversation

1. **Tool-aware memory creation**: Create memories that include tool context
2. **Cross-tool connections**: Relate current work to memories from other tools
3. **Workflow optimization**: Suggest best practices for the current tool based on past experience
4. **Consistency maintenance**: Ensure decisions and preferences are consistent across tools

### End of Conversation

1. **Tool-specific summary**: Include insights specific to the current tool
2. **Cross-tool implications**: Note how this session affects work in other tools
3. **Action items with tool context**: Specify which tools are best for next steps
4. **Knowledge integration**: Connect new memories to existing cross-tool knowledge

## Advanced Multi-Tool Features

### Configuration File Awareness
```
I can see this project uses [hidden/visible] configuration with memory directory: [path]. This means memories will be [hidden/visible] and accessible across all MCP tools.
```

### Working Directory Detection
```
Based on the current working directory and project configuration, I'm using the [project/global] memory store for optimal context management.
```

### Tool Transition Support
```
Since you're switching from [previous tool] to [current tool], I'll maintain our project context and adapt the workflow to this tool's strengths.
```

## Best Practices for Multi-Tool Environments

### 1. Be Tool-Aware
- Always include tool context in memories when relevant
- Adapt communication style to the current tool's strengths
- Remember which workflows work best in which tools

### 2. Maintain Consistency
- Ensure decisions and preferences are consistent across tools
- Use the same tagging system regardless of tool
- Keep project information synchronized across all tools

### 3. Optimize for Each Tool
- Leverage each tool's unique capabilities
- Remember tool-specific shortcuts and features
- Choose the right tool for each type of task

### 4. Cross-Tool Integration
- Create memories that bridge different tools
- Track how work in one tool affects other tools
- Maintain seamless context when switching tools

### 5. Team Collaboration
- Ensure memories are useful for team members using different tools
- Share tool-specific insights that benefit the whole team
- Maintain consistent project knowledge across all team members' preferred tools

## Configuration Customization

### Hidden Configuration (`.mcp-memory.json`)
```json
{
  "memoryDir": ".context/memory",
  "enabled": true,
  "description": "Project with hidden memory for clean organization"
}
```

### Visible Configuration (`mcp-memory.json`)
```json
{
  "memoryDir": "memory", 
  "enabled": true,
  "description": "Project with visible memory for team collaboration"
}
```

## Customization Notes

Customize this template based on your specific multi-tool environment:

1. **Add tool-specific tags** and memory categories for your preferred tools
2. **Adjust memory creation guidelines** for your domain and tool preferences
3. **Modify conversation workflow** to match your multi-tool interaction patterns
4. **Include tool-specific instructions** for your development environment
5. **Add domain-specific memory templates** that work across all your tools
6. **Configure team collaboration** patterns for shared project memories

---

> *Note: This template is designed to work with the MCP memory server v0.1.1, providing universal compatibility across all MCP-enabled tools. Adjust the instructions as needed for your specific multi-tool environment.* 