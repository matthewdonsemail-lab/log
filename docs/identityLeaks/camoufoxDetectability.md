# Camoufox's own tells: "this is an anti-detect browser"

**Id:** `camoufoxDetectability` · **Severity:** high · **Status:** upgraded to camoufox 0.5.8 and browser 156.0.1-beta.39 at `2de5ff5`; detectability not re-measured on CreepJS after the upgrade

## Summary

These don't reveal Vietnam. They reveal that the browser is Camoufox, which
draws scrutiny to the account anyway. Our build (152.0.4-beta.30) has three
known page-visible tells, each fixed upstream in a later build. There are also
smaller config contradictions. Popular test sites (CreepJS, sannysoft) score
the browser clean. That shows they don't run these probes. It doesn't show the
browser is invisible (R2 §7, R3 T8, T10).

## What leaks and to whom

- **To Facebook and to captcha scripts:** anything a page script can probe.
  hCaptcha already rejects every Camoufox token because of one of these tells
  (camoufox#847).

## Evidence

**Three tells in beta.30** (R2 `detprobe.py`) *verifiedLive (local probe)*

| Tell | Upstream fix |
|---|---|
| 15 non-standard `set*` functions on `window` (`setTimezone`, `setWebRTCIPv4`, `setNavigatorPlatform`, `setWebGLRenderer`, `setFontList`, `setSpeechVoices`…), which page script can enumerate | camoufox#749, PR #750 "seal the window.setXxx() setters" |
| `new Intl.DisplayNames(['en'],{type:'region'}).of('FR')` returns **"Ireland"** (and `of('VN')` does too) | camoufox#824, "guard explicit locales" in v156.0.1-beta.34 |
| `new Worker('chrome://juggler/content/Helper.js')` fires an error event instead of throwing `SecurityError`, which shows the Juggler package is registered | camoufox#847, "Hide Juggler from pages" in v156.0.1-beta.38. hCaptcha rejects every Camoufox token, even ones solved by a person |

*upstreamIssue* for the fixes.

**Config that doesn't hold** (R3 T8) *verifiedLive (proxied)*

- `navigator.doNotTrack` is configured `"1"` but reads `"unspecified"`.
- `globalPrivacyControl` is configured true but reads false.

**What's clean** *verifiedLive*

- `navigator.webdriver` is false. `getBattery` is absent (as in stock Firefox).
  `buildID` is `20181001000000` (as in stock). `showcursor` adds no DOM element
  (R2 §7, local probe).
- CreepJS (R3 T10, gateA): "Headless: chromium: false, 0% like headless, 0%
  headless, 0% stealth". No lie or trash counter in the captured text.
  (proxied)
- bot.sannysoft (R3 T10): WebDriver passed, WebDriver Advanced passed, "Chrome
  missing" (expected for Firefox). (proxied)

**Smaller tells** (R2 §16)

- The UA says Firefox 152. Upstream is at 156, so the UA is a few releases
  stale on a 4-week release cycle. *inference*
- The bundled uBlock Origin fetches filter lists on every launch through the
  proxy (pgl.yoyo.org, ublockorigin.github.io, cdn.jsdelivr.net…). That costs
  paid proxy traffic, and Facebook can see ads are blocked. Common among real
  users, but it should be a deliberate choice. *verifiedLive (local probe)*
- TLS handshakes identify client families regardless of IP, e.g. JA3/JA4 (S44).
  Camoufox is Firefox, so its handshake should look like Firefox. Not measured.
  *inference*

**History** (none of these are Facebook tests) *upstreamIssue*

- camoufox#76 (0.3.9): detected on pixelscan through voices, media devices and
  WebGL.
- camoufox#170 (0.4.9, Windows 11): `block_images=True` changed Cloudflare
  behaviour.
- camoufox#309 (0.4.11): DataDome blocked on G2 despite residential proxies,
  `geoip` and `humanize`.
- camoufox#686: regressions to check after upgrading.

### Where the reports disagree

- **R3:** CreepJS and sannysoft come back clean. **R2:** three page-visible
  tells. Both are true. Those sites don't run R2's probes. A clean score on a
  public test page is not evidence of being undetectable (R1 §1, S23).

## Where in our code it can happen again

- **The installed Camoufox version and browser build.** Pinned implicitly by
  what's installed: `camoufox 0.5.5` and `152.0.4-beta.30-ea52a02f`.
- **The addon list.** `exclude_addons` is not set, so uBO loads.
- **Each upgrade brings changes too:**
  - v156 removes canvas and font-spacing noise (camoufox#860, see
    `webglGpuLinkage.md`).
  - The default GeoIP database switches to "GeoIP AIO", which can change exit
    city, timezone and locale lookups (R2 §7).

## Mitigation

1. **Upgrade.** `pip install -U camoufox` (0.5.8 per R2), then fetch a browser
   at v156.0.1-beta.38 or later. This fixes all three tells.
2. **Re-run every probe in this folder afterwards,** before any live use:
   timezone, locale, WebRTC, DNS, QUIC, fonts and voices, geolocation,
   detectability. Check camoufox#686 for regressions.
3. **Record both versions** (Python package and browser build) whenever results
   are written down. "0.5.x" alone is too broad (R1 §4, S3).
4. **Decide on uBO.** To drop it:
   `exclude_addons=[DefaultAddons.UBO]` in `apply()`. Either way, write the
   choice down.

## How to re-test

> **Disposable scripts.** Any script named below under `.scratch` sits outside git, was a throwaway, may be gone, and is not a supported tool. `python/leakProbe.py` and `log proxy probe` don't exist yet. Until they do, the repeatable check at `2de5ff5` is a `log publish` dry run against `python/fixtures/createItem.html`, with the page-side probes in this file (`docs/proxies.md`, "Checked").

1. `python -I C:\Users\0\.buzz\.scratch\camoufox_probe\detprobe.py`, or in the
   proxied browser:
   ```js
   ({ setters: Object.getOwnPropertyNames(window).filter((k) => /^set[A-Z]/.test(k) && typeof window[k] === 'function'),
      displayFR: new Intl.DisplayNames(['en'], { type: 'region' }).of('FR'),
      dnt: navigator.doNotTrack, gpc: navigator.globalPrivacyControl })
   ```
   and, separately:
   `try { const w = new Worker('chrome://juggler/content/Helper.js'); w.onerror = () => console.log('juggler visible'); } catch (e) { console.log(e.name); }`
2. **Pass:** no Camoufox setters in the list, `displayFR` is `"France"`, the
   worker throws `SecurityError`, and `dnt`/`gpc` match the persona.
3. Then run CreepJS (`https://abrahamjuliot.github.io/creepjs/`) and check that
   the lie counter is zero.

## Status

Leaking at `f033e63` (beta.30). Fixed upstream. **Upgraded at `2de5ff5`** to camoufox
0.5.8 with browser 156.0.1-beta.39 (`docs/proxies.md`, "Checked").

- Upgraded; detectability not re-measured on CreepJS after the upgrade. The
  `window.set*`, `Intl.DisplayNames` and Juggler results above are still
  the beta.30 ones.
- beta.39 is a prerelease. Camoufox warns that 0.5.8 is paired with beta.36
  (README, "Open decisions for matt").
- Still to do: re-run the probe on the new build.
