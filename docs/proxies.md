# Proxies

A proxy makes an account's traffic leave the internet from the account's home
country instead of from wherever log is running. On Facebook, no browser opens
for an account unless its proxy is attached and its exit IP is in the
account's country: no exceptions, not for dry runs and not for signing in. A
listing must be in the account's country too, and so must the Location picked
on the form. Read this to understand how a proxy is stored, checked and loaded
into the browser.

The providers a proxy can come from (2Captcha, Byteful), and how log works the
same with any of them, are in [Proxy providers](proxyVendors/README.md).

## Where a proxy lives

- On the account, in its `proxy` field, as `scheme://user:pass@host:port`
  (`http`, `https` or `socks5`; the vendor style `host:port:user:pass` is read
  too).
- The country it must exit in is the account's `homeCountry` (ISO 3166-1
  alpha-2, for example `IE`).
- Nothing else is kept in local files.

`log proxy check --account <name>` finds the exit IP and its country without
opening a browser, and writes the result to `proxyCheckedAt`, `proxyExitIp`
and `proxyExitCountry` on the account.

## How one launch goes

The diagram below follows a Camoufox launch. AdsPower runs the same checks
through `gate_attached` and `check_attached` (see [Browsers](browsers.md)).

In short:

1. **Before any browser starts**, log refuses an account that isn't usable,
   has no proxy or home country, is outside its local hours, or whose stored
   device can't be read.
2. **The run's private files** (proxy, device, session) are written to a
   temporary folder. Python gets the file paths, never credentials on the
   command line, and the folder is deleted afterwards.
3. **The gate** reads the proxy, finds its exit IP and country, and refuses
   one in the wrong country.
4. **The launch** uses the account's stored device and the exit's timezone and
   WebRTC IP, in a visible window.
5. **The self-check** compares timezone, language and exit IP in a page and a
   worker before the caller gets the browser, so before Facebook loads.
6. **After the run** the session and any newly made device are saved back.

The full sequence:

