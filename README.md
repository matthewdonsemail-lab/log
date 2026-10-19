# log-cli

The command line for ListeningKit's Facebook Marketplace work. Accounts and
listings live in Twenty (`socialAccounts`, `agencyListings`), reached through
the same generated GraphQL client blaster and the dialer use. log-cli checks an
account may run (proxy in its home country, rule 12), drives Camoufox through
facebook-camofox-client and its own publish session, and writes every result
back to Twenty.

Built the same way as the Rank CLI from the Nebius hackathon: a command registry
that generates its own usage, commands that return results rather than
printing, and a [Clack](https://github.com/bombshell-dev/clack) guided menu
(`log launch`) on top of the scriptable commands.

## Run it

```bash
bun install
cp .env.example .env.local     # TWENTY_BASE_URL, TWENTY_API_KEY, CAPTCHA_KRAKEN_API_KEY, 2CAPTCHA_API_KEY
bun run launch                 # guided menu (needs a terminal)
bun bin/log.ts accounts        # FACEBOOK accounts in Twenty, and whether each may run
bun bin/log.ts listings --status READY
bun bin/log.ts publish --listing <agencyListingId>        # dry run
```

Every command takes `--json` and never prompts, so scripts and agents can use it.

| Command | What it does |
| --- | --- |
| `log launch` | Clack menu over the commands below |
| `log accounts` / `log account show <name>` | Facebook accounts: status, home, proxy, last proxy check, whether each may run |
| `log adsPower status\|profiles\|sync [--apply]` | AdsPower's Local API, its profiles, and one profile per Twenty account (rule 42) |
| `log account status <name> <STATUS>` | Set an account's status. RESTRICTED, BANNED or DEAD keep the account and replace its campaign listings |
| `log listings` / `log listing <id>` | Twenty listings by status, account or campaign; one in full |
| `log proxy check --account <name>` | The proxy's exit IP and country, no browser, written to Twenty |
| `log proxy assign --account <name>` / `--missing` | A 2Captcha residential proxy in the account's home city, checked, then saved to Twenty |
| `log proxy balance` | 2Captcha proxy traffic left |
| `log doctor` | Python, facebook-camofox-client, Camoufox, Twenty, and which accounts may run |
| `log connect --account <name>` | Sign in by hand through the account's proxy; cookies saved to Twenty |
| `log scan --account <name>` | Marketplace > Selling live; health and clicks written to the listings |
| `log status <facebookListingId> --account <name>` | One item page live |
| `log watch --account <name>` | The listing monitor (XState), every step printed |
| `log publish --listing <id> [--live]` | Post one listing (XState), dry run unless `--live` |
| `log campaign fill|run|heal|show --campaign <id>` | One ad on N accounts in one place, published and kept full |
| `log errors` / `log graph publish` | The error catalog; the machines as Mermaid |
| `log login` / `log logout` / `log whoami` | Sign in to log with Twenty through blaster's web app |

How accounts, statuses, replacement and campaigns work: `docs/accountsAndListings.md`.
How proxies load and are checked: `docs/proxies.md`. Where accounts are bought:
`docs/vendors/`. Every error code: `docs/errorCatalog.md`.

## Twenty

- `scripts/twentySetup.mjs` adds the fields log-cli needs (additive only; prints
  the plan, `--apply` creates them).
- `bun run twenty:client` regenerates `src/twenty/graphql/generated` from the live
  workspace (twenty-client-sdk), the same way blaster (`pnpm twenty:client`) and the
  dialer (`bun run api:client`) do. `bun run twenty:client:check` fails when it is stale.
- Tests never call Twenty: they inject `marketplaceFixture()`, an in-memory Twenty.

## The listing monitor (`log watch`)

`src/marketplace/monitor/machine.ts` is an XState v5 machine:

```text
checking --ok-----------> evaluating --> waiting --after poll--> checking
   |                          '-- checks done --> done
   |--rateLimited--> resting --after 24h--> checking
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

## The browser: AdsPower, with Camoufox kept (rule 42)

The direction from 2026-10-19: accounts move to **AdsPower**, Listaro's browser and
SubQ's pick on our recorded issues. **Camoufox stays** and can be used again later.
Twenty's `socialAccounts` logic doesn't change.

The browser is a driver (`src/browser/driver`). One XState machine runs every
account's session, whichever browser it uses: prepare, gate, start, self-check,
open, close. A browser can't open without its proxy gate (rule 12), and isn't open
before its self-check (rule 17). Another browser is added by writing one more
driver.

```bash
bun bin/log.ts adsPower status          # AdsPower's Local API answers
bun bin/log.ts adsPower profiles        # its profiles, and the Twenty account of each
bun bin/log.ts adsPower sync            # dry run: one profile per Facebook account
bun bin/log.ts adsPower sync --apply    # make them, link each in socialAccounts.adsPowerProfileId
```

A profile holds no proxy, password or 2FA key: those stay in Twenty. Both browsers are
opened by one Python layer (`python/browserDriver.py`), which hands every session the same
Playwright context. So the proxy gate, the self-check, the session HAR, the human mouse and
scroll, the flows and the warm-up are the same on either. `docs/browsers.md` is the parity
table, and `bun run check:browsers` (pre-commit) keeps it. Setup and what's next:
`docs/adsPower.md`. Across servers: `docs/deployment.md`.

## Live mode (Camoufox)

`doctor`, `connect`, `scan`, `status` and `watch` launch Camoufox through
[facebook-camofox-client](https://github.com/PRACE1/facebook-camofox-client)
(`python/logWorker.py`); `publish` drives its own session
(`python/publishSession.py`). Before either starts, the account must pass the
account check, and at launch `python/proxyGate.py` checks the proxy exits in the
account's home country (rule 12). The proxy and cookies come from Twenty, are
written to a private temp folder for the run, and are deleted afterwards.
Every launch is headed, humanized, with the cursor shown (rule 11).

Setup, once:

```bash
git clone https://github.com/PRACE1/facebook-camofox-client ../facebook-camofox-client
pip install -e ../facebook-camofox-client
python -m camoufox fetch          # downloads the Camoufox browser
bun bin/log.ts doctor
```

## Record a procedure, then run it anywhere (`log inspect`, `log flow`)

`log inspect` drives one gated, headed Camoufox a step at a time and records
every step (snapshot, screenshot, HAR, rea). `log flow fromInspect` turns that
recording into a flow: its docs, an XState machine, `log flow run <name>` for
any account, and an MCP tool of its own (`flowProfileSetup`). The whole
pipeline, the actions, the saved flows and what the recordings showed:
`docs/recordToFlow.md`. Every request Facebook's pages made: `docs/facebookClient/`.

## Layout

```text
bin/log.ts                      entrypoint
src/twenty/graphql/             the generated Twenty client (generated/), its seam, an in-memory Twenty for tests
src/marketplace/socialAccount/  Facebook accounts in Twenty, the account check (checkRunnable)
src/marketplace/agencyListing/  listings in Twenty, run write-back, dashboard sync
src/marketplace/replacement/    losing an account, replacements, campaign fill
src/marketplace/publish/        the XState publish machine
src/marketplace/monitor/        the XState listing monitor + relist rules
src/marketplace/listing/        the listeningkit-hackathon listing machine port (+ its seed)
src/browser/driver/             the browser-agnostic session machine and capability list (rules 42, 44)
src/browser/camoufox/           Camoufox's driver and capability row
src/browser/adsPower/           AdsPower: Local API client (from Listaro), profile sync, its driver and capability row
src/camofox/run/                one run's private proxy/cookie files
src/camofox/worker/             spawns python/logWorker.py
src/camofox/session/            drives python/publishSession.py step by step
src/captcha/router/             CaptchaKraken → 2Captcha → a person
src/errors/catalog/             every error code, once
src/cli/*                       the commands
python/proxyGate.py             no launch unless the proxy exits in the home country
python/visibleBrowser.py        headed, humanized, cursor shown
```

See `docs/namingConventions.md`. Run `bun run check` for the naming gate, typecheck and tests.

## License

MIT
