> Implementation reading order: handoff and acceptance criteria, then [schema v2](listeningKitSchema.md). Those define native V1 scope and supersede broader legacy inventories or earlier field names in this companion. Deferred listings/CRM and future AI-provider identity are outside V1.

# Workspace data model: DDIA applied to the existing .logCli runtime

## Current scope correction — 11 November 2026

The native V1 follows [the corrected SQLite-first schema](listeningKitSchema.md). Existing `log.db` events, identities, chats/messages, media, jobs and queues are the foundation. Generated Twenty objects, agency prefixes and CRM/SMS fields do not define the new model. Old listing/campaign functionality is deferred. Broad legacy-domain inventories below are dependency history, not requirements to port those domains into V1. Only active account configuration/session adapters and missing hosted execution contracts belong in this cutover.


11 November 2026. Companion to the authoritative data boundary and issue #112. These are implementation requirements and recommended V1 defaults, not implemented features.

## Start with the existing runtime

Correction, 11 November 2026: the model starts with Log's existing state, not with a new infrastructure checklist. The contracts below are implementation details of this model. Treg supplies the hosted identity/team/MCP-control reference; DDIA supplies the reasoning about ownership, relationships, derived views and failure. Neither requires moving private social data to hosted PostgreSQL.

### What “local” means

Local means the filesystem and database attached to the selected runtime. If Log runs in a supported ChatGPT/Anthropic environment or Boat sandbox, that runtime owns the private state. The AI conversation is a client of Log; it is not itself the database or proof that a persistent browser-capable runtime is available. An AI client may also call hosted MCP while Log runs in a separately selected workspace.

Existing database resolution is `LOG_DB`, otherwise `LOG_INBOX_STATE/log.db`, otherwise `~/.logCli/log.db`. `.logCli` is a directory containing different stores, not a single cookie database. The target installation must persist its state directory plus any browser-managed profile storage outside it. An ephemeral home directory does not satisfy this model.

### DDIA rules applied to our records

The book's Part III distinguishes authoritative records from views that can be regenerated. Chapter 2 explains relationships by stable identifiers; Chapter 7 covers transactions and retry ambiguity. Apply those ideas to the workflows already present:

| Record or state | Authority and relationship | Existing implementation / required change |
| --- | --- | --- |
| Website user, team, membership, MCP grant, selected workspace route | Hosted control PostgreSQL owns these facts. A route references an opaque workspace identity. | Treg-shaped control service remains proposed. No private account catalog belongs here. |
| Platform account and settings | Workspace owns an immutable account id; platform user id is scoped by platform; handles are aliases. Session/profile references belong to this account. | Local JSON accounts exist; current SQLite `accounts` is an identity mapping, not a complete credential/settings repository. Add the missing domain repository and import mappings. |
| Observed messages and interactions | Workspace's retained event record owns the observations that its typed views derive from. Scope upstream ids by platform/account/chat as required by that platform. | `eventsAsTheRecord` migration and message-key uniqueness exist. Keep the existing ingestion model; inspect each projection before declaring it rebuildable. |
| Listings, campaigns, conversations, groups and their relations | Workspace owns locally managed records. Reference account/listing/chat ids explicitly; do not infer relationships from display names. | Inventory existing repositories and move the remaining Twenty operations into workspace storage. Do not introduce a second writable copy centrally. |
| Platform session material | Workspace owns the saved credentials/cookies/client state; platform answers determine whether they still work. Persist refreshes against the same account. | Platform engine exports private temporary cookie files, reads refreshes, then calls the account repository. Replace that repository dependency while retaining the session flow. |
| Browser profile | Browser manager owns the actual persistent profile; Log stores its account-to-profile reference. | AdsPower uses `adsPowerProfileId`. A cookie JSON file is not the full browser profile; profile storage must be retained or explicitly reconnected. |
| Job, queue and operation state | Workspace owns detailed execution status, result and platform evidence. Host owns only the minimal routing/recovery metadata already agreed. | Local jobs/queues exist. Hosted reconnect and operation deduplication still require implementation. |
| Search indexes, projections and previews | Derived only where their retained source can actually regenerate them. | Reuse local derived stores. Attachments, original captures and lost platform history cannot be assumed recoverable from an index. |

The platform remains authoritative about its current remote state. An event records what Log observed at a particular time; it does not guarantee the platform has not subsequently changed.

### Logical model to complete, not a claim of new tables

