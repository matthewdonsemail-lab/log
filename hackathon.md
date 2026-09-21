# Hackathon log

- **Project:** ListeningKit Logbook
- **Event:** Convex All Gas Hackathon
- **What it does:** Social-listening dashboard that watches Facebook, X, and Reddit for keywords you care about and pushes a notification on hits.
- **Live app:** https://tremendous-seahorse-330.convex.site
- **Repo:** https://github.com/matthewdonsemail-lab/log
- **Frontend:** Convex static hosting
- **Convex deployment:** https://tremendous-seahorse-330.convex.cloud (prod); dev `determined-cheetah-971`
- **Components:** @convex-dev/static-hosting
- **Convex features:** schema, indexes, queries, mutations, actions, HTTP actions, crons, scheduled functions, live queries (useQuery)
- **Auth:** Clerk dev instance (Google/GitHub provider cards + email, onboarding-gated routes)
- **AI models:** gpt-4o-mini (OpenAI, direct API; or the Convex AI Gateway when enabled). Built and tested, not yet run live: needs `OPENAI_API_KEY` on the deployment
- **Started:** 2026-09-12T21:03:28Z
- **Last updated:** 2026-09-21T23:20:00Z

## Log

### 2026-09-21 - fc86d54
Added a dedicated `/auth` entry point with Clerk Google/GitHub OAuth and email sign-in, a connection-risk notice, and redirect into dashboard Settings after authentication. Extended the browser extension UI with ListeningKit branding, supported-site detection, cookie/profile controls, and the sign-in entry point (`apps/extension/`, `apps/web/src/components/AuthGate.tsx`, `apps/web/src/pages/onboarding/OnboardingAuth.tsx`).

### 2026-09-17 - working tree
Clerk onboarding auth is live in dev: `/sign-in` + `/sign-up/*` routes render
onboarding-styled screens (brand headline per mode, Google/GitHub platform
cards driving the OAuth handoff, Clerk email form below), signed-out visitors
start at platform selection with Continue routing through sign-in, `/dashboard`
sits behind `RequireAuth`, and the sidebar user card shows the Clerk account
(`apps/web/src/components/AuthGate.tsx`,
`apps/web/src/pages/onboarding/OnboardingAuth.tsx`). Clerk's runtime-injected
styles are beaten with scoped higher-specificity overrides in `index.css`
(input height + hidden max-height pin, real input borders, transparent
footer). First real data slice: `POST /api/feed/sync` → Convex action
`reddit:syncSubreddit` pulls newest posts for one public subreddit through
the keyless Arctic Shift mirror, normalizes and ingests them under the
caller's auto-created `Reddit public ingest` account (dedupe on native id,
junk skipped and counted, failures throw — never demo rows), and the
dashboard feed's Sync now control reloads them (`convex/reddit.ts`,
`apps/api/src/app.ts` + `backend.ts`, `apps/web/src/lib/feed/`,
`DashboardFeed.tsx`). Verified live with a real Google session: accounts
and feed return 200 owner-scoped. Tests: web 55, backend 10, api 8;
typecheck + lint clean. Still open: real session verification, ingestion
scheduling/scopes, action workflows, brand AI, notifications, all of
production.

### 2026-09-13 - 1ca849b
Initial commit of the ListeningKit Logbook open-source client. README lays out
the architecture: Camoufox action clients feed a Hono API, Convex holds storage
and queries, Bark push notifies the phone (`README.md`).

### 2026-09-13 - 00a897d
Listings dashboard work in progress plus dashboard cleanup: red button variant
with hard shadow, delete wiring (`apps/web/src/components/DashboardListings.tsx`,
`packages/ui/src/`).

### 2026-09-13 - d1192e8
Dashboard groups/keywords/listings forms with Continue gates, URL join flow,
and the overlay rail (`apps/web/src/components/DashboardGroupsForm.tsx`,
`DashboardKeywordsForm.tsx`, `DashboardListingsForm.tsx`).

### 2026-09-14 - c3a797d
Analytics and account console, dashboard polish, and Railcode deploy
scaffolding (`apps/web/src/components/DashboardAnalytics*.tsx`,
`DashboardAccount*.tsx`, `manifest.yaml`, `railcode.json`).

### 2026-09-13 - working tree
Analytics charts render statically so opening the inspect sheet no longer
replays the numbers; console rows deep-link with `?eventId=` and auto-open the
post inspect sheet; scrim dismiss resets the selection
(`apps/web/src/components/DashboardAnalytics.tsx`,
`DashboardAnalyticsConsole.tsx`, `DashboardAnalyticsPage.tsx`,
`DashboardLayout.tsx`).

### 2026-09-14 - feat/listings-create-form
Brand reveal runs on a forward-only XState machine (competitors to keywords
to groups): a No appends an inline retry round, a Yes continues from the
accepted round instead of rewinding. Keyword retries show selectable keyword
cards per round with per-round picks; the groups familiar loop keeps retry
history and the interested step uses the accepted set
(`apps/web/src/lib/reveal/machine.ts`, `apps/web/src/lib/reveal/flow.ts`,
`apps/web/src/components/onboarding/BrandRevealStep.tsx`).
Continue scrolls the reveal up and fades it out before the fill step mounts;
the fill shows torph copy first (logo at 88%) and the white rises as liquid
instead of flashing or smoking
(`apps/web/src/pages/onboarding/OnboardingSteps.tsx`,
`apps/web/src/components/ReadyFill.tsx`). Dev-only skip bar jumps between
onboarding steps. Deps: xstate, @xstate/react (`apps/web/package.json`).

### 2026-09-14 - working tree
Two ~80-100MB mp4s that rode along in history were deleted from the tree and
`*.mp4` joined `*.mp3`/`*.srt` in `.gitignore` so binary media can't be
committed again (`.gitignore`). Blobs still exist earlier in history.

