# DNS: lookups from this PC

**Id:** `dns` · **Severity:** none found · **Status:** not leaking. DoH is pinned off at `2de5ff5` (`network.trr.mode=5`, verifiedSource)

## Summary

If the browser looked up hostnames itself, the lookups would go to this PC's
resolvers (8.8.8.8 and 1.1.1.1 on the Vietnamese connection). Any site that
uses a unique hostname would then see a resolver near Vietnam. That doesn't
happen. With the HTTP proxy, Firefox sends the hostname to the proxy inside
`CONNECT` and resolves nothing locally. Two independent tests agree (R2, R3 T5).

## What leaks and to whom

- **Could leak, to any site with its own DNS server** (an EDNS echo, for
  example): the location and ISP of the resolver that asked. It didn't.
- **Does leak, to the local ISP and Google/Cloudflare DNS only:** this PC
  resolves the proxy host `eu.proxy.2captcha.com` itself. That is unavoidable.
  It shows only that this PC uses 2Captcha. Facebook can't see it (R3 T5).
- **What sites do see:** a Cloudflare resolver in London for the Irish exit
  (below). That isn't Vodafone's or Eircom's own resolver. Whether any site
  compares the resolver's network with the client's ISP is unknown.
  *inference*

## Evidence

- **Live, through the Galway proxy (R3 T5):** *verifiedLive (proxied)*
  - browserleaks DNS: "Found 53 Servers, 1 ISP, 1 Location", all
    "Cloudflare, United Kingdom, London" (141.101.70.x, 162.158.x,
    172.64-172.71.x, 2400:cb00:…). No 8.8.8.8 or 1.1.1.1 anycast from Asia, no
    Viettel.
  - ip-api's EDNS check with a unique 32-character name, three runs:
    `"dns": {"geo": "United Kingdom - Cloudflare, Inc.", "ip": "172.71.240.90"}`
    (and .69.193.99, .70.160.110).
  - The Windows DNS client cache had zero hits for the unique navigation name,
    the unique STUN name, the EDNS name and `stun.l.google`.
- **Local probe (R2 `dnsprobe.py`):** a local HTTP proxy logged every request
  and resolved nothing. Every hostname arrived as `CONNECT host:443`:
  navigation, `fetch`, `img`, WebSocket, `dns-prefetch`, `preconnect`,
  `sendBeacon`, and STUN and TURN hostnames. None appeared in the Windows DNS
  cache, but the control name did. *verifiedLive (local probe)*
- **Prefetch is off** (`camoufox.cfg:331-334`, `:764`):
  `network.dns.disablePrefetch=true`, `disablePrefetchFromHTTPS=true`,
  `network.prefetch-next=false`, `network.predictor.enabled=false`,
  `network.http.speculative-parallel-limit=0`. *verifiedSource*
- **SOCKS too.** `camoufox.cfg:59`: `network.proxy.socks_remote_dns=true`, so
  `--socks5` proxies resolve remotely as well. *verifiedSource*
- **DoH isn't pinned off.** No `network.trr.*` in `camoufox.cfg`. The stock
  `network.trr.uri` is empty (R4 L4). *verifiedSource*

### Where the reports disagree

There is no disagreement on the result. R1 corrects a common misreading:
Firefox bug 1920399 (S12) was about **proxy extensions with SOCKS5** in
Firefox 129 and 130, and `proxyDNS` is a SOCKS setting (S13). It is not
evidence that an HTTP proxy leaks DNS. Both live tests confirm that for our
build.

## Where in our code it can happen again

- **Requests made outside the browser** (Python `requests`, Bun `fetch`) resolve
  locally. None of them reach Facebook today (`outOfBrowserRequests.md`).
- **DoH.** If `network.trr.mode` were turned on with a resolver, lookups would go
  to that resolver from wherever the DoH connection goes. *inference*
- **`firefox_user_prefs` passed through `apply()`** could re-enable prefetch or
  the predictor (`gateBypasses.md`).
- **A Camoufox upgrade** that changes `camoufox.cfg`.
- **Launches with no proxy** resolve everything locally
  (`standaloneFacebookCamofoxClient.md`).

## Mitigation

- **Today:** nothing needed. The proxy resolves everything.
- **Pin it:** set `network.trr.mode=5` (DoH off) in `apply()`'s
  `firefox_user_prefs`, so a future default can't change it (R4 L4).
- **Keep all Facebook traffic inside the browser.** No Python or Bun request to
  Facebook domains.

## How to re-test

> **Disposable scripts.** Any script named below under `.scratch` sits outside git, was a throwaway, may be gone, and is not a supported tool. `python/leakProbe.py` and `log proxy probe` don't exist yet. Until they do, the repeatable check at `2de5ff5` is a `log facebook publish` dry run against `python/fixtures/createItem.html`, with the page-side probes in this file (`docs/proxies.md`, "Checked").

1. `python -I C:\Users\0\.buzz\.scratch\camoufox_probe\dnsprobe.py` (local, no
   real proxy).
2. Live: in the proxied browser, load a page that requests a unique hostname,
   e.g. `https://<random32>.edns.ip-api.com/json`. Then in PowerShell:
   `Get-DnsClientCache | Where-Object Entry -like '*<random32>*'`.
3. Open `https://browserleaks.com/dns` in the proxied browser.
4. **Pass:** no cache hit for the unique name, and the resolvers are not in
   Vietnam or Asia. **Fail:** any cache hit, Viettel, or an Asian anycast
   location.

## Status

Not leaking at `f033e63`, live-verified (R3 T5) and probe-verified (R2).
**DoH pinned off at `2de5ff5`:** `network.trr.mode=5` in `PINNED_PREFS`
(`python/device/deviceProfile.py`), covered by `src/camofox/device/device.test.ts`.
*verifiedSource, unitTested* The pinned build was not re-measured for DNS.
