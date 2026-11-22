import type { Database as SqlDatabase } from 'bun:sqlite'
import { closeSync, mkdirSync, openSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import type { Connection } from '@relate/relate'
import { defaultDbPath, openDatabase } from '../../storage/schema/index'
import { claimState } from '../../storage/state/index'
import { killTree, processAlive, processStartedAt, sameProcess } from '../../inbox/watch/index'
import { applyBatch, buildFileAsync, contextFrom, countsFrom, countsOf, eventsThrough, fenceStore, graphDir, needsFullBuild, offsetWithPointer, openStoreRetry, pointerFor, pointerOf, priorFrom, prune, putPointer, readOnlyRows, workspaceOf } from '../graph/client'
import { askOf } from '../graph/helpers/store'
import { machineFrom } from '../machine/client'
import type { MachineAsk } from '../machine/client'
import type { BuiltFile, GraphPointer, GraphStore, StoreOffset } from '../graph/types'
import { beatGraphOwner, claimGraphOwner, GraphOwnerFenced, ownerAlive, ownerRequest, ownerRowOf, releaseGraphOwner } from './helpers/index'
import { OWNER_BATCH_EVENTS, OWNER_BATCH_MS, OWNER_FAILURES_BEFORE_REBUILD, OWNER_HEARTBEAT_MS, OWNER_START_BACKOFF_MS, OWNER_STOP_WAIT_MS } from './types'
import type { EnsureOutcome, OwnerOptions, OwnerOutcome, OwnerReply, OwnerRow, OwnerStatus } from './types'

interface Deferred {
  done: (p: GraphPointer) => void
  fail: (e: unknown) => void
}

interface Held {
  store: GraphStore
  writer: Connection
  offset: StoreOffset
  pointer: GraphPointer
  walRows: number
  reads: number
}

const ok = <T>(value: T): OwnerReply<T> => ({ ok: true, value })

const failed = (error: unknown): OwnerReply<never> => ({ ok: false, code: (error as { code?: string }).code ?? 'graphOwnerError', error: error instanceof Error ? error.message : String(error) })

export async function runGraphOwner(options: OwnerOptions): Promise<OwnerOutcome> {
  const dbPath = resolve(options.dbPath)
  const log = options.log ?? (() => {})
  const pid = options.pid ?? process.pid
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((done) => setTimeout(done, ms)))
  const handle = openDatabase(dbPath)
  const claim = await claimGraphOwner(handle, { pid, alive: options.alive, startedOf: options.startedOf, kill: options.kill, sleep, staleMs: options.staleMs, confirmMs: options.staleConfirmMs, log })
  if (!claim.ok) {
    log(`graph owner: ${claim.reason}, so this one exits`)
    return { ok: false, code: 'graphOwnerRunning', reason: claim.reason }
  }
  const generation = claim.generation
  const token = randomBytes(16).toString('hex')
  const startedAt = new Date().toISOString()
  let status = 'starting'
  let port = 0
  let stopping = false
  let stopReason = 'stopped'
  let held: Held | null = null
  let batches = 0
  let appliedEvents = 0
  let failures = 0
  let reads = 0
  let lastBatch: OwnerStatus['lastBatch'] = null
  let rebuild: Promise<GraphPointer> | null = null
  let built: BuiltFile | null = null
  let rebuildError: unknown = null
  const swap: { waiting: Deferred | null } = { waiting: null }
  let lastBeat = 0
  const beat = (force = false) => {
    const now = Date.now()
    if (!force && now - lastBeat < (options.heartbeatMs ?? OWNER_HEARTBEAT_MS)) return
    lastBeat = now
    beatGraphOwner(handle, generation, { status, port, token }, now, pid)
  }
  const stopped = () => stopping || Boolean(options.stopped?.())

  async function open(file: string, pointer: GraphPointer): Promise<Held> {
    const store = await openStoreRetry(file)
    try {
      const writer = store.connect()
      const offset = offsetWithPointer(await fenceStore(writer, generation), pointer)
      return { store, writer, offset, pointer: { ...pointer, throughSeq: offset.throughSeq, generation }, walRows: pointer.walRows ?? 0, reads: 0 }
    } catch (error) {
      store.close()
      throw error
    }
  }

  async function catchUp(target: Held): Promise<void> {
    for (;;) {
      if (stopped()) return
      const done = await applyBatch({ handle, store: target.store, writer: target.writer, offset: target.offset, maxEvents: options.batchEvents ?? OWNER_BATCH_EVENTS, pid, walRows: target.walRows, beforeCommit: options.beforeCommit })
      if (!done) return
      target.offset = done.offset
      target.walRows = done.walRows
      batches++
      appliedEvents += done.events
      lastBatch = { events: done.events, ms: done.ms, at: new Date().toISOString() }
      target.pointer = { ...target.pointer, throughSeq: done.offset.throughSeq, builtAt: lastBatch.at, ms: done.ms, mode: 'applied', applied: done.events, stages: done.stages, walRows: done.walRows, interactionsThrough: done.offset.interactionsThrough ?? undefined, mergesThrough: done.offset.mergesThrough ?? undefined, networkStamp: done.offset.networkStamp, generation }
      putPointer(handle, target.pointer, generation, Date.now(), pid)
      beat()
    }
  }

  async function drain(old: Held): Promise<void> {
    const until = Date.now() + OWNER_STOP_WAIT_MS
    while (old.reads > 0 && Date.now() < until) await sleep(20)
    old.store.close()
  }

  async function swapTo(file: BuiltFile): Promise<GraphPointer> {
    const next = await open(file.file, pointerFor(file, dbPath, generation))
    await catchUp(next)
    next.pointer = { ...next.pointer, counts: await countsOf(askOf(next.writer)) }
    putPointer(handle, next.pointer, generation, Date.now(), pid)
    const old = held
    held = next
    if (old) await drain(old)
    prune(graphDir(dbPath), file.file)
    log(`graph owner: swapped to ${file.file}, through event ${next.offset.throughSeq}`)
    return next.pointer
  }

  function startRebuild(reason: string): Promise<GraphPointer> {
    if (rebuild) return rebuild
    log(`graph owner: full rebuild on a snapshot outside the loop (${reason})`)
    rebuildError = null
    let settle: Deferred = { done: () => {}, fail: () => {} }
    const pending = new Promise<GraphPointer>((done, fail) => {
      settle = { done, fail }
    })
    pending.catch(() => {})
    swap.waiting = settle
    buildFileAsync(dbPath).then((file) => {
      built = file
    }, (error) => {
      rebuildError = error
      rebuild = null
      swap.waiting = null
      settle.fail(error)
      log(`graph owner: rebuild failed: ${error instanceof Error ? error.message : String(error)}`)
    })
    rebuild = pending
    return pending
  }

  function reading<T>(work: (target: Held, conn: Connection) => Promise<T>): Promise<OwnerReply<T>> {
    const target = held
    if (!target) return Promise.resolve(failed(Object.assign(new Error('graphOwnerStarting: the graph owner has not opened the graph yet'), { code: 'graphOwnerStarting' })))
    target.reads++
    reads++
    const conn = target.store.connect()
    return work(target, conn).then(ok, failed).finally(() => {
      target.store.release(conn)
      target.reads--
    })
  }

  const statusNow = (): OwnerStatus => {
    const head = eventsThrough(handle)
    const through = held?.offset.throughSeq ?? 0
    return { pid, generation, file: held?.store.file ?? '', throughSeq: through, head, behind: Math.max(0, head - through), batches, appliedEvents, lastBatch, startedAt, rebuilding: Boolean(rebuild), reads, failures }
  }

  const routes: Record<string, (body: Record<string, unknown>) => Promise<OwnerReply<unknown>>> = {
    ask: (body) => reading((target, conn) => contextFrom(askOf(conn), String(body.prompt ?? ''), target.pointer, Math.max(0, eventsThrough(handle) - target.offset.throughSeq), Number(body.now ?? Date.now()), 'owner')),
    prior: (body) => reading(async (target, conn) => {
      const links = await priorFrom(askOf(conn), String(body.prompt ?? ''))
      return links ? { ...links, behind: Math.max(0, eventsThrough(handle) - target.offset.throughSeq) } : null
    }),
    query: (body) => reading(async (target, conn) => ({ ...(await readOnlyRows(askOf(conn), conn, String(body.cypher ?? ''), (body.params ?? {}) as Record<string, unknown>)), throughSeq: target.offset.throughSeq, served: 'owner' as const })),
    machine: (body) => reading(async (target, conn) => machineFrom(askOf(conn), (body.ask ?? {}) as MachineAsk, target.offset.throughSeq, handle, Number(body.now ?? Date.now()))),
    counts: () => reading(async (_target, conn) => countsFrom(askOf(conn), conn)),
    status: async () => ok(statusNow()),
    rebuild: async () => startRebuild('asked').then(ok, failed),
    stop: async () => {
      stopping = true
      stopReason = 'asked to stop'
      return ok({ stopping: true })
    },
  }

  const server = options.serve === false ? null : Bun.serve({
    hostname: '127.0.0.1',
    port: 0,
    idleTimeout: 0,
    async fetch(request) {
      if (request.headers.get('authorization') !== `Bearer ${token}`) return new Response('', { status: 401 })
      const route = routes[new URL(request.url).pathname.slice(1)]
      if (!route) return new Response('', { status: 404 })
      const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
      return Response.json(await route(body))
    },
  })
  port = server?.port ?? 0

  try {
    beat(true)
    const pointer = pointerOf(dbPath, handle)
    if (!pointer) {
      status = 'building'
      beat(true)
      startRebuild('no graph for this log.db yet')
    } else held = await open(pointer.file, pointer)
    status = held ? 'streaming' : 'building'
    beat(true)
    log(`graph owner: pid ${pid}, generation ${generation}, ${held ? `through event ${held.offset.throughSeq} of ${eventsThrough(handle)}` : 'building the first graph'}, serving 127.0.0.1:${port}`)
    while (!stopped()) {
      beat()
      if (built) {
        const file = built
        built = null
        try {
          const next = await swapTo(file)
          swap.waiting?.done(next)
        } catch (error) {
          swap.waiting?.fail(error)
          if (error instanceof GraphOwnerFenced) throw error
          log(`graph owner: swap failed: ${error instanceof Error ? error.message : String(error)}`)
        } finally {
          rebuild = null
          swap.waiting = null
        }
        status = held ? 'streaming' : 'building'
        beat(true)
      }
      if (rebuildError && !held) throw rebuildError
      if (held && !rebuild) {
        const why = needsFullBuild(held.offset, handle)
        if (why) startRebuild(why)
      }
      if (held) {
        try {
          await catchUp(held)
          failures = 0
          void options.facts?.tick()
          void options.bots?.tick()
        } catch (error) {
          if (error instanceof GraphOwnerFenced) throw error
          failures++
          log(`graph owner: batch failed (${failures} in a row): ${error instanceof Error ? error.message : String(error)}`)
          if (failures >= OWNER_FAILURES_BEFORE_REBUILD && !rebuild) startRebuild(`${failures} batches failed in a row`)
        }
      }
      await sleep(options.batchMs ?? OWNER_BATCH_MS)
    }
    return { ok: true, batches, reason: stopReason }
  } catch (error) {
    log(`graph owner: stopping: ${error instanceof Error ? error.message : String(error)}`)
    return { ok: false, code: (error as { code?: string }).code ?? 'graphOwnerError', reason: error instanceof Error ? error.message : String(error) }
  } finally {
    server?.stop(true)
    options.facts?.stop()
    options.bots?.stop()
    const last = held as Held | null
    if (last) await drain(last)
    releaseGraphOwner(handle, generation, pid)
  }
}

