import { describe, expect, test } from 'bun:test'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { newQueueEvents, queueContext } from './index'
import { loadQueue, queueLog } from '../plan/index'
import { queueLogLines } from '../store/index'

describe('the queue in the agent context (rule 114)', () => {
  test('only what happened since the last look reaches the agent, a held item and a refusal said loudly', () => {
    const root = mkdtempSync(join(tmpdir(), 'queues'))
    const queue = join(root, 'acct.json')
    const session = `look${Date.now()}`
    queueLog(queue, 'SENT #1 @old dm 1-2', new Date('2026-11-01T19:00:00Z'))
    expect(newQueueEvents(root, session)).toEqual([])
    const at = new Date('2026-11-01T19:52:08Z')
    queueLog(queue, 'HELD #31 @jamesfuller_dev: something happened', at)
    queueLog(queue, '[waiting] next reply #25 @wolfie_', at)
    queueLog(queue, 'STOPPED: REFUSED reply #25 @wolfie_: x answered at 2026-11-01 19:58:20 UTC: CouldNotTweet: (226) looks automated. The run stopped here', new Date('2026-11-01T19:58:20Z'))
    queueLog(queue, '[retrying] reply #26 @sam: the connection dropped with no answer from x', new Date('2026-11-01T20:10:00Z'))
    const events = newQueueEvents(root, session)
    expect(events.map((e) => e.kind)).toEqual(['held', 'refused', 'networkDrop'])
    expect(events[0].queue).toBe('acct')
    const text = queueContext(events)!
    expect(text).toContain('1 HELD')
    expect(text).toContain('QUEUE STOPPED: A SEND WAS REFUSED')
    expect(text).toContain('Nothing goes out on that account until matt says so')
    expect(text).not.toMatch(/cool/i)
    expect(newQueueEvents(root, session)).toEqual([])
  })

  test('an old queue file and its log are imported once, so the hook still sees what it logged before', () => {
    const root = mkdtempSync(join(tmpdir(), 'queuesOld'))
    writeFileSync(join(root, 'old.json'), JSON.stringify({ account: 'acct', items: [] }))
    writeFileSync(join(root, 'old.log'), '2026-11-01 19:00:00 SENT #1 @old dm 1-2\n')
    newQueueEvents(root, `old${Date.now()}`)
    expect(queueLogLines(join(root, 'old.json'))).toEqual(['2026-11-01 19:00:00 SENT #1 @old dm 1-2'])
    expect(loadQueue(join(root, 'old.json')).account).toBe('acct')
  })
})
