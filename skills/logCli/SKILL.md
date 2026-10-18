---
name: logCli
description: Run log-cli, the Facebook Marketplace command line for ListeningKit. Accounts and listings live in Twenty (socialAccounts, agencyListings). Check an account may run, sign it in through its proxy, scan its selling page, run the XState monitor, publish listings (dry run unless --live), and fill or heal campaigns when accounts are lost.
---

# logCli

Run from the repo root (`REPOS/log-cli`). Every command takes `--json`, and
none of them prompt unless you run `log launch` in a terminal.

## Hard boundaries

1. **Read-only on Facebook, except `log publish --live`.** `scan`, `status` and
   `watch` only read. `connect` only saves cookies. `publish` is a dry run
   unless `--live` (AGENTS.md rule 10). Nothing is edited or deleted on Facebook.
2. **Twenty is the source (rule 13).** Accounts are `socialAccounts` (FACEBOOK),
   listings are `agencyListings`. Never delete either: banned or dead accounts
   keep their record (`log account status`). Never print cookies, proxies,
   passwords or 2FA secrets; `log` never selects password, email or totpSecret.
3. **Marketplace only.** No X, Reddit, keywords or communities.
4. **Camoufox is always visible.** Every launch is headed, with humanize on and
   the cursor shown (AGENTS.md rule 11). There is no `--headless`. Run it where
   a screen can show the window.
5. **No browser without the account's proxy (rule 12).** The proxy is the
   socialAccount's `proxy`, its country `homeCountry`. No exception: not dry
   runs, not `connect`. `docs/proxies.md`.

## Environment

- Bun, Python 3.12 with `facebook-camofox-client` installed
  (`pip install -e ../facebook-camofox-client`), and the Camoufox browser
  (`python -m camoufox fetch`).
- `log-cli/.env.local` (git-ignored): `TWENTY_BASE_URL`, `TWENTY_API_KEY`,
  `CAPTCHA_KRAKEN_API_KEY`, `2CAPTCHA_API_KEY`. `LOG_PYTHON` picks the interpreter.
- After adding Twenty fields: `node scripts/twentySetup.mjs --apply`, then
  `bun run twenty:client` (the generated client, rule 14).

## Commands

```bash
bun run launch                                          # Clack menu over everything below

# Twenty data
bun bin/log.ts accounts                                  # FACEBOOK accounts, and whether each may run
bun bin/log.ts account show galwayOne
bun bin/log.ts account status galwayOne BANNED --reason accountDisabled   # kept; campaign listings replaced
bun bin/log.ts listings [--status READY] [--account galwayOne] [--campaign <id>]
bun bin/log.ts listing <agencyListingId>

# sign in to log itself (Twenty OAuth through blaster's web app, same as `blaster login`)
bun bin/log.ts login | whoami | logout

# proxies (rule 12): check before anything else
bun bin/log.ts proxy check --account galwayOne           # exit IP + country, no browser, saved to Twenty

# live (launches Camoufox through the proxy)
bun bin/log.ts doctor                                    # setup check, which accounts may run
bun bin/log.ts connect --account galwayOne               # sign in by hand, cookies saved to Twenty
bun bin/log.ts scan --account galwayOne                  # Marketplace > Selling, written back to the listings
bun bin/log.ts status <facebookListingId> --account galwayOne

# the monitor (XState), every step printed live
bun bin/log.ts watch --account galwayOne [--checks 0 --interval 240] [--json]

# publish one Twenty listing (XState), every step printed live. Dry run unless --live
bun bin/log.ts publish --listing <agencyListingId>
bun bin/log.ts publish --listing <agencyListingId> --live
# against the local copy of the create form (no Facebook)
bun bin/log.ts publish --listing <id> --formUrl file:///$PWD/python/fixtures/createItem.html

# campaigns: one ad on N accounts in one place (docs/accountsAndListings.md)
bun bin/log.ts campaign fill --campaign <id> --from <agencyListingId> --accounts 10
bun bin/log.ts campaign run --campaign <id> [--live]
bun bin/log.ts campaign heal --campaign <id>
```

## Reading the results

Every code is in the error catalog: `log errors` lists them, `log errors --code <code>`
explains one (meaning, retryable, where each machine ends, what to do), and
`docs/errorCatalog.md` has them all with the machine diagrams. After changing
`src/errors/catalog/types.ts`, run `bun run errors:export`.

| You see | Means | Do |
| --- | --- | --- |
| `neverConnected` | No saved session for that account | `log connect --account <accountId>` |
| `loginWall` / `sessionExpired` | Facebook wants a fresh login | `log connect` again |
| `checkpointed`, `suspended` | Account problem; the monitor stops at `blocked` | Tell matt, don't retry |
| `tripped` | Same error 3 times in a row | Read the trace, fix the cause, run again |
| Repost `yes (#n)` | A takedown that's within the repost budget | Decision only; nothing was posted |
