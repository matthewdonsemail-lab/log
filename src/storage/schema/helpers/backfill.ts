import type { Database } from 'bun:sqlite'
import { MESSAGE_TYPES } from '../../platform/types'
import { messageKeyOf, messageTimeOf, msOf, platformMessageIdOf } from '../../platform/helpers/time'
import { chatIdOf } from '../../platform/helpers/ids'
import { accountIdentifiedEvent, conversationSeenEvent, identityLearnedEvent, messageEditedEvent } from '../../platform/helpers/derivedEvents'
import { contextOn, eventInputOf, insertEventRow, typedRowsOf, writeTypedRows } from '../../platform/client'

export const BACKFILL_BATCH = 1000

export interface BackfillStep {
  name: string
  once?: boolean
  run(handle: Database, limit: number, tried: Set<string>): number
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
      const rows = handle.prepare('SELECT seq, platform, account, conversationId, type, payload, sourceAt, receivedAt FROM events WHERE receivedAtMs IS NULL ORDER BY seq LIMIT ?').all(limit) as { seq: number; platform: string; account: string; conversationId: string; type: string; payload: string; sourceAt: string; receivedAt: string }[]
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
  {
    name: 'eventOwners',
    run(handle, limit) {
      const rows = handle.prepare("SELECT seq, platform, account FROM events WHERE typedAt IS NULL AND ownerId IS NULL AND platform = 'twitter' ORDER BY seq LIMIT ?").all(limit) as { seq: number; platform: string; account: string }[]
      const context = contextOn(handle)
      const update = handle.prepare('UPDATE events SET ownerId = ? WHERE seq = ?')
      let set = 0
      for (const row of rows) {
        const owner = context.ownerIdOf(row.platform, row.account)
        if (owner) {
          update.run(owner, row.seq)
          set++
        }
      }
      return set
    },
  },
  {
    name: 'untypedEvents',
    run(handle, limit) {
      const rows = handle.prepare('SELECT seq, eventId, platform, account, conversationId, type, withWho, text, box, payload, sourceAt, receivedAt, source, rawHash, ownerId FROM events WHERE typedAt IS NULL ORDER BY seq LIMIT ?').all(limit) as (Parameters<typeof eventInputOf>[0] & { seq: number })[]
      const context = contextOn(handle)
      const mark = handle.prepare('UPDATE events SET typedAt = ? WHERE seq = ?')
      const now = Date.now()
      for (const row of rows) {
        const event = eventInputOf(row, handle)
        writeTypedRows(handle, event, typedRowsOf(event, context))
        mark.run(now, row.seq)
      }
      return rows.length
    },
  },
  {
    name: 'eventsForTypedRows',
    once: true,
    run(handle, limit, tried) {
      const produced = producedKeys(handle)
      const rows = (handle.prepare('SELECT m.messageKey, m.chatId, m.platformMessageId, m.senderUserId, m.senderLabel, m.fromOwner, m.sentAt, m.text, m.receivedAt, c.platform, c.account, c.conversationId, c.kind, c.name, c.box FROM messages m JOIN chats c ON c.chatId = m.chatId ORDER BY m.seq').all() as OrphanRow[]).filter((r) => !produced.has(r.messageKey) && !tried.has(r.messageKey)).slice(0, limit)
      const files = handle.prepare('SELECT name, contentType, durationMs FROM attachments WHERE messageKey = ? ORDER BY n')
      for (const r of rows) {
        tried.add(r.messageKey)
        if (!r.messageKey.startsWith(`${r.chatId}:`)) continue
        const id = r.messageKey.slice(r.chatId.length + 1)
        const attachments = (files.all(r.messageKey) as { name: string | null; contentType: string | null; durationMs: number | null }[]).map((a) => ({ name: a.name, type: a.contentType, ...(a.durationMs !== null ? { durationMs: a.durationMs } : {}) }))
        insertEventRow(handle, { platform: r.platform, account: r.account, conversationId: r.conversationId, type: r.fromOwner ? 'ownMessage' : 'message', with: r.fromOwner ? 'me' : r.senderLabel ?? '', text: r.text, box: r.box ?? '', payload: { id, senderId: r.senderUserId, fromMe: r.fromOwner === 1, ...(attachments.length ? { attachments } : {}), ...(r.kind === 'group' && r.name ? { title: r.name } : {}) }, sourceAt: r.sentAt, receivedAt: r.receivedAt, source: 'import', ...(r.fromOwner ? { ownerId: r.senderUserId } : {}) })
      }
      return rows.length
    },
  },
  {
    name: 'editsForChangedText',
    once: true,
    run(handle, limit, tried) {
      const texts = producedTexts(handle)
      const rows = (handle.prepare('SELECT m.messageKey, m.text, m.receivedAt, c.platform, c.account, c.conversationId FROM messages m JOIN chats c ON c.chatId = m.chatId').all() as { messageKey: string; text: string; receivedAt: string; platform: string; account: string; conversationId: string }[]).filter((r) => texts.has(r.messageKey) && texts.get(r.messageKey) !== r.text && !tried.has(r.messageKey)).slice(0, limit)
      for (const r of rows) {
        tried.add(r.messageKey)
        insertEventRow(handle, messageEditedEvent(r, r.messageKey, r.text, r.receivedAt))
      }
      return rows.length
    },
  },
  {
    name: 'conversationsSeen',
    once: true,
    run(handle, limit) {
      const rows = handle.prepare("SELECT c.chatId, c.platform, c.account, c.conversationId, c.box, c.backfilledAt FROM chats c WHERE c.box IS NOT NULL AND c.backfilledAt IS NOT NULL AND NOT EXISTS (SELECT 1 FROM events e WHERE e.type = 'conversationSeen' AND e.platform = c.platform AND e.account = c.account AND e.conversationId = c.conversationId) LIMIT ?").all(limit) as { chatId: string; platform: string; account: string; conversationId: string; box: string; backfilledAt: string }[]
      const members = handle.prepare('SELECT COALESCE(i.handle, m.userId) AS label FROM memberships m LEFT JOIN identities i ON i.platform = m.platform AND i.userId = m.userId WHERE m.roomId = ? AND m.position IS NOT NULL ORDER BY m.position')
      for (const r of rows) insertEventRow(handle, conversationSeenEvent(r, r.box, (members.all(r.chatId) as { label: string }[]).map((m) => m.label), r.backfilledAt, 'import'))
      return rows.length
    },
  },
  {
    name: 'peopleToAliases',
    once: true,
    run(handle, limit, tried) {
      const hasPeople = handle.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'people'").get()
      if (!hasPeople) return 0
      const rows = (handle.prepare('SELECT platform, account, userId, handle, name, seenAt FROM people ORDER BY seenAt').all() as { platform: string; account: string; userId: string; handle: string; name: string | null; seenAt: string }[]).filter((r) => !tried.has(`${r.platform}:${r.account}:${r.userId}`)).slice(0, limit)
      for (const r of rows) {
        tried.add(`${r.platform}:${r.account}:${r.userId}`)
        if (r.handle && r.userId) insertEventRow(handle, identityLearnedEvent(r.platform, r.account, r.userId, r.handle, r.name, r.seenAt, 'import'))
      }
      return rows.length
    },
  },
  {
    name: 'ownersToAccounts',
    once: true,
    run(handle, limit, tried) {
      const rows = (handle.prepare("SELECT platform, account, ownerId, MAX(receivedAt) AS at FROM events WHERE ownerId IS NOT NULL AND ownerId NOT LIKE 'self:%' GROUP BY platform, account, ownerId").all() as { platform: string; account: string; ownerId: string; at: string }[]).filter((r) => !tried.has(`${r.platform}:${r.account}`)).slice(0, limit)
      for (const r of rows) {
        tried.add(`${r.platform}:${r.account}`)
        insertEventRow(handle, accountIdentifiedEvent(r.platform, r.account, r.ownerId, r.at, 'import'))
      }
      return rows.length
    },
  },
  {
    name: 'attachmentPaths',
    once: true,
    run(handle, limit, tried) {
      const rows = (handle.prepare("SELECT seq, platform, account, conversationId, eventId, type, payload, messageKey FROM events WHERE type IN ('message', 'ownMessage', 'attachmentsSeen') AND payload LIKE '%\"path\"%' ORDER BY seq").all() as { seq: number; platform: string; account: string; conversationId: string; eventId: string; type: string; payload: string; messageKey: string | null }[]).filter((r) => !tried.has(String(r.seq))).slice(0, limit)
      const fill = handle.prepare('UPDATE attachments SET path = COALESCE(path, ?), error = COALESCE(error, ?) WHERE messageKey = ? AND n = ?')
      for (const r of rows) {
        tried.add(String(r.seq))
        const payload = payloadOf(r.payload)
        const key = r.type === 'attachmentsSeen' ? String(payload.messageKey ?? '') : r.messageKey ?? messageKeyOf(r.platform, r.account, r.conversationId, platformMessageIdOf(payload)) ?? `${chatIdOf(r.platform, r.account, r.conversationId)}:${r.eventId}`
        const list = Array.isArray(payload.attachments) ? (payload.attachments as Record<string, unknown>[]) : []
        list.forEach((a, n) => {
          const path = typeof a?.path === 'string' && a.path ? a.path : null
          const error = typeof a?.error === 'string' && a.error ? a.error : null
          if (path || error) fill.run(path, error, key, n)
        })
      }
      return rows.length
    },
  },
]

