import { homedir } from 'node:os'
import { join } from 'node:path'
import { deleteState, getState, putState } from '../../storage/state/index'
import { notThePlatform, readSession, sessionLive } from '../relay/index'
import { behindOf, db, positionsOf, recordPosition } from '../store/index'
import { BACKFILL_SCOPE, CHAT_LIST_FRESH_MS } from './types'
import type { DbMessage, ReadSource, ReadSourceDeps } from './types'
import type { MessageAttachment } from '../catchUp/types'
import { timed } from '../../observability/timing/index'
import { chatIdOf } from '../../storage/platform/index'

export const readSourceDeps: ReadSourceDeps = {
  live: (platform, account) => sessionLive(readSession(platform, account)),
  behind: (platform, account) => behindOf(platform, account),
  backfilledAt: (platform, account, chatKey) => positionsOf(platform, account)[`${BACKFILL_SCOPE}${chatKey}`] ?? null,
}

export function readSourceFor(platform: string, account: string, chatKey: string, have: number, limit: number, deps: ReadSourceDeps = readSourceDeps): Promise<ReadSource> {
  return timed('inbox.readSource', async (span) => {
    const source = await readSourceNow(platform, account, chatKey, have, limit, deps)
    span.attrs.from = source.from
    return source
  }, { platform })
}

async function readSourceNow(platform: string, account: string, chatKey: string, have: number, limit: number, deps: ReadSourceDeps): Promise<ReadSource> {
  if (!deps.live(platform, account)) return { from: 'platform', reason: 'noLiveOwner' }
  const gap = deps.behind(platform, account)
  if (gap?.status === 'refused' && !notThePlatform(gap.detail)) return { from: 'refused', refused: `>>> BEHIND: ${platform} ${account} has a gap from ${gap.fromAt} that its catch-up couldn't fill (${gap.detail ?? 'refused'}), so nothing is read around it; nothing resumes on it until matt says so (rule 94)` }
  if (gap) return { from: 'platform', reason: 'catchingUp' }
  if (deps.backfilledAt(platform, account, chatKey)) return { from: 'db', reason: 'backfilled' }
  if (have >= limit) return { from: 'db', reason: 'enoughInDb' }
  return { from: 'platform', reason: 'notBackfilled' }
}

export function markBackfilled(platform: string, account: string, chatKey: string, now: Date = new Date()): void {
  recordPosition(platform, account, now.toISOString(), `${BACKFILL_SCOPE}${chatKey}`, now)
}

function attachmentsOf(value: unknown): MessageAttachment[] | undefined {
  if (!Array.isArray(value)) return undefined
  return value.filter((a): a is MessageAttachment => !!a && typeof a === 'object' && typeof (a as { name?: unknown }).name === 'string').map((a) => ({ name: a.name, ...(a.type ? { type: a.type } : {}), ...(a.path ? { path: a.path } : {}), ...(a.error ? { error: a.error } : {}) }))
}

export function mediaNotSaved(messages: readonly DbMessage[]): boolean {
  return messages.some((m) => (!m.text && m.attachments === undefined) || (m.attachments ?? []).some((a) => (isVisualAttachment(a) || isTextAttachment(a)) && !a.path && !a.error))
}

export function isTextAttachment(a: MessageAttachment): boolean {
  const type = (a.type ?? '').toLowerCase()
  if (type.startsWith('image/') || type.startsWith('video/') || type.startsWith('audio/')) return false
  return /\.(txt|tsv|csv|md|json)$/i.test(a.name)
}

export function isVisualAttachment(a: MessageAttachment): boolean {
  const type = (a.type ?? '').toLowerCase()
  if (type.startsWith('image/') || type.startsWith('video/')) return true
  return /\.(png|jpe?g|webp|gif|bmp|mp4|mov|m4v|mkv)$/i.test(a.name)
}

