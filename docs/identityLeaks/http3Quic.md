# HTTP/3 and QUIC: UDP around the proxy

**Id:** `http3Quic` · **Severity:** none found · **Status:** not leaking. HTTP/3 is pinned off at `2de5ff5` (`network.http.http3.enable=false`, verifiedSource)

## Summary

HTTP/3 runs over UDP (QUIC). An HTTP proxy only carries TCP. If Firefox
switched a site to HTTP/3, that UDP could go out directly from Vietnam. It
doesn't. Firefox refuses HTTP/3 through an ordinary proxy, and the live test
saw only HTTP/2 and only TCP to the proxy (R3 T6). The HTTP/3 pref is still on
by default, so this rests on Firefox's logic, not on a setting we control.

## What leaks and to whom

- **Could leak, to Facebook's or Cloudflare's edge:** the real IP, through a
  direct QUIC connection after an `Alt-Svc: h3` header. It didn't.

## Evidence

- **Firefox source (S16).** In `AlternateServices.cpp`:
  `isProxyAllowed = pi ? (pi->IsDirect() || pi->IsHttp3Proxy()) : true`.
  HTTP/3 Alt-Svc mappings are ignored unless the connection is direct or the
  proxy is itself an HTTP/3 (MASQUE) proxy. Our 2Captcha proxy is neither.
  *verifiedSource* (current Firefox main, not the bundled build)
- **UDP proxying is a separate mechanism** (RFC 9298, Extended CONNECT, S22).
  "UDP exists" does not mean "Firefox ignores the proxy" (R1 §3). *vendorDocs*
- **Live, through the Galway proxy (R3 T6):** *verifiedLive (proxied)*
  - `https://www.cloudflare.com/cdn-cgi/trace`, loaded twice so Alt-Svc could
    be learned: `http=http/2`, `ip=109.78.211.66`, `loc=IE`, `colo=LHR`. Run
    fccC: `colo=DUB`, `ip=86.43.185.91`.
  - `https://cloudflare-quic.com/cdn-cgi/trace`, twice: `http=http/2`.
  - Every TCP remote in every run was `95.179.253.146:2334` (the proxy) or
    `127.0.0.1` (Playwright). `tcpNonProxyRemotes: {}` and
    `udpLocalEndpoints: {}` in every run.
- **The pref is not set.** `network.http.http3.enable` is not in
  `camoufox.cfg`, so Firefox's default (true) applies. R3 couldn't read
  `about:config` (navigation timed out under Playwright). *verifiedSource*

### Where the reports disagree

- **R4 L4** rated this low and "inferred": nothing pins HTTP/3 off.
- **R1** warns that current-main Firefox source is "informative, not a
  substitute for testing an older bundled binary".
- **R2** cites the source. **R3** tested the bundled binary live.
- **Strongest evidence:** R3's live test on our exact build answers R1's
  caution. R4's point still stands as a hardening step: the safety comes from
  code behaviour, not a pinned pref.

## Where in our code it can happen again

- **A proxy that speaks HTTP/3 (MASQUE)** would make HTTP/3 allowed by design.
  Then QUIC would go through it, which is still proxied, but re-test.
- **No proxy at all** (`pi->IsDirect()`) allows QUIC. Only an ungated launch
  can do that (`gateBypasses.md`, `standaloneFacebookCamofoxClient.md`).
- **A Camoufox or Firefox upgrade** that changes the Alt-Svc rule.
- **`firefox_user_prefs` passed through `apply()`.**

## Mitigation

- **Pin it off:** `firefox_user_prefs={"network.http.http3.enable": False}` in
  `apply()` (R4 L4). This changes nothing Facebook sees today, because through
  the proxy the browser already uses HTTP/2. *inference*

## How to re-test

> **Disposable scripts.** Any script named below under `.scratch` sits outside git, was a throwaway, may be gone, and is not a supported tool. `python/leakProbe.py` and `log proxy probe` don't exist yet. Until they do, the repeatable check at `2de5ff5` is a `log publish` dry run against `python/fixtures/createItem.html`, with the page-side probes in this file (`docs/proxies.md`, "Checked").

1. In the proxied browser, load `https://www.cloudflare.com/cdn-cgi/trace`
   twice and `https://cloudflare-quic.com/cdn-cgi/trace` twice.
2. Read the `http=` line. **Pass:** `http/2` (or `http/1.1`) every time, and
   `ip=` is the exit IP.
3. During the run:
   `Get-NetUDPEndpoint -OwningProcess (Get-Process camoufox).Id` and
   `Get-NetTCPConnection -OwningProcess (Get-Process camoufox).Id`.
   **Pass:** no UDP endpoints, and TCP only to the proxy and `127.0.0.1`.
4. `runGate.py` does all of this (R3 method).

## Status

Not leaking at `f033e63`, live-verified (R3 T6). **Pinned off at `2de5ff5`:** the
device profile always sets `network.http.http3.enable=false`
(`PINNED_PREFS`, `python/deviceProfile.py`), covered by
`src/camofox/device/device.test.ts`. *verifiedSource, unitTested* The pinned
build was not re-measured for UDP.
