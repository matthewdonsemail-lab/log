import { describe, expect, test } from 'bun:test'
import { createActor, waitFor } from 'xstate'
import { createBrowserSession } from '../browser/driver/index'
import { listFacebookAccounts } from '../marketplace/socialAccount/index'
import { marketplaceFixture } from '../twenty/graphql/index'
import { adsPowerDriver, NO_PROXY, proxyConfig } from './driver/index'
import { AdsPowerError, createAdsPowerClient } from './localApi/index'
import type { AdsPowerClient, AdsPowerProfile } from './localApi/index'
import { planSync, profileRequest, remarkAccountId, syncProfiles, twentyRemark } from './profile/index'

/** A Local API that answers from a script, recording every call. */
function fakeFetch(answers: Record<string, unknown[]>) {
  const calls: { path: string; body: unknown; auth: string | null }[] = []
  const impl = async (url: string, init?: RequestInit) => {
    const path = new URL(url).pathname
    calls.push({ path, body: init?.body ? JSON.parse(String(init.body)) : null, auth: new Headers(init?.headers).get('Authorization') })
    const queue = answers[path] ?? [{ code: 0, msg: 'success' }]
    const reply = queue.length > 1 ? queue.shift() : queue[0]
    return new Response(JSON.stringify(reply))
  }
  return { impl, calls }
}

/** An in-memory AdsPower, for sync and driver tests. */
function memoryAdsPower(profiles: AdsPowerProfile[] = []) {
  const log: string[] = []
  const client: AdsPowerClient = {
    status: async () => true,
    listProfiles: async () => profiles,
    ensureGroup: async () => '7',
    createProfile: async (body) => {
      const profileId = `p${profiles.length + 1}`
      profiles.push({ profileId, profileNo: String(profiles.length + 1), name: body.name, groupId: body.group_id, remark: body.remark ?? null, lastOpenTime: null })
      log.push(`create ${body.name}`)
      return { profileId, profileNo: null }
    },
    updateProfile: async (id, fields) => void log.push(`update ${id} ${JSON.stringify(fields)}`),
    startBrowser: async (id) => (log.push(`start ${id}`), { profileId: id, cdpUrl: 'ws://127.0.0.1:9/devtools/browser/x', debugPort: '9' }),
    activeBrowser: async () => null,
    stopBrowser: async (id) => void log.push(`stop ${id}`)
  }
  return { client, profiles, log }
}

describe('adsPower Local API client', () => {
  test('sends the key as a Bearer token and reads a started profile\'s CDP websocket', async () => {
    const net = fakeFetch({ '/api/v2/browser-profile/start': [{ code: 0, msg: 'success', data: { ws: { puppeteer: 'ws://127.0.0.1:1/devtools/browser/a' }, debug_port: '1' } }] })
    const client = createAdsPowerClient({ baseUrl: 'http://local.adspower.net:50325', apiKey: 'k' }, net.impl)
    const started = await client.startBrowser('abc')
    expect(started).toEqual({ profileId: 'abc', cdpUrl: 'ws://127.0.0.1:1/devtools/browser/a', debugPort: '1' })
    expect(net.calls[0]).toMatchObject({ path: '/api/v2/browser-profile/start', auth: 'Bearer k', body: { profile_id: 'abc', headless: '0', last_opened_tabs: '0', proxy_detection: '0' } })
  })

  test('"Too many request" is retried, then refused as adsPowerRateLimited', async () => {
    const busy = { code: -1, msg: 'Too many request per second, please check' }
    const ok = fakeFetch({ '/api/v2/browser-profile/stop': [busy, { code: 0, msg: 'success' }] })
    await createAdsPowerClient({ baseUrl: 'http://x', apiKey: null }, ok.impl, [1]).stopBrowser('a')
    expect(ok.calls).toHaveLength(2)
    const spent = fakeFetch({ '/api/v2/browser-profile/stop': [busy] })
    const error = await createAdsPowerClient({ baseUrl: 'http://x', apiKey: null }, spent.impl, [1, 1]).stopBrowser('a').catch((e) => e)
    expect(error).toBeInstanceOf(AdsPowerError)
    expect(error.code).toBe('adsPowerRateLimited')
  })

  test('the app not running is adsPowerUnavailable, and lists page through 100 at a time', async () => {
    const down = createAdsPowerClient({ baseUrl: 'http://x', apiKey: null }, async () => { throw new Error('ECONNREFUSED') })
    expect(await down.status()).toBe(false)
    expect((await down.listProfiles().catch((e) => e)).code).toBe('adsPowerUnavailable')
    const page = (n: number, from: number) => ({ code: 0, msg: 'ok', data: { list: Array.from({ length: n }, (_, i) => ({ profile_id: `p${from + i}`, name: `n${from + i}`, remark: null })) } })
    const net = fakeFetch({ '/api/v2/browser-profile/list': [page(100, 0), page(3, 100)] })
    expect(await createAdsPowerClient({ baseUrl: 'http://x', apiKey: null }, net.impl).listProfiles()).toHaveLength(103)
  })
})

