# Proxy rotation and geo accuracy: the exit moves, the city is a guess

**Id:** `proxyRotationAndGeoAccuracy` · **Severity:** medium (IE, GB) / high (US, CA, AU with country-level targeting) · **Status:** mitigated at `2de5ff5`. The exit IP is re-checked before Publish (verifiedLive); a mid-run rotation is unitTested only

## Summary

Three separate problems:

1. **Rotation.** 2Captcha keeps a sticky exit IP for at most 120 minutes, then
   switches without warning. log-cli checks the exit IP once, at launch, and
   bakes it into WebRTC, geolocation and the timezone. A run that crosses the
   switch sends HTTP from the new IP while the browser still reports the old
   one.
2. **City.** "Galway" is a label. IP databases disagree on the city. One live
   session was placed in Ennis, Dublin or Kells depending on the database. The
   gate checks the country only.
3. **Reputation.** Residential proxy IPs are catalogued commercially and may be
   shared with other users.

None of these exposes Vietnam. Each can make the account's network story
inconsistent (R2 §11, §13; R3 T1, T11; R4 M3).

## What leaks and to whom

- **To Facebook:** the HTTP exit IP on every request. Also, from page APIs, the
  WebRTC `srflx` IP, the geolocation and the timezone fixed at launch. After a
  rotation these disagree. A mismatch between the WebRTC IP and the HTTP IP is
  the classic BrowserScan/Pixelscan proxy check (R2 §11). *inference*
- **To IP databases** (MaxMind, ipinfo, ip-api, IP2Location): the exit IP. They
  classify it (residential, proxy, hosting) and place it, each differently.
- **Facebook's own placement** of the IP is not public. Facebook says its login
  locations are approximate and can be wrong (S35). *vendorDocs*

## Evidence

**Rotation**

- 2Captcha: IP duration "from 0 … to 120 minutes", "there is no way to keep the
  session for longer than 120 minutes", and "When the IP address duration is
  over, the new IP address is instantly assigned" (S45). *vendorDocs*
- `src/proxyVendor/twoCaptcha/helpers/buildProxyUrl.ts:38-44` builds
  `session-<id>-sessTime-<minutes>`. `docs/proxies.md` step 4 says it is at
  most 120. *verifiedSource*
- `python/browser/proxyGate.py:128` checks the exit once per launch. `:131` pins
  `geoip` to it. `camoufox/utils.py:746-748` copies it into `webrtc:ipv4`.
  *verifiedSource*
- `camoufox/ip.py:88` puts `@lru_cache(maxsize=None)` on `public_ip`, so a
  long-lived process never notices a rotation. *verifiedSource*
- Publishing can run long: the reCAPTCHA timeout is 600 s
  (`python/session/publishSession.py:469`), plus captcha rounds. *verifiedSource*
- **Live (R3 T11):** session `k7m2q9x4a` gave 109.78.211.66 on every launch
  from 16:41 to about 16:51, at the start and end of each launch. A new session
  id gave a different IP and ISP (86.43.185.91, Eircom). The 120-minute expiry
  was not tested. *verifiedLive (proxied)*

**City disagreement** (R3 T1) *verifiedLive (proxied)*

| Source | Session k7m2q9x4a, exit 109.78.211.66 |
|---|---|
| ip-api | Munster, **Ennis**, Europe/Dublin, Vodafone Ireland, proxy false, hosting false |
| ipinfo | Leinster, **Dublin**, AS15502 Vodafone Ireland |
| ip2location.io | Meath, **Kells**, is_proxy false |
| ipwho.is | Leinster, **Dublin** |
| browserleaks | Ireland, **Ennis** |
| Camoufox GeoLite2 (geolocation API) | **Dublin** centre (`geolocationApi.md`) |

Session q3v8n1z6b (86.43.185.91): **Galway**, Eircom, proxy and hosting false.
All sources agree on Ireland and a residential ISP.

- `python/browser/proxyGate.py:115-117` compares only the country. *verifiedSource*
- MaxMind: IP geolocation is never precise enough for a household. US city
  accuracy is 66% within 50 km, with a typical radius around 100 km (S46).
  *vendorDocs*
- A 2026 study found median errors in the tens of km (S48). *vendorDocs (paper)*
- camoufox#676: a "Thailand" proxy that Google placed in Lithuania. That was
  bad proxy geodata, not a Camoufox leak. *upstreamIssue*

