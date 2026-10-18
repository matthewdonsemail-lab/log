# Proxies: how they load into Camoufox

AGENTS.md rule 12 (matt, 2026-10-18): no browser opens for an account unless
its proxy is attached and its exit IP is in the account's country. There is no
exception, not for dry runs and not for signing in. A listing must be in the
account's country too, and so must the Location picked on the form.

## Where a proxy lives

On the account in Twenty: `socialAccounts.proxy`, as
`scheme://user:pass@host:port` (`http`, `https` or `socks5`; the vendor style
`host:port:user:pass` is read too). The country it must exit in is
`socialAccounts.homeCountry` (ISO 3166-1 alpha-2, e.g. `IE`). Nothing is kept in
local files.

`log proxy check --account <name>` resolves the exit IP and its country without
opening a browser, and writes the result to `proxyCheckedAt`, `proxyExitIp` and
`proxyExitCountry` on the account.

## How one launch goes

```text
log scan / status / watch / publish / connect / proxy check
  │  TS: findAccount (Twenty) → checkRunnable
  │      not FACEBOOK / unusable status / no proxy / no homeCountry ──▶ refused, no Python started
  │      (publish) listing country ≠ homeCountry ──▶ listingCountryMismatch
  ▼
camofox/run writes the proxy (and cookies) from Twenty to a private temp folder;
Python gets the file PATHS, never credentials on argv; the folder is deleted after
  │  proxyGate.arm(path)            (same for every action, sign-in included)
  ▼
every Camoufox launch → visibleBrowser.launch_kwargs() → proxyGate.apply()
  1. read the file          none ──▶ noProxy, bad ──▶ proxyMalformed
  2. exit IP through proxy  Camoufox public_ip(proxy)   down ──▶ proxyUnreachable, 407 ──▶ proxyAuthFailed
  3. exit country           Camoufox GeoIP database      ≠ homeCountry ──▶ proxyCountryMismatch
  4. launch                 proxy=…, geoip=<exit IP>, headless=False, humanize=1.5, showcursor
  5. every context          timezoneId=<exit IP's timezone>   none known ──▶ proxyCountryMismatch
```

`geoip=<exit IP>` makes Camoufox set locale, geolocation and the WebRTC IP
from the proxy's exit. Its timezone doesn't take on Windows: a live run through
a 2Captcha Galway proxy (2026-10-18) showed Irish IP and `en-IE` but this PC's
`Asia/Bangkok` clock. So `force_timezone()` patches Playwright's
`Browser.new_context` (which `new_page` and both APIs go through) to set
`timezoneId` from the exit IP. The same run then showed `Europe/Dublin` on the
page and in a web worker. Nothing in the browser points at this machine. `publishSession.py` calls `launch_kwargs()` itself. `logWorker.py`
launches through facebook-camofox-client, whose `CamofoxSessionManager.acquire`
calls `AsyncCamoufox(humanize=1.5, geoip=True, proxy=proxy_config)` with
`proxy_config=None`. `force_visible()` wraps Camoufox's launchers first, so the
gate's proxy and geoip replace whatever that call passes.

Every refusal is an `account` code in the error catalog (`log errors --layer
account`). A publish ends `blocked`, and the monitor stops at `blocked`.

## Getting a proxy from 2Captcha

`log proxy assign --account <name>` (or `--missing` for every FACEBOOK account
without one) gives an account a 2Captcha residential proxy in its home country:

1. `GET https://api.2captcha.com/proxy?key=…` gives the proxy username. The password
   is the sub-account password from the 2Captcha dashboard, in
   `2CAPTCHA_PROXY_PASSWORD`; it is not in the API.
2. The account's `homeCity` is looked up in 2Captcha's places
   (`https://2captcha.com/api/v1/proxy/regions/search/<city>`), kept only if it is
   in `homeCountry` (Galway → connacht, IE). `--city` picks another city,
   `--anyCity` the whole country. The public API's country list stops at its first
   page (no Ireland), so the search is what's used.
3. The URL follows 2Captcha's dashboard format:
   `http://<username>-zone-custom-region-ie-st-connacht-city-galway-session-<id>-sessTime-120:<password>@eu.proxy.2captcha.com:2334`
   (SOCKS5 with `--socks5`, port 2333). The gateway is the nearest one: `eu`, `na` or `ap`.
4. `<id>` is fixed per account (from its Twenty id), so every run of that account
   asks for the same sticky session. 2Captcha keeps one IP for **120 minutes at
   most**: the exit stays in the same city or country but changes every couple of
   hours. There is no static IP.
5. The proxy goes through `proxy.check` **before** it is saved. It reaches Twenty
   only if it really exits in `homeCountry`, and the check result is saved with it.

`log proxy balance` shows the traffic left (2Captcha bills traffic, in and out,
from $3.99/GB down to $1.25/GB) and whether the proxy password is set.

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

- `log proxy check` through a local CONNECT proxy (exit 116.105.162.81, VN):
  - no proxy → `noProxy`
  - homeCountry IE, exit VN → `proxyCountryMismatch`
  - homeCountry VN → passes and the result is written to Twenty
  - dead port → `proxyUnreachable`
- Against the live Twenty with throwaway test accounts (deleted afterwards):
  - a listing on an account with no proxy is refused before anything opens
  - a VN-proxied account's dry run ran end to end against the local copy of the form
  - the form's Location picked "Hanoi, Vietnam" over "Hanoi, United Kingdom"
  - a banned account's `scan` is refused with `accountNotUsable`
