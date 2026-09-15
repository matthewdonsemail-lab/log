# Mock transport: how the dashboard talks to the API

Companion to the per-domain route docs (e.g. `marketplace_update.md`)
and to `ids.md`. Covers the single rule every dashboard page follows
when it reads or writes — because swapping the mock for the live
backend must stay a transport change, with zero page-level rewrites.

## Rule: every mutation is a route round-trip through the domain sub-app

Dashboard pages never touch a store directly and never mutate local
copies past the API. Each domain exposes one client module whose
functions call that domain's Hono sub-app **in-process**
(`<domain>App.request(…)`, no network), and pages reconcile from the
returned payload:

| Dashboard calls | Which app object | Example |
|---|---|---|
| `api/index.ts` | `apiKeysApp` (`api/server.ts`) | `createApiKey` → `POST /api-keys` returns the secret once |
| `brand/index.ts` | `brandApp` | brand get/upsert |
| `communities/index.ts` | `communitiesApp` | join-by-URL, resolve |
| `keywords/index.ts` | `keywordsApp` | create (scope-checked live against the communities app) |
| `connections/index.ts` | `connectionsApp` | `getAccounts`, `saveAccount`, challenge resolve |
| `listings/index.ts` | `listingsApp` | `saveListing`, `setListingStatus` (reconcile from the returned roster) |
| `feed/index.ts` | `feedApp` | `GET /feed[?platform=&search=]` |
| `messaging/index.ts` | `messagingApp` (`/facebook`, `/x` + legacy `/twitter` alias, `/reddit`) | threads, messages, send, ack |

`mockApiApp` (`lib/mock-api.ts`) is **not** in this path. It exists for
three things only: the generated OpenAPI spec, the standalone
`mock:server` playground (real HTTP on port 5174), and the coverage
tests. Nothing the dashboard renders goes through the root.

## Messaging reconcile contract (the pattern every page follows)

- `GET /threads?accountId=` → `{ threads }`, newest first; unknown
  accounts resolve to an empty inbox (not an error).
- `POST /threads/:threadId/messages` → `{ message, thread }` — the
  created message plus the thread with `preview`/`updatedAt` in sync,
  so the client reconciles its optimistic bubble from the response
  (`DashboardMessages.tsx` swaps it into `threads` by id).
- `POST /threads/:threadId/ack` → `{ threadId, acknowledged }`
  (NOT the thread — callers needing the row re-read it). Idempotent:
  acking an already-read thread is `200` with `acknowledged: 0`.
  The view clears `unread` optimistically and fires the ack underneath.

## Known store caveat (do not "fix" piecemeal — Part B owns it)

`messaging/store.ts` mutates thread objects in place (`preview`,
`updatedAt`, `unread`) and emits no pub/sub or invalidation signal —
today only `DashboardMessages.tsx` reads that state, so it is
invisible. The moment a second surface (sidebar badge, toast system,
issue notifier) reads the same store, it will go stale. The planned
fix is architectural, not local: Part B's transition-trigger function
for issue notifications must double as the single
invalidate/refresh path for every UI surface reading that data,
rather than a second bolt-on per store.

## Live-client mapping

When the real backend lands, point each domain client module at it
(base URL + auth) and change nothing else: routes, request/response
shapes, error codes (`400` validation naming the field, `404` unknown
id, `409` duplicate/challenge-state), and the reconcile pattern above
stay identical. `POST /api-keys` still returns the full secret exactly
once; lists still expose prefix/hash only (see `request_logging.md`
for what must never be logged).
