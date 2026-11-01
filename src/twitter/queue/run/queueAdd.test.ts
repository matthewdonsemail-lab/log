import { describe, expect, test } from 'bun:test'
import { addToQueue, approveQueue, buildQueue, fitTimes, seededRandom } from '../plan/index'
import type { Queue, QueueAddition } from '../plan/index'
import { runQueue } from './index'
import type { RunDeps } from './types'

const START = Date.parse('2026-11-01T16:00:00Z')

function dmQueue(): Queue {
  const queue = buildQueue({ account: 'matthewsoldit', action: 'dm', targets: [{ handle: 'a', userId: '1', text: 'yo a' }, { handle: 'b', userId: '2', text: 'yo b' }], lines: [], sources: [], seed: 1, now: new Date(START) })
  queue.randomRun = { planned: new Date(START).toISOString(), window: '1h', minGap: 300, events: [{ n: 1, kind: 'reply', at: new Date(START + 600_000).toISOString() }, { n: 2, kind: 'reply', at: new Date(START + 1_800_000).toISOString() }] }
  return approveQueue(queue, 'matt', new Date(START))
}

const replies: QueueAddition = { action: 'reply', targets: [{ handle: 'c', tweetUrl: 'https://x.com/c/status/3', text: 'nice one' }, { handle: 'd', tweetUrl: 'https://x.com/d/status/4', text: 'class' }], approvedBy: 'matt', window: '1h', at: new Date(START).toISOString() }

describe('one queue per account: what is added is fitted into the same plan', () => {
  test('added items are kept apart from everything planned by at least the gap', () => {
    const times = fitTimes([1000, 1600], 3, 900, 3600, 300, seededRandom(4))
    const all = [1000, 1600, ...times]
    for (const t of times) for (const o of all) if (o !== t) expect(Math.abs(o - t)).toBeGreaterThanOrEqual(300)
  })

  test('replies added to a dm queue keep their own action, get the next numbers and are approved with it', () => {
    const queue = dmQueue()
    const events = addToQueue(queue, replies, seededRandom(7), new Date(START))
    expect(events.map((e) => e.n)).toEqual(expect.arrayContaining([3, 4]))
    expect(queue.items.map((i) => i.action)).toEqual(['dm', 'dm', 'reply', 'reply'])
    expect(queue.approval?.by).toBe('matt')
    const planned = queue.randomRun!.events.map((e) => Date.parse(e.at) / 1000)
    for (const t of planned) for (const o of planned) if (o !== t) expect(Math.abs(o - t)).toBeGreaterThanOrEqual(300)
  })

  test('adding the same item twice adds it once', () => {
    const queue = dmQueue()
    addToQueue(queue, replies, seededRandom(1), new Date(START))
    expect(addToQueue(queue, replies, seededRandom(2), new Date(START))).toEqual([])
    expect(queue.items).toHaveLength(4)
  })
})

function fakeDeps(queue: Queue, additions: QueueAddition[][], keepOpen = false): { deps: RunDeps; sent: string[]; clock: { now: number } } {
  const clock = { now: START }
  const sent: string[] = []
  const deps: RunDeps = {
    send: async (item) => {
      sent.push(`${item.action}:${item.handle}`)
      return { ok: true, event: 'sent', tweetId: item.action === 'dm' ? undefined : '9', conversationId: item.action === 'dm' ? 'c' : undefined }
    },
    nowMs: () => clock.now,
    sleep: async (ms) => {
      clock.now += ms
    },
    rng: seededRandom(3),
    log: () => {},
    alert: () => {},
    takeNudge: () => 0,
    takeAdded: () => {
      const next = additions.shift()
      return next ? next.flatMap((a) => addToQueue(queue, a, seededRandom(5), new Date(clock.now))) : []
    },
    save: () => {},
    keepOpen,
    cancelled: () => keepOpen && sent.length >= 4,
  }
  return { deps, sent, clock }
}

describe('a running queue takes in what is added and sends it all through one run', () => {
  test('replies added while the run waits are sent in the same run as the dms', async () => {
    const queue = dmQueue()
    const { deps, sent } = fakeDeps(queue, [[replies]])
    const result = await runQueue(queue, deps)
    expect(result.state).toBe('finished')
    expect(sent.sort()).toEqual(['dm:a', 'dm:b', 'reply:c', 'reply:d'])
  })

  test('kept open, a run that has sent everything waits for more instead of ending', async () => {
    const queue = dmQueue()
    const { deps, sent } = fakeDeps(queue, [[], [], [], [replies]], true)
    await runQueue(queue, deps)
    expect(sent.filter((s) => s.startsWith('reply'))).toHaveLength(2)
  })

  test('an added item due before the one being waited on goes first', async () => {
    const queue = dmQueue()
    const early: QueueAddition = { action: 'reply', targets: [{ handle: 'e', tweetUrl: 'https://x.com/e/status/5', text: 'first' }], approvedBy: 'matt', window: '4m', minGap: 30, at: new Date(START).toISOString() }
    const { deps, sent } = fakeDeps(queue, [[early]])
    await runQueue(queue, deps)
    expect(sent[0]).toBe('reply:e')
  })
})

