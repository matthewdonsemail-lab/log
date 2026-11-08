# Why tool calls are slow: process start-up, measured

matt, 2026-11-08: the database is lean and fast, but tool calls are slow, because every hook and every engine call starts a new process. This page measures where that time goes, collects what GitHub says about it, and sets out what to change so tool calls meet p99.9. It builds on `docs/storageReadPath.md`.

Everything was measured on matt's machine (Windows 11, Bun 1.4.0, Python 3.12, Claude Code 2.1.305) on 2026-11-08. Processes were started from a Bun script with `Bun.spawnSync`, 21 to 31 runs each, unless the row says Git Bash.

## What a tool call pays today

### Hooks, around every tool call

Claude Code runs 2 hooks before every tool call (`chatNames`, `liveLogs`) and 4 after it (`inbox`, `queue`, `xLive`, `pageState`), each one a new Bun process. 7 run on every prompt and 8 at session start. Claude Code runs matching hooks side by side, so a tool call waits for the slowest hook before it and again for the slowest after.

| Hook (real script, realistic input) | Started directly | Through Git Bash (how Claude Code starts it) |
| --- | --- | --- |
| `chatNames` | p50 76 ms, p90 84 | p50 196 ms, p90 217 |
| `liveLogs` | p50 79 ms, p90 96 | p50 200 ms, p90 248 |
| `pageState` | p50 101 ms, p90 115 | p50 209 ms, p90 263 |

So each tool call waits about 200 to 260 ms for its hooks before it runs, and again after. A turn of 20 tool calls spends 8 to 10 seconds in hooks alone.

### Where a hook's time goes

