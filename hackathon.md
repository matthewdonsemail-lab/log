# Hackathon log

- **Project:** ListeningKit Logbook
- **Event:** Convex All Gas Hackathon
- **What it does:** Social-listening dashboard that watches Facebook, X, and Reddit for keywords you care about and pushes a notification on hits.
- **Live app:** not deployed
- **Repo:** https://github.com/matthewdonsemail-lab/log
- **Frontend:** Convex static hosting
- **Convex deployment:** not deployed
- **Components:** none
- **Convex features:** none yet
- **Auth:** none
- **AI models:** none
- **Started:** 2026-09-12T21:03:28Z
- **Last updated:** 2026-09-15T23:32:48Z

## Log

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
