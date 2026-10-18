import { describe, expect, test } from 'bun:test'
import { listAccounts } from '../account/index'
import { listListings } from './client'
import { filterListings, findListing, getSellerActions } from './helpers/index'

describe('listListings', () => {
  test('loads the six dashboard seed listings, all on Facebook accounts', () => {
    const listings = listListings()
    const accountIds = new Set(listAccounts().map((account) => account.id))
    expect(listings).toHaveLength(6)
    expect(listings.every((row) => accountIds.has(row.accountId))).toBe(true)
    expect(listings[0].listingId).toBe('38629807913299080')
  })

  test('returns fresh copies so callers cannot mutate the seed', () => {
    listListings()[0].images.push('mutated')
    expect(listListings()[0].images).toHaveLength(2)
  })
})

describe('helpers', () => {
  test('filters by status and account', () => {
    const listings = listListings()
    expect(filterListings(listings, { status: 'removed' }).map((row) => row.removedBy)).toEqual(['seller', 'platform'])
    expect(filterListings(listings, { accountId: 'fb-pacer' })).toHaveLength(2)
  })

  test('finds by listingId and by opaque id', () => {
    const listings = listListings()
    expect(findListing(listings, '1583545526797714')?.title).toBe('Junk Clearance — Salthill')
    expect(findListing(listings, listings[2].id)?.listingId).toBe(listings[2].listingId)
    expect(findListing(listings, 'missing')).toBeUndefined()
  })

  test('the platform-removed wardrobe only offers delete', () => {
    const listings = listListings()
    const wardrobe = findListing(listings, '664120887304197')!
    const offered = Object.entries(getSellerActions(wardrobe, listAccounts())).filter(([, ok]) => ok)
    expect(offered.map(([name]) => name)).toEqual(['delete'])
  })
})
