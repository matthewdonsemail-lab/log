# Browser setup

The browser layer, which commands run where, and each browser's capabilities are
generated from the code: [The browser layer](#the-browser-layer) above and
[`docs/browsers.md`](browsers.md). A new browser provider is one more
driver: its domain `src/browser/<name>` (capability row, driver, tests), its
Python opener in `python/browser/browserDriver.py` and its column in
`docs/browsers.md`; `bun run check:browsers` (pre-commit) refuses one missing a
piece (rule 44). A profile holds no proxy, password or 2FA key: those stay in
Twenty, and the proxy goes on only to open and comes off at close.

## AdsPower setup

```bash
log adsPower status          # AdsPower's Local API answers
log adsPower profiles        # its profiles, and the Twenty account of each
log adsPower sync            # dry run: one profile per account on a platform with a browser path (rule 84)
log adsPower sync --apply    # make them, link each in socialAccounts.adsPowerProfileId
```

More: [`docs/adsPower.md`](adsPower.md). Across servers: [`docs/deployment.md`](deployment.md).

## Camoufox setup

Camoufox runs the accounts without an AdsPower profile, and the commands not on
the driver yet launch it themselves, through
[facebook-camofox-client](https://github.com/PRACE1/facebook-camofox-client)
(`python/session/logWorker.py`) or their own sessions
(`python/session/publishSession.py`, `connectSession.py`, `profileSession.py`).

```bash
git clone https://github.com/PRACE1/facebook-camofox-client ../facebook-camofox-client
pip install -e ../facebook-camofox-client
python -m camoufox fetch          # downloads the Camoufox browser
log facebook doctor
```

Whichever browser runs, the account must pass the account check first, its
proxy and cookies come from Twenty into a private temp folder for the run and
are deleted afterwards, and every launch is headed with the cursor shown
(rule 11).
