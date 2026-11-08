export interface EventInput {
  eventId: string
  platform: string
  account: string
  conversationId: string
  type: string
  with: string
  text: string
  box: string
  payload: Record<string, unknown>
  sourceAt: string
  receivedAt: string
  source: string
}

export type ChatKind = 'dm' | 'group' | 'channel' | 'thread'

export type AttachmentKind = 'image' | 'gif' | 'video' | 'audio' | 'file' | 'link'

export interface IdentityRow {
  platform: string
  userId: string
  handle: string | null
  displayName: string | null
}

export interface ChatRow {
  chatId: string
  platform: string
  account: string
  conversationId: string
  kind: ChatKind
  name: string | null
  serverId: string | null
}

export interface MessageRow {
  messageKey: string
  chatId: string
  platformMessageId: string | null
  senderUserId: string
  senderLabel: string | null
  fromOwner: boolean
  sentAt: string
  sentAtMs: number
  timeSource: 'platform' | 'received'
  text: string
  replyToKey: string | null
}

export interface AttachmentRow {
  n: number
  kind: AttachmentKind
  name: string | null
  contentType: string | null
  url: string | null
  durationMs: number | null
}

export interface InteractionRow {
  interactionKey: string
  kind: string
  actorUserId: string
  targetRef: string | null
  targetText: string | null
  text: string | null
  at: string
}

export interface ExtenderContext {
  ownerIdOf(platform: string, account: string): string | null
}

export interface PlatformExtender {
  platform: string
  toChat(event: EventInput): ChatRow | null
  toIdentities(event: EventInput, context: ExtenderContext): IdentityRow[]
  toMessage(event: EventInput, context: ExtenderContext): MessageRow | null
  toAttachments(event: EventInput): AttachmentRow[]
  toInteraction(event: EventInput): InteractionRow | null
}

export interface TypedRows {
  identities: IdentityRow[]
  chat: ChatRow | null
  message: MessageRow | null
  attachments: AttachmentRow[]
  interaction: InteractionRow | null
}

export const MESSAGE_TYPES: readonly string[] = ['message', 'ownMessage']