### 2026-09-14 - working tree
Follow-up loop on the post inspect sheet: Find related mentions runs a
branching chain-of-thought (scan beats, pick round, reply-digging retry,
Google dorking, sibling-community joins) ending on a keyword × community
map the sheet footer saves; Find related groups/communities enters the same
chain at the online search (facebook/reddit only); Draft a response pairs
the brand-voiced draft with an attachable brand-matched resource (video,
guide, page). New `brand-blue` chain tone for white surfaces; mock posts
carry companion phrases plus comment replies so suggestions stay clean
(`apps/web/src/components/RelatedMentionsChain.tsx`,
`DashboardRelatedKeywordsForm.tsx`, `DashboardRelatedCommunitiesForm.tsx`,
`DashboardEventInspectForm.tsx`, `apps/web/src/lib/related-mentions.ts`,
`apps/web/src/lib/analytics/mock.ts`, `apps/web/src/lib/brand/query.ts`,
`apps/web/src/components/ai-elements/chain-of-thought.tsx`,
`chain-joints.ts`). API keys grew scopes (account, groups, send/receive),
SHA-256 hash storage with a one-time reveal, a route registry plus
`authorizeApiKey` gate, a stepped create form, a shared-table key list, and
a per-key scope-activity firehose with its own detail page
(`apps/web/src/lib/api/`, `apps/web/src/components/DashboardAPI.tsx`,
`DashboardApiCreateForm.tsx`, `DashboardApiKeyPage.tsx`,
`DashboardApiKeyConsole.tsx`). Fixes along the way: dropdown item clicks
stop propagating so row actions never navigate
(`packages/ui/src/dropdown.tsx`), listings Location truncates
(`DashboardListings.tsx`), hard deletes for listings/accounts/settings
alongside the soft remove actions, and `*.docx` joined the binary ignore
list (`.gitignore`). Follow-up loop documented in `README.md`.

### 2026-09-15 - working tree
Brand data consolidated: `BrandProfile` retired in favor of `BrandEntity`
(identity, location, voice, flat offerings, reveal intelligence) on a
single `brand-entity` store key, with all readers migrated
(`apps/web/src/lib/brand/types.ts`, `index.ts`, `query.ts`,
`DashboardEventInspectForm.tsx` via `AiQuery`,
`apps/web/src/components/onboarding/BrandRevealStep.tsx`). The onboarding
mount effect that wiped the brand on every visit is gone — revisits hydrate
instead (`apps/web/src/pages/onboarding/OnboardingSteps.tsx`). Reveal
accumulation, the `/dashboard/brand` route, and the reactive hook come next.

### 2026-09-15 - a048ca1
Mock contracts tightened before any live backend: one canonical `Platform`
type (`apps/web/src/lib/platform.ts`) fixing the `x` vs `twitter` split
across feed, connections, and messaging; `FeedItem` metrics are numbers with
a `formatCount` display helper and `GET /feed` gained `?platform=`/`?search=`
filtering; listings carry an `accountId` FK into connections with label
resolution and legacy-row migration. Brand model v2: structured voice
(tone, formality, dos/donts, gold examples) compiling through
`buildBrandSystemPrompt()` with a versioned prompt, object offerings,
indexed `sources` pages with seed data and `POST /brand/index` / source
routes, and v1-row migration. New `DashboardBrand` page (identity, voice +
system-prompt preview, offerings, location, sources, intelligence) on
`/dashboard/brand` with sidebar entry, plus a five-page brand section in the
docs (`apps/docs/content/docs/brand/`). Convex features: none yet — the
agent/RAG/embedding wiring is documented from official docs as the cutover
target, not implemented.

### 2026-09-15 - 25f2235
Brand tab became the agent's communication brain & memory: per-channel response
profiles (facebook/x/reddit — casual vs standard style, raw chat snippets, triage
flow) plus a working-facts memory bank, with v1 rows migrated on load
(`apps/web/src/lib/brand/types.ts`). New deterministic `simulateReply` previews the
exact send text on one channel — most word-overlapping gold example, channel style
applied, triage nudge appended — and the page is now a read-only hub with a Test-it
pane while all editing moved to a namespaced sheet form that previews against the
unsaved draft and saves via `PUT /brand` (`apps/web/src/components/DashboardBrand.tsx`,
`DashboardBrandForm.tsx`, `DashboardFormPrimitives.tsx`), memory rules compiling
into the versioned system prompt (`apps/web/src/lib/brand/prompt.ts`). README gained
the Brand pipelines → agent context → self-healing section; lint moved eslint →
oxlint with the `@shadcn/lint` plugin (`.oxlintrc.json`, `AGENTS.md`, `README.md`).

### 2026-09-15 - 6feb610
The brand tab's live simulator now renders real per-channel threads instead of
stubs: Reddit gets a full `RedditThread` card (community post, selftext, nested
blue ListeningKit agent reply) and X gets a `TwitterThreads` card (hardcoded
mentioner opening post with media block, nested agent reply with thread
connector and the ListeningKit logo avatar) — in both, the simulator input is
outbound only and renders as the agent's reply, never the inbound side
(`apps/web/src/components/cards/RedditThread.tsx`, `TwitterThreads.tsx`,
`DashboardBrand.tsx`). `FormInput` gained a `shape='rounded-md'` treatment for
the simulator input box, and the brand form's Test-it bubble plus dashed
add-row button were aligned to the outgoing-voice styling
(`apps/web/src/components/DashboardFormPrimitives.tsx`,
`DashboardBrandForm.tsx`).

### 2026-09-15 - dc698cf
Reworked the X thread so the agent reply is a distinct self-contained blue card
rather than a grey thread line: extracted it from `TwitterThreads` into its own
`TwitterThreadReply` that fills with brand blue, white ink, a brand-blue mark on a
white-circle avatar, and a thread connector, then mounted it under a
rounded/overflow-hidden white shell below the opening post (`apps/web/src/components/cards/TwitterThreads.tsx`,
`apps/web/src/components/DashboardBrand.tsx`).

### 2026-09-15 - 4f585a6
Locked the brand page to the outbound-hunting mental model. The tone readout is
now an inline `Select` (the shared UI `Select` gained a `disabled` prop with a
muted trigger) that persists through `saveBrandAsync` and disables while a save
is in flight; the simulator is reframed end-to-end as first-touch outbound —
`prompt.ts` swaps the marketplace-buyer `FALLBACK_REPLY` ("still available") for
a `FIRST_TOUCH_FALLBACK` and renames `simulateReply` → `simulateOutbound` (arg
`inbound` → `context`), `DashboardBrand.tsx` renames the simulator state to
`leadContext` ("Detected post / lead context", shed-clear placeholder, no more
"is this still available? / can you do 40?"), and the lead's post renders as a
grey ChatBubble `quote` tone instead of `incoming`
(`packages/ui/src/select.tsx`, `apps/web/src/lib/brand/prompt.ts`,
`apps/web/src/lib/brand/index.ts`, `apps/web/src/components/DashboardBrand.tsx`,
`DashboardBrandForm.tsx`, `DashboardFormPrimitives.tsx`,
`cards/TwitterThreads.tsx`).

