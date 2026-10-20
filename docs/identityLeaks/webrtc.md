# WebRTC: STUN around the proxy

**Id:** `webrtc` · **Severity:** low (shape tell only) · **Status:** not leaking (no Vietnam IP, no direct UDP). Re-checked on the new browser at `2de5ff5` (verifiedLive, proxied)

## Summary

WebRTC is the classic way a proxied browser shows its real IP. STUN runs over
UDP and can skip an HTTP proxy (S20). On our build it doesn't. Live tests
through the Galway proxy saw no UDP socket from `camoufox.exe`, no STUN lookup,
and only the proxy's exit IP in the candidates (R3 T4). The candidate the page
sees is made up by Camoufox. That leaves a small shape tell: a page sees a
reflexive candidate that no STUN exchange ever produced.

## What leaks and to whom

- **Could leak, to Facebook or any page:** the real public IP through a
  server-reflexive (`srflx`) candidate, or the LAN IP through a host candidate.
  Neither happened.
- **Does show:** host candidates as mDNS `<uuid>.local`, and an `srflx`
  candidate carrying the exit IP with `raddr 0.0.0.0 rport 0` and the same port
  as the host candidate. A server-side STUN or TURN check would see that no
  binding request ever reached it. Whether Facebook checks this is unknown (R3
  T4). *inference*

## Evidence

- **The risk is real in general.** RFC 8828: WebRTC can find extra public and
  private addresses, and STUN can bypass a classic application proxy (S20).
  *vendorDocs*
- **Camoufox's design.** It rewrites ICE candidates and SDP. It also documents
  turning WebRTC off with `media.peerconnection.enabled=false` (S8). The README
  adds rewriting of `getStats()` (S2). *vendorDocs*
- **Prefs in our browser.** `camoufox.cfg:54-59`:
  `media.peerconnection.ice.no_host=false`, `default_address_only=true`,
  `proxy_only_if_behind_proxy=true`, `proxy_only_if_pbmode=true`,
  `obfuscate_host_addresses=true`, `network.proxy.socks_remote_dns=true`.
  *verifiedSource*
- **Spoofed address.** `camoufox/utils.py:746-748`: unless `block_webrtc`,
  `webrtc:ipv4` is set to the geoip IP, which the gate pins to the checked exit
  IP (`python/browser/proxyGate.py:131`). The gate never sets `block_webrtc`.
  *verifiedSource*
- **Live candidates (R3 T4, gateA):**
  ```
  candidate:0 1 UDP 2122252543 c8e5a2d3-….local 56630 typ host
  candidate:2 1 TCP 2105524479 c8e5a2d3-….local 9 typ host tcptype active
  candidate:1 1 UDP 1686052863 109.78.211.66 56630 typ srflx raddr 0.0.0.0 rport 0
  c=IN IP4 0.0.0.0
  ```
  Run fccC showed its own exit IP 86.43.185.91 the same way. *verifiedLive (proxied)*
- **Third-party checks (R3 T4).** browserleaks: "WebRTC Leak Test ✔ No Leak,
  Local IP Address -, Public IP Address 109.78.211.66". CreepJS: host `.local`
  only. *verifiedLive (proxied)*
- **Network path (R3 T4).** A watcher polled `Get-NetUDPEndpoint` and
  `Get-NetTCPConnection` for every `camoufox.exe` PID about every 2 s (43, 14,
  8, 15 and 14 samples across the runs). No UDP socket was seen. Every TCP
  remote was the proxy `95.179.253.146:2334` or `127.0.0.1`. Neither
  `stun.l.google.com` nor a unique STUN hostname reached the Windows DNS cache.
  *verifiedLive (proxied)*
- **Local probe (R2).** STUN servers were never contacted (no DNS, no CONNECT).
  *verifiedLive (local probe)*
- **History.** camoufox#529 and #538 fixed earlier WebRTC leaks. *upstreamIssue*

### Where the reports disagree

