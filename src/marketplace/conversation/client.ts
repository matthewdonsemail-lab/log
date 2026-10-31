import type { TwentyClient, TwentyObjects } from '../../twenty/graphql/index'
import { listListingsWhere } from '../agencyListing/index'
import type { AgencyListing } from '../agencyListing/index'
import { fromTwentyEnum, toTwentyEnum } from '../socialAccount/helpers/index'
import { contactsIn, conversationKey, messageKey, nextLeadStatus, previewOf, sameTitle } from './helpers/index'
import type {
  AiStatus,
  Conversation,
  ConversationChannel,
  ConversationRow,
  LeadStatus,
  ListingMatch,
  Message,
  MessageDirection,
  MessageMedia,
  MessageRow,
  MessageStatus,
  RecordThreadResult,
  ScannedThread,
  SentBy
} from './types'
import { AI_STATUSES, LEAD_STATUSES, MESSAGE_STATUS_RANK, SENT_BY } from './types'

export const AGENCY_CONVERSATIONS = 'agencyConversations' as const
export const AGENCY_MESSAGES = 'agencyMessages' as const

type ConversationCreate = TwentyObjects['agencyConversations']['create']
type ConversationUpdate = TwentyObjects['agencyConversations']['update']
type MessageCreate = TwentyObjects['agencyMessages']['create']
export type ConversationFilter = TwentyObjects['agencyConversations']['filter']

const MARKETPLACE = toTwentyEnum('facebookMarketplace')

function pick<T extends string>(raw: unknown, allowed: readonly T[]): T | null {
  if (typeof raw !== 'string' || !raw) return null
  const value = fromTwentyEnum(raw)
  return (allowed as readonly string[]).includes(value) ? (value as T) : null
}

function mediaOf(raw: unknown): MessageMedia[] {
  let value = raw
  if (typeof raw === 'string') {
    try {
      value = JSON.parse(raw)
    } catch {
      return []
    }
  }
  return Array.isArray(value) ? value.filter((m) => m && typeof m.url === 'string').map((m) => ({ url: String(m.url), kind: String(m.kind ?? 'file') })) : []
}

export function toConversation(row: ConversationRow): Conversation {
  const channel: ConversationChannel = row.channel ? (fromTwentyEnum(row.channel) as ConversationChannel) : 'sms'
  const direction = row.latestDirection === 'inbound' || row.latestDirection === 'outbound' ? row.latestDirection : null
  return {
    id: row.id,
    channel,
    pairKey: row.pairKey ?? null,
    facebookThreadId: row.facebookThreadId ?? null,
    socialAccountId: row.socialAccountId ?? null,
    agencyListingId: row.agencyListingId ?? null,
    facebookListingId: row.facebookListingId ?? null,
    listingTitle: row.listingTitle ?? null,
    buyerName: row.buyerName ?? null,
    buyerFacebookId: row.buyerFacebookId ?? null,
    buyerProfileUrl: row.buyerProfileUrl ?? null,
    buyerPhone: row.buyerPhone ?? null,
    buyerEmail: row.buyerEmail ?? null,
    leadStatus: pick<LeadStatus>(row.leadStatus, LEAD_STATUSES),
    latestDirection: direction,
    latestPreview: row.latestPreview ?? null,
    latestMessageAt: row.latestMessageAt ?? null,
    latestMessageId: row.latestMessageId ?? null,
    messageCount: typeof row.messageCount === 'number' ? row.messageCount : 0,
    unreadCount: typeof row.unreadCount === 'number' ? row.unreadCount : 0,
    lastReadAt: row.lastReadAt ?? null,
    respondedAt: row.respondedAt ?? null,
    lastScannedAt: row.lastScannedAt ?? null,
    autoReplied: row.autoReplied === true,
    aiTookOver: row.aiTookOver === true
  }
}

