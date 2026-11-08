# Tools research for log issue #99 (2026-11-08)

Source: GitHub API (`gh api search/repositories`, `gh api repos/<r>`, READMEs where noted). Stars / licence / last push as of 2026-11-08.

## 1. Claude Code hook daemons / HTTP hook servers

| Repo | Stars | Licence | Push | Lang | What | Verdict |
|---|---|---|---|---|---|---|
| mauribadnights/clooks | 2 | MIT | 2026-03-26 | TS | Persistent HTTP hook daemon; `migrate` rewrites command hooks to `type: http`, manifest dispatch, auto-disable after 3 fails, token auth | reference: exact D1 shape, but tiny, stale since March, service install is launchd/systemd only (no Windows) |
| kkrlstrm/cc-logger | 12 | AGPL-3.0 | 2026-10-19 | Python | HTTP hooks record sessions/tool calls to Postgres | reference only (AGPL, Postgres) for event schema |
| Edmonds-Commerce-Limited/claude-code-hooks-daemon | 4 | MIT | 2026-11-08 | Python | Long-running daemon; thin forwarder per event over a Unix socket; priority handlers, lazy start, auto-shutdown | reference for handler/priority + lazy-start design; no (Unix socket, still spawns a forwarder per event) |
| disler/claude-code-hooks-multi-agent-observability | 1567 | none | 2026-02-08 | Python | Hooks POST events to a Bun server + SQLite, live UI | reference (no licence): event->SQLite schema |
| cameronsjo/cadence-hooks | 3 | NOASSERTION | 2026-11-04 | Rust | All hooks compiled into one Rust binary, sub-ms cold start | reference for the two exec-form refusing hooks idea; no (licence unclear, Rust) |
| SantiagoBobrik/agent-pulse | 5 | MIT | 2026-03-03 | Go | Local event gateway fanning out agent lifecycle events | no |
| dirien/yet-another-agent-harness | 19 | MIT | 2026-05-31 | Go | Go harness: hooks, middleware chains, session tracking | reference (middleware chain) |
| johnlindquist/claude-hooks | 397 | MIT | 2025-08-08 | TS | Typed TS hook payloads (command hooks via Bun) | reference for hook payload types; stale |
| GobbyAI/gobby | 22 | NOASSERTION | 2026-11-06 | Python | Local daemon orchestrating tasks via hooks | no |

Conclusion: nothing mature; D1 stays hand-rolled (Bun.serve on 127.0.0.1 is ~50 lines). Borrow clooks' migrate/sync and token idea, disler's event schema.

## 2. MCP stdio proxies / multiplexers / gateways / reload