- **R4 M6** (written before the live tests) rated WebRTC medium and untested.
  Its worry: Playwright's proxy is a Juggler channel filter, not
  `network.proxy.*` prefs, so Firefox's "behind proxy" ICE check might not see
  it. Then STUN would go out directly with the Vietnam IP. *inference*
- **R3 T4 tested exactly that** and found no UDP and no STUN lookup. Live
  measurement beats inference, so the status is "not leaking".
- **R1 warns** that a clean page result can hide a direct STUN packet, because
  Camoufox rewrites what the page sees (R1 §3). R3 measured the sockets and DNS,
  not just the page, which answers that warning.
- **Remaining gap.** A 2-second poll could miss a very short-lived UDP socket.
  The DNS evidence (no STUN hostname was ever resolved) makes that unlikely.
  *inference*

## Where in our code it can happen again

- `python/browser/proxyGate.py:123-131`: caller kwargs pass through. A
  `block_webrtc=`, `config={'webrtc:*': ...}` or `firefox_user_prefs` that
  changes `media.peerconnection.*` would change this (`gateBypasses.md`).
- **Proxy rotation.** `webrtc:ipv4` is fixed at launch. After a mid-run
  rotation, the WebRTC IP and the HTTP IP differ
  (`proxyRotationAndGeoAccuracy.md`).
- **A Camoufox or browser upgrade** can change `camoufox.cfg` and the candidate
  rewriting.
- **SOCKS5** (`log proxy assign --socks5`): Firefox can proxy UDP through
  SOCKS5 differently. Re-test if it is ever used. *inference*
- **Launches without the gate** (no proxy) make `webrtc:ipv4` the Vietnam IP
  (`standaloneFacebookCamofoxClient.md`).

## Mitigation

- **Today:** Camoufox's ICE prefs, plus `webrtc:ipv4` pinned to the checked exit
  IP. Live-verified.
- **Defence in depth:** set
  `firefox_user_prefs={"media.peerconnection.ice.proxy_only": True}` in
  `apply()`. The `RTCPeerConnection` API stays, so the fingerprint looks normal,
  but UDP can never go out directly (R4 M6).
- **Use `block_webrtc=True` only if a probe fails.** A browser with no WebRTC
  stands out too.
- **Runtime self-check:** the first-page check must confirm that the `srflx` IP
  equals the gate's exit IP and the IP seen through the proxy (R2 change list
  item 4).

## How to re-test

> **Disposable scripts.** Any script named below under `.scratch` sits outside git, was a throwaway, may be gone, and is not a supported tool. `python/leakProbe.py` and `log proxy probe` don't exist yet. Until they do, the repeatable check at `2de5ff5` is a `log publish` dry run against `python/fixtures/createItem.html`, with the page-side probes in this file (`docs/proxies.md`, "Checked").

1. In the browser, through the production path:
   ```js
   const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
   pc.createDataChannel('x'); const c = [];
   pc.onicecandidate = (e) => e.candidate && c.push(e.candidate.candidate);
   await pc.setLocalDescription(await pc.createOffer()); await new Promise((r) => setTimeout(r, 5000)); c
   ```
2. At the same time, in PowerShell, watch for UDP from the browser:
   `Get-NetUDPEndpoint -OwningProcess (Get-Process camoufox).Id`.
3. Afterwards: `Get-DnsClientCache | Where-Object Entry -like '*stun*'`.
4. Optional: open `https://browserleaks.com/webrtc` in the proxied browser.
5. **Pass:** host candidates are `.local` only. The `srflx` IP equals the exit
   IP. No UDP endpoint. No STUN name in the DNS cache. **Fail:**
   116.105.162.81, any `192.168.*` or `10.*` address, or any UDP endpoint.
6. `runGate.py` already does all of this (R3 method).

## Status

Not leaking at `f033e63`, live-verified (R3 T4). Re-checked at `2de5ff5` on browser
156.0.1-beta.39: only mDNS host candidates plus a srflx of the exit IP.
*verifiedLive (proxied)* A minor shape tell remains. The launch self-check also
compares the exit IP (`browserExitIpMismatch`). The proposed `leakProbe.py`
doesn't exist yet.