export function toMessage(row: MessageRow): Message {
  const status = typeof row.status === 'string' && row.status in MESSAGE_STATUS_RANK ? (row.status as MessageStatus) : null
  return {
    id: row.id,
    conversationId: row.agencyConversationId ?? null,
    channel: row.channel ? (fromTwentyEnum(row.channel) as ConversationChannel) : 'sms',
    direction: row.direction === 'inbound' || row.direction === 'outbound' ? (row.direction as MessageDirection) : null,
    status,
    body: row.body ?? '',
    sentAt: row.sentAt ?? null,
    senderName: row.senderName ?? null,
    facebookMessageId: row.facebookMessageId ?? null,
    messageKey: row.messageKey ?? null,
    isRead: row.isRead === true,
    sentBy: pick<SentBy>(row.sentBy, SENT_BY),
    aiStatus: pick<AiStatus>(row.aiStatus, AI_STATUSES),
    aiOriginalText: row.aiOriginalText ?? null,
    media: mediaOf(row.media),
    createdAt: row.createdAt ?? null
  }
}

export async function listConversations(twenty: TwentyClient, where: { socialAccountId?: string; agencyListingId?: string } = {}): Promise<Conversation[]> {
  const and: ConversationFilter[] = [{ channel: { eq: MARKETPLACE as never } }]
  if (where.socialAccountId) and.push({ socialAccountId: { eq: where.socialAccountId } })
  if (where.agencyListingId) and.push({ agencyListingId: { eq: where.agencyListingId } })
  const rows = await twenty.list(AGENCY_CONVERSATIONS, { and })
  return rows.map(toConversation).sort((a, b) => (b.latestMessageAt ?? '').localeCompare(a.latestMessageAt ?? ''))
}

export async function getConversation(twenty: TwentyClient, id: string): Promise<Conversation | null> {
  const row = await twenty.get(AGENCY_CONVERSATIONS, id)
  return row ? toConversation(row) : null
}

export async function messagesOf(twenty: TwentyClient, conversationId: string): Promise<Message[]> {
  const rows = await twenty.list(AGENCY_MESSAGES, { agencyConversationId: { eq: conversationId } })
  return rows.map(toMessage).sort((a, b) => (a.sentAt ?? a.createdAt ?? '').localeCompare(b.sentAt ?? b.createdAt ?? ''))
}

export function matchListing(listings: AgencyListing[], thread: Pick<ScannedThread, 'facebookListingId' | 'listingTitle'>): { listing: AgencyListing | null; by: ListingMatch } {
  if (thread.facebookListingId) {
    const byId = listings.find((l) => l.listingId === thread.facebookListingId)
    if (byId) return { listing: byId, by: 'facebookListingId' }
  }
  const byTitle = listings.filter((l) => sameTitle(l.title, thread.listingTitle))
  return byTitle.length === 1 ? { listing: byTitle[0], by: 'title' } : { listing: null, by: 'none' }
}

