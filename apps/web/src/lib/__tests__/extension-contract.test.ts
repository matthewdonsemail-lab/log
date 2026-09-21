import { describe, expect, it } from 'vitest'
import { parseToken } from '../../../../../convex/lib/token'
import { SITES, buildToken, hasLogin, platformForUrl, toRecord, type ChromeCookie, type PlatformId } from '../../../../extension/lib.js'

const NOW = Date.UTC(2026, 8, 18)
const soon = Math.floor(NOW / 1000) + 86_400 * 30

const jwt = (sub: string) => `h.${btoa(JSON.stringify({ sub })).replace(/=+$/, '')}.s`
const chromeCookie = (name: string, value: string, domain: string, extra: Partial<ChromeCookie> = {}): ChromeCookie =>
  ({ name, value, domain, path: '/', expirationDate: soon, httpOnly: true, secure: true, sameSite: 'no_restriction', ...extra })

const JARS: Record<PlatformId, ChromeCookie[]> = {
  reddit: [chromeCookie('token_v2', jwt('user'), '.reddit.com'), chromeCookie('loid', 'x', '.reddit.com', { sameSite: 'unspecified' }), chromeCookie('session_tracker', 'y', 'www.reddit.com', { expirationDate: undefined })],
  x: [chromeCookie('auth_token', 'a', '.x.com'), chromeCookie('ct0', 'b', '.x.com', { sameSite: 'lax' }), chromeCookie('guest_id', 'c', '.twitter.com')],
  facebook: [chromeCookie('c_user', '100', '.facebook.com', { sameSite: 'strict' }), chromeCookie('xs', 'z', '.facebook.com')],
}

describe('the extension and the server agree on the token', () => {
  for (const platform of Object.keys(JARS) as PlatformId[]) {
    it(`a ${platform} token built by the extension is accepted by the server`, () => {
      const token = buildToken(platform, JARS[platform])
      expect(token.startsWith('lk1.')).toBe(true)
      const parsed = parseToken(token, NOW)
      expect(parsed.platform).toBe(platform)
      expect(parsed.cookies).toHaveLength(JARS[platform].length)
      expect(hasLogin(platform, JARS[platform])).toBe(true)
    })
  }

  it('the extension refuses to call a logged-out jar ready, and the server agrees', () => {
    const anonymous = [chromeCookie('loid', 'x', '.reddit.com')]
    expect(hasLogin('reddit', anonymous)).toBe(false)
    expect(() => parseToken(buildToken('reddit', anonymous), NOW)).toThrow()
    expect(hasLogin('x', [chromeCookie('auth_token', 'a', '.x.com')])).toBe(false)
    expect(hasLogin('facebook', [chromeCookie('c_user', '1', '.facebook.com')])).toBe(false)
  })

  it('maps browser cookies to the records the camofox clients load', () => {
    expect(toRecord(chromeCookie('a', 'b', '.x.com'))).toEqual({
      name: 'a', value: 'b', domain: '.x.com', path: '/', expires: soon, httpOnly: true, secure: true, sameSite: 'None',
    })
    expect(toRecord({ name: 'a', value: 'b', domain: 'x.com' })).toMatchObject({ path: '/', expires: -1, httpOnly: false, secure: false, sameSite: 'Lax' })
    expect(toRecord(chromeCookie('a', 'b', 'x.com', { sameSite: 'strict' })).sameSite).toBe('Strict')
  })

  it('recognizes the supported sites and nothing else', () => {
    expect(platformForUrl('https://www.reddit.com/r/marketing/')).toBe('reddit')
    expect(platformForUrl('https://old.reddit.com/')).toBe('reddit')
    expect(platformForUrl('https://x.com/home')).toBe('x')
    expect(platformForUrl('https://twitter.com/home')).toBe('x')
    expect(platformForUrl('https://m.facebook.com/groups/1')).toBe('facebook')
    expect(platformForUrl('https://notreddit.com/')).toBeNull()
    expect(platformForUrl('https://reddit.com.evil.io/')).toBeNull()
    expect(platformForUrl('chrome://extensions')).toBeNull()
    expect(platformForUrl('not a url')).toBeNull()
    expect(Object.keys(SITES).sort()).toEqual(['facebook', 'reddit', 'x'])
  })

  it('the extension only asks for the sites the server accepts cookies from', async () => {
    const manifest = (await import('../../../../extension/manifest.json')).default
    const hosts = (manifest.host_permissions as string[]).join(' ')
    for (const site of Object.values(SITES)) for (const domain of site.domains) expect(hosts).toContain(domain)
    expect(manifest.permissions).toEqual(['activeTab', 'cookies', 'clipboardWrite', 'storage', 'scripting'])
  })
})
