import type { Database } from 'bun:sqlite'
import { MESSAGE_TYPES } from '../../platform/types'
import { messageKeyOf, messageTimeOf, msOf, platformMessageIdOf } from '../../platform/helpers/time'

export const BACKFILL_BATCH = 1000

export interface BackfillStep {
  name: string
  run(handle: Database, limit: number): number
}

function batch(handle: Database, work: () => number): number {
  handle.exec('BEGIN IMMEDIATE')
  try {
    const done = work()
    handle.exec('COMMIT')
    return done
  } catch (error) {
    handle.exec('ROLLBACK')
    throw error
  }
}

function payloadOf(text: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(text) as unknown
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

export const BACKFILL_STEPS: readonly BackfillStep[] = [
  {
    name: 'messageTimes',
    run(handle, limit) {
      const rows = handle.prepare('SELECT seq, sentAt, receivedAt FROM messages WHERE sentAtMs IS NULL LIMIT ?').all(limit) as { seq: number; sentAt: string; receivedAt: string }[]
      const update = handle.prepare('UPDATE messages SET sentAtMs = ?, timeSource = ?, receivedAtMs = ? WHERE seq = ?')
      for (const row of rows) {
        const time = messageTimeOf(row.sentAt, row.receivedAt, 0)
        update.run(time.sentAtMs, time.timeSource, msOf(row.receivedAt) ?? 0, row.seq)
      }
      return rows.length
    },
  },
  {
    name: 'interactionTimes',
    run(handle, limit) {
      const rows = handle.prepare('SELECT seq, at FROM interactions WHERE atMs IS NULL LIMIT ?').all(limit) as { seq: number; at: string }[]
      const update = handle.prepare('UPDATE interactions SET atMs = ? WHERE seq = ?')
      for (const row of rows) update.run(msOf(row.at) ?? 0, row.seq)
      return rows.length
    },
  },
  {
    name: 'ledgerTimes',
    run(handle, limit) {
      const rows = handle.prepare('SELECT seq, at FROM ledger WHERE atMs IS NULL LIMIT ?').all(limit) as { seq: number; at: string }[]
      const update = handle.prepare('UPDATE ledger SET atMs = ? WHERE seq = ?')
      for (const row of rows) update.run(msOf(row.at) ?? 0, row.seq)
      return rows.length
    },
  },
  {
    name: 'chatTimes',
    run(handle, limit) {
      const rows = handle.prepare('SELECT chatId FROM chats WHERE lastMessageAtMs IS NULL LIMIT ?').all(limit) as { chatId: string }[]
      const update = handle.prepare('UPDATE chats SET lastMessageAtMs = COALESCE((SELECT MAX(sentAtMs) FROM messages WHERE messages.chatId = chats.chatId), 0) WHERE chatId = ?')
      for (const row of rows) update.run(row.chatId)
      return rows.length
    },
  },
  {
    name: 'eventTimesAndKeys',
    run(handle, limit) {
      const rows = handle.prepare('SELECT seq, platform, account, conversationId, type, payload, sourceAt, receivedAt FROM events WHERE receivedAtMs IS NULL LIMIT ?').all(limit) as { seq: number; platform: string; account: string; conversationId: string; type: string; payload: string; sourceAt: string; receivedAt: string }[]
      const times = handle.prepare('UPDATE events SET sourceAtMs = ?, receivedAtMs = ? WHERE seq = ?')
      const key = handle.prepare('UPDATE OR IGNORE events SET messageKey = ? WHERE seq = ? AND NOT EXISTS (SELECT 1 FROM events WHERE messageKey = ?)')
      for (const row of rows) {
        times.run(msOf(row.sourceAt), msOf(row.receivedAt) ?? 0, row.seq)
        if (!MESSAGE_TYPES.includes(row.type)) continue
        const messageKey = messageKeyOf(row.platform, row.account, row.conversationId, platformMessageIdOf(payloadOf(row.payload)))
        if (messageKey) key.run(messageKey, row.seq, messageKey)
      }
      return rows.length
    },
  },
]

export function runBackfill(handle: Database, steps: readonly BackfillStep[] = BACKFILL_STEPS, size = BACKFILL_BATCH): Record<string, number> {
  const done: Record<string, number> = {}
  for (const step of steps) {
    let total = 0
    for (;;) {
      const n = batch(handle, () => step.run(handle, size))
      total += n
      if (n < size) break
    }
    done[step.name] = total
  }
  return done
}
