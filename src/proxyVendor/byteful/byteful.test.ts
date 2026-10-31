import { describe, expect, test } from 'bun:test'
import { meterForProxy } from '../traffic/index'
import { parseVendor, vendorOfProxy } from '../vendor/index'
import { bytefulCredentials, getResidentialSummary, pickCity, quoteIsp, residentialProxyUrl, searchCities } from './index'
import type { BytefulCity } from './index'

const creds = { publicKey: 'pub', privateKey: 'priv' }

function fakeFetch(body: unknown, seen: { url?: string; headers?: Record<string, string>; method?: string; sent?: string }[] = []): typeof fetch {
  return (async (url: string, init: RequestInit = {}) => {
    seen.push({ url: String(url), headers: init.headers as Record<string, string>, method: init.method, sent: init.body as string | undefined })
    return new Response(JSON.stringify(body), { status: 200 })
  }) as unknown as typeof fetch
}

describe('Byteful', () => {
  test('the keys come from BYTEFUL_PUBLIC_KEY and BYTEFUL_PRIVATE_KEY, and go in headers, never the URL', async () => {
    expect(bytefulCredentials({ BYTEFUL_PUBLIC_KEY: 'a', BYTEFUL_PRIVATE_KEY: 'b' })).toEqual({ publicKey: 'a', privateKey: 'b' })
    expect(bytefulCredentials({ BYTEFUL_PUBLIC_KEY: 'a' })).toEqual({ missing: 'BYTEFUL_PRIVATE_KEY' })
    const seen: { url?: string; headers?: Record<string, string> }[] = []
    const summary = await getResidentialSummary(creds, fakeFetch({ data: { proxy_user_ids: ['125248_x'], residential_bytes: 1e9, residential_bytes_used: 2e8, residential_bytes_left: 8e8 } }, seen))
    expect(summary).toEqual({ proxyUserIds: ['125248_x'], bytes: 1e9, bytesUsed: 2e8, bytesLeft: 8e8 })
    expect(seen[0].headers).toMatchObject({ 'X-API-Public-Key': 'pub', 'X-API-Private-Key': 'priv' })
    expect(seen[0].url).not.toContain('priv')
  })

  test("the account's city is the one of that name nearest home (Bethlehem PA, not South Africa); none with devices is null", () => {
    const cities: BytefulCity[] = [
      { cityId: 1, cityName: 'Bethlehem', subdivisionId: 'za-fs', latitude: -28.23, longitude: 28.3, nodes: 18 },
      { cityId: 2, cityName: 'Bethlehem', subdivisionId: 'us-pa', latitude: 40.63, longitude: -75.37, nodes: 550 },
      { cityId: 3, cityName: 'Wilkes Barre', subdivisionId: 'us-pa', latitude: 41.25, longitude: -75.88, nodes: 0 }
    ]
    expect(pickCity(cities, 'bethlehem', { latitude: 40.6, longitude: -75.4 })?.cityId).toBe(2)
    expect(pickCity(cities, 'Bethlehem', null)?.cityId).toBe(2)
    expect(pickCity(cities, 'Wilkes-Barre', { latitude: 41.2, longitude: -75.9 })).toBeNull()
  })

  test('a city search reads each city with where it is and its devices', async () => {
    const cities = await searchCities(creds, 'Bethlehem', fakeFetch({ data: [{ city_id: 385209, city_name: 'Bethlehem', subdivision_id: 'us-pa', city_latitude: 40.62593, city_longitude: -75.37046, city_node_count: 550 }] }))
    expect(cities).toEqual([{ cityId: 385209, cityName: 'Bethlehem', subdivisionId: 'us-pa', latitude: 40.62593, longitude: -75.37046, nodes: 550 }])
  })

  test('a residential proxy is one sticky URL from the list endpoint, pinned to the city, 24 hours', async () => {
    const seen: { url?: string }[] = []
    const url = await residentialProxyUrl(creds, { proxyUserId: '125248_x', country: 'US', cityId: 385209, ttl: '24h', protocol: 'http' }, fakeFetch({ data: ['http://125248_x_c_us_city_us_pa_bethlehem_s_ABC_ttl_24h:pw@residential.byteful.com:8000'] }, seen))
    expect(url).toContain('@residential.byteful.com:8000')
    const asked = new URL(seen[0].url!)
    expect(asked.pathname).toBe('/1.0/public/user/residential/list')
    expect(Object.fromEntries(asked.searchParams)).toMatchObject({ list_count: '1', list_session_type: 'sticky', list_session_ttl: '24h', country_id: 'us', city_id: '385209', list_format: 'http' })
  })

  test('an ISP quote is a POST to /checkout/quote and buys nothing', async () => {
    const seen: { url?: string; method?: string; sent?: string }[] = []
    const quote = await quoteIsp(creds, 'US', 10, fakeFetch({ data: { is_valid: false, before_discount_total: 3000, credit_balance: 0, invalid_reason: 'not enough credit', line_items: [{ item_per_unit_amount: 300, item_name: 'Static Residential ISP Proxies [Mixed]' }] } }, seen))
    expect(quote).toMatchObject({ valid: false, totalCents: 3000, perUnitCents: 300 })
    expect(seen[0].url).toContain('/checkout/quote')
    expect(seen[0].url).not.toContain('/checkout/create')
    expect(JSON.parse(seen[0].sent!)).toMatchObject({ product_type: 'isp', country_id: 'us', quantity: 10 })
  })
})

describe('the proxy provider, from the account proxy URL in Twenty', () => {
  test("each provider's host; a static IP has none and isn't metered", () => {
    expect(vendorOfProxy('http://u-zone-custom:pw@na.proxy.2captcha.com:2334')).toEqual({ vendor: 'twoCaptcha', billing: 'traffic' })
    expect(vendorOfProxy('http://125248_x_c_us_s_A:pw@residential.byteful.com:8000')).toEqual({ vendor: 'byteful', billing: 'traffic' })
    expect(vendorOfProxy('http://u:pw@203.0.113.7:8080')).toBeNull()
    expect(vendorOfProxy(null)).toBeNull()
    expect(meterForProxy('http://u:pw@203.0.113.7:8080')).toBeNull()
    expect(meterForProxy('http://125248_x:pw@residential.byteful.com:8000')).not.toBeNull()
  })

  test('--vendor reads either spelling', () => {
    expect(parseVendor('byteful')).toBe('byteful')
    expect(parseVendor('2captcha')).toBe('twoCaptcha')
    expect(parseVendor('twoCaptcha')).toBe('twoCaptcha')
    expect(parseVendor('other')).toBeNull()
  })
})

describe('the city name sent to Byteful', () => {
  test('is title-cased, because its city search is case-sensitive', async () => {
    const seen: { url?: string }[] = []
    await searchCities(creds, 'wilkes-barre', fakeFetch({ data: [] }, seen))
    expect(new URL(seen[0].url!).searchParams.get('city_name')).toBe('Wilkes-Barre')
  })
})
