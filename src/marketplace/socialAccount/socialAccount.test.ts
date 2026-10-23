import { describe, expect, test } from 'bun:test'
import { existsSync, readFileSync } from 'node:fs'
import { prepareRun } from '../../browser/run/index'
import { marketplaceFixture } from '../../twenty/graphql/index'
import {
  checkRunnable,
  findAccount,
  fromTwentyEnum,
  listFacebookAccounts,
  maskProxyUrl,
  maskProxyUsername,
  parseProxyUrl,
  setAccountStatus,
  statusForIssue,
  toFacebookCookies,
  toTwentyEnum
} from './index'

describe('parseProxyUrl', () => {
  test('reads the socialAccounts.proxy URL and the vendor colon format', () => {
    expect(parseProxyUrl('http://user:p%40ss@1.2.3.4:8080')).toEqual({ server: 'http://1.2.3.4:8080', username: 'user', password: 'p@ss' })
    expect(parseProxyUrl('socks5://gw.example.com:1080')).toEqual({ server: 'socks5://gw.example.com:1080' })
    expect(parseProxyUrl('1.2.3.4:8080:user:pass')).toEqual({ server: 'http://1.2.3.4:8080', username: 'user', password: 'pass' })
    expect(parseProxyUrl('1.2.3.4:8080')).toEqual({ server: 'http://1.2.3.4:8080' })
    for (const bad of ['', 'ftp://1.2.3.4:21', 'http://1.2.3.4', 'not a proxy']) expect(parseProxyUrl(bad)).toBeNull()
  })

  test('maskProxyUrl never shows the password', () => {
    expect(maskProxyUrl('http://user:secretPass@1.2.3.4:8080')).toBe('http://1.2.3.4:8080 as ***')
    expect(maskProxyUrl(null)).toBe('')
  })

  test("maskProxyUrl hides the username's account part too: 2Captcha's password is that prefix", () => {
    const url = 'http://u7e9secret-zone-custom-region-ie-st-connacht-city-galway-session-Ab3d-sessTime-120:u7e9secret@eu.proxy.2captcha.com:2334'
    const shown = maskProxyUrl(url)
    expect(shown).toBe('http://eu.proxy.2captcha.com:2334 as ***-zone-custom-region-ie-st-connacht-city-galway-session-Ab3d-sessTime-120')
    expect(shown).not.toContain('u7e9')
    expect(maskProxyUsername('nodashes')).toBe('***')
  })
})

describe('checkRunnable: every run asks this first (rule 12)', () => {
  test('refuses everything that may not open a browser, with its catalog code', async () => {
    const twenty = marketplaceFixture()
    const code = async (name: string, purpose: 'run' | 'connect' | 'check' = 'run') => {
      const result = checkRunnable(await findAccount(twenty, name), purpose)
      return result.ok ? 'ok' : result.code
    }
    expect(await code('galwayOne')).toBe('ok')
    expect(await code('noProxy')).toBe('noProxy')
    expect(await code('noProxy', 'connect')).toBe('noProxy')
    expect(await code('noProxy', 'check')).toBe('noProxy')
    expect(await code('noCountry')).toBe('noHomeCountry')
    expect(await code('banned')).toBe('accountNotUsable')
    expect(await code('unset')).toBe('accountNotUsable')
    expect(await code('twitterOne')).toBe('accountNotFacebook')
    expect(await code('needsLogin')).toBe('accountNotUsable')
    expect(await code('needsLogin', 'connect')).toBe('ok')
    expect(await code('banned', 'check')).toBe('ok')
  })
})

describe('prepareRun', () => {
  test('writes the proxy and session to a private folder, and cleanup removes it', async () => {
    const prepared = prepareRun(await findAccount(marketplaceFixture(), 'galwayOne'), 'run')
    if (!prepared.ok) throw new Error(prepared.code)
    expect(JSON.parse(readFileSync(prepared.run.proxyPath, 'utf8'))).toEqual({
      server: 'http://203.0.113.7:8080',
      username: 'user',
      password: 'secretPass',
      country: 'IE'
    })
    expect(prepared.run.hasSession).toBe(true)
    prepared.run.cleanup()
    expect(existsSync(prepared.run.dir)).toBe(false)
  })

  test('a run needs a saved session; signing in does not', async () => {
    const twenty = marketplaceFixture()
    expect(prepareRun(await findAccount(twenty, 'noCookies'), 'run')).toMatchObject({ ok: false, code: 'neverConnected' })
    const connect = prepareRun(await findAccount(twenty, 'needsLogin'), 'connect')
    expect(connect.ok).toBe(true)
    if (connect.ok) {
      expect(connect.run.hasSession).toBe(false)
      connect.run.cleanup()
    }
  })

  test('nothing is written when the account may not run', async () => {
    expect(prepareRun(await findAccount(marketplaceFixture(), 'noProxy'), 'run')).toMatchObject({ ok: false, code: 'noProxy' })
  })
})

