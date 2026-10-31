import { describe, expect, test } from 'bun:test'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { hostOnPlatforms, platformOfAccount, siteOfAccount } from '../../cli/runner/helpers/platforms'
import { checkRunnable } from '../../marketplace/socialAccount/index'
import type { FacebookAccount } from '../../marketplace/socialAccount/index'
import { nameOf } from '../../subq/stepReading/helpers/exchangesOf'
import { parseInspectAction } from '../inspect/index'

const account = (over: Partial<FacebookAccount>): FacebookAccount => ({ id: 'a1', accountName: 'one', label: 'one', platform: 'FACEBOOK', proxy: null, cookies: null, homeCity: null, homeCountry: null, status: 'active', ...over }) as FacebookAccount

describe('runs by platform', () => {
  test('a Facebook account still needs its proxy (rule 12)', () => {
    expect(checkRunnable(account({}), 'connect')).toMatchObject({ ok: false, code: 'noProxy' })
  })

  test('an X account has no browser path; an unknown platform is refused', () => {
    expect(checkRunnable(account({ platform: 'TWITTER' }), 'connect')).toMatchObject({ ok: false, code: 'accountNotFacebook' })
    expect(checkRunnable(account({ platform: 'YOUTUBE' }), 'connect')).toMatchObject({ ok: false, code: 'accountNotFacebook' })
  })

  test("an account's platform and site come from its Twenty value", () => {
    expect(platformOfAccount({ platform: 'TWITTER' })).toBe('twitter')
    expect(siteOfAccount({ platform: 'FACEBOOK' }).proxy).toBe('required')
    expect(platformOfAccount({ platform: null })).toBe('facebook')
  })

  test('inspect goes only to the hosts of a platform log-cli knows', () => {
    expect(hostOnPlatforms('https://www.facebook.com/marketplace/')).toBe(true)
    expect(hostOnPlatforms('https://x.com/home')).toBe(true)
    expect(hostOnPlatforms('https://evil.example/facebook.com')).toBe(false)
    expect(hostOnPlatforms('http://www.facebook.com/')).toBe(false)
    expect(parseInspectAction(['goto', 'https://evil.example/x.com'])).toMatchObject({ ok: false })
  })

  test("a call is named by Facebook's friendly name, else a GraphQL operation in its JSON body, else its path", () => {
    const entry = (body: string, url = 'https://gql.example.com/') => ({ startedDateTime: '', time: 0, request: { method: 'POST', url, headers: [], postData: { text: body } }, response: { status: 200, content: {} } })
    expect(nameOf(entry('{"operation":"HomeFeedSdui","variables":{}}'))).toBe('HomeFeedSdui')
    expect(nameOf(entry('{"operationName":"SubredditInfo"}'))).toBe('SubredditInfo')
    expect(nameOf(entry('a=1', 'https://www.example.com/svc/shreddit/feeds'))).toBe('svcShredditFeeds')
  })

  test('the Python gate refuses a direct run for a Facebook account', () => {
    const dir = mkdtempSync(join(tmpdir(), 'directGate'))
    const path = join(dir, 'proxy.json')
    writeFileSync(path, JSON.stringify({ direct: true, platform: 'facebook', country: '' }))
    const script = `import sys; sys.path.insert(0, 'python'); from browser import proxyGate\ntry:\n    proxyGate.load_proxy(sys.argv[1]); print('opened')\nexcept proxyGate.GateError as e:\n    print(e.code)`
    const run = spawnSync(process.env.LOG_PYTHON || 'python', ['-c', script, path], { encoding: 'utf8' })
    if (run.error) return
    expect(run.stdout.trim().split('\n').pop()).toBe('noProxy')
  })

  test('the self-check takes two names of one timezone as the same zone, and two zones apart as different', () => {
    const script = `import sys; sys.path.insert(0, 'python'); from browser import proxyGate\nprint(proxyGate.same_zone('Asia/Saigon', 'Asia/Ho_Chi_Minh'), proxyGate.same_zone('America/New_York', 'America/Chicago'), proxyGate.same_zone('Europe/Dublin', None))`
    const run = spawnSync(process.env.LOG_PYTHON || 'python', ['-c', script], { encoding: 'utf8' })
    if (run.error) return
    expect(run.stdout.trim().split('\n').pop()).toBe('True False False')
  })
})
