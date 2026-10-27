# node02: ListeningKit's Twenty and the knowledge base

node02 is a Linux server on matt's tailnet (`node02.tail4fcf85.ts.net`,
100.84.226.128). SSH: `ssh root@100.84.226.128` (Tailscale SSH, which asks for a
check approval once). Everything runs as one Docker Compose stack in
`/home/deepman/services/listeningkit-twenty`, owned by `deepman`.

## Services

| Service | Image | What it does | Reached at |
| --- | --- | --- | --- |
| server, worker | `twentycrm/twenty:v2.49.0` | ListeningKit's Twenty (workspace "ListeningKit"), holds the knowledge base | `127.0.0.1:3000`; tailnet `https://node02.tail4fcf85.ts.net` (Tailscale Serve, no login gate); public `https://twenty.listeningkit.com` |
| postgres | `postgres:16-alpine` | Twenty's database | internal |
| redis | `redis:7-alpine` | Twenty's own cache and queues | internal |
| kb-redis | `redis:8.2.11` (search and JSON modules loaded) | The knowledge base search index (`kbIdx`) | `127.0.0.1:6380`; tailnet `node02.tail4fcf85.ts.net:6380` (Tailscale Serve TCP) |
| auth-guard | `nginx:1.27.5-alpine` | Basic Auth in front of Twenty for the public name | behind the tunnel |
| cloudflared | `cloudflare/cloudflared:2026.10.3` | Tunnel `listeningkit-node02` (6a03a4f1-27e0-40eb-ae42-500247e312ab) | `twenty.listeningkit.com`, `newsletter-relay.listeningkit.com` |
| newsletter-relay | `node:22-alpine` | Newsletter sign-up relay for the Vercel site | `newsletter-relay.listeningkit.com` (profile `relay`) |
| buzz-twenty-bridge | `node:22-trixie-slim` | Buzz `crm-sync` channel to Twenty | profile `bridge`, stopped since 2026-10-23 |

`cloudflared`, `newsletter-relay` and `buzz-twenty-bridge` sit behind compose
profiles, so a plain `docker compose up -d` does not start them. cloudflared
waits for newsletter-relay to be healthy; start it alone with
`docker compose --profile cloudflare up -d --no-deps cloudflared`.

## Where the logins are

Never in the repo, the knowledge base or chat. On matt's PC, in
`C:\Users\mande\.config\listeningkit\`:

- `twenty-basic-auth.txt`: the Basic Auth login for `twenty.listeningkit.com`
  (username `listeningkit`).
- `twenty-listeningkit-api-key.txt`: the API key `log kb` uses (workspace key
  "log-cli knowledge base").
- `kb-redis-url.txt`: the kb-redis URL with its password.
- `cloudflare-api-token.txt`: the Cloudflare API token (zones, DNS, tunnels).

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
`.bak-20261026` or `.bak-20261027`. The bridge is still stopped.

## Backups

`./backup.sh` writes `backups/listeningkit-twenty-<UTC time>/` with the
database dump, the file storage and the runtime env (secrets: move it
off-machine). The latest before the knowledge base: `20261027T030350Z`.

## Other tunnels on the account

`node01-api` (cloudflared 2026.6.1) and `convex-backend` (2026.7.3) still need
the 2026.10.2+ upgrade. log-cli's own Twenty is a different instance,
`twenty.inferencesaver.com` (the Facebook accounts and listings), not node02.
