import { createHash } from 'node:crypto'
import type { ProxyRequest, TwoCaptchaPlace } from '../types'

export const GATEWAY_PORTS = { http: 2334, socks5: 2333 } as const

const NORTH_AMERICA = new Set(['US', 'CA', 'MX'])
const ASIA = new Set(['VN', 'TH', 'ID', 'MY', 'PH', 'SG', 'JP', 'KR', 'IN', 'PK', 'BD', 'HK', 'TW', 'AU', 'NZ', 'AE', 'SA', 'TR', 'IL'])

export function gatewayHost(country: string): string {
  const code = country.toUpperCase()
  if (NORTH_AMERICA.has(code)) return 'na.proxy.2captcha.com'
  if (ASIA.has(code)) return 'ap.proxy.2captcha.com'
  return 'eu.proxy.2captcha.com'
}

export function sessionFor(accountId: string, place: TwoCaptchaPlace | null = null, attempt = 0): string {
  const base = place ? `logCli:${accountId}:${slug(place.region)}:${slug(place.city)}` : `logCli:${accountId}`
  const key = attempt > 0 ? `${base}:${attempt}` : base
  return createHash('sha256').update(key).digest('base64').replace(/[^A-Za-z0-9]/g, '').slice(0, 9)
}

export function slug(text: string): string {
  return text.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g, '')
}

export function buildProxyUrl(request: ProxyRequest): string {
  const minutes = Math.min(120, Math.max(1, Math.round(request.sessionMinutes)))
  const parts = [request.username, 'zone-custom', `region-${request.country.toLowerCase()}`]
  if (request.place) parts.push(`st-${slug(request.place.region)}`, `city-${slug(request.place.city)}`)
  parts.push(`session-${request.session}`, `sessTime-${minutes}`)
  const user = encodeURIComponent(parts.join('-'))
  return `${request.protocol}://${user}:${encodeURIComponent(request.password)}@${request.host}:${GATEWAY_PORTS[request.protocol]}`
}
