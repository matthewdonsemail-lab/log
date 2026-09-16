# Communities lifecycle (join-state machine)

Companion to `marketplace_update.md`. Covers the group-membership lifecycle
the dashboard's Groups UI round-trips: join, withdraw, accept, decline,
leave, and platform removal. Every mutation runs through the state machine
(`apps/web/src/lib/communities/machine.ts`) in the store before writing —
a refused move 409s with the machine's human reason, and the row menu
(`communityMenuItems` in `DashboardGroups.tsx`) only offers the moves the
same machine allows, so the menu and the store can never disagree.

## States

`CommunityJoinState` (`apps/web/src/lib/communities/types.ts`):
`none | pending | limited | accepted | declined | removed | login-wall |
unknown`. `removed` carries `removedBy: 'user' | 'platform'` provenance —
a self-leave rejoins freely, a group removal rejoins only at the group's
discretion (mirrors the listings takedown-vs-delist relist split).
`login-wall` / `unknown` are poller observations: only a platform run can
write one and only the next platform run resolves out of one.

## Transition table

| From | User (dashboard) | Platform (poller / mock admin) |
|---|---|---|
| `none` | → `pending` (facebook join), → `accepted` (x/reddit join) | → `pending`, → `accepted` (out-of-band join observed) |
| `pending` | → `none` (withdraw) | → `accepted` (approved), → `declined` (rejected) |
| `limited` | → `removed` (leave, `removedBy: 'user'`) | → `accepted` (full membership), → `pending` (re-gated), → `removed` (purged) |
| `accepted` | → `removed` (leave, `removedBy: 'user'`) | → `removed` (kicked, `removedBy: 'platform'`) |
| `declined` | → `pending`, → `accepted` (re-ask, answers kept) | → `pending`, → `accepted` (re-ask observed) |
| `removed` (`user`) | → `pending`, → `accepted` (rejoin) | → `pending`, → `accepted` |
| `removed` (`platform`) | refused (409, group discretion) | → `pending`, → `accepted` |
| `login-wall`, `unknown` | refused until next clean observation | → any state |

Same-state moves are refused (no-op guard lives in the routes, not the
machine). User moves compose with the joining account's issue: `suspended`
and `read_only_limited` (`WRITE_BLOCKING_ISSUES`, shared with the listings
machine via `apps/web/src/lib/account-state.ts`) refuse every user move —
the platform would reject the write, so the store 409s first.

## Routes (`apps/web/src/lib/communities/server.ts`)

| Route | Move | Responses |
|---|---|---|
| `POST /communities/:id/join` | user join / rejoin (facebook needs `accountId` + full `answers`) | `201` joined, `200` already pending/accepted/limited, `400` bad answers/account, `404` unknown id, `409` machine refusal |
| `POST /communities/join-by-url` | same, by pasted URL (registers unseen groups) | same as join |
| `POST /communities/:id/accept` | mock admin approve (`pending`/`limited` → `accepted`) | `200`, `400` nothing to accept, `404`, `409` |
| `POST /communities/:id/decline` | mock admin reject (`pending` → `declined`, answers kept) | `200`, `400` nothing to decline, `404`, `409` |
| `POST /communities/:id/remove` | mock platform removal (`accepted`/`limited` → `removed`, `removedBy: 'platform'`) | `200`, `400` not a member, `404`, `409` |
| `DELETE /communities/:id` | user exit (`pending` → `none` withdraw, `accepted`/`limited` → `removed` self-leave) | `200 { communities }`, `404`, `409` |

## Client surface (`apps/web/src/lib/communities/index.ts`)

`getCommunities`, `joinCommunity`, `joinCommunityByUrl`,
`resolveCommunityByUrl`, `acceptCommunity`, `declineCommunity`,
`removeCommunityMember`, `leaveCommunity` — each throws the server's
`{ error }` message so toasts read the machine reason verbatim.

## Live-client mapping (facebook-camofox-client)

The poller owns the platform column: reporting approvals, declines,
limited promotions, removals, and login-wall/unknown observations through
these same transitions. The dashboard keeps the user column. Swapping the
mock for the live backend stays a transport change: the Groups page and
the join form keep calling the client functions above unchanged.
