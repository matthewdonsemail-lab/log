export interface ChatClaim {
  key: string
  platform: string
  account: string
  conversationId: string
  parties: string[]
  with?: string
  eventId?: string
  by: number
  generation: number
  claimedAt: string
  expiresAt: string
}

export interface ChatRef {
  platform: string
  account: string
  conversationId: string
  with?: string
  eventId?: string
}

export interface ActionRecord {
  at: string
  kind: 'claimed' | 'renewed' | 'released' | 'refused' | 'sent' | 'interrupted' | 'failed'
  platform: string
  account: string
  conversationId: string
  with?: string
  eventId?: string
  by: number
  generation?: number
  stateBefore?: string
  detail?: string
}

export const CLAIM_TTL_MS = 10 * 60_000
