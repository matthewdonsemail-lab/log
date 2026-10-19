# Geolocation API: impossible precision, a city centre, and no prompt

**Id:** `geolocationApi` · **Severity:** medium · **Status:** fixed at `2de5ff5` (verifiedLive, proxied)

## Summary

The browser never uses Windows Location Services, so the real position in
Vietnam is safe. But what it returns instead is clearly fake:

- the exact centre of a city from Camoufox's GeoIP database, which may not be
  the account's town;
- an accuracy of about 6.6e-11 metres, which no receiver can report;
- an answer while the permission state still says `prompt`.

A page that asks for the position learns the browser is spoofed (R2 §10,
R3 T7).

## What leaks and to whom

- **To Facebook or any page that calls `getCurrentPosition`:** latitude,
  longitude and accuracy, plus the permission state from
  `navigator.permissions.query`.
- **Could leak, but doesn't:** the real position. Firefox can send the IP and
  nearby Wi-Fi to Google's location service when permission is given (S11).
  Windows can use GPS, Wi-Fi, cell data and IP (S26). Location Services are
  allowed on this PC (R3 ground truth). *vendorDocs*

## Evidence

- **The real location isn't used.** `camoufox.cfg:560`
  `geo.provider.testing=true` and `:748` `geo.wifi.scan=false`. Camoufox's
  config answers first (R2 §10). *verifiedSource*
- **Live, through the Galway proxy (R3 T7), permission granted on the
  context:** *verifiedLive (proxied)*
  - `{"lat": 53.3472, "lon": -6.2439, "acc": 6.645e-11}`: Dublin centre,
    session k7m2q9x4a. ip-api and browserleaks put that IP in Ennis, about
    200 km away.
  - `{"lat": 53.2702, "lon": -9.0503, "acc": 6.657e-11}`: Galway, run fccC.
  - The values come from Camoufox's `geolocation:*` config, set from the exit
    IP through its MaxMind database.
- **Local probe (R2 §10, `geoprobe.py`):** *verifiedLive (local probe)*
  - The GeoLite2 point for the Irish test IP: Dublin
    `53.36410140991211, -6.292300224304199`, with float32 noise digits.
  - `coords.accuracy` 6.6e-10 m.
  - The position came back while `navigator.permissions.query({name:'geolocation'})`
    still said `prompt`. A real browser shows a prompt first.
  - A context `geolocation={'latitude':53.2707,'longitude':-9.0568,'accuracy':35}`
    plus `permissions=['geolocation']` returned exactly that, overriding
    Camoufox.
- **Camoufox docs:** setting latitude and longitude auto-accepts location
  prompts, and GeoIP fills them in (S4, S5). *vendorDocs*
- **Upstream:** camoufox#903 (opened 2026-10-18): "No receiver reports that
  precision". camoufox#769 reports the reverse on macOS: the prompt hangs and
  page timers freeze. *upstreamIssue*

### Where the reports disagree

- **Accuracy: 6.6e-10 m (R2) or 6.645e-11 m (R3).** R3 recorded the raw values
  to four figures on two separate runs (6.645e-11 and 6.657e-11). R2's single
  rounded figure is likely a slip of one order of magnitude. Use R3's values.
  Both are physically impossible, so the conclusion is the same.
- **Coordinates differ** (53.3641 in R2, 53.3472 in R3). They came from
  different IPs and database entries. That isn't a conflict.
- **What to do about it.** R1 says to deny location when it isn't needed
  (R1 §4). R2 says to grant it and return the listing town with a realistic
  accuracy. Facebook doesn't need the API to post a listing: the location is
  typed into the form. But Camoufox auto-grants once coordinates are set, so a
  plain "deny" isn't available without dropping Camoufox's geolocation config.
  This study recommends R2's option, because it's the only one tested to give a
  consistent answer. *inference*

## Where in our code it can happen again

- `python/proxyGate.py:131`: `geoip=<exit IP>` sets `geolocation:*`.
- Caller kwargs and `config={'geolocation:*': ...}` pass through `apply()`
  (`gateBypasses.md`).
- `new_context(geolocation=..., permissions=...)` in
  `python/publishSession.py:174` and facebook-camofox-client
  `session_manager.py:130`.
- **Proxy rotation** leaves the coordinates on the old IP's city
  (`proxyRotationAndGeoAccuracy.md`).
- **Launches with no proxy** put the coordinates in Vietnam
  (`standaloneFacebookCamofoxClient.md`).

## Mitigation

1. **Set the context position to the account's home town** (`homeCity`, e.g.
   Galway `53.2707, -9.0568`), with a realistic accuracy of 20 to 1500 m, and
   `permissions=['geolocation']`. Then the state reads `granted` and the value
   is plausible (R2 §10).
2. **Or pin it in the persona:** `geolocation:latitude`, `geolocation:longitude`
   and `geolocation:accuracy` in the stored config
   (`deviceFingerprintChurn.md`).
3. **Keep it the same across runs.** A real laptop at home reports roughly the
   same place each time. *inference*
4. **Never let a Vietnamese position through.** The runtime self-check should
   fail if the position is outside `homeCountry`.

## How to re-test

1. In the proxied browser:
   ```js
   const s = (await navigator.permissions.query({ name: 'geolocation' })).state;
   const p = await new Promise((ok, no) => navigator.geolocation.getCurrentPosition(ok, no, { timeout: 10000 }));
   ({ s, lat: p.coords.latitude, lon: p.coords.longitude, acc: p.coords.accuracy })
   ```
2. **Pass:** the state is `granted`, the position is in the account's town, the
   accuracy is between 20 and 1500, and it's the same next run.
   **Fail:** an accuracy under 1 m, a database city centre for another town, a
   position returned while the state is `prompt`, or anything outside
   `homeCountry`.

## Status

Leaking (a tell only) at `f033e63`. Vietnam's real position was never exposed.
**Fixed at `2de5ff5`.** *verifiedLive (proxied)*

- The page gave `53.272917,-9.055986`, near Galway, with an accuracy of
  433.7 m pinned per account (it was 6.6e-11 m). The permission is granted, so
  `permissions.query` agrees.
- The coordinates come from a city table (`CITY_COORDINATES` in
  `src/marketplace/home/types.ts`) because the Camoufox 0.5.8 GeoIP database
  has no city names. A city that isn't in the table falls back to the exit IP's
  location.
