import { BytefulError } from './types'
import type { BytefulCity, BytefulCredentials, BytefulQuote, BytefulResidentialRequest, BytefulResidentialSummary, BytefulStaticProxy } from './types'

const API = 'https://api.byteful.com/1.0'
const TIMEOUT_MS = 20_000

export function bytefulCredentials(env: Record<string, string | undefined> = process.env): BytefulCredentials | { missing: string } {
  const publicKey = (env.BYTEFUL_PUBLIC_KEY ?? '').trim()
  const privateKey = (env.BYTEFUL_PRIVATE_KEY ?? '').trim()
  if (!publicKey) return { missing: 'BYTEFUL_PUBLIC_KEY' }
  if (!privateKey) return { missing: 'BYTEFUL_PRIVATE_KEY' }
  return { publicKey, privateKey }
}

async function call(creds: BytefulCredentials, path: string, what: string, fetchImpl: typeof fetch, init: { method?: string; body?: unknown } = {}): Promise<Record<string, unknown>> {
  let res: Response
  try {
    res = await fetchImpl(`${API}${path}`, {
      method: init.method ?? 'GET',
      headers: { 'X-API-Public-Key': creds.publicKey, 'X-API-Private-Key': creds.privateKey, ...(init.body ? { 'Content-Type': 'application/json' } : {}) },
      body: init.body ? JSON.stringify(init.body) : undefined,
      signal: AbortSignal.timeout(TIMEOUT_MS)
    })
  } catch (error) {
    throw new BytefulError('bytefulRefused', `${what}: ${error instanceof Error ? error.message : String(error)}`)
  }
  const body = (await res.json().catch(() => null)) as Record<string, unknown> | null
  if (!res.ok || body === null) throw new BytefulError('bytefulRefused', `${what}: HTTP ${res.status}${body && typeof body.message === 'string' ? ` (${body.message})` : ''}`)
  return body
}

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : null)

export async function getResidentialSummary(creds: BytefulCredentials, fetchImpl: typeof fetch = fetch): Promise<BytefulResidentialSummary> {
  const data = ((await call(creds, '/public/user/residential/summary', 'residential summary', fetchImpl)).data ?? {}) as Record<string, unknown>
  return {
    proxyUserIds: Array.isArray(data.proxy_user_ids) ? data.proxy_user_ids.map(String) : [],
    bytes: num(data.residential_bytes) ?? 0,
    bytesUsed: num(data.residential_bytes_used) ?? 0,
    bytesLeft: num(data.residential_bytes_left) ?? 0
  }
}

export async function getCreditCents(creds: BytefulCredentials, fetchImpl: typeof fetch = fetch): Promise<number> {
  const data = ((await call(creds, '/public/user/customer/retrieve', 'customer', fetchImpl)).data ?? {}) as Record<string, unknown>
  return num(data.credit_balance) ?? 0
}

export const cityTitle = (name: string) => name.trim().toLowerCase().replace(/(^|[\s-])([a-z])/g, (_, sep: string, ch: string) => sep + ch.toUpperCase())

export async function searchCities(creds: BytefulCredentials, cityName: string, fetchImpl: typeof fetch = fetch): Promise<BytefulCity[]> {
  const q = new URLSearchParams({ city_name: cityTitle(cityName), per_page: '100' })
  const data = (await call(creds, `/public/user/city/search?${q}`, 'city search', fetchImpl)).data
  const rows = Array.isArray(data) ? (data as Record<string, unknown>[]) : []
  return rows
    .map((r) => ({
      cityId: num(r.city_id) ?? 0,
      cityName: String(r.city_name ?? ''),
      subdivisionId: r.subdivision_id ? String(r.subdivision_id) : null,
      latitude: num(r.city_latitude) ?? 0,
      longitude: num(r.city_longitude) ?? 0,
      nodes: num(r.city_node_count) ?? 0
    }))
    .filter((c) => c.cityId && c.cityName)
}

export async function residentialProxyUrl(creds: BytefulCredentials, request: BytefulResidentialRequest, fetchImpl: typeof fetch = fetch): Promise<string> {
  const q = new URLSearchParams({ list_count: '1', list_format: request.protocol, list_session_type: 'sticky', list_session_ttl: request.ttl, proxy_user_id: request.proxyUserId, country_id: request.country.toLowerCase() })
  if (request.cityId) q.set('city_id', String(request.cityId))
  else if (request.subdivisionId) q.set('subdivision_id', request.subdivisionId)
  const data = (await call(creds, `/public/user/residential/list?${q}`, 'residential list', fetchImpl)).data
  const url = Array.isArray(data) ? data.find((u) => typeof u === 'string') : null
  if (!url) throw new BytefulError('bytefulRefused', 'residential list: no proxy returned')
  return url as string
}

export async function staticProxies(creds: BytefulCredentials, fetchImpl: typeof fetch = fetch): Promise<BytefulStaticProxy[]> {
  const data = (await call(creds, '/public/user/proxy/search?per_page=1000', 'proxy search', fetchImpl)).data
  const rows = Array.isArray(data) ? (data as Record<string, unknown>[]) : []
  return rows.map((r) => ({
    proxyId: String(r.proxy_id ?? ''),
    ipAddress: String(r.proxy_ip_address ?? ''),
    httpPort: num(r.proxy_http_port),
    socks5Port: num(r.proxy_socks5_port),
    type: String(r.proxy_type ?? ''),
    cityName: r.city_name ? String(r.city_name) : null,
    subdivisionName: r.subdivision_name ? String(r.subdivision_name) : null,
    countryId: r.country_id ? String(r.country_id) : null,
    latitude: num(r.city_latitude),
    longitude: num(r.city_longitude),
    online: typeof r.proxy_is_online === 'boolean' ? r.proxy_is_online : null
  }))
}

export async function quoteIsp(creds: BytefulCredentials, country: string, quantity: number, fetchImpl: typeof fetch = fetch): Promise<BytefulQuote> {
  const body = { product_type: 'isp', product_protocol: 'ipv4', country_id: country.toLowerCase(), cycle_interval: 'month', cycle_interval_count: 1, quantity }
  const data = ((await call(creds, '/public/user/checkout/quote', 'checkout quote', fetchImpl, { method: 'POST', body })).data ?? {}) as Record<string, unknown>
  const item = (Array.isArray(data.line_items) ? data.line_items[0] : null) as Record<string, unknown> | null
  return {
    valid: data.is_valid === true,
    totalCents: num(data.before_discount_total) ?? 0,
    perUnitCents: item ? num(item.item_per_unit_amount) : null,
    itemName: item?.item_name ? String(item.item_name) : null,
    creditCents: num(data.credit_balance) ?? 0,
    invalidReason: data.invalid_reason ? String(data.invalid_reason) : null
  }
}
