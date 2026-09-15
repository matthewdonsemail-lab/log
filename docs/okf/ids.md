# Opaque id contract (UUIDs v4 + preserved native ids)

Companion to the per-domain route docs (e.g. `marketplace_update.md`).
Covers how every app-level id is minted, how platform-native ids ride
alongside them, and what survives migration — because the live clients
must mint and preserve ids exactly the same way, or dashboard FKs
(`accountId`, `threadId`, `listingId`) silently stop resolving.

## Rule: one generator, opaque ids, native ids alongside

Every opaque app-level id is a random UUID v4 minted from the single
generator in `apps/web/src/lib/ids.ts` (`uuid()`:
`crypto.randomUUID()` with a v4-hex fallback, so no `node:crypto`
import and the browser bundle is untouched). No domain rolls its own:
`apps/web/src/lib/messaging/uuid.ts` re-exports it, and
`api/mock.ts#apiKeyId`, `keywords/mock.ts#keywordId`, and
`connections/store.ts#newAccountId` each delegate to it.

Each record carries the opaque `id` the dashboard joins on, plus the
platform-native id preserved verbatim for display and client calls:

| Record | Opaque `id` | Native id (preserved, never joined on) |
|---|---|---|
| `Thread` (`messaging/types.ts`) | UUID, minted by `startThread` | `platformThreadId` (`dm_conversation_id` / `thread_key` / `t4_` first-message name) |
| `ChatMessage` | UUID, minted by `buildMessage` | `platformMessageId` (19-digit X event id / `mid` / `t4_` id) |
| `ListingRecord` (`listings/types.ts`) | UUID, minted at the create route and backfilled onto persisted rows | `listingId` (numeric Marketplace id) |
| `ConnectionRecord` | UUID, minted by `POST /accounts` via `newAccountId()` | none — `platform` + `label` identify the account to a human |
| `ApiKey` | UUID, minted by `apiKeyId()` | `prefix` (`lk_live_4f7ak2••••••••`, display only) + `secretHash` (SHA-256, verification only) |
| `Keyword` | UUID, minted by `keywordId()` | none |
| `Community` | UUID, minted at resolve time | `url` (nullable; set for resolved rows) |
| `BarkConnection` (`notifications/bark.ts`) | UUID, minted by `barkConnectionId()` | none |
| `BrandEntity` | literal `'brand-default'` (one row per workspace) | none |

## Rule: never derive an app id from outside input

Regressions this fixes (all caught in review, all covered by tests):

- `POST /accounts` used its own `account-<timestamp>-<rand>` scheme —
  now calls `newAccountId()`.
- The v1→v2 account migration keyed rows by bare `platform`
  (`id: r.platform`), which collided two Facebook accounts — now mints
  a UUID per row (`connections/store.ts#migrateLegacy`).
- Bark connections used `bark-<timestamp>-<rand>` — now `uuid()`.
- `communityFromSubreddit` / `communityFromGroupUrl` derived
  `reddit-link-<key>` / `facebook-link-<slug>` from the pasted input,
  colliding on slug reuse — now `uuid()`
  (`communities/mock.ts`).
- Listings previously joined on the native `listingId` alone — now
  `ListingRecord.id` is the PK and `listingId` is the native mirror
  (README `erDiagram` models it exactly like `THREAD`).

`Math.random().toString(36)` survives in exactly one place —
`messaging/store.ts#rand36` — and that is correctly scoped to
*synthesizing plausible platform-native ids* (`fbm_…`, `t4_…`,
numeric `thread_key`, 19-digit X event ids), never to app-level keys.

## Fixtures keep literal ids (do not "fix" them)

Seed rows are cross-referenced by literal id across stores, identity
maps, and ~30 test assertions — they are fixtures, not derived ids:

- `MOCK_CONNECTIONS` (`connections/mock.ts`): 11 slug ids
  (`fb-galway-rubbish`, `fb-pacer`, `fb-personal`, `x-listeningkit`,
  `x-ops`, `x-legacy`, `reddit-listeningkit`, `reddit-watch`,
  `x-archived`, `x-challenge`, `reddit-captcha`). Listings FKs,
  `messaging/identities.ts`, and `api/activity.ts` pin these.
- Keyword and api-key seeds carry literal UUIDs (e.g.
  `keywords/mock.ts`, `api/mock.ts#SEED_API_KEYS`).
- Messaging seeds mint thread/message ids via `uuid()` at module load
  and export the maps (`X_THREAD_IDS`, `FB_THREAD_IDS`,
  `REDDIT_THREAD_IDS`, `X_T1_M1`) so tests pin constants, not
  literals. The intentional bogus `x-t404` stays — it must 404.

## Migration rules (persisted rows)

- Account rows without a valid v2 shape are re-keyed per row (never
  re-keyed by platform); stale platforms are filtered out.
- Listing rows predating `id` get one minted on load
  (`migrateListingRow` backfills `id` *before* the `accountId`
  early-return, so every row is covered); rows lacking `accountId`
  resolve it from the legacy label.
- Api-key rows persisting a full `key` field fail the shape guard and
  fall back to seeds — the plaintext secret exists exactly once, in
  the create response, and is never stored.

## Live-client mapping

Any client that creates rows (camoufox clients, accounts service,
notifications backend) must:

1. Mint UUID v4 for every new opaque `id` (account, key, keyword,
   thread, message, listing, community, Bark connection).
2. Preserve the platform-native id verbatim alongside it
   (`platformThreadId`, `platformMessageId`, `listingId`) — never
   substitute, trim, or re-derive it.
3. Never derive an app id from a slug, URL, timestamp, counter, or
   platform name.
4. Keep seed/fixture ids byte-identical where the mock pins them
   (the 11 connection slugs above); tests assert them literally.
