import { describe, expect, test } from 'bun:test'
import { buildProxyUrl, gatewayHost, getBalance, getProxyAccount, searchPlaces, sessionFor, slug, twoCaptchaCredentials } from './index'

const json = (body: unknown, status = 200) => (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch

describe('buildProxyUrl', () => {
  test("follows 2Captcha's username format: country, state, city, sticky session", () => {
    const url = buildProxyUrl({
      username: 'u7eabc',
      password: 'p@ss',
      country: 'IE',
      place: { city: 'galway', region: 'connacht', countryCode: 'ie' },
      session: 'Ab3dE5fG7',
      sessionMinutes: 120,
      protocol: 'http',
      host: 'eu.proxy.2captcha.com'
    })
    expect(url).toBe('http://u7eabc-zone-custom-region-ie-st-connacht-city-galway-session-Ab3dE5fG7-sessTime-120:p%40ss@eu.proxy.2captcha.com:2334')
  })

  test('country only, SOCKS5, and the 120 minute cap', () => {
    const url = buildProxyUrl({ username: 'u', password: 'p', country: 'gb', session: 's', sessionMinutes: 999, protocol: 'socks5', host: 'eu.proxy.2captcha.com' })
    expect(url).toBe('socks5://u-zone-custom-region-gb-session-s-sessTime-120:p@eu.proxy.2captcha.com:2333')
  })

  test('the nearest gateway, a stable session per account, slugs', () => {
    expect(gatewayHost('IE')).toBe('eu.proxy.2captcha.com')
    expect(gatewayHost('US')).toBe('na.proxy.2captcha.com')
    expect(gatewayHost('VN')).toBe('ap.proxy.2captcha.com')
    expect(sessionFor('acc1')).toBe(sessionFor('acc1'))
    expect(sessionFor('acc1')).not.toBe(sessionFor('acc2'))
    expect(sessionFor('acc1')).toMatch(/^[A-Za-z0-9]{9}$/)
    expect(slug('Co. Cork')).toBe('cocork')
  })
})

describe('the 2Captcha API (fetch injected)', () => {
  test('credentials: the API key and the dashboard proxy password are both needed', () => {
    expect(twoCaptchaCredentials({ '2CAPTCHA_API_KEY': 'k', '2CAPTCHA_PROXY_PASSWORD': 'p' })).toEqual({ apiKey: 'k', proxyPassword: 'p' })
    expect(twoCaptchaCredentials({ TWOCAPTCHA_API_KEY: 'k' })).toMatchObject({ missing: expect.stringContaining('2CAPTCHA_PROXY_PASSWORD') })
    expect(twoCaptchaCredentials({})).toEqual({ missing: '2CAPTCHA_API_KEY' })
  })

  test('account, balance, and a refused key', async () => {
    const account = await getProxyAccount('k', json({ status: 'OK', data: { username: 'u7e', status: 1, total_flow: 992, use_flow: 141, last_flow: 851, ip_white: [] } }))
    expect(account).toEqual({ username: 'u7e', status: 1, totalFlow: 992, usedFlow: 141, leftFlow: 851, whitelistedIps: [] })
    expect(await getBalance('k', json({ status: 'OK', balance: 0.01, traffic: 850.5 }))).toEqual({ balance: 0.01, traffic: 850.5 })
    await expect(getProxyAccount('bad', json({ status: 'ERROR', message: 'Invalid API key' }))).rejects.toMatchObject({ code: 'twoCaptchaRefused' })
  })

  test('place search keeps only real places', async () => {
    const places = await searchPlaces('Galway', json([{ id: 1, city: 'galway', regionId: 2, region: 'connacht', countryCode: 'ie' }, { bogus: true }]))
    expect(places).toEqual([{ city: 'galway', region: 'connacht', countryCode: 'ie' }])
  })
})
