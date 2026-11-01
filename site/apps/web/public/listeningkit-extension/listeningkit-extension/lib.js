// Pure helpers for the ListeningKit Connect extension. No browser APIs here, so they are unit-tested in Node.

export const SITES = {
  reddit: { name: 'Reddit', url: 'https://www.reddit.com/', domains: ['reddit.com'], login: [['token_v2', 'reddit_session']] },
  x: { name: 'X', url: 'https://x.com/', domains: ['x.com', 'twitter.com'], login: [['auth_token'], ['ct0']] },
  facebook: { name: 'Facebook', url: 'https://www.facebook.com/', domains: ['facebook.com'], login: [['c_user'], ['xs']] },
}

export const TOKEN_PREFIX = 'lk1.'

/** Which supported platform a tab URL belongs to, or null. */
export function platformForUrl(url) {
  let host
  try { host = new URL(url).hostname.toLowerCase() } catch { return null }
  for (const [id, site] of Object.entries(SITES)) {
    if (site.domains.some((domain) => host === domain || host.endsWith(`.${domain}`))) return id
  }
  return null
}

const SAME_SITE = { strict: 'Strict', lax: 'Lax', no_restriction: 'None' }

/** A chrome.cookies cookie as a Playwright-style record (what the camofox clients load). */
export function toRecord(cookie) {
  return {
    name: cookie.name,
    value: cookie.value,
    domain: cookie.domain,
    path: cookie.path || '/',
    expires: typeof cookie.expirationDate === 'number' ? cookie.expirationDate : -1,
    httpOnly: cookie.httpOnly === true,
    secure: cookie.secure === true,
    sameSite: SAME_SITE[cookie.sameSite] ?? 'Lax',
  }
}

/** Whether the jar holds what proves a login for this platform (checked before copying, so the message is instant). */
export function hasLogin(platform, cookies) {
  const names = new Set(cookies.map((cookie) => cookie.name))
  return SITES[platform].login.every((anyOf) => anyOf.some((name) => names.has(name)))
}

function base64Url(text) {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** The string a person pastes into ListeningKit: `lk1.` plus the base64url JSON of the cookie jar. */
export function buildToken(platform, chromeCookies) {
  if (!SITES[platform]) throw new Error(`unknown platform: ${platform}`)
  const cookies = chromeCookies.map(toRecord)
  return TOKEN_PREFIX + base64Url(JSON.stringify({ v: 1, platform, cookies }))
}
