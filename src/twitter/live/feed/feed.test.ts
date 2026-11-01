import { describe, expect, test } from 'bun:test'
import { appendFileSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { newQueueEvents } from '../../queue/events/index'
import { newLiveEvents, xLiveContext } from './index'

const badge = (n: number) => JSON.stringify({ seenAt: '2026-11-01T20:12:16Z', type: 'badge', dm_unread_count: 0, ntab_unread_count: n, xchat_unread_count: 0, total_unread_count: n })
const reply = JSON.stringify({ seenAt: '2026-11-01T20:14:20Z', type: 'notification', key: 'reply:9', kind: 'reply', at: '2026-11-01T20:14:00Z', userId: '7', handle: 'sam', postText: 'yc deadline is tomorrow', text: 'this is sick' })

describe("X's live client state in the agent context, per Claude session (rule 115)", () => {
  test('a new session sees the current count, then only what is new for it', () => {
    const root = mkdtempSync(join(tmpdir(), 'xlive'))
    mkdirSync(join(root, 'acct'))
    const file = join(root, 'acct', 'live.jsonl')
    writeFileSync(file, badge(0) + '\n')
    const first = newLiveEvents(root, 'one')
    expect(first[0]!.events).toEqual([])
    expect(xLiveContext(first)).toContain('0 notifications, 0 DMs and 0 X Chat unread')
    appendFileSync(file, badge(1) + '\n' + reply + '\n')
    const text = xLiveContext(newLiveEvents(root, 'one'))!
    expect(text).toContain('@sam: 2026-11-01T20:14:00Z they replied to your post ("yc deadline is tomorrow"): "this is sick"')
    expect(text).toContain('tell matt now, first thing in your reply')
    expect(text).toContain('answer when it fits')
    appendFileSync(file, badge(0) + '\n')
    expect(xLiveContext(newLiveEvents(root, 'one'))).toBeNull()
    expect(xLiveContext([], { sessionStart: true })).toContain('start a Monitor now')
    const other = newLiveEvents(root, 'two')
    expect(other[0]!.latest?.ntab_unread_count).toBe(0)
  })

  test("two Claude sessions each get the queue's events once", () => {
    const root = mkdtempSync(join(tmpdir(), 'queues'))
    const log = join(root, 'q.log')
    writeFileSync(log, '')
    newQueueEvents(root, 'a')
    newQueueEvents(root, 'b')
    appendFileSync(log, '2026-11-01 19:52:08 HELD #31 @x: something happened\n')
    expect(newQueueEvents(root, 'a').map((e) => e.kind)).toEqual(['held'])
    expect(newQueueEvents(root, 'b').map((e) => e.kind)).toEqual(['held'])
    expect(newQueueEvents(root, 'a')).toEqual([])
  })
})
