import { describe, expect, test } from 'bun:test'
import { marketplaceFixture } from '../../twenty/graphql/helpers/marketplaceFixture'
import {
  contactsIn,
  conversationKey,
  listConversations,
  markRead,
  matchListing,
  messageKey,
  messagesOf,
  nextLeadStatus,
  nextMessageStatus,
  recordThread,
  setLeadStatus
} from './index'
import type { ScannedThread } from './types'

const NOW = new Date('2026-10-19T15:00:00.000Z')

const thread = (extra: Partial<ScannedThread> = {}): ScannedThread => ({
  facebookThreadId: '9001',
  buyerName: 'Sam Buyer',
  listingTitle: 'Rubbish Removal Galway',
  facebookListingId: '111',
  messages: [
    { direction: 'inbound', body: 'Is this still available?', sentAt: '2026-10-19T14:00:00.000Z', senderName: 'Sam Buyer' },
    { direction: 'inbound', body: 'Can you take a sofa on Friday?', sentAt: '2026-10-19T14:01:00.000Z', senderName: 'Sam Buyer' }
  ],
  ...extra
})

describe('conversation rules', () => {
  test('the key is the account and the Facebook thread', () => {
    expect(conversationKey('galwayOne', '9001')).toBe('facebookMarketplace:galwayOne:9001')
  })

  test("a message key uses Facebook's id, else a stable hash of what the thread shows", () => {
    const m = { direction: 'inbound' as const, body: 'Hi', sentAt: '2026-10-19T14:00:00.000Z', senderName: 'Sam' }
    expect(messageKey({ ...m, facebookMessageId: 'mid.1' })).toBe('fb:mid.1')
    expect(messageKey(m)).toBe(messageKey({ ...m, senderName: ' sam ' }))
    expect(messageKey(m)).not.toBe(messageKey({ ...m, sentAt: '2026-10-19T14:05:00.000Z' }))
  })

  test('contacts: a phone of 8+ digits and an email', () => {
    expect(contactsIn('call me on 087 123 4567 or sam@example.com')).toEqual({ phone: '0871234567', email: 'sam@example.com' })
    expect(contactsIn('see you at 10:30 on the 19th')).toEqual({ phone: null, email: null })
  })

  test("a message status only moves up blaster's rank", () => {
    expect(nextMessageStatus('delivered', 'sent')).toBe('delivered')
    expect(nextMessageStatus('sent', 'delivered')).toBe('delivered')
    expect(nextMessageStatus(null, 'received')).toBe('received')
  })

  test('a lead: a reply makes it contacted, a phone qualified, a person’s call is never moved', () => {
    expect(nextLeadStatus(null, { replied: false, phone: false })).toBe('new')
    expect(nextLeadStatus('new', { replied: true, phone: false })).toBe('contacted')
    expect(nextLeadStatus('contacted', { replied: true, phone: true })).toBe('qualified')
    expect(nextLeadStatus('booked', { replied: true, phone: true })).toBe('booked')
    expect(nextLeadStatus('spam', { replied: true, phone: false })).toBe('spam')
  })
})

