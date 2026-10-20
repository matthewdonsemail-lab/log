# AdsPower in log-cli (rules 42, 44)

matt, 2026-10-19: the browser moves to AdsPower, and Camoufox stays. Twenty's
`socialAccounts` logic stays exactly as it is. The browser is a **driver**, so another
browser can be added later the same way. How every browser is held to the same
capabilities: `docs/browsers.md`. How it runs across servers: `docs/deployment.md`.

## Why AdsPower

SubQ ranked 23 anti-detect browsers on the issues we recorded, from the providers'
docs plus our run captures and identity-leak tests. AdsPower won the final against
BitBrowser 0.74 to 0.26, and Camoufox placed 21st of 23
(`RESEARCH/MARKETPLACE_PROVIDERS/subq/RESULTS.md`). Listaro ran on AdsPower, one
window per account held open for hours (`RESEARCH/LISTARO_BROWSER_LIFECYCLE.md`).
Its client, `Listaro_backup/src/lib/adspower-client.ts`, is ported here.

## The pieces

| Path | What |
| --- | --- |
| `src/browser/driver/` | The browser-agnostic session machine (XState v5) and the capability list every browser fills |
| `src/browser/adsPower/client.ts` | The Local API client (v2 endpoints, `Authorization: Bearer <ADSPOWER_API_KEY>`, "Too many request" retried twice, catalog errors), `syncProfiles`, and `adsPowerDriver` |
| `src/browser/adsPower/helpers/` | `profileRequest` (the create body) and `planSync` (create, relink, linked or skip, per account) |
| `src/browser/adsPower/types.ts` | Its types, and `adsPowerCapabilities`, its row of the parity table |
| `python/adsPowerBrowser.py` | The same Local API from Python: set the profile's proxy, start, stop |
| `python/browserDriver.py` | `open_ads_power`: gate, proxy on, start headed, `connect_over_cdp`, the profile's context, session HAR, self-check; at the end, stop and proxy off |
| `src/cli/adsPower/` | `log adsPower status`, `log adsPower profiles`, `log adsPower sync [--apply]` |

Twenty gains two fields, both additive (rule 13):
- `adsPowerProfileId`: the profile linked to the account.
- `browserDriver`: `adsPower` or `camoufox`; empty means Camoufox.

## What a profile holds

Each profile is set up with:
- **Name:** the account's `accountName`, with a remark `log-cli twenty:<id>` so a lost link can be found again.
- **Group:** `logCli`.
- **Browser:** Windows Chrome (`random_ua` Windows 10/11).
- **Language:** pinned from the home country (`HOME_COUNTRIES`, rule 16).
- **Timezone and geolocation:** from the exit IP.
- **Fingerprint noise:** AdsPower's own per-profile noise on canvas, WebGL image, audio, client rects and media devices; WebRTC set to `forward`.

It holds **no proxy, password or 2FA key**. The proxy is put on the profile only to
open it, after the gate, and taken off at close. The profile keeps its own cookies;
Twenty's saved session is carried in once, only into a profile with no Facebook login.

## Opening an account on AdsPower

1. Set `socialAccounts.browserDriver` to `adsPower` for the account. Its profile must be linked (`log adsPower sync --apply`).
2. `log inspect start --account <a>`, `log flow run`, `log warmup run` and `log host start` then open its AdsPower profile through `python/browserDriver.py`. The gate, self-check, session HAR, human mouse and scroll are the same as on Camoufox.

## Not built yet

1. **The sync sessions on AdsPower.** `publishSession`, `connectSession` and `profileSession` still launch Camoufox.
2. **One machine at a time.** A `cloud-active` check before opening, so dev and prod never open the same profile (`docs/deployment.md`).

## Setup

- **The app:** AdsPower runs on this machine; the Local API defaults to `http://local.adspower.net:50325`.
- **`.env.local`:** `ADSPOWER_HOST` and `ADSPOWER_API_KEY`. The key is never printed.
- **AdsPower's MCP server** (`local-api-mcp-typescript`): added at local scope, so the key stays out of git:
  `claude mcp add adspower-local-api --scope local -e PORT=50325 -e API_KEY=<key> -- npx -y local-api-mcp-typescript`
- **AdsPower's skill:** `npx skills add https://github.com/adspower/adspower-browser --skill adspower-browser`. It installs into `.agents/` with vendor kebab-case names, so it's git-ignored (rule 1). See `skills/adsPower/SKILL.md`.

## Plan

The AdsPower Professional plan with 20 profiles is $12/month. That covers 11 accounts plus 2 test profiles; move to 50 profiles ($21) at 18 accounts.
