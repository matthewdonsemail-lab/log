import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { basename, join } from 'node:path'
import { readSessionOffsets, SHARED_SESSION, writeSessionOffsets } from '../../../agentHooks/sessionOffsets/index'
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

export function newQueueEvents(root = queuesRoot(), session: string = SHARED_SESSION): QueueEvent[] {
  if (!existsSync(root)) return []
  const { offsets, firstLook } = readSessionOffsets(root, session)
  const events: QueueEvent[] = []
  for (const file of readdirSync(root).filter((f) => f.endsWith('.log'))) {
    const path = join(root, file)
    const size = statSync(path).size
    const from = offsets[file] ?? (firstLook ? size : 0)
    if (size > from) {
      const text = readFileSync(path, 'utf8').slice(from)
      for (const line of text.split('\n')) {
        const event = eventOf(basename(file, '.log'), line)
        if (event) events.push(event)
      }
    }
    offsets[file] = size
  }
  writeSessionOffsets(root, session, offsets)
  return events
}

export function queueContext(events: readonly QueueEvent[]): string | null {
  if (!events.length) return null
  const held = events.filter((e) => e.kind === 'held')
  const trouble = events.filter((e) => e.kind === 'cooling' || e.kind === 'stopped' || e.kind === 'fellBehind')
  const lines = [`>>> QUEUE (${events.length} new): what the account's queue did since the last look. Tell matt in plain words.`]
  if (held.length) lines.push(`  ${held.length} HELD: something happened with that person since the draft, so it wasn't sent. For each: read them again (\`twitterDms\` { with }), redraft from what changed, gate it (\`voice\`), stop the run (\`jobCancel\`), put it back (\`twitterQueueEdit\`) and run it again (rule 109).`)
  if (trouble.length) lines.push(`  ${trouble.length} STOP OR COOL-OFF: X's own answer is in the line. Nothing more goes out on that account until matt says so (rule 94); tell him the answer and the time.`)
  for (const e of events) lines.push(`  ${e.at} UTC ${e.queue} ${e.kind}: ${e.line.slice(0, 260)}`)
  return lines.join('\n')
}
