# Sources

Every citation in `docs/identityLeaks/` points here. `S<n>` is an outside
source. `R<n>` is one of the four reports this study was built from. A Camoufox
issue is cited as `camoufox#<n>`. A file in our code is cited by path and line.

The lists below combine the four reports' bibliographies, with duplicates
removed. Where two reports cited the same document at different URLs, both URLs
are listed under one entry.

## The four reports (R)

All four were written on 2026-10-18 and live in `C:\Users\0\.buzz\RESEARCH\`.

| Id | File | What it is | Grade of its own evidence |
|---|---|---|---|
| R1 | `camoufox-identity-leaks-deep-research.md` | Parallel deep research over public web sources, numbered references | vendorDocs, upstreamIssue, inference. No tests of its own |
| R2 | `CAMOUFOX_IDENTITY_LEAK_RESEARCH.md` | Web, installed-source reading and local probes (`.scratch/camoufox_probe/*.py`, pages on 127.0.0.1, `geoip='89.101.0.1'`, no proxy, no Facebook) | verifiedSource, verifiedLive (local probe), upstreamIssue, vendorDocs |
| R3 | `CAMOUFOX_LIVE_LEAK_TESTS.md` | Live tests through the 2Captcha Galway proxy, along log-cli's real launch paths (`.scratch/leakTests/*.py`), 16:41 to 16:51 ICT | verifiedLive (proxied) |
| R4 | `LOG_CLI_IDENTITY_LEAK_CODE_AUDIT.md` | Read-only code audit with file:line, log-cli `f033e63`, facebook-camofox-client `29e9730` | verifiedSource, inference |

## Camoufox project

| Id | Title | URL |
|---|---|---|
| S1 | Camoufox releases (v152.0.4-beta.30 notes, v156.0.1-beta.32 to 39) | https://github.com/daijro/camoufox/releases |
| S2 | Camoufox repository README | https://github.com/daijro/camoufox |
| S3 | camoufox on PyPI | https://pypi.org/project/camoufox |
| S4 | Camoufox docs: Geolocation & Intl | https://camoufox.com/fingerprint/geolocation |
| S5 | Camoufox docs: GeoIP & Proxy Support | https://camoufox.com/python/geoip |
| S6 | Camoufox docs: Usage | https://camoufox.com/python/usage |
| S7 | Camoufox docs: Voices | https://camoufox.com/fingerprint/voices |
| S8 | Camoufox docs: WebRTC IP | https://camoufox.com/fingerprint/webrtc |
| S9 | Camoufox docs: WebGL | https://camoufox.com/fingerprint/webgl |
| S10 | Camoufox docs: Fonts | https://camoufox.com/fingerprint/fonts |

### Camoufox issues

`https://github.com/daijro/camoufox/issues/<n>`. The summary is what the
reports say the issue shows. Reporter claims are not maintainer findings.

| Issue | Environment reported | What it shows | Cited in |
|---|---|---|---|
| #38, #71 | not stated | Requests for a stable fingerprint per profile (same ask as #442) | R2 |
| #76 | 0.3.9 / 132.0-beta.15 | Detected on pixelscan: voices, media devices, WebGL. Closed after fixes | R1 |
| #92 | not stated | Canvas, WebGL and audio repeated across browsers on one machine; later "fixed in Camoufox 2.0" | R1 |
| #170 | 0.4.9 / 134.0.2-beta.20, Windows 11 | `block_images=True` implicated in Cloudflare detection; not fully resolved | R1 |
| #309 | 0.4.11 / 135.0.1-beta.24, macOS | DataDome on G2 despite rotating residential proxies; closed as duplicate | R1 |
| #328 | 0.4.11 / 135.0.1-beta.24 | Fingerprint IDs change despite the same fingerprint: canvas and audio seeds still random | R1 |
| #442 | open | "Anti-fraud systems interpret this as 'Session Hijacking'" when cookies stay and the device changes | R2 |
| #529, #538 | — | History of WebRTC leak fixes | R2 |
| #545 | — | Workers leaked the system timezone | R2 |
| #589 | — | Earlier timezone report | R2 |
| #657 | — | Worker `getTimezoneOffset()` returned 0 or garbage in about 14% of workers | R2 |
| #676 | — | A "Thailand" proxy placed in Lithuania by Google: bad proxy geodata, not a Camoufox leak | R2 |
| #686 | — | Regressions to check after upgrading | R2 |
| #717 | — | Past host-OS speech-voice leak | R2 |
| #721, #783, #891, #905 | — | Listed in R2's sources; R2 does not summarise them. Not used as evidence here | R2 |
| #729 | — | Pixelscan flags implausible BrowserForge combinations as "Masking detected" | R2 |
| #731 | — | Voice schema fix | R2 |
| #749 | — | 15 `window.set*` setters visible to pages; fix PR #750 | R2 |
| #765 | 0.5.5, Windows | Relaunching a pinned fingerprint with `persistent_context` broke after beta.24 | R2 |
| #769 | macOS | Geolocation prompt hangs and page timers freeze | R2 |
| #773 | pip 0.5.6, browser 152.0.4-beta.30, Windows 11 | Launched browser keeps the host timezone; `timezone_id` on `new_context()` works; `SetNewDocument` fallback race | R2 |
| #824 | — | `Intl.DisplayNames` returns the spoofed region for every code; "guard explicit locales" in v156.0.1-beta.34 | R2 |
| #847 | — | hCaptcha rejects every Camoufox token because pages can probe the Juggler package; "Hide Juggler from pages" in v156.0.1-beta.38 | R2 |
| #860 | v156 | Canvas and font-spacing noise removed: one canvas per host | R2 |
| #903 | opened 2026-10-18 | Geolocation accuracy far smaller than any real receiver | R2 |

## Firefox, web platform and standards

| Id | Title | URL |
|---|---|---|
| S11 | Firefox Help: Does Firefox share my location with websites? | https://support.mozilla.org/en-US/kb/does-firefox-share-my-location-websites |
| S12 | Bugzilla 1920399: DNS leak when using proxy extensions since version 129 | https://bugzilla.mozilla.org/show_bug.cgi?id=1920399 |
| S13 | MDN: proxy.settings (`proxyDNS` is a SOCKS setting) | https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/proxy/settings |
| S14 | MDN: Using Web Workers | https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers |
| S15 | MDN: Window.postMessage() | https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage |
| S16 | Firefox source: `netwerk/protocol/http/AlternateServices.cpp` | https://searchfox.org/firefox-main/source/netwerk/protocol/http/AlternateServices.cpp and https://github.com/mozilla-firefox/firefox/blob/main/netwerk/protocol/http/AlternateServices.cpp |
| S17 | Firefox source: `nsHttpConnectionInfo.cpp` | https://searchfox.org/firefox-main/source/netwerk/protocol/http/nsHttpConnectionInfo.cpp |
| S18 | Firefox source: `nsHttpConnectionMgr.cpp` | https://searchfox.org/firefox-main/source/netwerk/protocol/http/nsHttpConnectionMgr.cpp |
| S19 | Firefox source: `netwerk/base/rust-helper/src/lib.rs` (Accept-Language q-values) | https://github.com/mozilla-firefox/firefox/blob/main/netwerk/base/rust-helper/src/lib.rs |
| S20 | RFC 8828: WebRTC IP Address Handling Requirements | https://www.rfc-editor.org/rfc/rfc8828.html |
| S21 | RFC 9110: HTTP Semantics (CONNECT) | https://www.rfc-editor.org/rfc/rfc9110.html |
| S22 | RFC 9298: Proxying UDP in HTTP | https://www.rfc-editor.org/rfc/rfc9298.html |
| S23 | W3C: Mitigating Browser Fingerprinting in Web Specifications | https://www.w3.org/TR/fingerprinting-guidance/ |
| S24 | Playwright Python: Network (proxy scope) | https://playwright.dev/python/docs/network |
| S25 | Playwright Python: Isolation (browser contexts) | https://playwright.dev/python/docs/browser-contexts |
| S26 | Microsoft Support: Windows location service and privacy | https://support.microsoft.com/en-us/windows/windows-location-service-and-privacy-3a8eee0a-5b0b-dc07-eede-2a5ca1c49088 and https://support.microsoft.com/en-us/windows/privacy/windows-location-service-and-privacy |
| S27 | Unicode CLDR `windowsZones.xml` | https://github.com/unicode-org/cldr/blob/main/common/supplemental/windowsZones.xml |
| S28 | Ireland.com: Time zones in Ireland | https://www.ireland.com/en-us/help-and-advice/practical-information/time-zones |

## Meta

| Id | Title | URL |
|---|---|---|
| S29 | Meta Privacy Policy. R2 read the printable copy, which Facebook served in Vietnamese to a Vietnamese IP; R2's quotes are translations | https://www.facebook.com/privacy/policy and https://mbasic.facebook.com/privacy/policy/printable/ |
| S30 | Meta Cookies Policy | https://www.facebook.com/privacy/policies/cookies/ |
| S31 | Meta Terms of Service | https://www.facebook.com/legal/terms |
| S32 | Facebook Automated Data Collection Terms | https://www.facebook.com/legal/automated_data_collection_terms |
| S33 | Facebook Help: Login alerts showing same device at every login | https://www.facebook.com/help/261055370579217 |
| S34 | Facebook Help: Confirm your identity on Facebook | https://www.facebook.com/help/117450615006715 |
| S35 | Facebook Help: Unfamiliar locations in "Where you're logged in" | https://www.facebook.com/help/224047177607864 |
| S36 | Facebook Help: Need help with Facebook Marketplace | https://www.facebook.com/help/826051554426654 |
| S37 | Facebook Help: Who can use Facebook Marketplace | https://www.facebook.com/help/1968285150185577 |
| S38 | Xu et al., "Deep Entity Classification", USENIX Security 2021 (Meta's DEC system, Table 1) | https://usenix.org/system/files/sec21-xu-teng.pdf |

## Captcha vendors

| Id | Title | URL |
|---|---|---|
| S39 | 2Captcha API: reCAPTCHA v2 (proxyless vs proxy tasks) | https://2captcha.com/api-docs/recaptcha-v2 |
| S40 | Google reCAPTCHA: Verifying the user's response | https://developers.google.com/recaptcha/docs/verify |
| S41 | Google reCAPTCHA Enterprise: Create an assessment | https://docs.cloud.google.com/recaptcha/docs/create-assessment-website |
| S42 | Cloudflare Turnstile: Validate the token | https://developers.cloudflare.com/turnstile/get-started/server-side-validation |
| S43 | Arkose Labs: Verify API v4 response fields | https://developer.arkoselabs.com/docs/verify-api-v4-response-fields |
| S44 | Cloudflare: JA3/JA4 fingerprint | https://developers.cloudflare.com/bots/additional-configurations/ja3-ja4-fingerprint/ |

## Proxies and IP geolocation

| Id | Title | URL |
|---|---|---|
| S45 | 2Captcha residential proxies (session duration up to 120 minutes) | https://2captcha.com/proxy/residential-proxies |
| S46 | MaxMind: Geolocation accuracy | https://support.maxmind.com/knowledge-base/articles/maxmind-geolocation-accuracy and https://support.maxmind.com/hc/en-us/articles/4407630607131-Geolocation-Accuracy |
| S47 | MaxMind: GeoIP Residential Proxy databases | https://dev.maxmind.com/geoip/docs/databases/residential-proxy |
| S48 | "Lost in the Prefix", arXiv 2605.21937 (2026 IP geolocation error study) | https://arxiv.org/pdf/2605.21937 |

## Uploads

| Id | Title | URL |
|---|---|---|
| S49 | ExifTool: EXIF tags | https://exiftool.org/TagNames/EXIF.html |
| S50 | ExifTool: GPS tags | https://exiftool.org/TagNames/GPS.html |

## Fingerprinting research

| Id | Title | URL |
|---|---|---|
| S51 | Vastel et al., "FP-Stalker", IEEE S&P 2018 | https://hal.archives-ouvertes.fr/hal-01652021 |
| S52 | Vastel et al., "FP-Scanner", USENIX Security 2018 | https://www.usenix.net/system/files/conference/usenixsecurity18/sec18-vastel.pdf |

## Weak sources (vendor blogs)

| Id | Title | URL |
|---|---|---|
| S53 | Multilogin help: fingerprint mismatches | https://multiloginx.helpjuice.com/en_US/browser-fingerprints/the-truth-about-fingerprint-mismatches |

## Local evidence (not on the web)

- **Installed Camoufox package:** `C:\Python312\Lib\site-packages\camoufox\`
  (`utils.py`, `fingerprints.py`, `geolocation.py`, `locales.py`, `ip.py`,
  `async_api.py`, `sync_api.py`, `__init__.py`, `server.py`, `warnings.yml`).
  Cited below as `camoufox/<file>:<line>`.
- **Installed browser:** `%LOCALAPPDATA%\camoufox\camoufox\Cache\browsers\official\152.0.4-beta.30-ea52a02f\`
  (`camoufox.cfg`, `properties.json`, `version.json`). Cited as `camoufox.cfg:<line>`.
- **Other packages:** `C:\Python312\Lib\site-packages\captchakraken\` (3.2.1),
  `twocaptcha\solver.py` (2captcha-python 2.1.1),
  `playwright\_impl\_browser.py` (1.60.0).
- **Our repos:** log-cli at `f033e63`; facebook-camofox-client at `29e9730`
  (`C:\Users\0\.buzz\REPOS\facebook-camofox-client`). Cited as
  `facebook-camofox-client/<path>:<line>`.
- **Earlier systems:** `REPOS/Listaro_backup` (commits `a37058b`, `b2529e5`,
  `504ea63`, `0c7c8bc`), `REPOS/open-typesafe-camoufox`,
  `REPOS/listeningkit-hackathon`. These are lessons only. AGENTS.md rule 9 says
  not to port from open-typesafe-camoufox.
- **Test scripts and raw output:** `C:\Users\0\.buzz\.scratch\camoufox_probe\`
  (R2) and `C:\Users\0\.buzz\.scratch\leakTests\` (R3, `out_<run>.json`).
  `.scratch` is disposable. If these matter later, port them into the repo as
  `python/leakProbe.py` (see `gateBypasses.md`).
