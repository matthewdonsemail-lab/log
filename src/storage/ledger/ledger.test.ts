import { describe, expect, test } from 'bun:test'
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { openDatabase } from '../schema'
import { appendLedger, fromOldLine, importOldLedgers, ledgerRows } from './index'

describe('ledger', () => {
  test('rows are kept in log.db by kind and read back in order, filtered by account', () => {
    const path = join(mkdtempSync(join(tmpdir(), 'logLedger')), 'log.db')
    appendLedger({ kind: 'proxyTraffic', at: '2026-11-08T00:00:00Z', account: 'a', amount: 4.5, unit: 'MB', outcome: 'used', detail: 'run1' }, path)
    appendLedger({ kind: 'proxyTraffic', at: '2026-11-08T00:01:00Z', account: 'b', amount: 1, unit: 'MB', outcome: 'used' }, path)
    appendLedger({ kind: 'launchReset', at: '2026-11-08T00:02:00Z', account: 'a', outcome: 'reset' }, path)
    expect(ledgerRows('proxyTraffic', {}, path).map((r) => r.account)).toEqual(['a', 'b'])
    expect(ledgerRows('proxyTraffic', { account: 'a' }, path).map((r) => r.amount)).toEqual([4.5])
    expect(ledgerRows('proxyTraffic', { limit: 1 }, path).map((r) => r.account)).toEqual(['b'])
  })

  test('the old .jsonl files are imported once, each line in its typed columns, and left in place', () => {
    const home = mkdtempSync(join(tmpdir(), 'logLedgerHome'))
    mkdirSync(join(home, '.logCli', 'captcha'), { recursive: true })
    writeFileSync(join(home, '.logCli', 'proxyTraffic.jsonl'), `${JSON.stringify({ at: '2026-10-20T00:00:00Z', account: 'a', run: 'r', mb: 12 })}\nnot json\n`)
    writeFileSync(join(home, '.logCli', 'captcha', 'attempts.jsonl'), `${JSON.stringify({ at: '2026-10-21T00:00:00Z', accountId: 'a', kind: 'text', solver: 'twoCaptcha', solved: true, accepted: false, code: 'captchaRejected' })}\n`)
    const path = join(home, 'log.db')
    const handle = openDatabase(path)
    const first = importOldLedgers(handle, {}, home)
    expect(first.find((r) => r.store === 'proxyTraffic')?.rows).toBe(1)
    expect(importOldLedgers(handle, {}, home)).toEqual([])
    expect(ledgerRows('captchaAttempt', {}, path)[0]).toMatchObject({ provider: 'twoCaptcha', subject: 'text', outcome: 'solved', amount: 0, code: 'captchaRejected' })
  })

  test('each old store maps to its kind', () => {
    expect(fromOldLine('billingAnswers', { provider: 'subq', at: 'x', status: 402, ok: false, outOfCredit: true, said: 'pay' })).toMatchObject({ kind: 'providerAnswer', outcome: 'outOfCredit', amount: 402 })
    expect(fromOldLine('launchResets', { account: 'a', at: 'x', reason: 'dev' })).toMatchObject({ kind: 'launchReset', detail: 'dev' })
    expect(fromOldLine('proxyTraffic', { account: 'a' })).toBeNull()
  })
})
