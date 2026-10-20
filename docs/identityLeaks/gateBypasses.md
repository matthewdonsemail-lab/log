# Gate bypasses: routes that open a browser without the proxy gate

**Id:** `gateBypasses` · **Severity:** medium (latent) · **Status:** fixed at `2de5ff5` (verifiedLive, proxied). Nothing leaked before either, because no caller used these routes

## Summary

Rule 12 says no browser opens for an account unless its proxy is attached and
its exit is in the account's country. The gate (`python/browser/proxyGate.py`) enforces
this through monkey-patches. `force_visible()` replaces two launcher names, and
`force_timezone()` replaces `Browser.new_context`. Every launch path that
exists today goes through the gate. That was confirmed live (R3 T12). But
several other routes would open a browser with no proxy, no country check, or
the host clock, and the tests only read the source text. Any one of these
routes would bring back every leak in this folder at once (R4 M1, M2; R3 T12).

## What leaks and to whom

An ungated launch shows Facebook whatever the route defaults to:

- no proxy: the Vietnam IP, DNS from this PC, a Vietnamese geoip identity
  (`standaloneFacebookCamofoxClient.md`);
- no `timezoneId`: the `Asia/Bangkok` clock (`timezone.md`);
- caller-supplied kwargs: any locale, timezone or WebRTC setting the caller
  passes.

## Evidence

**What is gated today** *verifiedSource*, *verifiedLive (proxied)*

| Launch path | Through `proxyGate.apply()`? | Timezone forced? |
|---|---|---|
| `log connect`, `scan`, `watch`, `status` → `python/session/logWorker.py` → facebook-camofox-client `acquire()` → `camoufox.async_api.AsyncCamoufox` (patched) | yes (`logWorker.py:266`, `:270`) | yes |
| `log publish` → `python/session/publishSession.py:172` `Camoufox(**launch_kwargs({}))` | yes | yes |
| `log proxy check`, `assign`, `doctor` | no browser (`public_ip` through the proxy) | n/a |

- R3 T12 confirmed both paths live. In a gated process, `launch_kwargs` raises
  `noProxy` when no file is armed.
- Before any Python starts, `checkRunnable`
  (`src/marketplace/socialAccount/helpers/checkRunnable.ts:46-66`) requires
  FACEBOOK, a usable status, a proxy and an ISO `homeCountry`
  (R4, "What is right"). *verifiedSource*

**The routes that skip it** (R4 M1, re-checked against `f033e63`)

1. **Package-level names aren't patched.** `python/browser/visibleBrowser.py:38-52`
   replaces only `camoufox.async_api.AsyncCamoufox` and
   `camoufox.sync_api.Camoufox`. `camoufox/__init__.py` binds its own copies at
   import. So `from camoufox import AsyncCamoufox` gets the **original**
   launcher: no gate, no proxy. *verifiedSource*
2. **Other launchers are not wrapped:** `NewBrowser`, `AsyncNewBrowser`,
   `camoufox.utils.launch_options` followed by `playwright.firefox.launch()`, and
   `camoufox server` (`server.py`, which launches with no arguments, so no proxy
   and no geoip). *verifiedSource*
3. **Persistent contexts skip the timezone fix.**
   `AsyncCamoufox(persistent_context=True, ...)` does get the proxy through the
   wrapper. But it opens through `BrowserType.launch_persistent_context`
   (`camoufox/async_api.py:118-121`, per R4), not `Browser.new_context`. So
   `force_timezone()` (`proxyGate.py:134-152`) never runs, and the page shows
   `Asia/Bangkok` (`timezone.md`, R3 T2b). *verifiedSource*
4. **`visible_kwargs()` is public and ungated.** `python/browser/visibleBrowser.py:26-30`.
   `log-cli/.scratch/dbgCondition.py:7` (gitignored; removed since, at `2de5ff5`) called
   `Camoufox(**visible_kwargs({"geoip": False}))`, with no proxy and no gate.
   It loaded a `file://` fixture, so it did no harm, but the pattern is there.
   *verifiedSource*
5. **Caller kwargs pass through.** `proxyGate.py:131`
   `return {**kwargs, "proxy": ..., "geoip": ...}` keeps everything else the
   caller sends: `locale=`, `config={'timezone'|'locale:*'|'geolocation:*'|'webrtc:*'}`,
   `env=`, `fingerprint=`, `os=`, `block_webrtc=`, `firefox_user_prefs=`. An
   explicit locale or timezone beats geoip (`camoufox/utils.py:756-757`).
   *verifiedSource*
6. **facebook-camofox-client binding early.** It imports `AsyncCamoufox` inside
   `acquire()` (`session_manager.py:105`). If that import ever moves to module
   level, and the module is imported before `force_visible()`, it binds the
   original. *verifiedSource*

**The tests only read text** (R4 M2)

- `src/camofox/session/visible.test.ts:42-61` checks that strings appear in the
  Python source, e.g.
  `expect(gate).toContain('kwargs["timezoneId"] = _armed["timezone"]')`. These
  pass even if `apply()` is never reached at run time, or if a library launches
  another way. *verifiedSource*
