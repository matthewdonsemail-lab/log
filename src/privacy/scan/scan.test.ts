import { describe, expect, test } from 'bun:test'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PUBLIC_X_WEB_BEARER_PREFIX } from '../rules/index.ts'
import { loadDenylist, parseDenylist } from './client.ts'
import { fingerprintOf, formatFinding, isSkippedPath, looksBinary, maskValue, scanPath, scanText } from './index.ts'

const j = (...parts: string[]) => parts.join('')
const tail = 'Q7f3K9m2P8x4R6t1W5y0Z2b4N8c6V3d1'
const rulesOf = (text: string, path = 'docs/a.md') => scanText(path, text).map((f) => f.rule)

describe('privacy scan: secret shapes', () => {
  test('Slack tokens and cookies', () => {
    expect(rulesOf(j('token ', 'xo', 'xc-', '1234-5678-', tail))).toEqual(['slackToken'])
    expect(rulesOf(j('d=', 'xo', 'xd-', tail))).toEqual(['slackToken'])
  })

  test('enc_password with a value, not the bare field name', () => {
    expect(rulesOf(j('enc', '_password=', '#PWD_BROWSER:5:1700000000:', tail))).toEqual(['encPassword'])
    expect(rulesOf('the enc_password field is encrypted in the browser')).toEqual([])
  })

  test('session cookie values for X, Facebook and Instagram', () => {
    expect(rulesOf(j('auth', '_token=', 'a1b2c3d4e5f6a7b8c9d0'))).toEqual(['sessionCookie'])
    expect(rulesOf(j('"c', '_user": "', '100089', '123456789"'))).toEqual(['sessionCookie'])
    expect(rulesOf(j('{"name":"ct', '0","value":"', tail, '"}'))).toContain('sessionCookie')
    expect(rulesOf('const cookies = { auth_token: authToken, ct0 }')).toEqual([])
    expect(rulesOf('"sessionid": cookies["sessionid"]')).toEqual([])
  })

  test('nostr, AI and GitHub keys and PEM blocks', () => {
    expect(rulesOf(j('nsec', '1', 'qqqsyqcyq5rqwzqfpg9scrgwpugpzysnzs23v9ccrydpk8qarc0'))).toEqual(['nostrSecret'])
    expect(rulesOf(j('key: s', 'k-ant-', 'api03-', tail))).toEqual(['aiApiKey'])
    expect(rulesOf(j('gh', 'p_', tail, 'abcd'))).toEqual(['githubToken'])
    expect(rulesOf(j('github', '_pat_', tail, '_', tail))).toEqual(['githubToken'])
    expect(rulesOf(j('-----BEGIN ', 'OPENSSH PRIVATE', ' KEY-----'))).toEqual(['privateKey'])
    expect(rulesOf(j('-----BEGIN ', 'PRIVATE', ' KEY-----'))).toEqual(['privateKey'])
  })

  test('credentials in URLs unless the password is an obvious dummy', () => {
    expect(rulesOf(j('http://bob:', 'Hx7', 'q9Lm', '@proxy.internal:8080'))).toEqual(['urlCredentials'])
    expect(rulesOf('http://user:pass@proxy.local:8080')).toEqual([])
    expect(rulesOf('http://user:<password>@proxy.local:8080')).toEqual([])
    expect(rulesOf('socks5://me:${PROXY_PASSWORD}@proxy.local:1080')).toEqual([])
  })

  test('a Cloudflare tunnel id only next to the word tunnel, and trycloudflare links with credentials', () => {
    const uuid = j('3f2c1a9e', '-4b7d-4c1e-9a2b-', '8d7e6f5a4b3c')
    expect(rulesOf(`cloudflared tunnel run ${uuid}`)).toEqual(['cloudflareTunnel'])
    expect(rulesOf(`request id ${uuid}`)).toEqual([])
    expect(rulesOf(j('https://bob:', 'pw@quiet-', 'river.trycloudflare', '.com/'))).toContain('trycloudflareCredentials')
    expect(rulesOf(j('https://quiet-river.trycloudflare', '.com/mcp?token=', tail))).toEqual(['trycloudflareCredentials'])
    expect(rulesOf('https://quiet-river.trycloudflare.com/mcp')).toEqual([])
  })

  test('bearer tokens, except the public X web bearer', () => {
    expect(rulesOf(j('Authorization: Bear', 'er ', tail, tail))).toEqual(['bearerToken'])
    expect(rulesOf(j('Authorization: Bear', 'er ', PUBLIC_X_WEB_BEARER_PREFIX, '%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA'))).toEqual([])
    expect(rulesOf('Authorization: Bearer <token>')).toEqual([])
  })
})

describe('privacy scan: private network', () => {
  test('tailnet hosts and the CGNAT tailnet range', () => {
    expect(rulesOf(j('ssh box.tail', '1234', '.ts.', 'net'))).toEqual(['tailnetHost'])
    expect(rulesOf(j('http://', '100.', '101.', '2.3:8080'))).toEqual(['tailnetIp'])
    expect(rulesOf(j('100.', '200.1.1 is outside the tailnet range'))).toEqual(['publicIp'])
  })

  test('public IPv4s outside the documentation, private and loopback ranges', () => {
    expect(rulesOf(j('server ', '84.', '17.', '43.', '9'))).toEqual(['publicIp'])
    for (const ip of ['192.0.2.10', '198.51.100.7', '203.0.113.200', '127.0.0.1', '10.0.0.5', '172.20.1.1', '192.168.1.20', '0.0.0.0', '1.2.3.4']) expect(rulesOf(`host ${ip}`)).toEqual([])
    expect(rulesOf('version 1.2.3.4.5 and 999.1.1.1')).toEqual([])
    expect(rulesOf('<path d="M8 0C3.58 0 1.23.82.72 1.21"/>')).toEqual([])
  })

  test('home folders with a real user name', () => {
    expect(rulesOf(j('/ho', 'me/', 'alice', '/.ssh/id_ed25519'))).toEqual(['homePath'])
    expect(rulesOf('/home/<user>/.logCli')).toEqual([])
    expect(rulesOf(j('C:', '\\', 'Users', '\\', '0', '\\.buzz'))).toEqual(['windowsUserPath'])
    expect(rulesOf(j('C:/', 'Users/', 'alice', '/AppData'))).toEqual(['windowsUserPath'])
    expect(rulesOf('C:\\Users\\<name>\\.logCli')).toEqual([])
    expect(rulesOf('%USERPROFILE% is C:\\Users\\%USERNAME%')).toEqual([])
  })
})

