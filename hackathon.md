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
- **Last updated:** 2026-09-15T17:08:36Z

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
