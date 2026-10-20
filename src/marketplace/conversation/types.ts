/**
 * A buyer's conversation about a Marketplace listing (rule 34), in Twenty's
 * `agencyConversations` and `agencyMessages`, the same objects blaster's SMS
 * threads use. log-cli added the Marketplace fields and the relations
 * (`scripts/twenty/twentySetup.mjs`): a conversation is about one `agencyListing` on
 * one `socialAccount`, and each message belongs to one conversation.
 *
 * The shape is Listaro's (`leads` + `inbox_messages`) keyed on Facebook's own
 * ids: Listaro keyed threads on a hash of the buyer's name, so one buyer
 * writing about two listings was one lead, and stored the listing as a title
 * only. Here the key is the account plus Facebook's thread id, and the
 * listing is a relation. blaster's rules are kept where they overlap:
 * `latest*` only moves forward, a message's status only moves up.
 *
 * SELECT values are UPPER_SNAKE in Twenty and camelCase here (rule 1).
 */
import type { AgencyConversation as ConversationRecord, AgencyMessage as MessageRecord } from '../../twenty/graphql/generated/index'
import type { AGENCY_CONVERSATION_FIELDS, AGENCY_MESSAGE_FIELDS } from '../../twenty/graphql/client'

export const CHANNELS = ['sms', 'facebookMarketplace'] as const
export type ConversationChannel = (typeof CHANNELS)[number]

/** Where the buyer is (Listaro's lead statuses). booked, lost and spam are set by hand. */
export const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'booked', 'lost', 'spam'] as const
export type LeadStatus = (typeof LEAD_STATUSES)[number]

export type MessageDirection = 'inbound' | 'outbound'

/** blaster's order (`packages/core/src/conversation/history/helpers/status.ts`): a status only moves up. */
export const MESSAGE_STATUS_RANK = { unknown: 0, received: 1, queued: 2, sent: 3, undelivered: 4, failed: 5, delivered: 6 } as const
export type MessageStatus = keyof typeof MESSAGE_STATUS_RANK

/** Who wrote an outbound message (Listaro's sent_by). */
export const SENT_BY = ['person', 'va', 'ai', 'system'] as const
export type SentBy = (typeof SENT_BY)[number]

/** An AI-drafted reply (Listaro's ai_status). */
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
  /** facebookMarketplace:<socialAccountId>:<facebookThreadId> */
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

/** One message as a scan of the thread saw it. */
export interface ScannedMessage {
  direction: MessageDirection
  body: string
  /** When the thread shows it was sent (ISO), or null when the page gives no time. */
  sentAt: string | null
  senderName: string | null
  facebookMessageId?: string | null
  media?: MessageMedia[]
  /** Outbound only: who wrote it. */
  sentBy?: SentBy | null
}

/** One Marketplace thread as a scan of the account's inbox saw it. */
export interface ScannedThread {
  facebookThreadId: string
  buyerName: string | null
  buyerFacebookId?: string | null
  buyerProfileUrl?: string | null
  listingTitle?: string | null
  facebookListingId?: string | null
  messages: ScannedMessage[]
}

/** How the thread was tied to an agencyListing row. */
export type ListingMatch = 'facebookListingId' | 'title' | 'kept' | 'none'

export interface RecordThreadResult {
  conversation: Conversation
  created: boolean
  added: number
  skipped: number
  listingMatchedBy: ListingMatch
}
