---
name: adsPower
description: Give every account on a browser platform its AdsPower profile, give profiles back, check the Local API, and keep the browser-driver rules (rules 42, 44, 78, 84)
---

# adsPower

## Hard boundaries

1. **Twenty stays the source** (rule 13). An AdsPower profile is the browser for one
   `socialAccounts` row, linked by `adsPowerProfileId`. The Twenty row is never deleted; a DEACTIVATED
   account, or one whose home is not in `LOG_ADSPOWER_HOMES`, gives its profile back (deleted from
   AdsPower, `adsPowerProfileId` cleared, rule 78).
2. **No secret in AdsPower at rest.** Profiles are made with no proxy, password or 2FA key.
   `python/browser/browserDriver.py` puts the proxy on only to open, after the gate, and clears it at close.
3. **Same as Camoufox** (rule 44). An AdsPower session goes through the same gate (rule 12),
   self-check (rule 17), session HAR (rule 22), human mouse and scroll. `docs/browsers.md`
   lists what's built; `bun run check:browsers` keeps every browser in step.
4. **Provider selection is explicit.** AdsPower is the default. A linked account profile stays pinned to AdsPower; an explicit account driver remains authoritative. With no account override, `LOG_BROWSER_DRIVER` selects the workspace default. Camoufox remains available only when explicitly selected. Missing AdsPower setup or a profile stops launch; never silently fall back.
5. **Never print `ADSPOWER_API_KEY`.** It lives in `.env.local` and the local-scope MCP config.

## Environment

- The AdsPower app is running here: `log adsPower status` says "up".
- `.env.local` has `ADSPOWER_HOST` (default `http://local.adspower.net:50325`) and `ADSPOWER_API_KEY`.
- AdsPower's MCP server (`adspower-local-api`) is added at local scope. AdsPower's own skill is
  reinstalled with `npx skills add https://github.com/adspower/adspower-browser --skill adspower-browser`
  (vendor kebab-case names, git-ignored by rule 1).

## Commands

```bash
log adsPower status                 # the Local API answers
log adsPower profiles               # AdsPower's profiles, and the Twenty account of each
log adsPower sync                   # dry run: release / create / relink / linked / skip per account
log adsPower sync --apply           # give back DEACTIVATED and out-of-home profiles, make the missing ones, link them in Twenty
log adsPower sync --apply --homes US  # this run's homes (default LOG_ADSPOWER_HOMES, rule 78)
log adsPower sync --apply --account <accountName>
```

Run `sync --apply` through Monitor (rule 26): it prints one line per account as it goes.
A `skip` is a banned or dead account, one with no home country in `HOME_COUNTRIES`, or one outside the
homes that holds no profile. What the sync must do: `docs/specs/adsPower.md`.
A failed create usually means the plan's profile limit: the AdsPower plan must hold at least as many profiles as accounts.

## Adding another browser

Write a `BrowserDriver` (`src/browser/driver/types.ts`): prepare, gate, start, selfCheck, stop.
Add its name to `BROWSER_DRIVERS`. The machine already enforces the order, so the new browser
can't skip the gate or the self-check. Details: `docs/adsPower.md`.

## Console browser checks

Opening a console browser check automatically provisions a missing AdsPower account profile through the existing account-scoped Log MCP sync operation, verifies the saved profile binding, then opens the account-owned browser through inspect.start. The XState machine displays centered preparation and connection stages. Provisioning and launch are attempted once per dialog; failure or missing binding stops the flow. Concurrent provisioning requests share one operation. Existing profile, home, status, proxy and launch gates remain authoritative.

Allowed countries can be edited in Connections → Extensions → Browser → AdsPower → Manage. Save comma-separated country codes or the explicit value all. The setting persists privately as LOG_ADSPOWER_HOMES and existing MCP sessions read it before sync; changing it does not reset account/platform stops or other launch gates.

Browser launch and browser preflight no longer apply the old active-hours window. The console does not wait for waking hours. Country/proxy, home/device, launch-budget, capture, account and owner checks still apply. Historical outsideActiveHours outcomes are retained as evidence and do not block a new launch.


Console profile preparation consumes the exact account-scoped sync entry before continuing. A deactivated, banned or dead status is a stop; an excluded country or missing home locale is a setup block; an unavailable provider needs configuration; an unconfirmed create/binding is an uncertain operation. Preserve each reason in sanitized console/server diagnostics and the typed browser view. Normalize the legacy accountStatus field at the console boundary before choosing profileRequired. Never clear an account stop, repeat an uncertain provisioning write or infer profile creation from exit zero alone.
