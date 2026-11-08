import { homedir } from 'node:os'
import { join } from 'node:path'
import { SHARED_SESSION } from '../../../agentHooks/sessionOffsets/index'
import { readCursor, writeCursor } from '../../../inbox/store/index'
import { importQueueFiles, latestQueueLogSeq, queueLabel, queueLogAfter } from '../store/index'
import { QUEUE_EVENT_PATTERNS } from './types'
import type { QueueEvent } from './types'

export function queuesRoot(): string {
  return process.env.LOG_QUEUES_DIR || join(homedir(), '.logCli', 'queues')
}

export function eventOf(queue: string, line: string): QueueEvent | null {
  const at = line.slice(0, 19)
  for (const [kind, pattern] of QUEUE_EVENT_PATTERNS) if (pattern.test(line)) return { queue, at, kind, line: line.slice(20).trim() }
  return null
}

export const queueReader = (session: string) => `queue:${session}`

export function newQueueEvents(root = queuesRoot(), session: string = SHARED_SESSION): QueueEvent[] {
  importQueueFiles(root)
  const reader = queueReader(session)
  const cursor = readCursor(reader)
  const last = latestQueueLogSeq()
  writeCursor(reader, last)
  if (cursor === null) return []
  const events: QueueEvent[] = []
  for (const row of queueLogAfter(cursor)) {
    const event = eventOf(queueLabel(row.name), `${row.at} ${row.line}`)
    if (event) events.push(event)
  }
  return events
}

export function queueContext(events: readonly QueueEvent[]): string | null {
  if (!events.length) return null
  const held = events.filter((e) => e.kind === 'held')
  const refused = events.filter((e) => e.kind === 'refused')
  const trouble = events.filter((e) => e.kind === 'stopped' || e.kind === 'fellBehind')
  const lines = [`>>> QUEUE (${events.length} new): what the account's queue did since the last look. Tell matt in plain words.`]
  if (refused.length) lines.push(`  >>> QUEUE STOPPED: A SEND WAS REFUSED (${refused.length}). The run stopped at the answer and the item stays pending, nothing was sent. Nothing goes out on that account until matt says so (rule 94): tell him X's answer (the code and its message, in the line) and the time, and never start the run again yourself.`)
  if (held.length) lines.push(`  ${held.length} HELD: something happened with that person since the draft, so it wasn't sent. For each: read them again (\`twitterDms\` { with }), redraft from what changed, gate it (\`voice\`), stop the run (\`jobCancel\`), put it back (\`twitterQueueEdit\`) and run it again (rule 109).`)
  if (trouble.length) lines.push(`  ${trouble.length} STOPPED: the run ended, the line says why. Nothing more goes out on that account until matt says so (rule 94); tell him what stopped it and the time.`)
  for (const e of events) lines.push(`  ${e.at} UTC ${e.queue} ${e.kind}: ${e.line.slice(0, 260)}`)
  return lines.join('\n')
}
