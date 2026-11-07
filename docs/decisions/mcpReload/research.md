# Research findings (Parallel and GitHub, 2026-11-07)

## Claude Code and tools/list_changed

- An Anthropic collaborator wrote on 2026-05-23 (anthropics/claude-code#4118) that handling for notifications/tools/list_changed shipped in 2.1.0 and is active. The docs say that in an interactive session Claude Code fetches the updated list, so the server doesn't need reconnecting. In -p mode and the Agent SDK it refreshes the tool list only. If the refresh fails, it keeps the old tools.
- The docs say stdio servers are not reconnected automatically.
- Users' reports:
  - #13646 (2.0.65, Dec 2025): no handler for the notification.
  - #50515 (2.1.113, Windows, stdio, Apr 2026): the tool list stayed frozen, while resources/list_changed worked. A respawned server after a dead pipe didn't re-read tools/list. Closed as not planned.
  - #65698 (2.1.165, Windows, stdio): new tools never became callable.
  - #62844 (headless stream-json, May 2026): not honoured.
  - #77314 (2.1.198, Windows, HTTP, Jul 2026): new tools didn't show in ToolSearch, and /mcp reconnect wasn't enough.
  - #79826 (2.1.215, Windows 11, Jul 2026): closed as a duplicate.
- matt runs Claude Code 2.1.305 on Windows, inside T3 Code. Nothing found covers 2.1.305 either way.
- In #50515 a user worked around the frozen list with one tool registered at startup that runs any action by name. log already has this: logSearch, logGet and logCall (rule 163).

## The pattern that works

A stable stdio proxy owns the client pipe, runs the real server as a child, restarts the child on a file change or a restart tool, and sends tools/list_changed upward. reloaderoo, mcpmon and mcp-reloader all work this way, as does the "minsky mcp proxy" in #4118, which waits for the new child to answer a ping before sending list_changed.

Pitfalls named in the sources:
- New or changed tool schemas may not reach Claude Code on Windows.
- The proxy must never exit, because a dead stdio server isn't reconnected.
- A crash loop needs a restart limit.

Pitfalls from reasoning, not sourced:
- Replay the client's initialize to each new child.
- Answer an error for requests caught mid-swap, or hold them.
- Keep stdout as newline-delimited JSON only.
- On Windows, kill the child's whole process tree.

## log's own facts

- `.mcp.json` runs `bun bin/logMcp.ts` over stdio. `bin/logMcp.ts` records the server's start and code stamp (`recordServerStart`), and the hook compares it with `codeStamp` (newest .ts/.py under src, python, vendor/fbk/src) to say the server is stale.
- Long jobs run inside the MCP server process: `LONG_RUNNING` commands start a job (`startJob`, `~/.logCli/mcp/jobs`, each record holding the server's pid and status running), and the call returns while the job keeps going. Queue runs with keepOpen and watches run for hours (rules 107, 114).
- Each account's platform session lives in its own host process outside the MCP server (rules 105, 129), so restarting the MCP server doesn't drop the platform sessions.
- The MCP server already declares tools listChanged and sends tools/list_changed when a flow file changes.
