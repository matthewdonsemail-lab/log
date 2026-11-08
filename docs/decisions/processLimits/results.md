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

## Second run: with the lectures, the DDIA docs and the tools search

`bun docs/decisions/processLimits/runMatrix.ts --second` asked about five decisions this time. It used the first run's evidence plus:
- `transcripts.md`, a digest of 12 lecture transcripts (Berkeley CS162, MIT 6.S081, Windows Internals, the Cygwin fork talk, Ryan Dahl, Bert Belder, Hussein Nasser, inotify, The Tail at Scale, Martin Thompson, Joyee Cheung);
- `tools.md`, the GitHub search for libraries;
- `docs/storageAgainstTheBook.md`, `docs/storageReadPath.md` and `docs/toolCallSpeed.md`;
- the first run's results.

It made 32 calls with 1,200,109 input tokens. The raw answers are in `subqResults2.json`.

| Decision | Chosen | Confidence (probability) |
| --- | --- | --- |
| D1 How hooks reach log's code | E: http hooks per event to the warm service, exec-form Bun for the two refusing hooks | 0.95 (E 96%) |
| D2 How Bun reaches the Python engines | C: straight to the host, a new loopback connection per call (built) | 0.68 (C 72%, D 27%) |
| D3 How latency is recorded | B: HdrHistogramJS + HdrHistogram_py, encoded histograms in SQLite | 1.00 |
| D4 What drives open-loop load tests | A: a small Bun fixed-rate script recording from the intended start time | 0.97 |
| D5 How code changes are noticed | B: the `fs.watch` dirty flag with a backstop walk (built) | 0.99 |

- **D2:** the kept-open connection (D) now scores best on latency, one session and robustness. Its total is 18.8 against C's 18.7. C is still chosen, because it is built and simpler. D stays the follow-up if the 1 ms per call ever matters.
- **D4:** vegeta and oha only speak HTTP and can't drive the hosts' newline-JSON TCP. autocannon is closed-loop.

**Claims.** 24 of the 29 were judged true at 0.91 or above, including all 15 from the first run. The 5 judged false (0.00 to 0.05) were the deliberately wrong statements among the lecture claims:
- Cygwin tweaks halving fork time;
- a middlebox drop notifying both peers;
- a client header setting how long a connection is kept alive;
- hedging being fine for writes;
- response time staying flat until a server is full.

So SubQ read the lectures rather than agreeing with whatever it was given. "Hedging writes is fine" being false matches log's rule that a sent write is never sent again.

**What the lectures add.** They don't change any choice. They add conditions:
- the refusing exec-form hooks need a tiny import graph, since Windows builds every process from scratch;
- the warm service must never block its one event loop;
- a direct host call must read up to the newline across many reads and never resend a write;
- the backstop walk stays, since no source covers lost watch events.
