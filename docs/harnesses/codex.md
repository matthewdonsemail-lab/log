# Codex

- **Connects:** to either. MCP servers go in `config.toml`, either `~/.codex/config.toml` or a trusted project's `.codex/config.toml`. A Streamable HTTP server takes `url`; a stdio server takes `command`. `codex mcp add` writes the same entry. ([Codex: MCP](https://developers.openai.com/codex/mcp.md))
- **Draws MCP Apps:** not listed in the [support matrix](https://modelcontextprotocol.io/extensions/client-matrix).
  - `report` comes back as text.
  - Signing in happens in the window on the owner's screen or in the log console.
- **Guidance:**
  - **Prompt router:** yes. Codex has hooks, in `hooks.json` or a `[hooks]` table in `config.toml`. ([Codex hooks](https://developers.openai.com/codex/hooks)) log installs its hooks for Codex too (`HookHost` includes `codex`): its `UserPromptSubmit` hook calls the context layer service for the route (REQ-MCP-17).
  - **Server instructions:** used. OpenAI says Codex uses them alongside tool metadata. ([OpenAI: build an MCP server](https://developers.openai.com/plugins/build/mcp-server))
