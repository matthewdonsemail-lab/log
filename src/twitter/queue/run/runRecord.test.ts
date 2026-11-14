import { describe, expect, test } from 'bun:test'
import { createHash } from 'node:crypto'
import type { TwitterSessionAnswer } from '../../account/session/index'
import { approveQueue, buildQueue, seededRandom } from '../plan/index'
import type { EventKind, PlanEvent, Queue, QueueAction, QueueItem } from '../plan/index'
import { runQueue } from './index'
import type { RunDeps, RunResult } from './types'
import { EXPECTED } from './runRecordExpected'

const START = Date.parse('2026-11-14T10:00:00Z')

const at = (seconds: number) => new Date(START + seconds * 1000).toISOString()

const HANDLES = ['fakeBird', 'fakeFinch', 'fakeWren', 'fakeRobin', 'fakeLark']

interface Planned {
  n: number
  kind: EventKind
  s: number
  done?: number
  skipped?: string
}

function queueOf(action: QueueAction, count: number, events: Planned[], minGap: number, statuses: Partial<Record<number, QueueItem['status']>> = {}): Queue {
  const targets = HANDLES.slice(0, count).map((handle, i) => (action === 'dm' ? { handle, userId: String(4200 + i), text: `yo ${handle} the new tool is up` } : { handle, tweetUrl: `https://x.com/${handle}/status/19000000000000000${i}`, text: `nice one ${handle}` }))
  const built = buildQueue({ account: 'xActs', action, targets, lines: [], sources: [], seed: 1, now: new Date(START) })
  built.randomRun = { planned: at(0), window: '1h', minGap, events: events.map((e) => ({ n: e.n, kind: e.kind, at: at(e.s), ...(e.done !== undefined ? { done: at(e.done) } : {}), ...(e.skipped ? { skipped: e.skipped } : {}) })) }
  for (const [n, status] of Object.entries(statuses)) {
    const item = built.items.find((i) => i.n === Number(n))!
    item.status = status!
    if (status === 'sent') item.sentAtRun = at(0)
  }
  return approveQueue(built, 'fakeOwner', new Date(START))
}

interface Script {
  answer?: (call: number, item: QueueItem, kind: EventKind) => TwitterSessionAnswer
  nudges?: Record<number, number>
  added?: (call: number, queue: Queue, clock: number) => PlanEvent[]
  cancelled?: (call: number, clock: number, sends: number) => boolean
  changed?: (item: QueueItem, clock: number) => string[]
  keepOpen?: boolean
  noTakeAdded?: boolean
  noCancelled?: boolean
  seed?: number
}

const ok = (item: QueueItem, kind: EventKind): TwitterSessionAnswer => (kind === 'like' ? { ok: true, event: 'sent', liked: true } : item.action === 'dm' ? { ok: true, event: 'sent', conversationId: `${item.userId}-1` } : { ok: true, event: 'sent', tweetId: `77${item.n}` })

const short = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 10)

function summary(queue: Queue): string {
  const items = queue.items.map((i) => `${i.n}:${i.status}`).join(',')
  const events = (queue.randomRun?.events ?? []).map((e) => `${e.n}${e.kind[0]}@${(Date.parse(e.at) - START) / 1000}${e.done ? `:done@${(Date.parse(e.done) - START) / 1000}` : ''}${e.skipped ? `:${e.skipped}` : ''}`).join(',')
  return `items[${items}] events[${events}] #${short(queue)}`
}

function squash(lines: string[]): string[] {
  const out: string[] = []
  let i = 0
  while (i < lines.length) {
    let best = { size: 1, times: 1 }
    for (let size = 1; size <= 4; size++) {
      let times = 1
      while (lines.slice(i, i + size).every((l, k) => l === lines[i + times * size + k]) && i + (times + 1) * size <= lines.length) times++
      if (times > 1 && times * size > best.times * best.size) best = { size, times }
    }
    const block = lines.slice(i, i + best.size)
    if (best.times > 1) out.push(`${best.times}x [${block.join(' | ')}]`)
    else out.push(block[0])
    i += best.size * best.times
  }
  return out
}

interface Recorded {
  timeline: string[]
  result: RunResult | { threw: string }
  items: Partial<QueueItem>[]
  events: PlanEvent[]
}

