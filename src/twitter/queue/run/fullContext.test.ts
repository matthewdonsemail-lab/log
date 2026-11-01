import { describe, expect, test } from 'bun:test'
import { approveQueue, buildQueue, editItem, seededRandom } from '../plan/index'
import type { Queue } from '../plan/index'
import { runQueue } from './index'
import type { RunDeps } from './types'
import { activityOf, contextChangesSince } from '../../dm/person/index'
import type { TwitterNotification } from '../../notification/feed/index'

const START = Date.parse('2026-11-01T16:00:00Z')

function queueOf(): Queue {
  const queue = buildQueue({ account: 'matthewsoldit', action: 'dm', targets: [{ handle: 'mitchell', userId: '1', text: 'yo mitchell made a new free tool' }, { handle: 'gabe', userId: '2', text: 'yo gabe made a new free tool' }], lines: [], sources: [], seed: 1, now: new Date(START) })
  queue.randomRun = { planned: new Date(START).toISOString(), window: '1h', minGap: 300, events: [{ n: 1, kind: 'reply', at: new Date(START + 600_000).toISOString() }, { n: 2, kind: 'reply', at: new Date(START + 1_200_000).toISOString() }] }
  return approveQueue(queue, 'matt', new Date(START))
}

const row = (kind: TwitterNotification['kind'], userId: string, handle: string, at: string, text?: string): TwitterNotification => ({ key: `${kind}:${userId}:${at}`, kind, at, userId, handle, postText: 'yc deadline is tomorrow', ...(text ? { text } : {}) })

describe('full context before every send (rule 109)', () => {
  test('a person who retweeted since the draft is held, not sent, and says why', async () => {
    const queue = queueOf()
    const sent: string[] = []
    const alerts: string[] = []
    let clock = START
    const deps: RunDeps = {
      send: async (item) => (sent.push(item.handle ?? '?'), { ok: true, event: 'sent', conversationId: 'c' }),
      contextChanged: async (item) => (item.handle === 'mitchell' ? ['2026-11-01T16:07:00Z they retweeted your post'] : []),
      nowMs: () => clock,
      sleep: async (ms) => {
        clock += ms
      },
      rng: seededRandom(3),
      log: () => {},
      alert: (message) => alerts.push(message),
      takeNudge: () => 0,
      save: () => {},
    }
    await runQueue(queue, deps)
    expect(sent).toEqual(['gabe'])
    expect(queue.items[0].status).toBe('held')
    expect(queue.items[0].heldFor).toEqual(['2026-11-01T16:07:00Z they retweeted your post'])
    expect(alerts.join(' ')).toContain('HELD #1 @mitchell')
  })

  test('a held item gets new copy through edit, is planned again inside its window and approved', () => {
    const queue = queueOf()
    queue.items[0].status = 'held'
    queue.randomRun!.events[0].skipped = 'held'
    const now = new Date(START + 900_000)
    const event = editItem(queue, 1, 'cheers for the retweet lad', 'matt', seededRandom(2), now, '30m')
    expect(queue.items[0]).toMatchObject({ status: 'pending', text: 'cheers for the retweet lad', draftedAt: now.toISOString() })
    expect(Date.parse(event!.at)).toBeLessThanOrEqual(now.getTime() + 30 * 60_000 + 30_000)
    expect(queue.approval?.at).toBe(now.toISOString())
  })

  test('a sent item can never be edited', () => {
    const queue = queueOf()
    queue.items[0].status = 'sent'
    expect(() => editItem(queue, 1, 'new', 'matt', seededRandom(1), new Date(START))).toThrow('only a pending or held item')
  })

  test('what changed counts a message either way and anything they did on the posts after the draft, nothing before', () => {
    const rows = [row('like', '1', 'Mitchell', '2026-11-01T15:00:00Z'), row('repost', '1', 'mitchell', '2026-11-01T16:07:00Z'), row('reply', '1', 'mitchell', '2026-11-01T16:08:00Z', "You're way too cool bro"), row('like', '2', 'gabe', '2026-11-01T16:09:00Z')]
    const mine = activityOf(rows, { handle: '@mitchell' })
    expect(mine.map((r) => r.kind)).toEqual(['reply', 'repost', 'like'])
    const changed = contextChangesSince([{ id: 'a', conversationId: 'c', senderId: 'me', text: 'sent from my phone', time: '2026-11-01T16:05:00Z', fromMe: true }, { id: 'b', conversationId: 'c', senderId: '1', text: 'old', time: '2026-11-01T10:00:00Z' }], mine, '2026-11-01T16:00:00Z')
    expect(changed).toHaveLength(3)
    expect(changed[0]).toContain('you messaged them outside this draft: "sent from my phone"')
    expect(changed.join(' ')).toContain('they retweeted your post')
    expect(changed.join(' ')).toContain("they replied to your post (\"yc deadline is tomorrow\"): \"You're way too cool bro\"")
  })
})
