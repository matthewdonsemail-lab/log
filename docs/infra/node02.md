# node02: ListeningKit's Twenty and the knowledge base

node02 is a Linux server on matt's tailnet (`node02.tail4fcf85.ts.net`,
100.84.226.128). SSH: `ssh deepman@100.84.226.128` (Tailscale SSH). Since 2026-10-30 the
tailnet policy refuses `root`, and deepman's sudo needs a password. Everything runs as one Docker Compose stack in
`/home/deepman/services/listeningkit-twenty`, owned by `deepman`.

## Services

| Service | Image | What it does | Reached at |
| --- | --- | --- | --- |
| server, worker | `twentycrm/twenty:v2.49.0` | ListeningKit's Twenty (workspace "ListeningKit"): log-cli's accounts, listings and all the agency work, and the knowledge base | `127.0.0.1:3000`; tailnet `https://node02.tail4fcf85.ts.net` (Tailscale Serve, no login gate); public `https://twenty.listeningkit.com` |
| postgres | `postgres:16-alpine` | Twenty's database | internal |
| redis | `redis:7-alpine` | Twenty's own cache and queues | internal |
| kb-redis | `redis:8.2.11` (search and JSON modules loaded) | The knowledge base search index (`kbIdx`) | `127.0.0.1:6380`; tailnet `node02.tail4fcf85.ts.net:6380` (Tailscale Serve TCP) |
| auth-guard | `nginx:1.27.5-alpine` | Basic Auth in front of Twenty for the public name | behind the tunnel |
| cloudflared | `cloudflare/cloudflared:2026.10.3` | Tunnel `listeningkit-node02` (6a03a4f1-27e0-40eb-ae42-500247e312ab) | `twenty.listeningkit.com`, `newsletter-relay.listeningkit.com`, `mcp.listeningkit.com` (log MCP, below) |
| newsletter-relay | `node:22-alpine` | Newsletter sign-up relay for the Vercel site | `newsletter-relay.listeningkit.com` (profile `relay`) |
| buzz-twenty-bridge | `node:22-trixie-slim` | Buzz `crm-sync` channel to Twenty | profile `bridge`, running again since 2026-10-27 |

`cloudflared`, `newsletter-relay` and `buzz-twenty-bridge` sit behind compose
profiles, so a plain `docker compose up -d` does not start them. cloudflared
waits for newsletter-relay to be healthy; start it alone with
`docker compose --profile cloudflare up -d --no-deps cloudflared`.

## log MCP over HTTPS (2026-10-30)

