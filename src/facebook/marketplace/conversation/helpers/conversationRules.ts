import { createHash } from 'node:crypto'
import type { LeadStatus, MessageStatus, ScannedMessage } from '../types'
import { MESSAGE_STATUS_RANK } from '../types'

export function conversationKey(socialAccountId: string, facebookThreadId: string): string {
  return `facebookMarketplace:${socialAccountId}:${facebookThreadId}`
}

export function messageKey(message: ScannedMessage): string {
  if (message.facebookMessageId) return `fb:${message.facebookMessageId}`
  const text = [message.direction, (message.senderName ?? '').trim().toLowerCase(), message.sentAt ?? '', message.body.trim()].join('|')
  return `h:${createHash('sha256').update(text).digest('hex').slice(0, 32)}`
}

export function previewOf(body: string): string {
  const flat = body.replace(/\s+/g, ' ').trim()
  return flat.length > 120 ? `${flat.slice(0, 119)}…` : flat
}

const PHONE = /(?:\+?\d[\d\s().-]{7,}\d)/
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i

export function contactsIn(text: string): { phone: string | null; email: string | null } {
  const phone = PHONE.exec(text)?.[0].replace(/[^\d+]/g, '') ?? null
  return { phone: phone && phone.replace(/\D/g, '').length >= 8 ? phone : null, email: EMAIL.exec(text)?.[0] ?? null }
}

export function nextMessageStatus(current: MessageStatus | null, incoming: MessageStatus): MessageStatus {
  if (!current) return incoming
  return MESSAGE_STATUS_RANK[incoming] > MESSAGE_STATUS_RANK[current] ? incoming : current
}

export function nextLeadStatus(current: LeadStatus | null, seen: { replied: boolean; phone: boolean }): LeadStatus {
  const status = current ?? 'new'
  if (status === 'booked' || status === 'lost' || status === 'spam' || status === 'qualified') return status
  if (seen.phone) return 'qualified'
  if (seen.replied) return 'contacted'
  return status
}

export function sameTitle(a: string | null | undefined, b: string | null | undefined): boolean {
  const norm = (s: string | null | undefined) => (s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  return norm(a) !== '' && norm(a) === norm(b)
}
