import { describe, expect, it } from 'vitest'
import { allowedTransition, listingActions } from '../listings/machine'
import { listingsApp } from '../listings/server'
import { MOCK_LISTINGS } from '../listings/mock'

const rowByListingId = (listingId: string) => {
  const row = MOCK_LISTINGS.find((r) => r.listingId === listingId)
  if (!row) throw new Error(`seed row ${listingId} not found`)
  return row
}

async function patchStatus(id: string, status: string, source?: 'seller' | 'platform') {
  return listingsApp.request(`/listings/${id}/status`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(source ? { status, source } : { status })
  })
}

describe('allowedTransition (pure)', () => {
  it('lets the seller sell or remove only what is live', () => {
    expect(allowedTransition('active', 'sold', 'seller').allowed).toBe(true)
    expect(allowedTransition('active', 'removed', 'seller').allowed).toBe(true)
    expect(allowedTransition('under-review', 'sold', 'seller').allowed).toBe(false)
    expect(allowedTransition('under-review-duplicate', 'sold', 'seller').allowed).toBe(false)
    expect(allowedTransition('login-wall', 'active', 'seller').allowed).toBe(false)
  })

  it('never lets the seller self-approve a held listing', () => {
    expect(allowedTransition('under-review', 'active', 'seller').allowed).toBe(false)
    expect(allowedTransition('under-review-duplicate', 'active', 'seller').allowed).toBe(false)
    // the camofox client report is the only path out of review
    expect(allowedTransition('under-review', 'active', 'platform').allowed).toBe(true)
  })

  it('lets the seller undo a sale, and archive after selling', () => {
    expect(allowedTransition('sold', 'active', 'seller').allowed).toBe(true)
    expect(allowedTransition('sold', 'removed', 'seller').allowed).toBe(true)
    expect(allowedTransition('sold', 'sold', 'seller').allowed).toBe(false)
  })

  it('gates the relist on who took the listing down', () => {
    expect(allowedTransition('removed', 'active', 'seller', { removedBy: 'seller' }).allowed).toBe(true)
    expect(allowedTransition('removed', 'active', 'seller', { removedBy: 'platform' }).allowed).toBe(false)
    // no provenance on record reads as a seller delist (legacy rows)
    expect(allowedTransition('removed', 'active', 'seller', {}).allowed).toBe(true)
    // the platform restoring its own takedown (request-review) is a platform move
    expect(allowedTransition('removed', 'active', 'platform', { removedBy: 'platform' }).allowed).toBe(true)
  })

  it('refuses all seller writes under a suspended or limited account', () => {
    expect(allowedTransition('active', 'sold', 'seller', { accountIssue: 'suspended' }).allowed).toBe(false)
    expect(
      allowedTransition('active', 'sold', 'seller', { accountIssue: 'read_only_limited' }).allowed).toBe(false)
    // a checkpointed account is transient — its writes still go through
    expect(allowedTransition('active', 'sold', 'seller', { accountIssue: 'checkpointed' }).allowed).toBe(true)
    // the poller keeps observing regardless of account state
    expect(allowedTransition('active', 'removed', 'platform', { accountIssue: 'suspended' }).allowed).toBe(true)
  })

  it('treats login-wall / unknown as overwrite-in, resolve-any-out (both sources)', () => {
    expect(allowedTransition('active', 'login-wall', 'platform').allowed).toBe(true)
    expect(allowedTransition('active', 'unknown', 'platform').allowed).toBe(true)
    expect(allowedTransition('login-wall', 'active', 'platform').allowed).toBe(true)
    expect(allowedTransition('unknown', 'removed', 'platform').allowed).toBe(true)
    // no same-state no-ops
    expect(allowedTransition('active', 'active', 'seller').allowed).toBe(false)
    expect(allowedTransition('active', 'active', 'seller').reason).toMatch(/already/i)
  })
})

describe('listingActions (UI gating)', () => {
  it('offer the same set the store will accept', () => {
    expect(listingActions('active')).toEqual({
      edit: true, markSold: true, remove: true, markAvailable: false, relist: false, delete: true
    })
    expect(listingActions('sold')).toEqual({
      edit: true, markSold: false, remove: true, markAvailable: true, relist: false, delete: true
    })
    expect(listingActions('removed', { removedBy: 'seller' })).toEqual({
      edit: false, markSold: false, remove: false, markAvailable: false, relist: true, delete: true
    })
    expect(listingActions('removed', { removedBy: 'platform' })).toEqual({
      edit: false, markSold: false, remove: false, markAvailable: false, relist: false, delete: true
    })
    expect(listingActions('under-review')).toEqual({
      edit: true, markSold: false, remove: true, markAvailable: false, relist: false, delete: true
    })
    expect(listingActions('active', { accountIssue: 'suspended' })).toEqual({
      edit: true, markSold: false, remove: false, markAvailable: false, relist: false, delete: true
    })
  })
})

describe('PATCH /listings/:id/status (store enforcement)', () => {
  it('409s a seller self-approve, 200s the same move from the platform', async () => {
    const held = rowByListingId('38629807913299080') // under-review-duplicate
    const denied = await patchStatus(held.id, 'active')
    expect(denied.status).toBe(409)
    expect(((await denied.json()) as { error: string }).error).toMatch(/seller can't/i)

    const approved = await patchStatus(held.id, 'active', 'platform')
    expect(approved.status).toBe(200)
    const body = (await approved.json()) as { listing: { status: string; removedBy?: string } }
    expect(body.listing.status).toBe('active')
    expect(body.listing.removedBy).toBeUndefined()
  })

  it('stamps removedBy with the source and clears it on the way out', async () => {
    const live = rowByListingId('1583545526797714') // active
    const removed = await patchStatus(live.id, 'removed') // seller default
    expect(removed.status).toBe(200)
    let body = (await removed.json()) as { listing: { status: string; removedBy?: string } }
    expect(body.listing.removedBy).toBe('seller')

    const relisted = await patchStatus(live.id, 'active')
    expect(relisted.status).toBe(200)
    body = (await relisted.json()) as { listing: { status: string; removedBy?: string } }
    expect(body.listing.removedBy).toBeUndefined()

    const takedown = await patchStatus(live.id, 'removed', 'platform')
    expect(takedown.status).toBe(200)
    body = (await takedown.json()) as { listing: { status: string; removedBy?: string } }
    expect(body.listing.removedBy).toBe('platform')
  })

  it('refuses the seller a relist of a platform takedown', async () => {
    const takedown = rowByListingId('664120887304197') // removed, removedBy platform
    const denied = await patchStatus(takedown.id, 'active')
    expect(denied.status).toBe(409)
    expect(((await denied.json()) as { error: string }).error).toMatch(/request a review/i)

    const platformRestore = await patchStatus(takedown.id, 'active', 'platform')
    expect(platformRestore.status).toBe(200)
  })

  it('409s unknown ids and unknown statuses', async () => {
    const missing = await patchStatus('00000000-0000-4000-8000-000000000000', 'active')
    expect(missing.status).toBe(404)
    const live = rowByListingId('775091462828331') // Patio Set — removed, seller
    const bogus = await patchStatus(live.id, 'sold') // not an edge from removed
    expect(bogus.status).toBe(409)
    const invalid = await patchStatus(live.id, 'sold-out')
    expect(invalid.status).toBe(400)
  })
})