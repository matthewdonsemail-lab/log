import { describe, expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { newQueueEvents } from '../../queue/events/index'
import { queueLog } from '../../queue/plan/index'
import { importLiveFiles, liveEventId, newLiveEvents, xLiveContext } from './index'
import { appendEvent } from '../../../inbox/store/index'

const badge = (n: number) => JSON.stringify({ seenAt: '2026-11-01T20:12:16Z', type: 'badge', dm_unread_count: 0, ntab_unread_count: n, xchat_unread_count: 0, total_unread_count: n })
const reply = JSON.stringify({ seenAt: '2026-11-01T20:14:20Z', type: 'notification', key: 'reply:9', kind: 'reply', at: '2026-11-01T20:14:00Z', userId: '7', handle: 'sam', postText: 'yc deadline is tomorrow', text: 'this is sick' })

describe("X's live client state in the agent context, per Claude session (rule 115)", () => {
  test('the old live.jsonl is imported once, then a new session sees the current count and only what is new for it', () => {
    const root = mkdtempSync(join(tmpdir(), 'xlive'))
    const account = `acct${Date.now()}`
    mkdirSync(join(root, account))
    writeFileSync(join(root, account, 'live.jsonl'), badge(0) + '\n')
    const first = newLiveEvents(root, `one${account}`).find((a) => a.account === account)!
    expect(first.events).toEqual([])
    expect(xLiveContext([first])).toContain('0 notifications, 0 DMs and 0 X Chat unread')
    expect(importLiveFiles(root)).toEqual([])
    const push = (line: string) => {
      const event = JSON.parse(line) as Record<string, unknown>
      const { seenAt, ...rest } = event
      appendEvent({ platform: 'twitter', account, type: String(rest.type), with: String(rest.handle ?? ''), payload: rest, receivedAt: String(seenAt), eventId: liveEventId(account, event) })
    }
    push(badge(1))
    push(reply)
    const text = xLiveContext(newLiveEvents(root, `one${account}`))!
    expect(text).toContain('@sam: 2026-11-01T20:14:00Z they replied to your post ("yc deadline is tomorrow"): "this is sick"')
    expect(text).toContain('tell matt now, first thing in your reply')
    expect(text).toContain('answer when it fits')
    push(badge(0).replace('20:12:16', '20:15:00'))
    expect(xLiveContext(newLiveEvents(root, `one${account}`))).toBeNull()
    expect(xLiveContext([], { sessionStart: true })).toContain('start a Monitor now')
    const other = newLiveEvents(root, `two${account}`).find((a) => a.account === account)!
    expect(other.latest?.ntab_unread_count).toBe(0)
  })

  test('an imported line and the same event from the owner stream are one event', () => {
    const root = mkdtempSync(join(tmpdir(), 'xliveDup'))
    const account = `dup${Date.now()}`
    mkdirSync(join(root, account))
    writeFileSync(join(root, account, 'live.jsonl'), reply + '\n')
    const event = JSON.parse(reply) as Record<string, unknown>
    const { seenAt, ...rest } = event
    appendEvent({ platform: 'twitter', account, type: 'notification', with: 'sam', payload: rest, receivedAt: String(seenAt), eventId: liveEventId(account, event) })
    expect(importLiveFiles(root)).toEqual([{ account, lines: 1, added: 0 }])
  })

  test('a dropped connection reads as a network error, a 429 as X refusing', () => {
    const at = '2026-11-02T03:00:47Z'
    const dropped = xLiveContext([{ account: 'acct', latest: null, firstLook: false, events: [{ type: 'pollRefused', seenAt: at, error: 'Failed to perform, curl: (35) Recv failure: Connection was reset.' }] }])!
    expect(dropped).toContain('a network error, not X refusing; the poll goes on')
    expect(dropped).not.toContain('nothing resumes until he says')
    const refused = xLiveContext([{ account: 'acct', latest: null, firstLook: false, events: [{ type: 'pollRefused', seenAt: at, error: 'status: 429, message: "Rate limit exceeded"' }] }])!
    expect(refused).toContain('X refused the live read')
    expect(refused).toContain('nothing resumes until he says')
  })

  test("two Claude sessions each get the queue's events once", () => {
    const root = mkdtempSync(join(tmpdir(), 'queues'))
    const queue = join(root, 'q.json')
    const a = `a${Date.now()}`
    const b = `b${Date.now()}`
    newQueueEvents(root, a)
    newQueueEvents(root, b)
    queueLog(queue, 'HELD #31 @x: something happened', new Date('2026-11-01T19:52:08Z'))
    expect(newQueueEvents(root, a).map((e) => e.kind)).toEqual(['held'])
    expect(newQueueEvents(root, b).map((e) => e.kind)).toEqual(['held'])
    expect(newQueueEvents(root, a)).toEqual([])
  })
})
