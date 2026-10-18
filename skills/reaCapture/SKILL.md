---
name: reaCapture
description: Analyze the Facebook create page from live Camoufox runs. `log publish` records a raw HAR of the session, the installed rea-agents CLI reads it and its scripts offline, and the findings go through SubQ matrices to make design decisions for log-cli's Facebook client. Use to resume the REA work, run a capture, read rea's Evidence, or turn findings into a matrix.
---

# reaCapture

The point of this work: use REA on real captures of our own Facebook client
to find out what the create page actually does, then score design changes
with SubQ so the client gets as efficient as it can. The work is based on
live runs. log-cli already knows much of the flow
(`docs/listingPublish/`, `src/marketplace/publish/machine.ts`). The
captures test that knowledge and find what it misses.

Why a HAR plus scripts, read offline: `docs/rea/matrix/` and
`docs/rea/spec.md`.

## Hard boundaries

1. **Captures are raw (rule 19).** The HAR keeps every cookie, header,
   token and body. Nothing is stripped, because the analysis needs it. It
   stays on matt's development machine in the run folder
   (`~/.logCli/publish/<run>/firefox`) and is never committed.
2. **Captures come from live runs** of `log publish` (dry run unless
   `--live`, rule 10). Those runs follow the launch rules as they are:
   headed (11), proxy in country (12), self-check (17), waking hours (18).
3. **REA reads files, never the window.** No CDP, no attach. The rea
   commands that need a live target (`inspect-web-page`,
   `analyze-web-bundle`, `observe-web-*`, `export-web-scripts`) aren't
   used on Camoufox.
4. **Listen, don't replay.** A capture never sends a request of its own.

## Environment

- `rea --version` prints `6.7.0` (`npm install --global rea-agents@6.7.0`).
  Frida's postinstall is skipped. The HAR and script commands don't need it.
- SubQ: `SUBQ_API_KEY` in the environment, `POST https://api.subq.ai/v1/systemone`,
  model `subq-snap-preview`, 1-16 questions per call. Pattern:
  `docs/rea/matrix/runMatrix.mjs`.
- Code: `src/rea/firefox/` (`exportScripts`, `settleFirefoxCapture`,
  `captureFromHar`), `src/cli/firefoxCapture/`, and the `record_har_*`
  arguments in `python/publishSession.py`.

## The loop

### 1. Capture (live)

```bash
bun bin/log.ts publish <listingId>          # dry run; the HAR records the whole session
```

The run folder gets `firefox/session.har` (raw), `firefox/scripts/scriptN.js`,
`firefox/scriptsManifest.json`, `firefox/reaNetwork.json` and
`firefox/reaScripts.json`, and the exit notes print
`Firefox capture: N requests, M scripts, raw HAR kept. REA ...`.

### 2. Read with rea (offline)

`log publish` runs these itself. To re-run on any HAR:

```bash
bun bin/log.ts firefoxCapture --har <path> --out <dir>      # --noRea to only write the files
rea inspect-web-network-capture <absolute>/session.har har --format json
rea analyze-javascript-application <absolute>/scripts --format json
```

- `reaNetwork.json` → `normalized_result.records[]`, one per request:
  method, URL, status, mime, timings, and the request body. On Facebook
  the operation is in the body of `POST /api/graphql/`
  (`fb_api_req_friendly_name`, `doc_id`, `variables`). rea blanks the
  values of the auth headers and cookies it knows in its own output. The
  HAR still has them. Keep the `evidence_id`.
- `reaScripts.json` → a `JavaScriptApplicationGraph` over the scripts:
  files, parse status, vendor markers, calls and the browser surfaces they
  read.

### 3. Findings

Per capture, write `docs/rea/findings/<runId>.md`: the operations the
create page fired, in order, with timing; the fields each one submits;
what the page's scripts read from the browser; and every gap against
`src/marketplace/publish/machine.ts` and `docs/listingPublish/formFill.md`.
Each line names its rea `evidence_id`. Session values aren't copied into
this file. It holds names, orders and counts.

### 4. SubQ matrix

Copy `docs/rea/matrix/runMatrix.mjs` into `docs/rea/<question>/` and
give it the findings as state, design options as `options.json`, criteria
(efficiency: requests, time, failure points, fit with the gate) as
`criteria.json`, and the claims the findings support or refute as
`claims.json`. Run two repeats per pass, as before, and keep
`subqResults.json`.

### 5. Decide

The winning option becomes a change to the client, plus a failing
fixture test first (`python/fixtures/createItem.html` or a new fixture).
Record the decision and its evidence ids in the `log.md` entry.

## Status (2026-10-18)

- Done: the raw HAR capture in `log publish`, `log firefoxCapture`, and
  rea 6.7.0 read on a sample HAR (both calls exit 0, with the POST body
  visible to rea).
- Next: the first live capture run, then `docs/rea/findings/`, then the
  first SubQ matrix over it.
