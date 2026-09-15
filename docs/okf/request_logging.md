# Request logging: opt-in, redacted, exactly once

Companion to `mock_transport.md`. Covers the debug logger that prints
every API JSON the dashboard receives — because an agent extending or
replicating it must preserve its three invariants: **opt-in** (never on
by default), **redacted before stringify** (never after), and
**exactly one line per request** on every consumption path.

## Rule: the gate is an env flag, evaluated per request

- Dashboard / vitest: `VITE_MOCK_API_LOG_REQUESTS=1`
- Standalone `mock:server`: `MOCK_API_LOG_REQUESTS=1`

Off (unset, or anything but `1`/`true`) the middleware is a pure
pass-through (`await next()`, zero overhead, zero output). Local
enablement: `apps/web/.env` (gitignored — never committed) plus a
`vite dev` restart, since Vite bakes env at startup. Tests toggle it
at runtime with `vi.stubEnv` (`request-log.test.ts`).

## Rule: secrets are stripped by field NAME, before stringifying

`redactForLog` (`apps/web/src/lib/request-log.ts`) deep-copies the
request and response bodies and replaces these fields with
`[redacted]` — recursively, before `JSON.stringify` ever runs:

| Field | Where it appears | Why it must never log |
|---|---|---|
| `key` | `CreatedApiKeyResponse.key` — the full secret, shown exactly once by design | logging it prints the secret a second time into a log stream |
| `secretHash` | every `ApiKey` list row | SHA-256 of the secret; no reason to duplicate it into logs |
| `cookie` | `ConnectionRecord` rows and connect/resolve bodies | pasted extension session material |
| `deviceKey` | Bark connections / push inputs | authenticates pushes to the external Bark server |

Non-secret fields (ids, labels, statuses, counts) pass through, so the
log stays useful for debugging route shapes. Bodies are read from
request/response **clones** — handlers and callers still receive the
full, unredacted payloads. Lines are capped at 2000 chars
(`…[truncated]`).

Out of scope on purpose: `notifications/bark.ts` posts to an external
server outside the Hono app, and `DashboardLocationPicker` fetches an
external geocoder — neither flows through this middleware, and the
Bark `deviceKey` (embedded in its request URL) must stay out of any
network-level logger too.

## Rule: mount on the leaf apps, tag from the path

Each domain server mounts the one shared implementation —
`apiKeysApp`, `brandApp`, `feedApp`, `communitiesApp`,
`keywordsApp`, `connectionsApp`, `listingsApp`, plus the shared
messaging route factory (covers facebook/x/reddit in one place).
`mockApiApp` carries **no** middleware of its own: dashboard traffic
calls the sub-apps directly (see `mock_transport.md`), and requests
arriving through the root inherit the leaf line via `.route()`.

Two Hono behaviors this defends against (both proven by test, both
will bite any re-implementation):

1. `.route()` **replays** leaf middleware once per mount — a root
   request otherwise logs 5–8 lines. The first copy to run logs and
   stamps a context flag (`requestLogged`); replays see the flag and
   skip. Exactly one line per request on every path.
2. The first merged copy to run is **not** the handling domain
   (registration order wins), so the tag is derived from the request
   path, not the mount: `/accounts` → `[mock-api:accounts]`,
   `/messaging/<platform>/…` → `[mock-api:messaging/<platform>]`,
   direct leaf calls (`/x/threads…`) → `[mock-api:messaging/x]`.

Line shape (all dashboard routes under `DashboardLayout` emit these
once the flag is on):

```text
[mock-api:accounts] GET /accounts -> 200 2ms {"req":…,"res":{…}}
```

## Live-client mapping

Keep the same three invariants in any live-backend logger: env-gated
opt-in with the same variable names, the same four redacted field
names (extend the set, never shrink it), and one line per request
regardless of how routes are composed. Console output of a debug
session must never become a second copy of the secrets.
