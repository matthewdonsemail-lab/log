import type { AgencyConversation as ConversationRecord, AgencyMessage as MessageRecord } from '../../twenty/graphql/generated/index'
import type { AGENCY_CONVERSATION_FIELDS, AGENCY_MESSAGE_FIELDS } from '../../twenty/graphql/client'

export const CHANNELS = ['sms', 'facebookMarketplace'] as const
export type ConversationChannel = (typeof CHANNELS)[number]

export const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'booked', 'lost', 'spam'] as const
export type LeadStatus = (typeof LEAD_STATUSES)[number]

export type MessageDirection = 'inbound' | 'outbound'

export const MESSAGE_STATUS_RANK = { unknown: 0, received: 1, queued: 2, sent: 3, undelivered: 4, failed: 5, delivered: 6 } as const
export type MessageStatus = keyof typeof MESSAGE_STATUS_RANK

export const SENT_BY = ['person', 'va', 'ai', 'system'] as const
export type SentBy = (typeof SENT_BY)[number]

export const AI_STATUSES = ['draft', 'approved', 'sent', 'dismissed', 'failed'] as const
export type AiStatus = (typeof AI_STATUSES)[number]

export type ConversationRow = Pick<ConversationRecord, keyof typeof AGENCY_CONVERSATION_FIELDS>
export type MessageRow = Pick<MessageRecord, keyof typeof AGENCY_MESSAGE_FIELDS>

export interface MessageMedia {
  url: string
  kind: string
}

export interface Conversation {
  id: string
  channel: ConversationChannel
  pairKey: string | null
  facebookThreadId: string | null
  socialAccountId: string | null
  agencyListingId: string | null
  facebookListingId: string | null
  listingTitle: string | null
  buyerName: string | null
  buyerFacebookId: string | null
  buyerProfileUrl: string | null
  buyerPhone: string | null
  buyerEmail: string | null
  leadStatus: LeadStatus | null
  latestDirection: MessageDirection | null
  latestPreview: string | null
  latestMessageAt: string | null
  latestMessageId: string | null
  messageCount: number
  unreadCount: number
  lastReadAt: string | null
  respondedAt: string | null
  lastScannedAt: string | null
  autoReplied: boolean
  aiTookOver: boolean
}

export interface Message {
  id: string
  conversationId: string | null
  channel: ConversationChannel
  direction: MessageDirection | null
  status: MessageStatus | null
  body: string
  sentAt: string | null
  senderName: string | null
  facebookMessageId: string | null
  messageKey: string | null
  isRead: boolean
  sentBy: SentBy | null
  aiStatus: AiStatus | null
  aiOriginalText: string | null
  media: MessageMedia[]
  createdAt: string | null
}

export interface ScannedMessage {
  direction: MessageDirection
  body: string
  sentAt: string | null
  senderName: string | null
  facebookMessageId?: string | null
  media?: MessageMedia[]
  sentBy?: SentBy | null
}

export interface ScannedThread {
  facebookThreadId: string
  buyerName: string | null
  buyerFacebookId?: string | null
  buyerProfileUrl?: string | null
  listingTitle?: string | null
  facebookListingId?: string | null
  messages: ScannedMessage[]
}

export type ListingMatch = 'facebookListingId' | 'title' | 'kept' | 'none'

export interface RecordThreadResult {
  conversation: Conversation
  created: boolean
  added: number
  skipped: number
  listingMatchedBy: ListingMatch
}