describe('recordThread', () => {
  test('a new thread becomes a conversation tied to its listing and account, with its messages', async () => {
    const twenty = marketplaceFixture()
    const result = await recordThread(twenty, 'galwayOne', thread(), NOW)
    expect(result).toMatchObject({ created: true, added: 2, skipped: 0, listingMatchedBy: 'facebookListingId' })
    expect(result.conversation).toMatchObject({
      channel: 'facebookMarketplace',
      pairKey: 'facebookMarketplace:galwayOne:9001',
      socialAccountId: 'galwayOne',
      agencyListingId: 'liveOne',
      buyerName: 'Sam Buyer',
      leadStatus: 'new',
      latestDirection: 'inbound',
      latestPreview: 'Can you take a sofa on Friday?',
      latestMessageAt: '2026-10-19T14:01:00.000Z',
      messageCount: 2,
      unreadCount: 2,
      lastScannedAt: NOW.toISOString()
    })
    const messages = await messagesOf(twenty, result.conversation.id)
    expect(messages.map((m) => [m.direction, m.status, m.isRead, m.channel])).toEqual([
      ['inbound', 'received', false, 'facebookMarketplace'],
      ['inbound', 'received', false, 'facebookMarketplace']
    ])
  })

  test('scanning the same thread again adds nothing', async () => {
    const twenty = marketplaceFixture()
    await recordThread(twenty, 'galwayOne', thread(), NOW)
    const again = await recordThread(twenty, 'galwayOne', thread(), NOW)
    expect(again).toMatchObject({ created: false, added: 0, skipped: 2, listingMatchedBy: 'kept' })
    expect(again.conversation.messageCount).toBe(2)
    expect(twenty.rows.agencyMessages).toHaveLength(2)
    expect(twenty.rows.agencyConversations).toHaveLength(1)
  })

  test('our reply and a phone number move the lead; the summary only moves forward', async () => {
    const twenty = marketplaceFixture()
    await recordThread(twenty, 'galwayOne', thread(), NOW)
    const next = thread({
      messages: [
        ...thread().messages,
        { direction: 'outbound', body: 'Yes, Friday works.', sentAt: '2026-10-19T14:10:00.000Z', senderName: 'Galway One' },
        { direction: 'inbound', body: 'Great, my number is 087 123 4567', sentAt: '2026-10-19T14:12:00.000Z', senderName: 'Sam Buyer' },
        { direction: 'inbound', body: 'hello?', sentAt: '2026-10-19T13:00:00.000Z', senderName: 'Sam Buyer' }
      ]
    })
    const result = await recordThread(twenty, 'galwayOne', next, NOW)
    expect(result.added).toBe(3)
    expect(result.conversation).toMatchObject({
      leadStatus: 'qualified',
      buyerPhone: '0871234567',
      respondedAt: '2026-10-19T14:10:00.000Z',
      latestPreview: 'Great, my number is 087 123 4567',
      latestMessageAt: '2026-10-19T14:12:00.000Z',
      messageCount: 5,
      unreadCount: 4
    })
    const ours = (await messagesOf(twenty, result.conversation.id)).find((m) => m.direction === 'outbound')
    expect(ours).toMatchObject({ status: 'sent', isRead: true, sentBy: 'person' })
  })

  test('the same thread id on two accounts is two conversations', async () => {
    const twenty = marketplaceFixture()
    await recordThread(twenty, 'galwayOne', thread(), NOW)
    await recordThread(twenty, 'galwayTwo', thread({ facebookListingId: '222' }), NOW)
    expect(twenty.rows.agencyConversations).toHaveLength(2)
    expect((await listConversations(twenty, { agencyListingId: 'liveTwo' })).map((c) => c.socialAccountId)).toEqual(['galwayTwo'])
  })

  test('marking read clears the unread count; a lead status can be set by hand', async () => {
    const twenty = marketplaceFixture()
    const { conversation } = await recordThread(twenty, 'galwayOne', thread(), NOW)
    expect(await markRead(twenty, conversation.id, NOW)).toBe(2)
    const [read] = await listConversations(twenty, { socialAccountId: 'galwayOne' })
    expect(read).toMatchObject({ unreadCount: 0, lastReadAt: NOW.toISOString() })
    expect((await messagesOf(twenty, conversation.id)).every((m) => m.isRead)).toBe(true)
    expect((await setLeadStatus(twenty, conversation.id, 'booked')).leadStatus).toBe('booked')
    const later = await recordThread(twenty, 'galwayOne', thread({ messages: [{ direction: 'inbound', body: '087 765 4321', sentAt: '2026-10-19T16:00:00.000Z', senderName: 'Sam Buyer' }] }), NOW)
    expect(later.conversation.leadStatus).toBe('booked')
  })

  test("SMS rows (blaster's) are not Marketplace conversations", async () => {
    const twenty = marketplaceFixture()
    twenty.rows.agencyConversations = [{ id: 'sms1', pairKey: '+3531|+3532', peerPhone: '+3531', latestMessageAt: '2026-10-19T10:00:00.000Z' }]
    await recordThread(twenty, 'galwayOne', thread(), NOW)
    expect((await listConversations(twenty)).map((c) => c.id)).not.toContain('sms1')
  })
})

describe('matchListing', () => {
  const listing = (id: string, title: string, listingId: string | null = null) => ({ id, title, listingId }) as never

  test("Facebook's listing id first, then a title only when exactly one listing has it", () => {
    const listings = [listing('a', 'Rubbish Removal Galway', '111'), listing('b', 'Garden Clearance'), listing('c', 'Garden clearance!')]
    expect(matchListing(listings, { facebookListingId: '111', listingTitle: 'whatever' })).toMatchObject({ by: 'facebookListingId' })
    expect(matchListing(listings, { facebookListingId: null, listingTitle: 'rubbish removal galway' })).toMatchObject({ by: 'title' })
    expect(matchListing(listings, { facebookListingId: null, listingTitle: 'Garden Clearance' })).toEqual({ listing: null, by: 'none' })
  })
})
