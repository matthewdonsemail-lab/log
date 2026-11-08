import { describe, expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ledgerRows } from '../../storage/ledger/index'
import { fromOldLine } from '../../storage/ledger/helpers/index'
import { countOf, governorAccounts, governorCounts, governorPath, resetGovernor } from './index'
import { governorCommand } from '../../cli/governor/index'

function seed(platform: string, account: string, state: Record<string, unknown>): string {
  const path = governorPath(platform, account)
  mkdirSync(join(path, '..'), { recursive: true })
  writeFileSync(path, JSON.stringify(state))
  return path
}

const spent = { day: '2026-11-08', hour_bucket: '2026-11-08-16', hour_count: 21, day_count: 500, mutation_count: 3, last_request_ts: 1, last_mutation_ts: 0, cooldown_until: 0, soft_blocks_seen: 0 }

describe('governor reset', () => {
  test('puts the counts back to 0, keeps the rest, and records it in the ledger', () => {
    const db = join(mkdtempSync(join(tmpdir(), 'governorDb')), 'log.db')
    const path = seed('twitter', 'resetOne', spent)
    const result = resetGovernor({ platform: 'twitter', account: 'resetOne', by: 'matt', reason: 'reset X to 0' }, new Date('2026-11-08T14:00:00Z'), db)
    expect(result.before.requests).toBe(500)
    expect(result.after).toMatchObject({ requests: 0, writes: 0, hourRequests: 0 })
    const stored = JSON.parse(readFileSync(path, 'utf8'))
    expect(stored).toMatchObject({ day: '2026-11-08', day_count: 0, hour_count: 0, mutation_count: 0, last_request_ts: 1 })
    const rows = ledgerRows('governorReset', { account: 'resetOne' }, db)
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ platform: 'twitter', subject: 'matt', amount: 500, outcome: 'reset', seq: result.ledgerSeq })
  })

  test('keeps a cooldown after a block', () => {
    const db = join(mkdtempSync(join(tmpdir(), 'governorDb')), 'log.db')
    const now = new Date('2026-11-08T14:00:00Z')
    seed('discord', 'cooling', { ...spent, cooldown_until: now.getTime() / 1000 + 600 })
    const result = resetGovernor({ platform: 'discord', account: 'cooling', by: 'matt' }, now, db)
    expect(result.cooldownKept).toBe(true)
    expect(countOf('discord', 'cooling', now)?.cooldownSeconds).toBe(600)
  })

  test('refuses an account with no count', () => {
    expect(() => resetGovernor({ platform: 'slack', account: 'nobody', by: 'matt' })).toThrow('no governor count')
  })

  test('lists every account with a count', () => {
    seed('reddit', 'listedOne', spent)
    expect(governorAccounts('reddit')).toContain('listedOne')
    expect(governorCounts(['reddit']).find((c) => c.account === 'listedOne')?.requests).toBe(500)
  })

  test('the command refuses without --by', async () => {
    const out = await governorCommand.run({ err: () => {} } as never, ['reset', '--platform', 'twitter', '--account', 'resetOne'])
    expect(out.code).toBe(1)
  })

  test('the old hand resets import as governorReset rows', () => {
    expect(fromOldLine('governorResets', { at: '2026-11-03T08:39:32Z', account: 'twitter matthewsoldit', dayCountBefore: 486, by: 'matt', reason: 'reset' })).toMatchObject({ kind: 'governorReset', platform: 'twitter', account: 'matthewsoldit', amount: 486, subject: 'matt' })
  })
})
