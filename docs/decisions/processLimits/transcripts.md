# Lecture evidence for the process-limits decisions

Twelve transcripts in `books/fundamentals/transcripts/`, paraphrased. Six stop mid-sentence between 46 and 51 minutes: windowsInternals, cs162Processes, mit6s081Syscalls, cs162Ipc, thompsonPerformance, and tailAtScale, which also starts after its introduction. "(not in the lecture)" marks added context that is not evidence.

## cygwinFork: tuning Cygwin's fork on Windows
https://www.youtube.com/watch?v=bjbh8ywer50

- 1,000 forks took about 0.23 s on native Linux and 10 to 16 s under 64-bit Cygwin in a Windows 10 VM, "around 100 times slower": about 10 to 16 ms per fork.
- Runs got slower with each repeat (11, 12, then 16 s) and varied by about 50%.
- None of debloating, page file, power plan, visual effects, system restore, disabling services, cygserver thread counts or VM CPU topology made a difference beyond noise. Antivirus and Defender (ASLR) are named as interfering.
- Fork-heavy work hurts most: configure scripts, and a package build that took 2 hours against someone else's 41 minutes.
- Caveats: one KVM guest, not Git Bash. Git Bash's shell is MSYS2, derived from Cygwin with the same fork emulation (not in the lecture).

**D1:** supports taking the shell out of every hook (B to E over A), and fits the measured +115 ms per Git Bash hook. The drift and noise mean latency has to be judged at p99/p99.9 over many runs (**D3, D4**).

## windowsInternals: Windows internals crash course
https://www.youtube.com/watch?v=I_nJltUokE0 (cut off in the Process Monitor demo)

- Windows never forks. Each process gets a new address space: the shared user data page, the executable image, ntdll, the PEB, then a first thread with its stack and TEB.
- Before `main`, the loader maps every imported DLL recursively, then runs every DllMain and TLS callback under the loader lock. A console program also gets a separate conhost process. New threads run thread-attach callbacks too.
- Syscall numbers change between Windows releases. Process Monitor shows every process start, DLL load and file access, so it can show what a hook or a watcher really does.

**D1, D2:** every process started per hook or per call pays for the loader and DLL setup, which favours D1 D/E and D2 C/D. **Condition on D1 E:** the two exec-form refusing hooks pay it on every call, so their imports must stay small.

## cs162Processes: threads and processes (CS162)
https://www.youtube.com/watch?v=QSep-J6vtdc (cut off at pthread_create)

- A process is a protected address space with one or more threads. The kernel is entered only through a narrow set of system calls.
- Threads overlap waiting with work. Once there are several, any interleaving can happen, so correctness has to be designed in, never found by testing alone.

**D2:** a host serving many sessions is one process with interleaved requests, and its one-call-at-a-time lock (rules 104, 129) is that design. This is weak evidence.

## mit6s081Syscalls: system call entry and exit (MIT 6.S081)
https://www.youtube.com/watch?v=TwdtCvKB8RE (cut off before the return path)

- Every trap saves all the user registers and switches page table and stack, and the kernel restores them afterwards. This path is tuned hard because programs enter the kernel so often.
- Mapping memory avoids a system call per read or write, and is often much faster.

**D2:** a loopback call costs several system calls on each side, which fits the 60 µs and 1.2 ms measurements. Shared memory (H) saves some of them but needs locks (cs162Ipc). Nothing here suggests the gap matters next to an engine call.

## cs162Ipc: inter-process communication (CS162)
https://www.youtube.com/watch?v=MKcSCaP0ZrQ (cut off as TCP connections begin)

- A pipe is a finite kernel queue. Writers block when it is full, readers block when it is empty, and the kernel wakes each side.
- When the last writer closes, the reader gets EOF. When the last reader closes, a writer gets SIGPIPE or EPIPE. That is how one side learns the other has gone.
- A byte stream has no message boundaries, so the two sides need a protocol: a length prefix or a delimiter, plus semantics.
- A forked child shares the parent's open-file descriptions, and an inherited descriptor keeps the other end alive.
- Shared memory is fastest but uncontrolled and needs locks. Thread pools avoid paying creation costs per request.