export async function recordThread(twenty: TwentyClient, socialAccountId: string, thread: ScannedThread, now = new Date()): Promise<RecordThreadResult> {
  const pairKey = conversationKey(socialAccountId, thread.facebookThreadId)
  const [existingRow] = await twenty.list(AGENCY_CONVERSATIONS, { pairKey: { eq: pairKey } })
  let conversation = existingRow ? toConversation(existingRow) : null

  let listingMatchedBy: ListingMatch = conversation?.agencyListingId ? 'kept' : 'none'
  let agencyListingId = conversation?.agencyListingId ?? null
  if (!agencyListingId) {
    const match = matchListing(await listListingsWhere(twenty, { socialAccountId: { eq: socialAccountId } }), thread)
    agencyListingId = match.listing?.id ?? null
    listingMatchedBy = match.by
  }

  const created = !conversation
  if (!conversation) {
    const row = await twenty.create(AGENCY_CONVERSATIONS, {
      name: [thread.buyerName, thread.listingTitle].filter(Boolean).join(' · ') || thread.facebookThreadId,
      channel: MARKETPLACE as ConversationCreate['channel'],
      pairKey,
      facebookThreadId: thread.facebookThreadId,
      socialAccountId,
      agencyListingId,
      leadStatus: toTwentyEnum('new') as ConversationCreate['leadStatus'],
      messageCount: 0,
      unreadCount: 0
    })
    conversation = toConversation(row)
  }

  const stored = new Set((await messagesOf(twenty, conversation.id)).map((m) => m.messageKey))
  const fresh = thread.messages
    .map((message) => ({ message, key: messageKey(message) }))
    .filter(({ key }) => {
      if (stored.has(key)) return false
      stored.add(key)
      return true
    })

  let { latestMessageAt, latestDirection, latestPreview, latestMessageId, respondedAt, buyerPhone, buyerEmail } = conversation
  let messageCount = conversation.messageCount
  let unreadCount = conversation.unreadCount
  let replied = conversation.respondedAt !== null
  let phoneSeen = false
  for (const { message, key } of fresh) {
    const inbound = message.direction === 'inbound'
    const row = await twenty.create(AGENCY_MESSAGES, {
      name: previewOf(message.body).slice(0, 60) || key,
      agencyConversationId: conversation.id,
      channel: MARKETPLACE as MessageCreate['channel'],
      direction: message.direction,
      status: inbound ? 'received' : 'sent',
      body: message.body,
      sentAt: message.sentAt,
      senderName: message.senderName,
      facebookMessageId: message.facebookMessageId ?? null,
      messageKey: key,
      isRead: !inbound,
      sentBy: (inbound ? null : toTwentyEnum(message.sentBy ?? 'person')) as MessageCreate['sentBy'],
      media: (message.media ?? []) as unknown as MessageCreate['media']
    })
    messageCount++
    if (inbound) {
      unreadCount++
      const found = contactsIn(message.body)
      if (found.phone) {
        buyerPhone ??= found.phone
        phoneSeen = true
      }
      if (found.email) buyerEmail ??= found.email
    } else {
      replied = true
      respondedAt ??= message.sentAt ?? now.toISOString()
    }
    const at = message.sentAt ?? now.toISOString()
    if (!latestMessageAt || at >= latestMessageAt) {
      latestMessageAt = at
      latestDirection = message.direction
      latestPreview = previewOf(message.body)
      latestMessageId = row.id
    }
  }

  const update: ConversationUpdate = {
    buyerName: thread.buyerName ?? conversation.buyerName,
    buyerFacebookId: thread.buyerFacebookId ?? conversation.buyerFacebookId,
    buyerProfileUrl: thread.buyerProfileUrl ?? conversation.buyerProfileUrl,
    listingTitle: thread.listingTitle ?? conversation.listingTitle,
    facebookListingId: thread.facebookListingId ?? conversation.facebookListingId,
    agencyListingId,
    buyerPhone,
    buyerEmail,
    leadStatus: toTwentyEnum(nextLeadStatus(conversation.leadStatus, { replied, phone: phoneSeen })) as ConversationUpdate['leadStatus'],
    latestMessageAt,
    latestDirection,
    latestPreview,
    latestMessageId,
    messageCount,
    unreadCount,
    respondedAt,
    lastScannedAt: now.toISOString()
  }
  const saved = toConversation(await twenty.update(AGENCY_CONVERSATIONS, conversation.id, update))
  return { conversation: saved, created, added: fresh.length, skipped: thread.messages.length - fresh.length, listingMatchedBy }
}

export async function markRead(twenty: TwentyClient, conversationId: string, now = new Date()): Promise<number> {
  const unread = (await messagesOf(twenty, conversationId)).filter((m) => m.direction === 'inbound' && !m.isRead)
  for (const message of unread) await twenty.update(AGENCY_MESSAGES, message.id, { isRead: true })
  await twenty.update(AGENCY_CONVERSATIONS, conversationId, { unreadCount: 0, lastReadAt: now.toISOString() })
  return unread.length
}

export async function setLeadStatus(twenty: TwentyClient, conversationId: string, status: LeadStatus): Promise<Conversation> {
  return toConversation(await twenty.update(AGENCY_CONVERSATIONS, conversationId, { leadStatus: toTwentyEnum(status) as ConversationUpdate['leadStatus'] }))
}

export async function linkListing(twenty: TwentyClient, conversationId: string, agencyListingId: string): Promise<Conversation> {
  return toConversation(await twenty.update(AGENCY_CONVERSATIONS, conversationId, { agencyListingId }))
}
