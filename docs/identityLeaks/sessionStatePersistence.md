# Session state: stale cookies in a factory-fresh browser

**Id:** `sessionStatePersistence` · **Severity:** medium · **Status:** fixed at `2de5ff5` (unitTested)

## Summary

Only `log connect` saves cookies. `scan`, `status`, `watch` and `publish` load
the cookies from the last sign-in into an empty browser, and never write
anything back. localStorage, IndexedDB and cache are thrown away on every run.
Each run therefore comes back with old cookies, no site storage, and (until
`deviceFingerprintChurn` is fixed) a new device. A real browser doesn't
behave like that (R4 M4).

## What leaks and to whom

- **To Facebook:** cookies that Facebook rotated in an earlier session coming
  back again, with empty localStorage and IndexedDB. That pattern doesn't fit a
  person who keeps using one browser. Facebook says private browsing can stop
  it recognising a device (S33). Discarding storage every run has the same
  effect. *vendorDocs*, *inference*
- It doesn't reveal Vietnam. It weakens "same person, same device".

## Evidence

- `src/browser/run/client.ts:26` writes `{ cookies, origins: [] }`, so the
  `origins` (localStorage) are always empty. *verifiedSource*
- `src/browser/run/client.ts:34-41` (`readCookies`) keeps only cookies.
  *verifiedSource*
- Only `connect` saves:
  - `python/session/logWorker.py:155` calls `session.context.storage_state(path=...)`
    in `login`;
  - `src/cli/live/index.ts:121-123` reads the cookies and saves them to Twenty.
  *verifiedSource*
- `scan` (`python/session/logWorker.py:162`), `status` (`:222`) and `publish`
  (`python/session/publishSession.py:174`, `new_context(storage_state=...)`) load state
  and never call `storage_state()` to save it. *verifiedSource*
- Facebook rotates `xs`, `fr` and presence cookies, and keeps state in
  localStorage and IndexedDB (R4 M4). Not measured. *inference*
- Playwright contexts isolate cookies and local/session storage (S25), so
  nothing survives unless it's saved. *vendorDocs*
- **Earlier systems.** Listaro: "Cookies must be created on the same IP the
  server uses" (commit `a37058b`). Its `launchPersistentContext(profileDir)` per
  account (`agent/src/browser.ts:17,61`) was the good pattern (R4 H2).
  *verifiedSource*

## Where in our code it can happen again

- `src/browser/run/client.ts`: what is written to and read from the temp
  `state` file.
- `python/session/logWorker.py` (`login`, `scan`, `status`) and
  `python/session/publishSession.py`: every place a context is closed.
- `src/cli/live/index.ts`, `src/cli/publish/index.ts`, `src/cli/watch/index.ts`:
  what is saved back to Twenty after a run.
- Twenty `socialAccounts.cookies` (rule 13: fields only added, never retyped).

## Mitigation

1. **Save state at the end of every run.** In both Python processes, call
   `context.storage_state(path=statePath)` before closing.
2. **Read cookies and origins.** Add `readStorageState()` in `browser/run`.
3. **Write it back to Twenty** after every scan, status, watch check and
   publish. Add a `storageState` RAW_JSON field through
   `scripts/twenty/twentySetup.mjs`, or keep `cookies` for cookies and add
   `localStorage` (R4 M4).
4. **Or use a persistent profile per account** (`user_data_dir`). That also
   keeps IndexedDB and cache. Only do this after the persistent-context
   timezone hole is closed (`gateBypasses.md`, `timezone.md`) and
   camoufox#765 is re-probed.
5. **Never mix accounts.** One state per account, as today.

## How to re-test

1. Run `log scan --account <name>`, then read the account in Twenty. **Pass:**
   the cookie set's update time is after the run, and `xs`/`fr` values match
   what the browser held at the end.
2. Run `log scan` twice. In the second run, read
   `Object.keys(localStorage)` on facebook.com. **Pass:** the keys from the
   first run are still there.
3. Unit test: the run client writes non-empty `origins` when Twenty holds them.

## Status

Leaking at `f033e63`. **Fixed at `2de5ff5`.** *unitTested* (`src/cli/live/live.test.ts`)

- After every run, `keepSession` (`src/cli/live/index.ts`) saves the cookies
  and localStorage back to Twenty, but only while the jar still holds a Facebook
  login. It never saves a logged-out jar over a good one.
- A newly made device is saved the same way.
- Not measured live against a real Facebook session: Facebook was never loaded.
