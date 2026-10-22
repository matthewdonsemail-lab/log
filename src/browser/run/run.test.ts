/**
 * prepareRun: the last check before any Python starts. Rules 12, 15, 16, 18.
 * An injected clock; no browser, no network.
 */
import { afterAll, describe, expect, test } from 'bun:test'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { findAccount } from '../../marketplace/socialAccount/index'
import { marketplaceFixture } from '../../twenty/graphql/index'
import { captureDirFor, lastLaunchReset, listLaunches, overLaunchBudget, prepareRun, recordLaunchReset, runBrowserOf } from './index'

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

describe('run.keep: a save Twenty refused never loses the device or the session (Harrisburg, 2026-10-19)', () => {
  test('login.json goes at once; the rest moves out of the temp folder, and cleanup leaves it', async () => {
    process.env.LOG_UNSAVED_DIR = join(ROOT, 'unsaved')
    const prepared = prepareRun(await account('galwayOne'), 'connect', { now: DAY, root: ROOT, login: { email: 'e', password: 'p', totpSecret: null, messengerPin: null } })
    if (!prepared.ok) throw new Error(prepared.code)
    writeFileSync(prepared.run.statePath, JSON.stringify({ cookies: [{ name: 'c_user', value: '1', domain: '.facebook.com', path: '/' }], origins: [] }))
    const kept = prepared.run.keep()
    prepared.run.cleanup()
    expect(kept).toBe(join(ROOT, 'unsaved', '20261018T100000_galwayOne'))
    expect(existsSync(join(kept, 'login.json'))).toBe(false)
    expect(existsSync(join(kept, 'device.json'))).toBe(true)
    expect(existsSync(join(kept, 'state.json'))).toBe(true)
    expect(existsSync(prepared.run.dir)).toBe(false)
    delete process.env.LOG_UNSAVED_DIR
  })
})

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

  test("the capture folder is named after the browser that runs: inspect, flow, warmup and host follow the account, the rest are Camoufox", () => {
    const linked = { browserDriver: null, adsPowerProfileId: 'k1' }
    expect(runBrowserOf(linked, 'inspect')).toBe('adsPower')
    expect(runBrowserOf(linked, 'host')).toBe('adsPower')
    expect(runBrowserOf(linked, 'connect')).toBe('camoufox')
    expect(runBrowserOf({ browserDriver: null, adsPowerProfileId: null }, 'inspect')).toBe('camoufox')
    expect(captureDirFor('galwayOne', 'inspect', DAY, '/captures', 'adsPower').replaceAll('\\', '/')).toMatch(/^\/captures\/inspect\/\d{8}T\d{6}_galwayOne\/adsPower$/)
  })

  test('a run carries its capture folder (rule 22); a proxy check opens nothing and has none', async () => {
    const prepared = prepareRun(await account('galwayOne'), 'run', { now: DAY, root: ROOT, action: 'scan', captureRoot: '/captures' })
    expect(prepared.ok && prepared.run.captureDir?.replaceAll('\\', '/')).toMatch(/^\/captures\/scan\/\d{8}T\d{6}_galwayOne\/camoufox$/)
    const check = prepareRun(await account('galwayOne'), 'check', { now: DAY, root: ROOT })
    expect(check.ok && check.run.captureDir).toBeNull()
    if (prepared.ok) prepared.run.cleanup()
    if (check.ok) check.run.cleanup()
  })

  test('bypassHours skips only the waking hours: the proxy rule still refuses', async () => {
    expect(prepareRun(await account('galwayOne'), 'run', { now: NIGHT, root: ROOT, bypassHours: true })).toMatchObject({ ok: true })
    expect(prepareRun(await account('noProxy'), 'run', { now: NIGHT, root: ROOT, bypassHours: true })).toMatchObject({ ok: false })
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

describe('launch budget (rule 24)', () => {
  const launchAt = (root: string, action: string, at: string, account = 'phillyOne') => {
    const dir = join(root, action, `${at.replace(/[-:]/g, '').slice(0, 15)}_${account}`, 'firefox')
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'steps.jsonl'), `${JSON.stringify({ at, step: 'Self-check passed: exit 1.2.3.4' })}\n`)
  }

  test('only launches that reached Facebook count, per account', () => {
    const root = mkdtempSync(join(tmpdir(), 'logBudget'))
    launchAt(root, 'connect', '2026-10-19T09:00:00.000Z')
    launchAt(root, 'scan', '2026-10-19T09:30:00.000Z', 'otherOne')
    const refused = join(root, 'connect', '20261019T093000_phillyOne', 'firefox')
    mkdirSync(refused, { recursive: true })
    writeFileSync(join(refused, 'steps.jsonl'), `${JSON.stringify({ at: '2026-10-19T09:30:00.000Z', step: 'open failed: proxyTooSlow' })}\n`)
    expect(listLaunches('phillyOne', { runs: root, publish: join(root, 'none') }).map((d) => d.toISOString())).toEqual(['2026-10-19T09:00:00.000Z'])
  })

  test('a reset (log facebook account resetOpens) makes earlier launches stop counting, for that account only, keeping the recordings', () => {
    const root = mkdtempSync(join(tmpdir(), 'logBudget'))
    const resets = join(root, 'launchResets.jsonl')
    launchAt(root, 'connect', '2026-10-19T09:00:00.000Z')
    launchAt(root, 'scan', '2026-10-19T09:20:00.000Z', 'otherOne')
    recordLaunchReset('phillyOne', 'reset by matt', new Date('2026-10-19T09:10:00.000Z'), resets)
    launchAt(root, 'inspect', '2026-10-19T09:30:00.000Z')
    const roots = { runs: root, publish: join(root, 'none'), resets }
    expect(listLaunches('phillyOne', roots).map((d) => d.toISOString())).toEqual(['2026-10-19T09:30:00.000Z'])
    expect(listLaunches('otherOne', roots)).toHaveLength(1)
    expect(lastLaunchReset('phillyOne', resets)?.toISOString()).toBe('2026-10-19T09:10:00.000Z')
  })

  test('too soon after the last launch, then too many in the local day', () => {
    const tz = 'America/New_York'
    const at = (iso: string) => new Date(iso)
    expect(overLaunchBudget([at('2026-10-19T13:00:00Z')], at('2026-10-19T13:04:00Z'), tz)).toMatchObject({ code: 'launchTooSoon' })
    expect(overLaunchBudget([at('2026-10-19T13:00:00Z')], at('2026-10-19T13:10:00Z'), tz)).toBeNull()
    const eight = Array.from({ length: 8 }, (_, i) => at(`2026-10-19T${String(12 + i).padStart(2, '0')}:00:00Z`))
    expect(overLaunchBudget(eight, at('2026-10-19T21:00:00Z'), tz)).toMatchObject({ code: 'launchBudgetSpent' })
    // 02:00 local the next day (06:00Z): a new local day.
    expect(overLaunchBudget(eight, at('2026-10-20T06:00:00Z'), tz)).toBeNull()
  })
})
