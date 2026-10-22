# Deployment: development and production, with the services on different servers

matt, 2026-10-20: Twenty runs on its own server. In production AdsPower runs on a
server too: either another port on Twenty's server, or somewhere else. The proxies
are the 2Captcha residential ones already paid for (rule 43). This page is how the
pieces talk, in dev and in prod, from each service's own documentation.

## The one constraint everything follows

AdsPower's Local API only listens on the machine it runs on. Its documented address
is `http://local.adspower.net:50325/` or `http://localhost:50325/`, and 127.0.0.1
when that domain doesn't resolve. The CDP websocket a started profile returns is a
loopback address as well (`ws://127.0.0.1:<port>/devtools/browser/...`).

Sources:
- `localApiApiOverview`, `localApiCodeSamples` and the AdsPower API troubleshooting
  guide, in `RESEARCH/MARKETPLACE_PROVIDERS/antidetectBrowsers/adsPower/pages/`;
- CrocoFactory's AdsPower SDK, which notes that "AdsPower returns unreachable
  loopback endpoints" in remote or Docker setups.

So **whatever drives the browsers (log-cli: the host, the Python sessions, the gate)
runs on the same machine as AdsPower.** That is how Listaro ran: AdsPower, Xvfb and
its agent on one Hetzner server, talking to `http://127.0.0.1:50325`
(`Listaro_backup/server/setup-adspower.sh`, `docs/superpowers/plans/2026-04-08-adspower-server-architecture.md`).

Exposing port 50325 or the CDP ports to the internet is not an option:
- AdsPower binds them to loopback;
- the API key would cross the network;
- anyone who reached a CDP port could drive a signed-in browser.

## Production

```text
                ┌───────────────────────── browser server (Ubuntu Desktop 22.04+ or Windows Server 2016+) ─────────────────────────┐
                │  Xvfb :99 (Linux) ─ the browsers render here, headed (rule 11), watchable over VNC through the private network     │
                │  AdsPower  --headless=true --api-key=<key> --api-port=50325   (systemd, as Listaro)                                │
                │     ▲ Local API http://127.0.0.1:50325 (Bearer key)        ▲ CDP ws://127.0.0.1:<port> per open profile             │
                │     │                                                      │                                                        │
                │  log-cli: `log facebook host start --account <a>` per account, the Python sessions, proxyGate, rea; run folders + HARs here  │
                └─────┼─────────────────┬────────────────────────────┬──────────────────────────────┬───────────────────────────────┘
                      │ HTTPS (API key) │ HTTP(S)/SOCKS5 outbound     │ HTTPS outbound               │ HTTPS outbound
                      ▼                 ▼                             ▼                              ▼
              Twenty (its server)   2Captcha proxy gateway        CaptchaKraken, 2Captcha        facebook.com, through the
              socialAccounts,       na.proxy.2captcha.com:2334    solving APIs                   proxy only (the browser's
              agencyListings        → a residential exit IP                                      traffic all goes via the gateway)
                                      in the account's PA city
```

- **Twenty** is reached the same way from anywhere: `TWENTY_BASE_URL` (HTTPS) plus
  `TWENTY_API_KEY`, through the generated client (rule 14). If AdsPower runs on
  Twenty's own server, nothing changes except that `TWENTY_BASE_URL` can point
  at Twenty locally. Twenty and AdsPower are separate programs on separate ports.
- **The browser server only makes outbound connections:** Twenty, the proxy
  gateway, the captcha APIs. Nothing needs to reach it from outside except matt's
  own access over a private network (below).
- **Proxies:**
  - The browser's traffic goes from the browser server to 2Captcha's gateway, and
    leaves from a residential IP in the account's city.
  - The gate (rule 12) checks the exit IP from the same server, through the same
    proxy, before the profile starts.
  - 2Captcha authenticates by username and password, so the server's own IP doesn't
    matter. An IP whitelist is optional; that page needs a 2Captcha login.
- **AdsPower licence:** with an API key and headless mode, one AdsPower account can
  run Local API automation on several devices at once. In GUI mode it can only be
  signed in on one device. GUI and headless can't both run on the same machine
  (help.adspower.com/docs/api).
- **Profiles are AdsPower cloud records.** The 10 profiles `log adsPower sync` made
  from this PC show up on the server under the same account, so their ids, and the
  `adsPowerProfileId` links in Twenty, are the same in dev and prod.

## Development (this PC)

- **AdsPower:** the GUI app, so the browsers open on this screen.
- **`.env.local`:** `ADSPOWER_HOST=http://local.adspower.net:50325` and `ADSPOWER_API_KEY`.
- **Twenty:** the same production Twenty, over HTTPS. Tests use the in-memory Twenty (`marketplaceFixture`).
- **Proxies:** the same 2Captcha gateway, so a dev run exits from the account's city just like prod.
- **AdsPower's MCP server:** added at local scope, so its key stays out of git.