```text
log facebook scan / status / watch / publish / campaign run / connect / proxy check
  │  TS: findAccount (Twenty) → prepareRun (browser/run)
  │      not FACEBOOK / unusable status / no proxy / no homeCountry ──▶ refused, no Python started
  │      (publish) listing country ≠ homeCountry ──▶ listingCountryMismatch
  │      no locale / timezone for the home (marketplace/home) ──▶ noHomeLocale / noHomeTimezone
  │      outside 08:00-22:00 in the home timezone (or activeHoursStart/End) ──▶ outsideActiveHours
  │      deviceProfile stored but unreadable ──▶ deviceProfileInvalid
  │      (proxy check skips home, hours and device: it opens no browser)
  ▼
browser/run writes proxy.json, device.json (pinned locale, home timezone, stored
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

### One device per account

Left alone, Camoufox draws a new random device on every launch: OS, screen,
GPU, fonts, voices, and canvas, audio and font-spacing seeds. Measured live
across five launches of one account, it gave Mac and Windows, 2 to 12 cores,
and screens from 960x540 to 5120x1440. With the same cookies, that looks like
stolen cookies.

So the account's first launch runs Camoufox's own
`launch_options(os="windows", env={})` once, keeps only Camoufox's config (the
`CAMOU_CONFIG_*` payload) and the Firefox prefs, and stores them in
`socialAccounts.deviceProfile`. The environment that `launch_options()`
normally copies (every secret in the process) is never kept. The browser only
ever gets the system variables Firefox needs (`SAFE_ENV` in
`python/device/deviceProfile.py`) plus `CAMOU_CONFIG_*`.

- **Always Windows:** the machine's real GPU and font stack draw it, so a Mac
  or Linux claim couldn't match the pixels.
- **Screen size:** no bigger than the machine's monitor (Camoufox skips that
  bound for visible launches, so log applies it).
- **Not stored, set per launch:** timezone, WebRTC IP, locale, humanize,
  cursor, addon paths. After a browser upgrade the user agent's Firefox
  version follows the installed browser, like a real Firefox update.
- **Geolocation:** the home city's centre from `CITY_COORDINATES`
  (`src/marketplace/home/types.ts`, next to the timezones), or the exit IP's
  location when the city isn't there. It is moved 150 m to 1.8 km off the
  centre, with an accuracy pinned per account between 20 and 1500 m, and the
  permission is granted so `permissions.query` agrees. Camoufox 0.5.8's GeoIP
  database (GeoIP AIO) has no city names, so the city can't be looked up
  there.
- **Canvas:** everything above replays exactly, but a canvas read on a real
  site changes from launch to launch. That is Firefox's own baseline
  fingerprinting protection, which re-keys canvas randomisation every session,
  as stock Firefox does. Turning it off
  (`privacy.baselineFingerprintingProtection`) makes the canvas identical
  across launches, but then it is the machine's raw rendering, the same for
  every account on that machine. It is left on for now.

### Locale per country

`HOME_COUNTRIES` in `src/marketplace/home/types.ts` is the one table: IE
`en-IE`, GB `en-GB`, US `en-US`, CA `en-CA`, AU `en-AU`, NZ `en-NZ`. It also
sets the Facebook interface locale for the create form (`?locale=en_GB` for
IE).

- Without it, geoip picked the language at random from the country's mix (for
  IE, 28% of the time `ga-IE` or `fr-IE`).
- The locale is set at launch as `locale:language`, `locale:region` and
  `locale:all`, with no `locale:script`. With `locale:script`, Intl resolved
  plain `en` and formatted dates US-style. Without it, the page, a dedicated
  worker and a shared worker all resolve `en-IE` (`1/7/2026, 13:00:00`), and
  Accept-Language is `en-IE,en;q=0.9`.
- The context locale is never set: Playwright's would change
  `navigator.languages` in the page only.

### Local hours

`outsideActiveHours` (`src/marketplace/home/helpers/activeHours.ts`) reads the
wall clock in the home timezone through Intl, so daylight saving is handled.
Countries with several time zones need the city in `CITY_TIMEZONES`.
`log facebook watch` checks before every scan, not only at the start. The
daily listing cap counts the account's local date.

### Captchas and photos

- A 2Captcha fallback (CaptchaKraken stays first) gets the account's own proxy
  (the same sticky session, so the same exit), the browser's real user agent
  and, for reCAPTCHA v2, Google's own cookies. Never Facebook's: they are the
  account's session. Without a proxy it refuses (`captchaNoProxy`) instead of
  solving from 2Captcha's IP.
- Photo URLs are downloaded only through the account's HTTP proxy (Bun fetch
  `proxy`), or refused (`photoNeedsProxy`). Uploaded files are named
  `photoN.jpg` and carry no metadata.

Every refusal is a code in the error catalog (`log errors --layer account`). A
publish ends `blocked`, and the monitor stops at `blocked`.

## Speed limit per run

A launch is refused with `proxyTooSlow` when the fastest of three timings of a
Facebook file through the proxy is over the limit (default 2500 ms).

- Set the limit for one run with `--proxyMs <ms>` on any command (500-60000),
  for example `log inspect start --account <a> --proxyMs 6000`.
- Over MCP, use `proxyMs` on a flow tool, or `--proxyMs` in a tool's `args`.
- It sets `LOG_PROXY_MAX_MS` for that run only.

## Getting a proxy from 2Captcha

`log proxy assign --account <name>` (or `--missing` for every FACEBOOK account
without one) gives an account a 2Captcha residential proxy in its home
country:

1. **Username.** `GET https://api.2captcha.com/proxy?key=…` gives the proxy
   username. The password is the sub-account password from the 2Captcha
   dashboard, set in `2CAPTCHA_PROXY_PASSWORD`; it is not in the API.
2. **Place.** The account's `homeCity` is looked up in 2Captcha's places
   (`https://2captcha.com/api/v1/proxy/regions/search/<city>`) and kept only if
   it is in `homeCountry` (Galway → connacht, IE).
   - The search matches substrings and spans states (`philadelphia` finds
     `newphiladelphia/ohio` first), so only an exact city name counts
     (`pickPlace`).
   - `--region <state>` pins the state (Lancaster exists in seven).
   - `wilkes-barre` is retried as 2Captcha's `wilkesbarre`.
   - `--city` picks another city, and `--anyCity` the whole country.
   - The public API's country list stops at its first page (no Ireland), so
     the search is used instead.
3. **URL.** It follows 2Captcha's dashboard format:
   `http://<username>-zone-custom-region-ie-st-connacht-city-galway-session-<id>-sessTime-120:<password>@eu.proxy.2captcha.com:2334`
   (SOCKS5 with `--socks5`, port 2333). The gateway is the nearest one: `eu`,
   `na` or `ap`.
