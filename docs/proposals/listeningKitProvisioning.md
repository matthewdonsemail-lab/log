# ListeningKit provisioning runbook

11 November 2026. What to create, in order, to stand up the hosted ListeningKit login and control service for issue #112 and PR #113.

Authority: rule 171 (Treg-shaped PostgreSQL backend for identity and teams), rule 172 (the workspace's own database owns private social data; the centre holds identity, team authorization and routing metadata only), rule 173 (respect the excluded provider; follow Treg's documented deployment example), `listeningKitNativeData.md` (the storage boundary).

Status: implementation/provisioning handoff, 11 November 2026. Follow [the implementation assignment](listeningKitHandoff.md) and [schema v2](listeningKitSchema.md). No production-ready control service is claimed by this document.

## Reported setup state to verify before deployment

Earlier setup work reported a disposable free Render control database and an incomplete ListeningKit-owned Resend signup. These are historical reports, not a fresh availability check. Verify resource ownership, region, expiry, current billing and email-domain verification through the owner's authorized account before using them. A free database with a limited lifetime cannot become durable production storage implicitly.

Connection strings and signup credentials remain in the owner's private secret storage. Obtain secret references through an authorized handoff; never put values in the PR. Do not use another business's email workspace. Check the current authoritative DNS zone for each exact hostname before writing records; the application hostname and sending subdomain use different parent domains. Preserve existing inbound email records.

Outstanding work: implement the control/gateway/runtime contracts, finish the product-owned email account and verified sending domain, install application secrets, attach the public hostname, run migrations and deploy explicitly. The source branch does not implement these services yet.

## 1. What is already settled

| Decision | Value | Source |
| --- | --- | --- |
| Authentication | Our own Treg-shaped service: FastAPI + SQLModel/SQLAlchemy + PostgreSQL, email-code (OTP) sign-in | rule 171, `listeningKitTregArchitecture.md` |
| Sign-in methods now | Email code only | Treg `application/auth.py` |
| Google OAuth | **Not needed.** `matt@trylisteningkit.com` receives the code; no Google Cloud project or consent screen | Treg email auth |
| Clerk, Convex, Supabase Auth, Better Auth, Auth.js | Not used | rule 171 supersedes the Clerk/Convex proposal |
| ChatGPT sign-in | Future integration, pending OpenAI partner access | `listeningKitInterimAuth.md` |
| MCP client consent | Separate OAuth flow inside our own service | Treg `domain/identity/mcp_oauth.py` |
| Central database | PostgreSQL, control data only | rule 172 |
| Per-team data | Workspace-local SQLite `log.db` plus private files | rule 172 |
| Twenty | Removed from the target architecture | rule 171 |

## 2. What is not settled, and the pick

| Gap | Pick | Why |
| --- | --- | --- |
| Hosting | **Render**, per Treg's documented blueprint | rule 173. Treg's `deploy/render.example.yaml` is a complete blueprint: a Render PostgreSQL instance plus a Python web service with a pre-deploy migration command and a health check. Treg states its real production topology lives in the private `treg-internal` repo, so the public file is a documented example, not a verified production configuration. |
| Database | **Render PostgreSQL**, same region as the services | Same blueprint (`databases: registry-db`, `plan: basic-256mb`). |
| Email | **Resend**, sending subdomain `auth.trylisteningkit.com` | Only vendor in the proposal set with a sending-only API key and DNS-verified sending domain. |
| Public origin | `https://app.log.listeningkit.com` | One origin keeps cookies, CORS and MCP resource metadata on one host. |

These are the selected staging implementation defaults. The control service is not deployed by this documentation change; previously reported database setup still needs verification.

## 3. Render shape

Follow `deploy/render.example.yaml` from the Treg revision pinned in `listeningKitNativeData.md` (`3149cb1a23f6a0ce2d6ffab403f79f58855d3856`). Its structure, not its names:

- `databases:` one PostgreSQL, `plan: basic-256mb`, region `oregon`.
- `services:` one Python web service, `plan: starter`, `preDeployCommand` running the migration, `healthCheckPath` for readiness.
- `envVars`: the database URL pulled `fromDatabase`, then `sync: false` entries for every secret so no value is committed.

Adapted to ListeningKit's four services from the PR #113 scope:

| Service | Type | Function |
| --- | --- | --- |
| `web` | public web | Built console; routes `/api`, `/mcp`, `/bridge` |
| `control` | private | FastAPI authentication and control service |
| `gateway` | private | TypeScript MCP gateway and outbound WSS bridge |
| `control-db` | PostgreSQL | Identity, teams, sessions, MCP grants, provider connections, routing metadata |

