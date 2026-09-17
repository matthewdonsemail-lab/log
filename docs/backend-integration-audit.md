# Backend integration audit

Reviewed 2026-09-15 against main `83f9bda` and the local, uncommitted platform services.

## Implementation update (first local pass)

The owner confirmed that the Convex deployment exists but is empty. Added local Convex schemas and authenticated account/feed functions with internal deduplicating ingestion; see `convex/README.md`. Resolved the feed conflict, replaced browser-to-platform calls with an explicit mock/live unified-API transport, removed Vite service-key configuration, and installed dependencies. 37 frontend tests plus 4 backend tests pass; workspace/backend typechecks pass after generating docs source (`pnpm --filter docs exec fumadocs-mdx`). Lint passes with two existing warnings. No deployment, identity-provider setup, Hono bridge, or live ingestion worker has been completed. The findings below describe the original audit baseline.

## Implementation update (API bridge pass)

Added `apps/api`: authenticated Hono account/feed routes, per-request Convex clients, RS256 JWT/JWKS verification, strict input validation, and explicit unsupported-operation responses. Added atomic Convex account-create response, identity-provider config, and shared frontend token transport for accounts/feed. Live platform connection helpers now reject instead of simulating success. The auth provider/login UI, development deployment setup, Reddit worker and ingestion scheduling remain outstanding. See `apps/api/README.md`. React 18 type resolution in web/UI is pinned to their own installed types to avoid React 19 docs dependency leakage after reinstall.

## Executive summary

The 43 incoming commits substantially expand the frontend, mock API contracts, documentation, and interaction flows. They do not deliver the live unified backend. Existing Python action implementations are reusable, but pointing the new dashboard directly at those services is NOT sufficient: their routes, payloads, ownership rules, and persistence differ.

Recommended boundary:

`Dashboard -> authenticated Hono API -> Convex + private Python platform services`

Keep the dashboard contract; adapt the Python services behind it. Keep credentials, service keys, polling, and durable writes on the server. Explicit mock mode remains useful, but live failures must never silently produce demo records.

## What arrived

- Accounts console, account health/error vocabulary, challenge resolver UI and resolve route.
- Messaging compose/send/read/ack with per-account isolation in the mock, native identifiers, and deep-link URLs.
- Community, keyword, and Marketplace CRUD flows, including Continue-gated forms and URL resolution.
- Brand v2: identity, offerings, voice, per-channel examples/autoreplies, working memory, sources, prompt compiler, reply simulator.
- Onboarding reveal state machine and follow-up keyword/community mapping UI.
- Analytics, mobile dashboard shell, API key scopes and activity views.
- Standalone Hono mock server, API/messaging contract tests, docs app, and OpenAPI export. The committed spec contains 55 operations.

These are useful implementation assets, not evidence of live platform support. Most domain clients call browser-local Hono apps via `app.request`. Analytics reads deterministic mock data directly. Some onboarding and brand consumers read/write the local store synchronously, so those paths need more than a URL replacement.

## Local work and immediate breakages

1. `apps/web/src/lib/feed/index.ts` is still unmerged. Upstream added object filters/search; local work added per-platform remote fetchers. Preserve both interfaces when resolving it.
2. `apps/web/src/lib/feed/remote.ts` returns string metrics (`"4 comments"`, etc.). Upstream `FeedItem` now requires numbers and formats them in the view.
3. Local feed requests omit account selection and saved community/keyword scopes. Facebook defaults to `group_ids: []`; the actual search action returns an empty result for that input. Reddit defaults to `all`; X defaults to `from:home` even though the wrapper calls search, not a home-timeline API.
4. The local integration falls back to seeded mock rows for both empty results and errors. This masks authentication failures, invalid scopes, and legitimately empty live feeds.
5. `VITE_*_API_KEY` puts service credentials into browser-delivered code. Move these to server-only environment variables before deployment.
6. Remote adapters use unchecked TypeScript casts, omit canonical timestamps/source links, and do not map platform authentication states into the new account issue model.
7. Python services are untracked in the parent repo. Facebook, Reddit, and twikit are nested Git repositories; Facebook and Reddit also contain local modifications. Choose pinned dependencies/submodules or intentional vendoring. Do not blindly add these trees: local cookie/session files and databases exist inside them.

The original tracked edits remain backed up in `stash@{0}`. This audit does not resolve the conflict or change application code.

## Capability matrix (source inspected; not live-verified)