- Account -> session state / browser profile reference / account settings.
- Account -> conversations -> messages, retaining upstream ids and explicit participant identities.
- Account -> listings; campaign -> listing membership; listing -> conversation when the platform provides a reliable link.
- Account -> groups -> posts -> comments.
- Operation -> job / queue item -> recorded attempt, platform outcome and evidence references.
- Event record -> existing typed projections -> search indexes and other rebuildable views.

These are logical relationships. Reuse existing tables and repositories where they already express them. Add only missing domain fields/tables, with stable foreign keys and platform-appropriate uniqueness constraints. Do not rename the current identity-mapping `accounts` table into a full account store without a migration plan.

### One request through the model

1. User signs in to the hosted service and selects their team. This authenticates the person, not a social account or cloud computer.
2. The selected runtime registers through its authenticated outbound bridge. Hosted authorization binds the call to that team's workspace.
3. Runtime reads its own account repository and saved platform session, or uses the account's persistent browser profile. It executes the existing Log command.
4. Runtime records observations/results privately and persists any refreshed session against the same account. Related database changes use a local transaction; database commits and external platform effects cannot share that transaction.
5. Runtime returns the result through the host to the authorized client. The host does not retain a message database or private payload log.
6. Reconnection uses the same operation id to inspect retained execution state. A lost response after a social write produces an uncertain outcome until reconciled; it does not authorize another send.

### Persistence, restart and migration

Restart must attach the same private state volume and resolve the same account/profile ids. A fresh sandbox with empty storage is a new empty runtime until restored; signing into the website does not reconstruct platform sessions. Backups must consistently capture SQLite and referenced original files, with browser-managed state accounted for separately. Derived indexes may be rebuilt only from retained inputs. Moving to another compute provider is an explicit transfer/restore, never an automatic second writer to the same workspace data.

The immediate implementation work is to finish native workspace repositories, preserve/import existing ids and state, and route authenticated hosted calls to that runtime. Existing JSON and Twenty exports become explicit import inputs, not permanent alternative writable authorities. SQLite migrations remain with the runtime under `src/storage/schema/helpers`; control PostgreSQL migrations belong to the control service. No additional private-data database service is implied.

### Source anchors

- DDIA: simplicity and accidental complexity: chapter 1; the actual Markdown text is also locatable by `accidental complexity`.
- DDIA Part III, “Systems of record” / “Derived data systems” (local book lines 4356–4362); chapter 2 relationships; chapter 7 retry ambiguity (line 1769).
- [Current SQLite path and transactional migrations](../../src/storage/schema/client.ts).
- [Existing event record and identity migrations](../../src/storage/schema/helpers/migrations.ts).
- [Local accounts adapter and remaining remote forwarding](../../src/twenty/graphql/helpers/localAccounts.ts).
- [Platform session export and refresh persistence](../../src/platformKit/session/client.ts).
- [Account/profile binding](../../src/browser/adsPower/helpers/planSync.ts).

## Accepted AdsPower access options

AdsPower remains the default browser. Support provided access through the operator's existing paid setup and users bringing their own AdsPower installation/key. Follow the AdsPower specification for the separate short-lived Log pairing token, private profile brokering and browser-location disclosure. An operator-hosted profile does not become workspace-local by keeping log.db in the user's VM. Strict workspace-only browser storage requires that browser in the selected private environment.

## What an instance means

One organization selects one active cloud workspace in V1. It has its own installation id, runtime process/supervisor, persistent state directory, SQLite database, secret material, browser profiles and execution journal. Organization members share that selected workspace through explicit permissions. A website login does not create a new runtime per member. The hosted control service remains shared and holds only the already agreed identity/authorization/routing records.

Own-cloud and Boat use this same instance contract. Changing compute provider does not change ownership or move private data automatically.

## 1. Complete local data/repository contract — blocks platform implementation

Inventory active account/session repository boundaries. Reuse existing SQLite events, identities, chats/messages, attachments, media, jobs and queues. Specify only missing account configuration, credential and hosted execution contracts. Defer old listing/campaign and other legacy domain schemas; preserve platform ids and message deduplication.

The existing `withLocalAccounts` adapter is insufficient: its `local` mode covers accounts while other object types still forward to `remote`. The new runtime repository must open directly without constructing a remote client, Twenty URL, GraphQL types or server-owner session. Import/migration is a separate explicit tool, never a runtime fallback. Inventory caller paths in TypeScript, Python and scripts before claiming removal is complete.

