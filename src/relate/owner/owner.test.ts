import { afterAll, describe, expect, test } from 'bun:test'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { relateAnswer } from '../../agentHooks/answers/index'
import { insertEventRow } from '../../storage/platform/index'
import { openDatabase } from '../../storage/schema/index'
import { DEMO_NOW, DEMO_OWNER, seedDemoWorld } from '../graph/fixtures/demoWorld'
import * as graphModule from '../graph/index'
import { applyBatch, buildGraph, countsOf, eventsThrough, expectedCounts, fenceStore, openStoreRetry, pointerOf, projectionOf, queryGraph, readFromFile, readOffset, relateContext } from '../graph/index'
import { askOf } from '../graph/helpers/store'
import { relateMachine } from '../machine/index'
import { recordFact } from '../../people/facts/index'
import { claimGraphOwner, ensureGraphOwner, GraphOwnerFenced, graphOwnerStatus, ownerRowOf, releaseGraphOwner, runGraphOwner } from './index'

const roots: string[] = []
const repo = join(import.meta.dir, '..', '..', '..')

afterAll(() => {
  for (const root of roots) openDatabase(join(root, 'log.db')).close()
  Bun.gc(true)
  for (const root of roots) rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 })
})

const iso = (minutes: number): string => new Date(DEMO_NOW + minutes * 60_000).toISOString()

let made = 0

function world(): string {
  const root = mkdtempSync(join(tmpdir(), 'relateOwner-'))
  roots.push(root)
  const dbPath = join(root, 'log.db')
  seedDemoWorld(openDatabase(dbPath))
  buildGraph(dbPath, new Date(DEMO_NOW))
  return dbPath
}

function more(dbPath: string, n: number): number {
  const handle = openDatabase(dbPath)
  for (let i = 0; i < n; i++) {
    made++
    insertEventRow(handle, { platform: 'twitter', account: DEMO_OWNER.xAccount, conversationId: 'groupAgentBuilders', type: 'message', with: 'maya_ml', text: `owner test ${made}`, box: 'group', payload: { id: `ownerTest${made}`, senderId: '2000000005' }, sourceAt: iso(made), receivedAt: iso(made), source: 'live' })
  }
  return eventsThrough(handle)
}

async function dump(file: string): Promise<string[]> {
  const sorted = (v: unknown): unknown => (Array.isArray(v) ? v.map(sorted) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, x]) => [k, sorted(x)])) : v)
  const [nodes, edges] = await readFromFile(file, async (ask) => [await ask('MATCH (n) WHERE NOT n:Snapshot RETURN labels(n) AS labels, properties(n) AS props'), await ask('MATCH (a)-[e]->(b) RETURN type(e) AS type, a.key AS from, b.key AS to, properties(e) AS props')])
  return [...nodes, ...edges].map((r) => JSON.stringify(sorted(r))).sort()
}

const until = async (check: () => boolean | Promise<boolean>, ms = 20_000): Promise<void> => {
  const end = Date.now() + ms
  while (!(await check())) {
    if (Date.now() > end) throw new Error('timed out waiting')
    await Bun.sleep(25)
  }
}