| Area | Existing implementation | Remaining integration |
|---|---|---|
| Feed | Local adapters; Python reading/search actions | Numeric normalization, account/scope mapping, stable identity, persistence, honest error/empty states |
| Facebook | REST registry: posts.listen, groups.search, groups.post, marketplace.create/status; account storage endpoints | Unified contract adapter, cookie lookup by account, joins, messaging, listing update/delete and account lifecycle |
| Reddit | REST registry: posts.listen/search/create, subreddits.search, comments.reply | Account/session persistence, community join workflow, PM inbox/send/ack API, contract adapter |
| X | REST wrapper exposes tweets.listen/search | Inbox/send/ack wrappers, account isolation, exception mapping, polling/deduplication; twikit contains DM primitives that can be reused |
| Accounts | Frontend roster/health UI; Facebook has a local account store | Durable workspace ownership, encrypted credentials, proxy routing, real verification/refresh, shared IDs |
| Challenges | Local iframe pages; mock resolve route checks pending issue then clears it | Actual session handoff, account-bound verification, backend recheck before clearing, dashboard authentication |
| Communities | Mock catalog/resolve/join/accept flows | Native discovery/join adapters, form questions/answers, pending/accepted reconciliation |
| Keywords/analytics | CRUD contract; analytics generated from keyword seed | Persistent scopes, polling jobs, ingestion, matching/scoring, real aggregate queries |
| Messaging | Full browser mock contract + regression tests | Native adapters, durable account-scoped threads/messages, pagination/sync, attachments, send idempotency and delivery errors |
| Listings | Dashboard CRUD/status mock; Facebook create/status primitives | Field translation, real account selection, media handling, status polling, remaining operations |
| Brand/AI | Persisted mock brand, deterministic prompt compiler/simulator | Real site extraction/indexing, model invocation, retrieval, source refresh/retry, durable brand storage |
| Notifications | Real Bark HTTP helper and UI test notification | Backend event-triggered delivery, stored config, deduplication, retries |
| API security | Key hashing and pure scope checker | Authenticated dashboard sessions, route middleware, trusted resource ownership resolution, tenant isolation, rate limits |
| Deployment | Static Railcode manifest | Actual API deployment and separate browser-worker hosting/configuration |

### Important source-level findings

- `connections/index.ts`: connect/test functions validate input, wait on a timer, and mark the mock account connected. They do not verify or pass credentials/proxy settings to a platform service.
- `connections/server.ts`: account roster is an in-memory array. The README's localStorage description does not describe this active route store; the legacy store helper is not a substitute for backend persistence.
- `connections/server.ts`: resolve checks a pending issue but does not verify the actual platform session. PATCH broadly merges client fields; production must restrict allowed fields and protect server-owned health state.
- `api/scopes.ts`: authorization helpers exist, but are not installed as middleware around the mock routes. A route being absent from the external-key registry does not itself secure its HTTP endpoint.
- `brand/index.ts`: synchronous `getBrand/saveBrand` are used in onboarding/inspection. Real transport needs cache/query integration, not just replacing the async helper calls.
- Facebook/Reddit REST action builders create fresh in-memory cursor repositories and temporary record collectors on each dispatch. Domain polling logic exists, but these REST paths do not durably retain records/cursors across requests.
- X catches every action exception and returns HTTP 200 with `auth_required` and empty data. Rate limits, network failures, and malformed requests need separate handling.
- `groups.search` currently searches posts inside the first supplied Facebook group; it is not the new dashboard's community-discovery endpoint and does not process every supplied group.
- Brand extraction/source indexing and reply simulation are mock/deterministic workflows; they are not connected to Firecrawl or a live LLM.
- Reveal selections are stored locally but are not wired through to create the listening scope.
- No application Convex schema/functions were found in this checkout. The deployment manifest explicitly describes a static frontend with no worker capabilities.

## Proposed implementation order

### 1. Restore a trustworthy baseline

Resolve feed conflict without dropping upstream filters. Update numeric metrics and tests. Refresh dependencies from the lockfile. Run typecheck, lint, and contract tests. Preserve all nested-repo changes. Make mock/live selection explicit; report unsupported/error/empty states distinctly.

### 2. One secure, live read-only vertical slice

Add the Hono backend and a shared frontend transport. Start with one selected account and one community/query. Store credentials server-side, call the platform service, normalize real posts, and display them through the existing feed contract. No automatic posting or messaging. Prove account isolation and auth-failure behavior first.

### 3. Durable listening MVP

Add Convex records/indexes for workspaces, accounts, communities, keyword scopes, posts, cursors/jobs, and notification state. Stable deduplication should use native platform IDs plus the correct scope, not randomly generated `record_id` values. Add polling, backoff, account locks, event delivery and actual analytics. Connect onboarding choices to these saved scopes. Extend the proven read-only slice across all three platforms.

### 4. Action workflows

Implement native messaging/joins/listing mutations one platform at a time. Keep unsupported actions explicit until verified. Reuse the existing mock contract tests against the real boundary, then add platform-fixture tests and controlled live checks. Sending/publishing tests need designated accounts and explicit approval for real external actions.

### 5. Research, AI, and operational hardening

Connect site indexing, research, model calls, retrieval, and reviewed drafts. Finish authenticated challenge handoff and backend verification. Add observability, health checks, deployment secrets, backups, retry/idempotency tests, and end-to-end contract coverage.

## Effort assessment

This is backend implementation plus integration, not merely a merge fix.

Rough planning bands for focused engineering effort, not commitments:

- Compatibility repair and baseline: approximately half a day to 1 day.
- One live read-only account/platform slice: approximately 2-4 additional days if the existing client/session is healthy.
- Reliable multi-platform listening MVP with persistence/auth/jobs: approximately 1-2 additional weeks.
- Full messaging/joins/Marketplace/AI/challenge parity: several additional weeks; highest uncertainty is native Facebook/Reddit messaging, session handling, and platform capability differences.

A healthy session, backend access, deployment choices, and live-client acceptance checks are prerequisites to tightening these estimates. Do not infer a completion percentage from the amount of UI code.

## Validation performed

- Inspected commit history, current frontend clients/stores, OpenAPI operation count, local service route registries, normalization and polling paths, and nested-repo status.
- `pnpm --filter web typecheck`: blocked by merge conflict markers in feed/index.ts.
- `pnpm --filter web test`: could not start because vitest is not installed in the current local dependency tree.
- Did not install dependencies, run platform actions, transmit credentials, or verify deployed services. No passing build or live backend claim is made.