Start with one gateway replica. More replicas need the distributed connection routing described in `listeningKitHostedMcp.md`.

## 4. Secrets and configuration

Names are the integration contract. Setting a variable does not make the current code read it; the control service must wire each one.

```text
APP_ORIGIN=https://app.log.listeningkit.com
CONSOLE_ORIGIN=https://app.log.listeningkit.com
MCP_RESOURCE_URL=https://app.log.listeningkit.com/mcp
BRIDGE_PUBLIC_URL=wss://app.log.listeningkit.com/bridge

MIGRATION_DATABASE_URL   schema-migration authority (Render's owner connection)
DATABASE_URL             restricted application role, created during bootstrap

SESSION_SECRET
OTP_PEPPER
DISPATCH_SIGNING_KEY
CONTROL_SECRET_ENCRYPTION_KEY
CONTROL_GATEWAY_SECRET

RESEND_API_KEY
AUTH_EMAIL_FROM=ListeningKit <signin@auth.trylisteningkit.com>
AUTH_EMAIL_REPLY_TO=matt@trylisteningkit.com

LOG_DB=<persistent private directory>/log.db   (runtime side, already supported)
```

SESSION_SECRET signs website-session material; OTP_PEPPER protects email-code verifiers; CONTROL_SECRET_ENCRYPTION_KEY encrypts the accepted provider connection; CONTROL_GATEWAY_SECRET authenticates control/gateway traffic; DISPATCH_SIGNING_KEY signs scoped runtime dispatch authority. The runtime pins the corresponding public key. Keep these purposes separate.

Runtime bootstrap also requires a protected paired credential and a separately recoverable workspace encryption key; their storage contracts are in the YAML.

Generate each secret independently. Never reuse a database password as an application secret.

## 5. Order

| # | Step | Output |
| --- | --- | --- |
| 1 | Create the Render workspace, a `listeningkit` project and a `staging` environment | workspace, project, environment ids; region; billing state |
| 2 | Add Render PostgreSQL in that environment | `MIGRATION_DATABASE_URL` in the secret store; database id, internal host |
| 3 | Create the Resend sending domain `auth.trylisteningkit.com` and add its generated DNS records | verification status; `RESEND_API_KEY` (sending-only, restricted to that subdomain) |
| 4 | Attach `app.log.listeningkit.com` to `web` | Render's generated CNAME and verification TXT values; TLS status |
| 5 | Generate the five independent control secrets | secret references |
| 6 | **Implement the control service**: FastAPI + SQLModel, Alembic migrations, OTP, teams, MCP consent, gateway, bootstrap | commit SHA, entrypoints, Dockerfiles, configuration contract |
| 7 | Run the first migration with migration authority; create the restricted `DATABASE_URL` role | migration revision; `DATABASE_URL` reference |
| 8 | Deploy `control`, `gateway`, `web`; attach the domain | deployment ids, private addresses, public-domain and TLS status |
| 9 | Sign in as Matt by email code; explicitly create or join his team | sign-in and team-creation confirmation |
| 10 | Pair one existing cloud workspace, or explicitly create a Boat sandbox | workspace reference, runtime build, persistent path, pairing status |
| 11 | Complete MCP client consent for that team | connected client and one authorized runtime response |

Step 6 is the blocker. Steps 1 to 5 prepare resources that nothing can serve yet, and steps 7 to 11 cannot run without it.

Do not create a Boat sandbox just to tick step 10. An existing suitable cloud workspace is the first runtime.

## 6. What only Matt can do

- Sign into or authorise Render, Resend and the DNS provider.
- Approve billing or a payment card.
- Receive his first login code and complete the first sign-in.
- Approve the MCP consent screen for his team.
- Supply or authorise the Boat connection if that compute path is chosen.
- Complete platform account sign-ins or challenges inside the workspace.

No Google consent screen is needed.

The useful handoff back is resource identifiers, DNS status, deployment status and secret references. No raw credential belongs in chat or in the repository.

## 7. Migrations

The control service owns its schema, under new paths:

```text
python/controlService/alembic.ini
python/controlService/migrations/
python/controlService/migrations/versions/
```

Run them from Render's pre-deploy command, once per deploy, never from each web worker at start-up.

The runtime SQLite schema stays separate and stays where it is, under `src/storage/schema/`.