Existing local JSON accounts need a versioned import into SQLite, preserving aliases and references. Record an import checkpoint and legacy-id mapping. After cutover, old JSON is retained as migration evidence and stops being a second writable authority. SQLite remains the authority for private application records; secret files may remain protected references rather than unencrypted account columns.

Completion: a fresh runtime initializes and persists all supported domain operations with no Twenty configuration or remote calls.

## 2. Configuration and secret lifecycle — blocks onboarding

Define exact existing versus new env names, file locations, precedence and permissions. Separate central email/session/encryption/service secrets from workspace platform/provider credentials. Runtime bootstrap receives only pairing authority; the long-lived credential replaces it after redemption. Define expiry/rotation, revocation, re-pairing and how rotation survives restart without creating an inaccessible instance.

All runtime paths, child processes and watchers must resolve the same instance home/state directory. No automatic loading of the developer's own `.env`, unrelated home directory or global account secrets. The runtime's local encryption/recovery key must not be snapshotted into a reusable template. Document whether protection relies on a separate key, provider disk encryption or file permissions; do not claim encryption is implemented merely because a file is private.

Completion: clean installations contain no prior customer's credentials; restart retains the same bound instance; revocation prevents new bridge use.

## 3. Permissions and consent — blocks multi-user access

Write an explicit permission matrix for team administration, infrastructure spending/lifecycle, account sign-in, private reads, live social writes, exports and destructive data actions. Map it to the selected Treg membership roles. Enforce it in the hosted dispatcher and runtime authorization context, not just hidden UI buttons.

Replace owner-specific assumptions such as “the owner approves” with the authenticated authorized actor while preserving existing live-write confirmation. A generic caller-supplied `confirmLive: true` alone is not evidence of who approved the operation. Bind approval to the intended operation, actor, workspace and relevant arguments; a changed target/text invalidates it. Workspace credentials authenticate the runtime, not a human's permission to send.

MCP guides/resources must become product/team appropriate: preserve shared behavioral constraints without shipping the developer's personal AGENTS file or private voice history as every customer's configuration.

Completion: revoking membership removes access to the team's tools, data and streams; read permission does not grant sends, exports or compute provisioning.

## 4. Durable schedules, watches and claims — blocks unattended operation

Inventory queues, hosts, inbox watchers, scheduled sends, governor counters and chat claims. Their execution state and private payloads stay in the workspace database. One supervisor owns each singleton account watcher/browser lifecycle. Persist due work and claim ownership locally, fence old runtime generations, and define restart reconciliation.

Recommended V1: overdue social writes pause for review after a stop/restore rather than being sent in a catch-up burst. Completed sends are never repeated just because a snapshot restored old schedule state. On bridge loss, admit no new hosted calls. Previously authorized work follows its recorded cancellation/deadline policy; do not pretend an already submitted platform action was cancelled by the network dropping.

Completion: restart does not double watchers or replay sends; private queue payloads never become hosted jobs-table content.

## 5. Runtime/browser capability matrix — blocks provider support claims

For each advertised platform, specify required binaries, Python dependencies, persistent sessions, proxy/locale gates, desktop interaction and browser driver/licensing assumptions. Actual AdsPower availability on a chosen cloud image must be established; a generic Ubuntu desktop is not proof it works. Expose `unsupportedCapability` for unfulfilled requirements instead of silently changing drivers or bypassing gates.

Specify the authorized remote-desktop entry and session expiry, with the same browser/profile used by the runtime. Console sign-in must not happen in a separate browser whose cookies are assumed to exist in the runtime.

Completion: provider readiness and Log readiness are distinct; each advertised workflow has its actual dependencies and human interaction path established.

## 6. Versioning, upgrades, transfer and backups — blocks production readiness

Pin runtime builds and define compatible protocol/schema ranges. Back up or checkpoint before migration, refuse unsupported newer schemas, and document rollback floors. An upgrade must drain/pause work or reconcile it before restarting execution. Never downgrade SQLite by opening it with arbitrary older code.

Define private snapshot/export consistency including SQLite WAL and accompanying attachments/profiles. Recommend a coordinated pause/checkpoint/export for V1. Backups/exports go only to an explicitly configured private destination, not central application tables or public media storage. Backup provider, retention and recovery targets remain unset until selected; do not claim recovery guarantees.

For VM-to-Boat transfer: fence old work, export private data, restore to the target, validate compatibility/bindings, reconcile uncertain external effects and explicitly switch the route. A running clone must not execute from the same stale journal.

Completion: operator instructions specify what persists, how to restore and which data cannot be reconstructed from central metadata.

