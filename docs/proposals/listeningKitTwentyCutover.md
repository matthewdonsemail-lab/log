> Implementation reading order: [handoff and acceptance criteria](listeningKitHandoff.md), then [schema v2](listeningKitSchema.md). Those define native V1 scope and supersede broader legacy inventories or earlier field names in this companion. Deferred listings/CRM and future AI-provider identity are outside V1.

# Application cutover from Twenty

## Current scope correction — 11 November 2026

The native V1 follows [the corrected SQLite-first schema](listeningKitSchema.md). Existing `log.db` events, identities, chats/messages, media, jobs and queues are the foundation. Generated Twenty objects, agency prefixes and CRM/SMS fields do not define the new model. Old listing/campaign functionality is deferred. Broad legacy-domain inventories below are dependency history, not requirements to port those domains into V1. Only active account configuration/session adapters and missing hosted execution contracts belong in this cutover.


11 November 2026. Audit of the current checkout for PR #113. This specifies implementation work; it does not claim the migration or hosted authentication is built.

## Decision and scope

Rules 171/172 govern data ownership. The hosted FastAPI/SQLModel/PostgreSQL control service holds identity, teams, authorization and minimal workspace routing/recovery metadata. Each selected persistent cloud workspace owns private platform accounts, credentials, messages, listings and execution data. DDIA and the existing `.logCli` storage model govern private persistence. Treg is the hosted control reference. Email OTP is the accepted website login method. AdsPower remains the default, with the two connection modes in `listeningKitAdsPower.md`.

The application needs a coordinated cutover across its website, control service, CLI, MCP, workspace runtime, documentation and generated integrations. Removing a website integration alone cannot complete it.

## Findings backed by current code

Paths refer to the inspected checkout; they locate current dependencies, not completed replacements.

| Area | Evidence | Required target change |
| --- | --- | --- |
| Website entry | `site/apps/web/src/App.tsx:40` explicitly deprecates onboarding, sign-in and dashboard routes; old URLs redirect to `/`. `site/apps/web/src/main.tsx:7` says the provider is gone. | Build actual auth, team and workspace routes; handle old entry URLs intentionally. |
| Default command execution | `src/cli/runner/client.ts:29` constructs `withLocalAccounts(createTwentyClient())`; `src/cli/runner/types.ts` requires `TwentyClient`. | Inject native workspace repositories into the command context. New installations must boot without Twenty credentials or network access. |
| Partial local storage | `src/twenty/graphql/helpers/localAccounts.ts:73` delegates every non-account object remotely, even in local-only mode. | Provide all required native domain repositories. Local accounts alone are insufficient. |
| Domain types | `src/twenty/graphql/types.ts` imports generated account/listing/conversation/message/group/post/comment types. | Own domain types independently of the legacy API and map old records at import boundaries. Inventory additional domains such as campaigns rather than assume this interface covers them. |
| CLI identity | `src/auth/session/types.ts` defaults both API and web URLs to the old Blaster service. `src/cli/auth/index.ts` uses `twentyReady` and the old handoff. | Give hosted Log its own CLI authorization flow, issuer/audience and team selection. Keep platform sign-in separate. |
| Loopback handoff | `src/auth/exchange/client.ts` receives access/refresh tokens from a browser into loopback. | Define a deliberate new CLI flow. Recommended: device authorization for remote runtimes; browser code + PKCE where loopback is supported. Do not silently repurpose the old token exchange. |
| MCP authorization | `src/mcp/oauth/client.ts:43,150,194` discovers Twenty OAuth and limits access to the server's single owner. | Replace owner equality with authenticated user, current team membership, client grant and selected workspace route. |
| MCP execution/resources | `src/mcp/server/index.ts:353` authorizes as a boolean; line301 serves the repository's personal AGENTS file. | Carry a scoped authorization context into routing and dispatch. Serve product instructions and permitted workspace resources; audit personal rules/memories before exposing anything to another team. |
| Knowledge base | `src/knowledge/base/client.ts:18` and `types.ts:12` use a separate Twenty service/key file. | Store private KB content in the workspace; public docs can ship with Log. Give search indexes explicit source ownership and rebuild paths. |
| New platform generation | `src/scaffold/platform/helpers/templates.ts:7,19,31,87,93` emits `TwentyClient` and `context.twenty`. | Change scaffolding and generated contracts so new platforms use native repositories. |
| Bypass paths | `scripts/directApi/liveRead.ts`, `scripts/fbk/tryAccount.ts`, `scripts/media/personaPictures.ts` construct the legacy client directly. | Migrate active scripts or mark them explicit legacy-only utilities; prevent them entering hosted startup. |
| Configuration/packages | `.env.example:5,14,52` documents old auth, remote storage and account fallback. `package.json:83,84,110` includes client generation and SDK. | Split native defaults from explicit import configuration. Remove generation/SDK only after ordinary runtime consumers have moved. Audit hooks and CI requirements that regenerate or require legacy fields. |
| Instructions and deployment | `src/mcp/server/helpers/agentRules.ts`, `guides.ts`, `toolsFromCommands.ts`, and `docs/deployment.md` teach the deprecated flow. | Update tools, guides, bootstrap and active deployment docs together. Preserve dated historical records and other products' descriptions. |
| Website copy | `site/apps/web/src/landing/LandingPage.tsx`, `site/apps/web/src/landing/Header.tsx`, `site/apps/web/src/landing/PlatformSuite.tsx` describe Twenty holding Log accounts. | Describe the actual target data boundary and available onboarding; do not advertise a working hosted flow before it exists. |

