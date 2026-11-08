# Research: processes and IPC, from the fundamentals and measured on matt's machine

Sources were read in full for the sections cited. Copyrighted sources are paraphrased.

## What the classic sources establish

- **OSTEP (Arpaci-Dusseau), "Limited Direct Execution":** a system call and a context switch each cost microseconds. The book's 1996 figures were about 4 µs and 6 µs; on modern CPUs both are under 1 µs. Creating a process costs far more: a new address space, loading the program, and starting a runtime. matt's 24 ms bare process start is 10^4 to 10^5 system calls, and the 750 ms Python start-up about 10^6.
- **OSTEP, "Process API" (5.4):**
  - UNIX keeps `fork` and `exec` separate so the shell can rewire file descriptors between them.
  - Windows has none of this: its `CreateProcess` creates a process and runs the new program in one step. This point is general knowledge, not from OSTEP.
  - Git Bash (MSYS2/Cygwin) imitates fork by creating a process and copying the parent into it. That is why a hook through Git Bash costs about 200 ms against 76 to 101 ms started directly.
- **OSTEP, "Event-based Concurrency" (33.1 to 33.5, 33.9):**
  - One long-lived process with an event loop serves many requests.
  - It must never block in the loop, because one blocking call or long computation stalls every client. Page faults can block it too.
  - In log's warm service, MiniLM routing (12 to 47 ms) and synchronous SQLite reads are such blocking work.
- **OSTEP, "I/O Devices" (36.3 to 36.4):** interrupts beat polling for slow or rare events. That is why watching files for changes beats walking the tree on every call.
- **Beej's Guide to Unix IPC:**
  - **Pipes and FIFOs:** one direction each.
  - **Unix-domain sockets:** both directions, and a little faster than TCP.
  - **Shared memory and mmap:** they avoid copies but need their own synchronization, and they have no message boundaries.
- **Message size:** for 1 to 10 KB JSON, every byte-stream transport costs about 2 copies and about 4 system calls per round trip, so tens of microseconds. That is derived from OSTEP's cost model.
- **McKenney, "Is Parallel Programming Hard…", `cpu/overheads.tex`, `overview.tex`, `swdesign.tex`:**
  - The ratio of communication overhead to useful work is the key design number.
  - Design around it: avoid crossings, batch the ones you keep, keep shared state read-mostly, and give each piece of state one owner.
  - His cost table has no row for system calls or local IPC, so those costs come from measurement.
- **Grigorik, *High Performance Browser Networking*:**
  - **"Building Blocks of TCP":** a new connection pays a handshake round trip, and connection reuse avoids it. Messages under about 14 KB fit in the first congestion window, so slow start never applies.
  - **"HTTP/1.X":** keep-alive saves a round trip per request.
- **Beej's Guide to Network Programming:** a send can be partial and a read can return part of a message. The receiver buffers until it has a whole frame. Newline-delimited JSON is a valid frame.

## Measured on matt's machine, 2026-11-08

Windows 11, Ryzen 9 8945HS, Bun 1.4.0, Python 3.12, Claude Code 2.1.305. 10,000 samples per row after 500 warm-up runs, unless the row says otherwise. 2 KB JSON request, small reply.

| Transport, round trip | p50 | p99 | p99.9 | max |
| --- | --- | --- | --- | --- |
| Loopback TCP, connection kept open, `noDelay` on | 68 µs | 262 µs | 806 µs | 4.1 ms |
| Loopback TCP, connection kept open, `noDelay` off | 56 µs | 205 µs | 590 µs | 1.7 ms |
| Loopback TCP, new connection per call (n=3,000) | 1.17 ms | 2.50 ms | 3.13 ms | 3.6 ms |
| HTTP POST to `Bun.serve`, keep-alive | 153 µs | 454 µs | 1.56 ms | 3.2 ms |
| HTTP POST to `Bun.serve`, new connection (n=3,000) | 1.29 ms | 2.84 ms | 3.61 ms | 4.3 ms |
| stdio pipe to a long-lived Bun child | 63 µs | 263 µs | 1.53 ms | 6.7 ms |
| stdio pipe to a long-lived Python child | 42 µs | 164 µs | 390 µs | 1.5 ms |

For comparison, starting a process:

| Process start | p50 |
| --- | --- |
| Windows, any process (`cmd /c exit`) | 24 ms |
| `bun -e 0` in the repo | 48 ms |
| A real hook, started directly | 76 to 101 ms |
| A real hook, through Git Bash | 196 to 209 ms |
| Python engine call: `python.start` plus `python.imports` (log's spans, 232 calls) | about 400 + 360 ms |

A second reviewer's runs agree:
- Python raw sockets, 300 samples: kept-open round trip 0.08 to 0.14 ms, connect about 0.9 ms.
- No Nagle or delayed-ACK stall on Windows loopback in any combination of `TCP_NODELAY`.

## Read in log's code

- **The MCP proxy walks the tree on every call.** `src/mcp/reload/client.ts:74` calls `reloadDue()`, which calls `codeStamp()` (`src/mcp/freshness/client.ts:27-39`): a synchronous recursive walk of `src`, `python` and `vendor/fbk/src`. Measured at p50 79 ms. It runs before each request is relayed, and every 3 s in `tick()`.
- **X and Instagram calls go through a relay.** `python/twitterApi/host.py`: a new Python process calls `connect_host`, which reads `host.json`, checks the host is alive (twice per call), opens a TCP connection, sends one newline JSON request with a token, reads one line, and the host closes the connection.
  - Most of the measured 7 ms `host.connect` is reading the info file and checking the process, not TCP.
  - The host's `readline()` has asyncio's default 64 KiB limit, so a larger request fails.
  - The server socket has `TCP_NODELAY` (asyncio sets it).
- **There is one host per account, shared by every Claude session** (rules 105, 129, 131). Each Claude session has its own MCP server, and the reload proxy restarts its child on code changes. So a host owned by one MCP server, as its child, could not be the one shared host.
- **Python on Windows:** asyncio's default event loop on Windows (Proactor) does not offer a Unix-socket server. Windows named pipes are supported only through semi-private asyncio APIs. This is general knowledge; it was not tested.
