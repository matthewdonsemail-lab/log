---
title: "Call timing"
---

# Call timing

Every call is timed, never guessed: one timing layer across Bun and Python gives each call an id, stores every stage inside it in log.db, and reports p50, p95 and p99 per tool and per stage. Rule 164.

### REQ-TIMING-01: Every call has an id and its stages are spans

Every MCP tool call (`runGuarded` in `src/mcp/server/index.ts`) and every terminal run (`bin/log.ts`) runs inside `timeCall`, which gives the call a trace id, a short call id and a root span named `call`. The call id and how long the call took are written on its `▶` and `■` lines in the live log. Inside a call, `timed` and `timedSync` record a span with its parent, start time, length, whether it failed, and its attributes. Outside a call they only run the work. `instrumentFetch` patches `fetch` once, so every request made inside a call is a `fetch <METHOD> <host><path>` span with its status, with long ids in the path replaced.

Checked by: code and SubQ

### REQ-TIMING-02: The trace crosses into Python and back as one tree

Every place Bun starts a Python engine (`runTwitterEngine`, `runTwitterEngineLive`, `runPlatformEngine`, `runPlatformEngineLive`, and the Facebook engine's `spawnEngine`) runs inside `timedEngineSync` or `timedEngine`. That writes the call's trace, with the engine span as parent, into the engine's spec. Python's `timing.begin` (`python/platformKit/timing.py`) picks it up, and `timing.span` records each stage. The outer engine process records `python.imports`. On its way to the account's session host it records `host.connect`, then `host.roundTrip`, passing its own span on as the parent with `child_trace`. The host records `host.queue` while it waits for the account's turn. The X engine records `account.lock`, `spacing`, `governor`, `client`, `action <name>` and `session.keep`; the shared platform engine records `governor` and `action <name>`. `instrument_curl` patches curl_cffi's `Session.request` and `AsyncSession.request` once, so every platform request is an `http` span. The spans and the process's start time come back in the answer (`attach`). Bun takes them out of the answer (`harvestEngine`), adds a `python.start` span for the interpreter's start-up, and stores them all in the same call.

Checked by: code and SubQ

### REQ-TIMING-03: The guards and the voice gate are timed stage by stage

The catch-up wait (`waitCaughtUp`, `inbox.waitCaughtUp`), the read-source choice (`readSourceFor`, `inbox.readSource`), the chat claim (`claimChat`, `inbox.claim`) and the voice gate (`gateSend`, `voice.gate`, with `voice.sameness`, `voice.chatContext`, `voice.room`, `voice.rankedContext`, `voice.evidence` and `voice.reading`, and `voice.briefReading` for a brief) are each a span. Each says what it decided as an attribute: caught up or not, where the read came from, passed or not.

Checked by: code and SubQ

### REQ-TIMING-04: Timings are stored and reported, never lost to a failure

When a call ends, `timeCall` writes every span to log.db's `spans` table in one transaction and deletes spans older than 90 days once per process. Storing or exporting never fails the call. With `LOG_OTLP_URL` set, the spans are also posted as OTLP JSON to `<url>/v1/traces`. `log timing` (MCP `timing`) reads them: p50, p95 and p99 per tool, and per stage with its share of the tool's time and an `unaccounted` stage for the call's own time outside every stage. `--call <id>` shows one call as a waterfall, and an unknown id is refused with `callTimingMissing`.

Checked by: code and SubQ