## Rules that keep dev and prod from fighting

1. **One profile opens on one machine at a time.** A profile open in dev and in prod at
   once means two browsers, two IPs and two cookie jars for one account. Before
   opening, the driver asks AdsPower which device has the profile open
   (`/api/v1/browser/cloud-active`, max 100 ids per call) and refuses if it is open
   elsewhere. With "Multi Device mode" on, AdsPower can't report this, so leave that
   mode off.
2. **The port is read, not assumed.** AdsPower notes the port can change. In prod,
   `ADSPOWER_HOST` comes from AdsPower's own `local_api` file
   (`~/.config/adspower_global/cwd_global/source/local_api` on Linux), or is pinned
   with `--api-port=50325`.
3. **Per-environment `.env.local`.** The same names, `ADSPOWER_HOST`, `ADSPOWER_API_KEY`,
   `TWENTY_*`, `2CAPTCHA_*` and `CAPTCHA_KRAKEN_API_KEY`, set per machine. Never committed.
4. **matt reaches the browser server over a private network** (Tailscale or an SSH
   tunnel), to run `log` commands, see the Xvfb display over VNC, and read run folders.
   The AdsPower MCP server can work from dev through an SSH tunnel to 127.0.0.1:50325.

## The log MCP server, remotely

The same tools as over stdio, served over MCP's Streamable HTTP so a client on
another machine can drive the browser server:

```
LOG_MCP_TOKEN=<a long random token> bun bin/logMcp.ts --http --host <tailscale ip> --port 7337
```

- **Endpoint:** `http://<host>:7337/mcp`. A client sends `Authorization: Bearer <token>`.
- **Loopback by default** (`127.0.0.1`, no token needed). Any other address refuses to start
  without `LOG_MCP_TOKEN`, and checks the Host header (DNS rebinding). Bind it to the private
  network's address (Tailscale), never a public one; or keep it on loopback and reach it
  through an SSH tunnel.
- **One session per client**, its progress lines streamed as they happen (logging
  notifications), as over stdio.
- **The same guards:** `--live` needs `confirmLive: true` (rule 10); a join, fill or check runs in
  the account's open browser, opened with `inspect start --account <a> --detach` (rule 35).
- **What a client gets** (MCP's client best practices): every tool declares one `outputSchema`
  and returns `structuredContent` (`exit`, `ok`, `stdout`, `stderr`, `log`, and `json` when the
  command printed JSON); failures come back as `isError`; `tools.listChanged` is on and a saved
  flow (a tool of its own) sends `notifications/tools/list_changed`.

## The 2Captcha proxies (rule 43): what changes with an always-open browser

- **How a session works:** the account's proxy username carries country, state, city,
  `session-<id>` and `sessTime-120` (`src/proxyVendor/twoCaptcha/helpers/buildProxyUrl.ts`).
- **The 120-minute limit:** 2Captcha holds one sticky IP for at most 120 minutes. After
  that, the same username gets a new residential IP in the same city.
- **Why it matters:** a browser kept open all day (rule 35) sees its exit IP change
  every two hours. That is the trigger recorded on Erie on 2026-10-19: a checkpoint on
  the first request after the IP rotated.
- **The ways to run with this, for matt to choose:**
  - **(a)** keep the browser open all day and let the IP change in the same city;
  - **(b)** open in windows of up to 120 minutes, closing with a logged reason (rule 35)
    before the session ends, and opening the next window on a fresh session.

## What to build, in order

1. **Prod settings:**
   - `ADSPOWER_HOST` from the `local_api` file when present;
   - `log facebook doctor` checks the AdsPower Local API and that `ADSPOWER_API_KEY` is set;
   - a `docs/serverSetup.md` port of Listaro's `setup-adspower.sh`: Xvfb, AdsPower
     headless with `--api-key`, Bun and Python for log-cli, systemd units, and VNC on
     the private network only.
2. **The single-machine lock:** `cloud-active` before every open (rule 1 above).
3. **The gate and self-check over CDP**, run on the browser server (rules 12, 17):
   `proxyGate.py` attaches to the AdsPower profile with `connect_over_cdp`.
4. **HAR and steps recording** on the attached context (rule 22). The run folders live
   on the browser server; whether they're copied to matt's dev machine for rea (rule 19)
   is for matt to say.
5. **The host per account** as a systemd service on the browser server, picking its
   driver from `socialAccounts.browserDriver`.
6. **The 2Captcha session handling** matt picks, (a) or (b) above.
