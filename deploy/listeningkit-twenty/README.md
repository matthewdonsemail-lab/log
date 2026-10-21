# ListeningKit Twenty — portable local deployment

This bundle starts an isolated Twenty instance on an Ubuntu machine connected
to the existing tailnet and exposes the dashboard only through Tailscale Serve.
PostgreSQL and Redis are never published on the host network. It is currently
deployed on `node02`; the same bundle can be used in an Ubuntu VM if needed.

No customer records or credentials are included in this directory.

## Machine requirements

- Always-on Ubuntu 24.04 host or VM with sleep disabled
- 4 vCPUs, 8 GB RAM and at least 80 GB disk
- Docker Engine plus the Docker Compose v2 plugin inside the VM
- Tailscale installed and connected inside the VM
- Python 3, curl and openssl

Install Docker Engine directly in Ubuntu rather than running this stack in
Docker Desktop. If Ubuntu is virtualized, configure the VM to start automatically.

## Export the bundle on Windows

From PowerShell in this directory:

```powershell
./export-bundle.ps1
```

Copy the resulting ZIP to the Ubuntu VM and extract it, or clone this repository
inside the VM and use this directory directly.

## First boot

Inside the Ubuntu VM:

```bash
cd listeningkit-twenty
chmod +x *.sh *.py
./install.sh
```

The installer:

1. verifies RAM, disk, Docker and Tailscale;
2. derives the VM's Tailscale HTTPS address;
3. generates unique secrets in a mode-600 `.env` file;
4. starts pinned Twenty, PostgreSQL and Redis containers;
5. binds Twenty to localhost only; and
6. publishes the dashboard privately with Tailscale Serve.

It is safe to rerun. Existing secrets and volumes are retained.

Open the printed Tailscale URL, create the first workspace as **ListeningKit**,
then create an API key under **Settings → Developers → API**.

## Migrate newsletter members

Run:

```bash
./migrate-newsletter.sh
```

The script reads the old workspace key directly from node01 over Tailscale SSH,
prompts privately for the new key, creates the dedicated newsletter schema, and
streams the records into the new instance. It does not print email addresses or
create a plaintext export file. Re-running it is idempotent by normalized email.

The new schema includes email, first name, Clerk user ID, source, consent time,
subscription status and unsubscribe time. Legacy rows are marked active based on
the confirmed signup consent; an unknown historical consent timestamp is not
invented.

## Verify

```bash
./doctor.sh
```

Then open **Newsletter Members** in Twenty and verify the count. Do not repoint
production until the source and target counts agree.

## Backup

```bash
./backup.sh
```

The backup includes PostgreSQL, uploaded files and runtime secrets. It contains
customer data and must be moved to encrypted off-machine storage. A backup left
only on the Windows machine is not disaster recovery.

## Cloudflare custom domains and newsletter relay

The Vercel newsletter function cannot directly access a Tailscale-only service.
The production deployment therefore mirrors the InferenceSaver boundary with a
dedicated Cloudflare Tunnel:

- `twenty.listeningkit.com` reaches nginx Basic Auth before Twenty;
- `newsletter-relay.listeningkit.com` reaches only the newsletter relay; and
- Tailscale Serve remains a private recovery path.

The relay runs as a read-only unprivileged container, accepts only
`POST /v1/newsletter/subscribe`, requires a separate bearer token, limits request
size and rate, validates input, and returns no Twenty data. PostgreSQL, Redis and
the direct Twenty container port are not published through Cloudflare.

`configure_cloudflare.py` creates the named tunnel and two proxied DNS records
using a short-lived, zone-restricted Cloudflare API token. Store the returned
connector token only in the mode-600 `.env`. Keep `auth-guard.htpasswd` out of
Git and restrict it to the nginx container user.

Configure Vercel with
`https://newsletter-relay.listeningkit.com/v1/newsletter/subscribe` and the relay
token only after an unauthorized request is rejected and an authenticated test
upsert appears in **Newsletter Members**. Never configure Vercel with the private
Twenty API key. Keep the old integration active until that end-to-end
verification succeeds.

## Curated Buzz ↔ Twenty bridge

The optional bridge exchanges explicitly selected information between the private
Buzz `crm-sync` channel and Twenty's **Buzz Updates** object. It never scans DMs,
other channels, or messages older than its installation timestamp.

The boundary is deliberately narrow:

- a Buzz message must contain a cryptographically bound mention of the dedicated
  **Twenty CRM Bridge** identity;
- the command format is
  `@Twenty CRM Bridge save <category> | <title> | <details> [| Twenty URL]`;
- accepted categories are `decision`, `customer note`, `follow-up`, `incident`,
  and `other`;
- credential-shaped content is rejected;
- Buzz event IDs provide idempotency, while `SENDING` states prevent duplicate
  publication after a crash; and
- logs and the local cursor contain no message or customer content.

For Twenty → Buzz, create a **Buzz Update** with direction
`TWENTY_TO_BUZZ` and sync status `PENDING`. The bridge first fences it as
`SENDING`, publishes it into `crm-sync`, then marks it `SYNCED`. A failed or
ambiguous delivery is marked `FAILED` instead of being retried blindly.

Provisioning requires an owner-reviewed dedicated Buzz identity and a separate
Twenty API key named **Buzz Bridge**. After both exist, run:

```bash
chmod +x install-buzz-bridge.sh
./install-buzz-bridge.sh
```

The installer downloads the pinned official Buzz Linux package, verifies its
SHA-256 digest, extracts only `buzz-cli`, creates the custom Twenty schema,
stores credentials only in the mode-600 `.env`, and starts the unprivileged
`bridge` Compose profile. The slim runtime receives node02's system CA bundle
through a read-only mount. `bridge-data/` stores only a bounded cursor and event
IDs and is gitignored.

Verify with `./doctor.sh`, then issue `@Twenty CRM Bridge help` in `crm-sync`.
Do not paste credentials into Buzz; historical channels are not a secret store.

## Legacy Facebook account migration

`migrate_facebook_accounts.py` creates the **Facebook Accounts** object and
upserts only allowlisted operational metadata. It deliberately rejects cookies,
passwords, access tokens, TOTP secrets, proxy details, IP addresses and email
credentials. The source and target modes are designed to be joined through an
SSH pipe so no plaintext export file is created.

`migrate_facebook_access.py` is the separate credential handoff. Its target mode
encrypts each account independently with AES-256-GCM before atomically writing
`facebook-vault/accounts.json`; the vault directory is mode 700, the file is
mode 600, and both are gitignored. Twenty stores only whether the encrypted
login has migrated, never the secret values or proxy configuration. Keep the
vault key only in the mode-600 `.env`, back it up separately, and do not start a
Facebook runtime until it can consume this vault while preserving owner scope
and the mandatory deployment proxy boundary.

## Operations

```bash
docker compose ps
docker compose logs --tail=100 server worker
docker compose pull
docker compose up -d
```

Never commit `.env`, migration keys, or anything under `backups/`. Pin and review
a new Twenty image version before changing `TWENTY_IMAGE`.
