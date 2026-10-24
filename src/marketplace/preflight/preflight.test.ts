import { describe, expect, test } from 'bun:test'
import { preflightOf, renderPreflight } from './index'
import type { PreflightAccount, PreflightFacts } from './index'

const EXETER: PreflightAccount = {
  accountName: '61593843527201',
  homeCity: 'Exeter',
  homeCountry: 'US',
  activeHoursStart: null,
  activeHoursEnd: null,
  proxy: 'http://user:pass@proxy.example:8080',
  adsPowerProfileId: 'k1ib8m0k',
  profilePhoto: 'C:/Users/0/.buzz/REPOS/log-cli/media/personas/exeterPartTimeEmployeeMale20/profilePicture.png'
}

const GOOD: PreflightFacts = {
  proxy: { ok: true, exitCountry: 'US', facebookMs: 1800 },
  kernel: { reachable: true, version: '156', downloaded: true },
  launches: [],
  hostOpensToday: 0,
  hostDay: null,
  sessionPid: null,
  profilePhotoOnDisk: true
}

const NOON_EDT = new Date('2026-10-24T16:30:00Z')
const failed = (row: ReturnType<typeof preflightOf>) => row.checks.filter((c) => !c.ok).map((c) => c.code)

describe('preflight says before any browser opens what would stop an account', () => {
  test('an account with everything in place is ready', () => {
    const row = preflightOf(EXETER, GOOD, NOON_EDT, 2500)
    expect(row.ready).toBe(true)
    expect(renderPreflight([row])).toContain('1 of 1 ready')
  })

  test("each of 2026-10-24's stops on Exeter is caught up front", () => {
    expect(failed(preflightOf({ ...EXETER, homeCity: 'Nowhere Town' }, GOOD, NOON_EDT, 2500))).toEqual(['noHomeTimezone'])
    expect(failed(preflightOf(EXETER, { ...GOOD, proxy: { ok: true, exitCountry: 'US', facebookMs: 3110 } }, NOON_EDT, 2500))).toEqual(['proxyTooSlow'])
    expect(failed(preflightOf(EXETER, { ...GOOD, kernel: { reachable: true, version: '156', downloaded: false } }, NOON_EDT, 2500))).toEqual(['adsPowerKernelMissing'])
    expect(failed(preflightOf(EXETER, { ...GOOD, hostOpensToday: 2, hostDay: '2026-10-24' }, NOON_EDT, 2500))).toEqual(['opensSpent'])
    expect(failed(preflightOf(EXETER, { ...GOOD, sessionPid: 4242 }, NOON_EDT, 2500))).toEqual(['sessionOpen'])
    expect(failed(preflightOf(EXETER, { ...GOOD, profilePhotoOnDisk: false }, NOON_EDT, 2500))).toEqual(['profilePhotoMissing'])
  })

  test('the proxy limit is the run\'s, a wrong country and a missing profile are blocking too', () => {
    expect(preflightOf(EXETER, { ...GOOD, proxy: { ok: true, exitCountry: 'US', facebookMs: 3110 } }, NOON_EDT, 4000).ready).toBe(true)
    expect(failed(preflightOf(EXETER, { ...GOOD, proxy: { ok: true, exitCountry: 'CA', facebookMs: 900 } }, NOON_EDT, 2500))).toEqual(['proxyWrongCountry'])
    expect(failed(preflightOf({ ...EXETER, adsPowerProfileId: null }, GOOD, NOON_EDT, 2500))).toEqual(['noAdsPowerProfile'])
  })

  test("yesterday's host opens and an earlier launch gap don't count against today", () => {
    expect(preflightOf(EXETER, { ...GOOD, hostOpensToday: 2, hostDay: '2026-10-23' }, NOON_EDT, 2500).ready).toBe(true)
    expect(failed(preflightOf(EXETER, { ...GOOD, launches: [new Date('2026-10-24T16:25:00Z')] }, NOON_EDT, 2500))).toEqual(['launchTooSoon'])
    expect(preflightOf(EXETER, { ...GOOD, launches: [new Date('2026-10-24T16:00:00Z')] }, NOON_EDT, 2500).ready).toBe(true)
  })

  test("the kernel checked is the one the profile's own user agent needs, not the newest", () => {
    const scranton = preflightOf({ ...EXETER, accountName: '61593881475391', homeCity: 'Scranton', adsPowerProfileId: 'k1ib8m28' }, { ...GOOD, kernel: { reachable: true, version: '154', downloaded: false } }, NOON_EDT, 2500)
    expect(failed(scranton)).toEqual(['adsPowerKernelMissing'])
    expect(scranton.checks.find((c) => c.name === 'kernel')?.detail).toContain('SunBrowser 154, the kernel this profile')
    expect(failed(preflightOf(EXETER, { ...GOOD, kernel: { reachable: true, version: null, downloaded: false } }, NOON_EDT, 2500))).toEqual(['adsPowerKernelMissing'])
    expect(failed(preflightOf(EXETER, { ...GOOD, kernel: { reachable: false, version: null, downloaded: false } }, NOON_EDT, 2500))).toEqual(['adsPowerUnavailable'])
  })

  test("its Marketplace location is said up front: its home written out, or noHomeRegion", () => {
    expect(preflightOf(EXETER, GOOD, NOON_EDT, 2500).checks.find((c) => c.name === 'location')).toMatchObject({ ok: true, detail: 'Marketplace location "Exeter, Pennsylvania"' })
    expect(failed(preflightOf({ ...EXETER, homeCity: 'Philadelphia' }, GOOD, NOON_EDT, 2500))).toEqual([])
    const noRegion = preflightOf({ ...EXETER, homeCountry: 'IE', homeCity: 'Galway' }, GOOD, NOON_EDT, 2500)
    expect(failed(noRegion)).toContain('noHomeRegion')
  })

  test('outside the waking hours is said up front', () => {
    expect(failed(preflightOf(EXETER, GOOD, new Date('2026-10-24T06:00:00Z'), 2500))).toEqual(['outsideActiveHours'])
  })
})
