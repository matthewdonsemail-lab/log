# Comparison: drivers, avoidance, and what REA is for

Two questions get mixed together. They stay separate here.

**Programmatic access** means filling the create form and, only with
`--live`, clicking Publish once. That code exists.

**Avoidance** means the page must not learn that this PC is in Vietnam, or
that two accounts share one GPU. That work is the identity study. REA does
not implement it.

## What already works, and what is only claimed

"Works" here means the code and a test or a recorded local run exist. It
does not mean a live Facebook publish.

| Capability | Evidence | Not shown |
| --- | --- | --- |
| Command registry, usage generated from `COMMANDS` | `src/cli/runner/index.ts` | |
| Account check before any browser, including connect | `checkRunnable`, `socialAccount.test.ts` (`noProxy` on connect) | |
| Publish dry run through the state machine | `publish.test.ts`. PR #6 also reports a headed run against `python/fixtures/createItem.html` reaching `done` | Live facebook.com. `--live` past review. A live captcha solve |
| Proxy required, exit country checked | `python/browser/proxyGate.py`, proxy tests | A live `log proxy assign` (the PR says the proxy password was not in `.env.local`) |
| One device, pinned locale, launch self-check, local hours | `src/camofox/device/`, `src/marketplace/home/`, rules 15–18 | CreepJS re-measure on camoufox 0.5.8 / 156.0.1-beta.39 |
| Monitor decides, never posts | `src/marketplace/monitor/machine.ts` | A logged-in selling scan on this PC |
| Captcha route: CaptchaKraken, then 2Captcha, else a person | `src/captcha/router/` | A live solve. The PR says no keys were loaded |
| Twenty read and write of accounts and listings | Generated client, `marketplaceFixture()` in tests | This session did not call Twenty |

PR #6's body says `bun run check` reached 300 passing tests at an earlier
commit on the branch. Later commits (device pin, identity study, scale and
provider notes) landed after that sentence. This session did not re-run
the suite, so 300 is the author's claim, not a result from this pass.

The PR body also contradicts itself. The proxy section says `log connect`
may launch without a proxy. The later section, rule 12, and
`checkRunnable` say sign-in is included. The code is the later rule.

## How the three drivers differ

| | log-cli publish | facebook-camofox-client | Listaro poster |
| --- | --- | --- | --- |
| Browser | Camoufox, headed, cursor shown | `AsyncCamoufox` | AdsPower Chromium over CDP |
| Who decides | XState machine | `MarketplaceCreateAction` | `poster.ts` / `facebook-poster.ts` |
| Upload check | Facebook's `N/10` counter | Spike waits on the counter. The action's tests do not prove a live publish | Sleep, then `setInputFiles` |
| After Publish | No retry. A crash becomes `unconfirmedId` | Can report published with no id, and can take another listing's id | Server path can return success with no URL |
| Network | Not recorded | Passive listener for group scroll, not for create | Not a HAR pipeline |
| Proxy | Required, country checked, no exception | `geoip=True` on its own launcher. Ungated, it uses this PC | AdsPower profile proxy, outside our gate |

log-cli's publish session is the one to keep. The other two are sources
for selectors and for bugs already written down. REA does not become a
fourth poster.

## Avoidance, and the open decisions

Status is the table in `docs/identityLeaks/README.md`, at `2de5ff5`. These
are still open, and REA does not close them:

| Item | Why it stays open |
| --- | --- |
| Canvas hash changes every launch | Firefox re-keys the noise per session. Turning it off makes every account share this PC's raw canvas. Matt has not chosen. |
| WebGL pixels match this PC's GPU | Camoufox can change the reported GPU name. It cannot change the pixels. `docs/deviceIsolation/` says a software renderer on a VM trades one tell for another. |
| Camoufox detectability on 156.0.1-beta.39 | Upgraded, not re-measured on CreepJS. The package is paired with beta.36. |
| A person at the keyboard during sign-in | IME, phone country, personal email. Process, not code. |
| Listing text and currency | Not screened. A Vietnam place name in the copy would show. |

What the gated path already refuses is documented in that same table:
timezone, locale, hours, an ungated launcher, session storage, geolocation
precision, proxy username in output, WebRTC, DNS, HTTP/3. Those stay in
the Python gate. They are not reimplemented inside REA.

The useful REA question is narrower. Once we have the create page's
scripts offline, which of those surfaces do the scripts actually read
(canvas, WebGL, `Intl`, WebRTC, timezone)? The identity study inferred
the observers from Meta's docs and from leak sites. The scripts are the
check on that inference. A script that never touches a surface does not
prove Facebook's servers ignore it. It does tell us which client-side
checks are real.

## What we will not do

- Point `rea inspect-web-page` at a live facebook.com tab, in Camoufox or
  in AdsPower.
- Let REA launch a browser for an account. Rule 11 and rule 12 have no
  exception, and REA's browser is the wrong one.
- Add a GraphQL client that posts a listing outside the form. The
  response adapter we would copy refuses to construct requests.
- Treat `rea search` as web search, or add a Parallel search command to
  `log`. Parallel was used to research REA. It is not a log-cli feature.
- Vendor `rea-agents` into this package. The global CLI reads saved files.
  The publish process stays Python and Camoufox.