log-cli's MCP server also runs on node02, so Claude's connectors (claude.ai,
Duet) and Claude Code on other machines can reach it (`docs/deployment.md`, "The
log MCP server, remotely"). It is its own stack, apart from Twenty's:
`/home/deepman/services/logMcp`.

| Part | What it is |
| --- | --- |
| `app/` | a clone of `~/repos/log-cli.git`, a bare repo that matt's PC pushes to (`git push node02 main`, remote `node02` = `deepman@100.84.226.128:repos/log-cli.git`) |
| `Dockerfile`, `compose.yaml`, `.dockerignore` | the image `log-mcp:local` and the container `log-mcp` (restart unless-stopped, host network), below |
| `.env` (mode 600) | `LOG_TWENTY_BASE_URL`/`LOG_TWENTY_API_KEY` (node02's Twenty, the same as the PC's), `LOG_MCP_TOKEN`, `LOG_MCP_PUBLIC_URL=https://mcp.listeningkit.com`, `LOG_MCP_OWNER_USER_ID` (mandeep's Twenty user) |
| `data/logCli` | the container's `~/.logCli`: X governors, runs, OAuth clients (`mcp/oauth.json`) |
| `data/listeningkit` | read-only copies of `subq-api-key.txt`, `twenty-listeningkit-api-key.txt`, `kb-redis-url.txt` |

- **The address: `https://mcp.listeningkit.com/mcp`.** It stays the same. Point every
  connector at it, never at a machine name. Twenty holds it too (Note
  "Infrastructure: log MCP server (mcp.listeningkit.com)").
- **Listens on** `172.17.0.1:7337`, the Docker bridge, not the internet (`command:` in
  `compose.yaml`). With no token it answers 401, and with the token it lists 148 tools.
  Sign-in is the static token (`C:\Users\mande\.config\listeningkit\log-mcp-token.txt`
  on the PC) or OAuth through node02's Twenty, where only the owner may connect.
- **Public route:** the Cloudflare tunnel `listeningkit-node02` (above) has an ingress
  rule for `mcp.listeningkit.com` with path `^/(mcp|oauth/.*|\.well-known/.*)$` to
  `http://172.17.0.1:7337`. cloudflared reaches it from `listeningkit-twenty_internal`
  through the host's bridge address. DNS: `mcp` is a proxied CNAME to the tunnel. Any
  other path is 404. `log.listeningkit.com` was not used, because it points at Vercel
  (a live site).
- **Connecting:** a claude.ai or Duet custom connector takes
  `https://mcp.listeningkit.com/mcp`. Its sign-in goes to node02's Twenty, which is
  tailnet only, so the browser signing in must be on the tailnet. Claude Code elsewhere:
  `claude mcp add --transport http log-node02 https://mcp.listeningkit.com/mcp --header "Authorization: Bearer <token from log-mcp-token.txt>"`.
- **History:** on 2026-10-30 it ran first on Tailscale Funnel
  (`node02.tail4fcf85.ts.net:8443`) and moved the same day to the tunnel. The Funnel is
  off (`tailscale funnel --https=8443 off`).
- **What runs there:** the direct-API platforms (X, Reddit, Discord) and the
  knowledge base. No browser: AdsPower and Camoufox stay on the PC.
- **X Chat:** chat-xdk has no Linux wheel in `vendor/chatXdk`, so the image
  builds it from source with juicebox-sdk 0.3.7 checked out beside it (chat-xdk's
  CI does the same). That build takes about 13 minutes and is cached after.
- **Its own governor:** the container counts X sends in its own `~/.logCli`, so
  one account's sends should come from one machine.
- **Update:** `git push node02 main` from the PC, then on node02
  `cd ~/services/logMcp/app && git pull && cd .. && docker compose up -d --build`.
  Ownership is set with `COPY --chown`, because a `chown -R` over
  `node_modules` ran for an hour on the overlay filesystem.

```dockerfile
FROM rust:1.91.1-bookworm AS chatxdk
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-pip python3-venv && rm -rf /var/lib/apt/lists/*
RUN python3 -m venv /opt/build && /opt/build/bin/pip install -q "maturin>=1.8,<2.0"
RUN git clone -q --depth 1 --branch 0.3.7 https://github.com/juicebox-systems/juicebox-sdk /src/juicebox-sdk
COPY app/vendor/chatXdk /src/chatXdk
WORKDIR /src/chatXdk
RUN rustup component add rustfmt clippy && /opt/build/bin/maturin build --release -m crates/pyo3/Cargo.toml -o /wheels

FROM oven/bun:1.4.4-debian
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-venv python3-pip git ca-certificates curl libsndfile1 libpulse0 && rm -rf /var/lib/apt/lists/*
RUN python3 -m venv /opt/venv && /opt/venv/bin/pip install -q --no-cache-dir \
    "curl_cffi>=0.15" filetype beautifulsoup4 pyotp lxml webvtt-py m3u8 Js2Py-3.13 "pydantic>=2.6" \
    "websocket-client>=1.9.2" "python-socks>=3.1.1" "orjson>=3.13.0" "pycryptodome>=4.2.0" numpy soundfile soundcard
COPY --from=chatxdk /wheels /wheels
RUN /opt/venv/bin/pip install -q --no-cache-dir /wheels/*.whl
RUN mkdir -p /app /home/log && chown 1000:1000 /app /home/log
WORKDIR /app
USER 1000:1000
COPY --chown=1000:1000 app/package.json app/bun.lock* app/bun.lockb* ./
RUN bun install --frozen-lockfile --ignore-scripts
COPY --chown=1000:1000 app/ ./
ENV LOG_PYTHON=/opt/venv/bin/python PYTHONUTF8=1 HOME=/home/log
EXPOSE 7337
CMD ["bun", "bin/logMcp.ts", "--http", "--host", "127.0.0.1", "--port", "7337"]
```

```yaml
services:
  logMcp:
    build: .
    image: log-mcp:local
    container_name: log-mcp
    restart: unless-stopped
    network_mode: host
    env_file: .env
    command: ["bun", "bin/logMcp.ts", "--http", "--host", "172.17.0.1", "--port", "7337"]
    volumes:
      - ./data/logCli:/home/log/.logCli
      - ./data/listeningkit:/home/log/.config/listeningkit:ro
```

## Where the logins are

Never in the repo, the knowledge base or chat. On matt's PC, in
`C:\Users\mande\.config\listeningkit\`:

- `twenty-basic-auth.txt`: the Basic Auth login for `twenty.listeningkit.com`
  (username `listeningkit`).
- `twenty-listeningkit-api-key.txt`: the API key `log kb` uses (workspace key
  "log-cli knowledge base").
- `kb-redis-url.txt`: the kb-redis URL with its password.
- `cloudflare-api-token.txt`: the Cloudflare API token (zones, DNS, tunnels).
- `log-mcp-token.txt`: the bearer token for log MCP on node02 (also
  `LOG_MCP_TOKEN` in `~/services/logMcp/.env` there).

On node02 the stack's secrets are in `.env` (mode 600, owner deepman).

## 2026-10-23 breakage and the 2026-10-26/27 fix

At 2026-10-23 00:02 the stack's `.env` was rewritten (most likely `install.sh`
run again): every secret was regenerated and the API keys, the tunnel token
and the Buzz bridge keys were blanked; `auth-guard.htpasswd` was rewritten with
a new password at mode 600. The tunnel went down at 06:49 that day
(Cloudflare 530, error 1033), the relay and the bridge stopped, logins gave
500 (nginx could not read the password file), and Twenty could not sign API
keys (`No encryption key matches keyId '99ed95a3'`).

Fixed: the tunnel token fetched from Cloudflare's API, cloudflared upgraded to
2026.10.3 (Cloudflare's eMudhra notice: every cloudflared at 2026.10.2 or
later), `auth-guard.htpasswd` made readable by the nginx group (640, group 101)
and given a new password, and the Oct 21 secrets restored from
`backups/listeningkit-twenty-20261021T211957Z/runtime.env` (the database
password kept as it is). Backups of every file touched end in
`.bak-20261026` or `.bak-20261027`. The bridge was started again on 2026-10-27 with a new Twenty key.

## Backups

`./backup.sh` writes `backups/listeningkit-twenty-<UTC time>/` with the
database dump, the file storage and the runtime env (secrets: move it
off-machine). The latest before the knowledge base: `20261027T030350Z`.

## Agency work moved from the legacy Twenty (2026-10-27)

node02's Twenty is now log-cli's Twenty. Everything for the agency work was
copied from the legacy Twenty (`twenty.inferencesaver.com`, Twenty v2.41 on
node01, workspace "Inference Saver"), which was left untouched:

- **Schema:** 28 objects, every field and 29 relations, through the metadata
  API (dropdown colours v2.49 no longer has were mapped to the nearest one).
- **Data:** copied table to table in Postgres with every record id kept, so
  every link holds: socialListenings 25,521, agencyProspects 1,255,
  prospects 794, influencers 678, competitors 249, notes 220 (and their 212
  links), tasks 397, people 176, agencyCalls 173, agencyPeople 159,
  socialAccounts 36 (logins included), and every other agency object.
- **Left behind:** dashboards, workflows, timeline history, the legacy
  workspace members (their links point to node02's member), file
  attachments, `serviceVerticals` and the link from prospects to it, and
  influencers' `claimedBy`. Three legacy people whose email was already on
  node02 kept node02's row.
- **Knowledge:** the 402 legacy `knowledgeEntries` are knowledge base
  articles (`legacyWiki:<name>`, kind note, tag legacyKnowledge).

log-cli reaches it with `LOG_TWENTY_BASE_URL` and `LOG_TWENTY_API_KEY` in its
`.env` (API key "log-cli"), which win over `TWENTY_BASE_URL` and
`TWENTY_API_KEY`: those stay on the legacy Twenty for blaster, whose
Windows `TWENTY_API_KEY` is the legacy key. The Buzz bridge has its own key
("Buzz Twenty bridge") and runs again (profile `bridge`).

Still writing to the legacy Twenty until they are moved: blaster (calls,
SMS, prospects), OpenMagpie's webhook into `socialListenings`, and anything
else holding the legacy key.

## Other tunnels on the account

`node01-api` (cloudflared 2026.6.1) and `convex-backend` (2026.7.3) still need
the 2026.10.2+ upgrade. The legacy Twenty, `twenty.inferencesaver.com` on node01, is the source the
agency work was copied from.
