# Device fingerprint churn: a new computer every run

**Id:** `deviceFingerprintChurn` · **Severity:** critical · **Status:** mostly fixed at `2de5ff5` (verifiedLive, proxied). The canvas hash still changes per launch: open decision for matt

## Summary

Every Camoufox launch makes up a brand-new device. The operating system, CPU
count, screen, GPU name, fonts, voices and the canvas, audio and font-spacing
noise seeds are all drawn again at random. The Facebook cookies stay the same.
So one account signs in from a different computer, often with a different OS,
every session. This does not reveal Vietnam. It is still the biggest "is this
the same person?" signal any of the four reports found (R2 §1, R3 T9, R4 H2).

## What leaks and to whom

- **To Facebook:** any page script can read `navigator.platform`,
  `hardwareConcurrency`, `screen.*`, the WebGL vendor and renderer, canvas and
  audio hashes, font widths and the voice list. Meta says it collects "device
  characteristics" and identifiers "to distinguish your device from other
  users' devices", and that it uses usual login devices to "detect suspicious
  behaviour" (S29, quoted in translation by R2). *vendorDocs*
- **To captcha vendors:** Arkose returns the session's `canvas_fingerprint` to
  the site (S43). A canvas that changes every session is visible there too.
  *vendorDocs*
- Some drawn combinations can't exist on real hardware. A site that checks
  consistency can call the device fake, not just new (camoufox#729, S52).

## Evidence

**Code: why it happens**

- `camoufox/fingerprints.py:21`:
  `FP_GENERATOR = FingerprintGenerator(browser='firefox', os=('linux', 'macos', 'windows'))`.
  With no `os=`, any of the three can be drawn. *verifiedSource*
- `camoufox/utils.py:670-676`: with no `fingerprint` and no preset, it calls
  `generate_fingerprint(...)` on every launch. *verifiedSource*
- `camoufox/utils.py:730-732`: `fonts:spacing_seed`, `audio:seed` and
  `canvas:seed` are each `randint(1, 4_294_967_295)` per launch. *verifiedSource*
- R2 also reads a random font subset of 30 to 78% of non-essential fonts
  (`fingerprints.py:107`) and a random WebGL pair (`sample_webgl`). *verifiedSource (R2; not re-read for this study)*
- log-cli passes none of `os`, `fingerprint`, `config` seeds, `locale` or a
  stored identity:
  - `python/session/publishSession.py:172`: `Camoufox(**launch_kwargs({}))`.
  - `python/browser/visibleBrowser.py:23-30`: adds only `headless`, `humanize` and `config.showcursor`.
  - `python/browser/proxyGate.py:131`: adds only `proxy` and `geoip`.
  - `facebook-camofox-client/src/facebook_camofox_client/domain_camofox/session_manager.py:109-113`:
    `AsyncCamoufox(humanize=1.5, geoip=True, proxy=proxy_config)`.
  - Only cookies persist (see `sessionStatePersistence.md`). *verifiedSource*

**Measured: the live runs through the Galway proxy** (R3 T9, 2026-10-18) *verifiedLive (proxied)*

| Run | OS | Cores | Screen | WebGL | Language | Canvas hash | Audio |
|---|---|---|---|---|---|---|---|
| gateA | MacIntel | 12 | 2816x1584 | Apple M1 | en-IE | (blocked by Xray) | (blocked) |
| gateB | Win32 | 2 | 5120x1440 | GTX 980 | ga-IE | 741080508c041ad4 | 75.79020865 |
| fccC | MacIntel | 10 | 1710x1107 | Apple M1 | en-IE | 2bf73ae04abd16aa | 75.78979833 |
| gateD | MacIntel | 12 | 960x540 | Apple M1 | en-IE | 9dbdf68ee5fbd086 | 75.80137317 |
| gateE | Win32 | 12 | 1600x900 | GTX 980 | en-IE | e1e9fa4bce25e442 | (n/a) |

The real machine is Windows, 16 logical cores, 1920x1080, AMD Radeon 780M plus
RTX 4060 Laptop (R3, ground truth). None of the real values showed. Every
spoofed value changed between runs.

**Measured: local probes, OS pinned to Windows** (R2 §1) *verifiedLive (local probe)*

- Five launches gave `hardwareConcurrency` 16 / 8 / 8 / 32 / 8.
- Screens were 1920x1080, 3072x1728, 1680x1050, 3440x1440 and 5120x1440.
- GPUs were "GTX 980", "Intel HD Graphics", "Radeon HD 3200" and "Intel HD Graphics 400".
- Canvas hashes and `measureText` widths changed every time.

**Implausible devices drawn**

- A 960x540 "MacIntel" screen (R3 gateD). A 5120x1440 screen with 2 cores
  (R3 gateB). *verifiedLive (proxied)*
- A 2008 "Radeon HD 3200" with 32 threads on a 3440x1440 ultrawide (R2).
  *verifiedLive (local probe)*
- camoufox#729: Pixelscan flags such BrowserForge combinations as "Masking
  detected". *upstreamIssue*

**Upstream and research**

- camoufox#442 (open): "Anti-fraud systems interpret this as 'Session Hijacking'
  because the user identity (Cookies) remains the same, but the device
  characteristics (Hardware Fingerprint) abruptly change." camoufox#38 and #71
  ask for the same thing. *upstreamIssue*
- camoufox#328 (0.4.11 / 135.0.1-beta.24): reusing a fingerprint object still
  gave different CreepJS IDs, because canvas and audio seeds stayed random. The
  fix was to pass `canvas:seed`, `audio:seed` and `fonts:spacing_seed` too.
  *upstreamIssue*
- camoufox#765: relaunching a pinned fingerprint with `persistent_context`
  broke after beta.24 on Windows with 0.5.5. *upstreamIssue*
- Camoufox documents fresh fingerprints per launch as the default ("BrowserForge
  is used to generate unique fingerprints", S6; S2). *vendorDocs*
- Facebook says private browsing can stop it recognising a device next time
  (S33). *vendorDocs*
- FP-Stalker linked changing browser fingerprints over 54 days on average (S51).
  *vendorDocs (paper)*
- "Same cookies on a new device every session looks like stolen cookies, a
  classic checkpoint trigger" (R4 H2). *inference*

**The fix works on this build** (R2 `pinprobe.py`) *verifiedLive (local probe)*

`launch_options(...)` once, then `Camoufox(from_options=opts)` twice, gave the
same UA, cores, screen, GPU, canvas, audio and text widths on both launches.

### Where the reports disagree

- R2's probes pinned `os='windows'`, so the OS never changed there. R3's
  production-path runs did not pin it and drew MacIntel three times out of
  five. These don't conflict. They show the OS draw is live in production.
- R1 notes that randomisation can help privacy against tracking. For an account
  that must look like one person on one device, it works against us. R1 says
  so itself: continuity and anti-tracking "can pull in opposite directions"
  (R1 §5). For this use, continuity wins.

### Viewport (related, untested)

- `browser.new_context()` without `no_viewport=True` (`python/session/publishSession.py:174`,
  `session_manager.py:130`) likely gives every account Playwright's default
  1280x720 viewport, whatever screen the fingerprint claims (R4 L10).
  *inference*
- R3 saw the headed window sized from the fake screen (outer 1423x1551 on a
  1080-pixel monitor), and R2 found `innerWidth` matched the `matchMedia` width
  (`vpprobe.py`). No report measured the inner viewport against the claimed
  screen across accounts. *verifiedLive (proxied)*, open question.

## Where in our code it can happen again

Check any change that touches these:

- Every Camoufox launch: `python/session/publishSession.py:172`,
  `python/browser/visibleBrowser.py:26-52`, `python/browser/proxyGate.py:123-131`.
- facebook-camofox-client `session_manager.py:109-113` (reached through
  `force_visible()`).
- Any new `Camoufox(...)`, `AsyncCamoufox(...)`, `NewBrowser(...)` or
  `launch_options(...)` call.
- `new_context(...)` calls that set `viewport`, `screen`, `locale` or
  `user_agent`. These override parts of the stored identity.
- Upgrading Camoufox. v156 removed canvas and font-spacing noise (camoufox#860)
  and changes what a stored config means.
- The Twenty field that will hold the persona (rule 13: add fields, never
  rename).

## Mitigation

What log-cli must do:

1. **One device persona per account, made once.** Generate it with
   `camoufox.utils.launch_options(os='windows', locale=<homeLocale>, geoip=<exit IP>, headless=False, humanize=1.5, webgl_config=(vendor, renderer))`.
   - `os='windows'` always, the same as the host. Fonts are rasterised by the
     real Windows stack, and Camoufox's Windows font list matches it (R2 §1).
   - Pick a `webgl_config` pair that fits the real GPU family (see
     `webglGpuLinkage.md`).
2. **Store only the safe parts.** Keep the `CAMOU_CONFIG_*` chunks and
   `firefox_user_prefs`. Never store `opts['env']`: `launch_options()` copies
   the whole process environment into it (`camoufox/utils.py:606`). R2's test
   file had 218 variables, including secrets (see `proxyCredentials.md`).
3. **Store it in Twenty.** A new `socialAccounts.devicePersona` field
   (RAW_JSON), added through `scripts/twenty/twentySetup.mjs` (rule 13). Proposed TS
   domain: `src/camofox/device/` with `types.ts`, `client.ts`, `helpers/` (R4 H2).
4. **Replay it on every launch.** Pass it as `from_options` (`camoufox/sync_api.py:109-110`,
   per R4) from `proxyGate.apply()`. The three seeds (`canvas:seed`,
   `audio:seed`, `fonts:spacing_seed`) must be in the stored config, or #328
   repeats.
5. **Only the network part moves.** When the exit IP changes, update
   `webrtc:ipv4`, `geolocation:*` and `timezone`. Keep everything else.
6. **Refuse a run without a persona.** Only `log connect` may create one.
7. **Viewport:** make it part of the persona, or pass `no_viewport=True`.
   Check with the probe.
8. **Persistent profile (later):** `persistent_context=True` with a
   per-account `user_data_dir` keeps IndexedDB, localStorage and cache like a
   real browser. Do it only after the timezone hole for persistent contexts is
   closed (`gateBypasses.md`) and #765 is re-probed.

## How to re-test

> **Disposable scripts.** Any script named below under `.scratch` sits outside git, was a throwaway, may be gone, and is not a supported tool. `python/leakProbe.py` and `log proxy probe` don't exist yet. Until they do, the repeatable check at `2de5ff5` is a `log publish` dry run against `python/fixtures/createItem.html`, with the page-side probes in this file (`docs/proxies.md`, "Checked").

1. Launch the same account twice through the production path, with the same
   proxy session id:
   ```powershell
   cd C:\Users\0\.buzz\.scratch\leakTests
   python runGate.py <sessionId> light churnA
   python runGate.py <sessionId> light churnB
   ```
   (These `.scratch` scripts are disposable, outside git, and may be gone. See the note above.)
2. Compare `out_churnA.json` with `out_churnB.json`: `navigator.platform`,
   `hardwareConcurrency`, `screen.width/height/colorDepth`, WebGL
   `UNMASKED_RENDERER_WEBGL`, the canvas hash, the audio sum, font widths and
   `speechSynthesis.getVoices().length`.
3. **Pass:** every value is the same in both runs, and the platform is Win32.
   **Fail:** any difference.
4. Repeat after every Camoufox upgrade.

## Status

Leaking at `f033e63`: nothing was pinned per account. **Mostly fixed at `2de5ff5`**
(rule 15, `python/device/deviceProfile.py`, `src/camofox/device/`). *verifiedLive (proxied)*

- The device is made once and stored in Twenty `socialAccounts.deviceProfile`.
- Three relaunches (two on the publishSession path, one on the
  facebook-camofox-client path) gave the same UA (Windows, Firefox 156), screen
  1920x1080, WebGL (Intel HD 400), audio hash 75.80013773585961 and font
  metrics. Camoufox 0.5.8, browser 156.0.1-beta.39, throwaway Galway account,
  exit 86.41.85.43, Facebook never loaded, 2026-10-18.
- The device replay and the pinned prefs are also *unitTested*
  (`src/camofox/device/device.test.ts`).

**Open: the canvas hash still changes on every launch.** Firefox's baseline
fingerprinting protection re-keys canvas noise each browser session. Setting
`privacy.baselineFingerprintingProtection=false` made the canvas stable, but
then it is this PC's raw rendering, identical for every account on the machine,
which links the accounts. It is left on until matt decides (README, "Open
decisions for matt").
