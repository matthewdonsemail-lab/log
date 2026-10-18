# Requests made outside the browser

**Id:** `outOfBrowserRequests` · **Severity:** low · **Status:** not leaking to Facebook. The environment passthrough and unverified TLS are open.

## Summary

The proxy only covers the browser. log-cli and its libraries also make network
calls from Python and Bun, straight from this PC's Vietnamese IP. The audit
listed every one. None reaches Facebook, except a photo download when its
source is a Facebook CDN URL (`photosAndUploads.md`) and the 2Captcha path
(`captchaSolving.md`). No code anywhere calls Facebook's GraphQL or refreshes
cookies outside the browser (R4). Two hygiene issues remain. The whole process
environment, secrets included, is handed to Firefox. And the exit-IP check
doesn't verify TLS.

## What leaks and to whom

| Caller | Destination | Through the proxy? | Can Facebook see it? | Verdict |
|---|---|---|---|---|
| `proxyGate.exit_location` → camoufox `public_ip` | ipify, amazonaws, ipinfo… | yes | no | OK, but TLS isn't verified |
| `publishSession.solve_twocaptcha` → 2captcha-python | 2captcha.com, then workers load Google/Arkose | **no** | **yes, through the token verdict** | `captchaSolving.md` |
| `publishSession.solve_kraken` → captchakraken | api.captchakraken.com (screenshots) | no | no (the solve runs in the proxied page) | OK |
| `src/media/photo/client.ts:42` | photo URLs | no | only if fbcdn | `photosAndUploads.md` |
| `src/proxyVendor/twoCaptcha/client.ts` | api.2captcha.com, 2captcha.com places | no | no | OK |
| `src/twenty/graphql` | Twenty | no | no | OK |
| `src/auth/session/client.ts` | blaster.listeningkit.com | no | no | OK |
| facebook-camofox-client `webhooks.dispatch` | `MARKETPLACE_WEBHOOK_URL` | no | no | not configured |
| camoufox GeoLite2 mmdb, addon and GitHub downloads | jsdelivr, GitHub, addons.mozilla.org | no | no | OK |
| **Facebook GraphQL, fb_dtsg or cookie refresh through requests/httpx/fetch** | — | — | — | **none exist** in log-cli, facebook-camofox-client, Listaro, the hackathon or open-typesafe-camoufox |

Source: R4, "Network calls made outside the browser". *verifiedSource*

## Evidence

- **Unverified TLS on the exit check.** `camoufox/ip.py:88-112`: `public_ip()`
  is called through the proxy, with `verify=False` (`:112`). A hostile proxy
  could lie about its exit IP. The gate trusts that answer for the country
  check (R4 L5). *verifiedSource*
- **The environment goes to Firefox.** `camoufox/utils.py:606`
  `env = cast(..., environ)`, and `:833-836`
  `env_vars = {**get_env_vars(config, target_os), **env}`. `TWENTY_API_KEY`,
  `2CAPTCHA_*` and `CAPTCHA_KRAKEN_API_KEY` (loaded by Bun from `.env.local`,
  inherited by Python) end up in the browser process's environment. Web pages
  can't read them. But a stray `CAMOU_CONFIG_*` in the environment would quietly
  override the geo config (R4 L7). Storing `launch_options()` output as a persona
  would store these secrets too: R2 found 218 variables in one file, including
  `AFFILIATE_PROXY_SHARED_SECRET` (`deviceFingerprintChurn.md`). *verifiedSource*,
  *verifiedLive (local probe)*
- **CaptchaKraken uploads from Vietnam.** captchakraken `planner.py:346-350`
  POSTs base64 element screenshots to `VLLM_BASE_URL/chat/completions`, and
  `report_outcome` posts to `/solve-outcome`. Kraken sees our IP. Facebook
  doesn't (R4 L6). *verifiedSource*
- **Side channels in facebook-camofox-client** (R4 L8, L9):
  - `status.py` calls `webhooks.dispatch(...)`, a direct httpx POST, if
    `MARKETPLACE_WEBHOOK_URL` is set.
  - `session_manager.py:126` falls back to `CAMOFOX_STORAGE_STATE_<ID>`.

  Neither variable is set in `.env.local` or the user environment. No `CAMOU*`,
  `CAMOFOX*`, `HTTP(S)_PROXY` or `TZ` is set either (R4). *verifiedSource*
- **The bundled uBlock Origin** fetches filter lists through the proxy on every
  launch (R2 §16). That's browser traffic, so it's proxied
  (`camoufoxDetectability.md`). *verifiedLive (local probe)*

## Where in our code it can happen again

- Any new `fetch`, `requests`, `httpx` or `urllib` call in `src/`, `python/` or
  `scripts/`, especially to a Facebook domain (`facebook.com`, `fbcdn.net`,
  `fbsbx.com`, `messenger.com`, `instagram.com`).
- New environment variables in `.env.local` named `CAMOU_*`, `CAMOFOX_*`,
  `*_WEBHOOK_URL`, `TZ` or `HTTP(S)_PROXY`.
- Any new solver or vendor SDK.

## Mitigation

1. **Rule: no request to a Facebook domain outside the browser.** Ever.
2. **Pass a clean environment to Firefox.** In `apply()`, pass
   `env={k: v for k, v in os.environ.items() if k in SAFE_ENV}`, never any
   `CAMOU_*` (R4 L7).
3. **Strip library variables.** Remove `CAMOFOX_*` and `*_WEBHOOK_URL` from
   `os.environ` before facebook-camofox-client runs (R4 L8, L9).
4. **Confirm the exit IP over verified TLS** from inside the browser (the
   `leakProbe` in `gateBypasses.md`). The browser verifies certificates, unlike
   `public_ip()` (R4 L5).

## How to re-test

1. Static scan:
   ```bash
   cd C:/Users/0/.buzz/REPOS/log-cli
   grep -rnE "fetch\(|requests\.|httpx\.|urlopen" src python scripts | grep -v test
   grep -rnE "facebook\.com|fbcdn|fbsbx" src python scripts | grep -v test
   ```
   **Pass:** no Python or Bun request to a Facebook domain.
2. Environment: during a run, inspect the `camoufox.exe` process environment
   (Process Explorer, Environment tab). **Pass:** no `TWENTY_`, `2CAPTCHA_` or
   `CAPTCHA_KRAKEN_` variables.
3. `Get-ChildItem Env: | Where-Object Name -match 'CAMOU|CAMOFOX|WEBHOOK|^TZ$|_PROXY'`.
   **Pass:** none.

## Status

Not leaking to Facebook at `f033e63`. The environment passthrough and the
unverified exit check are open (low).
