/**
 * prepareRun: the last check before any Python starts. Rules 12, 15, 16, 18.
 * An injected clock; no browser, no network.
 */
import { afterAll, describe, expect, test } from 'bun:test'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { findAccount } from '../../marketplace/socialAccount/index'
import { marketplaceFixture } from '../../twenty/graphql/index'
import { prepareRun } from './index'

const DAY = new Date('2026-10-18T10:00:00Z') // 11:00 in Galway
const NIGHT = new Date('2026-10-18T02:00:00Z') // 03:00 in Galway, 09:00 in Vietnam
// Every run folder goes here and is removed after the tests.
const ROOT = mkdtempSync(join(tmpdir(), 'logCliRunTest'))
afterAll(() => rmSync(ROOT, { recursive: true, force: true }))

async function account(name: string, changes: Record<string, unknown> = {}) {
  const twenty = marketplaceFixture()
  await twenty.update('socialAccounts', name, { activeHoursStart: null, activeHoursEnd: null, ...changes })
  return findAccount(twenty, name)
}

describe('prepareRun: home, hours and device', () => {
  test('writes the pinned home and no device on the first launch', async () => {
    const prepared = prepareRun(await account('galwayOne'), 'run', { now: DAY, root: ROOT })
    if (!prepared.ok) throw new Error(prepared.code)
    expect(JSON.parse(readFileSync(prepared.run.devicePath!, 'utf8'))).toEqual({
      accountName: 'galwayOne',
      locale: 'en-IE',
      languages: ['en-IE', 'en'],
      facebookLocale: 'en_GB',
      homeCountry: 'IE',
      homeCity: 'Galway',
      homeTimezone: 'Europe/Dublin',
      homeCoordinates: { latitude: 53.2707, longitude: -9.0568 },
      profile: null
    })
    expect(prepared.run.newDeviceProfile()).toBeNull()
    prepared.run.cleanup()
    expect(existsSync(prepared.run.devicePath!)).toBe(false)
  })

  test('outside the local window nothing is written and nothing opens, connect included', async () => {
    for (const purpose of ['run', 'connect'] as const) {
      const prepared = prepareRun(await account('galwayOne'), purpose, { now: NIGHT, root: ROOT })
      expect(prepared).toMatchObject({ ok: false, code: 'outsideActiveHours' })
      if (!prepared.ok) expect(prepared.detail).toContain('it is 03:00 in Galway (Europe/Dublin)')
    }
    // A proxy check opens no browser: no hours.
    expect(prepareRun(await account('galwayOne'), 'check', { now: NIGHT, root: ROOT })).toMatchObject({ ok: true })
  })

  test("the account's own window is used", async () => {
    const late = await account('galwayOne', { activeHoursStart: 2, activeHoursEnd: 4 })
    expect(prepareRun(late, 'run', { now: NIGHT, root: ROOT })).toMatchObject({ ok: true })
    expect(prepareRun(late, 'run', { now: DAY, root: ROOT })).toMatchObject({ ok: false, code: 'outsideActiveHours' })
  })

  test('a country with no pinned locale is refused', async () => {
    expect(prepareRun(await account('vietnam'), 'run', { now: DAY, root: ROOT })).toMatchObject({ ok: false, code: 'noHomeLocale' })
  })

  test('a stored device goes to Python as it is; an unreadable one is refused, never replaced', async () => {
    const profile = {
      version: 1,
      createdAt: '2026-10-18T10:00:00+00:00',
      os: 'windows',
      camoufoxVersion: '0.5.5',
      browserVersion: '152.0.4-beta.30',
      config: { 'navigator.userAgent': 'ua', 'canvas:seed': 7 },
      firefoxUserPrefs: {},
      geolocation: { latitude: 53.28, longitude: -9.06, accuracy: 420, source: 'geoLite2City' },
      home: { city: 'Galway', country: 'IE', timezone: 'Europe/Dublin' }
    }
    const prepared = prepareRun(await account('galwayOne', { deviceProfile: profile }), 'run', { now: DAY, root: ROOT })
    if (!prepared.ok) throw new Error(prepared.code)
    expect(JSON.parse(readFileSync(prepared.run.devicePath!, 'utf8')).profile).toEqual(profile)
    prepared.run.cleanup()
    expect(prepareRun(await account('galwayOne', { deviceProfile: { broken: true } }), 'run', { now: DAY, root: ROOT })).toMatchObject({
      ok: false,
      code: 'deviceProfileInvalid'
    })
  })

  test('a device Python made in the run is handed back once, to save', async () => {
    const prepared = prepareRun(await account('galwayOne'), 'run', { now: DAY, root: ROOT })
    if (!prepared.ok) throw new Error(prepared.code)
    const file = JSON.parse(readFileSync(prepared.run.devicePath!, 'utf8'))
    const made = {
      version: 1,
      createdAt: 'x',
      os: 'windows',
      camoufoxVersion: '0.5.5',
      browserVersion: 'b',
      config: { 'navigator.userAgent': 'ua' },
      firefoxUserPrefs: {},
      geolocation: { latitude: 1, longitude: 2, accuracy: 30, source: 'exitIp' },
      home: { city: 'Galway', country: 'IE', timezone: null }
    }
    writeFileSync(prepared.run.devicePath!, JSON.stringify({ ...file, profile: made, created: true }))
    expect(prepared.run.newDeviceProfile()).toEqual(made as never)
    prepared.run.cleanup()
  })
})
