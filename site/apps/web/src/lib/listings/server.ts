import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { MOCK_LISTINGS, resolveListingAccountId, resolveListingAccountLabel } from './mock'
import { MOCK_CONNECTIONS } from '../connections/mock'
import { DEFAULT_LISTING_LOCATION, LISTING_STATUSES } from './types'
import type { ListingDraft, ListingLocation, ListingRecord, ListingStatus } from './types'
import { allowedTransition } from './machine'
import type { TransitionSource } from './machine'
import { uuid } from '../ids'
import { isArray, isRecord, loadPersistedState, savePersistedState } from '../persist'
import { ListingResponseJson, ListingsResponseJson, ListingStatusResponseJson, errorResponse } from '../openapi'
import { requestLogger } from '../request-log'

const LISTINGS_KEY = 'listings'

function isListingArray(value: unknown): value is ListingRecord[] {
  return (
    isArray(value) &&
    value.every(
      (row) =>
        isRecord(row) &&
        (typeof (row as { id?: unknown }).id === 'string' ||
          typeof (row as { listingId?: unknown }).listingId === 'string')
    )
  )
}

/** Backfill the `accountId` FK on legacy persisted rows that only carry a label. */
function migrateListingRow(row: ListingRecord): ListingRecord {
  // Every row carries the opaque `id`; rows persisted before it existed get one minted.
  const ensured: ListingRecord = { ...row, id: typeof row.id === 'string' ? row.id : uuid() }
  if (typeof (row as { accountId?: unknown }).accountId === 'string') return ensured
  const legacyLabel = typeof row.account === 'string' ? row.account : 'Facebook'
  const accountId = resolveListingAccountId(legacyLabel)
  return { ...ensured, accountId, account: resolveListingAccountLabel(accountId) }
}

/**
 * In-memory listing store. Seeds with MOCK_LISTINGS; form-created listings
 * are appended at the top and polled by status like the seeded rows.
 * Persisted to localStorage on every write and rehydrated on load, so
 * edits and status changes survive a refresh instead of resetting to seeds.
 * Legacy rows without `accountId` are migrated on load.
 */
let listings: ListingRecord[] = (
  loadPersistedState(LISTINGS_KEY, isListingArray) ?? [...MOCK_LISTINGS]
).map(migrateListingRow)

function persistListings(): void {
  savePersistedState(LISTINGS_KEY, listings)
}

/** Marketplace-style numeric id (17 digits, like the captured live ids). */
function nextListingId(): string {
  return String(10 ** 16 + Math.floor(Math.random() * 9 * 10 ** 16))
}

/**
 * Normalize a draft's targeting point: finite lat/lng pass through, radius
 * clamps to 1–200 km, anything else falls back (edit keeps the stored
 * point, create takes the Galway default).
 */
function toLocationPoint(value: unknown, fallback?: ListingLocation): ListingLocation {
  if (isRecord(value)) {
    const record = value as { lat?: unknown; lng?: unknown; radiusKm?: unknown }
    if (
      typeof record.lat === 'number' &&
      Number.isFinite(record.lat) &&
      typeof record.lng === 'number' &&
      Number.isFinite(record.lng)
    ) {
      const radius =
        typeof record.radiusKm === 'number' && Number.isFinite(record.radiusKm)
          ? Math.min(200, Math.max(1, Math.round(record.radiusKm)))
          : (fallback?.radiusKm ?? DEFAULT_LISTING_LOCATION.radiusKm)
      return { lat: record.lat, lng: record.lng, radiusKm: radius }
    }
  }
  return fallback ?? DEFAULT_LISTING_LOCATION
}

/**
 * Hono-shaped listings API. Mock-backed for now — the real endpoints come
 * from facebook-camofox-client (`GET /api/listings`, `POST /api/listings`,
 * `GET /api/listings/{id}/status`). When that backend lands, point the
 * client at it; routes and response shapes stay the same.
 */