interface OrphanRow {
  messageKey: string
  chatId: string
  platformMessageId: string | null
  senderUserId: string
  senderLabel: string | null
  fromOwner: number
  sentAt: string
  text: string
  receivedAt: string
  platform: string
  account: string
  conversationId: string
  kind: string
  name: string | null
  box: string | null
}

function eachMessageEvent(handle: Database, visit: (key: string, text: string) => void): void {
  const rows = handle.prepare("SELECT eventId, platform, account, conversationId, type, text, payload, messageKey FROM events WHERE type IN ('message', 'ownMessage', 'messageEdited') ORDER BY seq").all() as { eventId: string; platform: string; account: string; conversationId: string; type: string; text: string; payload: string; messageKey: string | null }[]
  for (const r of rows) {
    const payload = payloadOf(r.payload)
    if (r.type === 'messageEdited') {
      visit(String(payload.messageKey ?? ''), r.text)
      continue
    }
    const key = r.messageKey ?? messageKeyOf(r.platform, r.account, r.conversationId, platformMessageIdOf(payload)) ?? `${chatIdOf(r.platform, r.account, r.conversationId)}:${r.eventId}`
    visit(key, r.text)
  }
}

function producedKeys(handle: Database): Set<string> {
  const keys = new Set<string>()
  eachMessageEvent(handle, (key) => keys.add(key))
  return keys
}

function producedTexts(handle: Database): Map<string, string> {
  const texts = new Map<string, string>()
  eachMessageEvent(handle, (key, text) => texts.set(key, text))
  return texts
}

export function runBackfill(handle: Database, steps: readonly BackfillStep[] = BACKFILL_STEPS, size = BACKFILL_BATCH): Record<string, number> {
  const done: Record<string, number> = {}
  const finished = handle.prepare("SELECT 1 FROM imports WHERE store = ? AND state = 'done'")
  const finish = handle.prepare("INSERT INTO imports (store, state, rows, startedAt, endedAt) VALUES (?, 'done', ?, ?, ?) ON CONFLICT(store) DO UPDATE SET state = 'done', rows = excluded.rows, endedAt = excluded.endedAt")
  for (const step of steps) {
    const store = `backfill:${step.name}`
    if (step.once && finished.get(store)) {
      done[step.name] = 0
      continue
    }
    let total = 0
    const tried = new Set<string>()
    for (;;) {
      const n = batch(handle, () => step.run(handle, size, tried))
      total += n
      if (n < size) break
    }
    if (step.once) finish.run(store, total, new Date().toISOString(), new Date().toISOString())
    done[step.name] = total
  }
  return done
}
