import { USABLE_STATUSES } from '../types'
import type { FacebookAccount, RunPurpose, RunProxy, RunnableCheck } from '../types'

const COUNTRY = /^[A-Z]{2}$/

export function parseProxyUrl(raw: string): Omit<RunProxy, 'country'> | null {
  const text = raw.trim()
  if (!text) return null
  const colon = /^([^\s:/@]+):(\d{1,5}):([^:\s]+):(\S+)$/.exec(text)
  if (colon && !text.includes('://')) {
    return { server: `http://${colon[1]}:${colon[2]}`, username: colon[3], password: colon[4] }
  }
  let url: URL
  try {
    url = new URL(text.includes('://') ? text : `http://${text}`)
  } catch {
    return null
  }
  if (!['http:', 'https:', 'socks5:'].includes(url.protocol) || !url.hostname || !url.port) return null
  const out: Omit<RunProxy, 'country'> = { server: `${url.protocol}//${url.hostname}:${url.port}` }
  if (url.username) out.username = decodeURIComponent(url.username)
  if (url.password) out.password = decodeURIComponent(url.password)
  return out
}

export function fetchProxyUrl(raw: string | null): string | null {
  const proxy = raw ? parseProxyUrl(raw) : null
  if (!proxy || !/^https?:/.test(proxy.server)) return null
  const [scheme, hostPort] = proxy.server.split('//')
  if (!proxy.username) return proxy.server
  const auth = encodeURIComponent(proxy.username) + (proxy.password ? `:${encodeURIComponent(proxy.password)}` : '')
  return `${scheme}//${auth}@${hostPort}`
}

export function maskProxyUsername(username: string): string {
  const dash = username.indexOf('-')
  return dash > 0 ? `***${username.slice(dash)}` : '***'
}

export function maskProxyUrl(raw: string | null): string {
  if (!raw) return ''
  const proxy = parseProxyUrl(raw)
  if (!proxy) return '(unreadable)'
  return `${proxy.server}${proxy.username ? ` as ${maskProxyUsername(proxy.username)}` : ''}`
}

export function checkRunnable(account: FacebookAccount, purpose: RunPurpose): RunnableCheck {
  if (account.platform !== 'FACEBOOK') {
    return { ok: false, code: 'accountNotFacebook', detail: `${account.accountName} is ${account.platform ?? 'no platform'}` }
  }
  if (purpose !== 'check' && (!account.status || !USABLE_STATUSES[purpose].includes(account.status))) {
    return {
      ok: false,
      code: 'accountNotUsable',
      detail: `${account.accountName} is ${account.status ?? 'unset'}; ${purpose === 'connect' ? 'signing in' : 'a run'} needs ${USABLE_STATUSES[purpose].join(', ')}`
    }
  }
  if (!account.proxy?.trim()) {
    return { ok: false, code: 'noProxy', detail: `${account.accountName} has no proxy in Twenty: no browser opens without one` }
  }
  const proxy = parseProxyUrl(account.proxy)
  if (!proxy) return { ok: false, code: 'proxyMalformed', detail: `${account.accountName}: use scheme://user:pass@host:port` }
  if (!account.homeCountry || !COUNTRY.test(account.homeCountry)) {
    return { ok: false, code: 'noHomeCountry', detail: `${account.accountName} has ${account.homeCountry ? `"${account.homeCountry}"` : 'no homeCountry'}` }
  }
  return { ok: true, proxy: { ...proxy, country: account.homeCountry } }
}
