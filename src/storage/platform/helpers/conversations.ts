import type { Database } from 'bun:sqlite'
import { createHash } from 'node:crypto'
import type { EventInput, ExtenderContext } from '../types'
import { chatIdOf, handleIdOf, isBareId } from './ids'

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

export interface StoredConversation {
  platform: string
  account: string
  conversationId: string
  box: string
  with: string[]
  messages: StoredMessage[]
}

function eventIdFor(c: StoredConversation, m: StoredMessage): string {
  return createHash('sha1').update([c.platform, c.account, c.conversationId, m.at ?? '', m.text].join('|')).digest('hex').slice(0, 12)
}

export function writeConversation(handle: Database, c: StoredConversation, context: ExtenderContext, write: (handle: Database, event: EventInput, context: ExtenderContext) => void, now: Date = new Date()): number {
  const chatId = chatIdOf(c.platform, c.account, c.conversationId)
  const at = now.toISOString()
  let written = 0
  for (const m of c.messages) {
    write(handle, {
      eventId: eventIdFor(c, m),
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
    }, context)
    if (m.text) handle.prepare('UPDATE messages SET text = ? WHERE messageKey = ? AND text != ?').run(m.text, `${chatId}:${m.id}`, m.text)
    written++
  }
  handle.prepare('INSERT INTO chats (chatId, platform, account, conversationId, kind, box, backfilledAt) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(chatId) DO UPDATE SET box = excluded.box, backfilledAt = excluded.backfilledAt').run(chatId, c.platform, c.account, c.conversationId, c.box === 'group' ? 'group' : 'dm', c.box, at)
  c.with.forEach((label, position) => {
    if (!label) return
    const userId = isBareId(label) ? label.replace(/^@/, '') : handleIdOf(label)
    handle.prepare('INSERT INTO identities (platform, userId, handle, displayName, firstSeenAt, lastSeenAt) VALUES (?, ?, ?, NULL, ?, ?) ON CONFLICT(platform, userId) DO UPDATE SET handle = COALESCE(identities.handle, excluded.handle)').run(c.platform, userId, isBareId(label) ? null : label.replace(/^@/, ''), at, at)
    handle.prepare('INSERT INTO memberships (platform, roomId, userId, firstSeenAt, lastSeenAt, position) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(platform, roomId, userId) DO UPDATE SET position = excluded.position').run(c.platform, chatId, userId, at, at, position)
  })
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

export function readConversations(handle: Database, account?: string): StoredConversation[] {
  const chats = handle.prepare(`SELECT chatId, platform, account, conversationId, kind, box, name FROM chats ${account ? 'WHERE account = ?' : ''} ORDER BY chatId`).all(...(account ? [account] : [])) as ChatRowOut[]
  const messages = handle.prepare('SELECT chatId, messageKey, platformMessageId, senderLabel, fromOwner, sentAt, text FROM messages ORDER BY chatId, sentAtMs, seq').all() as MessageRowOut[]
  const attachments = handle.prepare('SELECT messageKey, name, contentType, durationMs FROM attachments ORDER BY messageKey, n').all() as { messageKey: string; name: string | null; contentType: string | null; durationMs: number | null }[]
  const members = handle.prepare('SELECT m.roomId, m.userId, m.position, i.handle FROM memberships m LEFT JOIN identities i ON i.platform = m.platform AND i.userId = m.userId ORDER BY m.position IS NULL, m.position, m.firstSeenAt').all() as { roomId: string; userId: string; position: number | null; handle: string | null }[]
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
    return {
      platform: c.platform,
      account: c.account,
      conversationId: c.conversationId,
      box: c.box ?? c.kind,
      with: named.length ? named : withOf.get(c.chatId) ?? (c.name ? [c.name] : []),
      messages: (byChat.get(c.chatId) ?? []).map((m) => {
        const files = filesOf.get(m.messageKey)
        return { id: m.platformMessageId ?? m.messageKey, at: m.sentAt || null, from: m.fromOwner ? c.account : m.senderLabel, fromMe: m.fromOwner === 1, text: m.text, ...(files ? { attachments: files } : {}) }
      }),
    }
  })
}
