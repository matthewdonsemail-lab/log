import { describe, expect, test } from 'bun:test'
import { FIXTURE_CAMPAIGN, marketplaceFixture } from '../../twenty/graphql/index'
import { getListing } from '../agencyListing/index'
import { findAccount } from '../socialAccount/index'
import { fillCampaign, healCampaign, recordAccountIssue, setStatusAndReplace } from './index'

const statusOf = (twenty: ReturnType<typeof marketplaceFixture>, object: string, id: string) => twenty.rows[object].find((r) => r.id === id)!

describe('losing an account', () => {
  test('banned: kept with its reason, live listings ACCOUNT_LOST, campaign ones replaced in the same country', async () => {
    const twenty = marketplaceFixture()
    const account = await findAccount(twenty, 'galwayOne')
    const report = await setStatusAndReplace(twenty, account, 'banned', 'accountDisabled', 'Your account has been disabled')

    expect(statusOf(twenty, 'socialAccounts', 'galwayOne')).toMatchObject({ accountStatus: 'BANNED', statusReason: 'accountDisabled' })
    // readyOne, liveOne (campaign) and abroad (no campaign) were live; soldOne stays SOLD.
    expect(report.lost.map((l) => l.id).sort()).toEqual(['abroad', 'liveOne', 'readyOne'])
    expect(statusOf(twenty, 'agencyListings', 'soldOne').status).toBe('SOLD')
    expect(statusOf(twenty, 'agencyListings', 'abroad').status).toBe('ACCOUNT_LOST')

    // Two campaign listings → two replacements, each on a different Irish account not already in the campaign.
    expect(report.replacements).toHaveLength(2)
    const used = report.replacements.map((r) => r.account?.id)
    expect(new Set(used).size).toBe(2)
    for (const id of used) expect(['galwayThree', 'dublinOne']).toContain(id as string)
    // Same city first: galwayThree is in Galway, dublinOne is not.
    expect(used[0]).toBe('galwayThree')
    for (const r of report.replacements) {
      expect(statusOf(twenty, 'agencyListings', r.old.id).status).toBe('REPLACED')
      expect(r.next).toMatchObject({ status: 'ready', generation: 1, replacesId: r.old.id, campaignId: FIXTURE_CAMPAIGN, locationCountry: 'IE' })
    }
    // Nothing deleted.
    expect(twenty.rows.socialAccounts.some((r) => r.id === 'galwayOne')).toBe(true)
    expect(twenty.rows.agencyListings.filter((r) => ['readyOne', 'liveOne', 'abroad', 'soldOne'].includes(r.id))).toHaveLength(4)
  })

  test('never posts from another country: with no Irish account left it stays ACCOUNT_LOST and says why', async () => {
    const twenty = marketplaceFixture()
    for (const id of ['galwayThree', 'dublinOne']) await twenty.update('socialAccounts', id, { accountStatus: 'PAUSED' })
    const report = await setStatusAndReplace(twenty, await findAccount(twenty, 'galwayOne'), 'dead', 'setByHand')
    expect(report.replacements.every((r) => r.next === null)).toBe(true)
    expect(statusOf(twenty, 'agencyListings', 'liveOne')).toMatchObject({ status: 'ACCOUNT_LOST', lastErrorCode: 'noReplacementAccount' })
    // The Vietnamese account was eligible on everything except country.
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
    // Proxy problems are setup, not the account's fault: no status change.
    expect(await recordAccountIssue(twenty, await findAccount(twenty, 'galwayTwo'), 'proxyCountryMismatch', null)).toBeNull()
  })
})

describe('filling a campaign', () => {
  test('one ad on N accounts in its country, one per account, same city first', async () => {
    const twenty = marketplaceFixture()
    const ad = (await getListing(twenty, 'adTemplate'))!
    const report = await fillCampaign(twenty, 'campaignNew', ad, 10)
    const accounts = report.created.map((c) => c.account.accountName)
    // Irish, ACTIVE, proxied and signed in: galwayOne, galwayTwo, galwayThree, dublinOne. Not noProxy,
    // noCountry, noCookies (no session), vietnam (VN), needsLogin, banned, unset.
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