| Repo | Stars | Licence | Push | Lang | What | Verdict |
|---|---|---|---|---|---|---|
| edimuj/callmux | 9 | MIT | 2026-10-24 | TS | Shared listener daemon + per-session stdio bridge that reconnects; batching, caching, pipelining, Prometheus metrics; `createListener()` embeddable; `callmux call` CLI | reference (closest to log's reload proxy + shared server; young, 9 stars) |
| cameroncooke/reloaderoo | 127 | MIT | 2026-02-04 | TS | Transparent hot-reload proxy, `restart_server` tool, Windows badge | reference (already scored in decision; log's own proxy won) |
| neilopet/mcpmon | 10 | MIT | 2025-07-10 | TS | HMR proxy for MCP servers on file change | no (stale) |
| mizchi/mcp-reloader | 11 | MIT | 2025-07-01 | JS | File watch + tools/list_changed | no (stale) |
| supercorp-ai/supergateway | 2950 | MIT | 2026-10-26 | TS | Runs a stdio MCP server over Streamable HTTP/SSE | reference: if one server shared across sessions is wanted, front the child with HTTP |
| sparfenyuk/mcp-proxy | 2816 | MIT | 2026-11-07 | Python | stdio <-> Streamable HTTP bridge | no (Python hop) |
| punkpeye/mcp-proxy | 293 | MIT | 2026-11-05 | TS | stdio -> HTTP/SSE proxy library | reference |
| tbxark/mcp-proxy | 743 | MIT | 2026-09-15 | Go | Aggregates many MCP servers behind one HTTP server | no |
| 1mcp-app/agent | 529 | Apache-2.0 | 2026-11-05 | TS | Aggregates MCP servers into one | no (aggregation not needed) |
| metatool-ai/metamcp | 2754 | MIT | 2026-06-22 | TS | Aggregator/middleware in Docker | no (Docker) |
| IBM/mcp-context-forge | 4769 | Apache-2.0 | 2026-11-07 | Python | Enterprise gateway/registry with observability | no (heavy) |
| Bigsy/mcpmu, obot-platform/mmmcp | 19 / 8 | MIT | 2026 | Go | Multiplexers | no |
| modelcontextprotocol/typescript-sdk | 13730 | NOASSERTION(MIT) | 2026-11-05 | TS | Official SDK; Streamable HTTP transport with sessions | adopt (already used) if moving child to HTTP |

## 3. Bun/Node <-> Python long-lived RPC over sockets

| Repo | Stars | Licence | Push | Lang | What | Verdict |
|---|---|---|---|---|---|---|
| microsoft/vscode-languageserver-node (vscode-jsonrpc) | 1796 | MIT | 2026-11-06 | TS | Battle-tested JSON-RPC over streams/sockets, cancellation, progress; works on Windows | adopt-candidate on the Bun side if LSP-style framing (Content-Length) is acceptable; else reference |
| openlawlibrary/pygls | 814 | Apache-2.0 | 2026-11-03 | Python | asyncio JSON-RPC server/client (`start_tcp`, `start_io`), used by many LSPs, Windows CI | adopt-candidate on the Python side if pairing with vscode-jsonrpc framing |
| shogowada/json-rpc-2.0 | 250 | MIT | 2026-09-20 | TS | Transport-agnostic, typed, zero-dep JSON-RPC 2.0 client/server | adopt for Bun side with newline JSON over Bun.connect (D2 as decided) |
| tedeh/jayson | 727 | MIT | 2026-10-31 | JS | JSON-RPC client/server incl. TCP | reference (Node net; heavier) |
| bensynapse/jsonrpcserver | 208 | MIT | 2026-11-06 | Python | Dispatch-only JSON-RPC 2.0 (bring your own transport) | adopt for Python host side under asyncio.start_server + readline |
| msgpack/msgpack-javascript | 1567 | ISC | 2026-07-13 | TS | MessagePack codec, streaming decoder | reference: only if JSON parse shows up in spans |
| neovim/node-client + neovim/pynvim | 536 / 1708 | MIT / Apache-2.0 | 2026 | TS/Py | Production msgpack-rpc pair over sockets/pipes incl. Windows named pipes | reference for reconnect + msgpack-rpc on Windows |
| extremeheat/JSPyBridge | 856 | MIT | 2025-09-25 | Python | Node<->Python object bridge over stdio | no (object proxying, stdio, per-process) |
| zeromq/zeromq.js | 1604 | MIT | 2026-10-25 | TS | ZeroMQ native bindings | no (native addon risk under Bun, extra dependency for loopback) |
| msgpack-rpc/msgpack-rpc-python | 211 | none | 2021 | Python | Old Tornado msgpack-rpc | no (dead) |

## 4. Latency recording and load generation

| Repo | Stars | Licence | Push | Lang | What | Verdict |
|---|---|---|---|---|---|---|
| HdrHistogram/HdrHistogramJS (hdr-histogram-js) | 130 | BSD-2-Clause | 2026-11-07 | TS | Official TS port, optional WASM, coordinated-omission correction, percentile distribution output, encode/decode | adopt (pure-JS mode works in Bun; use for p50..p99.9 + serialised histograms in SQLite) |
| HdrHistogram/HdrHistogram_py | 163 | Apache-2.0 | 2026-10-12 | Python | Python port, compatible encoding | adopt for Python host spans so histograms merge across languages |
| welch/tdigest | 74 | MIT | 2026-08-26 | JS | t-digest streaming quantiles | no (HdrHistogram is exact-bucketed and fits ms ranges better) |
| CamDavidsonPilon/tdigest | 408 | MIT | 2023-05-04 | Python | t-digest | no (stale) |
| tsenart/vegeta | 25244 | MIT | 2026-09-24 | Go | Constant-rate (open-loop) HTTP load tool and library, HDR plots, Windows binaries | adopt for open-loop benchmarking of the HTTP hook service |
| hatoo/oha | 10661 | MIT | 2026-11-02 | Rust | HTTP load generator, `-q` rate + `--latency-correction` for coordinated omission, winget | adopt (alternative to vegeta; nicer TUI) |
| giltene/wrk2 | 4641 | Apache-2.0 | 2024-03-03 | C | Constant-throughput wrk with correct latency | reference (no Windows build) |
| grafana/k6 | 32192 | AGPL-3.0 | 2026-11-06 | Go | Scriptable load testing, open-model arrival-rate executors | reference (AGPL as a tool is fine but overkill) |
| mcollina/autocannon | 8534 | MIT | 2026-11-06 | JS | Node HTTP benchmark (closed-loop by default) | no for tail latency (coordinated omission) |
| fortio/fortio | 3740 | Apache-2.0 | 2026-10-30 | Go | Fixed-QPS load + histograms, also gRPC/TCP echo | reference (can drive raw TCP for D2) |
| tinylibs/tinybench, evanwashere/mitata | 2384 / 2543 | MIT | 2026 / 2025 | TS/JS | Micro-benchmarks, Bun-friendly | adopt mitata/tinybench for in-process micro-benchmarks only |

Note: no ready open-loop generator speaks newline-JSON TCP; a small Bun script with a fixed-rate scheduler recording intended-start time into HdrHistogramJS covers D2.

## 5. Recursive file watching (Windows)

| Repo | Stars | Licence | Push | Lang | What | Verdict |
|---|---|---|---|---|---|---|
| paulmillr/chokidar | 12263 | MIT | 2026-11-06 | TS | Cross-platform watcher (v4/v5: no globs, wraps fs.watch, debouncing, atomic-write handling) | adopt if Bun's own `fs.watch(dir,{recursive:true})` misbehaves; pure JS, works in Bun |
| parcel-bundler/watcher | 845 | MIT | 2026-08-04 | C++ | Native ReadDirectoryChangesW backend, event batching, snapshot "changes since" query | adopt-candidate: best Windows semantics + `getEventsSince` (replaces tree walk at startup), but N-API addon: verify under Bun 1.4 |
| meta/watchman | 13761 | MIT | 2026-11-07 | C++ | Watch daemon with query API | no (extra service on Windows) |
| open-cli-tools/chokidar-cli | 873 | MIT | 2025-09-22 | JS | CLI wrapper | no |

Simplest path: Bun's built-in recursive `fs.watch` (native ReadDirectoryChangesW on Windows) setting a dirty flag; chokidar as fallback.

## 6. Tracing / OpenTelemetry / SQLite spans

| Repo | Stars | Licence | Push | Lang | What | Verdict |
|---|---|---|---|---|---|---|
| open-telemetry/opentelemetry-js | 3516 | Apache-2.0 | 2026-11-06 | TS | OTel API/SDK; Bun lacks some Node auto-instrumentation hooks | reference / adopt only `@opentelemetry/api` + W3C traceparent format for ids; keep own SQLite writer (rule 165 already exports OTLP without the SDK) |
| open-telemetry/opentelemetry-python | 2702 | Apache-2.0 | 2026-11-07 | Python | OTel Python SDK | reference (traceparent propagation into hosts) |
| CtrlSpice/otel-desktop-viewer | 1303 | Apache-2.0 | 2026-11-07 | TS | Local OTLP receiver + UI (DuckDB) | adopt as viewer (already in rule 165) |
| ymtdzzz/otel-tui | 1117 | Apache-2.0 | 2026-11-05 | Go | Terminal OTLP viewer | adopt as alternative viewer |
| danielloader/waggle | 16 | GPL-3.0 | 2026-11-03 | Go | OTLP/HTTP into SQLite, Honeycomb-style queries | reference for SQLite span schema (GPL, young) |
| planetf1/otelite | 96 | NOASSERTION | 2026-11-06 | Rust | Single-binary OTLP receiver + dashboard for LLM dev | reference |
| wperron/sqliteexporter | 4 | MIT | 2024-02-22 | Go | OTel Collector SQLite exporter | reference for schema; stale |
| jaegertracing/jaeger | 23386 | Apache-2.0 | 2026-11-07 | Go | Full tracing backend | no (heavy) |

## Top 5 recommendations

1. HdrHistogram/HdrHistogramJS + HdrHistogram_py: adopt. Exact p99.9, coordinated-omission correction, compatible encoded histograms storable per tool/stage in SQLite and mergeable across Bun and Python.
2. tsenart/vegeta (or hatoo/oha): adopt for open-loop benchmarks of the HTTP hook service; both have Windows builds and correct for coordinated omission.
3. shogowada/json-rpc-2.0 (Bun) + bensynapse/jsonrpcserver (Python) over Bun.connect / asyncio.start_server with newline framing: adopt for D2; tiny, MIT, transport-agnostic. Reference neovim's node-client/pynvim for reconnect patterns.
4. File watching: Bun's built-in recursive fs.watch as dirty flag, with paulmillr/chokidar as fallback; evaluate @parcel/watcher under Bun for snapshot-since queries.
5. edimuj/callmux and mauribadnights/clooks as references (not deps): callmux for reconnecting stdio bridge + shared listener; clooks for command->http hook migration and token auth. Keep log's own proxy and hook service.
