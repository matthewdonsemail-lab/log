import { describe, expect, test } from 'bun:test'
import { appendFileSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { newQueueEvents, queueContext } from './index'

describe('the queue in the agent context (rule 114)', () => {
  test('only what happened since the last look reaches the agent, a held item and a refusal said loudly', () => {
    const root = mkdtempSync(join(tmpdir(), 'queues'))
    const log = join(root, 'acct.log')
    writeFileSync(log, '2026-11-01 19:00:00 SENT #1 @old dm 1-2\n')
    expect(newQueueEvents(root)).toEqual([])
    appendFileSync(log, '2026-11-01 19:52:08 HELD #31 @jamesfuller_dev: something happened\n2026-11-01 19:52:08 [waiting] next reply #25 @wolfie_\n2026-11-01 19:58:20 STOPPED: REFUSED reply #25 @wolfie_: x answered at 2026-11-01 19:58:20 UTC: CouldNotTweet: (226) looks automated. The run stopped here\n2026-11-01 20:10:00 [retrying] reply #26 @sam: the connection dropped with no answer from x\n')
    const events = newQueueEvents(root)
    expect(events.map((e) => e.kind)).toEqual(['held', 'refused', 'networkDrop'])
    const text = queueContext(events)!
    expect(text).toContain('1 HELD')
    expect(text).toContain('QUEUE STOPPED: A SEND WAS REFUSED')
    expect(text).toContain('Nothing goes out on that account until matt says so')
    expect(text).not.toMatch(/cool/i)
    expect(newQueueEvents(root)).toEqual([])
  })
})