**Reputation**

- MaxMind sells a residential-proxy database with provider names, observation
  times and confidence (S47). That shows such data exists. It doesn't show Meta
  uses it (R1 §6). *vendorDocs*
- Meta's DEC system uses IP "country, reputation" and accounts registered from
  the IP (S38, Table 1). *vendorDocs (paper)*
- 2Captcha's IPs come from "ethically sourced residential devices". It doesn't
  say whether they are shared with other customers (S45, R2 §13). *vendorDocs*
- camoufox#309: residential proxies plus geoip and humanize did not prevent a
  DataDome block on G2. The cause wasn't isolated. *upstreamIssue*

### Where the reports disagree

- **What to do with the city.** R2 suggests setting the Marketplace location to
  wherever the IP resolves. R1 warns that a chosen listing location must not be
  confused with the seller's residence or eligibility (R1 §8, S37). log-cli's
  rule 12 settles the country: the listing must be in `homeCountry`. For the
  city, this study takes a middle line. Keep the listing in the account's
  `homeCity`, and warn or reject when the exit city is far from it. That keeps
  the account's story fixed and treats the IP's city as the noisy part.
- **Severity.** R2 rates rotation medium for IE and high for US, CA and AU. R4
  rates it medium. The difference is the multi-zone case, which only R2
  analyses: in the US, CA and AU, a country-level exit (`--anyCity`) can move
  across timezones while the browser keeps the first zone. R2's split is used
  here. *inference*

## Where in our code it can happen again

- `python/browser/proxyGate.py:109-131` (`check`, `apply`): one check, country only.
- `src/proxyVendor/twoCaptcha/helpers/buildProxyUrl.ts`: `sessTime`, session
  id and city targeting. `log proxy assign --anyCity` targets the whole country.
- `src/cli/proxy/index.ts` and `marketplace/socialAccount` `recordProxyCheck`:
  what gets saved to Twenty.
- Any long-running Python process (`camoufox.ip.public_ip` is cached).
- `python/session/publishSession.py` before `step_publish`: the irreversible step.

## Mitigation

1. **Re-check the exit right before Publish.** In `publishSession.py`, read the
   exit IP **through the page** (fetch an IP echo with `page.evaluate`) before
   `step_publish` and after each captcha round. Fail closed with a new code
   `proxyRotated` if it isn't the gate's IP (R4 M3).
2. **Start runs only with time left.** We can't read the remaining sticky time
   from 2Captcha. Record the first time each session id was seen with each IP,
   and don't start a publish in the last 20 minutes of an assumed 120-minute
   window. *inference*
3. **Record the city.** `proxyGate.check()` also returns the database city. Save
   `proxyExitCity` on every run, and warn when it is not `homeCity` or a
   configured neighbour.
4. **Check a second database** at `log proxy check` (ipinfo, or ip-api). Reject
   exits where the sources disagree on the city by more than a set distance.
5. **Always city-target multi-zone countries** (US, CA, AU). Never use
   `--anyCity` there.
6. **Keep an exit-IP history** per account in Twenty.
7. **Keep one session id per account** (already done,
   `buildProxyUrl.ts`, `docs/proxies.md` step 4). A new id means a new IP and
   ISP (R3 T11).

## How to re-test

1. `log proxy check --account <name>` twice, more than 120 minutes apart. Record
   whether the IP changed.
2. During a run, fetch `https://api.ipify.org` in the page at the start, and
   again just before Publish. **Pass:** they're the same, or the run stopped with
   `proxyRotated`.
3. City: run the exit IP through ip-api, ipinfo, ip2location and Camoufox's
   GeoLite2. Compare with `homeCity`.
4. WebRTC versus HTTP: the `srflx` IP (`webrtc.md`) equals the IP the page sees
   at Publish time.

## Status

Leaking (latent) at `f033e63`. **Mitigated at `2de5ff5`.**

- The exit IP is re-checked before Publish and the run stops with
  `proxyCountryChanged` if the country moved. It passed in the live dry runs.
  *verifiedLive (proxied)*
- A rotation in the middle of a run is covered by unit tests only
  (`src/cli/publish/publish.test.ts`). *unitTested*
- Each account has its own sticky session id, a hash of its Twenty id.
- Home-city timezones are pinned for multi-zone countries.
- Not done: the city comparison and the second-database check.
