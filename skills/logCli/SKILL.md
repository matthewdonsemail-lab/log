---
name: logCli
description: Run log-cli, the Facebook Marketplace command line for ListeningKit. Accounts and listings live in Twenty (socialAccounts, agencyListings). Check an account may run, sign it in through its proxy, scan its selling page, run the XState monitor, publish listings (dry run unless --live), and fill or heal campaigns when accounts are lost.
---

# logCli

Run from the repo root (`REPOS/log-cli`). Every command takes `--json`, and
none of them prompt unless you run `log launch` in a terminal.

## Hard boundaries

1. **Read-only on Facebook, except `log facebook publish --live`.** `scan`, `status` and
   `watch` only read. `connect` only saves cookies. `publish` is a dry run
   unless `--live` (AGENTS.md rule 10). Nothing is edited or deleted on Facebook.
2. **Twenty is the source (rule 13).** Accounts are `socialAccounts` (FACEBOOK),
   listings are `agencyListings`. Never delete either: banned or dead accounts
   keep their record (`log facebook account status`). Never print cookies, proxies,
   passwords or 2FA secrets; `log` never selects password, email or totpSecret,
   except `connect --noPrompt`'s auto-login (rule 21).
3. **Marketplace only.** No X, Reddit, keywords or communities.
4. **Camoufox is always visible.** Every launch is headed, with humanize on and
   the cursor shown (AGENTS.md rule 11). There is no `--headless`. Run it where
   a screen can show the window.
5. **No browser without the account's proxy (rule 12).** The proxy is the
   socialAccount's `proxy`, its country `homeCountry`. No exception: not dry
   runs, not `connect`. `docs/proxies.md`.
6. **One device, one locale, checked, in local hours (rules 15-18).** An
   account's first launch makes its device (`deviceProfile` in Twenty), and
   every launch replays it. The locale comes from `HOME_COUNTRIES`. The gate's
   self-check closes the browser before Facebook if the timezone, locale or exit
   IP is off. Nothing runs outside 08:00-22:00 in the account's home timezone
   (`activeHoursStart`/`activeHoursEnd` to change it). `--bypass` skips the hours for one run when matt
   asks (rule 20), and nothing else. From Vietnam, Ireland's
   day is 14:00-04:00 ICT. Never clear `deviceProfile` without matt; after a
   Camoufox upgrade, re-run the live leak checks (`docs/proxies.md`).

## Environment

- Bun, Python 3.12 with `facebook-camofox-client` installed
  (`pip install -e ../facebook-camofox-client`), and the Camoufox browser
  (`python -m camoufox fetch`).
- `log-cli/.env.local` (git-ignored): `TWENTY_BASE_URL`, `TWENTY_API_KEY`,
  `CAPTCHA_KRAKEN_API_KEY`, `2CAPTCHA_API_KEY`. `LOG_PYTHON` picks the interpreter.
- After adding Twenty fields: `node scripts/twenty/twentySetup.mjs --apply`, then
  `bun run twenty:client` (the generated client, rule 14).

## Commands

```bash
bun run launch                                          # Clack menu over everything below

# Twenty data
bun bin/log.ts facebook accounts                                  # FACEBOOK accounts, and whether each may run
bun bin/log.ts facebook account show galwayOne
bun bin/log.ts facebook account status galwayOne BANNED --reason accountDisabled   # kept; campaign listings replaced
bun bin/log.ts facebook listings [--status READY] [--account galwayOne] [--campaign <id>]
bun bin/log.ts facebook listing <agencyListingId>
bun bin/log.ts facebook listing create --account galwayOne --file ad.json   # a READY row, checked like publish checks it

# sign in to log itself (Twenty OAuth through blaster's web app, same as `blaster login`)
bun bin/log.ts login | whoami | logout

# proxies (rule 12): check before anything else
bun bin/log.ts proxy check --account galwayOne           # exit IP + country, no browser, saved to Twenty
bun bin/log.ts proxy assign --account galwayOne          # a 2Captcha proxy in its home city, checked, then saved
bun bin/log.ts proxy assign --missing                    # every FACEBOOK account without a proxy
bun bin/log.ts proxy assign --account lancasterOne --region pennsylvania   # pin the state; exits over 100 km from home are retried, then proxyTooFar
bun bin/log.ts proxy balance                             # 2Captcha traffic left

# live (launches Camoufox through the proxy)
bun bin/log.ts facebook doctor                                    # setup check, which accounts may run
bun bin/log.ts facebook connect --account galwayOne               # the connect machine; a person signs in in the window, cookies saved to Twenty
bun bin/log.ts facebook connect --account galwayOne --noPrompt    # the same, auto-login typing Twenty's details (rule 21), up to --wait 600 s
bun bin/log.ts facebook scan --account galwayOne                  # Marketplace > Selling, written back to the listings
bun bin/log.ts facebook status <facebookListingId> --account galwayOne

# the monitor (XState), every step printed live
bun bin/log.ts facebook watch --account galwayOne [--checks 0 --interval 240] [--json]

# publish one Twenty listing (XState), every step printed live. Dry run unless --live
bun bin/log.ts facebook publish --listing <agencyListingId>
bun bin/log.ts facebook publish --listing <agencyListingId> --live
# against the local copy of the create form (no Facebook)
bun bin/log.ts facebook publish --listing <id> --formUrl file:///$PWD/python/fixtures/createItem.html

# campaigns: one ad on N accounts in one place (docs/accountsAndListings.md)
bun bin/log.ts facebook campaign fill --campaign <id> --from <agencyListingId> --accounts 10
bun bin/log.ts facebook campaign run --campaign <id> [--live]
bun bin/log.ts facebook campaign heal --campaign <id>
```