### 2026-09-15 - c18d385
Three Twitter thread card fixes: the empty-reply placeholder lost its inset
`bg-white/15` box and now renders as inline muted text inside the blue card
(like Reddit already did), the cyan media placeholder block is gone
(`ThreadMedia` returns null without a `src`, token removed), and the main
post's replies/reposts/likes row is visible again — it was rendering in
`replyMuted` white-on-white, so `ThreadAction(s)` take a `color` prop now
(`threadGrey` on the white post, `replyMuted` on the blue reply card)
(`apps/web/src/components/cards/TwitterThreads.tsx`).

### 2026-09-15 - f3cf44a
New Brand "Autoreplies" tab (emerald `Zap` tab): per-channel base replies with
inline instant toggles that save direct through `PUT /brand`, per-channel Edit
buttons opening the existing channel overlay forms, and a Test-it block
(channel select + lead-context input) showing which base reply fires with the
exact first-touch bubble. Model: `Autoreply { id, trigger, reply, enabled }`
on `ChannelProfile`, guarded + migrated (old rows keep saved style/examples/
triage, list defaults to `[]`); `ChannelFields` gained an `AutorepliesEditor`
(trigger/reply/toggle/delete/add, draft-only until Save); shared `Toggle`
switch in `DashboardFormPrimitives`. Enabled replies flow into every outbound
draft with the rest of the brand: new "Enabled base replies" section in
`buildBrandSystemPrompt` (`PROMPT_VERSION` 1 → 2), `simulateOutbound` scores
enabled autoreplies alongside gold examples (ties keep the base reply,
`matchedSource`/`matchedTrigger` label the hit), and the inspect-sheet
`draftReply` sends a matched base reply verbatim with a "Using autoreply"
label (`apps/web/src/lib/brand/types.ts`, `prompt.ts`, `query.ts`, `index.ts`,
`apps/web/src/components/DashboardBrand.tsx`, `DashboardBrandForm.tsx`,
`DashboardFormPrimitives.tsx`, `DashboardEventInspectForm.tsx`).

### 2026-09-15 - 68dfc23
Folded autoreplies into the channel tabs to cut five tabs back to four:
new shared `AutorepliesSection` (heading, toggle rows saving direct,
empty-state pointing at the channel Edit button) mounted in the Facebook
panel after triage and in the X/Reddit panel after gold examples; the
standalone Autoreplies tab, its Test-it block, and the `testChannel` /
`testPreview` / `CHANNEL_LABEL` scaffolding are gone (the Facebook
simulator's "Matched autoreply · trigger" label already covers the
which-reply-fires need). No form changes — `AutorepliesEditor` already
lives in `ChannelFields`, and the existing per-channel Edit buttons open
it (`apps/web/src/components/DashboardBrand.tsx`).

### 2026-09-15 - fec4a7f
Empty states on the Brand page are now light-blue-tint banners that drive
entry: new shared `EmptyBanner` (title + body + action slot) in
`DashboardFormPrimitives`, adopted by all five no-data spots — no-brand
(onboarding link styled via `buttonVariants`), triage ("Edit Facebook"),
memory ("Edit memory"), gold snippets (per-channel "Edit {Channel}" —
`GoldExamples` gained channelLabel/onEdit), and autoreplies
(`AutorepliesSection` gained onEdit) — every CTA opens the right overlay
form, no step logic touched (`apps/web/src/components/
DashboardFormPrimitives.tsx`, `DashboardBrand.tsx`).

### 2026-09-15 - 0f6efe1
Started consolidating buttons on the canonical kit `Button` after the
audit found ~63 raw `<button>`s in 8 pattern families (bespoke blue with a
divergent `#1E66C9` hover, outline, dashed add-row, quiet text, media
overlay pills, on-dark hero pairs, segmented cells, dashed-underline
links). This pass: added `dashed` and `quiet` variants to
`packages/ui/src/button.tsx` (canonical blue hover `#1F6FE6` kept), then
migrated the brand edit sheet stack - Close X and Cancel inside
`DashboardFormSheet` (now `quiet` icon/large) and both add-rows in
`DashboardBrandForm` (AutorepliesEditor + StringListEditor, now `dashed`
large). Remaining families (9 bespoke blues, 2 outlines, 4 sibling
dashed adds, overlay pills, on-dark heroes, dashed-underline links) are
queued; squircle tiles, the toggle switch, and segmented cells stay raw
by design (they need clipPath refs / aria-pressed).

