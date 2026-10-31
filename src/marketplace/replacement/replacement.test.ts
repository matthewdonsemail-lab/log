import { describe, expect, test } from 'bun:test'
import { FIXTURE_CAMPAIGN, marketplaceFixture } from '../../twenty/graphql/index'
import { getListing } from '../agencyListing/index'
import { findAccount } from '../socialAccount/index'
import { blockedListings, fillCampaign, healCampaign, recordAccountIssue, setStatusAndReplace, sweepBlockedListings } from './index'

const statusOf = (twenty: ReturnType<typeof marketplaceFixture>, object: string, id: string) => twenty.rows[object].find((r) => r.id === id)!

describe('losing an account', () => {
  test('banned: kept with its reason, live listings ACCOUNT_LOST, campaign ones replaced in the same country', async () => {
    const twenty = marketplaceFixture()
    const account = await findAccount(twenty, 'galwayOne')
    const report = await setStatusAndReplace(twenty, account, 'banned', 'accountDisabled', 'Your account has been disabled')

    expect(statusOf(twenty, 'socialAccounts', 'galwayOne')).toMatchObject({ accountStatus: 'BANNED', statusReason: 'accountDisabled' })
    expect(report.lost.map((l) => l.id).sort()).toEqual(['abroad', 'liveOne', 'readyOne'])
    expect(statusOf(twenty, 'agencyListings', 'soldOne').status).toBe('SOLD')
    expect(statusOf(twenty, 'agencyListings', 'abroad').status).toBe('ACCOUNT_LOST')

    expect(report.replacements).toHaveLength(2)
    const used = report.replacements.map((r) => r.account?.id)
    expect(new Set(used).size).toBe(2)
    for (const id of used) expect(['galwayThree', 'dublinOne']).toContain(id as string)
    expect(used[0]).toBe('galwayThree')
    for (const r of report.replacements) {
      expect(statusOf(twenty, 'agencyListings', r.old.id).status).toBe('REPLACED')
      expect(r.next).toMatchObject({ status: 'ready', generation: 1, replacesId: r.old.id, campaignId: FIXTURE_CAMPAIGN, locationCountry: 'IE' })
    }
    expect(twenty.rows.socialAccounts.some((r) => r.id === 'galwayOne')).toBe(true)
    expect(twenty.rows.agencyListings.filter((r) => ['readyOne', 'liveOne', 'abroad', 'soldOne'].includes(r.id))).toHaveLength(4)
  })

  test('never posts from another country: with no Irish account left it stays ACCOUNT_LOST and says why', async () => {
    const twenty = marketplaceFixture()
    for (const id of ['galwayThree', 'dublinOne']) await twenty.update('socialAccounts', id, { accountStatus: 'PAUSED' })
    const report = await setStatusAndReplace(twenty, await findAccount(twenty, 'galwayOne'), 'dead', 'setByHand')
    expect(report.replacements.every((r) => r.next === null)).toBe(true)
    expect(statusOf(twenty, 'agencyListings', 'liveOne')).toMatchObject({ status: 'ACCOUNT_LOST', lastErrorCode: 'noReplacementAccount' })
    expect(twenty.rows.agencyListings.some((r) => r.socialAccountId === 'vietnam' && r.replacesId)).toBe(false)
  })

  test('heal retries ACCOUNT_LOST listings once accounts are back', async () => {
    const twenty = marketplaceFixture()
    for (const id of ['galwayThree', 'dublinOne']) await twenty.update('socialAccounts', id, { accountStatus: 'PAUSED' })
    await setStatusAndReplace(twenty, await findAccount(twenty, 'galwayOne'), 'dead', 'setByHand')
    await twenty.update('socialAccounts', 'galwayThree', { accountStatus: 'ACTIVE' })
    const healed = await healCampaign(twenty, FIXTURE_CAMPAIGN)
    expect(healed.filter((r) => r.next).map((r) => r.account?.id)).toEqual(['galwayThree'])
    expect(healed.filter((r) => !r.next)).toHaveLength(1)
  })

  test('a status that is not a loss replaces nothing; terminal statuses are never overwritten', async () => {
    const twenty = marketplaceFixture()
    const report = await setStatusAndReplace(twenty, await findAccount(twenty, 'galwayOne'), 'limited', 'rateLimited')
    expect(report.lost).toEqual([])
    expect(statusOf(twenty, 'agencyListings', 'liveOne').status).toBe('ACTIVE')
    expect(await recordAccountIssue(twenty, await findAccount(twenty, 'banned'), 'checkpointed', null)).toBeNull()
    expect(statusOf(twenty, 'socialAccounts', 'banned').accountStatus).toBe('BANNED')
    expect(await recordAccountIssue(twenty, await findAccount(twenty, 'galwayTwo'), 'proxyCountryMismatch', null)).toBeNull()
  })
})