describe('socialAccounts in Twenty', () => {
  test('only FACEBOOK accounts are listed; lookups by name or id', async () => {
    const twenty = marketplaceFixture()
    const names = (await listFacebookAccounts(twenty)).map((a) => a.accountName)
    expect(names).toContain('galwayOne')
    expect(names).not.toContain('twitterOne')
    expect((await findAccount(twenty, '@galwayOne')).id).toBe('galwayOne')
    await expect(findAccount(twenty, 'nobody')).rejects.toMatchObject({ code: 'accountNotFound' })
  })
})

describe('helpers', () => {
  test('cookies in any stored shape become Playwright cookies on .facebook.com', () => {
    expect(toFacebookCookies({ c_user: '1', xs: '2' })).toEqual([
      { name: 'c_user', value: '1', domain: '.facebook.com', path: '/' },
      { name: 'xs', value: '2', domain: '.facebook.com', path: '/' }
    ])
    expect(toFacebookCookies('c_user=1; xs=a=b')).toEqual([
      { name: 'c_user', value: '1', domain: '.facebook.com', path: '/' },
      { name: 'xs', value: 'a=b', domain: '.facebook.com', path: '/' }
    ])
    expect(toFacebookCookies([{ name: 'xs', value: '2', domain: '.facebook.com', expirationDate: 99, sameSite: 'no_restriction' }])).toEqual([
      { name: 'xs', value: '2', domain: '.facebook.com', path: '/', expires: 99, sameSite: 'None' }
    ])
    expect(toFacebookCookies(null)).toEqual([])
  })

  test('each account issue has one status; proxy problems change none', () => {
    expect(statusForIssue('accountDisabled')).toBe('banned')
    expect(statusForIssue('suspended')).toBe('restricted')
    expect(statusForIssue('checkpointed')).toBe('checkpoint')
    expect(statusForIssue('sessionExpired')).toBe('needsLogin')
    expect(statusForIssue('rateLimited')).toBe('limited')
    expect(statusForIssue('noProxy')).toBeNull()
    expect(statusForIssue('proxyCountryMismatch')).toBeNull()
  })

  test('Twenty SELECT values convert both ways', () => {
    expect(toTwentyEnum('needsLogin')).toBe('NEEDS_LOGIN')
    expect(toTwentyEnum('accountLost')).toBe('ACCOUNT_LOST')
    expect(fromTwentyEnum('UNDER_REVIEW')).toBe('underReview')
    expect(fromTwentyEnum('DELETED_BY_FB')).toBe('deletedByFb')
  })
})

describe('DEACTIVATED: an account that is never used again', () => {
  test('takes the proxy off, keeps the row, and may neither run nor sign in', async () => {
    const twenty = marketplaceFixture()
    await setAccountStatus(twenty, 'galwayThree', 'deactivated', 'setByHand')
    const row = twenty.rows.socialAccounts.find((r) => r.id === 'galwayThree')!
    expect(row).toMatchObject({ accountStatus: 'DEACTIVATED', proxy: null, statusReason: 'setByHand' })
    const account = await findAccount(twenty, 'galwayThree')
    expect(checkRunnable(account, 'run')).toMatchObject({ ok: false })
    expect(checkRunnable(account, 'connect')).toMatchObject({ ok: false })
  })

  test('any other status leaves the proxy where it is', async () => {
    const twenty = marketplaceFixture()
    await setAccountStatus(twenty, 'galwayThree', 'checkpoint', 'checkpointed')
    expect(twenty.rows.socialAccounts.find((r) => r.id === 'galwayThree')!.proxy).toBeTruthy()
  })
})
