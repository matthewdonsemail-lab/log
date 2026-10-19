import { createHash } from 'node:crypto'
import type { ProxyRequest, TwoCaptchaPlace } from '../types'

/** Gateway ports, from 2Captcha's dashboard code: HTTP 2334, SOCKS5 2333. */
export const GATEWAY_PORTS = { http: 2334, socks5: 2333 } as const

const NORTH_AMERICA = new Set(['US', 'CA', 'MX'])
const ASIA = new Set(['VN', 'TH', 'ID', 'MY', 'PH', 'SG', 'JP', 'KR', 'IN', 'PK', 'BD', 'HK', 'TW', 'AU', 'NZ', 'AE', 'SA', 'TR', 'IL'])

/**
 * The gateway nearest the exit country (2Captcha's servers list: na, eu, ap).
 * Any gateway reaches any country; the nearest is just faster. Pure.
 */
export function gatewayHost(country: string): string {
  const code = country.toUpperCase()
  if (NORTH_AMERICA.has(code)) return 'na.proxy.2captcha.com'
  if (ASIA.has(code)) return 'ap.proxy.2captcha.com'
  return 'eu.proxy.2captcha.com'
}

/**
 * A stable sticky-session id for one account: 9 letters and digits from its
 * record id and its place, so every run of that account asks 2Captcha for the same session
 * (until `log proxy assign` retries with the next `attempt`).
 * Pure.
 */
export function sessionFor(accountId: string, place: TwoCaptchaPlace | null = null, attempt = 0): string {
  // The place is part of the key: 2Captcha keeps a session's IP even when the
  // username's state and city change, so a re-pinned account needs a new session.
  // `attempt` gives a fresh IP when one exits too far from home.
  const base = place ? `logCli:${accountId}:${slug(place.region)}:${slug(place.city)}` : `logCli:${accountId}`
  const key = attempt > 0 ? `${base}:${attempt}` : base
  return createHash('sha256').update(key).digest('base64').replace(/[^A-Za-z0-9]/g, '').slice(0, 9)
}

/** `Galway` → `galway`, `Co. Cork` → `cocork`: 2Captcha's slugs are lower case letters only. Pure. */
export function slug(text: string): string {
  return text.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g, '')
}

/**
 * The proxy URL for socialAccounts.proxy. The username follows 2Captcha's
 * dashboard: `<username>-zone-custom-region-<cc>[-st-<state>][-city-<city>]
 * -session-<id>-sessTime-<minutes>`. Pure.
 */
export function buildProxyUrl(request: ProxyRequest): string {
  const minutes = Math.min(120, Math.max(1, Math.round(request.sessionMinutes)))
  const parts = [request.username, 'zone-custom', `region-${request.country.toLowerCase()}`]
  if (request.place) parts.push(`st-${slug(request.place.region)}`, `city-${slug(request.place.city)}`)
  parts.push(`session-${request.session}`, `sessTime-${minutes}`)
  const user = encodeURIComponent(parts.join('-'))
  return `${request.protocol}://${user}:${encodeURIComponent(request.password)}@${request.host}:${GATEWAY_PORTS[request.protocol]}`
}
