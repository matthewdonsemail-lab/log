# Running log on servers

This page describes one way to run log in production: Twenty on its own server, and AdsPower plus log together on a browser server, with your laptop as the development machine. It explains how the pieces talk to each other, why the browser and log must share a machine, how to keep development and production from opening the same account twice, and how to reach log's MCP server remotely. Read it if you're moving log off a single machine.

## The one constraint: log runs beside AdsPower

AdsPower's Local API only listens on the machine it runs on. Its documented address is `http://local.adspower.net:50325/` or `http://localhost:50325/` (127.0.0.1 when that name doesn't resolve). The CDP websocket a started profile returns is a loopback address too (`ws://127.0.0.1:<port>/devtools/browser/...`). AdsPower's Local API docs say so, and third-party AdsPower SDKs note that "AdsPower returns unreachable loopback endpoints" in remote or Docker setups.

So **whatever drives the browsers (log's host, its Python sessions and its proxy gate) runs on the same machine as AdsPower.** A typical setup is AdsPower, a virtual display (Xvfb) and log on one server, talking to `http://127.0.0.1:50325`.

Don't expose port 50325 or the CDP ports to the internet:

- AdsPower binds them to loopback anyway;
- the API key would cross the network;
- anyone who reached a CDP port could drive a signed-in browser.

## Production

```text
                ┌───────────────────────── browser server (Ubuntu Desktop 22.04+ or Windows Server 2016+) ─────────────────────────┐
                │  Xvfb :99 (Linux) ─ the browsers render here, visible, watchable over VNC through the private network           │
                │  AdsPower  --headless=true --api-key=<key> --api-port=50325   (systemd)                                           │
                │     ▲ Local API http://127.0.0.1:50325 (Bearer key)        ▲ CDP ws://127.0.0.1:<port> per open profile             │
                │     │                                                      │                                                        │
                │  log: `log facebook host start --account <a>` per account, the Python sessions, proxyGate, rea; run folders + HARs here │
                └─────┼─────────────────┬────────────────────────────┬──────────────────────────────┬───────────────────────────────┘
                      │ HTTPS (API key) │ HTTP(S)/SOCKS5 outbound     │ HTTPS outbound               │ HTTPS outbound
                      ▼                 ▼                             ▼                              ▼
              Twenty (its server)   Proxy gateway                 CaptchaKraken, 2Captcha        facebook.com, through the
              socialAccounts,       (e.g. 2Captcha residential)   solving APIs                   proxy only (all the browser's
              agencyListings        → a residential exit IP                                      traffic goes via the gateway)
                                      in the account's city
```

- **Twenty** is reached the same way from anywhere: `TWENTY_BASE_URL` (HTTPS) plus `TWENTY_API_KEY`, through the generated client. If AdsPower runs on Twenty's own server, the only change is that `TWENTY_BASE_URL` can point at Twenty locally. Twenty and AdsPower are separate programs on separate ports.
- **The browser server only makes outbound connections:** to Twenty, the proxy gateway and the captcha APIs. Nothing needs to reach it from outside, except your own access over a private network (below).
- **Proxies:**
  - The browser's traffic goes from the browser server to the proxy gateway, and leaves from a residential IP in the account's city.
  - The proxy gate checks the exit IP from the same server, through the same proxy, before the profile starts.
  - 2Captcha's proxies sign in by username and password, so the server's own IP doesn't matter. An IP allow-list is optional.
- **AdsPower licence:** with an API key and headless mode, one AdsPower account can run Local API automation on several devices at once. In GUI mode it can only be signed in on one device. GUI and headless can't both run on the same machine (help.adspower.com/docs/api).
- **Profiles are AdsPower cloud records.** Profiles that `log adsPower sync` made on your development machine show up on the server under the same AdsPower account, so their ids, and the `adsPowerProfileId` links in Twenty, are the same in development and production.

## Development (your own machine)

- **AdsPower:** the GUI app, so the browsers open on your screen.
- **`.env.local`:** `ADSPOWER_HOST=http://local.adspower.net:50325` and `ADSPOWER_API_KEY`.
- **Twenty:** the same Twenty as production, over HTTPS. Tests use the in-memory Twenty (`marketplaceFixture`).
- **Proxies:** the same gateway, so a development run exits from the account's city just like production.
- **AdsPower's MCP server:** added at local scope, so its key stays out of git.

## Keeping development and production apart

1. **One profile is open on one machine at a time.** A profile open in both places at once means two browsers, two IPs and two cookie jars for one account. Before opening, the driver asks AdsPower which device has the profile open (`/api/v1/browser/cloud-active`, at most 100 ids per call) and refuses if it's open elsewhere. AdsPower can't report this with "Multi Device mode" on, so leave that mode off.
2. **The port is read, not assumed.** AdsPower notes the port can change. In production, `ADSPOWER_HOST` comes from AdsPower's own `local_api` file (`~/.config/adspower_global/cwd_global/source/local_api` on Linux), or the port is pinned with `--api-port=50325`.
3. **Each machine has its own `.env.local`,** with the same names: `ADSPOWER_HOST`, `ADSPOWER_API_KEY`, `TWENTY_*`, `2CAPTCHA_*` and `CAPTCHA_KRAKEN_API_KEY`. Never committed.
4. **Reach the browser server over a private network** (Tailscale or an SSH tunnel) to run `log` commands, watch the Xvfb display over VNC, and read run folders. AdsPower's MCP server can work from development through an SSH tunnel to 127.0.0.1:50325.

## Reaching log's MCP server remotely

`logMcp` serves the same tools as over stdio, over MCP's Streamable HTTP, so a client on another machine can drive the browser server:

```
LOG_MCP_TOKEN=<a long random token> logMcp --http --host <private network ip> --port 7337
```

- **Endpoint:** `http://<host>:7337/mcp`. A client sends `Authorization: Bearer <token>`.
- **Loopback by default** (`127.0.0.1`, no token needed). On any other address it refuses to start without `LOG_MCP_TOKEN` or OAuth (below), and it checks the Host header against DNS rebinding. With only the static token, bind it to the private network's address, never a public one, or keep it on loopback and reach it through an SSH tunnel.
- **One session per client,** with its progress lines streamed as they happen (logging notifications), as over stdio.
- **The same guards:** a live action needs `confirmLive: true`, and a join, fill or check runs in the account's open browser, opened with `log inspect start --account <a> --detach`.
- **What a client gets:** every tool declares one `outputSchema` and returns `structuredContent` (`exit`, `ok`, `stdout`, `stderr`, `log`, and `json` when the command printed JSON). Failures come back as `isError`. `tools.listChanged` is on, and saving a flow (a tool of its own) sends `notifications/tools/list_changed`.

## Connecting from Claude's connectors: OAuth through Twenty

Claude's custom connectors (claude.ai) reach an MCP server from Anthropic's cloud over the public internet and sign in with OAuth (`oauth_dcr`); a static bearer token is a beta only some organisations have (claude.com/docs/connectors/building/authentication). So `logMcp` is also its own OAuth authorization server, and the only person who may sign in is the Twenty user who ran `log login` on it (`src/mcp/oauth`):

```
LOG_MCP_PUBLIC_URL=https://<public host>  TWENTY_BASIC_USER=…  TWENTY_BASIC_PASSWORD=…  logMcp --http --host 127.0.0.1 --port 7337
```

- **The connector URL** is exactly `https://<public host>/mcp` (the metadata's `resource`). TLS ends in front of port 7337, and only `/mcp`, `/.well-known/*` and `/oauth/*` are passed through. AdsPower's API and CDP stay on loopback.
- **How a sign-in goes:**
  1. Claude registers itself (`/oauth/register`; only Claude's callback `https://claude.ai/api/mcp/auth_callback` or a loopback address is accepted).
  2. Claude sends the browser to `/oauth/authorize` (S256 PKCE).
  3. The server registers itself once with Twenty as a public client (Twenty's own `/oauth/register`, redirect `https://<public host>/oauth/twenty/callback`) and sends the browser to Twenty's sign-in. If Twenty sits behind Basic Auth, `TWENTY_BASIC_USER`/`TWENTY_BASIC_PASSWORD` are sent on every call to Twenty's OAuth endpoints.
  4. Twenty's token names its user (`userId`). Only the owner gets a code back to Claude.
  5. Codes last 60 seconds and are used once. Access tokens last 1 hour; refresh tokens last 30 days and rotate.
- **The owner** is the `userId` in the server's `log login` session (or `LOG_MCP_OWNER_USER_ID`). With neither, every sign-in is refused, with a message saying why.
- **Why not reuse `log login`'s own handoff:** the sign-in web app only hands its session to a loopback exchange on the same machine, but a connector's sign-in happens in a browser somewhere else. So the server talks to Twenty's OAuth directly, which is the same sign-in.
- **Tokens** are stored only as hashes, in `~/.logCli/mcp/oauth.json` (0600). `log mcp clients` lists who signed in, and `log mcp revoke <clientId|all>` cuts them off (terminal only). The static `LOG_MCP_TOKEN` keeps working beside OAuth, for Claude Code and Codex over the private network.

## Sticky proxies and an always-open browser

- **How a proxy session works:** the account's proxy username carries country, state, city, `session-<id>` and `sessTime-120` (`src/proxyVendor/twoCaptcha/helpers/buildProxyUrl.ts`).
- **The 120-minute limit:** 2Captcha holds one sticky IP for at most 120 minutes. After that, the same username gets a new residential IP in the same city.
- **Why it matters:** a browser kept open all day sees its exit IP change every two hours. In one recorded run, a checkpoint appeared on the first request after the IP changed.
- **Two ways to handle it:**
  - **(a)** keep the browser open all day and let the IP change within the same city;
  - **(b)** open in windows of up to 120 minutes, closing with a logged reason before the session ends, and opening the next window on a fresh session.

## What's left to build

1. **Production settings:**
   - `ADSPOWER_HOST` read from the `local_api` file when it's there;
   - `log facebook doctor` checking the AdsPower Local API and that `ADSPOWER_API_KEY` is set;
   - a server setup guide: Xvfb, AdsPower headless with `--api-key`, Bun and Python for log, systemd units, and VNC on the private network only.
2. **The one-machine lock:** `cloud-active` before every open (point 1 under "Keeping development and production apart").
3. **The proxy gate and self-check over CDP,** run on the browser server: `proxyGate.py` attaches to the AdsPower profile with `connect_over_cdp`.
4. **HAR and step recording** on the attached browser context. The run folders live on the browser server; whether they're copied to a development machine for rea is up to you.
5. **One host per account** as a systemd service on the browser server, picking its driver from `socialAccounts.browserDriver`.
6. **The proxy session handling** you choose, (a) or (b) above.
