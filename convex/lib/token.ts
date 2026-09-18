import { ConvexError } from 'convex/values'

export type SessionPlatform = 'facebook' | 'x' | 'reddit'
export type SessionCookie = {
  name: string; value: string; domain: string; path: string; expires: number
  httpOnly: boolean; secure: boolean; sameSite: 'Strict' | 'Lax' | 'None'
}
export type ParsedToken = { platform: SessionPlatform; cookies: SessionCookie[]; expiresAt: number | null }

const PREFIX = 'lk1.'
const MAX_TOKEN_CHARS = 120_000
const MAX_COOKIES = 300
const MAX_VALUE_CHARS = 8_000

const SITES: Record<SessionPlatform, { name: string; site: string; domains: string[]; required: string[][] }> = {
  reddit: { name: 'Reddit', site: 'reddit.com', domains: ['reddit.com'], required: [['token_v2', 'reddit_session']] },
  x: { name: 'X', site: 'x.com', domains: ['x.com', 'twitter.com'], required: [['auth_token'], ['ct0']] },
  facebook: { name: 'Facebook', site: 'facebook.com', domains: ['facebook.com'], required: [['c_user'], ['xs']] },
}

const isPlatform = (value: unknown): value is SessionPlatform => typeof value === 'string' && value in SITES

function decodeBase64Url(text: string): string {
  const padded = text.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(text.length / 4) * 4, '=')
  const binary = atob(padded)
  return new TextDecoder().decode(Uint8Array.from(binary, char => char.charCodeAt(0)))
}

function cleanCookie(raw: unknown, domains: string[]): SessionCookie | null {
  if (typeof raw !== 'object' || raw === null) return null
  const c = raw as Record<string, unknown>
  if (typeof c.name !== 'string' || typeof c.value !== 'string' || typeof c.domain !== 'string') return null
  if (!c.name || c.value.length > MAX_VALUE_CHARS) return null
  const host = c.domain.replace(/^\./, '').toLowerCase()
  if (!domains.some(allowed => host === allowed || host.endsWith(`.${allowed}`))) return null
  const sameSite = c.sameSite === 'Strict' || c.sameSite === 'None' ? c.sameSite : 'Lax'
  return {
    name: c.name, value: c.value, domain: c.domain, path: typeof c.path === 'string' && c.path ? c.path : '/',
    expires: typeof c.expires === 'number' && Number.isFinite(c.expires) ? c.expires : -1,
    httpOnly: c.httpOnly === true, secure: c.secure === true, sameSite,
  }
}

function jwtSubject(value: string): string | null {
  try { return (JSON.parse(decodeBase64Url(value.split('.')[1])) as { sub?: unknown }).sub as string ?? null } catch { return null }
}

/**
 * Validate a token copied from the ListeningKit extension and return only what a client
 * needs: cookies on the platform's own domains. Every rejection is a sentence a person
 * can act on. Never logs or echoes a cookie value.
 */
export function parseToken(token: string, now = Date.now()): ParsedToken {
  const text = token.trim()
  if (!text.startsWith(PREFIX)) throw new ConvexError('That is not a ListeningKit token. Copy it with the ListeningKit extension.')
  if (text.length > MAX_TOKEN_CHARS) throw new ConvexError('That token is too large. Copy it again from the extension.')
  let body: unknown
  try { body = JSON.parse(decodeBase64Url(text.slice(PREFIX.length))) } catch {
    throw new ConvexError('That token looks damaged. Copy it again from the extension.')
  }
  const { v, platform, cookies } = (body ?? {}) as { v?: unknown; platform?: unknown; cookies?: unknown }
  if (v !== 1 || !isPlatform(platform) || !Array.isArray(cookies) || cookies.length > MAX_COOKIES) {
    throw new ConvexError('That token looks damaged. Copy it again from the extension.')
  }
  const site = SITES[platform]
  const kept = cookies.map(cookie => cleanCookie(cookie, site.domains)).filter((cookie): cookie is SessionCookie => cookie !== null)
  const auth = site.required.map(anyOf => kept.find(cookie => anyOf.includes(cookie.name)))
  if (auth.some(cookie => cookie === undefined)) {
    throw new ConvexError(`We could not find your ${site.name} login. Log in at ${site.site}, then copy the token again.`)
  }
  const found = auth as SessionCookie[]
  if (platform === 'reddit' && found[0].name === 'token_v2' && jwtSubject(found[0].value) === 'loid') {
    throw new ConvexError('You are not logged in to Reddit. Log in at reddit.com, then copy the token again.')
  }
  const expiries = found.map(cookie => cookie.expires).filter(expires => expires > 0).map(expires => expires * 1000)
  const expiresAt = expiries.length ? Math.min(...expiries) : null
  if (expiresAt !== null && expiresAt <= now) {
    throw new ConvexError(`Your ${site.name} login has expired. Log in again at ${site.site}, then copy a fresh token.`)
  }
  return { platform, cookies: kept, expiresAt }
}