describe('privacy scan: PII', () => {
  test('emails except example domains, noreply, GitHub noreply and the allowlist', () => {
    expect(rulesOf(j('mail ', 'alice', '@', 'gmail', '.com'))).toEqual(['email'])
    expect(rulesOf(j('[mail](mailto:', 'alice', '@', 'gmail', '.com)'))).toEqual(['email'])
    expect(rulesOf('mail someone@example.com, a@example.org, noreply@anthropic.com, 123+bot@users.noreply.github.com')).toEqual([])
    expect(rulesOf('logo@2x.png and jev-spec@0.4.1.patch and @types/bun')).toEqual([])
    const allowed = scanText('README.md', j('hello', '@', 'listening', 'kit.com'), { allowlist: { emails: [j('hello', '@', 'listening', 'kit.com')], findings: [] } })
    expect(allowed).toEqual([])
  })

  test('phone numbers in E.164', () => {
    expect(rulesOf(j('call ', '+44', '7700', '912345'))).toEqual(['phone'])
    expect(rulesOf('call +15555550123 or +1234567890')).toEqual([])
  })

  test('the private denylist matches literal terms, case-insensitive', () => {
    const found = scanText('docs/a.md', 'A chat with Zorblax Quentin', { denylist: ['zorblax quentin'] })
    expect(found.map((f) => f.rule)).toEqual(['denylist'])
    expect(scanText('docs/a.md', 'the Zorblaxian label', { denylist: ['zorblax'] })).toEqual([])
    expect(scanText('docs/a.md', '@zorblax_1 wrote', { denylist: ['zorblax_1'] }).map((f) => f.rule)).toEqual(['denylist'])
  })
})

describe('privacy scan: paths, masking and the allowlist', () => {
  test('private folders are refused by path', () => {
    for (const path of ['log/2026-11-13.md', 'ruleHistory/index.md', 'docs/infra/box.md', 'docs/identityLeaks/a.md', 'docs/deviceIsolation/a.md', 'docs/vendors/a.md', 'media/personas/a.png', 'RESEARCH/a.md']) {
      expect(scanPath(path).map((f) => f.rule)).toEqual(['forbiddenPath'])
    }
    expect(scanPath('docs/guides/a.md')).toEqual([])
    expect(scanPath('docs/logbook.md')).toEqual([])
  })

  test('vendor and binary files are skipped', () => {
    expect(isSkippedPath('vendor/twikit/x.py')).toBe(true)
    expect(isSkippedPath('media/a.png')).toBe(true)
    expect(isSkippedPath('src/a.ts')).toBe(false)
    expect(looksBinary(new Uint8Array([65, 0, 66]))).toBe(true)
    expect(looksBinary(new TextEncoder().encode('plain'))).toBe(false)
  })

  test('a hit never prints the whole value', () => {
    const secret = j('xo', 'xb-', tail, tail)
    const [hit] = scanText('docs/a.md', `token ${secret}`)
    const line = formatFinding(hit)
    expect(line).toStartWith('docs/a.md:1 slackToken ')
    expect(line).not.toContain(secret)
    expect(maskValue(secret)).not.toContain(tail)
    expect(hit.fingerprint).toBe(fingerprintOf('slackToken', secret))
  })

  test('the sidecar allowlist exempts one finding by path, rule and fingerprint', () => {
    const email = j('team', '@', 'acme', 'corp.io')
    const [hit] = scanText('docs/a.md', email)
    const entry = { path: 'docs/a.md', rule: 'email', fingerprint: hit.fingerprint, why: 'public contact' }
    expect(scanText('docs/a.md', email, { allowlist: { emails: [], findings: [entry] } })).toEqual([])
    expect(scanText('docs/b.md', email, { allowlist: { emails: [], findings: [entry] } })).toHaveLength(1)
    expect(scanText('docs/sub/b.md', email, { allowlist: { emails: [], findings: [{ path: 'docs/sub/', rule: 'email', why: 'folder' }] } })).toEqual([])
  })

  test('the denylist file is read from outside the repo and a missing file is skipped', () => {
    const dir = mkdtempSync(join(tmpdir(), 'privacyTest-'))
    const path = join(dir, 'denylist.txt')
    writeFileSync(path, '# names\nZorblax\n\n  Quentin  \n')
    expect(loadDenylist({ LOG_PRIVACY_DENYLIST: path })).toEqual(['Zorblax', 'Quentin'])
    expect(loadDenylist({ LOG_PRIVACY_DENYLIST: join(dir, 'missing.txt') })).toEqual([])
    expect(parseDenylist('a\r\n#b\r\nc')).toEqual(['a', 'c'])
    rmSync(dir, { recursive: true, force: true })
  })
})
