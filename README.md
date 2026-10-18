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
bun bin/log.ts listings --account fb-pacer
bun bin/log.ts listing 1583545526797714
bun bin/log.ts accounts
```

Every command takes `--json` and never prompts, so scripts and agents can use it.

| Command | What it shows |
| --- | --- |
| `log launch` | Clack menu: browse a listing, filter by status or account, list accounts |
| `log listings [--status <s>] [--account <id>]` | The listings table |
| `log listing <listing-id>` | One listing in full, plus the seller actions it allows |
| `log accounts` | The Facebook accounts, their last issue, and how many listings each owns |
| `log doctor` | Checks python, facebook-camofox-client, the Camoufox browser, and which accounts have a saved session |
| `log login --account <id>` | Opens Camoufox so you log into Facebook by hand, then saves that account's session |
| `log scan --account <id>` | Reads Marketplace > Selling live and puts each card next to what log says |
| `log status <listing-id> --account <id>` | Opens one item page live and classifies it |

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
bun bin/log.ts login --account fb-galway-rubbish
bun bin/log.ts scan --account fb-galway-rubbish
```

Sessions are Playwright storage_state files in `~/.logCli/facebook/<account-id>.json`
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
src/cli/live/                   log doctor, login, scan, status
src/camofox/worker/             spawns python/logWorker.py, maps dashboard badges to statuses
python/logWorker.py             bridge into facebook-camofox-client
```

See `docs/namingConventions.md`. Run `bun run check` for the naming gate, typecheck and tests.

## License

MIT
