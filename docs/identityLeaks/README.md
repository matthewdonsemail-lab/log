# Identity and location leaks: a study of log-cli's browser stack

Written 2026-10-18 against log-cli `f033e63` (branch `feat/publishMachine`,
PR #6). This is documentation only. No code was changed for it.

**Updated 2026-10-18 for `2de5ff5`**, the commit that landed the fixes on the
same branch. Statuses below are at `2de5ff5`. The evidence sections inside each
file are still the `f033e63` reports, and say so.

## The question

The PC that runs log-cli is in Vietnam. The Facebook accounts are bought
accounts from Ireland, the UK, Canada, the US and Australia. Every run must look
like **that account's one person, on one consistent device, in its home
country**. This study asks two things. Where can the real machine, its location,
or the fact of automation show through? And where can one account's identity
drift from run to run?

We started from one assumption: every library is broken until shown otherwise.
That covers Camoufox, Playwright, Firefox, facebook-camofox-client and the
earlier repos. Each claim below cites a source or a test. Where the evidence
disagrees, the vector's file says so and says which evidence is stronger.

**Scope limit.** Nothing was tested against facebook.com. What Facebook actually
checks is not public. This study makes no claim that the operation can't be
detected. Meta's Terms, the Marketplace eligibility rules and how enforcement
works are set out once, in `accountHistoryAndMetaEnforcement.md`.

## Threat model: who observes what

| Observer | What it can see | Where it matters |
|---|---|---|
| **Facebook / Meta** | The HTTP exit IP and headers (`Accept-Language`, UA). Everything a page script can measure in the page, frames and workers: timezone, locale, screen, GPU, canvas, fonts, voices, WebRTC candidates, the geolocation API, keyboard events. Cookies and the account's whole history. Uploaded bytes. Server-side timestamps. Captcha verdicts from Google and Arkose. Meta says it collects device characteristics, language, time zone, activity timing and mouse movement (S29), and receives device data from third-party sites (S30) | Every file |
| **Captcha vendors** (Google reCAPTCHA, Arkose, hCaptcha) | The solving session's IP, UA, TLS hash, canvas, and Juggler probes. Arkose returns the solving device's IP, country, UA and canvas to the site (S43). reCAPTCHA Enterprise takes IP, UA and JA3/JA4 (S41) | `captchaSolving.md`, `camoufoxDetectability.md` |
| **Solver services** (2Captcha workers, CaptchaKraken) | 2Captcha workers load the challenge from their own IP and browser. CaptchaKraken receives screenshots from this PC's IP | `captchaSolving.md`, `outOfBrowserRequests.md` |
| **IP databases** (MaxMind, ipinfo, ip-api, IP2Location; residential-proxy datasets) | The exit IP. They classify it (residential, proxy, hosting) and place it, each differently (R3 T1). Residential-proxy datasets exist commercially (S47) | `proxyRotationAndGeoAccuracy.md` |
| **The proxy vendor** (2Captcha) | Every connection's destination host, our traffic volume, our sticky sessions | `proxyCredentials.md` |
| **This PC's ISP and DNS** (Viettel, 8.8.8.8) | That this PC talks to `eu.proxy.2captcha.com`. Nothing about Facebook | `dns.md` |
| **People** (buyers, anyone shown our output) | Listing text and photos. Terminal output with proxy usernames | `listingContentAndCurrency.md`, `photosAndUploads.md`, `proxyCredentials.md` |

## Method

Four reports, all from 2026-10-18, form the evidence base. Their full
bibliography is `sources.md` (R1 to R4, S1 to S53).

| Report | How the evidence was gathered |
|---|---|
| R1 deep research | Parallel deep research over public sources: Camoufox docs and issues, Firefox source, RFCs, Meta help pages and policies, vendor docs. No tests of its own |
| R2 web, source and probes | Read the installed Camoufox package and browser config. Ran local probes (`.scratch/camoufox_probe/*.py`): local pages on 127.0.0.1, `geoip='89.101.0.1'` (an Irish IP in GeoLite2), **no proxy**, no Facebook |
| R3 live tests | Real proxied launches through log-cli's own launch paths (`.scratch/leakTests/runGate.py`, `runFcc.py`, `runNoTzPatch.py`). Proxy: 2Captcha `eu.proxy.2captcha.com:2334` (95.179.253.146), Galway targeting, sticky sessions `k7m2q9x4a` (exit 109.78.211.66, Vodafone Ireland) and `q3v8n1z6b` (exit 86.43.185.91, Eircom). Six launches between 16:41 and about 16:51 ICT, using about 18.5 MB of proxy traffic. A connection watcher polled `camoufox.exe`'s TCP and UDP endpoints every ~2 s, and the Windows DNS cache was checked for unique hostnames. Test pages were served with Playwright `route.fulfill` and probes injected as real page scripts (main world) |
| R4 code audit | Read-only audit with file:line of log-cli `f033e63`, facebook-camofox-client `29e9730`, the installed packages, and the earlier repos (Listaro_backup, listeningkit-hackathon, open-typesafe-camoufox) |

**Environment** (all reports)

| Item | Value |
|---|---|
| OS | Windows 11 Home Single Language 10.0.26100, zone `SE Asia Standard Time` |
| Python package | `camoufox` 0.5.5 (`pip show camoufox`) |
| Browser build | 152.0.4-beta.30, sha256 `ea52a02f…`, built 2026-09-01 (`version.json`) |
| Playwright | 1.60.0 (Python) |
| Python | 3.12.10 |
| Other | captchakraken 3.2.1, 2captcha-python 2.1.1 |
| Host truth (R3) | IP 116.105.162.81, Viettel AS24086, Da Nang. Languages en-US, ja, zh-Hans-CN. 1920x1080. 16 cores. AMD Radeon 780M + RTX 4060 Laptop. 623 font families. Location Services on |

**Line numbers were re-checked for this study** against `f033e63` and
`29e9730`. R4 cites some log-cli lines that don't match the files:

- `python/browser/visibleBrowser.py`: R4's `:474-503` is `:23-52`. The file is 53 lines.
- `python/session/logWorker.py`: R4's `:292-298` is `:142`; `:314-371` is `:162`;
  `:374-404` is `:222`; `:418-422` is `:270`.
- `src/proxyVendor/twoCaptcha/helpers/buildProxyUrl.ts`: R4's `:306-312` is
  `:38-44`.

The files in this folder use the corrected lines. Everything else checked
matched: proxyGate, publishSession, camoufox `utils.py`, `locales.py`,
`geolocation.py`, `ip.py`, `camoufox.cfg`, and facebook-camofox-client.

## Evidence grades

Every piece of evidence in this folder carries one of these tags.

| Grade | Meaning |
|---|---|
| **verifiedLive** | Measured by running the real browser on this PC on 2026-10-18. Tagged **(proxied)** for R3's runs through the Galway proxy along log-cli's real launch paths. Tagged **(local probe)** for R2's runs on local pages without a proxy, and for R4's 2000-draw locale sample. Proxied evidence outranks local probes |
| **verifiedSource** | Read in the code or config: log-cli, facebook-camofox-client, the installed Camoufox package and browser config, other packages, the earlier repos |
| **upstreamIssue** | A daijro/camoufox GitHub issue: reporters' claims, sometimes confirmed by maintainers, often on other versions |
| **vendorDocs** | Vendor, standards or published research documentation (Camoufox docs, Mozilla, RFCs, Meta, Google, Arkose, 2Captcha, MaxMind, papers) |
| **unitTested** | A test in the repo covers it (injected clock, fake exit IPs, fake Twenty), but it wasn't measured against a real browser or site. Ranks with verifiedSource |
| **inference** | Reasoning that wasn't measured |

When grades conflict, this order holds: verifiedLive (proxied) >
verifiedLive (local probe) > verifiedSource > upstreamIssue > vendorDocs >
inference. A pass never outranks a fail for a race condition. One observed
failure proves a leak exists. Passes can't prove it's absent.

## Ranked vectors

Severity reflects what an observer learns and how often. Status is at
`2de5ff5` (the fixes landed on `feat/publishMachine`). Live evidence: camoufox
0.5.8, browser 156.0.1-beta.39, a throwaway Galway account, exit 86.41.85.43,
Facebook never loaded, 2026-10-18 (`docs/proxies.md`, "Checked"). Each status
says whether it is verifiedLive or unitTested.

The fixes added `src/camofox/device/` and `src/marketplace/home/`, and these
catalog codes: `deviceProfileInvalid`, `noHomeLocale`, `noHomeTimezone`,
`outsideActiveHours`, `captchaNoProxy`, `unguardedLaunch`, `photoNeedsProxy`,
`proxyCountryChanged`, `browserTimezoneMismatch`, `browserLocaleMismatch`,
`browserExitIpMismatch` and `selfCheckFailed`. Session saving, the geolocation
pin and proxy username masking landed in the same series (`3c2a3e0`,
`a9f7584`, `2de5ff5`).

| # | Vector | Severity | Status | Reveals Vietnam? | File |
|---|---|---|---|---|---|
| 1 | Device fingerprint churn: a new random device (often a new OS) every run, under the same cookies | critical | mostly fixed at `2de5ff5` (verifiedLive) · canvas hash still changes per launch, open decision | no | [deviceFingerprintChurn.md](deviceFingerprintChurn.md) |
| 2 | facebook-camofox-client on its own: no proxy, Vietnam IP and geoip | critical (outside log-cli's path) | mitigated in log-cli; leaking when run on its own | **yes** | [standaloneFacebookCamofoxClient.md](standaloneFacebookCamofoxClient.md) |
| 3 | Timezone: the host's `Asia/Bangkok` on the page without the patch | high | fixed at `2de5ff5` (verifiedLive) · self-check refuses a mismatch, persistent contexts refused | **yes** | [timezone.md](timezone.md) |
| 4 | Locale: a random language per launch (about 28% ga/fr for IE); Intl resolves to `en` | high | fixed at `2de5ff5` (verifiedLive) | no | [localeAndLanguage.md](localeAndLanguage.md) |
| 5 | Captcha: 2Captcha solves proxyless, from a worker's IP and UA | high | fixed at `2de5ff5` (unitTested) · no captcha came up live | no (third identity) | [captchaSolving.md](captchaSolving.md) |
| 6 | Activity hours: Vietnam's working day is Ireland's night | high | fixed at `2de5ff5` (verifiedLive; DST and watch unitTested) | indirectly | [activityHours.md](activityHours.md) |
| 7 | Camoufox tells in beta.30: `window.set*`, `Intl.DisplayNames`, Juggler probe | high | upgraded to camoufox 0.5.8 + browser 156.0.1-beta.39; detectability not re-measured on CreepJS | no (reveals Camoufox) | [camoufoxDetectability.md](camoufoxDetectability.md) |
| 8 | WebGL renders identically for every account: one real GPU | high (links accounts) | leaking; no software fix, needs matt's decision (unchanged) | no (links accounts) | [webglGpuLinkage.md](webglGpuLinkage.md) |
| 9 | Bought accounts' history, Meta's Terms, eligibility and enforcement | high | accepted risk (inherent) | — | [accountHistoryAndMetaEnforcement.md](accountHistoryAndMetaEnforcement.md) |
| 10 | Gate bypasses: unpatched launchers, persistent contexts, kwargs passthrough, text-only tests | medium (latent) | fixed at `2de5ff5` (verifiedLive) | **yes, if used** | [gateBypasses.md](gateBypasses.md) |
| 11 | Session state: stale cookies, empty storage every run | medium | fixed at `2de5ff5` (unitTested) | no | [sessionStatePersistence.md](sessionStatePersistence.md) |
| 12 | Proxy rotation within 120 min; city disagreement; IP reputation | medium (high for US/CA/AU) | mitigated at `2de5ff5` · exit re-checked before Publish (verifiedLive); mid-run rotation unitTested only | no | [proxyRotationAndGeoAccuracy.md](proxyRotationAndGeoAccuracy.md) |
| 13 | Geolocation API: city centre, 6.6e-11 m accuracy, answers while `prompt` | medium | fixed at `2de5ff5` (verifiedLive) | no | [geolocationApi.md](geolocationApi.md) |
| 14 | Proxy credentials: the password equals the username prefix, which log-cli prints | medium (local) | fixed at `a9f7584` (unitTested) · full URL still in Twenty by design | no (not Facebook) | [proxyCredentials.md](proxyCredentials.md) |
| 15 | Manual sign-in: IME events, +84 numbers, personal email | medium (process) | leaking | **yes, if it happens** | [manualSignIn.md](manualSignIn.md) |
| 16 | Listing text and currency not screened | medium | leaking (latent) | **yes, if present** | [listingContentAndCurrency.md](listingContentAndCurrency.md) |
| 17 | WebRTC: STUN around the proxy | low (shape tell) | not leaking · re-checked on the new browser (verifiedLive) | no | [webrtc.md](webrtc.md) |
| 18 | Photos: metadata, filenames, direct download | low | fixed at `2de5ff5` (verifiedLive) | only via fbcdn sources | [photosAndUploads.md](photosAndUploads.md) |
| 19 | Requests outside the browser; env passed to Firefox; unverified exit check | low | not leaking to Facebook | no | [outOfBrowserRequests.md](outOfBrowserRequests.md) |
| 20 | Host fonts and voices | low | not leaking | no | [fontsAndVoices.md](fontsAndVoices.md) |
| 21 | DNS resolved on this PC | none found | not leaking · DoH pinned off (`network.trr.mode=5`) | no | [dns.md](dns.md) |
| 22 | HTTP/3 / QUIC around the proxy | none found | not leaking · HTTP/3 pinned off (`network.http.http3.enable=false`) | no | [http3Quic.md](http3Quic.md) |

### Open decisions for matt

1. **Canvas protection trade-off.** Firefox's baseline fingerprinting protection
   re-keys canvas noise every session, so the canvas hash changes on every
   launch (`deviceFingerprintChurn.md`). Turning it off
   (`privacy.baselineFingerprintingProtection=false`) makes the canvas stable,
   but then it is this PC's raw rendering, identical for every account, which
   links the accounts. It is left on today.
2. **GPU linkage means accounts per machine.** Every account's WebGL and pixels
   come from this one PC's GPU (`webglGpuLinkage.md`). There's no software fix.
   Either accept it, or spread accounts across machines.
3. **Camoufox beta.39 versus the paired beta.36.** camoufox 0.5.8 is paired
   with browser beta.36, and we run 156.0.1-beta.39 (a prerelease), so Camoufox
   warns on launch. Stay on beta.39, or pin back to beta.36
   (`camoufoxDetectability.md`). Detectability hasn't been re-measured on
   CreepJS either way.

### What each finding reveals, in short

- **Vietnam or this PC, today:** nothing on log-cli's gated paths, as long as
  `force_timezone` holds (R3, "Bottom line").
- **Vietnam, if something goes wrong:**
  - an ungated launch (2, 10);
  - a context that escapes the timezone patch (3);
  - a person at the keyboard (15);
  - listing content (16);
  - an fbcdn photo source (18).
- **Spoofing or automation:** device churn (1), language churn (4), Camoufox
  tells (7), geolocation precision (13), the WebRTC shape (17), and a page vs
  worker mismatch if the timezone patch is ever missed (3).
- **Linking accounts together:** one GPU (8), replacement accounts (9), and a
  shared proxy password if it were leaked (14).

## Where the reports disagree

| Topic | Reports | Verdict and why |
|---|---|---|
| Timezone without the patch | R2: 5/5 local launches correct. R3 and `docs/proxies.md`: page `Asia/Bangkok` through the real proxy | **Leak is real.** Live and proxied beats local, and a failure beats passes for a race (camoufox#773). See `timezone.md` |
| Service/shared worker timezone | R4 M5: unchecked. R3: checked, `Europe/Dublin` | **R3 supersedes.** The service-worker result rests on CreepJS, because R3's own service worker didn't install |
| WebRTC | R4 M6: untested, Juggler proxy might not count as "behind proxy". R3: no UDP, no STUN lookup, srflx = exit IP | **Not leaking.** Live sockets and DNS beat inference. Also answers R1's "rewritten output vs real routing" caution |
| HTTP/3 / QUIC | R4 L4: not pinned off. R1: main-branch source isn't proof for an older binary. R2: source says no. R3: live HTTP/2 only, no UDP | **Not leaking** on our build (R3). R4's pin is still worth doing |
| DNS | R1: bug 1920399 isn't evidence for HTTP proxies. R2 and R3: no local lookups | **Not leaking.** All agree |
| Speech voices | R2: 0 voices in 5 launches. R3: 0 was a 3 s wait; full list with polling | **R3 explains R2.** Not leaking |
| Geolocation accuracy | R2: 6.6e-10 m. R3: 6.645e-11 and 6.657e-11 m | **Use R3's raw values.** Impossible either way |
| Language shares | R2: computed IE en 71.5 / ga 16.1 / fr 12.4. R4: sampled 72.2 / 15.3 / 12.5 | **Agree** within sampling error |
| Captcha IP binding | R1: binding isn't universal. R2 and R4: high | **High.** Arkose documents passing the solver's IP, country, UA and canvas to the site, bound or not |
| Activity hours | R1: a weak clue. R2 and R4: high | **High,** because it affects every action and the fix is cheap. Meta's use is unknown |
| Randomisation | R1: can help privacy. R2, R3, R4: breaks continuity | **Continuity wins** for one-person accounts (R1 says so itself, §5) |
| Geolocation: deny or grant | R1: deny if not needed. R2: grant, home town, realistic accuracy | **Grant with a plausible value.** It's the only option tested to be consistent, since Camoufox auto-grants |
| Listing city | R2: follow the IP's city. R1: the listing location isn't residence | **Keep `homeCity`.** Warn or reject exits far from it |

## Re-testing

**The scripts below are disposable.** They sit outside git in `.scratch`, may be gone, and are not supported tools. `python/leakProbe.py` and `log proxy probe` don't exist yet. The 2026-10-18 re-test at `2de5ff5` used throwaway scripts too. Until a durable probe exists, the repeatable route is a `log publish` dry run against `python/fixtures/createItem.html` plus the page-side probes in each file.

Each file has a "How to re-test" section. The scripts the reports used are in
`C:\Users\0\.buzz\.scratch\camoufox_probe\` (R2) and
`C:\Users\0\.buzz\.scratch\leakTests\` (R3). `.scratch` is disposable. The
durable route is the proposed `python/leakProbe.py` plus `log proxy probe`
(`gateBypasses.md`), which are not built yet.

Re-run every probe after:

- any upgrade of Camoufox, the browser build or Playwright;
- any change to `python/browser/proxyGate.py` or `python/browser/visibleBrowser.py`;
- adding a launch path;
- changing proxy vendor or protocol.

Always record the package and browser versions with the results (R1 §8).

## Files

- `README.md`: this index.
- `sources.md`: the bibliography (R1 to R4, S1 to S53, Camoufox issues, local
  evidence).
- One file per vector, as in the table above.
