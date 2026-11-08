# Tool call speed: what matt and VIBE BOT worked out, and what to bring in

matt asked VIBE BOT in vibe coders university #❓｜bot-help (2026-11-08, 01:27 to 01:44 UTC) how to make tool calls fast when the database already is. This page sets out what was asked, what VIBE BOT outlined, what is verified, and the outside projects and libraries that can bring the speed-up into log. Measurements are in `docs/hookStartup.md`; the data side is in `docs/storageReadPath.md`.

## What matt asked

1. Why does a tool call spend almost all its time starting Bun, when Bun is meant to be fast, and how do we make it start faster?
2. Find, through the GitHub API, the repos and Bun issues about the fastest possible start-up.
3. The model calls a tool, the tool starts a process, the process is slow, and the platform's own pace (which is fair) adds to it. Why the waiting, when the data is already there? The context should be in memory, and each run should be visible as a process in a Monitor, so its result is known without guessing or starting it by hand.
4. How does this tie into the observability layer, so every part can be given its p50, p95 and p99?
5. Find people on GitHub who have built this observability layer, and resources on language and process optimisation, as a starting basis.
6. Store the traces in the database, so the processes can be traced and queried there, and the right context injected into the agent through the hooks. That makes an optimisation layer that heals itself and passes context to the agent by the fastest route.

## What VIBE BOT outlined

- **Two waits are tangled together.** One is the host starting or reaching the MCP server. The other is the tool doing its work. A stdio MCP server is meant to stay up for the whole session, not start per call.
- **Time one call at six boundaries:**
  1. the hook starts;
  2. the MCP server starts, if it starts at all;
  3. `initialize` and tool listing finish;
  4. the host sends `tools/call`;
  5. log's handler starts, finishes its work and writes its answer;
  6. the host gets the answer.
- **Split a process's cost.** Separate process start, imports, database open, context load and state-machine set-up. Only call it "Bun start-up" if an empty script is slow too.
- **Keep one worker alive.** It holds the code and the database connection, and each call becomes a request to it.
- **One trace id ties it together:** prompt, hook, MCP call, process, action, database rows. Telemetry stores ids, timings and outcomes, never message text.
- **Measure each call's interval first, then compute percentiles from those.** Never subtract or average percentiles. Report cold launches and warm calls separately. Compare CPU time with wall time: a lot of wall time with little CPU means start-up, I/O or waiting.
- **It read the log repo.** The MCP server already stays up through the reload proxy (`bin/logMcp.ts`, `docs/mcp.md`). `docs/callTiming.md` already gives per-call spans in `log.db`. `docs/contextLayer.md` keeps hook timings in a separate JSONL file. So the two aren't joined yet.

## What is verified, and what isn't

Measured on matt's machine (`docs/hookStartup.md`):
- The MCP server stays up. The per-call start-up cost is in two places: hooks (6 new Bun processes per tool call, about 200 to 260 ms each through Git Bash), and Discord, Slack and Reddit engine calls (a new Python process each, about 750 ms).
- An empty Bun script takes 48 ms in the repo, so Bun itself is not the main cost. Git Bash (+115 to 120 ms), loading the script's TypeScript, and Python's imports are.

VIBE BOT was right that the database isn't the bottleneck and that a warm worker is the fix. It said itself that its outside projects' speed claims are self-reported. Several of its search results were dated in the future, and it left those out.

## Projects and libraries, checked on GitHub

Each checked with `gh api repos/<repo>` on 2026-11-08.