export function graphOwnerAlive(dbPath: string = defaultDbPath(), handle: SqlDatabase = openDatabase(dbPath), now: number = Date.now()): OwnerRow | null {
  const row = ownerRowOf(handle)
  return ownerAlive(row, now) ? row : null
}

export function startGraphOwner(repo: string, dbPath: string = defaultDbPath()): number | null {
  const dir = graphDir(dbPath)
  mkdirSync(dir, { recursive: true })
  const out = openSync(join(dir, 'owner.log'), 'a')
  try {
    const child = spawn('bun', [join(repo, 'scripts', 'relate', 'owner.ts')], { cwd: repo, detached: true, stdio: ['ignore', out, out], windowsHide: true, env: { ...process.env, LOG_DB: resolve(dbPath) } })
    child.unref()
    return child.pid ?? null
  } finally {
    closeSync(out)
  }
}

export function ensureGraphOwner(repo: string, dbPath: string = defaultDbPath(), start: (repo: string, dbPath: string) => number | null = startGraphOwner, env: Record<string, string | undefined> = process.env, now: number = Date.now()): EnsureOutcome {
  if (env.LOG_GRAPH_OWNER === 'off') return 'off'
  const handle = openDatabase(dbPath)
  if (graphOwnerAlive(dbPath, handle, now)) return 'alive'
  if (!claimState('relateOwnerStart', workspaceOf(dbPath), { by: process.pid }, OWNER_START_BACKOFF_MS, now, handle)) return 'starting'
  start(repo, dbPath)
  return 'started'
}

