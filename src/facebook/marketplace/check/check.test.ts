import { describe, expect, test } from 'bun:test'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { marketplaceFixture } from '../../../twenty/graphql/index.ts'
import { accessProblem, keepCheck, marketplaceAccessOf, sellerInboxOf, sellingListingsOf, statusOfListing } from './index.ts'

const graphql = (name: string, body: unknown) => ({
  log: { entries: [{ request: { postData: { text: `av=1&fb_api_req_friendly_name=${name}&variables=%7B%7D` } }, response: { content: { text: JSON.stringify(body) } } }] }
})
const page = (text: string) => ({ log: { entries: [{ request: {}, response: { content: { text } } }] } })

const status = (over: Record<string, unknown> = {}) =>
  graphql('CometMarketplaceStatusContentContainerQuery', {
    data: { viewer: { marketplaceViolationTransparencyViewModel: { profile_name: 'Test', enforcement_instance_id: null, access_state_title: 'You have full access to Marketplace', access_state_body: 'You can sell items and message sellers on Marketplace.', is_marketplace_access_banned: false, csat_survey: { profile_status: 'GOOD' }, ...over } } }
  })
const listing = (id: string, indicator: string | null, extra = '') =>
  `"appeal_status":"appeal_not_exist","is_duplicate":false,"listing_is_rejected":false,"integrity_status_indicator":${indicator ? `{"content":"${indicator}","style":"INFO"}` : 'null'},"listing_status_indicator":null,"id":"${id}","marketplace_listing_title":"Junk Removal","formatted_price":{"text":"$99"},"is_pending":false,"is_sold":false,"is_draft":false,"is_on_marketplace":true${extra}`
const INSIGHTS = (count: number) => `,"__isMarketplaceListingWithInsights":"GroupCommerceProductItem","listing_insights":{"insights":[{"count":${count}}]},"is_hidden":false`
const selling = (...listings: string[]) => page(`<script>{"marketplace_listing_sets":{"edges":[${listings.map((l) => `{"node":{"first_listing":{${l}}}}`).join(',')}]}}</script>`)
const inbox = (edges: unknown[]) => graphql('CometMarketplaceInboxSellerTabThreadViewContainerQuery', { data: { viewer: { marketplaceInboxSellerMessageThreads: { edges, page_info: { end_cursor: null, has_next_page: false } } } } })

describe('the Marketplace check reads the recorded responses', () => {
  test('full access is fine; a ban or an enforcement is the account\'s problem', () => {
    const access = marketplaceAccessOf(status())!
    expect(access).toMatchObject({ title: 'You have full access to Marketplace', banned: false, profileStatus: 'GOOD' })
    expect(accessProblem(access)).toBeNull()
    expect(accessProblem(marketplaceAccessOf(status({ is_marketplace_access_banned: true, access_state_title: "You can't buy or sell" }))!)).toContain('banned')
    expect(accessProblem(marketplaceAccessOf(status({ enforcement_instance_id: '123' }))!)).toContain('enforcement')
    expect(marketplaceAccessOf(page('<html></html>'))).toBeNull()
  })

  test('a listing being reviewed, then through it, then sold', () => {
    expect(sellingListingsOf(selling(listing('1425935622848350', 'This listing is being reviewed.')))[0]).toMatchObject({ listingId: '1425935622848350', price: '$99', notice: 'This listing is being reviewed.', status: 'underReview' })
    expect(sellingListingsOf(selling(listing('1425935622848350', null)))[0]).toMatchObject({ notice: null, status: 'active' })
    expect(sellingListingsOf(selling(listing('1425935622848350', null).replace('"is_sold":false', '"is_sold":true')))[0].status).toBe('sold')
  })

  test("each listing reads its own flags, never the one before it", () => {
    const found = sellingListingsOf(selling(listing('1000000000001', 'This listing is being reviewed.'), listing('1000000000002', null)))
    expect(found.map((l) => [l.listingId, l.status])).toEqual([['1000000000001', 'underReview'], ['1000000000002', 'active']])
  })

  test("each listing's clicks in the last 14 days come from its own listing_insights, never the next listing's", () => {
    const found = sellingListingsOf(selling(listing('1000000000001', null, INSIGHTS(15)), listing('1000000000002', null), listing('1000000000003', null, INSIGHTS(1))))
    expect(found.map((l) => [l.listingId, l.clicks])).toEqual([['1000000000001', 15], ['1000000000002', null], ['1000000000003', 1]])
  })

  test('the seller inbox: no chats, or the chats as sent', () => {
    expect(sellerInboxOf(inbox([]))).toEqual({ threads: 0, hasNextPage: false, raw: [] })
    expect(sellerInboxOf(inbox([{ node: { id: 't1' } }]))?.threads).toBe(1)
  })
})

