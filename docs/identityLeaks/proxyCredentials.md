# Proxy credentials: the password is in the username

**Id:** `proxyCredentials` · **Severity:** medium (local exposure, not visible to Facebook) · **Status:** fixed at `a9f7584` (unitTested). The full proxy URL, password included, still lives in Twenty `socialAccounts.proxy` by design

## Summary

The 2Captcha proxy password (17 characters) equals the account prefix at the
start of every proxy username (R3, "Other finding"). log-cli treats the username
as safe to show. `maskProxyUrl` hides the password but prints the full
username. So `log accounts` and `log proxy check` print the password, in
effect, to the terminal and to anything that output is pasted into. Anyone
holding it can use our paid proxy traffic, and can send their own traffic
through an account's sticky session.

## What leaks and to whom

- **Not to Facebook.** This is a local credential exposure.
- **To anyone who sees:** terminal output, logs, Buzz messages, PR text,
  screenshots, test output, or the Twenty `socialAccounts.proxy` field.
- **What they can do:**
  - spend our proxy balance (2Captcha bills traffic both ways, $3.99/GB down to
    $1.25/GB, per `docs/proxies.md`);
  - use an account's own session id, so their traffic comes from that account's
    exit IP. Whether that hurts the IP's reputation with Facebook is not known.
    *inference*

## Evidence

- **Password equals the username prefix.** Checked in-script on 2026-10-18,
  without printing either value. The 17-character password equals the account
  prefix at the start of the proxy username (R3, "Other finding: the proxy
  password is in the username"). *verifiedLive (proxied)*
- **The docs say otherwise.** `docs/proxies.md` step 1: "The password is the
  sub-account password from the 2Captcha dashboard, in
  `2CAPTCHA_PROXY_PASSWORD`; it is not in the API." But the API does return the
  username, and on this account its prefix is the password. Whether this holds
  for every 2Captcha account is not known. *verifiedSource*, *inference*
- **log-cli prints the username.**
  `src/marketplace/socialAccount/helpers/checkRunnable.ts:32-37`:
  ```ts
  export function maskProxyUrl(raw: string | null): string {
    ...
    return `${proxy.server}${proxy.username ? ` as ${proxy.username}` : ''}`
  }
  ```
  It is used by:
  - `log accounts` (`src/cli/account/helpers/renderAccounts.ts:32`);
  - `log proxy assign` (`src/cli/proxy/index.ts:91`);
  - `log proxy check`, text and `--json` (`src/cli/proxy/index.ts:183`, `:186`).

  *verifiedSource* (found for this study)
- **The gate never echoes the URL.** `python/proxyGate.py:94-98`: "Never echo
  the proxy URL back: it carries the password." Errors name only the server.
  *verifiedSource*
- **A test script hard-codes the username.**
  `C:\Users\0\.buzz\.scratch\leakTests\common.py:30` (outside the repo). R3
  redacted its outputs as `<REDACTED>-zone-…`, but the script itself holds the
  username. *verifiedSource*
- **Temp files.** The proxy reaches Python as a temp file (`camofox/run`),
  deleted after each run. `0o600` does nothing on Windows (R4, "What is right").
  *verifiedSource*
- **Environment.** `2CAPTCHA_PROXY_PASSWORD` and the other keys are passed into
  Firefox's environment (`outOfBrowserRequests.md`). If `launch_options()`
  output is stored as a persona with its `env`, they get stored too. *verifiedSource*
- **Earlier systems.** Listaro's `scripts/assign-proxies.ts` hard-codes proxy
  credentials and a Supabase service key. `agent/src/setup.ts:94` logs the full
  proxy string with its password (`docs/proxies.md`). *verifiedSource*

## Where in our code it can happen again

- `maskProxyUrl` and every caller of it.
- Any log line, error message, `--json` output or `log.md` entry that includes a
  proxy URL or username.
- The Python gate's error messages (`python/proxyGate.py`).
- The captcha fix that will pass the proxy to 2Captcha (`captchaSolving.md`):
  the URI holds both values. 2Captcha already has them, but our ledger
  (`attempts.jsonl`) must not.
- Device-persona storage (`deviceFingerprintChurn.md`): never store `env`.
- Scripts in `.scratch/`.

## Mitigation

1. **Treat the username as a secret.** Change `maskProxyUrl` to print the server
   and only the part after the account prefix, e.g.
   `eu.proxy.2captcha.com:2334 as ****-zone-custom-region-ie-…-session-<id>`.
2. **Same rule for logs, errors, the captcha ledger and `log.md`.** Never print
   the prefix.
3. **Ask 2Captcha whether the proxy password can differ from the account
   prefix.** If it can, change it in the dashboard and update
   `2CAPTCHA_PROXY_PASSWORD`. *inference*
4. **Rotate the password** if earlier output was shared (terminal logs, chat,
   PRs), and **delete** `C:\Users\0\.buzz\.scratch\leakTests\common.py` or strip
   the username from it.
5. **Rotate the Listaro credentials** (`docs/proxies.md` already asks for this).
6. **Pass a filtered environment to Firefox** (`outOfBrowserRequests.md`).

## How to re-test

1. Run `log accounts` and `log proxy check --account <name> --json`. **Pass:**
   the output doesn't contain the account prefix. Compare without printing it,
   e.g. in a script that reads `2CAPTCHA_PROXY_PASSWORD` and checks
   `!output.includes(password)`.
2. Unit test: `maskProxyUrl('http://<prefix>-zone-x:<prefix>@host:1')` doesn't
   contain `<prefix>`.
3. ```bash
   cd C:/Users/0/.buzz/REPOS/log-cli && git grep -n "zone-custom"
   ```
   **Pass:** only templates and tests with fake prefixes.

## Status

Leaking (local exposure) at `f033e63`. **Fixed at `a9f7584`.** *unitTested*
(`maskProxyUrl`, `src/marketplace/socialAccount/socialAccount.test.ts`)

- The username's account part is masked everywhere: `log accounts`, `log account
  show`, `log proxy check`, `assign` and `balance`, in text and JSON output.
- The Python side scrubs the password and the prefix from errors.
- By design the full proxy URL, password included, is still stored in Twenty
  `socialAccounts.proxy`, because the gate needs it.
- The password still equals the username prefix at 2Captcha. Changing it is
  dashboard-only (see Mitigation).
