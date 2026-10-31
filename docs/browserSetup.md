# Browser setup

Some commands work in the account's own browser rather than through a
platform's API. This page shows how to get each browser ready: AdsPower (the
main one) and Camoufox (the fallback). You need it before running any command
that opens a browser, such as `log inspect` or `log facebook host`.

## What to know first

- Which commands run in which browser, and what each browser can do, is
  generated from the code: [the browser layer](reference.md#the-browser-layer)
  and [Browsers](browsers.md).
- A browser profile holds no proxy, password or 2FA key. Those stay in Twenty
  (or the local accounts file). The proxy goes on only to open the browser and
  comes off when it closes.
- Whichever browser runs:
  - the account must pass the account check first;
  - its proxy and cookies are copied into a private temporary folder for the
    run and deleted afterwards;
  - every launch is a visible window with the cursor shown, never headless.

## AdsPower

```bash
log adsPower status          # AdsPower's Local API answers
log adsPower profiles        # its profiles, and the Twenty account of each
log adsPower sync            # dry run: one profile per account on a platform with a browser path
log adsPower sync --apply    # make them, and link each in socialAccounts.adsPowerProfileId
```

More: [AdsPower](adsPower.md). Running across servers:
[Deployment](deployment.md).

## Camoufox

Camoufox runs the accounts without an AdsPower profile. The commands not yet
on the shared driver also launch it themselves, through
[facebook-camofox-client](https://github.com/PRACE1/facebook-camofox-client)
(`python/session/logWorker.py`) or their own sessions
(`python/session/publishSession.py`, `connectSession.py`,
`profileSession.py`).

```bash
git clone https://github.com/PRACE1/facebook-camofox-client ../facebook-camofox-client
pip install -e ../facebook-camofox-client
python -m camoufox fetch          # downloads the Camoufox browser
log facebook doctor
```

## Adding another browser

A new browser is one more driver:

- its folder `src/browser/<name>` (capability row, driver, tests);
- its Python opener in `python/browser/browserDriver.py`;
- its column in [Browsers](browsers.md).

`bun run check:browsers` (pre-commit) refuses one that is missing a piece.
