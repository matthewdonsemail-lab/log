import { describe, expect, test } from 'bun:test'
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { writeOperationDocs } from './client'
import { factsFromDoc, fitSample, foldOperation, renderStoredSightings } from './helpers/index'
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
    writeOperationDocs([op([sight('r3', 'step 25: goto /messages/', 380)], [])], dir, 1, store)
    const after = readFileSync(join(dir, 'background', 'FBYRPTimeLimitsEnforcementQuery.md'), 'utf8')
    expect(after).toContain('Seen 3 time(s) in 3 run(s).')
    expect(after).toContain('step 4: goto /marketplace/')
    expect(after).toContain('step 25: goto /messages/')
    expect(after).toContain('`viewer.x`')
    expect(after).toContain('`ev_ab`')
    writeOperationDocs([op([sight('r3', 'step 25: goto /messages/', 380)], [])], dir, 1, store)
    expect(readFileSync(join(dir, 'background', 'FBYRPTimeLimitsEnforcementQuery.md'), 'utf8')).toContain('Seen 3 time(s) in 3 run(s).')
  })

  test('the table renders as the docs always did', () => {
    const facts = foldOperation(null, op([sight('r1', 'step 1: goto /', 436), sight('r1', 'step 1: goto /', 533)]))
    expect(renderStoredSightings(facts)).toContain('| warmup | step 1: goto / | 2 | 200 | 436–533 ms | 872–1066 ms | — |')
  })
})

describe('the request docs show what each request really sent and got back (rule 73)', () => {
  const answered = (run: string, step: string, count: number): OperationSighting => ({ ...sight(run, step, 1024), sent: { variables: { input: { feedback_reaction_id: '1635855486666999' } } }, answer: { data: { feedback_react: { feedback: { reaction_count: { count } }, picture: 'https://scontent-phl2-1.xx.fbcdn.net/v/t39/a.jpg?oh=00_secret&oe=6A' } } } })

  test('the newest answer per step is kept in the store, past the run, and rendered in the doc with signed link tokens taken out', () => {
    const first = foldOperation(null, op([answered('runs/inspect/20261020T050610_a', 'step 6: likePost Like', 1)]))
    const later = foldOperation(first, op([answered('runs/inspect/20261023T051540_a', 'step 5: likePost Like', 2), answered('runs/inspect/20261023T051540_a', 'step 3: likePost Like', 8181)]))
    expect(later.samples?.map((s) => [s.run, s.step])).toEqual([
      ['runs/inspect/20261023T051540_a', 'step 5: likePost Like'],
      ['runs/inspect/20261023T051540_a', 'step 3: likePost Like'],
      ['runs/inspect/20261020T050610_a', 'step 6: likePost Like']
    ])
    const kept = foldOperation(later, op([]))
    expect(kept.samples).toEqual(later.samples)
    const doc = renderStoredSightings(kept)
    expect(doc).toContain('### What it sent and what came back (the newest 3 from our runs)')
    expect(doc).toContain('"feedback_reaction_id": "1635855486666999"')
    expect(doc).toContain('"count": 8181')
    expect(doc).toContain('"picture": "https://scontent-phl2-1.xx.fbcdn.net/v/t39/a.jpg"')
    expect(doc).not.toContain('oh=00_secret')
  })

  test('an answer too big for the doc is cut by depth, never dropped', () => {
    const big = { data: { list: Array.from({ length: 400 }, (_, i) => ({ id: i, name: `item ${i}`, deep: { a: { b: i } } })) } }
    const facts = foldOperation(null, op([{ ...sight('r1', 'step 1: goto /', 10), sent: null, answer: big }]))
    const answer = JSON.stringify(facts.samples?.[0]?.answer)
    expect(answer.length).toBeLessThanOrEqual(6_000)
    expect(answer).toContain('"data"')
  })
})

describe('signed image links lose their signature before a sample is kept', () => {
  test('a whole link, a shortened one with its length note, and one inside other text all lose their query', () => {
    const whole = 'https://scontent.fagc1-1.fna.fbcdn.net/v/t39.30808-6/863613843_n.jpg?stp=dst-jpg_tt6&_nc_ohc=e512qd9g3PkQ7kNvwEZwDsC&oh=00_AQMRkvSbcrKDCoKcd&oe=6A1B2C3D'
    const shortened = 'https://scontent.fagc1-1.fna.fbcdn.net/v/t39.30808-6/863613843_n.jpg?stp=dst-jpg_tt6&_nc_ohc=e512qd9g3PkQ&oh=00_AQMRkvSbcr… (441 chars)'
    const kept = JSON.stringify(fitSample({ payload: { imageURI: shortened, uri: whole, note: `see ${whole} here`, profileID: '61593843527201' } }))
    expect(kept).not.toMatch(/_nc_ohc=|oh=00_|oe=/)
    expect(kept).toContain('"imageURI":"https://scontent.fagc1-1.fna.fbcdn.net/v/t39.30808-6/863613843_n.jpg (441 chars)"')
    expect(kept).toContain('"note":"see https://scontent.fagc1-1.fna.fbcdn.net/v/t39.30808-6/863613843_n.jpg here"')
    expect(kept).toContain('"profileID":"61593843527201"')
  })

  test("Facebook's one-time action tokens are taken out by their key, the rest of what was sent stays", () => {
    const kept = JSON.stringify(fitSample({ fb_api_req_friendly_name: 'useAccountStatusClearEnrollmentEntryPointActionMutation', fb_dtsg: 'NAft…', variables: { serialized_state: 'QVRRalpq…', ixt_clear_token: 'ATQHh9jA…', entityID: '61590766182623', count: null } }))
    expect(kept).not.toMatch(/QVRRalpq|ATQHh9jA|NAft/)
    expect(kept).toContain('"ixt_clear_token":"(taken out)"')
    expect(kept).toContain('"serialized_state":"(taken out)"')
    expect(kept).toContain('"entityID":"61590766182623"')
    expect(kept).toContain('"count":null')
  })
})