- The only behavioural evidence is manual: `docs/proxies.md`, and R3's live runs
  from `.scratch`. *verifiedLive (proxied)*

**What's fine** (R4) *verifiedSource*

- `Browser.new_page` calls `self.new_context(**params)` (playwright
  `_impl/_browser.py:227`), so it gets the timezone. The sync API reaches the
  same coroutine.
- Each Python process serves one account (`logWorker.main`,
  `publishSession.main`), and `watch` starts a new worker per check. No browser
  or `_armed` state is shared between accounts.
- The proxy reaches Python as a file path, never on argv, and is deleted
  afterwards (`browser/run`).

## Where in our code it can happen again

This is the list to check on every change:

- Any new `import camoufox`, `from camoufox import ...`, `NewBrowser`,
  `launch_options`, `playwright.firefox.launch`, `launch_persistent_context`,
  `persistent_context=True` or `camoufox server`.
- Any new Python entry point that doesn't call `proxyGate.arm()` and go through
  `visibleBrowser.launch_kwargs()`.
- Any new kwargs passed into `launch_kwargs()` or the patched launchers.
- Any script in `.scratch/` or `scripts/` that launches Camoufox.
- Playwright or Camoufox upgrades that rename `_impl._browser.Browser` or the
  launcher modules.

## Mitigation

All in `python/browser/proxyGate.py` and `python/browser/visibleBrowser.py` (R4 M1, M2):

1. **Patch every route.** Wrap the package attributes `camoufox.AsyncCamoufox`,
   `camoufox.Camoufox`, `NewBrowser`, `AsyncNewBrowser` and `launch_options`
   too.
2. **Refuse unguarded Playwright launches.** Patch
   `playwright._impl._browser_type.BrowserType.launch` and
   `launch_persistent_context` to raise `GateError("unguardedLaunch")` unless
   the call came from `apply()` (a contextvar token).
3. **Refuse `persistent_context=True`** in `apply()` until `force_timezone`
   covers it (`timezone.md`).
4. **Whitelist kwargs.** In `apply()`, allow only `headless`, `humanize`,
   `config.showcursor` and the persona keys. Raise on anything else.
5. **Hide the ungated helper.** Rename `visible_kwargs` to `_visible_kwargs`.
6. **Guard the library.** Add `python/libraryGuard.py`
   (`standaloneFacebookCamofoxClient.md`).
7. **Delete `.scratch/dbgCondition.py`** (done: the file is gone), or route it through `launch_kwargs`.
8. **Test behaviour, not text.** Add `python/leakProbe.py` (through
   `launch_kwargs()` like everything else) and a `log proxy probe --account <name>`
   command (`src/cli/proxy/index.ts`). It opens a local probe page plus one
   public IP echo **through the browser**. It returns:
   - `navigator.language(s)`;
   - `Intl` timezone in the page, a dedicated worker, a service worker and a
     shared worker;
   - `getTimezoneOffset()`;
   - WebRTC candidates with a real STUN server;
   - the echoed `Accept-Language`;
   - the exit IP seen in the browser.

   It fails with `proxyCountryMismatch` or a new `leakDetected` if any value
   points at VN or differs from the gate's IP. Run it in `log doctor --account`
   and before the first `publish --live` of the day.

## How to re-test

> **Disposable scripts.** Any script named below under `.scratch` sits outside git, was a throwaway, may be gone, and is not a supported tool. `python/leakProbe.py` and `log proxy probe` don't exist yet. Until they do, the repeatable check at `2de5ff5` is a `log publish` dry run against `python/fixtures/createItem.html`, with the page-side probes in this file (`docs/proxies.md`, "Checked").

1. Static scan of every launcher:
   ```bash
   cd C:/Users/0/.buzz/REPOS/log-cli
   grep -rn "from camoufox import\|NewBrowser\|launch_options\|firefox.launch\|persistent_context\|visible_kwargs(" python scripts src .scratch
   ```
   **Pass:** every hit goes through `launch_kwargs()` or is the gate itself.
2. Negative tests once the hardening lands. Each must raise:
   `from camoufox import Camoufox; Camoufox()` with nothing armed;
   `AsyncCamoufox(persistent_context=True, ...)`; `apply({"locale": "vi-VN"})`.
3. Behavioural: `log proxy probe --account <name>` passes. Until it exists:
   `python C:\Users\0\.buzz\.scratch\leakTests\runGate.py <sessionId> light gateCheck`
   and `runFcc.py <sessionId> fccCheck`.

## Status

No leak at `f033e63`: every existing launch path was gated (R3 T12). **Fixed at
`2de5ff5`**, so the latent routes are closed. *verifiedLive (proxied)*

- `from camoufox import Camoufox` with `geoip=False`, a caller `locale` and
  `persistent_context` were all refused with `unguardedLaunch`.
- `launch`, `launch_persistent_context` and `new_context` are wrapped in
  `python/browser/proxyGate.py`; `python/browser/visibleBrowser.py` refuses positional
  arguments.
- `.scratch/dbgCondition.py` was removed.
- Still open: the proposed `python/leakProbe.py` and `log proxy probe` don't
  exist.