describe('keepCheck', () => {
  test('a listing that moved gets its status in Twenty; chats are kept as sent; a ban is an issue', async () => {
    const twenty = marketplaceFixture()
    const account = (await twenty.list('socialAccounts')).find((a) => a.accountName === 'galwayOne')!
    const created = await twenty.create('agencyListings', { title: 'Junk Removal', socialAccountId: account.id, listingId: '1425935622848350', status: 'UNDER_REVIEW' } as never)
    const dir = mkdtempSync(join(tmpdir(), 'logCheck'))
    const report = await keepCheck(twenty, account.id, 'galwayOne', { access: marketplaceAccessOf(status()), listings: sellingListingsOf(selling(listing('1425935622848350', null, INSIGHTS(15)))), inbox: sellerInboxOf(inbox([{ node: { id: 't1' } }])) }, dir)
    expect((await twenty.list('agencyListings')).find((r) => r.id === (created as { id: string }).id)?.status).toBe('ACTIVE')
    expect(report.lines.join('\n')).toContain('underReview → active')
    expect((await twenty.list('agencyListings')).find((r) => r.id === (created as { id: string }).id)?.clicksCount).toBe(15)
    expect(report.lines.join('\n')).toContain('active, 15 clicks in 14 days; Twenty underReview → active; clicks empty → 15')
    expect(report.threads).toBe(1)
    expect(report.issue).toBeNull()
    const kept = report.lines.find((l) => l.includes('kept as sent'))!.split('kept as sent: ')[1]
    expect(JSON.parse(readFileSync(kept, 'utf8'))).toEqual([{ node: { id: 't1' } }])
    const banned = await keepCheck(twenty, account.id, 'galwayOne', { access: marketplaceAccessOf(status({ is_marketplace_access_banned: true })), listings: [], inbox: sellerInboxOf(inbox([])) }, dir)
    expect(banned.issue?.code).toBe('suspended')
  })
})

describe('the status page opened directly', () => {
  test('its data inside the page is read the same, with whether the account may sell', () => {
    const html = `<script>["adp_CometMarketplaceRootQueryRelayPreloader",{"__bbox":{"result":{"data":{"viewer":{"marketplace_feature_access_status":{"message_seller_on_marketplace":"ELIGIBLE","sell_on_marketplace":"ELIGIBLE"}}}}}}]` +
      `["adp_CometMarketplaceStatusContentContainerQueryRelayPreloader",{"__bbox":{"result":{"data":{"viewer":{"marketplaceViolationTransparencyViewModel":{"enforcement_instance_id":null,"access_state_title":"You have full access to Marketplace","access_state_body":"You can sell items.","is_marketplace_access_banned":false,"csat_survey":{"body_text":"How {satisfied} are you?","profile_status":"GOOD"}}}}}}]</script>`
    const access = marketplaceAccessOf(page(html))!
    expect(access).toMatchObject({ title: 'You have full access to Marketplace', banned: false, profileStatus: 'GOOD', sell: 'ELIGIBLE' })
    expect(accessProblem(access)).toBeNull()
    expect(accessProblem({ ...access, sell: 'INELIGIBLE' })).toContain('INELIGIBLE')
  })
})

describe('a listing held for an identity check is not live', () => {
  test("Mountain Top's \"Confirm your identity to publish this and any future listings\" is BLOCKED, never ACTIVE", () => {
    const held = { listingId: '28779899605000522', title: 'Junk Removal Mountain Top – Free Quote From a Photo', price: '$99', onMarketplace: true, sold: false, pending: false, draft: false, rejected: false, duplicate: false, notice: 'Confirm your identity to publish this and any future listings', clicks: 0 }
    expect(statusOfListing(held)).toBe('blocked')
    expect(statusOfListing({ ...held, notice: null })).toBe('active')
  })
})

describe('the identity hold is an account issue, not a live listing', () => {
  test("Hazleton's held listing goes BLOCKED and the check raises identityVerificationRequired", async () => {
    const twenty = marketplaceFixture()
    const account = (await twenty.list('socialAccounts')).find((a) => a.accountName === 'galwayOne')!
    await twenty.create('agencyListings', { title: 'Junk Removal Hazleton', socialAccountId: account.id, listingId: '1789968938884830', status: 'ACTIVE' } as never)
    const held = { listingId: '1789968938884830', title: 'Junk Removal Hazleton', price: '$99', onMarketplace: true, sold: false, pending: false, draft: false, rejected: false, duplicate: false, notice: 'Confirm your identity to publish this and any future listings', clicks: 0, status: 'blocked' as const }
    const report = await keepCheck(twenty, account.id, 'galwayOne', { access: marketplaceAccessOf(status()), listings: [held], inbox: sellerInboxOf(inbox([])) }, mkdtempSync(join(tmpdir(), 'logCheck')))
    expect(report.issue?.code).toBe('identityVerificationRequired')
    expect((await twenty.list('agencyListings')).find((r) => r.listingId === '1789968938884830')?.status).toBe('BLOCKED')
  })
})
