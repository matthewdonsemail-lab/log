import { TwoCaptchaError } from './types'
import type { TwoCaptchaAccount, TwoCaptchaCredentials, TwoCaptchaPlace } from './types'

const API = 'https://api.2captcha.com'
const PLACES = 'https://2captcha.com/api/v1/proxy/regions/search'
const TIMEOUT_MS = 20_000

export function twoCaptchaCredentials(env: Record<string, string | undefined> = process.env): TwoCaptchaCredentials | { missing: string } {
  const apiKey = (env['2CAPTCHA_API_KEY'] || env.TWOCAPTCHA_API_KEY || '').trim()
  const proxyPassword = (env['2CAPTCHA_PROXY_PASSWORD'] || env.TWOCAPTCHA_PROXY_PASSWORD || '').trim()
  if (!apiKey) return { missing: '2CAPTCHA_API_KEY' }
  if (!proxyPassword) return { missing: '2CAPTCHA_PROXY_PASSWORD (2Captcha dashboard → Proxy → your sub-account password)' }
  return { apiKey, proxyPassword }
}

async function getJson(url: string, what: string, fetchImpl: typeof fetch): Promise<unknown> {
  let res: Response
  try {
    res = await fetchImpl(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
  } catch (error) {
    throw new TwoCaptchaError('twoCaptchaRefused', `${what}: ${error instanceof Error ? error.message : String(error)}`)
  }
  const body = (await res.json().catch(() => null)) as Record<string, unknown> | unknown[] | null
  if (!res.ok || body === null) throw new TwoCaptchaError('twoCaptchaRefused', `${what}: HTTP ${res.status}`)
  if (!Array.isArray(body) && body.status === 'ERROR') throw new TwoCaptchaError('twoCaptchaRefused', `${what}: ${String(body.message ?? 'error')}`)
  return body
}

export async function getProxyAccount(apiKey: string, fetchImpl: typeof fetch = fetch): Promise<TwoCaptchaAccount> {
  const body = (await getJson(`${API}/proxy?key=${encodeURIComponent(apiKey)}`, 'proxy account', fetchImpl)) as {
    data?: { username?: string; status?: number; total_flow?: number; use_flow?: number; last_flow?: number; ip_white?: string[] }
  }
  const data = body.data ?? {}
  if (!data.username) throw new TwoCaptchaError('twoCaptchaRefused', 'proxy account: no username (is the proxy product active?)')
  return {
    username: data.username,
    status: Number(data.status ?? 0),
    totalFlow: Number(data.total_flow ?? 0),
    usedFlow: Number(data.use_flow ?? 0),
    leftFlow: Number(data.last_flow ?? 0),
    whitelistedIps: data.ip_white ?? []
  }
}

export async function getBalance(apiKey: string, fetchImpl: typeof fetch = fetch): Promise<{ balance: number; traffic: number }> {
  const body = (await getJson(`${API}/proxy/balance?key=${encodeURIComponent(apiKey)}`, 'balance', fetchImpl)) as { balance?: number; traffic?: number }
  return { balance: Number(body.balance ?? 0), traffic: Number(body.traffic ?? 0) }
}

export async function searchPlaces(city: string, fetchImpl: typeof fetch = fetch): Promise<TwoCaptchaPlace[]> {
  const body = await getJson(`${PLACES}/${encodeURIComponent(city.toLowerCase())}`, 'location search', fetchImpl)
  if (!Array.isArray(body)) return []
  return body
    .filter((p): p is Record<string, unknown> => !!p && typeof p === 'object')
    .map((p) => ({ city: String(p.city ?? ''), region: String(p.region ?? ''), countryCode: String(p.countryCode ?? '') }))
    .filter((p) => p.city && p.countryCode)
}