4. **Sticky session.** `<id>` is fixed per account and place (from its Twenty
   id, state and city), so every run of that account asks for the same sticky
   session, and no two accounts share one.
   - 2Captcha keeps one IP for **120 minutes at most**: the exit stays in the
     same city or country but changes every couple of hours. There is no
     static IP.
   - 2Captcha keeps a session's IP even when the username's state changes,
     which is why the place is part of the id.
5. **Check before saving.** The proxy goes through `proxy.check` **before** it
   is saved. It is saved only if it really exits in `homeCountry`, and the
   check result is saved with it.
6. **Distance.** It must also exit within `MAX_PROXY_KM` (100 km) of the home
   city in `CITY_COORDINATES`, measured from Camoufox's GeoIP. 2Captcha doesn't
   always honour the state (a Pennsylvania proxy once exited in Dallas). A miss
   is retried on a new session (`sessionFor(..., attempt)`) three times, then
   it fails with `proxyTooFar` and nothing is saved.

`log proxy balance` shows the traffic left (2Captcha bills traffic, in and
out, from $3.99/GB down to $1.25/GB) and whether the proxy password is set.

## Why the gate exists

Before the gate, nothing checked where a browser's traffic came out:

- log itself launched every browser straight from the machine it ran on, so
  accounts showed up in that machine's country, not their own.
- facebook-camofox-client takes a `proxy_config` on `acquire()` and passes it
  to Camoufox with `geoip=True`, but nothing checks the country, and the
  default is no proxy.
- An earlier production setup kept one proxy per account with no country
  field, went direct when an account had no proxy, and never checked the exit
  IP or country. A proxy failure only failed the post and left the account
  unchanged.

## What was checked live

Identity pinning was checked live on 2026-10-18 through the real gate, with a
throwaway test account (home Galway, IE) and a 2Captcha session. Facebook was
never loaded; it used about 9 MB of proxy traffic.

- **Camoufox 0.5.8 with browser 156.0.1-beta.39** (and before that 0.5.5 with
  152.0.4-beta.30):
  - `log facebook publish` dry runs against `python/fixtures/createItem.html`
    made the device on the first launch, saved it to Twenty, and reused it
    after that. A device made on 0.5.5 also replayed on 156, with its user
    agent moved to Firefox 156.
  - Three launches (two on the publish session, one on the
    facebook-camofox-client path) gave the same user agent (Windows, Firefox
    156), screen 1920x1080, WebGL, audio hash, font metrics and geolocation
    (permission granted).
  - The page, a dedicated worker and a shared worker all showed en-IE,
    `["en-IE","en"]`, Intl en-IE (`1/7/2026, 13:00:00`) and Europe/Dublin.
    Accept-Language was `en-IE,en;q=0.9`, and `Intl.DisplayNames` gave France.
  - WebRTC gave only mDNS host candidates plus a srflx of the exit IP.
  - Canvas differed per launch (Firefox's baseline protection, see above).
- **Fault injection:** a forced Asia/Bangkok context was refused with
  `browserTimezoneMismatch`, and a wrong pinned locale with
  `browserLocaleMismatch`. Both closed the browser before anything loaded.
- **Bypass attempts** were all refused with `unguardedLaunch`: importing
  `Camoufox` directly with `geoip=False`, a caller `locale`, and
  `persistent_context`.
- **Hours:** with a narrow window, `log facebook scan`, `log facebook publish`
  and `log facebook connect` were refused with `outsideActiveHours`, showing
  the local time and when the window opens.
- **Photos:** photo URL downloads left through the proxy's exit IP, and were
  refused without a proxy (`photoNeedsProxy`).
- **Not checked live:** an exit-IP change during a run (unit-tested), a
  2Captcha solve (no captcha came up), and `log facebook watch` over many
  hours.

Earlier checks of the proxy gate (2026-10-18):

- `log proxy check` through a local CONNECT proxy exiting in Vietnam:
  - no proxy → `noProxy`
  - homeCountry IE, exit VN → `proxyCountryMismatch`
  - homeCountry VN → passes, and the result is written to Twenty
  - a dead port → `proxyUnreachable`
- Against a live Twenty with throwaway test accounts (deleted afterwards):
  - a listing on an account with no proxy is refused before anything opens;
  - a VN-proxied account's dry run ran end to end against the local copy of
    the form;
  - the form's Location picked "Hanoi, Vietnam" over "Hanoi, United Kingdom";
  - a banned account's `scan` is refused with `accountNotUsable`.

The rules behind this are in AGENTS.md.
