import { describe, expect, test } from 'bun:test'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DEFAULT_TRAFFIC_BUDGET_MB, readTrafficLedger, recordTraffic, trafficBudget } from './index'

describe('proxy traffic: a budget per account per 24 hours', () => {
  const now = new Date('2026-10-20T12:00:00Z')
  const entries = [
    { at: '2026-10-20T08:00:00Z', account: 'bethlehem', run: 'r1', mb: 222.5 },
    { at: '2026-10-19T11:00:00Z', account: 'bethlehem', run: 'r0', mb: 900 },
    { at: '2026-10-20T09:00:00Z', account: 'erie', run: 'r2', mb: 50 }
  ]
  test("only the account's last 24 hours count against its budget", () => {
    expect(trafficBudget(entries, 'bethlehem', now)).toEqual({ budgetMb: DEFAULT_TRAFFIC_BUDGET_MB, usedMb: 222.5, leftMb: 801.5 })
    expect(trafficBudget(entries, 'bethlehem', now, 200).leftMb).toBe(0)
  })

  test('the ledger keeps each run, one line each', () => {
    const path = join(mkdtempSync(join(tmpdir(), 'traffic-')), 'proxyTraffic.jsonl')
    recordTraffic(entries[0], path)
    recordTraffic(entries[2], path)
    expect(readTrafficLedger(path)).toEqual([entries[0], entries[2]])
  })
})
