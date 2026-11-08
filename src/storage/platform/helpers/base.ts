import type { AttachmentKind, AttachmentRow, ChatKind, ChatRow, EventInput, ExtenderContext, IdentityRow, InteractionRow, MessageRow, PlatformExtender } from '../types'
import { MESSAGE_TYPES } from '../types'
import { chatIdOf, handleIdOf, isBareId, isOwnerLabel, selfIdOf, textOf } from './ids'
import { messageKeyOf, messageTimeOf, platformMessageIdOf } from './time'

export function attachmentKindOf(contentType: string | null, name: string | null): AttachmentKind {
  const type = (contentType ?? '').toLowerCase()
  const ext = (name ?? '').toLowerCase().split('.').pop() ?? ''
  if (type === 'image/gif' || ext === 'gif') return 'gif'
  if (type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'heic'].includes(ext)) return 'image'
  if (type === 'video/ogg' || type.startsWith('audio/') || ['ogg', 'oga', 'opus', 'm4a', 'mp3', 'wav', 'aac'].includes(ext)) return 'audio'
  if (type.startsWith('video/') || ['mp4', 'mov', 'webm'].includes(ext)) return 'video'
  if (type === 'text/uri-list' || ext === 'url') return 'link'
  return 'file'
}

export interface BaseOptions {
  platform: string
  chatKind(event: EventInput): ChatKind
  serverIdOf?(event: EventInput): string | null
  senderIdOf?(event: EventInput, context: ExtenderContext): string | null
  ownerIdOf?(event: EventInput, context: ExtenderContext): string | null
  toInteraction?(event: EventInput): InteractionRow | null
  toIdentities?(event: EventInput, context: ExtenderContext): IdentityRow[]
}

function payloadSenderId(event: EventInput): string | null {
  const p = event.payload
  return textOf(p.senderId) ?? textOf(p.fromId) ?? textOf(p.userId) ?? textOf(p.authorId)
}

function handleOf(event: EventInput): string | null {
  const label = event.with.replace(/^@/, '').trim()
  if (!label || isOwnerLabel(label) || isBareId(label) || label === '?') return null
  return label
}

export function makeExtender(options: BaseOptions): PlatformExtender {
  const isMessage = (event: EventInput) => MESSAGE_TYPES.includes(event.type) && event.conversationId !== ''
  const owner = (event: EventInput, context: ExtenderContext) => event.ownerId ?? options.ownerIdOf?.(event, context) ?? context.ownerIdOf(event.platform, event.account) ?? selfIdOf(event.account)
  const sender = (event: EventInput, context: ExtenderContext): string => {
    if (event.type === 'ownMessage' || event.payload.fromMe === true) return owner(event, context)
    const id = options.senderIdOf?.(event, context) ?? payloadSenderId(event)
    if (id) return id.replace(/^@/, '')
    if (event.with && isBareId(event.with) && !isOwnerLabel(event.with)) return event.with.replace(/^@/, '')
    const handle = handleOf(event)
    if (!handle) return `unknown:${event.conversationId}`
    return context.userIdOfHandle?.(event.platform, handle) ?? handleIdOf(handle)
  }
  return {
    platform: options.platform,
    toChat(event) {
      if (!event.conversationId) return null
      const kind = options.chatKind(event)
      const name = textOf(event.payload.title) ?? textOf(event.payload.chatName) ?? (kind === 'dm' ? handleOf(event) : null)
      return { chatId: chatIdOf(event.platform, event.account, event.conversationId), platform: event.platform, account: event.account, conversationId: event.conversationId, kind, name, serverId: options.serverIdOf?.(event) ?? null }
    },
    toIdentities(event, context) {
      const extra = options.toIdentities?.(event, context) ?? []
      if (!isMessage(event) || event.type === 'ownMessage') return extra
      const userId = sender(event, context)
      const handle = handleOf(event)
      if (userId.startsWith('unknown:')) return extra
      return [...extra, { platform: event.platform, userId, handle, displayName: textOf(event.payload.displayName) ?? textOf(event.payload.name) }]
    },
    toMessage(event, context) {
      if (!isMessage(event)) return null
      const chatId = chatIdOf(event.platform, event.account, event.conversationId)
      const platformMessageId = platformMessageIdOf(event.payload)
      const replyTo = textOf(event.payload.replyTo) ?? textOf(event.payload.threadTs)
      const fromOwner = event.type === 'ownMessage' || event.payload.fromMe === true
      return {
        messageKey: messageKeyOf(event.platform, event.account, event.conversationId, platformMessageId) ?? `${chatId}:${event.eventId}`,
        chatId,
        platformMessageId,
        senderUserId: sender(event, context),
        senderLabel: fromOwner ? 'me' : handleOf(event),
        fromOwner,
        sentAt: event.sourceAt || event.receivedAt,
        ...messageTimeOf(event.sourceAt, event.receivedAt),
        text: event.text,
        replyToKey: replyTo && replyTo !== platformMessageId ? `${chatId}:${replyTo}` : null,
      }
    },
    toAttachments(event) {
      if (!isMessage(event)) return []
      const list = Array.isArray(event.payload.attachments) ? (event.payload.attachments as Record<string, unknown>[]) : []
      return list.filter((a) => a && typeof a === 'object').map((a, n): AttachmentRow => {
        const name = textOf(a.name) ?? textOf(a.filename)
        const contentType = textOf(a.type) ?? textOf(a.content_type) ?? textOf(a.contentType)
        const seconds = typeof a.duration === 'number' ? a.duration : typeof a.duration_secs === 'number' ? a.duration_secs : null
        return { n, kind: attachmentKindOf(contentType, name), name, contentType, url: textOf(a.url), durationMs: typeof a.durationMs === 'number' ? a.durationMs : seconds === null ? null : Math.round(seconds * 1000), path: textOf(a.path), error: textOf(a.error) }
      })
    },
    toInteraction(event) {
      return options.toInteraction?.(event) ?? null
    },
  }
}
