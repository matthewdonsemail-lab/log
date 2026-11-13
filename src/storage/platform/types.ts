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
  ownerId?: string | null
}

export interface EventInsert {
  eventId?: string
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
  known?: boolean
  ownerId?: string | null
}

export interface InsertedEvent {
  seq: number
  eventId: string
  messageKey: string | null
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
  path: string | null
  error: string | null
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

export const IDENTITY_PROFILE_EXTRA_KEYS = ['pictureUrl', 'location', 'followingCount', 'postCount', 'canDm', 'protected', 'joinedAt', 'premium', 'headline'] as const

export type IdentityProfileExtraKey = (typeof IDENTITY_PROFILE_EXTRA_KEYS)[number]

export type IdentityProfileExtra = Partial<Record<IdentityProfileExtraKey, string | number | boolean>>

export interface IdentityProfileFields {
  bio?: string | null
  avatarHash?: string | null
  followerCount?: number | null
  verified?: boolean | null
  extra?: IdentityProfileExtra | null
}

export interface IdentityProfileRow {
  platform: string
  userId: string
  bio: string | null
  avatarHash: string | null
  followerCount: number | null
  verified: boolean | null
  extra: IdentityProfileExtra | null
  fetchedAt: string
}

export const RAW_BLOB_KINDS: readonly string[] = ['avatar']

export type BlobCodec = 'gzip' | 'raw'

export interface ExtenderContext {
  ownerIdOf(platform: string, account: string): string | null
  userIdOfHandle?(platform: string, handle: string): string | null
}

export interface PlatformExtender {
  platform: string
  toChat(event: EventInput): ChatRow | null
  toIdentities(event: EventInput, context: ExtenderContext): IdentityRow[]
  toMessage(event: EventInput, context: ExtenderContext): MessageRow | null
  toAttachments(event: EventInput): AttachmentRow[]
  toInteraction(event: EventInput): InteractionRow | null
  toProfile(event: EventInput): IdentityProfileRow | null
}

export interface TypedRows {
  identities: IdentityRow[]
  chat: ChatRow | null
  message: MessageRow | null
  attachments: AttachmentRow[]
  interaction: InteractionRow | null
  profile: IdentityProfileRow | null
}

export const MESSAGE_TYPES: readonly string[] = ['message', 'ownMessage']

export const DERIVED_EVENT_TYPES: readonly string[] = ['attachmentsSeen', 'messageEdited', 'conversationSeen', 'identityLearned', 'accountIdentified', 'profileSeen']

export const DERIVED_TABLES: readonly string[] = ['attachments', 'memberships', 'messages', 'interactions', 'chats', 'identityProfiles', 'identities', 'accounts', 'handleAliases', 'identityMerges']

export const EXTENDER_VERSION = 2
