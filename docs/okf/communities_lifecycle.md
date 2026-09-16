# Communities lifecycle (platform machines)

Companion to `marketplace_update.md`. Group membership is enforced by
per-platform xstate v5 machines — `apps/web/src/lib/communities/facebook/`,
`reddit/`, `x/` — never by hand in routes. Actors are ephemeral per
request: the flat row (`StoredCommunityJoin`, store key
`communities.joins.v2`) replays through the platform bootstrap events, the
new events are sent, and the snapshot writes back to flat fields. User
intents run a verdict pre-check first and 409 with the machine reason, so
the row menu (`lib/communities/menus.ts`, which dispatches to the same
machines) and the store agree by construction.

Shared pieces: `transition.ts` (verdict type, account write gate,
question-set hashing), `account-state.ts` (terminal/stalled gate,
`WRITE_BLOCKING_ISSUES`), `actors.ts` (`driveMachine`).

## Facebook (`facebook/`)

No official API exposes entry questions — the browser client scrapes the
join dialog and reports back, so `entryQuestions` is the scraped set when
`questionsHash` is set, else the catalog fallback. Answers are keyed by
question-set hash; a changed set re-asks from blanks.

Lifecycle: `notMember → inspectingGate → formRendered → formIncomplete →
formSubmitting → pendingApproval → fullMember`, with `formAbandoned`
(modal idled past `FACEBOOK_MODAL_LEASE_MS`, drafts kept),
`limitedMember` (auto-accept path + observed demotion, `PROMOTED` back),
`declined` (answers kept), `removed` (`removedBy` provenance — self-leave
rejoins freely, platform removal gated on the group), and
`observationWall` (platform-only, restore replays the stashed
`priorJoinState`).

Partial submits are accepted: Facebook lets requests through unanswered,
so the row records `answersComplete: false` and reads
"Request sent with N of M answers". Pre-submit modal phases map to the
shared `none` join state — no request has reached the group yet.

## Reddit (`reddit/`)

No questionnaires, no approval queue — subscription plus access gates
observed from `about.json` (`subreddit_type`, `user_is_subscriber`) and
contributor flags: `unsubscribed`, `subscribed`, `restrictedReadOnly`
(read-only listening, outreach off), `privateGated` (modmail is the only
move), `quarantineGate` (opt-in intent, confirmed on observation),
`gone` (banned/archived, untrack note), `observationWall`. One root
`METADATA_OBSERVED` dispatch table routes every poller observation from
any state; a clean fetch supersedes walls. `karmaGated` is a tag with
alt-observer evidence, never a state — and never inferred from an
unauthenticated probe (those 403 since May 2026). Tail `subreddit_type`
values normalize to `unclassified`, never to a wrong state.

## X (`x/`)

Deliberately trivial: `unsubscribed ↔ subscribed` plus the shared wall.
Exists so every platform dispatches through the same seam.

## Client tasks (`lib/client-tasks/`)

The dashboard half of a long-lived platform job: the manager holds intent
+ drafts + lease, the browser client holds the live modal. States
`queued → running → awaiting_input → submitting → done`, plus `failed`,
`abandoned` (explicit cancel), `expired` (lease lapsed with no heartbeat).
Time passes only through event timestamps, so expiry is deterministic.
A dead client never silently completes — drafts survive for resume, and
the form reopens tasks, heartbeats while open, and completes them on
join.

## Routes (`communities/server.ts`)

| Route | Move |
|---|---|
| `POST /communities/:id/join` | per-platform join/submit (partial FB answers flagged) |
| `POST /communities/join-by-url` | same, by pasted FB URL |
| `POST /communities/resolve` | FB read-ahead + scrape provenance stamp |
| `POST /communities/resolve-reddit` | typed subreddit → observed public + subscribed |
| `POST /communities/:id/accept`, `/decline`, `/remove` | FB mock-admin (platform source) |
| `POST /communities/:id/form` | client modal webhook: rendered/incomplete/abandoned |
| `POST /communities/:id/resume` | reopen an abandoned FB form with drafts |
| `POST /communities/:id/observe` | poller webhook: metadata, karma, walls, clears |
| `POST /communities/:id/request-access`, `/quarantine-opt-in` | reddit user intents |
| `DELETE /communities/:id` | per-platform leave/withdraw/unsubscribe |

## Live-client mapping

The poller owns the platform column (approvals, declines, metadata,
walls, karma evidence) via the webhook routes; the dashboard keeps the
user column. Swapping the mock for live backends stays a transport
change: page, form, and client functions keep their shapes.
