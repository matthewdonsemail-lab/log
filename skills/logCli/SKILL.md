---
name: logCli
description: Run log-cli, the Facebook Marketplace command line for log. Read the seed listings and accounts, check the live setup, log an account in through Camoufox, scan an account's selling page live, and run the XState listing monitor with a step-by-step trace. Read-only on Facebook.
---

# logCli

Run from the repo root (`REPOS/log-cli`). Every command takes `--json`, and
none of them prompt unless you run `log launch` in a terminal.

## Hard boundaries

1. **Read-only on Facebook, except `log publish --live`.** `scan`, `status` and
   `watch` only read. `login` only saves a session file. `publish` is a dry run
   unless `--live` (AGENTS.md rule 10). Nothing is edited or deleted.
2. **Never print session files.** `~/.logCli/facebook/<accountId>.json` (Facebook
   cookies) and `~/.logCli/auth/sessions.json` (Twenty tokens) are live
   credentials. Don't cat, paste or commit them. Commands only show tokens masked.
3. **Marketplace only.** No X, Reddit, keywords or communities.

## Environment

- Bun, Python 3.12 with `facebook-camofox-client` installed
  (`pip install -e ../facebook-camofox-client`), and the Camoufox browser
  (`python -m camoufox fetch`).
- `LOG_PYTHON` picks the interpreter. `LOG_FB_STATE_DIR` moves the session files.

## Commands

```bash
bun run launch                                          # Clack menu over everything below

# seed data (what the log dashboard shows)
bun bin/log.ts listings [--status underReview] [--account fbPacer]
bun bin/log.ts listing 1583545526797714
bun bin/log.ts accounts

# sign in (Twenty OAuth through blaster's web app, same as `blaster login`)
bun bin/log.ts login                                     # opens the browser; --token <t> to paste instead
bun bin/log.ts whoami                                    # who is signed in (refreshes if expired)
bun bin/log.ts logout

# live (launches Camoufox)
bun bin/log.ts doctor                                    # setup check, sessions per account
bun bin/log.ts connect --account fbGalwayRubbish           # log in by hand, press Enter to save
bun bin/log.ts scan --account fbGalwayRubbish            # Marketplace > Selling, next to log's data
bun bin/log.ts status 1583545526797714 --account fbGalwayRubbish

# the monitor (XState), every step printed live
bun bin/log.ts watch --account fbGalwayRubbish           # one check
bun bin/log.ts watch --account fbGalwayRubbish --checks 0 --interval 240   # loop until Ctrl+C
bun bin/log.ts watch --account fbGalwayRubbish --json    # NDJSON, result on the last line

# publish one listing (XState), every step printed live. Dry run unless --live
bun bin/log.ts publish --account fbGalwayRubbish --title "Sofa" --price 50 --category Furniture --photo a.jpg,b.jpg
bun bin/log.ts publish --account fbGalwayRubbish --file listing.json --live
# against the local copy of the create form (no Facebook)
bun bin/log.ts publish --account fbGalwayRubbish --file listing.json --formUrl file:///$PWD/python/fixtures/createItem.html
```

## Reading the results

| You see | Means | Do |
| --- | --- | --- |
| `noSession` / `never_connected` | No saved session for that account | `log connect --account <accountId>` |
| `loginWall` / `session_expired` | Facebook wants a fresh login | `log connect` again |
| `checkpointed`, `suspended` | Account problem; the monitor stops at `blocked` | Tell matt, don't retry |
| `tripped` | Same error 3 times in a row | Read the trace, fix the cause, run again |
| Repost `yes (#n)` | A takedown that's within the repost budget | Decision only; nothing was posted |
