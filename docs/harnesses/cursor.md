# Cursor

- **Connects:** to either. The hosted server goes in `mcp.json` with the URL. `logMcp` runs over stdio when log is on the same machine.
- **Draws MCP Apps:** yes, since Cursor 2.6. Apps run in a sandboxed iframe. ([Cursor 2.6: MCP Apps](https://forum.cursor.com/t/cursor-2-6-mcp-apps/153482))
  - Cursor is listed in the [support matrix](https://modelcontextprotocol.io/extensions/client-matrix).
  - One user reported apps stopped rendering in a later version. ([forum report](https://forum.cursor.com/t/mcp-apps-stopped-rendering-in-3-10-20-worked-in-3-9-16/165167)) That's a single report, not confirmed, so test on the current version.
- **Guidance:**
  - **Prompt hooks:** Cursor has them. `hooks.json`, project (`.cursor/hooks.json`) or user (`~/.cursor/hooks.json`), takes a `beforeSubmitPrompt` event. ([Cursor hooks](https://cursor.com/docs/agent/hooks))
  - **The gap:** log installs its hooks for Claude Code and Codex only (`HookHost` in `src/agentHooks/registry`). So the prompt router doesn't run in Cursor until log writes a `beforeSubmitPrompt` hook there.
  - **Server instructions:** whether Cursor passes them to the model isn't documented. The tool descriptions name `getGuide` either way.
- **Not verified:**
  - log's view and sign-in in Cursor
  - which widget actions Cursor supports
  - whether a `beforeSubmitPrompt` hook can add context for the model, the way Claude Code's `UserPromptSubmit` can
