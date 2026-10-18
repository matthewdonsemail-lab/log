# Proxies: how they load into Camoufox

AGENTS.md rule 12 (matt, 2026-10-18): no browser opens for an account unless
its proxy is attached and its exit IP is in the account's country. Signing in
is the only exception. A listing must be in the account's country too.

## Where a proxy lives

One file per account, `~/.logCli/proxies/<accountId>.json` (`LOG_PROXY_DIR`
moves them), outside the repo like the session files:

```json
{ "server": "http://host:port", "username": "...", "password": "...", "country": "IE" }
```

- `server` is `http://`, `https://` or `socks5://` plus `host:port`. Credentials go in
  `username` / `password`, never in the URL.
- `country` (ISO 3166-1 alpha-2) is where the account must appear to be.
- `log proxy set --account <id> --file <proxy.json>` validates and saves it.
  `log proxy show` prints it with the password masked. `log proxy check` resolves
  the exit IP and its country without opening a browser.

## How one launch goes

```text
log scan / status / watch / publish / connect
  │  TS: readProxy(accountId)  ── missing ──▶ noProxy, exit 1, no Python started
  │      (publish) listing "City, Country" ≠ proxy country ──▶ listingCountryMismatch
  ▼
Python gets the file PATH (proxy_path / proxyPath), never the credentials
  │  proxyGate.arm(path, allow_no_proxy = action is "login")
  ▼
every Camoufox launch → visibleBrowser.launch_kwargs() → proxyGate.apply()
  1. read the file          none ──▶ noProxy (sign-in: allowed, warns which country FB will see)
                            bad  ──▶ proxyMalformed
  2. exit IP through proxy  Camoufox public_ip(proxy)   down ──▶ proxyUnreachable, 407 ──▶ proxyAuthFailed
  3. exit country           Camoufox GeoIP database      ≠ file country ──▶ proxyCountryMismatch
  4. launch                 proxy=…, geoip=<exit IP>, headless=False, humanize=1.5, showcursor
```

`geoip=<exit IP>` makes Camoufox set timezone, locale, geolocation and the
WebRTC IP from the proxy's exit, so nothing in the browser points at this
machine. `publishSession.py` calls `launch_kwargs()` itself. `logWorker.py`
launches through facebook-camofox-client, whose `CamofoxSessionManager.acquire`
calls `AsyncCamoufox(humanize=1.5, geoip=True, proxy=proxy_config)` with
`proxy_config=None`. `force_visible()` wraps Camoufox's launchers first, so the
gate's proxy and geoip replace whatever that call passes.

Every refusal is an `account` code in the error catalog (`log errors --layer
account`). A publish ends `blocked`, and the monitor stops at `blocked`.

## Why: what was there before

- **log-cli** had no proxy at all. Every Camoufox launched direct from this machine.
  This machine's IP geolocates to **VN** (Asia/Ho_Chi_Minh, checked with Camoufox's
  own `public_ip()` + GeoIP on 2026-10-18), so the Galway accounts would have shown
  up in Vietnam.
- **facebook-camofox-client** takes `proxy_config` on `acquire()`
  (`domain_camofox/session_manager.py:95-113`) and passes it to Camoufox with
  `geoip=True`. Nothing checks the country, and the default is no proxy.
- **Listaro** (production) kept one proxy blob per account in
  `fb_accounts.proxy_config` (`supabase/migrations/001_initial_schema.sql:136`).
  - The blob had no country field.
  - When an account had no proxy, almost every path went direct (e.g.
    `accounts/[id]/login/route.ts:138`, `adspower-client.ts:125` `no_proxy`).
  - There were no exit-IP or country checks anywhere. `docs/ARCHITECTURE.md:576-579`
    claims location matching, but the code doesn't do it.
  - Its proxy failures only failed the post, and the account was left unchanged
    (`process-posts/route.ts:1007`).
  - `scripts/assign-proxies.ts` has proxy credentials and a Supabase service key
    hard-coded, and `agent/src/setup.ts:94` logs the full proxy string with its
    password. Rotate both.

## Checked

- `log proxy check` through a local CONNECT proxy:
  - no file gives `noProxy`
  - file says IE, exit is VN, gives `proxyCountryMismatch`
  - file says VN, exit is VN, passes
  - a dead port gives `proxyUnreachable`
- `log publish` against `python/fixtures/createItem.html`:
  - IE file with a VN exit stops at `blocked · proxyCountryMismatch` before any window opens
  - VN file runs the full dry run through the proxy
  - a listing in "Galway, Ireland" on a VN account is refused with `listingCountryMismatch`
