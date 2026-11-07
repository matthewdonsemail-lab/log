import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { waitCaughtUp } from '../catchUp/index'
import { readSession, sessionLive } from '../relay/index'
import { db, positionsOf, recordPosition } from '../store/index'
import { BACKFILL_SCOPE, CHAT_LIST_FRESH_MS, READ_CATCH_UP_MS } from './types'
import type { DbMessage, ReadSource, ReadSourceDeps } from './types'

export const readSourceDeps: ReadSourceDeps = {
  live: (platform, account) => sessionLive(readSession(platform, account)),
  waitCaughtUp: (platform, account, options) => waitCaughtUp(platform, account, options),
  backfilledAt: (platform, account, chatKey) => positionsOf(platform, account)[`${BACKFILL_SCOPE}${chatKey}`] ?? null,
}

export async function readSourceFor(platform: string, account: string, chatKey: string, have: number, limit: number, deps: ReadSourceDeps = readSourceDeps): Promise<ReadSource> {
  if (!deps.live(platform, account)) return { from: 'platform', reason: 'noLiveOwner' }
  const caught = await deps.waitCaughtUp(platform, account, { timeoutMs: READ_CATCH_UP_MS })
  if (!caught.ok) return { from: 'refused', refused: caught.refused }
  if (deps.backfilledAt(platform, account, chatKey)) return { from: 'db', reason: 'backfilled' }
  if (have >= limit) return { from: 'db', reason: 'enoughInDb' }
  return { from: 'platform', reason: 'notBackfilled' }
}

export function markBackfilled(platform: string, account: string, chatKey: string, now: Date = new Date()): void {
  recordPosition(platform, account, now.toISOString(), `${BACKFILL_SCOPE}${chatKey}`, now)
}

function payloadId(payload: string): string | null {
  try {
    const parsed = JSON.parse(payload) as { id?: unknown }
    return parsed.id == null ? null : String(parsed.id)
  } catch {
    return null
  }
}

export function chatMessages(platform: string, account: string, conversationId: string, limit: number): DbMessage[] {
  const rows = db()
    .prepare("SELECT eventId, conversationId, type, withWho, text, payload, sourceAt, receivedAt FROM events WHERE platform = ? AND account = ? AND conversationId = ? AND type IN ('message', 'ownMessage') ORDER BY COALESCE(NULLIF(sourceAt, ''), receivedAt) DESC, seq DESC LIMIT ?")
    .all(platform, account, conversationId, limit) as { eventId: string; conversationId: string; type: string; withWho: string; text: string; payload: string; sourceAt: string; receivedAt: string }[]
  return rows.reverse().map((r) => ({ id: payloadId(r.payload) ?? r.eventId, conversationId: r.conversationId, at: r.sourceAt || r.receivedAt, from: r.type === 'ownMessage' ? 'me' : r.withWho, fromMe: r.type === 'ownMessage', text: r.text }))
}

export function chatMessageCount(platform: string, account: string, conversationId: string): number {
  const row = db().prepare("SELECT COUNT(*) AS n FROM events WHERE platform = ? AND account = ? AND conversationId = ? AND type IN ('message', 'ownMessage')").get(platform, account, conversationId) as { n: number }
  return row.n
}

export function userIdOfHandle(platform: string, account: string, handle: string): string | null {
  const row = db().prepare('SELECT userId FROM people WHERE platform = ? AND account = ? AND lower(handle) = lower(?) ORDER BY seenAt DESC LIMIT 1').get(platform, account, handle.replace(/^@/, '')) as { userId: string } | null
  return row?.userId ?? null
}

export function sourceLine(source: ReadSource, platform: string, account: string, ms: number): string {
  if (source.from === 'db') return `${account}: answered from the .db in ${Math.round(ms)} ms (${source.reason === 'backfilled' ? 'this chat was backfilled once and its owner keeps it current' : 'the .db already holds enough of it'}), nothing read from ${platform}`
  if (source.from === 'platform') return `${account}: read from ${platform} (${{ noLiveOwner: `no live ${platform} owner is keeping the .db current`, notBackfilled: 'this chat is read once to backfill the .db; after this it answers from the .db', serverChannel: 'a server channel, which the watcher only keeps mentions and replies from', askedFull: 'a full read was asked for' }[source.reason]})`
  return source.refused
}

export function chatListPath(platform: string, account: string): string {
  const root = process.env.LOG_INBOX_STATE || join(homedir(), '.logCli', 'inbox')
  return join(root, 'chatLists', platform, `${account.replace(/[^0-9A-Za-z_-]/g, '_')}.json`)
}

export function cachedChatList<T>(platform: string, account: string, now: number = Date.now()): T[] | null {
  try {
    const kept = JSON.parse(readFileSync(chatListPath(platform, account), 'utf8')) as { savedAt: number; chats: T[] }
    return now - kept.savedAt < CHAT_LIST_FRESH_MS ? kept.chats : null
  } catch {
    return null
  }
}

export function saveChatList<T>(platform: string, account: string, chats: readonly T[], now: number = Date.now()): void {
  const path = chatListPath(platform, account)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify({ savedAt: now, chats }))
}

export function findInChatList<T, M extends { ok: boolean }>(platform: string, account: string, said: string, match: (chats: T[], said: string) => M, list: () => { ok: true; chats: T[] } | { ok: false; detail: string }): { from: 'cache' | 'platform'; found: M } | { from: 'platform'; failed: string } {
  const cached = cachedChatList<T>(platform, account)
  if (cached) {
    const found = match(cached, said)
    if (found.ok) return { from: 'cache', found }
  }
  const listed = list()
  if (!listed.ok) return { from: 'platform', failed: listed.detail }
  saveChatList(platform, account, listed.chats)
  return { from: 'platform', found: match(listed.chats, said) }
}
