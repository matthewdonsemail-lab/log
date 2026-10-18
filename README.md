# log-cli

The command line for [log](https://github.com/matthewdonsemail-lab/log)
(listeningkit-hackathon). It loads the same Facebook Marketplace data as the
dashboard's Listings view: the listings, the Facebook accounts that publish
them, and what the listing state machine lets a seller do with each one.

The CLI is built the same way as the Rank CLI from the Nebius hackathon: a
command registry that generates its own usage, commands that return results
rather than printing, and a [Clack](https://github.com/bombshell-dev/clack)
guided menu (`log launch`) on top of the scriptable commands.

## Run it

```bash
bun install
bun run launch                 # guided menu (needs a terminal)
bun bin/log.ts listings        # every listing
bun bin/log.ts listings --status removed
bun bin/log.ts listings --account fbPacer
bun bin/log.ts listing 1583545526797714
bun bin/log.ts accounts
```

Every command takes `--json` and never prompts, so scripts and agents can use it.

| Command | What it shows |
| --- | --- |
| `log launch` | Clack menu: browse a listing, filter by status or account, list accounts |
| `log listings [--status <s>] [--account <id>]` | The listings table |
| `log listing <listingId>` | One listing in full, plus the seller actions it allows |
| `log accounts` | The Facebook accounts, their last issue, and how many listings each owns |
| `log doctor` | Checks python, facebook-camofox-client, the Camoufox browser, and which accounts have a saved session |
| `log login` / `log logout` / `log whoami` | Sign in with Twenty through blaster's web app (OAuth), the same flow as `blaster login` |
| `log connect --account <id>` | Opens Camoufox so you log into Facebook by hand, then saves that account's session |
| `log scan --account <id>` | Reads Marketplace > Selling live and puts each card next to what log says |
| `log status <listingId> --account <id>` | Opens one item page live and classifies it |
| `log watch --account <id> [--checks n] [--interval min]` | Runs the listing monitor (XState) and prints every step as it happens |

## The listing monitor (`log watch`)

`src/marketplace/monitor/machine.ts` is an XState v5 machine:

```text
checking --ok-----------> evaluating --> waiting --after poll--> checking
   |                          '-- checks done --> done
   |--rate_limited--> resting --after 24h--> checking
   |--other account issue--> blocked
   '--error--> failed --first try--> retrying --after 5s--> checking
                 |-- same error 3x in a row --> tripped
                 '-- otherwise --> waiting
```

`log watch` prints each event and state through XState's inspect API
(`src/observability/trace`). `--json` streams them as NDJSON, one line per step,
with the result on the last line. `--checks 0` runs until Ctrl+C.

Where the rules come from:

| Rule | Source |
| --- | --- |
| Removal reasons, never repost on policy/ban/checkpoint, 2 reposts, 1h then 3h cooldown, RETRY_EXHAUSTED | facebook-camofox-client `domain_marketplace/relist.py` |
| One quick retry for transient errors, circuit breaker at 3 same errors, 24h rest when limited | Listaro `agent/src/poll-loop.ts`, `api/agent/result/route.ts`, `process-posts` |
| Don't call listings removed when the page showed none (or under 3 of 3+) | Listaro `src/lib/listing-checker.ts:790-797` |
| No second repost while one is queued | Listaro `listing-checker.ts:868-886` |
| Page text to account issue (ban, checkpoint, limit, login) | Listaro `poster.ts`, `process-posts`, `facebook-auto-login.ts`, one issue per signal |

It only decides. Nothing is posted.

## Signing in (`log login`)

The same OAuth flow as `blaster login` (blaster `packages/blaster-cli/src/cli/login.ts`).
Twenty is the identity provider, and blaster's hosted web app
(`https://blaster.listeningkit.com`) runs the sign-in page.

1. `log login` makes a state nonce and a PKCE challenge, then starts a one-shot server on `127.0.0.1`.
2. It opens `<webUrl>/login?state=…&code_challenge=…&exchange=…`. You sign in to Twenty there.
3. The web app POSTs the tokens back to the loopback. log-cli only accepts them if state and challenge match this run.
4. The token is checked through blaster's API (`GET /api/auth/me`) and saved in `~/.logCli/auth/`
   (`LOG_HOME` moves it). `log whoami` refreshes it through `POST /api/auth/refresh` when it expires.

`--token <accessToken>` is the paste path for headless terminals. `--webUrl` / `--apiUrl`
(or `LOG_WEB_URL` / `LOG_API_URL`) point at a local blaster. The CLI never holds the
OAuth client secret.

## Live mode (Camoufox)

`doctor`, `login`, `scan` and `status` launch a real Camoufox browser through
[facebook-camofox-client](https://github.com/PRACE1/facebook-camofox-client).
`src/camofox/worker/client.ts` spawns `python/logWorker.py`, which takes one
JSON request and prints one JSON result, the same way inferencesaver's
`scripts/facebook-client.mjs` drove the old `facebook-worker.py`.

From the Listaro agent (`Listaro_backup/agent`) it keeps one saved session per
account, the selling-page login check, and the "Needs attention" read.

Setup, once:

```bash
git clone https://github.com/PRACE1/facebook-camofox-client ../facebook-camofox-client
pip install -e ../facebook-camofox-client
python -m camoufox fetch          # downloads the Camoufox browser
bun bin/log.ts doctor
bun bin/log.ts connect --account fbGalwayRubbish
bun bin/log.ts scan --account fbGalwayRubbish
```

Sessions are Playwright storage_state files in `~/.logCli/facebook/<accountId>.json`
(`LOG_FB_STATE_DIR` moves them, `LOG_PYTHON` picks the interpreter). Never
commit them. Everything except `login` only reads Facebook. Nothing is posted,
edited or deleted.

## Where the data comes from

`src/marketplace/*/client.ts` serves the dashboard's seed rows from
listeningkit-hackathon. That is 6 listings across 3 Facebook accounts, covering
every status the dashboard renders. The first two listings are the live ones
captured by facebook-camofox-client. When that client's API is live, only
the `client.ts` files change.

## Layout

```text
bin/log.ts                      entrypoint
src/marketplace/listing/        listing types, state machine, data client
src/marketplace/account/        Facebook account types and data client
src/cli/runner/                 registry, dispatcher, args/table/usage helpers
src/cli/listing/                log listings, log listing
src/cli/account/                log accounts
src/cli/launch/                 log launch (Clack)
src/cli/live/                   log doctor, connect, scan, status
src/camofox/worker/             spawns python/logWorker.py, maps dashboard badges to statuses
src/marketplace/monitor/        the XState listing monitor + relist rules
src/observability/trace/        XState inspect -> trace lines
src/cli/watch/                  log watch
src/auth/session/               Twenty session store, PKCE, token checks (ported from blaster)
src/auth/exchange/              one-shot loopback that receives the tokens from blaster's web app
src/cli/auth/                   log login, logout, whoami
python/logWorker.py             bridge into facebook-camofox-client
```

See `docs/namingConventions.md`. Run `bun run check` for the naming gate, typecheck and tests.

## License

MIT
