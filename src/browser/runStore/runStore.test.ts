import { describe, expect, test } from 'bun:test'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, utimesSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { countDomains, domainsInHar, listRuns, pruneRuns, storageVerdict } from './index'

const NOW = Date.parse('2026-10-22T12:00:00Z')
const BUILT = Date.parse('2026-10-22T09:45:00Z')

function run(root: string, action: string, name: string, files: Record<string, string>, at = Date.parse('2026-10-20T10:00:00Z')): string {
  const dir = join(root, 'runs', action, name)
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(join(dir, file, '..'), { recursive: true })
    writeFileSync(join(dir, file), text)
    utimesSync(join(dir, file), at / 1000, at / 1000)
  }
  return dir
}

const HAR = 'fb_api_req_friendly_name=GroupsCometFeedRegularStoriesPaginationQuery&x fb_api_req_friendly_name=MarketplaceCometBrowseFeedLightPaginationQuery'

describe('runStore', () => {
  test('a run rea settled and the docs hold may go; one not settled, not documented or still written is kept', () => {
    const root = mkdtempSync(join(tmpdir(), 'logRuns'))
    run(root, 'inspect', '20261020T100000_a', { 'adsPower/session.har': HAR, 'adsPower/settle.json': '{}', 'adsPower/findings.md': '# f' })
    run(root, 'inspect', '20261020T110000_b', { 'adsPower/session.har': HAR })
    run(root, 'warmup', '20261022T100000_c', { 'adsPower/session.har': HAR, 'adsPower/settle.json': '{}' }, Date.parse('2026-10-22T10:00:00Z'))
    run(root, 'inspect', '20261022T115500_d', { 'steps.jsonl': '' }, NOW - 60_000)
    run(root, 'unsaved', '20261020T100000_e', { 'session.json': '{}' })
    const runs = listRuns({ root, builtAt: BUILT, now: NOW, open: [] })
    expect(runs.map((r) => [r.run, r.keep === null])).toEqual([
      ['20261020T100000_a', true],
      ['20261020T110000_b', false],
      ['20261022T100000_c', false],
      ['20261022T115500_d', false]
    ])
    expect(runs[1].keep).toContain('not settled')
    expect(runs[2].keep).toContain('request docs')
    expect(runs[3].keep).toBe('still being written')
  })

  test('pruning keeps findings, steps and domains, and deletes the rest; a dry run deletes nothing', async () => {
    const root = mkdtempSync(join(tmpdir(), 'logRuns'))
    const dir = run(root, 'inspect', '20261020T100000_a', { 'steps.jsonl': '{"step":1}\n', 'adsPower/session.har': HAR, 'adsPower/settle.json': '{}', 'adsPower/findings.md': '# f', 'adsPower/scripts/big.js': 'x'.repeat(1000) })
    const entries = listRuns({ root, builtAt: BUILT, now: NOW, open: [] })
    await pruneRuns(entries, { apply: false, root })
    expect(existsSync(dir)).toBe(true)
    const [pruned] = await pruneRuns(entries, { apply: true, root })
    expect(existsSync(dir)).toBe(false)
    expect(pruned.domains).toEqual({ groups: 1, background: 1 })
    expect(readFileSync(join(pruned.kept, 'findings.md'), 'utf8')).toBe('# f')
    expect(existsSync(join(pruned.kept, 'steps.jsonl'))).toBe(true)
    expect(readFileSync(join(root, 'runs', 'pruned.jsonl'), 'utf8')).toContain('20261020T100000_a')
  })

  test('--before keeps the runs from that day on', async () => {
    const root = mkdtempSync(join(tmpdir(), 'logRuns'))
    run(root, 'inspect', '20261020T100000_a', { 'steps.jsonl': '' })
    run(root, 'inspect', '20261021T100000_b', { 'steps.jsonl': '' })
    const pruned = await pruneRuns(listRuns({ root, builtAt: BUILT, now: NOW, open: [] }), { apply: false, root, before: '2026-10-21' })
    expect(pruned.map((p) => p.run)).toEqual(['20261020T100000_a'])
  })

  test('domains are counted once each, across chunk ends too', async () => {
    const counts: Record<string, number> = {}
    countDomains(HAR, counts)
    expect(counts).toEqual({ groups: 1, background: 1 })
    const root = mkdtempSync(join(tmpdir(), 'logRuns'))
    const big = join(root, 'session.har')
    writeFileSync(big, `${'y'.repeat((4 << 20) - 30)}${HAR}`)
    expect(await domainsInHar(big)).toEqual({ groups: 1, background: 1 })
  })

  test('the storage hook speaks over 2 GB of runs or under 5 GB free, and is silent otherwise', () => {
    expect(storageVerdict(1e9, 50e9)).toBeNull()
    expect(storageVerdict(9.7e9, 50e9)).toContain('9.7 GB')
    expect(storageVerdict(1e9, 2e9)).toContain('2.0 GB free')
    expect(storageVerdict(1e9, null)).toBeNull()
  })
})
