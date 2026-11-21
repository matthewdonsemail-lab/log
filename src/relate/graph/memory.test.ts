import { afterAll, describe, expect, test } from 'bun:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import type { Database } from 'bun:sqlite'
import { insertEventRow } from '../../storage/platform/index'
import { openDatabase } from '../../storage/schema/index'
import { recordFact } from '../../people/facts/index'
import { EMBED_DIMENSIONS, EMBED_MODEL } from '../../search/conversations/types'
import { DEMO_NOW, DEMO_OWNER, seedDemoWorld } from './fixtures/demoWorld'
import { applyGraph, buildGraph, memoryCountsIn, readFromFile, recallFacts } from './index'

const root = mkdtempSync(join(tmpdir(), 'relateMemory-'))
const dbPath = join(root, 'log.db')

afterAll(() => {
  openDatabase(dbPath).close()
  Bun.gc(true)
  rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 })
})

const iso = (minutes: number): string => new Date(DEMO_NOW + minutes * 60_000).toISOString()

const axis = (n: number): number[] => Array.from({ length: EMBED_DIMENSIONS }, (_, i) => (i === n ? 1 : 0))

function remember(handle: Database, text: string, vector: number[]): void {
  handle.prepare('INSERT OR IGNORE INTO embeddings (hash, model, dimensions, kind, text, vector, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)').run(createHash('sha256').update(text).digest('hex').slice(0, 32), EMBED_MODEL, EMBED_DIMENSIONS, 'fact', text, Buffer.from(Float32Array.from(vector).buffer), iso(0))
}

function said(handle: Database, id: string, text: string, minutes: number, fromOwner = false): string {
  insertEventRow(handle, { platform: 'discord', account: DEMO_OWNER.discordAccount, conversationId: 'dmZoe', type: fromOwner ? 'ownMessage' : 'message', with: 'zoe_new', text, box: 'dm', payload: { id, senderId: fromOwner ? undefined : '9000000009' }, sourceAt: iso(minutes), receivedAt: iso(minutes), source: 'live' })
  return (handle.prepare('SELECT messageKey FROM messages WHERE text = ?').get(text) as { messageKey: string }).messageKey
}

const fact = (slot: 'workplace' | 'promisedByOwner', text: string, key: string, minutes: number) => ({ platform: 'discord', userId: '9000000009', slot, text, quote: text, sourceMessageKeys: [key], validFrom: iso(minutes), confidence: 0.9, extractedBy: 'test' })

describe("person facts projected into Relate's agent-memory model (REQ-FACTS-06)", () => {
  const handle = openDatabase(dbPath)
  seedDemoWorld(handle)
  const bakery = said(handle, 'f1', 'i work at a bakery these days', 1)
  const shipyard = said(handle, 'f2', 'quit the bakery, i work at the shipyard now', 2)
  recordFact(handle, fact('workplace', 'i work at a bakery these days', bakery, 1), new Date(DEMO_NOW + 60_000))
  recordFact(handle, fact('workplace', 'quit the bakery, i work at the shipyard now', shipyard, 2), new Date(DEMO_NOW + 120_000))
  remember(handle, 'i work at a bakery these days', axis(0))
  remember(handle, 'quit the bakery, i work at the shipyard now', axis(1))
  const built = buildGraph(dbPath, new Date(DEMO_NOW + 3 * 60_000))

  test('every source message is an Episode, each fact comes FROM it, is ABOUT its identity, and the correction SUPERSEDES the old fact', async () => {
    expect(await readFromFile(built.file, (ask) => memoryCountsIn(ask))).toEqual({ episodes: 2, facts: 2, from: 2, about: 2, supersedes: 1, mentions: 2 })
    const chain = await readFromFile(built.file, (ask) => ask("MATCH (n:Fact)-[:SUPERSEDES]->(o:Fact) MATCH (n)-[:ABOUT]->(i:Identity) RETURN n.text AS now, o.text AS was, o.closedAt IS NOT NULL AS closed, n.closedAt IS NULL AS current, i.key AS about"))
    expect(chain).toEqual([{ now: 'quit the bakery, i work at the shipyard now', was: 'i work at a bakery these days', closed: true, current: true, about: 'discord:9000000009' }])
  })

  test('recall by meaning returns the current fact with its evidence and what it replaced, never the closed one', async () => {
    const [near, older] = await readFromFile(built.file, async (ask) => [await recallFacts(ask, axis(1), 3), await recallFacts(ask, axis(0), 3)])
    expect(near[0].memory).toBe('quit the bakery, i work at the shipyard now')
    expect(near[0].evidence).toEqual(['quit the bakery, i work at the shipyard now'])
    expect(near[0].replaced).toEqual(['i work at a bakery these days'])
    expect(older.map((f) => f.memory)).not.toContain('i work at a bakery these days')
  })

  test('the shared apply projection adds a new fact in place and matches a full build', async () => {
    const promise = said(handle, 'f3', 'ill send you the shipyard contact list tomorrow', 4, true)
    recordFact(handle, fact('promisedByOwner', 'ill send you the shipyard contact list tomorrow', promise, 4), new Date(DEMO_NOW + 5 * 60_000))
    remember(handle, 'ill send you the shipyard contact list tomorrow', axis(2))
    const applied = applyGraph(dbPath, new Date(DEMO_NOW + 6 * 60_000))
    expect(applied.mode).toBe('applied')
    const [counts, recalled] = await readFromFile(applied.file, async (ask) => [await memoryCountsIn(ask), await recallFacts(ask, axis(2), 1)] as const)
    expect(counts).toEqual({ episodes: 3, facts: 3, from: 3, about: 3, supersedes: 1, mentions: 3 })
    expect(recalled[0]).toMatchObject({ slot: 'promisedByOwner', evidence: ['ill send you the shipyard contact list tomorrow'] })
    const full = buildGraph(dbPath, new Date(DEMO_NOW + 7 * 60_000))
    expect(await readFromFile(full.file, (ask) => memoryCountsIn(ask))).toEqual(counts)
  })
})
