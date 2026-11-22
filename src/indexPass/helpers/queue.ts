import type { Database } from 'bun:sqlite'
import { getState, putState } from '../../storage/state/index'
import { PASS_BACKLOG_CHATS, PASS_CHAT_LINES, PASS_CURSOR, PASS_SCOPE, PASS_SLICE_CHATS, PASS_SLICE_LINES } from '../types'
import type { PassChat, PassLine } from '../types'

interface Row {
  seq: number
  messageKey: string
  chatId: string
  fromOwner: number
  sentAt: string
  text: string
  platform: string
  account: string
  conversationId: string
  kind: string
}

export function headOf(handle: Database): number {
  return (handle.prepare('SELECT COALESCE(MAX(seq), 0) AS n FROM messages').get() as { n: number }).n
}

export function cursorOf(handle: Database): number {
  return getState<{ throughSeq: number }>(PASS_SCOPE, PASS_CURSOR, {}, handle)?.body.throughSeq ?? 0
}

export function saveCursor(handle: Database, throughSeq: number, now: number): void {
  putState(PASS_SCOPE, PASS_CURSOR, { throughSeq }, now, handle)
}

export function backlogOf(handle: Database, cursor: number): number {
  return (handle.prepare('SELECT COUNT(DISTINCT chatId) AS n FROM (SELECT chatId FROM messages WHERE seq > ? LIMIT ?)').get(cursor, PASS_BACKLOG_CHATS * 40) as { n: number }).n
}

export interface SliceOptions {
  chatIds?: readonly string[]
  limit?: number
  platform?: string
  account?: string
  since?: string
  chats?: number
  lines?: number
}

export function sliceOf(handle: Database, cursor: number, options: SliceOptions = {}): { chats: PassChat[]; throughSeq: number } {
  const lineBudget = Math.max(1, options.lines ?? PASS_SLICE_LINES)
  const chatBudget = Math.max(1, options.chats ?? PASS_SLICE_CHATS)
  const where = ['m.seq > ?']
  const values: (string | number)[] = [cursor]
  if (options.platform) {
    where.push('c.platform = ?')
    values.push(options.platform)
  }
  if (options.account) {
    where.push('c.account = ?')
    values.push(options.account)
  }
  if (options.chatIds?.length) {
    where.push(`c.chatId IN (${options.chatIds.map(() => '?').join(', ')})`)
    values.push(...options.chatIds)
  }
  if (options.since) {
    where.push('m.sentAt >= ?')
    values.push(options.since)
  }
  const rows = handle.prepare(`SELECT m.seq, m.messageKey, m.chatId, m.fromOwner, m.sentAt, m.text, c.platform, c.account, c.conversationId, c.kind FROM messages m JOIN chats c ON c.chatId = m.chatId WHERE ${where.join(' AND ')} ORDER BY m.seq LIMIT ?`).all(...values, lineBudget) as Row[]
  if (!rows.length) return { chats: [], throughSeq: cursor }
  const order: string[] = []
  const byChat = new Map<string, Row[]>()
  for (const row of rows) {
    const held = byChat.get(row.chatId)
    if (held) held.push(row)
    else {
      byChat.set(row.chatId, [row])
      order.push(row.chatId)
    }
  }
  const full = rows.length === lineBudget
  const onlyOne = order.length === 1
  if (full && !onlyOne) order.pop()
  const picked = full && onlyOne ? [order[0]] : order.slice(0, chatBudget)
  const chats: PassChat[] = picked.map((chatId) => {
    const list = byChat.get(chatId)!
    const first = list[0]
    const lines: PassLine[] = list.slice(0, PASS_CHAT_LINES).map((r) => ({ seq: r.seq, messageKey: r.messageKey, chatId: r.chatId, platform: r.platform, account: r.account, conversationId: r.conversationId, kind: r.kind, fromOwner: r.fromOwner === 1, sentAt: r.sentAt, text: r.text ?? '' }))
    return { chatId, platform: first.platform, account: first.account, conversationId: first.conversationId, kind: first.kind, lines, throughSeq: lines[lines.length - 1].seq }
  })
  return { chats, throughSeq: chats.length ? chats[chats.length - 1].throughSeq : cursor }
}