A search found 158 files mentioning Twenty under `src`, `python` and `scripts` after excluding generated/vendor/test paths. That is a text inventory, not a count of proven runtime dependencies. Classify each as active, explicit importer, historical/reference, or unrelated product before editing.

## Actual sign-up/sign-in journey

The following are proposed route contracts for implementation, not routes present today:

1. `/sign-in`: enter email and request an OTP. Use one neutral response whether the address already exists; rate-limit requests and verification attempts. OTPs expire, are stored as non-reversible verifiers, are consumed once and are superseded according to an explicit resend policy. Do not log codes.
2. `/verify`: verify the challenge. Create a user only after verified email, or resume the existing user. Sign-up is the first verified sign-in; do not create a second identity when that person accepts an invite later. Issue the secure website session. Email sending stays on the control service through the accepted Resend integration.
3. `/teams`: show existing memberships. Create a team, accept a valid invite for the verified address, or select an existing team. An arbitrary typed team id grants no membership. Invitation expiry, revocation, already-used links and the wrong signed-in address each need explicit states. Never silently merge two existing identities on an email change.
4. `/workspaces`: attach the team's selected persistent environment, either its supported existing runtime or Boat. One active selected workspace per team in V1. Show pending, connected, offline, incompatible and revoked states. Retain team access when the runtime is offline; setup must be resumable without creating duplicate workspaces.
5. Pair the runtime with a short-lived single-use Log token. Bind the exchange to the intended team/workspace and replace it with revocable runtime authority. The runtime opens the outbound authenticated bridge. Do not give an AI client a provider-wide compute key or AdsPower management key.
6. Connect AdsPower using the accepted provided or user-owned mode. Record where the browser/profile actually lives; a brokered remote profile does not move its browser files into the user's workspace. Check browser and persistent-storage capabilities before declaring readiness.
7. `/mcp`: show the connector endpoint, authenticated client/team/workspace, permissions, connection status and revoke action. An MCP authorization request preserves its validated return context across email verification and team selection, then obtains explicit consent. Do not follow an arbitrary return URL supplied by a page query.
8. Logout revokes the relevant website session. Separate controls revoke a client grant, its refresh family or a runtime credential. Removing a membership stops new access and invalidates or rechecks existing authorization; a cached MCP session must not retain the removed member's access. Team deletion, last-owner departure and workspace disconnect need explicit ownership and retention handling.

Website sessions, CLI authorization, MCP grants, runtime pairing/bridge credentials, Boat credentials and platform cookies each have their own purpose and revocation boundary. Never upgrade a legacy Twenty token into hosted team authority. Existing users authenticate afresh; import mappings connect private records separately.

## Private data cutover contract

