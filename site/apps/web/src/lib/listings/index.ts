import { listingsApp } from './server'
import type { TransitionSource } from './machine'
import type {
  ListingCreatedResponse,
  ListingDraft,
  ListingRecord,
  ListingStatusResponse,
  ListingsResponse
} from './types'

export * from './types'
export * from './machine'
export { MOCK_FACEBOOK_ACCOUNTS, MOCK_LISTINGS, resolveListingAccountId, resolveListingAccountLabel } from './mock'
export { listingsApp, type ListingsApp } from './server'

/** Fetch listings through the Hono app (in-memory mock for now). */
export async function getListings(): Promise<ListingsResponse> {
  const res = await listingsApp.request('/listings')
  if (!res.ok) throw new Error(`Listings request failed (${res.status})`)
  return (await res.json()) as ListingsResponse
}

/** Poll one listing's classified status through the Hono app (keyed on the opaque `id`). */
export async function getListingStatus(id: string): Promise<ListingStatusResponse> {
  const res = await listingsApp.request(`/listings/${id}/status`)
  if (!res.ok) throw new Error(`Listing status request failed (${res.status})`)
  return (await res.json()) as ListingStatusResponse
}

/**
 * Save a listing's details/photos through `PATCH /listings/:id`.
 * Id, listingId, url, timestamps and review status stay put — returns the updated row.
 */
export async function saveListing(id: string, draft: ListingDraft): Promise<ListingRecord> {
  const res = await listingsApp.request(`/listings/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(draft),
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Could not save the listing (${res.status})`)
  }
  const parsed = (await res.json()) as ListingCreatedResponse
  return parsed.listing
}

/**
 * Move a listing to a new status through `PATCH /listings/:id/status`.
 * Row actions (sold / remove) round-trip here as `source: 'seller'`; the
 * camofox client reports its observations as `source: 'platform'`. The store
 * enforces `allowedTransition` — illegal moves 409, so the mock and the live
 * backend refuse the same writes. Returns the full roster.
 */
export async function setListingStatus(
  id: string,
  status: ListingRecord['status'],
  source: TransitionSource = 'seller'
): Promise<ListingCreatedResponse> {
  const res = await listingsApp.request(`/listings/${id}/status`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ status, source }),
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Could not update the listing (${res.status})`)
  }
  return (await res.json()) as ListingCreatedResponse
}

/**
 * Delete a listing entirely through `DELETE /listings/:id`.
 * Unlike the removed status, the row leaves the store. Returns the roster.
 */
export async function deleteListing(id: string): Promise<ListingsResponse> {
  const res = await listingsApp.request(`/listings/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Could not delete the listing (${res.status})`)
  }
  return (await res.json()) as ListingsResponse
}

/**
 * Publish a new listing through `POST /listings`. Returns the created row
 * (status `under-review` until the client clears it).
 */
export async function createListing(draft: ListingDraft): Promise<ListingRecord> {
  const res = await listingsApp.request('/listings', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(draft),
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Could not create the listing (${res.status})`)
  }
  const parsed = (await res.json()) as ListingCreatedResponse
  return parsed.listing
}