# Timezone: the host's UTC+7 clock

**Id:** `timezone` · **Severity:** high · **Status:** fixed at `2de5ff5` (verifiedLive, proxied). Persistent contexts are now refused

## Summary

This PC's Windows zone is `SE Asia Standard Time`. Firefox reports it as
`Asia/Bangkok` (UTC+7, "Indochina Time"). On this Windows build, Camoufox's
own geoip timezone sometimes fails to reach the page. A live run through the
Galway proxy then showed an Irish IP with a UTC+7 page clock and a Dublin worker
clock. That one mismatch reveals the machine's region and that the browser is
spoofed. log-cli forces `timezoneId` on every Playwright context
(`proxyGate.force_timezone()`). With that patch, every place tested reported
`Europe/Dublin`. The patch is load-bearing. It does not cover persistent
contexts.

## What leaks and to whom

- **To Facebook:** `Intl.DateTimeFormat().resolvedOptions().timeZone`,
  `Date.prototype.getTimezoneOffset()` and `Date().toString()`, from the page,
  frames and workers. Meta lists "Time zone" among the connection data it
  collects (S29). *vendorDocs*
- **What it reveals:** a UTC+7 zone points at South-East Asia. A page zone that
  differs from the worker zone reveals spoofing on its own (R3 "What each tell
  would reveal").
- A timezone alone doesn't prove where someone is. It is a setting (R1 §2,
  S23). The leak is that the host value escaped an override we set.

## Evidence

- **Host zone name.** CLDR `windowsZones.xml` maps Windows
  `SE Asia Standard Time`, territory `001`, to `Asia/Bangkok` (S27).
  *vendorDocs*
- **The gate's patch.** `python/proxyGate.py:134-152` replaces
  `playwright._impl._browser.Browser.new_context` so that `timezoneId` is the
  exit IP's zone. `:129` stores the zone. `:118-119` refuses with
  `proxyCountryMismatch` when the exit IP has no known zone. *verifiedSource*
