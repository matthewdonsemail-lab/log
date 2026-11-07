## The problem

Claude Code starts the log MCP server (`bun bin/logMcp.ts`, `.mcp.json`) once, when the app opens. Every change to log's code after that leaves the running server on old code, and the hook says so ("The log MCP server … is running older code than the checkout … tell matt to restart the Claude app"). Restarting Claude Code or T3 takes matt about 3 minutes, many times a day.

## What decides it (from research, 2026-11-07)

- **Claude Code never reconnects a stdio server that died** (docs). So whatever owns the pipe must never exit.
- **`notifications/tools/list_changed`:** Anthropic says it's handled since 2.1.0 (#4118, May 2026). But Windows users reported the tool list staying frozen on 2.1.113 to 2.1.215 (#50515, #65698, #77314, #79826). We're on 2.1.305, which hasn't been tested. So a tool that already exists can run new code behind a proxy, while a brand-new tool may only be reachable through log's catalog tools `logSearch` / `logGet` / `logCall` (rule 163) until the app restarts.
- **log runs long jobs inside its MCP server** (queue runs, watches; rules 107, 114). A restart that kills the server mid-job kills the job.

## The options

| | Option | How | Fit |
|---|---|---|---|
| A | [cameroncooke/reloaderoo](https://github.com/cameroncooke/reloaderoo) (npm 1.1.5, 127★, last commit 2026-02-04) | A proxy around the server. It adds a `restart_server` tool the agent calls to swap the child while the client stays connected. Crash controls `--max-restarts`, `--restart-delay`. Windows supported | Restart is manual, by tool. It doesn't know about log's jobs. README: Claude Code "may need manual refresh for new tools" |
| B | [neilopet/mcpmon](https://github.com/neilopet/mcpmon) (10★, 2025-07) | "nodemon for MCP": restarts the server on any file change, client stays connected | Restarts on every save, even mid-job. New tools still need a toggle |
| C | [mizchi/mcp-reloader](https://github.com/mizchi/mcp-reloader) (11★, 2025-07) | Re-imports tool files on change and sends `list_changed`. Restarts the process for other files | Built around a `tools/` folder layout log doesn't have |
| D | **A proxy of log's own** (`src/mcp/reload`) | `logMcp` becomes a small stable proxy that owns the pipe and runs the real server as a child. When the code stamp (`codeStamp`, already used by the hook) is newer and no call or job is running in the child, it starts a new child, replays the client's `initialize`, waits for it to answer, then sends `tools/list_changed`. It answers an error for any call caught mid-swap and kills the old child's whole process tree | Knows log's jobs and code stamp. A few hundred lines to own |
| E | In-process re-import | The server re-imports changed modules with cache-busting, with no process restart | Bun's module cache keeps transitive imports. Fragile |

## Done when

- A code change to log reaches the next tool call **without restarting Claude Code or T3**.
- A running job (a queue run) is never killed by a reload. The swap waits for it.
- The stale-server hook line no longer fires after a change. It's replaced by a line saying the server reloaded.
- A new tool is reachable at once through `logCall`, and directly if Claude Code honours `list_changed`.
