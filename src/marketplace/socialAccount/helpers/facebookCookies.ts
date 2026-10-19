/** A Playwright cookie, as a storage_state file holds it. */
export interface PlaywrightCookie {
  name: string
  value: string
  domain: string
  path: string
  expires?: number
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'Strict' | 'Lax' | 'None'
}

/**
 * socialAccounts.cookies, in whatever shape it was stored (a Playwright list,
 * a browser-export list, a `{ name: value }` object, a JSON string or a
 * `a=b; c=d` header) → Playwright cookies on .facebook.com. Values are never
 * logged. Pure.
 */
export function toFacebookCookies(raw: unknown): PlaywrightCookie[] {
  let value = raw
  if (typeof value === 'string') {
    const text = value.trim()
    if (!text) return []
    try {
      value = JSON.parse(text)
    } catch {
      value = Object.fromEntries(
        text
          .split(';')
          .map((pair) => pair.trim().split('='))
          .filter((parts) => parts.length >= 2 && parts[0])
          .map(([name, ...rest]) => [name.trim(), rest.join('=').trim()])
      )
    }
  }
  if (Array.isArray(value)) {
    return value
      .filter((c): c is Record<string, unknown> => !!c && typeof c === 'object' && typeof (c as { name?: unknown }).name === 'string')
      .map((c) => {
        const cookie: PlaywrightCookie = {
          name: String(c.name),
          value: String(c.value ?? ''),
          domain: typeof c.domain === 'string' && c.domain ? c.domain : '.facebook.com',
          path: typeof c.path === 'string' && c.path ? c.path : '/'
        }
        const expires = Number(c.expires ?? c.expirationDate)
        if (Number.isFinite(expires) && expires > 0) cookie.expires = expires
        if (typeof c.httpOnly === 'boolean') cookie.httpOnly = c.httpOnly
        if (typeof c.secure === 'boolean') cookie.secure = c.secure
        const sameSite = String(c.sameSite ?? '').toLowerCase()
        if (sameSite === 'strict') cookie.sameSite = 'Strict'
        else if (sameSite === 'lax') cookie.sameSite = 'Lax'
        else if (sameSite === 'none' || sameSite === 'no_restriction') cookie.sameSite = 'None'
        return cookie
      })
  }
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v != null)
      .map(([name, v]) => ({ name, value: String(v), domain: '.facebook.com', path: '/' }))
  }
  return []
}

/** The Facebook session cookie is there (`c_user` = the logged-in user id). Pure. */
export function hasFacebookSession(cookies: PlaywrightCookie[]): boolean {
  return cookies.some((c) => c.name === 'c_user' && c.value) && cookies.some((c) => c.name === 'xs' && c.value)
}
