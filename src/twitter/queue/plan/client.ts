import { createHash } from 'node:crypto'
import { appendFileSync, existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { planSend } from '../../post/send/index'
import type { BuildTarget, EventKind, PlanEvent, PlanOptions, Queue, QueueAction, QueueItem, Rng } from './types'
import { ITEM_STATUSES, QUEUE_ACTIONS } from './types'

export const MIN_GAP_FLOOR = 30

export function systemRandom(): number {
  const word = new Uint32Array(2)
  crypto.getRandomValues(word)
  return (word[0] * 2 ** 21 + (word[1] >>> 11)) / 2 ** 53
}

export function seededRandom(seed: number): Rng {
  let state = seed >>> 0 || 1
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const CONTROLLER_KEYS: Record<string, string> = {
  tweet_url: 'tweetUrl',
  post_url: 'tweetUrl',
  user_id: 'userId',
  post_text: 'postText',
  sent_id: 'sentId',
  sent_url: 'sentUrl',
  attempted_at: 'attemptedAt',
  liked_at: 'likedAt',
  sent_at_run: 'sentAtRun',
  random_run: 'randomRun',
  min_gap: 'minGap'
}

export function fromController(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(fromController)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [CONTROLLER_KEYS[k] ?? k, fromController(v)]))
  return value
}

export function loadQueue(path: string): Queue {
  if (!existsSync(path)) throw new Error(`no queue at ${path}`)
  const queue = fromController(JSON.parse(readFileSync(path, 'utf8'))) as Queue
  if (typeof queue.account !== 'string' || !Array.isArray(queue.items)) throw new Error(`${path} isn't a queue: it needs account and items`)
  return queue
}

export function saveQueue(path: string, queue: Queue): void {
  const tmp = `${path}.tmp`
  writeFileSync(tmp, JSON.stringify(queue, null, 1), 'utf8')
  renameSync(tmp, path)
}

const stem = (path: string) => path.replace(/\.json$/i, '')

export const logPathOf = (path: string) => `${stem(path)}.log`

export const lockPathOf = (path: string) => `${stem(path)}.lock`

export const nudgePathOf = (path: string) => `${stem(path)}.nudge`

export function queueLog(path: string, line: string, now = new Date()): string {
  const stamped = `${now.toISOString().replace('T', ' ').slice(0, 19)} ${line}`
  appendFileSync(logPathOf(path), stamped + '\n', 'utf8')
  return stamped
}

export function targetOfItem(item: Pick<QueueItem, 'action' | 'tweetUrl' | 'userId'>): string | undefined {
  return item.action === 'dm' ? item.userId : item.tweetUrl
}

export function pyJson(value: unknown): string {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'string') return JSON.stringify(value)
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return `[${value.map(pyJson).join(', ')}]`
  return `{${Object.entries(value as Record<string, unknown>).map(([k, v]) => `${JSON.stringify(k)}: ${pyJson(v)}`).join(', ')}}`
}

export function fingerprint(queue: Pick<Queue, 'account' | 'items'>): string {
  const rows = queue.items.filter((it) => it.status !== 'skipped').map((it) => [it.n, it.action, targetOfItem(it) ?? null, it.text])
  return createHash('sha256').update(pyJson([queue.account, rows]), 'utf8').digest('hex')
}

export function approvalProblem(queue: Queue): string | null {
  if (!queue.approval) return 'not approved: review it with queue show, then queue approve --by <who>'
  if (queue.approval.fingerprint !== fingerprint(queue)) return 'the queue changed after it was approved: review it again and approve it again'
  return null
}

export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const held = out[i]
    out[i] = out[j]
    out[j] = held
  }
  return out
}

export function buildQueue(input: { account: string; action: QueueAction; targets: BuildTarget[]; lines: string[]; sources: string[]; seed: number; now: Date }): Queue {
  const own = input.targets.map((t) => (typeof t.text === 'string' && t.text.trim() ? t.text.trim() : null))
  const ownLines = own.filter((l): l is string => l !== null)
  if (new Set(ownLines).size < ownLines.length) throw new Error('two targets carry the same text: every target needs its own line')
  const pool = [...new Set(input.lines)].filter((l) => !ownLines.includes(l))
  const drawn = own.filter((l) => l === null).length
  if (pool.length < drawn) throw new Error(`${pool.length} unique lines for ${drawn} targets without their own text: add more variations`)
  const shuffled = shuffle(pool, seededRandom(input.seed))
  let next = 0
  const items: QueueItem[] = input.targets.map((target, i) => {
    const base = { n: i + 1, action: input.action, handle: target.handle ?? null, text: own[i] ?? shuffled[next++], status: 'pending' as const }
    if (input.action === 'dm') {
      if (!target.userId) throw new Error(`target ${i + 1} has no user_id: a dm queue needs each recipient's id`)
      return { ...base, userId: String(target.userId) }
    }
    if (!target.tweetUrl) throw new Error(`target ${i + 1} has no tweet_url or post_url`)
    return { ...base, tweetUrl: target.tweetUrl, postText: (target.postText ?? '').slice(0, 200) }
  })
  return { created: input.now.toISOString(), account: input.account.replace(/^@/, ''), approval: null, sources: input.sources, items }
}

