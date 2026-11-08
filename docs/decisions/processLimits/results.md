# Results: the process-limits matrix (SubQ, 2026-11-08)

`bun docs/decisions/processLimits/runMatrix.ts` ran 17 calls on `subq-snap-preview`, with 263,162 input tokens. Each call carried this folder's `issue.md` and `research.md`, `docs/hookStartup.md`, `.claude/settings.json`, `python/twitterApi/host.py` and the MCP proxy's code. The raw answers are in `subqResults.json`.

## D1: how Claude Code's hooks reach log's code

**Chosen: E. Hooks that add context become one `type: "http"` request per event to the warm service. The two refusing PreToolUse hooks stay separate Bun processes, started directly with `args` and no shell.** SubQ gave it 87% probability (confidence 0.84).

| Option | latency | refusal safety | Windows fit | effort | observability | robustness | total (of 24) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A Bun per hook through Git Bash (today) | 0.7 | 3.5 | 3.4 | 3.8 | 1.3 | 3.8 | 16.5 |
| B Bun per hook, exec form | 1.4 | 3.9 | 3.9 | 3.5 | 2.1 | 3.9 | 18.6 |
| C One Bun process per event | 1.8 | 3.6 | 3.1 | 2.1 | 1.9 | 3.7 | 16.2 |
| D http per event, every hook | **3.9** | 0.8 | **4.0** | 2.4 | 3.4 | 2.5 | 16.8 |
| **E http for context, exec form for refusals** | 2.7 | **3.9** | 3.9 | 2.5 | **3.6** | 3.1 | **19.6** |

D is the fastest, but if the service is down, a failed http hook lets a bad call through: refusal safety 0.8. E keeps D's speed for every hook that only adds context, and keeps the refusals working whatever happens to the service.

## D2: how log's Bun side reaches the Python engines

**Chosen: C. Bun connects straight to the account's long-lived host over a new loopback TCP connection per call (newline JSON, the host's token), with no Python relay, and every platform gets a host.** Confidence 0.82.

| Option | latency | one session | robustness | Windows fit | effort | observability | total (of 24) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A Python per call, relaying to a host (X, Instagram today) | 0.6 | 3.8 | 3.1 | 4.0 | 3.8 | 2.9 | 18.2 |
| B Python per call, no host (Discord, Slack, Reddit today) | 0.1 | 0.4 | 1.9 | 3.9 | 3.8 | 2.6 | 12.6 |
| **C Bun to the host, new connection per call** | 2.8 | 3.8 | 3.2 | 3.9 | 2.5 | 3.0 | 19.2 |
| D Bun to the host, kept-open connection | 3.2 | 3.9 | 3.3 | 3.8 | 2.2 | 3.2 | **19.6** |
| E stdio pipe to a child host per MCP server | 3.0 | 0.1 | 2.4 | 3.8 | 2.1 | 2.9 | 14.2 |
| F Windows named pipe | 2.9 | 3.6 | 2.9 | 1.2 | 1.9 | 2.7 | 15.3 |
| G AF_UNIX | 2.9 | 3.8 | 3.0 | 0.7 | 2.0 | 2.9 | 15.4 |
| H Shared memory | 2.7 | 3.6 | 2.4 | 1.5 | 1.2 | 1.9 | 13.2 |
| I Port the clients to TypeScript | 3.2 | 2.3 | 2.5 | 1.4 | 0.4 | 2.7 | 12.4 |

C and D are within half a point. The kept-open connection saves about 1 ms per call (measured), against a change to the host's protocol: request ids, many requests per connection, and reconnecting. So C comes first, and D only if the measured 1 ms ever matters. A stdio pipe to a child host (E) breaks one session per account. Named pipes, AF_UNIX and shared memory don't fit Python on Windows. Porting the clients is the largest job, for the same latency.

## Claims

All 15 were judged true, 14 of them at 0.92 or above:
- hooks run side by side on 2.1.305;
- `args` runs with no shell;
- an http hook's context reaches the model;
- a process costs at least four orders of magnitude more than a system call;
- Git Bash adds 100 ms or more;
- every kept-open transport is under 1 ms at p99 and under 2 ms at p99.9;
- a new connection adds about 1 ms;
- no Nagle stall here;
- most of `host.connect` isn't TCP;
- the host refuses requests over 64 KiB;
- a child host breaks one session per account;
- a blocking call stalls an event loop;
- the proxy walks the tree on each call;
- asyncio on Windows has no Unix-socket server.

The weakest is "kept-open transports differ by under 1 ms at p99.9", at 0.69.

## The order of work

1. The MCP proxy stops walking the source tree on the call path (issue #99, item 1). It is outside the matrix and needs no choice.
2. D2 C: Bun calls the X and Instagram hosts directly. The host's 64 KiB limit is raised, and `host.json` is read once and cached.
3. D1 E: the hook registry writes http hooks per event and exec-form refusals, and the warm service answers each event's hooks in one request, with embedding moved off its event loop.
4. Hosts for Discord, Slack and Reddit, through D2 C.

Each step is measured before and after with the method in issue #99.
