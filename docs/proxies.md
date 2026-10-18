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
log scan / status / watch / publish / campaign run / connect / proxy check
  │  TS: findAccount (Twenty) → prepareRun (camofox/run)
  │      not FACEBOOK / unusable status / no proxy / no homeCountry ──▶ refused, no Python started
  │      (publish) listing country ≠ homeCountry ──▶ listingCountryMismatch
  │      no locale / timezone for the home (marketplace/home) ──▶ noHomeLocale / noHomeTimezone
  │      outside 08:00-22:00 in the home timezone (or activeHoursStart/End) ──▶ outsideActiveHours
  │      deviceProfile stored but unreadable ──▶ deviceProfileInvalid
  │      (proxy check skips home, hours and device: it opens no browser)
  ▼
camofox/run writes proxy.json, device.json (pinned locale, home timezone, stored
device) and state.json (cookies + localStorage) from Twenty to a private temp
folder; Python gets the file PATHS, never credentials on argv; deleted after
  │  proxyGate.arm(proxyPath, devicePath)     (same for every action, sign-in included)
  ▼
every Camoufox launch → visibleBrowser.launch_kwargs() → proxyGate.apply()
  0. caller options         anything but headless/humanize/geoip/proxy ──▶ unguardedLaunch
  1. read the proxy file    none ──▶ noProxy, bad ──▶ proxyMalformed
  2. exit IP through proxy  Camoufox public_ip(proxy)   down ──▶ proxyUnreachable, 407 ──▶ proxyAuthFailed
  3. exit country, timezone Camoufox GeoIP database      ≠ homeCountry / none ──▶ proxyCountryMismatch
  4. the device             device.json; first launch: make it (saved to Twenty after the run)
  5. launch                 Camoufox(from_options=<stored device + this launch>):
                            exit timezone, webrtc:ipv4 = exit IP, pinned locale, pinned geolocation,
                            headless=False, humanize=1.5, showcursor, env = system vars only
guards on Playwright (installed by arm(), cover sync + async and every Camoufox route)
  BrowserType.launch / launch_persistent_context   not what apply() built ──▶ unguardedLaunch
  every context (new_context, new_page, persistent) timezoneId, geolocation + permission;
                                                    caller locale / proxy / userAgent dropped
  6. self-check, before the caller gets the context (so before Facebook):
     an IP echo through the browser + page and dedicated worker:
     timezone ≠ exit IP's ──▶ browserTimezoneMismatch
     navigator.language(s) / Intl locale ≠ pinned ──▶ browserLocaleMismatch
     browser exit IP ≠ gate's ──▶ browserExitIpMismatch    can't run ──▶ selfCheckFailed
     any refusal closes the browser first
during publish: review and right before the Publish click, the exit IP is read
through the browser again: another country ──▶ proxyCountryChanged (nothing clicked);
a new IP in the country is recorded on the account (proxyExitIp)
after the run: the session the browser left (only while it holds a Facebook login)
and a newly made device are saved to Twenty
```

### One device per account (rule 15)

Camoufox draws a new random device on every launch: OS, screen, GPU, fonts,
voices, canvas/audio/font-spacing seeds (measured live: Mac, Windows, 2 to 12
cores, 960x540 to 5120x1440 screens across five launches of one account). With
the same Facebook cookies that looks like stolen cookies. Now the account's
first launch runs Camoufox's own `launch_options(os="windows", env={})` once,
keeps only Camoufox's config (the `CAMOU_CONFIG_*` payload) and the Firefox
prefs, and stores them in `socialAccounts.deviceProfile`. The environment that
`launch_options()` normally copies (every secret in the process) is never
kept, and the browser only ever gets the system variables Firefox needs
(`SAFE_ENV` in `python/deviceProfile.py`) plus `CAMOU_CONFIG_*`.

- Windows always: this PC's real GPU and font stack draw it, so a Mac or Linux
  claim couldn't match the pixels.
- The screen is no bigger than this PC's monitor (Camoufox skips that bound for
  headed launches).
- Per-launch values are never stored: timezone, WebRTC IP, locale, humanize,
  cursor, addon paths. After a browser upgrade the user agent's Firefox version
  follows the installed browser, like a real Firefox update.
- Geolocation: the home city's coordinates from Camoufox's GeoLite2 City
  database (scanned once, ~20 s), moved 150 m to 1.8 km off the centroid, with
  an accuracy pinned per account between 20 and 1500 m (was 6.6e-11 m), and the
  permission granted so `permissions.query` agrees.

### Locale per country (rule 16)

`HOME_COUNTRIES` in `src/marketplace/home/types.ts` is the one table: IE
`en-IE`, GB `en-GB`, US `en-US`, CA `en-CA`, AU `en-AU`, NZ `en-NZ`, with
the Facebook UI locale for the create form (`?locale=en_GB` for IE, no longer
`en_US`). Before this, geoip picked the language at random from the country's
mix (IE: 28% `ga-IE` or `fr-IE`). The locale is set at launch as
`locale:language`, `locale:region` and `locale:all`, with no `locale:script`:
with it, Intl resolved plain `en` and formatted dates US-style; without it the
page, a dedicated worker and a shared worker all resolve `en-IE`
(`1/7/2026, 13:00:00`), and Accept-Language is `en-IE,en;q=0.9`. The context
locale is never set: Playwright's would change `navigator.languages` in the
page only.

### Local hours (rule 18)

`outsideActiveHours` (`src/marketplace/home/helpers/activeHours.ts`) reads the
wall clock in the home timezone through Intl, so it is DST-correct. Countries
with several zones need the city in `CITY_TIMEZONES`. `log watch` checks
before every scan, not only at the start. The daily listing cap counts the
account's local date.

### 2Captcha and photos

- A 2Captcha fallback (CaptchaKraken stays first) gets the account's own proxy
  (same sticky session, so the same exit), the browser's real user agent and,
  for reCAPTCHA v2, Google's own cookies. Never Facebook's: they are the
  account's session. Without a proxy it refuses (`captchaNoProxy`) instead of
  solving from 2Captcha's IP.
- Photo URLs are downloaded only through the account's HTTP proxy (Bun fetch
  `proxy`), or refused (`photoNeedsProxy`). Uploaded files are `photoN.jpg`
  with no metadata.

Every refusal is a code in the error catalog (`log errors --layer account`). A
publish ends `blocked`, and the monitor stops at `blocked`.

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
   asks for the same sticky session, and no two accounts share one. 2Captcha keeps one IP for **120 minutes at
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