describe('the graph owner: one consumer of log.db events per log.db', () => {
  test('re-applying the same batch is idempotent: the graph equals the full build with nothing doubled', async () => {
    const dbPath = world()
    const handle = openDatabase(dbPath)
    const pointer = pointerOf(dbPath, handle)!
    const head = more(dbPath, 3)
    const claim = await claimGraphOwner(handle)
    if (!claim.ok) throw new Error(claim.reason)
    const store = await openStoreRetry(pointer.file)
    try {
      const writer = store.connect()
      const from = await fenceStore(writer, claim.generation)
      const first = await applyBatch({ handle, store, writer, offset: from, maxEvents: 100 })
      expect(first!.offset.throughSeq).toBe(head)
      const once = await countsOf(askOf(writer))
      await writer.queryAsync('MATCH (s:Snapshot {key: $key}) SET s.throughSeq = $seq', { key: 'snapshot', seq: from.throughSeq })
      const again = await applyBatch({ handle, store, writer, offset: from, maxEvents: 100 })
      expect(again!.offset.throughSeq).toBe(head)
      expect(await countsOf(askOf(writer))).toEqual(once)
      expect(once).toEqual(expectedCounts(projectionOf(handle)))
      expect((await readOffset(askOf(writer)))!.throughSeq).toBe(head)
    } finally {
      store.close()
      releaseGraphOwner(handle, claim.generation)
    }
    const applied = await dump(pointer.file)
    const full = buildGraph(dbPath, new Date(DEMO_NOW + 60_000))
    expect(applied).toEqual(await dump(full.file))
  })

  test('a restart resumes from the offset stored in the graph, with no gap and no double', async () => {
    const dbPath = world()
    const handle = openDatabase(dbPath)
    const start = pointerOf(dbPath, handle)!.throughSeq
    const head = more(dbPath, 5)
    let commits = 0
    const first = await runGraphOwner({ dbPath, serve: false, batchMs: 10, batchEvents: 2, beforeCommit: async () => void commits++, stopped: () => commits >= 1 && pointerOf(dbPath, handle)!.throughSeq > start })
    expect(first.ok).toBe(true)
    const stoppedAt = pointerOf(dbPath, handle)!
    expect(stoppedAt.throughSeq).toBe(start + 2)
    expect((await readFromFile(stoppedAt.file, readOffset))!.throughSeq).toBe(start + 2)
    const second = await runGraphOwner({ dbPath, serve: false, batchMs: 10, batchEvents: 2, stopped: () => pointerOf(dbPath, handle)!.throughSeq >= head })
    expect(second.ok).toBe(true)
    const caught = pointerOf(dbPath, handle)!
    expect(caught.throughSeq).toBe(head)
    expect(caught.file).toBe(stoppedAt.file)
    const resumed = await dump(caught.file)
    const full = buildGraph(dbPath, new Date(DEMO_NOW + 60_000))
    expect(resumed).toEqual(await dump(full.file))
  })

  test('person facts go through the owner: a fact event is applied in its microbatch, the graph equals a full build, and the fact screen runs after each batch', async () => {
    const dbPath = world()
    const handle = openDatabase(dbPath)
    insertEventRow(handle, { platform: 'discord', account: DEMO_OWNER.discordAccount, conversationId: 'dmOwnerFacts', type: 'message', with: 'zoe_new', text: 'i work at a shipyard now', box: 'dm', payload: { id: 'ownerFact1', senderId: '9000000009' }, sourceAt: iso(1), receivedAt: iso(1), source: 'live' })
    const key = (handle.prepare('SELECT messageKey FROM messages WHERE text = ?').get('i work at a shipyard now') as { messageKey: string }).messageKey
    const recorded = recordFact(handle, { platform: 'discord', userId: '9000000009', slot: 'workplace', text: 'i work at a shipyard now', quote: 'i work at a shipyard now', sourceMessageKeys: [key], validFrom: iso(1), confidence: 0.9, extractedBy: 'test' }, new Date(DEMO_NOW + 120_000))
    expect(recorded.ok).toBe(true)
    const head = eventsThrough(handle)
    let ticks = 0
    let screenStopped = false
    const done = await runGraphOwner({ dbPath, serve: false, batchMs: 10, facts: { tick: async () => void ticks++, stop: () => void (screenStopped = true) }, stopped: () => pointerOf(dbPath, handle)!.throughSeq >= head && ticks > 0 })
    expect(done.ok).toBe(true)
    expect(screenStopped).toBe(true)
    const file = pointerOf(dbPath, handle)!.file
    expect(await readFromFile(file, (ask) => ask("MATCH (f:Fact)-[:FROM]->(e:Episode) MATCH (f)-[:ABOUT]->(i:Identity) RETURN f.text AS fact, e.text AS evidence, i.key AS about"))).toEqual([{ fact: 'i work at a shipyard now', evidence: 'i work at a shipyard now', about: 'discord:9000000009' }])
    const applied = await dump(file)
    const full = buildGraph(dbPath, new Date(DEMO_NOW + 60_000))
    expect(applied).toEqual(await dump(full.file))
  })

  test("a replaced owner's commit is refused by its generation, and the store keeps its offset", async () => {
    const dbPath = world()
    const handle = openDatabase(dbPath)
    const pointer = pointerOf(dbPath, handle)!
    const claim = await claimGraphOwner(handle)
    if (!claim.ok) throw new Error(claim.reason)
    const store = await openStoreRetry(pointer.file)
    try {
      const writer = store.connect()
      const from = await fenceStore(writer, claim.generation)
      more(dbPath, 2)
      handle.prepare("UPDATE owners SET generation = generation + 1, pid = 999999 WHERE platform = 'relate' AND account = 'graph'").run()
      await expect(applyBatch({ handle, store, writer, offset: from, maxEvents: 100 })).rejects.toBeInstanceOf(GraphOwnerFenced)
      expect((await readOffset(askOf(writer)))!.throughSeq).toBe(from.throughSeq)
      await expect(fenceStore(writer, claim.generation - 1)).rejects.toBeInstanceOf(GraphOwnerFenced)
    } finally {
      store.close()
    }
    handle.prepare("UPDATE owners SET status = 'stopped' WHERE platform = 'relate' AND account = 'graph'").run()
  })

  test('the index pass ticks beside the fact stream and the owner status carries its cost line', async () => {
    const dbPath = world()
    const handle = openDatabase(dbPath)
    let ticks = 0
    let stop = false
    let passStopped = false
    const tick = { chats: 1, queued: 2, embedded: 3, voiced: 4, screened: 5, decided: 1, p50: 12, p95: 30, throughSeq: eventsThrough(handle), head: eventsThrough(handle), backlog: 0, at: iso(3), ms: 14, overran: 0 }
    const running = runGraphOwner({ dbPath, batchMs: 20, stopped: () => stop, pass: { tick: async () => void ticks++, stop: () => void (passStopped = true), last: () => tick } })
    await until(() => ownerRowOf(handle)?.status === 'streaming')
    await until(() => ticks > 0)
    const status = await graphOwnerStatus(dbPath)
    expect(status.live?.pass?.queued).toBe(2)
    expect(status.live?.pass?.screened).toBe(5)
    expect(status.live?.pass?.p95).toBe(30)
    stop = true
    await running
    expect(passStopped).toBe(true)
  })

  test('a second owner started for the same log.db exits and leaves the first one owning it', async () => {
    const dbPath = world()
    const handle = openDatabase(dbPath)
    let stop = false
    const running = runGraphOwner({ dbPath, batchMs: 20, stopped: () => stop })
    await until(() => ownerRowOf(handle)?.status === 'streaming')
    const second = spawnSync(process.execPath, [join(repo, 'scripts', 'relate', 'owner.ts')], { cwd: repo, encoding: 'utf8', windowsHide: true, timeout: 60_000, env: { ...process.env, LOG_DB: dbPath } })
    expect(second.status).toBe(3)
    expect(second.stdout).toContain('graphOwnerRunning')
    expect(ownerRowOf(handle)!.pid).toBe(process.pid)
    stop = true
    expect((await running).ok).toBe(true)
  }, 90_000)

  test('readers get answers from the owner while a batch is still applying, and see the batch once it commits', async () => {
    const dbPath = world()
    const handle = openDatabase(dbPath)
    let stop = false
    let entered = false
    let release: () => void = () => {}
    const gate = new Promise<void>((done) => {
      release = done
    })
    const running = runGraphOwner({ dbPath, batchMs: 20, stopped: () => stop, beforeCommit: async () => {
      entered = true
      await gate
    } })
    await until(() => ownerRowOf(handle)?.status === 'streaming')
    const before = pointerOf(dbPath, handle)!.throughSeq
    const head = more(dbPath, 2)
    await until(() => entered)
    const answer = await relateContext('@ada_codes', dbPath, DEMO_NOW)
    expect(answer.outcome).toBe('answered')
    expect(answer.served).toBe('owner')
    expect(answer.behind).toBe(head - before)
    const rows = await queryGraph("MATCH (i:Identity {handleLower: 'maya_ml'}) RETURN i.key AS key", {}, dbPath)
    expect(rows.served).toBe('owner')
    expect(rows.throughSeq).toBe(before)
    const status = await graphOwnerStatus(dbPath)
    expect(status.live!.behind).toBe(head - before)
    await expect(queryGraph('CREATE (:Identity {key: $k})', { k: 'nope' }, dbPath)).rejects.toThrow('graphReadOnly')
    expect((await queryGraph("MATCH (i:Identity) WHERE $platform = '' OR i.platform = $platform RETURN count(i) AS n", {}, dbPath)).served).toBe('owner')
    const machine = await relateMachine({ view: 'network' }, dbPath, DEMO_NOW)
    expect(machine.ok && machine.throughSeq).toBe(before)
    release()
    await until(() => pointerOf(dbPath, handle)!.throughSeq === head)
    expect((await queryGraph('MATCH (s:Snapshot) RETURN s.throughSeq AS seq', {}, dbPath)).rows).toEqual([{ seq: head }])
    stop = true
    expect((await running).ok).toBe(true)
    expect((await relateContext('@ada_codes', dbPath, DEMO_NOW)).served).toBe('file')
  }, 60_000)

  test('the hook only checks that the owner is alive: it never spawns an apply, and starts a missing owner once', async () => {
    expect(Object.keys(graphModule)).not.toContain('refreshGraph')
    const dbPath = world()
    const handle = openDatabase(dbPath)
    const started: string[] = []
    const start = (_repo: string, path: string) => {
      started.push(path)
      return null
    }
    expect(ensureGraphOwner(repo, dbPath, start, {})).toBe('started')
    expect(ensureGraphOwner(repo, dbPath, start, {})).toBe('starting')
    expect(started).toEqual([dbPath])
    expect(ensureGraphOwner(repo, dbPath, start, { LOG_GRAPH_OWNER: 'off' })).toBe('off')
    const fresh = new Date().toISOString()
    handle.prepare("INSERT OR REPLACE INTO owners (platform, account, pid, hostname, startedAt, heartbeat, status, generation) VALUES ('relate', 'graph', ?, 'h', ?, ?, 'streaming', 7)").run(process.ppid, fresh, fresh)
    const held = process.env.LOG_GRAPH_OWNER
    process.env.LOG_GRAPH_OWNER = 'on'
    try {
      for (let i = 0; i < 5; i++) await relateAnswer(JSON.stringify({ prompt: 'reply to @ada_codes' }), repo, async () => null, dbPath, start)
    } finally {
      process.env.LOG_GRAPH_OWNER = held
    }
    expect(started).toEqual([dbPath])
    expect(ensureGraphOwner(repo, dbPath, start, {})).toBe('alive')
  })

  test('taking over a silent owner needs two stale readings 10 s apart, kills it only when its start time matches, and raises the generation', async () => {
    const dbPath = world()
    const handle = openDatabase(dbPath)
    const plant = (startedAt: string) => {
      const old = new Date(Date.now() - 60_000).toISOString()
      handle.prepare("INSERT OR REPLACE INTO owners (platform, account, pid, hostname, startedAt, heartbeat, status, generation, pidStartedAt, staleSeenAt) VALUES ('relate', 'graph', 4242, 'h', ?, ?, 'streaming', 5, ?, NULL)").run(old, old, startedAt)
    }
    let clock = Date.now()
    const slept: number[] = []
    const killed: number[] = []
    const deps = { pid: 5151, alive: () => true, kill: (pid: number) => void killed.push(pid), now: () => clock, sleep: async (ms: number) => {
      slept.push(ms)
      clock += ms
    } }
    plant('2026-01-01T00:00:00.000Z')
    const hung = await claimGraphOwner(handle, { ...deps, startedOf: () => '2026-01-01T00:00:01.000Z' })
    expect(hung).toEqual({ ok: true, generation: 6 })
    expect(slept).toEqual([10_000])
    expect(killed).toEqual([4242])
    plant('2026-01-01T00:00:00.000Z')
    const reused = await claimGraphOwner(handle, { ...deps, startedOf: () => '2026-03-01T00:00:00.000Z' })
    expect(reused).toEqual({ ok: true, generation: 6 })
    expect(killed).toEqual([4242])
    const fresh = new Date().toISOString()
    handle.prepare("UPDATE owners SET pid = 4242, heartbeat = ?, status = 'streaming' WHERE platform = 'relate' AND account = 'graph'").run(fresh)
    const refused = await claimGraphOwner(handle, { ...deps, now: Date.now })
    expect(refused.ok).toBe(false)
  })
})
