import type { EventInsert, IdentityProfileFields } from '../types'
import { derivedEventId } from './time'

export function attachmentsSeenEvent(target: { platform: string; account: string; conversationId: string }, messageKey: string, attachments: readonly Record<string, unknown>[], platformMessageId: string | null = null): EventInsert {
  const payload = { messageKey, attachments, ...(platformMessageId ? { platformMessageId } : {}) }
  return { eventId: derivedEventId('attachmentsSeen', [messageKey, JSON.stringify(attachments), platformMessageId ?? '']), platform: target.platform, account: target.account, conversationId: target.conversationId, type: 'attachmentsSeen', with: '', text: '', box: '', payload, sourceAt: '', receivedAt: new Date().toISOString(), source: 'derived', known: true }
}

export function messageEditedEvent(target: { platform: string; account: string; conversationId: string }, messageKey: string, text: string, at: string): EventInsert {
  return { eventId: derivedEventId('messageEdited', [messageKey, text]), platform: target.platform, account: target.account, conversationId: target.conversationId, type: 'messageEdited', with: '', text, box: '', payload: { messageKey }, sourceAt: '', receivedAt: at, source: 'derived', known: true }
}

export function conversationSeenEvent(target: { platform: string; account: string; conversationId: string }, box: string, members: readonly string[], at: string, source = 'read'): EventInsert {
  return { eventId: derivedEventId('conversationSeen', [target.platform, target.account, target.conversationId, box, members.join('\u0000')]), platform: target.platform, account: target.account, conversationId: target.conversationId, type: 'conversationSeen', with: '', text: '', box, payload: { members: [...members] }, sourceAt: '', receivedAt: at, source, known: true }
}

export function normalHandle(handle: string): string {
  return handle.replace(/^@/, '').trim().toLowerCase()
}

export function identityLearnedEvent(platform: string, account: string, userId: string, handle: string, displayName: string | null, at: string, source = 'derived'): EventInsert {
  return { eventId: derivedEventId('identityLearned', [platform, normalHandle(handle), userId]), platform, account, conversationId: '', type: 'identityLearned', with: handle.replace(/^@/, ''), text: '', box: '', payload: { userId, handle: handle.replace(/^@/, ''), ...(displayName ? { displayName } : {}) }, sourceAt: '', receivedAt: at, source, known: true }
}

export function accountIdentifiedEvent(platform: string, account: string, userId: string, at: string, source = 'session'): EventInsert {
  return { eventId: derivedEventId('accountIdentified', [platform, account, userId]), platform, account, conversationId: '', type: 'accountIdentified', with: '', text: '', box: '', payload: { userId }, sourceAt: '', receivedAt: at, source, known: true }
}

export function profileSeenEvent(platform: string, account: string, userId: string, fields: IdentityProfileFields, at: string, source = 'derived'): EventInsert {
  return { eventId: derivedEventId('profileSeen', [platform, userId, JSON.stringify(fields)]), platform, account, conversationId: '', type: 'profileSeen', with: '', text: '', box: '', payload: { userId, ...fields }, sourceAt: '', receivedAt: at, source, known: true }
}