**D2:** newline JSON is a delimiter protocol. Even with C, the reader has to collect bytes up to the newline, because a 16 MiB answer arrives across many reads. A dead host shows up as EOF or a reset, which C turns into one clean failed call. This weakens H and gives F and G nothing over TCP.

## dahlNode: Ryan Dahl introduces Node.js (2009)
https://www.youtube.com/watch?v=ztspvPYybIY

- A thread per connection costs memory and context switches. A single-threaded event loop scales, but only if no handler ever blocks.
- Blocking file calls go to a thread pool, and its results and signals return to the loop through an internal pipe.
- Writes that outrun the kernel are buffered in user memory, and a drain callback tells the writer to wait.
- Asked whether Node reloads changed source, the answer was not yet.

**Condition on D1 D/E:** the service answers every hook on one loop. A synchronous tree walk, SQLite query or MiniLM embedding in a handler stalls every tool call at once. **D5:** a walk on every call is that kind of blocking, which supports the fs.watch dirty flag.

## belderEventLoop: the Node.js event loop
https://www.youtube.com/watch?v=PNa9OMajw9w

- Each turn runs timers, then the OS poll (epoll, kqueue, or IOCP's GetQueuedCompletionStatus on Windows), then setImmediate, then close callbacks. The poll waits until the next timer is due.
- Sockets never use the thread pool. File system calls and DNS lookups through getaddrinfo do, and the pool has four threads by default.
- Promise and nextTick queues drain completely after every callback, so a chain of them can starve the loop.

**D1, D2:** connect to 127.0.0.1, never `localhost`, because a name lookup goes through that small pool (on Windows `localhost` may also try ::1 first, not in the lecture). These are Node's internals, and Bun's loop is its own (not in the lecture). **D5:** file checks share the four pool threads with other file I/O.

## nasserKeepAlive: TCP and HTTP keep-alive
https://www.youtube.com/watch?v=TWlJlZKokAs

- Setting up a connection costs a handshake, which is why connections are kept. Idle connections cost memory and bookkeeping.
- Middleboxes can silently drop an idle connection's state. The peers are not told, and find out only when the next send fails (FTP's idle control channel).
- HTTP/1.1 keeps connections alive by default, and the server sets for how long. The client has no header to ask for a length of time, and the two timeouts can differ.
- So a client must expect any kept connection to die and must move to a new one: "I'm not married to one TCP connection."

**D2:** loopback has no middleboxes, but hosts close on every code change (rule 108), so D will meet dead sockets. D then needs detection, reconnects and no blind resend of a write (rule 94, double sends). That supports **C** unless the ~1 ms matters. **D1 D/E:** after the service restarts, a reused hook connection can fail once, and what happens then must be defined.

## inotify: Linux inotify
https://www.youtube.com/watch?v=hkS3tfUrFiY

- inotify gives a descriptor to a kernel event queue. Watches are per file or per directory, with an event mask, and reads block or not.
- One read returns several variable-length records.
- Events name a watch descriptor, not a path. The application keeps the map from descriptor to path and updates it on renames (moved-from and moved-to, linked by a cookie).
- Unrelated activity makes events too: shell tab completion and the desktop indexer.
- The lecture doesn't cover queue overflow, recursive watches or ReadDirectoryChangesW.

**D5:** events are noisy and carry little meaning. A dirty flag only needs "something changed", so the path bookkeeping that chokidar or @parcel/watcher add buys little, and noise costs only an extra walk. Lost events go unaddressed, so the backstop walk must stay.

## tailAtScale: The Tail at Scale (discussion)
https://www.youtube.com/watch?v=WRsOyiQm910 (starts after the introduction, ends in Q&A)

- Variability comes from noisy neighbours, background work, GC, queueing and power limits. It can be worked around but never removed.
- The more machines a request touches, the more likely it hits a slow one. In the paper, p99 is over three times the mean.
- Interactive work should come ahead of background work (priority or separate queues). Long jobs should be split so they yield, and work past its deadline should be dropped.
- Hedged requests send a second copy after a delay near a high percentile. They suit idempotent reads only, and backfire on expensive requests or correlated failures. A threshold measured on the wrong latency crept up towards the timeout.
- Testing needs synthetic load generators and injected latency.

**D1:** an event's hooks run side by side, so the event waits for the slowest one. One request per event (D/E) cuts that fan-out, and the service should serve hooks ahead of its background work. **D2:** never hedge or retry an engine write. **D3:** p99 and p99.9 per stage, not means. **D4:** this is how the speakers tested: their own generator plus injected delay.