### 2026-09-15 - 13e77fb
Fixed the form-slot reopen bug: clicking the backdrop cleared the
rendered slot without touching page state, so clicking the same Edit
button again no-op'd (same value, no state change, effect never re-ran).
All six slot-holding pages (Brand, Account, API, Groups, Keywords,
Listings) now reset their open state on `lk:form-dismissed`, matching the
pattern Analytics and ApiKey already had. The layout overlay also drops
pointer-events during its 200ms exit fade, so a fast reopen click is no
longer swallowed by the dissolving scrim. Same commit: API key page gets
Scope/Activity tabs, clickable firehose rows opening an activity inspect
sheet, and scope visuals; brand page copy refresh with EmptyBanner
pointing at the channel Edit buttons; docs get Mermaid diagrams on the
brand ramp plus channel-texting and keywords pages.
### 2026-09-16 - 8030e1e
Mobile dashboard shell + full Scalar API reference. Viewport hook (useIsMobileViewport) and responsive DashboardLayout/Header/Sidebar/FormOverlay: header logo top-left on mobile, bottom fixed nav with hamburger overflow, full-bleed forms, blue stage suppressed below sm. Mock now exposes a real HTTP surface (mockApiApp + openApiDocumentation): 31 routes (accounts, communities, listings, keywords, feed, messaging, brand, api-keys) with describeRoute code refs and Zod-derived schemas, pnpm --filter web openapi:export writes pps/docs/openapi.json and pnpm --filter docs gen:api generates per-tag pages with visible markdown headings (## tag intro + ### METHOD /path � summary) for the right-hand On This Page. Scalar playground embedded via official umadocs-openapi/scalar (APIPlayground) with @scalar/api-client-react on the try pages. Cross-links added (pi.mdx ? errors.mdx ? pi-reference). Verified with pi-coverage.test.ts smoke and docs build 28/28.

### 2026-09-16 - a45f500
Outbound messaging landed: compose (POST /threads, 201 starts the conversation),
send (POST /threads/:threadId/messages), and read-ack
(POST /threads/:threadId/ack) across X, Facebook, and Reddit, backed by a shared
thread/message store and per-platform identity resolution
(`apps/web/src/lib/messaging/store.ts`, `identities.ts`, `routes.ts`). Every thread
route now gates on the connected account (`account` scope bit alongside
send/receive, `apps/web/src/lib/api/scopes.ts`), and the normalized Thread/
ChatMessage shapes carry each platform's native ids (X `dm_conversation_id`,
Facebook conversation id, Reddit `first_message_name`). Vitest added to the web
app with messaging + API-coverage tests (`apps/web/vitest.config.ts`,
`apps/web/src/lib/__tests__/`), and the OpenAPI spec, generator, and messaging
docs page regenerated with the new endpoints (`apps/web/src/lib/openapi.ts`,
`apps/docs/openapi.json`, `apps/docs/content/docs/api-reference/endpoints/messaging.mdx`).

### 2026-09-16 - working tree
Full README rewrite written from the current implementation rather than
the original placeholder: pins the in-repo reality (one Hono mock app,
in-process client calls, localStorage persistence, standalone mock server)
then documents the API surface (8 tags / 54 operations), the data model as
an ER diagram plus per-record table, the table-driven API-key scope gate,
the OpenAPI generation pipeline, the full messaging chat contract with
per-platform native id shapes, multi-account proxying, group discovery
→ join → auto-listen, the follow-up chain (inspect → suggest → map) and
onboarding reveal, and the self-healing brand record — each section with
Mermaid diagrams and hyperlinks to the code or docs it's grounded in
(`README.md`).

### 2026-09-16 - working tree
README review fixes, all checked against source: keywords really is 5
routes (`apps/web/src/lib/keywords/server.ts` has no single-item GET —
the earlier "6" was wrong, the table stands); Layout tree corrected —
`manifest.yaml` + `railcode.json` sit at the repo root and `.railcode`
is a CLI state file, not a folder; every `apps/docs/content/...` mdx
path and every component path linked from the README verified to exist
on disk, including all eight generated `api-reference/endpoints/*.mdx`
tag pages (`API keys` → `api-keys.mdx` confirmed).

### 2026-09-16 - working tree
README messaging section gains the thread ↔ message linkage bullet that
was only implicit before: `ChatMessage.threadId`, the per-account
`messages: Record<threadId, …>` map, `${threadId}-m${n}` message ids, and
the resolve-through-the-thread read/write rules (`apps/web/src/lib/
messaging/store.ts`, `types.ts`).

### 2026-09-16 - working tree
Full README audit, every verifiable claim re-checked against source.
Confirmed as-written: all eight route tables (incl. keywords = 5, no
single-item GET), all localStorage keys, seed counts, the 26×10 issue
catalog, the follow-up XState chain + components, the join/create store
calls, the X-hides-communities rule, design-system terms, ui exports,
the /dashboard/docs embed, ports and scripts. Fixed: brand section
rewritten where it overstated — `simulateOutbound` lives in
`brand/prompt.ts`; autoreplies are styled + triaged, not verbatim;
`retrieveSourceRefs` is the mock mirror, the RAG namespace is the live
target; re-index appends unseen URLs only; failed rows have no retry;
gold examples are hand-curated; reveal → intelligence is unwired
(`saveKeywordMapping` persists locally, nothing reads it yet). Also:
onboarding write-back corrected, `pnpm dev` row covers web + docs.

### 2026-09-16 - working tree
Messages view is now URL-driven: `/dashboard/messages/:platform/
:accountId/:threadId/:messageId` (every level optional, routes in
`apps/web/src/App.tsx`), selection derives from the segments in
`DashboardMessages.tsx`, unknown platform/account/thread segments
redirect up with a toast, the first conversation deep-links on load,
and clicking a bubble links that message (scroll-into-view + flash).
Read/unread ack moved into an effect so deep-linked threads mark read
like clicked ones. Verified: no hardcoded threads/messages in the
view — all rows flow from the seeded mock store through the messaging
client; typecheck, lint and all 32 vitest tests pass.

### 2026-09-16 - working tree
Challenge resolver becomes a real route + API source of truth. New
`POST /accounts/:accountId/resolve` (`apps/web/src/lib/connections/
server.ts`, operationId `resolveChallenge`): 404 unknown id, 409 unless
the account's `lastIssue` is in `CHALLENGE_RESOLVABLE_ISSUES`, else
clears issue/signal/retry and stamps time; client `resolveChallenge`
now calls it instead of a bare PATCH. New `DashboardChallengePage`
at `accounts/:accountId/challenge` hosts the existing `ChallengeResolver`
iframe, returns via `state.from`, and states unknown / no-challenge
explicitly. Messages shows an account-level gate on empty inboxes
driven by the account's own API state (resolvable → resolver route,
other issues → account page) instead of a dead empty list. Spec
regenerated (Accounts 4→5 ops, 55 total) plus docs pages. Tests: new
resolve-gate cases (404/409/200-clears/409-again, x-challenge seed);
typecheck, lint, 33/33 vitest pass.

