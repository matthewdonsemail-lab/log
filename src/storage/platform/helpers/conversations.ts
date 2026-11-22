import type { Database } from 'bun:sqlite'
import type { EventInsert } from '../types'
import { conversationSeenEvent, messageEditedEvent } from './derivedEvents'
import { isBareId } from './ids'
import { messageKeyOf } from './time'

export interface StoredAttachment {
  name: string
  type?: string
  duration?: number
}

export interface StoredMessage {
  id: string
  at: string | null
  from: string | null
  fromMe: boolean
  text: string
  attachments?: StoredAttachment[]
}

export interface StoredPlace {
  kind: 'dm' | 'group' | 'channel' | 'thread' | 'forumPost' | 'replies' | 'post'
  server?: string
  serverId?: string
  channel?: string
}

const SERVER_KINDS: readonly string[] = ['channel', 'thread', 'forumPost']

function placeOfChat(c: ChatRowOut): StoredPlace | undefined {
  if (c.kind === 'group' && !(c.box ?? '').startsWith('group')) return { kind: 'group' }
  if (!SERVER_KINDS.includes(c.kind)) return undefined
  return { kind: c.kind as 'channel' | 'thread' | 'forumPost', ...(c.serverId ? { serverId: c.serverId } : {}), ...(c.name ? { channel: c.name } : {}) }
}

export interface StoredConversation {
  platform: string
  account: string
  conversationId: string
  box: string
  with: string[]
  place?: StoredPlace
  messages: StoredMessage[]
}

export function writeConversation(handle: Database, c: StoredConversation, insert: (handle: Database, input: EventInsert) => unknown, storedText: (handle: Database, messageKey: string) => string | null, now: Date = new Date()): number {
  const at = now.toISOString()
  let written = 0
  for (const m of c.messages) {
    insert(handle, {
      platform: c.platform,
      account: c.account,
      conversationId: c.conversationId,
      type: m.fromMe ? 'ownMessage' : 'message',
      with: m.fromMe ? 'me' : m.from ?? '',
      text: m.text,
      box: c.box,
      payload: { id: m.id, fromMe: m.fromMe, ...(m.attachments?.length ? { attachments: m.attachments } : {}), ...(c.box === 'group' ? { title: c.with.join(', ') } : {}) },
      sourceAt: m.at ?? '',
      receivedAt: m.at ?? at,
      source: 'read',
    })
    const key = messageKeyOf(c.platform, c.account, c.conversationId, m.id)
    if (key && m.text) {
      const stored = storedText(handle, key)
      if (stored !== null && stored !== m.text) insert(handle, messageEditedEvent(c, key, m.text, at))
    }
    written++
  }
  insert(handle, conversationSeenEvent(c, c.box, c.with, at))
  return written
}

interface ChatRowOut {
  chatId: string
  platform: string
  account: string
  conversationId: string
  kind: string
  box: string | null
  name: string | null
  serverId: string | null
}

interface MessageRowOut {
  chatId: string
  messageKey: string
  platformMessageId: string | null
  senderLabel: string | null
  fromOwner: number
  sentAt: string
  text: string
}

export interface ReadConversationsOptions {
  account?: string
  chatIds?: readonly string[]
}

export function readConversations(handle: Database, account?: string | ReadConversationsOptions): StoredConversation[] {
  const options: ReadConversationsOptions = typeof account === 'string' ? { account } : account ?? {}
  const chatIds = options.chatIds?.length ? options.chatIds : null
  const chatWhere = [options.account ? 'account = ?' : null, chatIds ? `chatId IN (${chatIds.map(() => '?').join(', ')})` : null].filter(Boolean).join(' AND ')
  const chats = handle.prepare(`SELECT chatId, platform, account, conversationId, kind, box, name, serverId FROM chats ${chatWhere ? `WHERE ${chatWhere}` : ''} ORDER BY chatId`).all(...(options.account ? [options.account] : []), ...(chatIds ?? [])) as ChatRowOut[]
  const messageWhere = chatIds ? `WHERE chatId IN (${chatIds.map(() => '?').join(', ')})` : ''
  const messages = handle.prepare(`SELECT chatId, messageKey, platformMessageId, senderLabel, fromOwner, sentAt, text FROM messages ${messageWhere} ORDER BY chatId, sentAtMs, seq`).all(...(chatIds ?? [])) as MessageRowOut[]
  const attachmentWhere = chatIds ? `WHERE messageKey IN (SELECT messageKey FROM messages WHERE chatId IN (${chatIds.map(() => '?').join(', ')}))` : ''
  const attachments = handle.prepare(`SELECT messageKey, name, contentType, durationMs FROM attachments ${attachmentWhere} ORDER BY messageKey, n`).all(...(chatIds ?? [])) as { messageKey: string; name: string | null; contentType: string | null; durationMs: number | null }[]
  const memberWhere = chatIds ? `WHERE m.roomId IN (${chatIds.map(() => '?').join(', ')})` : ''
  const members = handle.prepare(`SELECT m.roomId, m.userId, m.position, i.handle FROM memberships m LEFT JOIN identities i ON i.platform = m.platform AND i.userId = m.userId ${memberWhere} ORDER BY m.position IS NULL, m.position, m.firstSeenAt`).all(...(chatIds ?? [])) as { roomId: string; userId: string; position: number | null; handle: string | null }[]
  const byChat = new Map<string, MessageRowOut[]>()
  for (const m of messages) {
    const list = byChat.get(m.chatId)
    if (list) list.push(m)
    else byChat.set(m.chatId, [m])
  }
  const filesOf = new Map<string, StoredAttachment[]>()
  for (const a of attachments) {
    const file = { name: a.name ?? 'file', ...(a.contentType ? { type: a.contentType } : {}), ...(a.durationMs !== null ? { duration: a.durationMs / 1000 } : {}) }
    const list = filesOf.get(a.messageKey)
    if (list) list.push(file)
    else filesOf.set(a.messageKey, [file])
  }
  const withOf = new Map<string, string[]>()
  const listed = new Set(members.filter((m) => m.position !== null).map((m) => m.roomId))
  for (const m of members) {
    if (listed.has(m.roomId) && m.position === null) continue
    const label = m.handle ?? m.userId.replace(/^@/, '')
    const list = withOf.get(m.roomId) ?? []
    if (!list.includes(label)) list.push(label)
    withOf.set(m.roomId, list)
  }
  return chats.filter((c) => byChat.has(c.chatId)).map((c) => {
    const named = (withOf.get(c.chatId) ?? []).filter((l) => !isBareId(l))
    const place = placeOfChat(c)
    return {
      platform: c.platform,
      account: c.account,
      conversationId: c.conversationId,
      box: c.box ?? c.kind,
      with: named.length ? named : withOf.get(c.chatId) ?? (c.name ? [c.name] : []),
      ...(place ? { place } : {}),
      messages: (byChat.get(c.chatId) ?? []).map((m) => {
        const files = filesOf.get(m.messageKey)
        return { id: m.platformMessageId ?? m.messageKey, at: m.sentAt || null, from: m.fromOwner ? c.account : m.senderLabel, fromMe: m.fromOwner === 1, text: m.text, ...(files ? { attachments: files } : {}) }
      }),
    }
  })
}
