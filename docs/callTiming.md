---
title: "Call timing"
---

# Call timing

Every log call is timed. You can see where the time went from the numbers, so nobody has to guess (rule 164). One timing layer runs across Bun and Python:

1. It gives every call an id.
2. It records every stage inside the call as a span.
3. It stores the spans in `~/.logCli/log.db`, in the `spans` table, for 90 days.
4. It reports p50, p95 and p99 for each tool and for each stage.

## What a call looks like

```
twitterDms  9.5 s                       (call 3f9a1c2b7e44)
 ├─ inbox.readSource                    the .db or the platform
 ├─ engine twitter inbox
 │   ├─ python.start                    the interpreter starting
 │   ├─ python.imports                  the engine's imports
 │   ├─ host.connect                    reaching the account's one session
 │   └─ host.roundTrip
 │       ├─ host.queue                  waiting for the account's turn
 │       ├─ account.lock
 │       ├─ spacing                     the gap since the last call (rule 104, 110)
 │       ├─ governor                    the governor's own pacing
 │       ├─ client
 │       ├─ action inbox
 │       │   └─ http GET x.com graphql …   every request X answered
 │       └─ session.keep
 └─ unaccounted                         the call's own time outside every stage
```

A send also shows `inbox.waitCaughtUp`, `inbox.claim` and the voice gate, step by step: `voice.sameness`, `voice.chatContext`, `voice.room`, `voice.rankedContext`, `voice.evidence` and `voice.reading`. Every `fetch` the call makes, to SubQ, Jina, Twenty or anything else, is a span of its own.

## Reading it

- `log timing` (MCP `timing`) gives p50, p95 and p99 for every tool in the last 24 hours. Under each tool it lists the stages, the largest share of the time first.
- `log timing --tool twitterDms --hours 72` narrows it to one tool and a wider window.
- `log timing --call <id>` shows one call as a waterfall, with every stage in order, when it started and how long it took. The id is on the call's `▶` and `■` lines in the live log (`~/.logCli/mcp/<day>.log`). The `■` line also says how long the call took.
- `--json` gives the numbers, for a benchmark or a before-and-after.

A stage's share is its time across all of a tool's calls, divided by the tool's total time. Nested stages count inside their parent as well, so shares can add up to more than 100%. `unaccounted` is time the call spent in its own code, outside every stage. When it is large, add a span where that time goes.

## Seeing it as a timeline

Set `LOG_OTLP_URL` (for example `http://127.0.0.1:4318`) and every call is also sent as OTLP to a trace viewer. [otel-desktop-viewer](https://github.com/CtrlSpice/otel-desktop-viewer) is one Windows .exe that needs no Docker; its UI is on port 8000. Nothing else needs installing: log writes OTLP JSON itself.

## When a span is slow and you can't tell why

The spans show which stage is slow. A profiler shows which function inside that stage, and which library:

- **Python:** run `py-spy record --native --pid <host pid>` in an admin terminal. The host's pid is on the hook's account line. It attaches without a restart, so the account keeps its one session (rule 105).
- **Bun:** run `bun --cpu-prof` and open the `.cpuprofile` in Chrome DevTools.

## Adding a span

- **Bun:** `timed("name", async (span) => …, { attrs })`, or `timedSync`, from `src/observability/timing`. Outside a call they only run the work.
- **Python:** `with timing.span("name", key=value):` from `platformKit.timing`.

Never put a cookie, a token or message text in a name or an attribute.

Research: `RESEARCH/LOG_CLI_CALL_TRACING_TOOLING_2026_11_07.md` in the workspace. Spec: [callTiming](specs/callTiming.md).