| Step | p50 |
| --- | --- |
| Windows starting any process (`cmd /c exit`) | 24 ms |
| `bun -e 0` with the repo as its folder | 48 ms |
| `bun -e 0` with an empty folder inside `%TEMP%` | 81 ms (Bun lists every folder above it; see bun#48125 below) |
| Running a `.ts` file instead of `-e` | about +40 to 50 ms |
| Importing log's inbox store | 79 ms total |
| Opening SQLite and one query | under 1 ms |
| Going through Git Bash first | about +115 to 120 ms |

The database is under 1% of a hook's time. Git Bash is the largest single piece, then Bun loading and compiling the script's TypeScript.

### Engine calls, inside a tool call

From the timing spans log already records (rule 165, 2,957 spans, 2026-11-07 12:23 to 2026-11-08 00:53 UTC):

| Stage | Calls | p50 | p95 | p99 |
| --- | --- | --- | --- | --- |
| `python.start` (process start until log's timing module loads) | 232 | 400 ms | 531 ms | 714 ms |
| `python.imports` (the engine's own imports) | 232 | 352 ms | 471 ms | 725 ms |

Discord, Slack and Reddit start a new Python process for every engine call, so each one pays about 750 ms before it does any work. X and Instagram already keep one long-lived host per account (rules 105, 129), so they don't.

Python's own start is quick (`python -c pass`: 70 ms). The time is in imports. `python -X importtime` on the Discord engine shows 297 ms to import it, and 250 ms of that is the standard library's `asyncio`, with every module costing 2 to 5 ms. That pattern looks like each file being scanned as it's opened. The agent-guardrails issue below found Windows Defender doing exactly this. On this machine it's a likely cause, not a confirmed one.

Some of the long tool times are on purpose, not latency. `discordSendLive` p50 is 9.8 s because the governor spaces the lines of a message (rules 104, 161). Nothing here should shorten that.

## What GitHub says

Found through the GitHub API (`gh api search/issues`), each read in full.

**Bun**
- [oven-sh/bun#48125](https://github.com/oven-sh/bun/issues/48125), open, 2026-11-07. Bun's start-up grows with the number of files in the working folder and every folder above it: 6 ms in an empty folder, about 160 ms with 200,000 files next to it. It's the `.env` and `bunfig.toml` lookup listing whole folders. No flag avoids it for plain `bun`. The fix is [oven-sh/bun#48148](https://github.com/oven-sh/bun/pull/48148), still open. It shows here as 48 ms in the repo against 81 ms in `%TEMP%`.
- [oven-sh/bun#21596](https://github.com/oven-sh/bun/issues/21596), closed. `bun build --compile --bytecode` did not make start-up faster. Compiling isn't the fix.
- [oven-sh/bun#11636](https://github.com/oven-sh/bun/issues/11636), closed. Bun starting slower than Node on Windows (older report).
- [oven-sh/bun#29286](https://github.com/oven-sh/bun/issues/29286) and [oven-sh/bun#34835](https://github.com/oven-sh/bun/issues/34835), open. Bytecode files without `--compile`, for the pattern of long-lived worker processes that load code once.

**Claude Code**
- [anthropics/claude-code#90122](https://github.com/anthropics/claude-code/issues/90122), open. On Windows, command hooks always run through Git Bash, and the `commandWindows` field some plugins use is ignored. Several hooks starting at once can also trip a Git Bash fork race (`add_item … errno 1`) and time out.
- [anthropics/claude-code#103118](https://github.com/anthropics/claude-code/issues/103118), open. In the VS Code extension on Windows, in the default permission mode, each tool call waits 6 to 30 s before hooks start; with `bypassPermissions` on the same machine it's about 80 ms. It's worth knowing if a session is ever run in default mode.
- [anthropics/claude-code#95354](https://github.com/anthropics/claude-code/issues/95354), open. Windows sessions hanging after a `PreToolUse` hook returns.
- [anthropics/claude-code#87289](https://github.com/anthropics/claude-code/issues/87289), open. A hook stuck reading its input ignores its timeout and holds the tool call.
- The [hooks reference](https://code.claude.com/docs/en/hooks) shows the ways around a shell, all supported by the 2.1.305 installed here:
  - `args`: with `args`, `command` is started directly with no shell.
  - `shell`: `bash` or `powershell`.
  - `type: "http"`: the hook's input is POSTed to a URL and no process starts.
  - `async`: the hook runs in the background.

**Others who measured the same thing**
- [CtrlCarlitos/agent-guardrails#460](https://github.com/CtrlCarlitos/agent-guardrails/issues/460): measure before building. Their Windows hooks took 60 to 150 ms against 5 ms under WSL.
  - Most of it was two `git` processes started per call; moving that work in-process took p50 from 140 to 51 ms.
  - Before an exact-file exclusion, Windows Defender scanning added more.
  - Their conclusion is to keep the in-process work small; what's left is process creation.
- Repos VIBE BOT linked, for the long-lived worker pattern: [hieutrtr/claude-bridge](https://github.com/hieutrtr/claude-bridge), [fast-gateway-protocol/fgp](https://github.com/fast-gateway-protocol/fgp) and [nexvigilant/mcp-subprocess-pool](https://github.com/nexvigilant/mcp-subprocess-pool). These show the pattern only. None has independent measurements.

## Built (issue #99, 2026-11-08)

Items 1, 2 and 4 below are built. Measured against the warm service, isolated from the real watchers:

| Path | p50 | p99 | p99.9 |
| --- | --- | --- | --- |
| Before: 4 PostToolUse hooks at once through Git Bash | 472 ms | 1377 ms | n/a |
| After: PostToolUse as one http hook (n=2000) | 8.0 ms | 12.2 ms | 14.3 ms |
| After: UserPromptSubmit as one http hook (n=300) | 9.6 ms | 15.0 ms | 17.4 ms |

Through http, the prompt event first measured p50 100 ms. Two synchronous calls on the service's event loop caused it: the code-stamp walk (85.7 ms) and `git status` (85.5 ms). `cachedFreshness` now reads the stamp from the `fs.watch` watcher, and reruns `git status` only when the stamp moves or once a minute.

## What to change, biggest saving first

1. **Hooks become `type: "http"` calls to the warm service.** The context service (rule 159) is already one long-lived Bun on `127.0.0.1:47317`. Today the prompt hook reaches it with `curl` through Git Bash, which starts two processes to avoid one. As an `http` hook it starts none.
   - The service answers `inbox`, `queue`, `xLive`, `pageState`, `storage`, `engines`, `knowledge` and `useCases` from its open `log.db` connection and warm caches.
   - Expected: a few milliseconds per hook instead of about 200.
2. **The two `PreToolUse` hooks start Bun directly** (`"command": "bun", "args": [...]`), with no Git Bash.
   - These refuse calls (rules 106, 155), so they have to work even when the service is down. A failed `http` hook is non-blocking, which would let a bad call through.
   - Expected: about 80 ms instead of about 200.
   - Once the service has proved itself, they can move to `http` with `onFailure: "block"`.
3. **Discord, Slack and Reddit get the long-lived host that X and Instagram already have** (rules 105, 129): one Python process per account, imported once, each call a round trip.
   - Expected: saves about 750 ms per engine call.
4. **The hook registry generates both forms.** `src/agentHooks/registry` writes `.claude/settings.json`, and Codex's file, as `http` or exec-form entries. `check:agentHooks` refuses a hook that would go through a shell.
5. **Upgrade Bun when bun#48148 lands.** It matters for any child process started with its working folder in `%TEMP%`.
6. **Not worth doing:** compiling hooks to an executable with bytecode (bun#21596).
7. **matt's call, not ours:** Windows Defender exclusions for the Python and Bun installs and the repo might cut the per-file import cost. It's a security setting, so it's left to matt. Measure the import time before and after if he does it.

## Measuring it all the time

The book's rule is to measure at the caller, as a distribution, with its tail (ch. 1). Today `~/.logCli/contextLayer/timings.jsonl` records only the context hook's in-process time, so nothing records what a hook really costs.

- **Every hook invocation becomes a span** (`tool` = `hook:<name>`, `event`):
  - `bootMs` (`process.uptime()` at the script's first line, for the ones that still start a process);
  - `handleMs`;
  - `waitedMs`, the time from Claude Code sending the payload to the answer, where the service can see it.
- **`log timing hooks --probe`** starts each hook exactly as Claude Code would (`http`, exec form, or Git Bash, from the settings file), 1,000 times, and reports p50, p95, p99 and p99.9 with `n`, the way this page was measured by hand.
- **Engine calls already record `python.start` and `python.imports`.** Once hosts exist, `host.roundTrip` replaces them.

## Targets

| Path | p99 | p99.9 |
| --- | --- | --- |
| All `PreToolUse` hooks for one tool call (what the tool waits for) | ≤ 100 ms (exec form), ≤ 15 ms once on `http` | ≤ 150 ms, then ≤ 30 ms |
| All `PostToolUse` hooks for one tool call | ≤ 15 ms | ≤ 30 ms |
| A prompt's hooks | ≤ 30 ms | ≤ 60 ms |
| An engine call's overhead before its action (through a host) | ≤ 20 ms | ≤ 50 ms |