export function targetsOf(raw: unknown): BuildTarget[] {
  const value = fromController(raw)
  if (Array.isArray(value)) return value as BuildTarget[]
  const items = (value as { items?: unknown })?.items
  if (Array.isArray(items)) return items as BuildTarget[]
  throw new Error('targets must be a list, or an object with items')
}

export function linesOf(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String)
  const messages = (raw as { messages?: unknown })?.messages
  if (Array.isArray(messages)) return messages.map(String)
  throw new Error('variations must be a list of lines, or an object with messages')
}

export function itemProblems(queue: Queue, style?: string | null): { n: number; detail: string }[] {
  const out: { n: number; detail: string }[] = []
  for (const it of queue.items.filter((i) => i.status === 'pending')) {
    if (!QUEUE_ACTIONS.includes(it.action)) {
      out.push({ n: it.n, detail: `action ${it.action} isn't one of ${QUEUE_ACTIONS.join(', ')}` })
      continue
    }
    const plan = planSend({ action: it.action, tweetUrl: it.tweetUrl, userId: it.userId, text: it.text, style, live: false })
    if (!plan.ok) out.push({ n: it.n, detail: `${plan.problem.code}: ${plan.problem.detail}` })
  }
  return out
}

export function approveQueue(queue: Queue, by: string, now: Date): Queue {
  return { ...queue, approval: { by, at: now.toISOString(), fingerprint: fingerprint(queue), count: queue.items.filter((i) => i.status === 'pending').length } }
}

export function statusCounts(queue: Queue): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const status of ITEM_STATUSES) {
    const n = queue.items.filter((i) => i.status === status).length
    if (n) counts[status] = n
  }
  return counts
}

export function parseSpan(window: string): number {
  const match = /^(\d+(?:\.\d+)?)([hm])$/.exec(window)
  if (!match) throw new Error('--window looks like 5h or 90m')
  return Number(match[1]) * (match[2] === 'h' ? 3600 : 60)
}

export function drawTimes(n: number, start: number, span: number, minGap: number, rng: Rng): number[] {
  if (n && (n - 1) * minGap > span) throw new Error(`${n} events ${minGap}s apart don't fit in ${(span / 3600).toFixed(1)}h: widen --window or lower --minGap`)
  const free = span - Math.max(0, n - 1) * minGap
  const points = Array.from({ length: n }, () => rng() * free).sort((a, b) => a - b)
  return points.map((p, i) => start + p + i * minGap)
}

export function pickKinds(like: boolean, chance: number, rng: Rng): EventKind[] {
  if (!like || rng() >= chance) return ['reply']
  return rng() < 0.5 ? ['like', 'reply'] : ['reply', 'like']
}

export function interleave(events: { n: number; kind: EventKind }[], rng: Rng): { n: number; kind: EventKind }[] {
  const pending = new Map<number, { n: number; kind: EventKind }[]>()
  for (const e of events) pending.set(e.n, [...(pending.get(e.n) ?? []), e])
  const out: { n: number; kind: EventKind }[] = []
  while (pending.size) {
    const keys = [...pending.keys()]
    const n = keys[Math.floor(rng() * keys.length)]
    const mine = pending.get(n)!
    out.push(mine.shift()!)
    if (!mine.length) pending.delete(n)
  }
  return out
}

export function planQueue(queue: Queue, options: PlanOptions, rng: Rng, now: Date): Queue {
  if (options.minGap < MIN_GAP_FLOOR) throw new Error(`--minGap must be at least ${MIN_GAP_FLOOR} s`)
  const todo = queue.items.filter((i) => i.status === 'pending').slice(0, options.limit || undefined)
  const kinds = todo.map((it) => ({ n: it.n, kinds: it.action === 'dm' ? (['reply'] as EventKind[]) : pickKinds(options.like, options.likeChance, rng) }))
  const total = kinds.reduce((sum, k) => sum + k.kinds.length, 0)
  const times = drawTimes(total, options.start.getTime() / 1000, parseSpan(options.window), options.minGap, rng)
  const order = interleave(kinds.flatMap((k) => k.kinds.map((kind) => ({ n: k.n, kind }))), rng)
  const events: PlanEvent[] = order.map((e, i) => ({ ...e, at: new Date(Math.round(times[i]) * 1000).toISOString() }))
  return { ...queue, randomRun: { planned: now.toISOString(), window: options.window, minGap: options.minGap, events } }
}