| Project | Stars, language, licence | What it gives log | Use it as |
| --- | --- | --- | --- |
| [mauribadnights/clooks](https://github.com/mauribadnights/clooks) | 2, TypeScript, MIT | A persistent hook runtime for Claude Code. `clooks migrate` turns command hooks into `type: "http"` hooks served by one daemon. A SessionStart hook makes sure the daemon is running, a handler is turned off after 3 failures in a row, and `clooks stats` shows timings. Its own benchmark, on macOS: 22 ms per command hook against 0.19 ms per HTTP hook at p50 (0.88 ms at p99). It only ships launchd and systemd services, not Windows | The design for log's hooks (port the ideas; MIT allows it) |
| [anhermon/mcp-trace](https://github.com/anhermon/mcp-trace) | 0, Go, MIT | A proxy between the MCP client and the server that emits one OpenTelemetry span per JSON-RPC request, `tools/call` included | The shape of the MCP-boundary span. log's own reload proxy already sits on that pipe |
| [grafana/mcp-grafana](https://github.com/grafana/mcp-grafana), [observability](https://github.com/grafana/mcp-grafana/tree/main/observability) | 3,646, Go, Apache-2.0 | A production MCP server's tracing and metrics, with tests (added in its PR #506) | Reference for span names, metrics and tests |
| [sammcj/mcp-devtools](https://github.com/sammcj/mcp-devtools), [observability.md](https://github.com/sammcj/mcp-devtools/blob/main/docs/observability.md) | 164, Go, Apache-2.0 | OpenTelemetry traces, histograms of tool durations, and written p50/p95/p99 queries | Reference for the histogram and percentile design |
| [disler/claude-code-hooks-multi-agent-observability](https://github.com/disler/claude-code-hooks-multi-agent-observability) | 1,567, Python, no licence | Every Claude Code hook event recorded and shown as a timeline | Reference only (no licence, so nothing copied) |
| [yeet-src/claudetree](https://github.com/yeet-src/claudetree) | 0, JavaScript, no licence | A live tree of the processes a Claude session starts | Reference only, for seeing what spawns |
| [sharkdp/hyperfine](https://github.com/sharkdp/hyperfine) | 29,225, Rust, Apache-2.0 | The tool Bun's own docs recommend for timing CLI start-up | A benchmark tool. Installing it means downloading a binary, so it's matt's call; the `Bun.spawnSync` harness in `hookStartup.md` does the same job without it |
| [Bun's benchmarking docs](https://github.com/oven-sh/bun/blob/main/docs/project/benchmarking.mdx) and [bench suite](https://github.com/oven-sh/bun/tree/main/bench) | Bun | `--cpu-prof` for CPU inside a process, and `Bun.nanoseconds()` | How to profile inside the warm service |
| [yetanotheraryan/coldstart](https://github.com/yetanotheraryan/coldstart) | 11, TypeScript, MIT | Module-load timing tree for Node | The idea only; it doesn't profile Bun |
| [faucetdb/mcp-db-benchmark](https://github.com/faucetdb/mcp-db-benchmark) | 0, Go, MIT | SQLite and other databases benchmarked through real MCP `tools/call` | Method only; its numbers aren't log's workload |
| [hieutrtr/claude-bridge](https://github.com/hieutrtr/claude-bridge), [fast-gateway-protocol/fgp](https://github.com/fast-gateway-protocol/fgp), [nexvigilant/mcp-subprocess-pool](https://github.com/nexvigilant/mcp-subprocess-pool) | 9, 1 and 0 stars, MIT | Long-lived daemons and process pools in front of tools | The pattern only; tiny projects with self-reported speed-ups |

The Bun and Claude Code issues behind this (bun#48125 and its fix #48148, bun#21596, claude-code#90122, #103118, #95354, #87289, agent-guardrails#460) are in `docs/hookStartup.md`.

## How it comes into log

Built on what log already has: the context service (rule 159), the reload proxy that owns the MCP pipe (rule 167), the timing spans in `log.db` (rule 165) and the unified store (#96).

1. **Hooks become HTTP hooks to the warm service.** This is clooks' design on log's own service.
   - The registry (`src/agentHooks/registry`) writes `type: "http"` entries.
   - The context service answers every hook from its open `log.db` connection.
   - A SessionStart command hook starts the service if it isn't running.
   - A handler that fails 3 times in a row is turned off and raised loudly.
   - The two refusing `PreToolUse` hooks start Bun directly (`args`, no Git Bash) until the service has proved itself.
2. **The MCP boundary gets its own clock.** This is mcp-trace's span, inside the reload proxy. The proxy already sees every JSON-RPC message. It records when each `tools/call` arrives, when the child server takes it, and when the answer is written. So the time spent before log's handler starts is no longer invisible.
3. **One trace id from prompt to database.**
   - The hook payload's `session_id` plus a prompt counter makes a `promptId`.
   - Hook spans, the MCP call's spans, engine spans and the `actions` rows all carry it.
   - Hook timings move out of `~/.logCli/contextLayer/timings.jsonl` into the `spans` table, as #96 wants for every `.jsonl`.
   - A query then answers "where did this turn's time go" from one place.
4. **The process boundary is measured where a process still starts.** Each span records:
   - `bootMs` (`process.uptime()` at the first line);
   - CPU time against wall time (`process.cpuUsage()`);
   - the pid and its parent.

   Cold starts and warm calls are reported separately.
5. **Discord, Slack and Reddit get long-lived Python hosts** like X and Instagram (rules 105, 129). That removes about 750 ms per engine call.
6. **The harness.** `log timing hooks --probe` and `benchStorage.ts` take clooks' `benchmarks/bench.ts` as their template:
   - a cold command hook, a warm HTTP hook and a simulated session;
   - p50, p95, p99 and p99.9 with `n`, cold and warm kept apart.
7. **It heals itself from the same spans.**
   - The service reads its own recent spans.
   - A hook or engine path whose p99 crosses its target (`docs/hookStartup.md`) is raised to matt in the hook context, with the slowest stage named.
   - A failing handler is turned off, as in clooks.

   Nothing changes its own route without a person seeing it.

## Order

1. HTTP hooks to the warm service, plus the two `PreToolUse` hooks started directly.
2. Hook timings into `spans`, one `promptId` end to end, and the MCP-boundary clock in the reload proxy.
3. The probe harness, with cold and warm reported separately.
4. Python hosts for Discord, Slack and Reddit.
5. The self-check that raises a path over its target.
