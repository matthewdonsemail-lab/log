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
| `CONSOLE_ORIGIN` | The frontend origin when it is hosted separately, for example `https://log.listeningkit.com`. OAuth consent and invite links open here, and same-origin frontend proxy requests carrying this `Origin` are accepted. Defaults to `APP_ORIGIN`. |
| `DATABASE_URL` | The service's own PostgreSQL login (`postgres://` and `postgresql://` both work). |
| `MIGRATION_DATABASE_URL` | The login that owns the schema, used only by Alembic. |
| `SESSION_SECRET` | Signs the CSRF token tied to each session. |
| `DISPATCH_SIGNING_KEY` | Ed25519 seed, 32 bytes as base64 (`openssl rand -base64 32`). Signs every dispatch; runtimes pin its public key from `GET /runtime/dispatchKey`. Kept apart from runtime credentials. |
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
| `GET /teams/{teamId}/workspaces` | member | `WorkspaceView[]`. `ready` only while its runtime is connected now; otherwise `offline`. |
| `POST /teams/{teamId}/workspaces` `{ provider }` | owner, admin | `ownCloud` only for now; `boat` answers `providerUnavailable`. The team's first workspace is selected. |
| `POST /teams/{teamId}/workspaceSelection` `{ workspaceId, expectedGeneration }` | owner, admin | Switches the team's one active workspace. A stale `expectedGeneration` is `conflict`. |
| `POST /teams/{teamId}/workspaces/{workspaceId}/pairings` `{ challengeHash }` | owner, admin | A one-time pairing token, 10 minutes, shown once. `challengeHash` is sha256 hex of a proof only the runtime holds. A new pairing withdraws older unused ones. |
| `POST /teams/{teamId}/workspaces/{workspaceId}/revoke` | owner, admin | Revokes the workspace, its credentials and pairings, and drops its bridge. |
| `POST /runtime/pair` `{ pairingToken, challengeProof, installationId }` | the runtime | Consumes the token once and returns the runtime credential (`RuntimeCredentialView`, shown once, 90 days). Older credentials are revoked. |
| `GET /runtime/dispatchKey` | anyone | The dispatch public key, protocol version and bridge URL. |
| `WSS /bridge` (also `/api/v1/runtime/bridge`) | the runtime | The outbound connection, below. |
| `POST /teams/{teamId}/operations` `{ operationId, tool, args }` | member | Sends a registered read tool to the selected workspace and waits up to 25 s for its result. Live write tools answer `approvalRequired` until approvals exist. The same `operationId` again reconciles and never dispatches twice; with another tool it is `idempotencyConflict`. |
| `GET /teams/{teamId}/operations/{operationId}` | its actor, owner | Asks the runtime's journal. Offline: the stored state plus `workspaceOffline`. |
| `POST /teams/{teamId}/operations/{operationId}/cancel` | its actor, owner | Asks the runtime to stop at a safe point. It is not proof nothing happened. |
| `GET /teams/{teamId}/accounts` | member | Runs `accountsList` on the workspace: `{ accounts, cursor }`. |

Every state-changing call from a signed-in browser sends the `logCsrf` cookie's value back in the `x-csrf-token` header. Every team route checks current active membership; a team id in the path or body grants nothing by itself. Revoking a membership removes access on the next call.

## Connecting an AI client (MCP)

`https://app.log.listeningkit.com/mcp` is the one MCP address for Claude, ChatGPT, Cursor, Codex and Hermes. A client finds everything from a 401.

1. **Discovery.** `POST /mcp` without a token answers 401 with `WWW-Authenticate: Bearer resource_metadata=".../.well-known/oauth-protected-resource"`. That document names this origin as the authorization server, and `/.well-known/oauth-authorization-server` lists the endpoints. Only `code` with PKCE S256 is supported, for public clients.
2. **Registration.** `POST /oauth/register` (dynamic client registration) takes `redirect_uris`: https, loopback http (any port matches), or an app's own scheme (`cursor://`, `vscode://`, reverse-DNS). It allows 30 a hour per address.
3. **Authorize.** `GET /oauth/authorize` checks the client, the exact redirect, `code_challenge_method=S256`, `resource` (this MCP only) and `scope` (`log:read`, `log:write`; default `log:read`). It then sends the person to **`/console/mcp?request=<id>`** (the frontend). A bad client or redirect is never redirected to.
4. **Consent, on the frontend's `/console/mcp`:**
   - `GET /api/v1/oauth/requests/{id}` (signed in) returns `{ clientName, redirectHost, scopes, resource, expiresAt, teams, selectedTeamId }`.
   - `POST /api/v1/oauth/requests/{id}/approve` `{ teamId }` (CSRF) returns `{ redirectTo }`. Send the browser there; it carries the code and the client's `state`.
   - `POST .../deny` returns `{ redirectTo }` with `access_denied`.
   - A request lasts 10 minutes and works once. Not signed in yet: send them to `/sign-in` with `returnPath=/console/mcp?request=<id>`.
