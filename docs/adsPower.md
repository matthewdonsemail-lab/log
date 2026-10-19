# AdsPower in log-cli (rule 42)

matt, 2026-10-19: the browser moves to AdsPower, and Camoufox stays. Twenty's
`socialAccounts` logic stays exactly as it is. The browser is a **driver**, so
another browser can be added later the same way.

## Why AdsPower

SubQ ranked 23 anti-detect browsers on the issues we recorded, from the providers'
docs plus our run captures and identity-leak tests. AdsPower won the final against
BitBrowser 0.74 to 0.26, and Camoufox placed 21st of 23
(`RESEARCH/MARKETPLACE_PROVIDERS/subq/RESULTS.md`). Listaro ran on AdsPower, one
window per account held open for hours (`RESEARCH/LISTARO_BROWSER_LIFECYCLE.md`).
Its client, `Listaro_backup/src/lib/adspower-client.ts`, is ported to
`src/adsPower/localApi`.

## The pieces

| Path | What |
| --- | --- |
| `src/browser/driver/` | The browser-agnostic session: `BrowserDriver` (prepare, gate, start, selfCheck, stop) and `browserSessionMachine` (XState v5). `starting` is only reachable from a passed gate (rule 12), and `open` only after the self-check (rule 17). |
| `src/adsPower/localApi/` | AdsPower's Local API, v2 endpoints, `Authorization: Bearer <ADSPOWER_API_KEY>`, "Too many request" retried twice, errors as catalog codes. |
| `src/adsPower/profile/` | One profile per Facebook account in Twenty: `planSync` and `syncProfiles`. The profile id goes into `socialAccounts.adsPowerProfileId`. |
| `src/adsPower/driver/` | AdsPower as a `BrowserDriver`. It puts the account's proxy on the profile only to open it, and takes it off at close. |
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

It holds **no proxy, password, cookies or 2FA key**: those stay in Twenty only.
The proxy is written to the profile at open, after the gate, and cleared at close.

## Not built yet (nothing opens an AdsPower browser on Facebook until they are)

1. **The gate for AdsPower.** `python/proxyGate.py` checks over CDP: exit IP in the home country, speed. Until then the driver refuses with `adsPowerGateNotBuilt`.
2. **The launch self-check over CDP** (rule 17): timezone, language, Intl and exit IP in a page and a worker. Until then `adsPowerSelfCheckNotBuilt`.
3. **HAR and steps recording** on the attached context (rule 22).
4. **The Python sessions** (`inspectSession.py`, the flows, warm-up, publish) attaching to an AdsPower profile with `connect_over_cdp`, so the human mouse and scroll run there too.
5. **The host** (`log host`) picking the driver from `browserDriver`.
6. **Session migration:** each account's Twenty cookies and storage loaded into its profile, so no account signs in fresh.

## Setup

- **The app:** AdsPower runs on this machine; the Local API defaults to `http://local.adspower.net:50325`.
- **`.env.local`:** `ADSPOWER_HOST` and `ADSPOWER_API_KEY`. The key is never printed.
- **AdsPower's MCP server** (`local-api-mcp-typescript`): added at local scope, so the key stays out of git:
  `claude mcp add adspower-local-api --scope local -e PORT=50325 -e API_KEY=<key> -- npx -y local-api-mcp-typescript`
- **AdsPower's skill:** `npx skills add https://github.com/adspower/adspower-browser --skill adspower-browser`. It installs into `.agents/` with vendor kebab-case names, so it's git-ignored (rule 1). See `skills/adsPower/SKILL.md`.

## Plan

The AdsPower Professional plan with 20 profiles is $12/month. That covers 11 accounts plus 2 test profiles; move to 50 profiles ($21) at 18 accounts.