export const listingsApp = new Hono()
  .use('*', requestLogger())
  .get('/listings', describeRoute({ operationId: 'listListings', tags: ['Listings'], summary: 'List listings', description: 'Lists all Marketplace listings — seeded `MOCK_LISTINGS` plus any user-created rows (persisted to localStorage, migrated for legacy `accountId` FKs). Each has `listingId`, title/price/location, 1–4 images (first is cover), `accountId` FK, `locationPoint` (lat/lng + radius 1–200km), and `status`. This is the source for the dashboard Listings table. Code: apps/web/src/lib/listings/server.ts:77', responses: { 200: { description: 'Listings.', content: { 'application/json': { schema: ListingsResponseJson } } } } }), (c) => c.json({ listings: [...listings] }))
  .post('/listings', describeRoute({ operationId: 'createListing', tags: ['Listings'], summary: 'Create listing', description: 'Creates a new Marketplace listing. Validates `title`, `price`, `location` (all trimmed non-empty), at least one `images` string, and a Facebook `accountId` (resolves legacy label via `resolveListingAccountId`, falls back to `fb-personal`). Generates a 17-digit `listingId`, sets `category`/`condition` defaults, `locationPoint` clamped 1–200km, `status: under-review`, and `listingUrl`. Persists and returns 201. Code: apps/web/src/lib/listings/server.ts:79', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { title: { type: 'string', description: 'Listing title.' }, price: { type: 'string', description: 'Price string.' }, location: { type: 'string', description: 'Human location.' }, images: { type: 'array', items: { type: 'string' }, description: 'Photo URLs, first is cover.' }, accountId: { type: 'string', description: 'Facebook account id.' }, category: { type: 'string' }, condition: { type: 'string' }, locationPoint: { type: 'object', description: 'lat/lng/radiusKm.' } }, required: ['title','price','location','images'] } } } }, responses: { 201: { description: 'Created (under-review).', content: { 'application/json': { schema: ListingResponseJson } } }, 400: errorResponse('A listing needs a title/price/location/photo/account') } }), async (c) => {
    const body = await c.req.json<ListingDraft & { account?: string }>().catch(() => null)
    if (!body) return c.json({ error: 'Invalid request body' }, 400)
    const title = (body.title ?? '').trim()
    const price = (body.price ?? '').trim()
    if (!title) return c.json({ error: 'A listing needs a title' }, 400)
    if (!price) return c.json({ error: 'A listing needs a price' }, 400)
    const location = (body.location ?? '').trim()
    if (!location) return c.json({ error: 'A listing needs a location' }, 400)
    // A marketplace listing without a photo doesn't sell — the picker enforces
    // one too; this keeps the route honest if called directly.
    const images = (body.images ?? []).filter((image) => typeof image === 'string' && image.length > 0)
    if (images.length === 0) return c.json({ error: 'A listing needs at least one photo' }, 400)
    // FK first: the draft carries the stable account id; legacy callers may
    // still send a label — resolve either way, then validate the account.
    const rawAccount = (body.accountId ?? body.account ?? '').trim()
    const accountId = rawAccount.includes(' ')
      ? resolveListingAccountId(rawAccount)
      : rawAccount || 'fb-personal'
    const account = MOCK_CONNECTIONS.find((row) => row.id === accountId)
    if (!account || account.platform !== 'facebook') {
      return c.json({ error: 'A listing needs a connected Facebook account' }, 400)
    }
    const listingId = nextListingId()
    const listing: ListingRecord = {
      id: uuid(),
      listingId,
      title,
      price,
      // Category / condition have form defaults; fall back to the mock norm.
      category: (body.category ?? '').trim() || 'Household',
      condition: (body.condition ?? '').trim() || 'Used - fair',
      location,
      locationPoint: toLocationPoint(body.locationPoint),
      accountId: account.id,
      account: account.label,
      // First photo is the cover; up to four fan out in the row.
      images: images.slice(0, 4),
      // Every new listing sits in review before the client confirms it live.
      status: 'under-review',
      listingUrl: `https://facebook.com/marketplace/item/${listingId}`,
      publishedAt: new Date().toISOString()
    }
    listings = [listing, ...listings]
    persistListings()
    return c.json({ listing, listings: [...listings] }, 201)
  })
  .patch('/listings/:id', describeRoute({ operationId: 'updateListing', tags: ['Listings'], summary: 'Update listing', description: 'Patches a listing\'s details/photos in place — `id`, `listingId`, `listingUrl`, `publishedAt`, and `status` stay put; only `title`, `price`, `location`, `category`, `condition`, `images` (sliced to 4), `locationPoint`, and `accountId` (resolves legacy label or keeps stored FK) move. Validates title/price/location + photo presence, 404 if unknown. Code: apps/web/src/lib/listings/server.ts:123', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', description: 'Opaque listing id (UUID).' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { title: { type: 'string' }, price: { type: 'string' }, location: { type: 'string' }, images: { type: 'array', items: { type: 'string' } }, accountId: { type: 'string' }, category: { type: 'string' }, condition: { type: 'string' } } } } } }, responses: { 200: { description: 'Updated.', content: { 'application/json': { schema: ListingResponseJson } } }, 400: errorResponse('Invalid request body / missing title/price/location/photo'), 404: errorResponse('Listing not found') } }), async (c) => {
    // Edit a listing's details/photos in place — id, url, timestamps and
    // review status stay put; only the form-owned fields move.
    const id = c.req.param('id')
    const current = listings.find((row) => row.id === id)
    if (!current) return c.json({ error: 'Listing not found' }, 404)
    const body = await c.req.json<Partial<ListingDraft> & { account?: string }>().catch(() => null)
    if (!body) return c.json({ error: 'Invalid request body' }, 400)
    const title = (body.title ?? '').trim()
    const price = (body.price ?? '').trim()
    if (!title) return c.json({ error: 'A listing needs a title' }, 400)
    if (!price) return c.json({ error: 'A listing needs a price' }, 400)
    const location = (body.location ?? '').trim()
    if (!location) return c.json({ error: 'A listing needs a location' }, 400)
    const images = (body.images ?? []).filter((image) => typeof image === 'string' && image.length > 0)
    if (images.length === 0) return c.json({ error: 'A listing needs at least one photo' }, 400)
    // Account scope may move on edit: resolve the incoming id (or legacy
    // label) and fall back to the stored FK when nothing was sent.
    const rawAccount = ((body.accountId ?? body.account ?? '') as string).trim()
    const nextAccountId = rawAccount
      ? rawAccount.includes(' ')
        ? resolveListingAccountId(rawAccount)
        : rawAccount
      : current.accountId
    const nextAccount =
      MOCK_CONNECTIONS.find((row) => row.id === nextAccountId) ??
      MOCK_CONNECTIONS.find((row) => row.id === current.accountId)
    const updated: ListingRecord = {
      ...current,
      title,
      price,
      category: (body.category ?? '').trim() || current.category,
      condition: (body.condition ?? '').trim() || null,
      location,
      locationPoint: toLocationPoint(body.locationPoint, current.locationPoint),
      accountId: nextAccount?.id ?? current.accountId,
      account: nextAccount?.label ?? current.account,
      images: images.slice(0, 4),
    }
    listings = listings.map((row) => (row.id === id ? updated : row))
    persistListings()
    return c.json({ listing: updated, listings: [...listings] })
  })
  .patch('/listings/:id/status', describeRoute({ operationId: 'updateListingStatus', tags: ['Listings'], summary: 'Update listing status', description: 'Transitions a listing\'s `status` via the status route — never local state. `source` says who is driving the move (`seller` = the dashboard\'s Sold/Remove/Reavail/Relist actions, `platform` = the camofox client\'s observation), and `allowedTransition` (apps/web/src/lib/listings/machine.ts) enforces the per-status edge set plus account composition (a suspended / limited account refuses seller writes) and provenance (a platform takedown cannot be relisted by the seller). `removedBy` is stamped with `source` on the way into `removed` and cleared on the way out. 404 if unknown id, 409 on any refused move. Code: apps/web/src/lib/listings/server.ts:180', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', enum: [...LISTING_STATUSES], description: 'New status.' }, source: { type: 'string', enum: ['seller', 'platform'], description: 'Who drives the move (defaults to seller).' } }, required: ['status'] } } } }, responses: { 200: { description: 'Status updated.', content: { 'application/json': { schema: ListingResponseJson } } }, 400: errorResponse('Status / source invalid'), 404: errorResponse('Listing not found'), 409: errorResponse('Refused: illegal status transition for this listing (see error)') } }), async (c) => {
    // Status transitions go through this route — never local state. The
    // machine (allowedTransition) is the single contract: the UI hides the
    // same buttons, the live client is told which of its reports the store
    // accepts, and a bypassed client gets a 409 back.
    const id = c.req.param('id')
    const current = listings.find((row) => row.id === id)
    if (!current) return c.json({ error: 'Listing not found' }, 404)
    const body = await c.req.json<{ status?: unknown; source?: unknown }>().catch(() => null)
    const status = body?.status
    if (typeof status !== 'string' || !(LISTING_STATUSES as string[]).includes(status)) {
      return c.json({ error: `Status must be one of: ${LISTING_STATUSES.join(', ')}` }, 400)
    }
    const source: TransitionSource = body?.source === 'platform' ? 'platform' : 'seller'
    const ownAccount = MOCK_CONNECTIONS.find((row) => row.id === current.accountId)
    const verdict = allowedTransition(current.status, status as ListingStatus, source, {
      removedBy: current.removedBy,
      accountIssue: ownAccount?.lastIssue ?? undefined
    })
    if (!verdict.allowed) return c.json({ error: verdict.reason ?? 'Refused: illegal status transition.' }, 409)
    const updated: ListingRecord = {
      ...current,
      status: status as ListingStatus,
      // Provenance only lives while the listing sits in `removed` — the
      // seller delist vs platform takedown distinction evaporates otherwise.
      removedBy: (status as ListingStatus) === 'removed' ? source : undefined
    }
    listings = listings.map((row) => (row.id === id ? updated : row))
    persistListings()
    return c.json({ listing: updated, listings: [...listings] })
  })
  .get('/listings/:id/status', describeRoute({ operationId: 'getListingStatus', tags: ['Listings'], summary: 'Get listing status', description: 'returns the lightweight status probe for `:id` — `{ id, status, title }` (status typed as `ListingStatus`). Used by the dashboard to poll `under-review → active` transitions without fetching the full record. Code: apps/web/src/lib/listings/server.ts:183', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Status probe.', content: { 'application/json': { schema: ListingStatusResponseJson } } }, 404: errorResponse('Listing not found') } }), (c) => {
    const listing = listings.find((row) => row.id === c.req.param('id'))
    if (!listing) return c.json({ error: 'Listing not found' }, 404)
    return c.json({
      id: listing.id,
      status: listing.status satisfies ListingStatus,
      title: listing.title
    })
  })
  .delete('/listings/:id', describeRoute({ operationId: 'deleteListing', tags: ['Listings'], summary: 'Delete listing', description: 'Hard-deletes `:id` — the row leaves the store entirely (unlike the `removed` status which keeps it visible for record-keeping). Persists and returns the remaining list. 404 if unknown. Code: apps/web/src/lib/listings/server.ts:192', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Remaining listings.', content: { 'application/json': { schema: ListingsResponseJson } } }, 404: errorResponse('Listing not found') } }), (c) => {
    // Hard delete — the row leaves the store entirely (unlike the removed
    // status, which keeps it visible for record-keeping).
    const id = c.req.param('id')
    const current = listings.find((row) => row.id === id)
    if (!current) return c.json({ error: 'Listing not found' }, 404)
    listings = listings.filter((row) => row.id !== id)
    persistListings()
    return c.json({ listings: [...listings] })
  })

export type ListingsApp = typeof listingsApp