describe('filling a campaign', () => {
  test('one ad on N accounts in its country, one per account, same city first', async () => {
    const twenty = marketplaceFixture()
    const ad = (await getListing(twenty, 'adTemplate'))!
    const report = await fillCampaign(twenty, 'campaignNew', ad, 10)
    const accounts = report.created.map((c) => c.account.accountName)
    expect(accounts.sort()).toEqual(['dublinOne', 'galwayOne', 'galwayThree', 'galwayTwo'])
    expect(report.short).toBe(6)
    expect(report.created.at(-1)!.account.accountName).toBe('dublinOne')
    for (const c of report.created) expect(c.listing).toMatchObject({ status: 'ready', campaignId: 'campaignNew', generation: 0 })
  })

  test('an account already in the campaign is not given a second slot', async () => {
    const twenty = marketplaceFixture()
    const ad = (await getListing(twenty, 'adTemplate'))!
    const report = await fillCampaign(twenty, FIXTURE_CAMPAIGN, ad, 5)
    expect(report.created.map((c) => c.account.accountName).sort()).toEqual(['dublinOne', 'galwayThree'])
  })
})

describe("the daily cap counts the account's own day (rule 18)", () => {
  test('a listing posted late in the evening locally counts for that local day, not the UTC one', async () => {
    const { countPostedToday } = await import('./index')
    const listing = (id: string, publishedAt: string) => ({ socialAccountId: id, publishedAt }) as never
    const listings = [listing('sydney', '2026-10-18T12:30:00Z'), listing('sydney', '2026-10-18T13:30:00Z')]
    const now = new Date('2026-10-18T14:00:00Z')
    expect(countPostedToday(listings, now, new Map([['sydney', 'Australia/Sydney']])).get('sydney')).toBe(1)
    expect(countPostedToday(listings, now).get('sydney')).toBe(2)
  })
})

describe('a blocked account takes its listings with it', () => {
  test('a checkpoint is a loss: its listings go ACCOUNT_LOST', async () => {
    const twenty = marketplaceFixture()
    const report = await recordAccountIssue(twenty, await findAccount(twenty, 'galwayOne'), 'checkpointed', 'Facebook sent the page to /checkpoint/1501092823525282/')
    expect(report?.status).toBe('checkpoint')
    expect(statusOf(twenty, 'agencyListings', 'readyOne').status).not.toBe('READY')
    expect(statusOf(twenty, 'agencyListings', 'soldOne').status).toBe('SOLD')
  })

  test('a wrong password leaves the account needing a login, and its listings are dead', async () => {
    const twenty = marketplaceFixture()
    const report = await recordAccountIssue(twenty, await findAccount(twenty, 'galwayOne'), 'wrongPassword', 'The password you entered is incorrect.')
    expect(report?.status).toBe('needsLogin')
    expect(report?.lost.map((l) => l.id).sort()).toEqual(['abroad', 'liveOne', 'readyOne'])
  })

  test('the sweep finds listings left on accounts already blocked, and only those', async () => {
    const twenty = marketplaceFixture()
    await twenty.update('socialAccounts', 'galwayOne', { accountStatus: 'NEEDS_LOGIN', statusReason: 'wrongPassword' })
    const found = await blockedListings(twenty)
    expect(found.map((r) => r.listing.id).sort()).toEqual(['abroad', 'liveOne', 'readyOne'])
    const report = await sweepBlockedListings(twenty)
    expect(report.lost).toHaveLength(3)
    expect(statusOf(twenty, 'agencyListings', 'soldOne').status).toBe('SOLD')
    expect(await blockedListings(twenty)).toEqual([])
  })
})