- Inventory all private stores: SQLite, local account JSON, platform session state, browser-managed profiles, job/queue files, captures, attachments, search/voice/KB indexes, provider credentials and environment/configuration files. `.logCli` alone is not proof every browser file is included.
- Add the missing credential/settings and domain repositories beside the existing SQLite event/projection model. Existing SQLite `accounts` is an identity mapping, not a complete account store. Preserve upstream ids, local stable ids, relationships, timestamps and statuses through explicit old-id to new-id mappings.
- Keep sessions and refreshed cookies bound to the correct workspace/account. Reads, secret retrieval and cookie refresh writes must all use the native repository; checking only account-list reads misses the write path.
- Give every platform command, Python engine boundary, direct script, watch, scheduled job and browser lifecycle the selected workspace's paths and repositories. Do not fall back to Matt's home directory, keys or remote account store when configuration is missing.
- Preserve leases and per-account serialization across reconnect/restart. A route change cannot leave two runtimes controlling the same account/profile. Unknown write outcomes retain their operation identity and reconcile against evidence before another attempt.
- Migration is explicit and resumable: snapshot/export, map and import, compare counts/relationships and required secret/profile presence without printing values, switch the writer, then reopen execution. Keep import checkpoints private to the workspace. The central service receives readiness/minimal routing metadata, not imported social records.
- Use a maintenance window for initial V1 cutover: stop relevant writers, watches and browser actions before the final snapshot; enable the new writer only after acceptance. Do not maintain two competing writable authorities. A rollback must account for any new native writes before returning to the old store.
- Retain legacy source records. Old credentials/configuration are removed from active startup after cutover, with explicit handling of retained exports/backups. Deleting a team or uninstalling software is not implicit authorization to erase private workspace records.

## Ordered implementation slices

| Order | Concrete deliverable | Completion evidence required before calling it done |
| --- | --- | --- |
| 1 | Inventory active repositories, credential readers/writers, direct scripts, boot paths, env, hooks and docs; native domain types and migration mapping. | Each live dependency has a replacement owner; retained importers are explicitly isolated. |
| 2 | Native private repositories and importer using existing storage migrations. | An installation can execute required account/domain operations with no Twenty configuration; imported relations and refreshed sessions persist. |
| 3 | Hosted identity/team schema and transactional migrations, email OTP, invites, sessions and authorization. | New and returning users reach the same identity; expired/reused codes and unauthorized team access have defined rejection paths. |
| 4 | Real sign-in/team/workspace routes and accepted cloud/AdsPower setup. | A new user can complete onboarding and resume an interrupted setup without duplicate identity/team/workspace creation. |
| 5 | Team-scoped MCP OAuth, runtime pairing, outbound bridge, permission checks and request routing. | Only current authorized membership/grants reach the selected team workspace; offline and revoked states are explicit. |
| 6 | CLI authorization, background jobs/watches and all platform dispatch paths. | No default remote legacy lookup; runtime reconnect and ambiguous writes preserve safe execution semantics. |
| 7 | Replace active tool instructions, scaffolding, configuration, deployment docs, website copy and legacy-dependent build gates. | Generated integrations and a clean native install do not recreate the old dependency. |
| 8 | Migration rehearsal/acceptance, then the controlled writer switch and retained recovery snapshot. | Data relationships, browser/profile location, backup recovery and revocation boundaries are demonstrated before production cutover. |

These are future implementation acceptance requirements. No tests or migration runs were performed for this audit.

## Release boundary

A login page alone does not complete this feature. Release requires one continuous journey: verified user -> current team membership -> selected persistent workspace -> native private repositories -> authenticated runtime bridge -> authorized MCP request -> workspace result. Private records and detailed execution evidence remain at that workspace throughout. Central observability uses minimal routing/status identifiers and redacts credentials and private payloads; inspect the existing MCP live-log fanout before enabling multiple teams.

References: `listeningKitNativeData.md`, `listeningKitInstanceContracts.md`, `listeningKitAdsPower.md`, and `docs/datamodel/Designing Data-Intensive Applications.md`. This audit adds concrete application seams to those contracts; it does not replace them or select a new infrastructure stack.

## Consolidated YAML schema

The complete current/proposed table map, source-field mappings, API contracts and frontend routes are in [listeningKitSchema.yaml](listeningKitSchema.yaml), with a [reading and implementation guide](listeningKitSchema.md). This is proposed schema work; production migrations and route implementation remain separate.
