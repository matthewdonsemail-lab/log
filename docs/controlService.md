# Control service

The hosted control service for log: email sign-in codes, website sessions and teams. It is slice B of the [handoff](proposals/listeningKitHandoff.md), built against [schema v2](proposals/listeningKitSchema.yaml). It holds identity and team authorization only. Accounts, messages, cookies and tool results stay in each workspace's own `log.db`.

Code: `python/controlService/`. FastAPI + SQLModel on PostgreSQL, migrations by Alembic in `python/controlService/migrations/versions/`.

## Run it

```bash
pip install -r python/controlService/requirements.txt
MIGRATION_DATABASE_URL=postgresql://... alembic -c python/controlService/migrations/alembic.ini upgrade head
uvicorn controlService.main:app --app-dir python --host 0.0.0.0 --port $PORT
```

Migrations run once, as their own step, with `MIGRATION_DATABASE_URL`. The service itself never creates tables.

| Variable | What it is |
| --- | --- |
| `APP_ORIGIN` | The one public origin, `https://app.log.listeningkit.com`. Cookies are `Secure` when it is https; state-changing calls from any other `Origin` are refused. |
| `DATABASE_URL` | The service's own PostgreSQL login (`postgres://` and `postgresql://` both work). |
| `MIGRATION_DATABASE_URL` | The login that owns the schema, used only by Alembic. |
| `SESSION_SECRET` | Signs the CSRF token tied to each session. |
| `OTP_PEPPER` | Keys the stored sign-in code verifiers, so a database copy can't check codes. |
| `RESEND_API_KEY`, `AUTH_EMAIL_FROM`, `AUTH_EMAIL_REPLY_TO` | Resend, for sign-in codes and invites. Without them a code can't be sent and `/auth/email/start` answers `deliveryFailed`. |

## Routes

All under `/api/v1`, camelCase JSON, `Cache-Control: no-store`. Errors are `ErrorView`: `{ code, requestId, retryAfterSeconds?, safeMessage? }`.

| Route | Who | What |
| --- | --- | --- |
| `POST /auth/email/start` `{ email, returnPath? }` | anyone | Sends a 6-digit code. Same answer whether the address is known. 30 s between codes, at most 5 in 15 minutes (`tooManyAttempts` with `retryAfterSeconds`). |
| `POST /auth/email/verify` `{ challengeId, code }` | anyone | 5 tries per code, 10 minutes, used once. Creates or resumes the user and sets the `logSession` (HttpOnly) and `logCsrf` cookies. Answers `SessionView`; a safe return path comes back in `X-Return-Path`. |
| `GET /session` | signed in | `SessionView`: user, active teams with role, selected team. |
| `POST /auth/logout` | signed in | Revokes this session and clears both cookies. |
| `POST /teams` `{ name, slug }` | verified | Creates the team and its owner membership in one transaction. A taken slug is `conflict`. |
| `POST /session/team` `{ teamId }` | member | Selects the website's team. It never retargets an MCP grant. |
| `GET /teams/{teamId}/members` | member | `MemberView[]`. |
| `PATCH /teams/{teamId}/members/{membershipId}` `{ role?, status? }` | owner, admin | Only an owner touches owners. The last active owner can't be demoted or revoked (`lastOwnerRequired`). |
| `POST /teams/{teamId}/invites` `{ email, role }` | owner, admin | Emails a 7-day link to `/teams?invite=<token>`. Roles: admin or member. |
| `POST /teams/{teamId}/invites/{inviteId}/revoke` | owner, admin | Withdraws a pending invite. |
| `POST /invites/accept` `{ token }` | verified, invited address | Joins once. A used, withdrawn or expired link is `inviteExpired`; another address is `inviteWrongEmail`. |
| `GET /healthz` | anyone | Checks the database answers. |

Every state-changing call from a signed-in browser sends the `logCsrf` cookie's value back in the `x-csrf-token` header. Every team route checks current active membership; a team id in the path or body grants nothing by itself. Revoking a membership removes access on the next call.

## Not built yet

Workspaces, pairing, the runtime bridge, operations, MCP OAuth grants and the console's account view (slices C and D), and native account storage (slice A). Usage, analytics and subscription answer nothing until their data exists.
