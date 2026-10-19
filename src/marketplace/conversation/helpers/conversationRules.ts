import { createHash } from 'node:crypto'
import type { LeadStatus, MessageStatus, ScannedMessage } from '../types'
import { MESSAGE_STATUS_RANK } from '../types'

/** The conversation's key: one per account and Facebook thread. Pure. */
export function conversationKey(socialAccountId: string, facebookThreadId: string): string {
  return `facebookMarketplace:${socialAccountId}:${facebookThreadId}`
}

/**
 * A message's key inside its conversation: Facebook's message id when the
 * page gives it, else a hash of direction, sender, time and text. Listaro
 * hashed `new Date()` in, so every rescan stored the message again; this uses
 * the time the thread shows, so a rescan finds the same key. Pure.
 */
export function messageKey(message: ScannedMessage): string {
  if (message.facebookMessageId) return `fb:${message.facebookMessageId}`
  const text = [message.direction, (message.senderName ?? '').trim().toLowerCase(), message.sentAt ?? '', message.body.trim()].join('|')
  return `h:${createHash('sha256').update(text).digest('hex').slice(0, 32)}`
}

/** The thread list's one-line preview (blaster: 120 characters). Pure. */
export function previewOf(body: string): string {
  const flat = body.replace(/\s+/g, ' ').trim()
  return flat.length > 120 ? `${flat.slice(0, 119)}…` : flat
}

const PHONE = /(?:\+?\d[\d\s().-]{7,}\d)/
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i

/** A phone number and an email the buyer wrote, if any (Listaro qualifies a lead on a phone). Pure. */
export function contactsIn(text: string): { phone: string | null; email: string | null } {
  const phone = PHONE.exec(text)?.[0].replace(/[^\d+]/g, '') ?? null
  return { phone: phone && phone.replace(/\D/g, '').length >= 8 ? phone : null, email: EMAIL.exec(text)?.[0] ?? null }
}

/** blaster's rule: a message status only moves up its rank; an older one is ignored. Pure. */
export function nextMessageStatus(current: MessageStatus | null, incoming: MessageStatus): MessageStatus {
  if (!current) return incoming
  return MESSAGE_STATUS_RANK[incoming] > MESSAGE_STATUS_RANK[current] ? incoming : current
}

/**
 * Listaro's lead movement: a reply from us makes a NEW lead CONTACTED, a
 * phone from the buyer makes it QUALIFIED. BOOKED, LOST and SPAM are set by
 * a person and never moved by a scan. Pure.
 */
export function nextLeadStatus(current: LeadStatus | null, seen: { replied: boolean; phone: boolean }): LeadStatus {
  const status = current ?? 'new'
  if (status === 'booked' || status === 'lost' || status === 'spam' || status === 'qualified') return status
  if (seen.phone) return 'qualified'
  if (seen.replied) return 'contacted'
  return status
}

/** Two listing titles name the same listing: case, spacing and punctuation aside. Pure. */
export function sameTitle(a: string | null | undefined, b: string | null | undefined): boolean {
  const norm = (s: string | null | undefined) => (s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  return norm(a) !== '' && norm(a) === norm(b)
}