## 7. Retention, deletion and support access — blocks release claims

Specify separate retention for control metadata, runtime messages, detailed jobs/results, attachments and captures. Permanent deletion of private data is distinct from team access revocation, disconnecting a provider, stopping a sandbox and marking an account lost. Existing account/listing record-preservation rules still apply; do not introduce automatic record deletion.

Support has no blanket access to private workspaces. Any diagnostic export is explicit, scoped and redacted; raw captures are excluded by default. Host request bodies, tool responses, proxy logs, traces, exception reports, caches and durable queues must follow the no-central-payload-storage rule. Define limits for transient transport buffers and what happens on overflow/expiry.

Completion: product language accurately states what the relay can see and what it retains; no unsupported zero-access or end-to-end-encryption claim.

## 8. Provisioning/deployment manifest — blocks live setup

The other provisioning thread owns observed Render/Resend account/domain/resource status and exact secret references. Here, implementation owns executable service build/start/migration commands, health endpoints, origin/cookie/CORS configuration, internal service authorization, WSS routing and a versioned bootstrap command. Proposed env names are not functioning configuration until the code consumes them.

One public application origin remains a recommendation; confirm generated DNS/TLS records during actual setup. Do not introduce substitute providers or extra paid infrastructure outside the agreed scope. Authentication uses the settled Treg-shaped email-code flow; infrastructure account onboarding is a separate action.

Completion: a concrete manifest can deploy the control service/gateway, and a clean cloud workspace can pair using an implemented command.

## Source evidence and implementation map

Pinned inspected Log revision: `4004558bdafcace630686df994d91254130659ab`.

- [Local-account adapter](https://github.com/matthewdonsemail-lab/log/blob/4004558bdafcace630686df994d91254130659ab/src/twenty/graphql/helpers/localAccounts.ts): account-only override plus remote forwarding for other object types.
- [Command context](https://github.com/matthewdonsemail-lab/log/blob/4004558bdafcace630686df994d91254130659ab/src/cli/runner/types.ts) and [runner construction](https://github.com/matthewdonsemail-lab/log/blob/4004558bdafcace630686df994d91254130659ab/src/cli/runner/client.ts): replace runtime vendor coupling and global configuration assumptions.
- [Existing persistence interface](https://github.com/matthewdonsemail-lab/log/blob/4004558bdafcace630686df994d91254130659ab/src/twenty/graphql/types.ts): inventory object contracts and login-secret reads.
- [SQLite schema/migration client](https://github.com/matthewdonsemail-lab/log/blob/4004558bdafcace630686df994d91254130659ab/src/storage/schema/client.ts): reuse existing DB path and schema compatibility behavior.
- [MCP server](https://github.com/matthewdonsemail-lab/log/blob/4004558bdafcace630686df994d91254130659ab/src/mcp/server/index.ts) and [jobs](https://github.com/matthewdonsemail-lab/log/blob/4004558bdafcace630686df994d91254130659ab/src/mcp/jobs/client.ts): scoped resources/logging, local results and recovery.
- [Platform scaffolding](https://github.com/matthewdonsemail-lab/log/blob/4004558bdafcace630686df994d91254130659ab/src/scaffold/platform/helpers/templates.ts): generated future platform code must target native repositories too.

## Build sequence

1. Domain schema/repositories and instance configuration.
2. Treg-style control identity, team permissions, MCP consent and pairing.
3. One runtime bridge with private reads, correctly scoped responses and offline behavior.
4. Live-write approval, durable execution, claims/watchers and disconnect recovery.
5. Provider-specific browser readiness plus provisioning UI.
6. Upgrade/backup/transfer/retention procedures before production claims.

The data boundary and auth choice are settled. These contracts make that decision executable; they are not a reason to reopen provider or architecture selection. Acceptance criteria above describe later implementation verification; no tests, migration or deployment were run by this specification update.

## Application-wide cutover audit

See Application cutover from Twenty for the inspected dependency inventory, real sign-up/sign-in journey, private-data import boundary and ordered implementation acceptance requirements. The current website has no working hosted sign-in/dashboard routes, and local account mode does not remove other Twenty operations. This cutover is required implementation work, not completed migration.


## Consolidated YAML schema

The complete current/proposed table map, source-field mappings, API contracts and frontend routes are in listeningKitSchema.yaml, with a [reading and implementation guide](listeningKitSchema.md). This is proposed schema work; production migrations and route implementation remain separate.