export function chatMessages(platform: string, account: string, conversationId: string, limit: number): DbMessage[] {
  const chatId = chatIdOf(platform, account, conversationId)
  const handle = db()
  const rows = handle
    .prepare('SELECT m.messageKey, m.platformMessageId, COALESCE(i.handle, m.senderLabel) AS senderLabel, m.senderUserId, m.fromOwner, m.sentAt, m.text FROM messages m LEFT JOIN identities i ON i.platform = m.senderPlatform AND i.userId = m.senderUserId WHERE m.chatId = ? ORDER BY m.sentAtMs DESC, m.seq DESC LIMIT ?')
    .all(chatId, limit) as { messageKey: string; platformMessageId: string | null; senderLabel: string | null; senderUserId: string; fromOwner: number; sentAt: string; text: string }[]
  const files = handle.prepare('SELECT name, contentType, path, error FROM attachments WHERE messageKey = ? ORDER BY n')
  return rows.reverse().map((r) => {
    const attachments = attachmentsOf((files.all(r.messageKey) as { name: string | null; contentType: string | null; path: string | null; error: string | null }[]).map((a) => ({ name: a.name, type: a.contentType ?? undefined, path: a.path ?? undefined, error: a.error ?? undefined })))
    return { id: r.platformMessageId ?? r.messageKey.slice(chatId.length + 1), conversationId, at: r.sentAt, from: r.fromOwner ? 'me' : r.senderLabel ?? r.senderUserId, fromMe: r.fromOwner === 1, text: r.text, ...(attachments?.length ? { attachments } : {}) }
  })
}

export function chatMessageCount(platform: string, account: string, conversationId: string): number {
  const row = db().prepare('SELECT COUNT(*) AS n FROM messages WHERE chatId = ?').get(chatIdOf(platform, account, conversationId)) as { n: number }
  return row.n
}

export function userIdOfHandle(platform: string, account: string, handle: string): string | null {
  void account
  const row = db().prepare('SELECT userId FROM handleAliases WHERE platform = ? AND handle = ? ORDER BY lastSeenAt DESC LIMIT 1').get(platform, handle.replace(/^@/, '').trim().toLowerCase()) as { userId: string } | null
  return row?.userId ?? null
}

export function sourceLine(source: ReadSource, platform: string, account: string, ms: number): string {
  if (source.from === 'db') return `${account}: answered from the .db in ${Math.round(ms)} ms (${source.reason === 'backfilled' ? 'this chat was backfilled once and its owner keeps it current' : 'the .db already holds enough of it'}), nothing read from ${platform}`
  if (source.from === 'platform') return `${account}: read from ${platform} (${{ noLiveOwner: `no live ${platform} owner is keeping the .db current`, notBackfilled: 'this chat is read once to backfill the .db; after this it answers from the .db', serverChannel: 'a server channel, which the watcher only keeps mentions and replies from', askedFull: 'a full read was asked for', catchingUp: 'its owner is still catching up, so this one chat is read straight from the platform instead of waiting', mediaNotSaved: 'it holds an image or file the .db has no saved copy of' }[source.reason]})`
  return source.refused
}

export function chatListPath(platform: string, account: string): string {
  const root = process.env.LOG_INBOX_STATE || join(homedir(), '.logCli', 'inbox')
  return join(root, 'chatLists', platform, `${account.replace(/[^0-9A-Za-z_-]/g, '_')}.json`)
}

export function cachedChatList<T>(platform: string, account: string, now: number = Date.now()): T[] | null {
  const kept = getState<{ savedAt: number; chats: T[] }>('chatList', `${platform}:${account}`, { legacyFile: chatListPath(platform, account) })?.body
  return kept && now - kept.savedAt < CHAT_LIST_FRESH_MS ? kept.chats : null
}

export function saveChatList<T>(platform: string, account: string, chats: readonly T[], now: number = Date.now()): void {
  putState('chatList', `${platform}:${account}`, { savedAt: now, chats }, now)
}

export function forgetChatList(platform: string, account: string): void {
  deleteState('chatList', `${platform}:${account}`)
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