## As an MCP server

`bin/logMcp.ts` (`bun run mcp`) serves every command as an MCP tool over
stdio, registered as `log` in the repo's `.mcp.json`, so in Claude Code they
show up as `mcp__log__<command>`. A tool takes `args` (what goes after
`log <command>`) and returns the command's stdout, stderr and exit code. It
runs through `runCli`, so every gate above still applies.

- `--live` is refused unless the call also has `confirmLive: true`. Set it
  only when matt asked for that live run (rule 10).
- `connect` always runs `--noPrompt` as a tool. It is the connect machine
  (`marketplace/connect/machine.ts`): every page is read as a kind (loggedIn,
  loginForm, twoStepCode, twoStepMethod, trustDevice, automatedBehaviour,
  cookieBanner, findAccount, checkpoint, captcha, wrongPassword, disabled...)
  and printed as a state, until signed in or `--wait` s. Each page takes
  Listaro's path (rule 23). `launch` and `login`
  aren't tools, because they wait on a person at the terminal and stdin is the
  MCP channel.
- Taking an account from NEEDSLOGIN to a dry run: `skills/accountToDryRun`.
- It loads `log-cli/.env.local` itself, whatever folder it is started from.
- **Every action records a HAR (rule 22).** Each connect, scan, status,
  watch check and publish writes `session.har`, its timed `steps.jsonl`, and
  one rea-read HAR per step under `~/.logCli/runs/...`
  (`skills/reaCapture`).
- **Every log line is visible.** The worker's and publish session's stderr
  go through `observability/processLog`. As a tool, each line (with the
  command's own output) is in the result under `log:`, is sent as an MCP log
  notification, and is appended live to `~/.logCli/mcp/<day>.log`
  (`LOG_MCP_DIR` to move it). The terminal CLI (`bin/log.ts`) appends
  its own lines there too, as `cli:<command>` (rule 55). Watch a long call
  (`connect`, `publish`) with `tail -f ~/.logCli/mcp/<day>.log`. Lines name actions and page paths only,
  never credentials or query strings.

## Reading the results

Every code is in the error catalog: `log errors` lists them, `log errors --code <code>`
explains one (meaning, retryable, where each machine ends, what to do), and
`docs/errorCatalog.md` has them all with the machine diagrams. After changing
`src/errors/catalog/types.ts`, run `bun run errors:export`.

| You see | Means | Do |
| --- | --- | --- |
| `neverConnected` | No saved session for that account | `log facebook connect --account <accountId>` |
| `loginWall` / `sessionExpired` | Facebook wants a fresh login | `log facebook connect` again |
| `checkpointed`, `suspended` | Account problem; the monitor stops at `blocked` | Tell matt, don't retry |
| `wrongPassword` | connect: Facebook said Twenty's password is wrong | Fix it in Twenty, then `log facebook connect` |
| `signInNotFinished` | connect: `--wait` ran out; the output names the last page | Finish that page in the window, or a longer `--wait` |
| `tripped` | Same error 3 times in a row | Read the trace, fix the cause, run again |
| Repost `yes (#n)` | A takedown that's within the repost budget | Decision only; nothing was posted |
