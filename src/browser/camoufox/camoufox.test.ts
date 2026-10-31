import { describe, expect, test } from 'bun:test'
import { waitFor } from 'xstate'
import { BROWSER_CAPABILITIES, BROWSER_DRIVERS, browserFor, createBrowserSession } from '../driver/index'
import { adsPowerCapabilities } from '../adsPower/index'
import { camoufoxCapabilities, camoufoxDriver } from './index'

const input = { driver: 'camoufox' as const, accountId: 'a1', accountName: 'galwayOne' }

describe('the Camoufox driver (rule 44)', () => {
  test('refused at a failed gate, opened after a passed one, closed with its reason', async () => {
    const opened: string[] = []
    const refused = camoufoxDriver({ gate: async () => ({ ok: false, exitIp: null, exitCountry: null, failure: { code: 'noProxy', detail: '' } }), open: async (id) => (opened.push(id), { cdpUrl: null, handle: id }) })
    expect((await waitFor(createBrowserSession(refused, input).start(), (s) => s.status === 'done')).output).toMatchObject({ state: 'refused', failure: { code: 'noProxy' } })
    expect(opened).toEqual([])
    const closed: string[] = []
    const driver = camoufoxDriver({ gate: async () => ({ ok: true, exitIp: '1.2.3.4', exitCountry: 'IE', failure: null }), open: async (id) => ({ cdpUrl: null, handle: id }), close: async (e) => void closed.push(e.handle) })
    const actor = createBrowserSession(driver, input).start()
    await waitFor(actor, (s) => s.matches('open'))
    actor.send({ type: 'CLOSE', reason: 'shutdown' })
    expect((await waitFor(actor, (s) => s.status === 'done')).output).toMatchObject({ state: 'closed', closeReason: 'shutdown' })
    expect(closed).toEqual(['a1'])
  })
})

describe('browser parity (rule 44)', () => {
  test('every browser fills every capability', () => {
    for (const row of [camoufoxCapabilities, adsPowerCapabilities]) expect(Object.keys(row).sort()).toEqual(Object.keys(BROWSER_CAPABILITIES).sort())
  })

  test("an account's browser comes from Twenty, Camoufox when empty or unknown", () => {
    expect(browserFor({ browserDriver: 'adsPower', adsPowerProfileId: 'k1' })).toEqual({ driver: 'adsPower', profileId: 'k1' })
    expect(browserFor({ browserDriver: null, adsPowerProfileId: null })).toEqual({ driver: 'camoufox', profileId: null })
    expect(browserFor({ browserDriver: 'netscape' })).toEqual({ driver: 'camoufox', profileId: null })
    expect(browserFor({ browserDriver: null, adsPowerProfileId: 'k9' })).toEqual({ driver: 'adsPower', profileId: 'k9' })
    expect(browserFor({ browserDriver: 'camoufox', adsPowerProfileId: 'k9' })).toEqual({ driver: 'camoufox', profileId: 'k9' })
  })

  test("python/browser/browserDriver.py opens exactly the TS browsers, and maps the gate's proxy to AdsPower's", () => {
    const script = [
      'import json',
      'from browser import browserDriver, adsPowerBrowser',
      'print(json.dumps({"browsers": list(browserDriver.BROWSERS), "openers": sorted(browserDriver.OPENERS),',
      ' "default": browserDriver.driver_of({}), "ads": browserDriver.driver_of({"browser": {"driver": "adsPower", "profileId": "k1"}}),',
      ' "proxy": adsPowerBrowser.user_proxy_config({"server": "http://na.proxy.2captcha.com:2334", "username": "proxyUser", "password": "p"})}))'
    ].join('\n')
    const run = Bun.spawnSync([process.env.LOG_PYTHON || 'python', '-c', script], { cwd: `${import.meta.dir}/../../../python` })
    expect(run.exitCode).toBe(0)
    const out = JSON.parse(run.stdout.toString())
    expect(out.browsers.sort()).toEqual([...BROWSER_DRIVERS].sort())
    expect(out.openers).toEqual([...BROWSER_DRIVERS].sort())
    expect(out.default).toEqual(['camoufox', null])
    expect(out.ads).toEqual(['adsPower', 'k1'])
    expect(out.proxy).toEqual({ proxy_soft: 'other', proxy_type: 'http', proxy_host: 'na.proxy.2captcha.com', proxy_port: '2334', proxy_user: 'proxyUser', proxy_password: 'p' })
  })
})