## thompsonPerformance: designing for performance (Martin Thompson)
https://www.youtube.com/watch?v=fDGWWpHlzvw (cut off in the testing section)

- Latency is time spent waiting, service time is time being served, and response time is both together.
- Response time climbs steeply past about 60 to 70% utilisation. Halving service time when utilisation is high improves response time far more than twofold.
- Amdahl's law and the USL limit what going parallel can give. He prefers a single writer to anything shared, and batching amortises the expensive step.
- Measure with histograms or percentile distributions, never means. Stepped percentile plots point to coordinated omission. HdrHistogram is cheap, and a proper harness beats home-made microbenchmarks.
- Set goals, run experiments and read CPU counters: a guess without evidence stays a guess.

**D3:** favours a full histogram (HdrHistogram is named), or exact samples while they stay small, over anything based on means. **D4:** the generator has to avoid coordinated omission. It sends on a fixed schedule and times each request from its scheduled send. Which of autocannon, vegeta and oha do this is not in the lecture. **D2:** a single-writer host is right, but its queueing rises sharply once it is busy.

## cheungNodeStartup: Node.js startup performance
https://www.youtube.com/watch?v=G36lrPrF09c

- Node's startup fell from about 60 to 21 ms (40 to 50% from v10 to v15). The gains came from lazy-loading modules, a build-time code cache and a V8 startup snapshot.
- State that depends on argv or the environment can't be snapshotted and is rebuilt on every start. She estimates a floor of about 10 ms, against 6 to 8 ms for Perl.

**D1, D2:** Bun's 24 ms is the floor before any of log's imports. A per-hook process pays that plus its module graph, and a per-call Python pays its ~750 ms every time. Long-lived processes pay once. **Condition on D1 E:** the refusing hooks lazy-load and import only what refusing needs. **D5:** the code stamp must cover every file a reload loads.

## What the lectures change or add

1. **No shell on any hook (D1).** A Cygwin-style shell turns every process start into a slow, noisy fork emulation (cygwinFork). E's two refusing hooks start in exec form with a minimal import graph that loads lazily (windowsInternals, cheungNodeStartup).
2. **The warm service never blocks (D1 D/E, D5).** All hooks share one loop. No synchronous walk, embedding or database call goes in a handler path. Heavy work goes to a worker or runs after the reply, and background work ranks below hooks (dahlNode, belderEventLoop, tailAtScale).
3. **127.0.0.1, never `localhost` (D1, D2).** It avoids the resolver's thread pool (belderEventLoop) and the ::1 attempt (not in the lecture).
4. **Plan for dead connections (D1, D2).** A kept connection dies without notice, and hosts close on every code change. C has no stale sockets. If D is adopted, it needs detection, reconnects and no blind resend of a write. D1's http hooks need a defined result for the first call after a restart (nasserKeepAlive, cs162Ipc).
5. **Frame the stream (D2).** Read up to the newline across many reads (16 MiB answers). EOF or a reset before it is a failed call (cs162Ipc).
6. **Never hedge or retry writes (D2).** Hedging is for idempotent reads, and fails on expensive requests or correlated faults. This agrees with rule 94 (tailAtScale).
7. **Fan-out sets the tail (D1).** An event takes as long as its slowest hook, so consolidation is worth more at p99.9 than at p50 (tailAtScale).
8. **Histograms, not means (D3).** Keep the full distribution per stage. Exact sorted samples are fine only while their counts stay bounded (thompsonPerformance).
9. **No coordinated omission (D4).** Run open-loop at a fixed rate, time each request from its scheduled send, and inject delay to prove the tail shows up. The lectures don't say which named tool does this, so check before picking (thompsonPerformance, tailAtScale).
10. **Keep host utilisation low (D2).** Queueing rises sharply past 60 to 70% busy, so time the host's queue as its own span (thompsonPerformance).
11. **Watch events are noisy and loss isn't covered (D5).** Keep the backstop walk. A false positive costs one walk, a false negative costs stale code (inotify, cheungNodeStartup).
12. **Decide from repeated measurements.** Single runs varied by about 50% (cygwinFork, thompsonPerformance).