export async function graphOwnerStatus(dbPath: string = defaultDbPath()): Promise<{ row: OwnerRow | null; alive: boolean; live: OwnerStatus | null; head: number; pointer: GraphPointer | null }> {
  const handle = openDatabase(dbPath)
  const row = ownerRowOf(handle)
  const reply = await ownerRequest<OwnerStatus>(handle, 'status')
  return { row, alive: ownerAlive(row), live: reply?.ok ? reply.value : null, head: eventsThrough(handle), pointer: pointerOf(dbPath, handle) }
}

export async function stopGraphOwner(dbPath: string = defaultDbPath(), sleep: (ms: number) => Promise<void> = (ms) => new Promise((done) => setTimeout(done, ms))): Promise<{ stopped: boolean; pid: number | null; how: string }> {
  const handle = openDatabase(dbPath)
  const row = ownerRowOf(handle)
  if (!row || row.status === 'stopped') return { stopped: true, pid: null, how: 'no graph owner was running' }
  const asked = await ownerRequest(handle, 'stop')
  const until = Date.now() + OWNER_STOP_WAIT_MS
  while (Date.now() < until) {
    const now = ownerRowOf(handle)
    if (!now || now.status === 'stopped' || now.generation !== row.generation) return { stopped: true, pid: row.pid, how: asked ? 'it finished its batch and stopped' : 'it had already stopped' }
    await sleep(100)
  }
  if (processAlive(row.pid) && sameProcess(row.pidStartedAt, processStartedAt(row.pid))) killTree(row.pid)
  releaseGraphOwner(handle, row.generation, row.pid)
  return { stopped: true, pid: row.pid, how: 'it did not answer, so its process was stopped' }
}
