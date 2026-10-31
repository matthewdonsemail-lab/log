# AdsPower

AdsPower is the main browser log uses for accounts that need one. Each account
gets one AdsPower profile, which keeps its own fingerprint and cookies, and log
opens it, checks it and drives it through Playwright. Read this when you set up
AdsPower, link accounts to profiles, or wonder why a profile was given back.

The browser is a **driver**, so other browsers can be added the same way, and
Camoufox stays as the fallback. How every browser is held to the same
capabilities: [Browsers](browsers.md). How it runs across servers:
[Deployment](deployment.md).

## Why AdsPower

- It was picked after ranking 23 anti-detect browsers on the problems seen in
  real recorded runs, using each provider's docs, run captures and
  identity-leak tests. AdsPower won the final against BitBrowser (0.74 to
  0.26); Camoufox placed 21st of 23.
- An earlier production setup ran on AdsPower, with one window per account
  held open for hours. Its AdsPower client was ported into log.

## The pieces

| Path | What it is |
| --- | --- |
| `src/browser/driver/` | The browser-agnostic session machine (XState v5) and the capability list every browser fills |
| `src/browser/adsPower/client.ts` | The Local API client (v2 endpoints, `Authorization: Bearer <ADSPOWER_API_KEY>`, "Too many request" retried twice, catalog errors), `syncProfiles`, and `adsPowerDriver` |
| `src/browser/adsPower/helpers/` | `profileRequest` (the create body) and `planSync` (release, create, relink, linked or skip, per account) |
| `src/browser/adsPower/types.ts` | Its types, and `adsPowerCapabilities`, its row of the parity table |
| `python/browser/adsPowerBrowser.py` | The same Local API from Python: set the profile's proxy, start, stop |
| `python/browser/browserDriver.py` | `open_ads_power`: gate, proxy on, start a visible window, `connect_over_cdp`, the profile's context, session HAR, self-check; at the end, stop and proxy off |
| `src/cli/adsPower/` | `log adsPower status`, `log adsPower profiles`, `log adsPower sync [--apply] [--homes <US,IE>]` |

Twenty gets two fields, both additions:

- `adsPowerProfileId`: the profile linked to the account.
- `browserDriver`: `adsPower` or `camoufox`; empty means Camoufox.

## What a profile holds

Each profile is set up with:

- **Name:** the account's `accountName`, with a remark `log-cli twenty:<id>` so
  a lost link can be found again.
- **Group:** `logCli`.
- **Browser:** Windows Chrome (`random_ua` Windows 10/11).
- **Language:** pinned from the home country (`HOME_COUNTRIES`).
- **Timezone and geolocation:** from the exit IP.
- **Fingerprint noise:** AdsPower's own per-profile noise on canvas, WebGL
  image, audio, client rects and media devices; WebRTC set to `forward`.

It holds **no proxy, password or 2FA key**:

- The proxy is put on the profile only to open it, after the gate, and taken
  off at close.
- The profile keeps its own cookies. The saved session from Twenty is carried
  in once, only into a profile with no Facebook login.

## Giving a profile back

Your AdsPower plan limits how many profiles you can hold, so a profile is only
held by an account that will use it:

- **DEACTIVATED accounts:** `log facebook account status <a> DEACTIVATED`
  deletes the account's profile from AdsPower, clears `adsPowerProfileId`, then
  runs the sync so an account waiting for a profile gets the freed slot. An
  account set to DEACTIVATED directly in Twenty gives its profile back at the
  next `log adsPower sync --apply`.
- **Home countries:** `LOG_ADSPOWER_HOMES` in `.env.local` (for example `US`),
  or `--homes` on the sync, names the home countries that hold profiles. An
  account whose home is elsewhere gives its profile back the same way and gets
  none.

The sync releases profiles first, then makes and links new ones. The account's
Twenty row, cookies and status stay as they are.

## Opening an account on AdsPower

1. Set `socialAccounts.browserDriver` to `adsPower` for the account. Its
   profile must be linked (`log adsPower sync --apply`).
2. `log inspect start --account <a>`, `log flow run`,
   `log facebook warmup stages run` and `log facebook host start` then open its
   AdsPower profile through `python/browser/browserDriver.py`. The gate,
   self-check, session HAR, human mouse and scrolling are the same as on
   Camoufox.

## Not built yet

1. **The older sessions on AdsPower.** `publishSession`, `connectSession` and
   `profileSession` still launch Camoufox.
2. **One machine at a time.** A `cloud-active` check before opening, so two
   machines never open the same profile ([Deployment](deployment.md)).

## Setup

- **The app:** AdsPower runs on the same machine as log. The Local API defaults
  to `http://local.adspower.net:50325`.
- **`.env.local`:** `ADSPOWER_HOST` and `ADSPOWER_API_KEY`. The key is never
  printed.
- **AdsPower's MCP server** (`local-api-mcp-typescript`), added at local scope
  so the key stays out of git:

  ```bash
  claude mcp add adspower-local-api --scope local -e PORT=50325 -e API_KEY=<key> -- npx -y local-api-mcp-typescript
  ```

- **AdsPower's skill:**
  `npx skills add https://github.com/adspower/adspower-browser --skill adspower-browser`.
  It installs into `.agents/` with the vendor's kebab-case names, so it is
  git-ignored. See `skills/adsPower/SKILL.md`.

## Choosing a plan

AdsPower's plans are priced by the number of profiles (in October 2026 the
Professional plan was $12 a month for 20 profiles, $21 for 50). You need one
profile per account that uses a browser, plus a couple for testing.

The rules behind this are in AGENTS.md.