describe('adsPower profiles from Twenty (rule 42)', () => {
  test('the profile is Windows Chrome with the home locale, IP timezone and noise, and holds no proxy or secret', async () => {
    const [account] = (await listFacebookAccounts(marketplaceFixture())).filter((a) => a.accountName === 'galwayOne')
    const body = profileRequest(account, '7')!
    expect(body).toMatchObject({ name: 'galwayOne', group_id: '7', remark: twentyRemark(account.id), user_proxy_config: { proxy_soft: 'no_proxy' } })
    expect(body.fingerprint_config).toMatchObject({ browser_kernel_config: { type: 'chrome' }, language: ['en-IE', 'en'], automatic_timezone: '1', canvas: '1', webgl_image: '1', audio: '1' })
    expect(JSON.stringify(body)).not.toMatch(/password|cookie|fakey|username/)
    expect(remarkAccountId(body.remark!)).toBe(account.id)
  })

  test('the plan makes a profile per account, skips banned and unlocalisable ones, and relinks one found by its remark', async () => {
    const accounts = await listFacebookAccounts(marketplaceFixture())
    const galwayTwo = accounts.find((a) => a.accountName === 'galwayTwo')!
    const plan = planSync(accounts, [{ profileId: 'old', profileNo: '1', name: 'galwayTwo', groupId: '7', remark: twentyRemark(galwayTwo.id), lastOpenTime: null }])
    const action = (name: string) => plan.find((e) => e.accountName === name)!.action
    expect(action('banned')).toBe('skip')
    expect(action('noCountry')).toBe('skip')
    expect(action('vietnam')).toBe('skip')
    expect(action('galwayTwo')).toBe('relink')
    expect(action('galwayOne')).toBe('create')
    expect(plan.filter((e) => e.action === 'create')).toHaveLength(7)
  })

  test('sync is a dry run unless applied; applied, it makes the profiles and links each in Twenty, and a rerun only finds them linked', async () => {
    const twenty = marketplaceFixture()
    const ads = memoryAdsPower()
    const dry = await syncProfiles(twenty, ads.client, { apply: false })
    expect(dry.applied).toBe(false)
    expect(ads.log).toEqual([])
    const lines: string[] = []
    const applied = await syncProfiles(twenty, ads.client, { apply: true, log: (l) => lines.push(l) })
    expect(ads.log.filter((l) => l.startsWith('create'))).toHaveLength(8)
    expect(lines.some((l) => /^adsPower \d+\/11 galwayOne: made profile p\d+, linked in Twenty$/.test(l))).toBe(true)
    const linked = (await listFacebookAccounts(twenty)).find((a) => a.accountName === 'galwayOne')!
    expect(linked.adsPowerProfileId).toBe(applied.entries.find((e) => e.accountName === 'galwayOne')!.profileId)
    const again = await syncProfiles(twenty, ads.client, { apply: true })
    expect(again.entries.filter((e) => e.action === 'create')).toHaveLength(0)
    expect(again.entries.filter((e) => e.action === 'linked')).toHaveLength(8)
  })
})

describe('the AdsPower driver in the browser session machine', () => {
  test("the proxy URL becomes AdsPower's user_proxy_config", () => {
    expect(proxyConfig('http://u%3Asess:p@gw.example.com:8000')).toEqual({ proxy_soft: 'other', proxy_type: 'http', proxy_host: 'gw.example.com', proxy_port: '8000', proxy_user: 'u:sess', proxy_password: 'p' })
    expect(proxyConfig('not a proxy')).toBeNull()
  })

  test('until its gate is built, an AdsPower session is refused before anything starts (rule 12)', async () => {
    const twenty = marketplaceFixture()
    const ads = memoryAdsPower()
    await syncProfiles(twenty, ads.client, { apply: true })
    const account = (await listFacebookAccounts(twenty)).find((a) => a.accountName === 'galwayOne')!
    const driver = adsPowerDriver({ adsPower: ads.client, account: async () => account })
    const actor = createBrowserSession(driver, { driver: 'adsPower', accountId: account.id, accountName: account.accountName }).start()
    const done = await waitFor(actor, (s) => s.status === 'done')
    expect(done.output).toMatchObject({ state: 'refused', failure: { code: 'adsPowerGateNotBuilt' } })
    expect(ads.log.some((l) => l.startsWith('start'))).toBe(false)
  })

  test('with a passed gate it starts on the proxy; the unbuilt self-check closes it and takes the proxy back off', async () => {
    const twenty = marketplaceFixture()
    const ads = memoryAdsPower()
    await syncProfiles(twenty, ads.client, { apply: true })
    const account = (await listFacebookAccounts(twenty)).find((a) => a.accountName === 'galwayOne')!
    const driver = adsPowerDriver({ adsPower: ads.client, account: async () => account, gate: async () => ({ ok: true, exitIp: '1.2.3.4', exitCountry: 'IE', failure: null }) })
    const actor = createBrowserSession(driver, { driver: 'adsPower', accountId: account.id, accountName: account.accountName }).start()
    const done = await waitFor(actor, (s) => s.status === 'done')
    expect(done.output).toMatchObject({ state: 'closed', closeReason: 'selfCheckFailed', failure: { code: 'adsPowerSelfCheckNotBuilt' } })
    const id = account.adsPowerProfileId!
    expect(ads.log.filter((l) => l.includes(id)).map((l) => l.split(' ')[0])).toEqual(['update', 'start', 'stop', 'update'])
    expect(ads.log.at(-1)).toBe(`update ${id} ${JSON.stringify({ user_proxy_config: NO_PROXY })}`)
  })

  test('an account with no linked profile fails in preparing', async () => {
    const [account] = (await listFacebookAccounts(marketplaceFixture())).filter((a) => a.accountName === 'galwayOne')
    const driver = adsPowerDriver({ adsPower: memoryAdsPower().client, account: async () => account })
    const actor = createActor((await import('../browser/driver/index')).sessionMachineFor(driver), { input: { driver: 'adsPower', accountId: account.id, accountName: account.accountName } }).start()
    expect((await waitFor(actor, (s) => s.status === 'done')).output).toMatchObject({ state: 'failed', failure: { code: 'adsPowerProfileMissing' } })
  })
})
