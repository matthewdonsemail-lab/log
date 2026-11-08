---
title: "MCP reload"
---

# MCP reload

The log MCP server picks up new code without restarting Claude Code: a reload proxy that never exits owns the client's pipe and swaps the real server underneath it when it's safe. Rule 167.

### REQ-RELOAD-01: logMcp is a proxy that never exits, with the server as its child

`bin/logMcp.ts` runs `runReloadProxy` (`src/mcp/reload/client.ts`) unless it's given `--child` or `--http`, or `LOG_MCP_RELOAD=off`. The proxy spawns `bin/logMcp.ts --child` with Bun and passes every newline-delimited JSON-RPC line both ways. It keeps the client's `initialize` request. It tracks each request it forwards until the child answers it. It exits only when the client closes its stdin.

Checked by: code and SubQ

### REQ-RELOAD-02: A reload waits until nothing is running, then replays initialize

`ReloadProxy.reloadDue` is true only when the code stamp is newer than the child's stamp, that stamp didn't already fail, no request is in flight and `jobsRunning` (jobs in `listJobs` whose pid is the child's, still running) is empty. Otherwise it records what it waits on (`waitingOn`). It runs on every request and on a timer (`tick`). The stamp it reads is cached (`codeStampWatcher`): reading it never walks the source tree. A file watcher marks it dirty when a `.ts` or `.py` file changes, and the timer walks the tree again only then, or once a minute in case a watch event was lost. So no tool call waits on the walk, which took about 79 ms per call (issue #99).
- `reload` starts a new child and writes the saved `initialize` to it with its own id.
- The child's answer to that id isn't forwarded.
- When it comes, the proxy sends `notifications/initialized` to the new child, stops the old one (`killed`, so its exit isn't a crash), sends `notifications/tools/list_changed` to the client and passes on the lines it queued meanwhile.

Checked by: code and SubQ

### REQ-RELOAD-03: A crash or a failed start never leaves the client hanging

When the child exits on its own, every request in flight gets a JSON-RPC error with `logMcpRestarted` (`restartedMidCall`), and the child is started again with `initialize` replayed. More than 5 crashes in a minute stop the restarts until the code changes again. A new child that exits or doesn't answer `initialize` within 30 s is stopped. The old child keeps serving, `lastError` says why, and the same stamp isn't tried again. A request that comes while no child is running is answered with the same error.

Checked by: code and SubQ

### REQ-RELOAD-04: Its state is recorded and the hook reads it

`runReloadProxy` writes the proxy's state to log.db's `state` table (scope `mcpReload`, keyed by `reloadStateFile`, `LOG_MCP_RELOAD_FILE`, REQ-STORAGE-17): the proxy and child pids, the child's stamp, the reloads, `waitingOn` and `lastError`. Each reload is logged to stderr and the live log. `staleServerLine` reads it (`readProxyState`). While the proxy is alive, it never tells matt to restart, only what the reload waits on or why the new code failed.

Checked by: code and SubQ

### REQ-RELOAD-05: A call the client cancels is caught, finished and kept

When the client cancels a call (`notifications/cancelled`), the proxy stops counting it as in flight (`cancelledId`), so it never holds a reload back, and logs which tool was cancelled after how long; `waitingOn` names each call still in flight with its tool and how long it has run (`callName`). The server runs the cancelled call to its end, so nothing is left half done, and says so in the live log (`✕ the client cancelled call …`). An ordinary call's answer is kept as a job (`startJob`, `finishJob`, `cancelledByClient`) to be read with `jobStatus`, and its timing marks it (`cancelledByClient`, `keptAsJob`); a job keeps running and says how to follow it.

Checked by: code and SubQ
