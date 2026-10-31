# Comparison: drivers, avoidance, and what REA is for

Two questions often get mixed up, and this page keeps them apart. **Programmatic access** is filling Facebook's create form and, only with `--live`, clicking Publish once; that code exists. **Avoidance** is making sure the page can't learn things about the machine or link accounts together; that's the identity study, and REA doesn't implement it. Read this to see what's already proven, how log's driver differs from two earlier ones, and what REA will and won't be used for.

## What already works, and what is only claimed

"Works" here means the code and a test or a recorded local run exist. It doesn't mean a live Facebook publish.

| Capability | Evidence | Not shown at the time |
| --- | --- | --- |
| Command registry, usage generated from `COMMANDS` | `src/cli/runner/index.ts` | |
| Account check before any browser, including sign-in | `checkRunnable`, `socialAccount.test.ts` (`noProxy` on connect) | |
| Publish dry run through the state machine | `publish.test.ts`, and a visible run against `python/fixtures/createItem.html` reaching `done` | A live facebook.com run, `--live` past review, a live captcha solve |
| Proxy required, exit country checked | `python/browser/proxyGate.py`, proxy tests | A live `log proxy assign` |
| One device, pinned locale, launch self-check, local active hours | `src/camofox/device/`, `src/marketplace/home/` | A CreepJS re-measure on camoufox 0.5.8 / 156.0.1-beta.39 |
| The monitor decides and never posts | `src/marketplace/monitor/machine.ts` | A signed-in selling scan |
| Captcha route: CaptchaKraken, then 2Captcha, else a person | `src/captcha/router/` | A live solve |
| Reading and writing accounts and listings in Twenty | The generated client, `marketplaceFixture()` in tests | A call to a real Twenty during this study |

The test count reported at the time (300 passing) was the author's claim from an earlier commit; it wasn't re-run for this study.

Sign-in goes through the proxy too: `checkRunnable` refuses to start `log facebook connect` without one.

## How the three drivers differ

| | log's publish | Earlier Camoufox client | Earlier production poster |
| --- | --- | --- | --- |
| Browser | Camoufox, visible, cursor shown | `AsyncCamoufox` | AdsPower Chromium over CDP |
| What decides | An XState machine | `MarketplaceCreateAction` | `poster.ts` / `facebook-poster.ts` |
| Upload check | Facebook's `N/10` counter | Its spike waits on the counter; the action's tests don't prove a live publish | A fixed wait, then `setInputFiles` |
| After Publish | No retry; a crash becomes `unconfirmedId` | Can report published with no id, and can take another listing's id | The server path can return success with no URL |
| Network | Not recorded at the time | A passive listener for group scrolling, not for create | No HAR pipeline |
| Proxy | Required, country checked, no exception | `geoip=True` on its own launcher; without a gate it uses the local machine's connection | AdsPower profile proxy, outside log's gate |

log's publish session is the one to keep. The other two are sources for selectors and for bugs already written down (see [Sources](../listingPublish/sources.md)). REA doesn't become a fourth poster.

## Avoidance: what's still open

The status table is in `docs/identityLeaks/README.md`. These items were still open, and REA doesn't close them:

| Item | Why it stays open |
| --- | --- |
| The canvas hash changes every launch | Firefox re-keys its noise per session. Turning that off makes every account share the machine's raw canvas. Not decided yet. |
| WebGL pixels match the machine's GPU | Camoufox can change the reported GPU name, but not the pixels. `docs/deviceIsolation/` says a software renderer on a VM trades one tell for another. |
| Camoufox detectability on 156.0.1-beta.39 | Upgraded but not re-measured on CreepJS. The package is paired with beta.36. |
| A person at the keyboard during sign-in | Input method, phone country, personal email. A process question, not code. |
| Listing text and currency | Not screened. A place name from the wrong country in the copy would show. |

What the gated path already refuses is in the same table: timezone, locale, hours, an ungated launcher, session storage, geolocation precision, the proxy username in output, WebRTC, DNS, HTTP/3. Those checks stay in the Python gate; they aren't rebuilt inside REA.

**The useful REA question is narrower:** once the create page's scripts are saved offline, which of those surfaces (canvas, WebGL, `Intl`, WebRTC, timezone) do the scripts actually read? The identity study inferred the observers from public documentation and leak-test sites, and the scripts are a check on that. A script that never touches a surface doesn't prove Facebook's servers ignore it, but it does show which client-side checks are real.

## What REA won't be used for

- Pointing `rea inspect-web-page` at a live facebook.com tab, in Camoufox or in AdsPower.
- Letting REA launch a browser for an account. Every browser for an account goes through log's gates, and REA's browser is the wrong one.
- Adding a GraphQL client that posts a listing outside the form. The response listener log would copy refuses to construct requests.
- Treating `rea search` as web search, or adding a web-search command to `log`.
- Bundling `rea-agents` into log's package. The global CLI reads saved files; the publish process stays Python and Camoufox.
