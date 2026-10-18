---
name: reaCapture
description: Read what the Facebook create page does by recording a HAR of the Camoufox publish session, stripping it, and running the installed rea-agents CLI on it offline. Use to resume the REA work, run `log firefoxCapture`, read rea's Evidence output, or decide what the capture should keep.
---

# reaCapture

REA (`rea-agents`, the `rea` CLI) never touches the live window. Playwright
records a HAR while `log publish` runs in Camoufox, `stripHar` takes the
secrets out, and `rea` reads the files offline. Why this shape won:
`docs/rea/matrix/` and `docs/rea/spec.md`. Order of work:
`docs/rea/roadmap.md`.

## Hard boundaries

1. **No CDP, no attach.** `rea inspect-web-page`, `analyze-web-bundle`,
   `observe-web-*` and `export-web-scripts` need a live CDP target. Don't
   use them on Camoufox or any window logged into Facebook.
2. **A capture only comes from a gated run.** The HAR is written by
   `log publish` (rule 10: dry run unless `--live`), so rules 11, 12, 17
   and 18 apply: headed, proxy in country, self-check, waking hours. Only
   run it when matt asks for a capture run.
3. **Nothing raw is kept.** Cookies, `cookie`/`set-cookie`/`authorization`/
   `proxy-authorization` headers, query values and bodies are stripped
   before `rea` reads the file. A HAR that isn't JSON is deleted. Captures
   stay in the run's receipt folder and are never committed or pasted.
4. **Read-only.** The capture listens. It never replays a request.

## Environment

- `rea --version` prints `6.7.0` (`npm install --global rea-agents@6.7.0`).
  Frida's postinstall is skipped. The HAR and script commands don't need it.
- Code: `src/rea/firefox/` (`stripHar`, `settleFirefoxCapture`,
  `captureFromHar`), `src/cli/firefoxCapture/`, and the `record_har_*`
  arguments in `python/publishSession.py`.

## Commands

```bash
# offline, any HAR, no browser: writes session.har, scripts/, reaNetwork.json, reaScripts.json
bun bin/log.ts firefoxCapture --har <path> --out <dir>
bun bin/log.ts firefoxCapture --har <path> --out <dir> --noRea   # strip only

# what log runs underneath (capturePath must be absolute)
rea inspect-web-network-capture <dir>/session.har har --format json
rea analyze-javascript-application <dir>/scripts --format json
```

A gated `log publish` writes the same files to `receipts/<run>/firefox/`
and adds a `Firefox capture: …` exit note.

## Reading the output

- `reaNetwork.json`: `normalized_result.records[]`, one per HAR entry
  (method, URL, status, mime, timings), plus `limitations`. Keep the
  `evidence_id`.
- `reaScripts.json`: a `JavaScriptApplicationGraph` over `scripts/`. Its
  nodes are the files, with parse status, vendor markers and calls.

## Status (2026-10-18)

Checked: a sample HAR (`firefoxCapture` on a two-entry HAR) gave both rea
calls exit 0 and an Evidence id each. No Facebook capture exists yet.

Open, in order:

1. **Keep the operation name.** Facebook's create page sends almost
   everything as `POST /api/graphql/`. Which operation it is lives in
   the form body (`fb_api_req_friendly_name`, `doc_id`). `stripHar` drops
   the whole body, so rea sees identical POSTs. Keep an allowlist of
   body params (`fb_api_req_friendly_name`, `doc_id`, the variable key
   names, without their values) and keep dropping `fb_dtsg`, `lsd`,
   `jazoest`, `__user`, `av` and every value. Add tests for both sides.
2. **Move `manifest.json` out of `scripts/`.** rea analyzes it as part of
   the app today.
3. **One gated capture run**, only when matt asks: `log publish` dry run
   on one account that passes `checkRunnable`.
4. **Write the report** (roadmap step 5–6): the create-form operations and
   the scripts' browser surfaces, each with its rea evidence id, diffed
   against `src/marketplace/publish/machine.ts` and
   `docs/listingPublish/formFill.md`. A gap becomes a failing fixture test,
   never a live retry.
