import { describe, expect, test } from 'bun:test'
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { writeOperationDocs } from './client'
import { factsFromDoc, foldOperation, renderStoredSightings } from './helpers/index'
import type { ClientOperation, OperationSighting } from './types'

const sight = (run: string, step: string, ms: number): OperationSighting => ({ run, action: 'warmup', step, status: 200, ms, afterStepMs: ms * 2, errors: [] })
const op = (sightings: OperationSighting[], reads: string[] = ['viewer.x']): ClientOperation => ({ name: 'FBYRPTimeLimitsEnforcementQuery', domain: 'background', kind: 'query', docId: '1', path: '/api/graphql/', sends: [], reads, calledFrom: reads.length ? ['FBYRP.react'] : [], sightings, reaEvidenceId: reads.length ? 'ev_ab' : null })

describe('the request docs keep what pruned runs showed (rule 66)', () => {
  test('a run is counted once, however many builds read it', () => {
    const once = foldOperation(null, op([sight('r1', 'step 1: goto /', 400)]))
    const twice = foldOperation(once, op([sight('r1', 'step 1: goto /', 400), sight('r2', 'step 1: goto /', 500)]))
    expect(twice.seen).toBe(2)
    expect(twice.rows).toEqual([{ action: 'warmup', step: 'step 1: goto /', times: 2, statuses: [200], ms: [400, 500], afterStepMs: [800, 1000], errors: [] }])
  })

  test("a build that couldn't read the bundle keeps the fields an earlier one did", () => {
    const known = foldOperation(null, op([sight('r1', 'step 1: goto /', 400)]))
    const later = foldOperation(known, op([sight('r2', 'step 3: goto /messages/', 300)], []))
    expect(later.reads).toEqual(['viewer.x'])
    expect(later.reaEvidenceId).toBe('ev_ab')
    const mutation = foldOperation({ ...known, kind: 'mutation' }, { ...op([sight('r3', 'step 1: goto /', 300)], []), kind: 'query' })
    expect(mutation.kind).toBe('mutation')
  })

  test('a committed doc is read back as the start, and a rebuild after its runs are pruned only adds', () => {
    const dir = mkdtempSync(join(tmpdir(), 'logFacts'))
    const store = join(dir, 'store.json')
    writeOperationDocs([op([sight('r1', 'step 1: goto /', 400), sight('r2', 'step 4: goto /marketplace/', 350)])], dir, 2, join(dir, 'first.json'))
    const doc = readFileSync(join(dir, 'background', 'FBYRPTimeLimitsEnforcementQuery.md'), 'utf8')
    expect(factsFromDoc(doc)).toMatchObject({ seen: 2, legacyRuns: 2, reads: ['viewer.x'], reaEvidenceId: 'ev_ab' })
    // r1 and r2 are pruned; a new run sees it again, and the build has no store yet.
    writeOperationDocs([op([sight('r3', 'step 25: goto /messages/', 380)], [])], dir, 1, store)
    const after = readFileSync(join(dir, 'background', 'FBYRPTimeLimitsEnforcementQuery.md'), 'utf8')
    expect(after).toContain('Seen 3 time(s) in 3 run(s).')
    expect(after).toContain('step 4: goto /marketplace/')
    expect(after).toContain('step 25: goto /messages/')
    expect(after).toContain('`viewer.x`')
    expect(after).toContain('`ev_ab`')
    // The same build again counts nothing twice.
    writeOperationDocs([op([sight('r3', 'step 25: goto /messages/', 380)], [])], dir, 1, store)
    expect(readFileSync(join(dir, 'background', 'FBYRPTimeLimitsEnforcementQuery.md'), 'utf8')).toContain('Seen 3 time(s) in 3 run(s).')
  })

  test('the table renders as the docs always did', () => {
    const facts = foldOperation(null, op([sight('r1', 'step 1: goto /', 436), sight('r1', 'step 1: goto /', 533)]))
    expect(renderStoredSightings(facts)).toContain('| warmup | step 1: goto / | 2 | 200 | 436–533 ms | 872–1066 ms | — |')
  })
})