async function record(queue: Queue, script: Script = {}): Promise<Recorded> {
  const clock = { now: START }
  const lines: string[] = []
  const t = () => `+${(clock.now - START) / 1000}s`
  const calls = { send: 0, nudge: 0, added: 0, cancelled: 0 }
  const deps: RunDeps = {
    send: async (item, kind) => {
      calls.send += 1
      lines.push(`${t()} send ${kind} #${item.n} @${item.handle}`)
      return (script.answer ?? ((_c, i, k) => ok(i, k)))(calls.send, item, kind)
    },
    nowMs: () => clock.now,
    sleep: async (ms) => {
      lines.push(`sleep ${Math.round(ms)}`)
      clock.now += ms
    },
    rng: seededRandom(script.seed ?? 11),
    log: (line) => lines.push(`${t()} log ${line}`),
    alert: (message, mention) => lines.push(`${t()} alert${mention ? '!' : ''} ${message}`),
    takeNudge: () => {
      calls.nudge += 1
      const n = script.nudges?.[calls.nudge] ?? 0
      lines.push(`nudge ${n}`)
      return n
    },
    ...(script.noTakeAdded
      ? {}
      : {
          takeAdded: () => {
            calls.added += 1
            const events = script.added?.(calls.added, queue, clock.now) ?? []
            lines.push(`added ${events.map((e) => `#${e.n}${e.kind[0]}@${(Date.parse(e.at) - START) / 1000}`).join(',') || '-'}`)
            return events
          },
        }),
    contextChanged: async (item) => {
      const changed = script.changed?.(item, clock.now) ?? []
      lines.push(`${t()} context #${item.n} ${changed.length ? changed.join(' | ') : '-'}`)
      return changed
    },
    keepOpen: script.keepOpen,
    save: () => lines.push(`${t()} save ${summary(queue)}`),
    ...(script.noCancelled
      ? {}
      : {
          cancelled: () => {
            calls.cancelled += 1
            const yes = script.cancelled?.(calls.cancelled, clock.now, calls.send) ?? false
            lines.push(`cancelled ${yes}`)
            return yes
          },
        }),
  }
  let result: Recorded['result']
  try {
    result = await runQueue(queue, deps)
  } catch (error) {
    result = { threw: error instanceof Error ? error.message : String(error) }
  }
  return { timeline: squash(lines), result, items: queue.items.map(({ draftedAt, ...rest }) => rest), events: queue.randomRun?.events ?? [] }
}

function addition(queue: Queue, handle: string, seconds: number): PlanEvent[] {
  const n = Math.max(...queue.items.map((i) => i.n)) + 1
  queue.items.push({ n, action: 'reply', handle, text: `added for ${handle}`, tweetUrl: `https://x.com/${handle}/status/1900000000000000099`, status: 'pending' })
  const event: PlanEvent = { n, kind: 'reply', at: at(seconds) }
  queue.randomRun!.events.push(event)
  return [event]
}

const refused = (code: string, event: TwitterSessionAnswer['event'], detail: string): TwitterSessionAnswer => ({ ok: false, code, ...(event ? { event } : {}), detail })

const drop: TwitterSessionAnswer = { ok: false, code: 'RequestsError', event: 'failed', detail: 'curl: (56) Recv failure: Connection was reset' }

const SCENARIOS: Record<string, () => Promise<Recorded>> = {
  fullRun: () => record(queueOf('reply', 3, [{ n: 1, kind: 'reply', s: 20 }, { n: 1, kind: 'like', s: 45 }, { n: 2, kind: 'reply', s: 70 }, { n: 3, kind: 'like', s: 90 }, { n: 3, kind: 'reply', s: 110 }], 15)),
  dmRun: () => record(queueOf('dm', 2, [{ n: 1, kind: 'reply', s: 12 }, { n: 2, kind: 'reply', s: 40 }], 20)),
  pacing: () => record(queueOf('reply', 3, [{ n: 1, kind: 'reply', s: 3 }, { n: 2, kind: 'reply', s: 9 }, { n: 3, kind: 'reply', s: 14 }], 30)),
  pacingAfterResume: () => record(queueOf('reply', 3, [{ n: 1, kind: 'reply', s: -40, done: -20 }, { n: 2, kind: 'reply', s: 2 }, { n: 3, kind: 'reply', s: 50 }], 30, { 1: 'sent' })),
  governorRefusal: () => record(queueOf('reply', 3, [{ n: 1, kind: 'reply', s: 10 }, { n: 2, kind: 'reply', s: 30 }, { n: 3, kind: 'reply', s: 50 }], 15), { answer: (c, i, k) => (c === 2 ? refused('governorBlocked', undefined, 'cooldown active for 660s') : ok(i, k)) }),
  platformRefusal: () => record(queueOf('reply', 3, [{ n: 1, kind: 'reply', s: 10 }, { n: 1, kind: 'like', s: 30 }, { n: 2, kind: 'reply', s: 50 }], 15), { answer: (c, i, k) => (c === 2 ? refused('CouldNotTweet', 'automated', '(226) This request looks like it might be automated') : ok(i, k)) }),
  sessionDead: () => record(queueOf('dm', 2, [{ n: 1, kind: 'reply', s: 10 }, { n: 2, kind: 'reply', s: 30 }], 15), { answer: () => refused('sessionDead', 'sessionDead', 'X answered HTTP 401') }),
  engineThrow: () => record(queueOf('reply', 3, [{ n: 1, kind: 'reply', s: 10 }, { n: 2, kind: 'reply', s: 30 }, { n: 3, kind: 'reply', s: 50 }], 15), { answer: (c, i, k) => { if (c === 2) throw new Error('socket closed'); return ok(i, k) } }),
  contextThrow: () => record(queueOf('reply', 2, [{ n: 1, kind: 'reply', s: 10 }, { n: 2, kind: 'reply', s: 30 }], 15), { changed: (item) => { if (item.n === 2) throw new Error('log.db is locked'); return [] } }),
  cancelMidWait: () => record(queueOf('reply', 3, [{ n: 1, kind: 'reply', s: 10 }, { n: 2, kind: 'reply', s: 40 }, { n: 3, kind: 'reply', s: 70 }], 15), { cancelled: (_c, clock) => clock >= START + 25_000 }),
  cancelMidSend: () => record(queueOf('reply', 3, [{ n: 1, kind: 'reply', s: 10 }, { n: 2, kind: 'reply', s: 40 }, { n: 3, kind: 'reply', s: 70 }], 15), { cancelled: (_c, _clock, sends) => sends >= 2 }),
  cancelMidSendDue: () => record(queueOf('reply', 3, [{ n: 1, kind: 'reply', s: 10 }, { n: 2, kind: 'reply', s: 26 }, { n: 3, kind: 'reply', s: 70 }], 15), { cancelled: (_c, _clock, sends) => sends >= 1 }),
  cancelBeforeSend: () => record(queueOf('reply', 2, [{ n: 1, kind: 'reply', s: -5 }, { n: 2, kind: 'reply', s: 40 }], 15), { cancelled: () => true }),
  nudgeDuringWait: () => record(queueOf('reply', 4, [{ n: 1, kind: 'reply', s: 10 }, { n: 2, kind: 'reply', s: 300 }, { n: 3, kind: 'reply', s: 600 }, { n: 4, kind: 'reply', s: 900 }], 30), { nudges: { 5: 2 } }),
  nudgeAtStart: () => record(queueOf('reply', 2, [{ n: 1, kind: 'reply', s: 200 }, { n: 1, kind: 'like', s: 260 }, { n: 2, kind: 'reply', s: 400 }], 30), { nudges: { 1: 1 } }),
  addedEarly: () => record(queueOf('reply', 2, [{ n: 1, kind: 'reply', s: 10 }, { n: 2, kind: 'reply', s: 120 }], 30), { added: (c, q) => (c === 4 ? addition(q, 'fakeLark', 60) : []) }),
  addedLate: () => record(queueOf('reply', 2, [{ n: 1, kind: 'reply', s: 10 }, { n: 2, kind: 'reply', s: 60 }], 30), { added: (c, q) => (c === 3 ? addition(q, 'fakeLark', 200) : []) }),
  addedAtStart: () => record(queueOf('reply', 1, [{ n: 1, kind: 'reply', s: 40 }], 30), { added: (c, q) => (c === 1 ? addition(q, 'fakeLark', 10) : []) }),
  keepOpen: () => record(queueOf('reply', 1, [{ n: 1, kind: 'reply', s: 10 }], 30), { keepOpen: true, added: (c, q) => (c === 6 ? addition(q, 'fakeLark', 30) : []), cancelled: (_c, _clock, sends) => sends >= 2 }),
  keepOpenCancelled: () => record(queueOf('reply', 1, [{ n: 1, kind: 'reply', s: 10 }], 30), { keepOpen: true, cancelled: (c) => c >= 6 }),
  notKeptOpen: () => record(queueOf('reply', 1, [{ n: 1, kind: 'reply', s: 10 }], 30), { added: (c, q) => (c === 4 ? addition(q, 'fakeLark', 30) : []) }),
  noTakeAdded: () => record(queueOf('reply', 2, [{ n: 1, kind: 'reply', s: 10 }, { n: 2, kind: 'reply', s: 30 }], 15), { noTakeAdded: true, noCancelled: true }),
  contextMoved: () => record(queueOf('reply', 3, [{ n: 1, kind: 'reply', s: 10 }, { n: 2, kind: 'like', s: 25 }, { n: 2, kind: 'reply', s: 40 }, { n: 3, kind: 'reply', s: 60 }], 15), { changed: (item) => (item.n === 2 ? ['2026-11-14T10:00:20Z they retweeted your post'] : []) }),
  contextStops: () => record(queueOf('dm', 2, [{ n: 1, kind: 'reply', s: 10 }, { n: 2, kind: 'reply', s: 40 }], 15), { changed: () => ['>>> BEHIND: twitter xActs is still catching up, so nothing was sent'] }),
  networkDrop: () => record(queueOf('reply', 2, [{ n: 1, kind: 'reply', s: 10 }, { n: 2, kind: 'reply', s: 400 }], 15), { answer: (c, i, k) => (c === 1 ? drop : ok(i, k)) }),
  dropsTooOften: () => record(queueOf('reply', 2, [{ n: 1, kind: 'reply', s: 10 }, { n: 2, kind: 'reply', s: 40 }], 15), { answer: () => drop }),
  goneAndTooBig: () => record(queueOf('reply', 3, [{ n: 1, kind: 'reply', s: 10 }, { n: 1, kind: 'like', s: 25 }, { n: 2, kind: 'reply', s: 40 }, { n: 3, kind: 'reply', s: 60 }], 15), { answer: (c, i, k) => (c === 1 ? refused('TweetGone', 'gone', '(385) deleted') : c === 2 ? refused('authorTooBig', 'tooBig', '@fakeFinch has 9000 followers, over 1500') : ok(i, k)) }),
  likeNotSent: () => record(queueOf('reply', 1, [{ n: 1, kind: 'like', s: 10 }, { n: 1, kind: 'reply', s: 30 }], 15)),
  fellBehind: () => record(queueOf('reply', 2, [{ n: 1, kind: 'reply', s: -700 }, { n: 2, kind: 'reply', s: 30 }], 15)),
  notReady: () => record(queueOf('reply', 2, [{ n: 1, kind: 'reply', s: 10 }, { n: 2, kind: 'reply', s: 30 }], 15, { 2: 'held' })),
  itemMissing: () => record(queueOf('reply', 1, [{ n: 1, kind: 'reply', s: 10 }, { n: 9, kind: 'reply', s: 30 }], 15)),
  notApproved: () => {
    const queue = queueOf('reply', 1, [{ n: 1, kind: 'reply', s: 10 }], 15)
    queue.items[0].text = 'changed after approval'
    return record(queue)
  },
  noPlan: () => {
    const queue = queueOf('reply', 1, [], 15)
    delete queue.randomRun
    return record(queue)
  },
  emptyPlan: () => record(queueOf('reply', 1, [{ n: 1, kind: 'reply', s: 10, done: 5 }], 15, { 1: 'sent' })),
}

describe('the queue run, recorded: what is sent, when, what is logged and saved', () => {
  for (const [name, scenario] of Object.entries(SCENARIOS)) {
    test(name, async () => {
      const got = await scenario()
      expect(EXPECTED[name]).toBeDefined()
      expect(JSON.parse(JSON.stringify(got))).toEqual(EXPECTED[name] as never)
    })
  }
})