### 2026-09-16 - working tree
Messaging thread + message app-ids switch from human-readable slugs
(`x-t1`, `fb-t1`, `${threadId}-m${n}`, `gen-…`) to real generated UUIDs v4.
New shared `apps/web/src/lib/messaging/uuid.ts` (`crypto.randomUUID()` with
the same v4-hex fallback as `apiKeyId`/`keywordId`, so no `node:crypto`
import and the browser bundle is untouched). Each platform mock
(`messaging/{twitter,facebook,reddit}/mock.ts`) mints every seeded thread and
message id via `uuid()` at module load and exports the thread-id maps
(`X_THREAD_IDS`, `FB_THREAD_IDS`, `REDDIT_THREAD_IDS`) plus `X_T1_M1`, so the
contract tests pin the loaded values by constant instead of literal. Store
runtime ids change too: `startThread`'s thread id and `buildMessage`'s id use
`uuid()`, dropping the `gen-` and `-m${n}` schemes and the now-unused
`localSeq` argument. `messaging.test.ts` + `api-coverage.test.ts` swap every
slug literal for the exported constants (the intentional `x-t404` bogus id
stays, since it must 404). The README's stale "`${threadId}-m${n}`"
message-id note is corrected to describe the opaque UUIDs. typecheck clean,
lint clean (one pre-existing, unrelated warning), 33/33 vitest pass.

### 2026-09-16 - working tree
Id generation consolidates into a single generator and the last derived / weak
id sites become random UUIDs v4. New shared `apps/web/src/lib/ids.ts`
(`crypto.randomUUID()` with the same v4-hex fallback); the four copy-pasted
implementations now delegate to it — `messaging/uuid.ts` re-exports it, and
`api/mock.ts#apiKeyId`, `keywords/mock.ts#keywordId`, and
`connections/store.ts#newAccountId` each return `uuid()`. Five remaining
non-UUID id sites are fixed: the accounts create route
(`connections/server.ts`) calls `newAccountId()` instead of its own
`account-<ts>-<rand>`; the v1→v2 account migration mints a UUID per row
instead of keying by bare `platform` (which collided two Facebook accounts);
Bark connections mint a UUID instead of `bark-<ts>-<rand>`
(`notifications/bark.ts`); `communities/mock.ts` resolves pasted Facebook group
links and typed subreddits to UUID ids (was `facebook-link-<slug>` /
`reddit-link-<key>`, which collided on slug reuse); and `ListingRecord` gains an
opaque `id: string` — the native 17-digit `listingId` stays as the marketplace
id, the same `id` / `platformThreadId` split messaging has — minted at the
create route, on every persisted-row backfill, and on all five `MOCK_LISTINGS`
seeds. Stable cross-referenced fixtures keep their literal ids (seeded
`MOCK_CONNECTIONS`, the keyword / api-key seed UUIDs). The accounts route's
OpenAPI description drops the stale `account-<timestamp>-<rand>` note. typecheck
clean, lint clean (two pre-existing warnings, unchanged), 33/33 vitest pass.