5. **Token.** `POST /oauth/token` handles `authorization_code` (60 s, once, PKCE checked; a reused code revokes its grant) and `refresh_token`. A refresh rotates the token, never widens scope, and is bound to the team it was issued for. Reusing an old refresh token revokes its whole family and the access tokens. Access tokens are opaque and last 1 hour; refresh tokens last 30 days. `POST /oauth/revoke` revokes a token.
6. **Calls.** `POST /mcp` (JSON-RPC, JSON answers) supports `initialize`, `ping`, `tools/list` and `tools/call`.
   - Every call rechecks the token, the grant and current team membership. Removing someone, or revoking the grant, cuts them off on the next call.
   - `tools/list` comes from the connected workspace's real log tools, limited to the registered read tools, plus `accountsList`. Offline, it is the same names with short descriptions.
   - `tools/call` runs through the same dispatcher as the console, with the grant in its signed authority. Write tools stay refused until approvals exist.
7. **Grants.** `GET /api/v1/teams/{teamId}/grants` lists them (owners and admins see all, members their own). `POST /api/v1/teams/{teamId}/grants/{grantId}/revoke` revokes one with its tokens.

A grant belongs to the one team picked at consent. Switching team on the website never moves it; connect again to use another team.

## The bridge

The runtime opens the connection; nothing listens inside the workspace.

1. Connect to `wss://<origin>/bridge` with `Authorization: Bearer <runtime credential>`.
2. Send `BridgeHello`: `{ workspaceId, installationId, protocolVersion: 1, runtimeVersion, schemaVersion, capabilities }`. Both ids must match the pairing. Only the `capabilitySummary` fields are kept. Another protocol marks the workspace `incompatible` (close 4426).
3. The service answers with a `heartbeat` envelope carrying the lease's `routeGeneration`, `leaseSeconds` (60) and `heartbeatSeconds` (20). A newer connection from the same workspace fences this one (close 4409).
4. Every envelope is `{ protocolVersion, kind, workspaceId, routeGeneration, operationId?, sequence?, authority?, payload }`, at most 8 MB. A wrong `routeGeneration` closes the connection.
   - The service sends `dispatch` (payload `{ tool, args }` plus a signed `authority`), `reconcile` and `cancel`.
   - The runtime sends `heartbeat` every 20 s, `accepted`, `progress` and `result`. The `result` payload is `{ state, result?, error?, progressCursor? }`.
5. Before acting on `dispatch`, the runtime checks:
   - The `authority` signature against the pinned dispatch key, over the canonical JSON (sorted keys, no spaces) of every field but `signature`.
   - `expiresAt` hasn't passed.
   - `routeGeneration` is its own.
   - `requestHash` is sha256 of `{"args":…,"tool":…}`.

   It journals the operation id before any effect, and answers `reconcile` from that journal. The control service stores only the operation's id, tool, state and cursor, never its arguments or result.

## The runtime side: `log runtime`

Run in the workspace, never on the control service:

1. `log runtime init --origin https://app.log.listeningkit.com` makes the private proof and prints the challenge hash.
2. The console creates the pairing with that hash and shows a one-time token. `log runtime pair --token <t>` redeems it. The credential, the pinned dispatch key and the installation id go to `~/.logCli/runtime/binding.json` (`LOG_RUNTIME_DIR` moves it). It is owner-only on Linux; on Windows the folder's own permissions apply.
3. `log runtime connect` keeps the bridge open and reconnects on its own (1, 2, 5, 10, 30 s). It stops for good on a revoked credential or workspace, or another protocol.

Each dispatch is checked (signature, workspace, generation, expiry, request hash), journalled in `log.db`'s `operations` table (migration 18) before it runs, then run through the same handler as the log MCP tools. `accountsList` answers from the workspace's local accounts, with safe fields only. A repeat of the same operation id answers from the journal and never runs again. After a restart, a read left unfinished is marked `failed` and a write `unknown`, never replayed.

## Not built yet

- Live-write approvals (`liveApprovals`, the approval route) and the device flow for remote CLIs (slice D).
- Boat (slice E) and native account storage (slice A).
- Usage, analytics and subscription answer nothing until their data exists.
- One replica only: live connections are held in memory.