- **Live, patched (R3 T2).** Through the Galway proxy, every place tested
  reported `Europe/Dublin`, offset -60 in July and 0 in January:
  the main page, same-origin and cross-origin iframes, a `window.open` popup, a
  second page, after navigating, a dedicated worker, a shared worker, and
  CreepJS's `ServiceWorkerGlobalScope` test (`Europe/Dublin (-60) confidence:
  high`). The facebook-camofox-client path too. *verifiedLive (proxied)*
- **Live, patch removed (R3 T2b, `runNoTzPatch.py`).** Same proxy, same
  `geoip=109.78.211.66`, only `force_timezone` skipped:
  ```
  page:   {"intlTz": "Asia/Bangkok", "offset": -420, "dateString": "Thu Jan 15 2026 19:00:00 GMT+0700 (Indochina Time)", "lang": "en-IE"}
  worker: {"intlTz": "Europe/Dublin", "offset": -60, ...}
  ```
  *verifiedLive (proxied)*
- **Earlier live run** (`docs/proxies.md`, 2026-10-18): Irish IP, `en-IE`, but
  `Asia/Bangkok` until `timezoneId` was forced. *verifiedLive (proxied)*
- **Local probes, no patch (R2 §4).** Five of five launches without
  `timezoneId` held `Europe/Dublin` in the page, same-site and cross-site
  iframes, a second page, a dedicated worker, a SharedWorker and a
  ServiceWorker. *verifiedLive (local probe)*
- **Upstream.** camoufox#773, on our exact browser build (Windows 11, pip
  0.5.6, 152.0.4-beta.30): "the launched browser keeps the host timezone",
  while `timezone_id` on `new_context()` works. A maintainer-side comment
  traces it to the `SetNewDocument` fallback, which applies the override "only
  when something is already on the JS stack at navigation time". That is a
  race. Earlier: #545 (workers leaked the system zone), #657 (worker
  `getTimezoneOffset()` wrong in about 14% of workers), #589. *upstreamIssue*
- **Camoufox's key exists.** `properties.json:64` has `timezone`. Why it
  doesn't take on the page here is not known. R4 lists two candidates: an
  explicit `config` or `CAMOU_CONFIG_*` override through the env passthrough
  (`camoufox/utils.py:833-836`), or Windows-specific behaviour in the binary.
  *verifiedSource* for the key, *inference* for the cause.
- **Summer time.** Ireland is GMT+1 in summer (S28). A fixed offset would be
  wrong for part of the year. Use the IANA name. *vendorDocs*

### Where the reports disagree

- **R2's local probes passed 5 of 5. R3's live run and `docs/proxies.md`
  failed.** The live evidence is stronger. One observed failure proves the leak
  exists. Passes cannot prove it is absent, and #773 says the bug is a race.
  The conditions also differed: R2 served pages on 127.0.0.1 with no proxy,
  while R3 used the real proxy and HTTPS pages.
- **R4 M5 said service and shared workers were never checked.** R3 checked them
  later the same day (shared worker by a blob, service worker through CreepJS).
  R3 supersedes M5 on that point. One caveat remains: R3's own service worker
  failed to install (Playwright Firefox can't fulfil service-worker scripts),
  so the service-worker result rests on CreepJS alone.
- **R1 cautions** that a worker-timezone leak should not be assumed for every
  0.5.x build (R1 §2). R3 measured our build, so that caution is answered here.
  It does apply again after any upgrade.

## Where in our code it can happen again

- **Persistent contexts.** `AsyncCamoufox(persistent_context=True, user_data_dir=...)`
  opens through `BrowserType.launch_persistent_context` (`camoufox/async_api.py:118-121`,
  per R4), not `Browser.new_context`. `force_timezone` never fires, and the
  context runs on the host clock. Nothing uses it today (R3 T12 grep). The
  device-persona work may want it (`deviceFingerprintChurn.md`).
- **Any launch route that skips the gate** (`gateBypasses.md`).
- **Where the zone comes from.** `python/proxyGate.py:102-103` takes it from
  Camoufox's GeoLite2 lookup of the exit IP. A wrong database answer gives a
  wrong zone.
- **Exit IP rotation** in countries with several zones (US, CA, AU) can move the
  exit to a different zone after launch (`proxyRotationAndGeoAccuracy.md`).
- **A Playwright upgrade** that renames `playwright._impl._browser.Browser` or
  changes `new_page` to skip `new_context` (today `_browser.py:227` calls it,
  per R4).
- **Server-side timestamps** are UTC whatever the browser says
  (`activityHours.md`).

## Mitigation

1. **Keep** `proxyGate.force_timezone()`. Never remove it.
2. **Cover persistent contexts.** Patch `BrowserType.launch_persistent_context`
   to inject `timezoneId` too, or refuse `persistent_context=True` in
   `apply()` until it is covered (R4 M1 point 3, M5).
3. **Pin it in the persona.** Put `timezone` in the stored config too
   (`deviceFingerprintChurn.md`).
4. **Try the browser-level fix as well.** Pass `config={"timezone": tz}` and
   `env={"TZ": tz}` from `apply()`, and keep whichever the probe proves works
   (R4 M5).
5. **Check at run time and fail closed.** On the first page, read
   `Intl.DateTimeFormat().resolvedOptions().timeZone` and
   `new Date().getTimezoneOffset()` in the page and in a blob worker. Abort if
   either differs from the gate's zone (R2 §4, R3 fix 3). Proposed code:
   `leakDetected`.
6. **Never use a fixed offset.** Always an IANA name such as `Europe/Dublin`.

## How to re-test

> **Disposable scripts.** Any script named below under `.scratch` sits outside git, was a throwaway, may be gone, and is not a supported tool. `python/leakProbe.py` and `log proxy probe` don't exist yet. Until they do, the repeatable check at `2de5ff5` is a `log publish` dry run against `python/fixtures/createItem.html`, with the page-side probes in this file (`docs/proxies.md`, "Checked").

1. Show the patch is still needed (expect a leak):
   `python C:\Users\0\.buzz\.scratch\leakTests\runNoTzPatch.py <sessionId>`.
2. Show the patch works:
   `python C:\Users\0\.buzz\.scratch\leakTests\runGate.py <sessionId> light tzCheck`.
3. Run it at least 5 times. The upstream bug is a race, so one pass proves
   nothing.
4. In each run, check the page, a cross-origin iframe, a dedicated worker, a
   shared worker and a service worker:
   ```js
   const r = Intl.DateTimeFormat().resolvedOptions();
   ({ tz: r.timeZone, jan: new Date(2026, 0, 15).getTimezoneOffset(), jul: new Date(2026, 6, 15).getTimezoneOffset(), s: new Date(Date.UTC(2026, 0, 15, 12)).toString() })
   ```
   **Pass for IE:** `Europe/Dublin`, jan `0`, jul `-60`, the string ends
   `GMT+0000 (Greenwich Mean Time)`, the same in every realm.
5. Re-test after any Camoufox, browser or Playwright upgrade.

## Status

Mitigated at `f033e63` by `force_timezone()`, live-verified (R3 T2). **Fixed
at `2de5ff5`.** *verifiedLive (proxied)*

- `Europe/Dublin` showed in the page, a dedicated worker and a shared worker.
  The home timezone is pinned per account (`src/marketplace/home/`,
  `noHomeTimezone`).
- The launch self-check refuses a mismatch. A deliberately broken timezone gave
  `browserTimezoneMismatch`, and the browser closed before Facebook loaded.
- Persistent contexts are refused (`unguardedLaunch`), so that gap is closed.