### 2026-09-16 - working tree
Review follow-ups on the id-consolidation commit: the accounts create route's
OpenAPI description regains its dropped `id` (now "stable random-UUID
`id`, sets `label`…"); the README data model catches up to `ListingRecord.id`
(LISTING block: `id PK "normalized"`, `listingId` demoted to the native
numeric field, same as THREAD; table row notes the split) plus a shared
`ids.ts` note next to `persist.ts`. New opt-in request logging —
`apps/web/src/lib/request-log.ts` mounts one Hono middleware on `mockApiApp`
(`.use('*', …)`), covering every domain on both consumption paths (in-process
`app.request()` and the standalone HTTP server); it logs method/path/status/ms
with request/response bodies redacted by field NAME before stringifying
(`key`, `secretHash`, `deviceKey`, `cookie` → `[redacted]`, recursive,
2000-char cap), silent unless `VITE_MOCK_API_LOG_REQUESTS=1` /
`MOCK_API_LOG_REQUESTS=1`. New `request-log.test.ts` pins the redaction and
the gate. Messaging store deliberately untouched: the in-place thread mutation
with no pub/sub stays as-is until Part B, whose transition trigger should
double as the UI invalidation path rather than a second bolt-on. typecheck
clean, lint clean (two pre-existing warnings, unchanged), 36/36 vitest pass.

### 2026-09-16 - working tree
Request logging moves from the `mockApiApp` root onto each leaf domain app:
dashboard clients call the sub-apps directly (`connectionsApp.request(…)`,
`messagingApp.request(…)`, …), so the root mount never saw dashboard traffic.
Each of the seven domain servers plus the shared messaging route factory mounts
the same `requestLogger`; the root mount is removed. Two Hono behaviors found
by test: `.route()` replays leaf middleware once per mount (5–8 duplicate
lines per root request), so the first copy logs and stamps a context flag
while replays skip; and the first merged copy to run isn't the handling
domain, so the tag is derived from the request path (`accounts`,
`messaging/x`, …) instead of the mount. `apps/web/.env` (gitignored) sets
`VITE_MOCK_API_LOG_REQUESTS=1` for local dashboard debugging — restart
`vite dev` after changing it, since Vite bakes env at startup. typecheck
clean, lint clean (two pre-existing warnings, unchanged), 39/39 vitest pass.

### 2026-09-16 - working tree
Synced main with the merged account-state contract (PR #2,
feat/account-state-component-contract) and added three agent-facing
reference docs under `docs/okf/`. The account-state module
(`apps/web/src/lib/account-issues/`) adds `state.ts` — a pure,
dependency-free contract: `accountStateView` (ConnectionRecord →
render model), `accountStateNotification` (old/new pure transition
detector returning `AccountNotification | null`), and
`accountIssuePatch` (canonical persisted-issue patch) — plus
`store.ts` (in-memory `AccountStateStore` matching the shape a future
Convex-backed adapter will expose, so the component never binds to the
HTTP transport) and `api-reference/account-state.mdx`. This is what
Part B's transition trigger and notification surfaces build against.
The three OKF docs crystallise rules that were previously scattered
across README, test comments, and commit history: `ids.md` (single
UUID v4 generator, the native-id-preserved-alongside rule, the five
never-derive-from-input regressions the consolidation fixed, literal
seed/fixture ids to keep byte-identical, live-client mint/preserve
rules), `mock_transport.md` (the route-round-trip rule every page
follows, the per-domain client→sub-app table, the messaging send/ack
contract, the in-place-mutation/no-pub-sub store caveat explicitly
assigned to Part B, and the live-swap-is-transport-only guarantee),
and `request_logging.md` (the three invariants the logger must
preserve: env-gated opt-in with the same variable names, redaction by
field name before `JSON.stringify` so no second copy of a secret ever
exists in a log, exactly-once-per-request on every consumption path
including the leaf-level `.route()` replay behavior, and the line
shape). `marketplace_update.md` existed before as the pattern
document; these three follow the same
"rule → why → what it looks like" structure so an agent can work
from the docs alone. typecheck clean, 39/39 vitest pass, lint clean.

### 2026-09-16 - working tree
Merged the account-state component contract (PR #2, branch
feat/account-state-component-contract) into `main` and fixed the two
defects its review miss: (1) `state.ts` indexed `issue.remediation` —
an already-resolved string — with `next.platform`, so the
platform-specific remediation copy (e.g. "Log in at facebook.com and
clear the checkpoint…") was silently dropped from every notification's
`detail` field; now reads the resolved string and falls back to the
appropriate recovery/generic copy when it is empty; (2) the PR's own
`state.test.ts` asserted `label: 'Bot challenge pending'` (the
`challenge_interstitial` label) on a record seeded with
`lastIssue: 'captcha_html'`, whose three other assertions
(`action_required`, `open_challenge`, `requiresAction: true`) only hold
for `captcha_html` (transient: false) — corrected the label assertion
to the catalog's actual `captcha_html` label. Added a regression test
pinning that the platform-specific remediation string survives into the
notification payload, so Part B's push flow gets the real copy, not the
generic fallback. typecheck clean, 45/45 vitest pass, lint clean.

### 2026-09-16 - working tree
State machines for listings and communities plus the shared account gate
(`apps/web/src/lib/account-state.ts`: `gateAccount`, `describeGate`,
`WRITE_BLOCKING_ISSUES`, terminal vs stalled). Listings
(`lib/listings/machine.ts`) and communities (`lib/communities/machine.ts`)
enforce every mutation in the store (409 with the machine reason) and gate
the row menus through the same pure functions, so menu and store agree.
Communities grow the full FB lifecycle: 8 join states, `removedBy`
provenance (self-leave rejoins freely, platform removal gated on the
group), new mock `decline`/`remove` routes, machine-gated Groups page
(badges, per-state copy, gate notes, toast-wired handlers) and join form
(machine-filtered pick list, rejoin title, answer prefill from declined
rows). New `docs/okf/communities_lifecycle.md` transition table for the
live-client handoff. typecheck clean, 71/71 vitest pass (15 new community
machine tests), lint clean (one pre-existing spread-fallback warning in
communities/index.ts).

### 2026-09-16 - working tree
Split communities into platform-native xstate v5 machines
(`lib/communities/facebook|reddit|x/` + `lib/client-tasks/`), replacing the
single facebook-shaped funnel. Facebook models the dynamic modal lifecycle
(inspect/render/incomplete/abandon/resume/submit) with scraped question
provenance, question-set hashing, partial submits flagged via
`answersComplete`, and lease-based abandon. Reddit models observed access
gates (restricted read-only, private modmail, quarantine opt-in,
banned/archived, karma as tag-only evidence) behind one root metadata
dispatch table. Client tasks track long-lived jobs (queued/running/
awaiting_input/done/failed/abandoned/expired) with heartbeat leases and
draft-preserving resume. Store drives ephemeral actors per request from a
versioned flat row (`communities.joins.v2`); UI menus dispatch to the same
machines. typecheck clean, 109/109 vitest pass, lint clean.

### 2026-09-16 - working tree
Removed X-as-community from the communities domain: X has no joinable
community primitive (twikit listens via `search_tweet`, never via
membership), so the six `x-*` catalog rows
(`COMMUNITIES_BASE` + `COMMUNITY_TOPICS` in `lib/communities/mock.ts`) and
the trivial `lib/communities/x/` machine (`machine.ts`, `types.ts`,
`machine.test.ts`) are deleted. `server.ts` drops the X imports, drive
helpers, and join/observe/leave branches (unknown platforms now 400/deny);
`menus.ts` denies all moves for unknown platforms; `types.ts` documents
that only facebook groups + subreddits materialize. The Groups page tabs
and form offer facebook + reddit only (`PlatformPick` gains an opt-in
`platforms` filter; the X-only `GroupPick` rows are gone, reddit keeps its
dropdown). X listening stays where it already lives: free-form
`groupId: null` phrases in the keywords domain (server-enforced), X
session health on the `x-*` connection rows (`normalize.ts` +
`WRITE_BLOCKING_ISSUES`), DMs in `messaging/twitter/`, signals in `feed/`.
Persisted pre-removal X catalog/orphan join rows are filtered on load.
typecheck clean, 105/105 vitest pass (109 minus the 3 x-machine + 1 x-flow
tests), lint clean (one pre-existing spread-fallback warning in
communities/index.ts).

### 2026-09-18 - working tree
Two steps toward all three platforms feeding one live log. First, a push door:
`POST /ingest` (HTTP action) takes batches of posts for Facebook, X or Reddit
from any client, authenticated by a per-user ingest key. Only the SHA-256 of the
key is stored and the secret is shown once; the owner comes from the key, never
the request, so users cannot read or write each other's posts. Junk rows are
skipped and counted, and posts dedupe on their native id (`convex/http.ts`,
`convex/ingest.ts`, `convex/feed.ts`, `convex/lib/posts.ts`, new `ingestKeys`
table and `by_owner_and_platform` index in `convex/schema.ts`). Second, the
dashboard now talks to Convex directly when `VITE_CONVEX_URL` is set: the feed
is a live `useQuery` subscription, so synced or pushed posts appear with no
reload, and the Hono bridge is no longer on that path
(`apps/web/src/lib/convex.ts`, `apps/web/src/components/DashboardFeed.tsx`,
`apps/web/src/main.tsx`, `apps/web/src/lib/connections/index.ts`). Tests: backend
17 (7 new for ingest), web 139 (12 new for the Convex transport and key client);
typecheck, lint and the production build pass. A "Send posts in" settings tab
creates, lists and revokes ingest keys (`apps/web/src/components/
DashboardSettingsIngest.tsx`, `apps/web/src/lib/ingest-keys.ts`). Checked in a
real Camoufox browser session: Sync now pulled 25 Reddit posts live, and a key
made in the UI accepted a pushed X post that appeared in the feed with no
reload, then was revoked and rejected. A Reddit push adapter (`clients/reddit_push.py`,
shared `clients/listeningkit_ingest.py`, 14 Python tests) polls the camofox
client and pushes to `/ingest`; against a stand-in client it landed 3 posts in
the live feed, deduped on rerun, and failed cleanly once the key was revoked.
Run against a real logged-in Reddit session it first skipped every post: the
camofox client's extractor returned only card text, so it now reads each post
card's attributes (id, title, link, author, counts, time) and pushed 10 real
r/marketing posts that appeared in the live feed. Then the normal-user Reddit path: a plain
"What should we listen for?" page (`apps/web/src/components/DashboardKeywordsLive.tsx`)
where you type a phrase and pick a subreddit; phrases and matches live in Convex
(`convex/keywords.ts`, `convex/hits.ts`, whole-word matching in
`convex/lib/match.ts`), every ingested post is matched as it arrives, and a cron
(`convex/crons.ts` -> `convex/watch.ts`) polls each watched subreddit every 10
minutes. Backend 30 tests, web 143; walked through in the real browser: add a
phrase, Check now, 11 live matches, pause, resume, remove. Onboarding keeps its video, extension and token steps and makes them real. A
Chrome extension (`apps/extension`, Manifest V3) reads your logged-in cookies for
Reddit, X or Facebook and copies a one-time token; the install guide offers the zip
(`scripts/build-extension.py`); pasting the token calls `convex/sessions.ts`, which
validates it in plain words, seals the cookie jar with AES-256-GCM
(`convex/lib/crypto.ts`, key kept in deployment env only) and marks the account
connected. No query returns the jar to a browser; local clients fetch it through
`GET /session` with an ingest key, so the Reddit adapter needs no cookies file.
Settings can test and disconnect. Backend 42 tests, web 161, Python 19; the real
extension was loaded into Chromium and its token pasted in the real app. The Reddit
path also lands on the Keywords page at the end (`apps/web/src/lib/platform-support.ts`).
Freshness: the hosted check was reading a mirror that was about nine hours behind, so it
now tries Reddit's official API (when an app is set up), then Reddit's own feed, then the
mirror (`convex/lib/redditFeed.ts`, `convex/reddit.ts`), records which source answered on
each phrase, and shows "checked 4 min ago" or a backup-data warning on the Keywords page.
Measured from Convex's servers: Reddit's plain feed is mostly rate-limited (HTTP 429), so
the official API needs an app set up to be dependable. Backend 53 tests, web 162. Not built
yet: X and Facebook adapters, phone alerts, keyword scoring, community discovery, and any
deployment.

### 2026-09-18 - working tree
The site is live on a public Convex URL. `@convex-dev/static-hosting` is registered in
`convex/convex.config.ts` and mounted as the catch-all in `convex/http.ts`; app-owned root routing
keeps `/ingest` and `/session` at their URLs instead of moving them under `/api`. Rehearsed on the
dev deployment first (Google sign-in works on the public address, single-page routing, API routes
intact), then deployed the backend and uploaded the site to production with its own encryption key
and sign-in settings set in deployment env. The production bundle points only at the production
backend. `pnpm deploy:site` republishes the site. Not built yet: X and Facebook adapters, phone
alerts, keyword scoring, community discovery.

### 2026-09-18 - working tree
OpenAI scoring of matches. Every new match is scored in the background (0 to 100, an intent such
as "wants help" or "promotion", and a one-line reason) by a scheduled action, with a 10-minute
backfill cron as a safety net (`convex/scoring.ts`, `convex/lib/scoring.ts`, `convex/crons.ts`).
The Keywords page shows a colored badge and the reason on each match and can list the best
matches first (`apps/web/src/components/DashboardKeywordsLive.tsx`). The model call goes to
OpenAI directly when `OPENAI_API_KEY` is set on the deployment, otherwise through the Convex AI
Gateway; the gateway is not enabled on the free Convex plan, so it was not usable here. Posts
are treated as untrusted text (fenced in the prompt, reply validated and clamped), errors never
echo the response or key, retries stop after three attempts, and `AI_SCORING=off` stops all model
calls. Backend 72 tests, web 164; verified only against fake model replies, so a live run is
still to do. Not built yet: X and Facebook adapters, phone alerts, community discovery.

### 2026-09-18 - working tree
X support. A helper that runs on the person's own computer (`clients/x_push.py`, twikit) loads
the X login they connected in the app, asks the app for their X phrases (new `GET /phrases`
endpoint, ingest-key authenticated), searches X for each exact phrase without retweets, spaces
requests out, stops politely when X asks it to slow down, and pushes the tweets to `/ingest`.
The Keywords page now lets a person choose X, explains the helper in plain steps, and shows
"checked N min ago by your helper" once it has run (`convex/keywords.ts`, `convex/http.ts`,
`convex/ingest.ts`, `apps/web/src/components/DashboardKeywordsLive.tsx`). Backend 75 tests,
web 164, Python 39. Walked through in the real app with a real saved login record, the real
phrase list and the real push, with only X's search results replaced by a stand-in: two tweets
matched, the retweet was dropped, and the phrase showed as checked by the helper. Not yet run
against a real X account. Not built yet: a Facebook helper, phone alerts, community discovery.

### 2026-09-18 - working tree
Found by trying the X helper with a real throwaway X account: twikit's request signing is broken
by X's site rebuild ("Couldn't get KEY_BYTE indices" from its transaction code), so the helper now
reads X's Latest search tab in a real browser (`clients/x_browser.py`) logged in with the
connected login, reusing the same `search_tweet` shape so nothing else changed. It skips ads and
reposts, parses counts like "1.2K", tells a login wall, a rate limit, a locked account and an
empty result apart, and retries page reads that race a redirect. Added `--verbose` (shows why a
search failed with cookie values hidden), `--show` and `--engine`. Python tests 51, including a
real headless browser against a stand-in page, and a check against the real X site with no login,
which is recognised as a login wall. Still to do: a run with the real logged-in throwaway account.

### 2026-09-18 - X read for real
Ran the helper against a real throwaway X account. It logged in with the connected login and reached X's
search page, but Camoufox got "Something went wrong" on every search, even after logging in by hand, while the
same account searched fine in normal Chrome: X rejects that browser fingerprint, not the login. The reader now
drives real Chrome through Playwright, and the same run pushed 20 real tweets for the saved phrase, which the app
showed as 20 matches "checked by your helper". Also fixed: sidebar and timeline posts were pushed as matches
when X padded a quiet search, so the helper now keeps only tweets that contain the phrase; it reloads twice on
X's transient error. Python tests 52.

### 2026-09-19 - Facebook helper
Added Facebook the same way as X: `clients/facebook_push.py` loads the connected Facebook login and the
person's Facebook phrases from the app, searches Facebook's recent posts in real Chrome and pushes matches
to the existing `/ingest` door, so no backend change was needed. The X helper's round loop is now shared
(`platform`, `search`, `to_post`), and the Keywords page offers Facebook with the same "small helper on your
computer" steps. Checked the reader against stand-in pages in real Chrome and against the real Facebook site,
which answers a fake login with a bare "Not Found" on search; that is now reported as a refused login.
Python tests 68. Still to do: a run with a real Facebook login, where the page selectors may need a fix.

### 2026-09-21 - Facebook read for real
Ran the Facebook helper with a real throwaway account: the login was accepted and search worked, but the reader
found nothing because Facebook's search results are not `role="article"` cards. Saved the rendered page, found
the real markup (`aria-posinset` cards in a `role="feed"`, the message in `story_message`, the author in an
"Actions for this post by" label) and that Facebook only fills in a post's address while the mouse is over its
timestamp, so the reader now hovers to read it and falls back to a stable id. The real run pushed 4 real posts and
the app showed 4 matches "checked by your helper". Gaps: comment counts read as 0. Python tests 70.

### 2026-09-21 - Firecrawl and AgentMail
Added two more integrations. Firecrawl: the onboarding brand step now reads the person's own website through
Firecrawl's scrape API (`convex/brand.ts`, `convex/lib/firecrawl.ts`), keeps the cleaned facts in a `brands` table, and
feeds a short summary of the business into scoring so scores reflect fit. Run against a real company site it returned
a clean brand, and it caught a case where the model wrote "N/A" as a location, which is now treated as empty.
AgentMail: strong matches are emailed as a plain-text digest (`convex/alerts.ts`, `convex/lib/agentmail.ts`) by a
5-minute cron, with a Settings form and a test email; the limits are 5 matches per email and one email per person per
10 minutes, and a failed send is retried, never marked as sent. Env vars: `FIRECRAWL_API_KEY`, `AGENTMAIL_API_KEY`,
`AGENTMAIL_INBOX_ID`. Backend tests 107, web tests 174. Still to do: run both with real keys on a deployment.

### 2026-09-21 - proxies made mandatory and hidden
Reading X and Facebook now always goes through a proxy the operator sets on the deployment, and people can no
longer see or set one: the proxy box is gone from Settings and the browser extension, the "Via proxy / Direct"
badges are gone, and connection-trouble messages say it is on our side. A new `GET /proxy` endpoint
(`convex/http.ts`, `convex/lib/proxy.ts`) gives the proxy only to a helper holding a valid ingest key; helpers
refuse to start when the deployment has none. Checked with a real Chrome browser through a local proxy that
demands a password. Env var names: `PROXY_URL`, `PROXY_REQUIRED` (operator-only). Backend tests 114, web tests 179,
Python tests 85. Also: the landing page website box now leads into onboarding (the typed website waits in the
brand step after sign-in) and the landing header is just the logo, Sign in and Get started. Still to do: a real
proxy provider and `PROXY_URL` on the deployments.

### 2026-09-21 - Firecrawl and AgentMail run for real on dev
Set `FIRECRAWL_API_KEY`, `AGENTMAIL_API_KEY` and `AGENTMAIL_INBOX_ID` on the dev deployment and tried both in the
real app. Firecrawl: pasting a real company website in onboarding saved its real name, tagline, logo, tone and eight
offerings to the `brands` table, and an internal network address was refused before any call. AgentMail: saving an
address in Settings and pressing "Send a test email" delivered the message through AgentMail's API, and it arrived in the
inbox with the expected text. Free-plan limit to know: 10 emails a day. Still to do: the same on the prod deployment, and
a real strong-match email once OpenAI scoring has a key.

### 2026-09-21 - prod redeployed, docs fixed
Deployed the backend and site to the live deployment and checked it signed in on the live URL: the onboarding brand
step read a real company website through Firecrawl (name, tagline, eight offerings), the dashboard Docs tab showed
the docs, and a test email sent from Settings arrived through AgentMail. The Docs tab had been showing the app inside
itself on the hosted site, because the docs are a separate Next.js app; they are now exported as static files and
shipped inside the site (`scripts/build-site.mjs`, `apps/docs/next.config.ts`), and a docs address without `.html`
redirects to its page file. Added `SUBMISSION.md` with the video script, the short post and the submission form text.
Env var names now set on the live deployment: `FIRECRAWL_API_KEY`, `AGENTMAIL_API_KEY`, `AGENTMAIL_INBOX_ID`.
Still to do: `OPENAI_API_KEY` and `PROXY_URL` on the deployments.

### 2026-09-21 - helpers save proxy traffic
The X and Facebook helpers now skip pictures, video and fonts, because the proxy is paid for by the gigabyte and the helper only reads
text. A test with a real proxy that demands a password proves the picture and the video are never fetched, and both helpers still
read real X (19 tweets) and real Facebook (3 posts) with images off.

### 2026-09-21 - proxy set and checked
Set the operator proxy (`PROXY_URL`, a residential proxy from a paid provider) on the dev and live deployments and checked it end to end:
Chrome started the helper's way exits at a different address than the machine's own, both real helpers read X and Facebook through it with
the mandatory rule enforced and no waiver, and the live `/proxy` endpoint gives it only to a valid ingest key. People still cannot see or set one.

### 2026-09-21 - a Free plan with limits, and pricing
Added plans. Everyone is on Free, enforced on the server: one phrase and one connected account per platform at a time
(`convex/lib/plan.ts`, checked in `keywords:create` and the account creators, with a usage query in `convex/plan.ts`). A Pricing
section on the landing page, a working Billing tab in Settings that shows usage, and a notice that stops the Keywords button
when a platform is full make it visible. Pro is announced as coming soon and nothing charges. The operator can raise limits per
deployment with `PLAN_PHRASES_PER_PLATFORM` and `PLAN_ACCOUNTS_PER_PLATFORM`. Checked in a real browser on the dev deployment.
Backend tests 127, web tests 187.

