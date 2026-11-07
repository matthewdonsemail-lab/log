import { describe, expect, test } from 'bun:test'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { balanceLines } from '../../cli/balance/index.ts'
import { balanceOf, checkBalances, isOutOfCredit, lastAnswers, needsMoney, noteProviderAnswer } from './index'
import type { BalanceDeps, Provider, ProviderAnswer } from './index'

function deps(over: Partial<BalanceDeps> = {}, answers = new Map<Provider, ProviderAnswer>()): BalanceDeps {
  const fetcher = (async (url: string) => {
    if (String(url).includes('jina')) return new Response(JSON.stringify({ wallet: { total_balance: 9_146_794 } }), { status: 200 })
    if (String(url).includes('fish')) return new Response(JSON.stringify({ credit: '0' }), { status: 200 })
    return new Response('{}', { status: 404 })
  }) as unknown as typeof fetch
  return { key: () => 'k', fetcher, answers: () => answers, treg: () => '  Balance  $165.97   (165965536 micro-USD)', twoCaptcha: async () => 12.5, byteful: async () => ({ mbLeft: 40, creditUsd: 0 }), ...over }
}

describe('provider balances (rule 164)', () => {
  test('a 402 or credit words are out of credit, other failures are not', () => {
    expect(isOutOfCredit(402, '')).toBe(true)
    expect(isOutOfCredit(400, 'Insufficient credit balance')).toBe(true)
    expect(isOutOfCredit(403, 'model creation limit 0/0')).toBe(true)
    expect(isOutOfCredit(500, 'internal error')).toBe(false)
  })

  test('every answer is kept and the latest per provider is read back', () => {
    const file = join(mkdtempSync(join(tmpdir(), 'billing')), 'answers.jsonl')
    noteProviderAnswer('subq', 402, 'Insufficient credit balance', file, new Date('2026-11-07T10:00:00Z'))
    noteProviderAnswer('subq', 200, '', file, new Date('2026-11-07T12:00:00Z'))
    noteProviderAnswer('inworld', 402, 'payment required', file)
    const last = lastAnswers(file)
    expect(last.get('subq')?.ok).toBe(true)
    expect(last.get('inworld')?.outOfCredit).toBe(true)
  })

  test('balance APIs are read, and an empty or low one needs money', async () => {
    const all = await checkBalances(undefined, deps())
    const by = Object.fromEntries(all.map((b) => [b.provider, b]))
    expect(by.jina.state).toBe('ok')
    expect(by.jina.amount).toContain('tokens')
    expect(by.fishAudio.state).toBe('empty')
    expect(by.treg.amount).toBe('$165.97')
    expect(by.byteful.state).toBe('low')
    expect(by.subq.how).toBe('lastCall')
    expect(needsMoney(all).map((b) => b.provider).sort()).toEqual(['byteful', 'fishAudio'])
  })

  test('a provider with no balance API shows its last answer, and out of credit wins', async () => {
    const answers = new Map<Provider, ProviderAnswer>([['inworld', { provider: 'inworld', at: '2026-11-07T12:00:00.000Z', status: 402, ok: false, outOfCredit: true, said: 'payment required' }]])
    const inworld = await balanceOf('inworld', deps({}, answers), answers)
    expect(inworld.state).toBe('outOfCredit')
    expect(balanceLines([inworld])[0]).toContain('>>> NEEDS MONEY: Inworld')
  })

  test('no key is not set up, and nothing is called for it', async () => {
    const none = await balanceOf('jina', deps({ key: () => null }))
    expect(none.state).toBe('notSetUp')
  })
})
