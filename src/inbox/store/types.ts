export interface StoredEvent {
  seq: number
  eventId: string
  platform: string
  account: string
  conversationId: string
  type: string
  known: number
  withWho: string
  text: string
  box: string
  payload: string
  sourceAt: string
  receivedAt: string
  appendedAt: string
  ownerPid: number
}

export interface OwnerRow {
  platform: string
  account: string
  pid: number
  hostname: string
  startedAt: string
  heartbeat: string
  status: string
  port: number
  token: string
  subscribers: number
  generation: number
}

export interface ClaimRow {
  chatKey: string
  platform: string
  account: string
  conversationId: string
  parties: string
  withWho: string | null
  eventId: string | null
  holder: number
  generation: number
  claimedAt: string
  expiresAt: string
}

export type Stage = 'received' | 'appended' | 'relayed' | 'shown' | 'claimed' | 'actionStart' | 'confirmed' | 'indexed'

export const STAGES: readonly Stage[] = ['received', 'appended', 'relayed', 'shown', 'claimed', 'actionStart', 'confirmed', 'indexed']

export const KNOWN_TYPES: Record<string, readonly string[]> = {
  twitter: ['message', 'watching', 'socket', 'badge', 'notification', 'pollRefused', 'notificationsRefused'],
  discord: ['message', 'watching', 'open'],
  slack: ['message', 'watching', 'hello', 'reconnect_url'],
  instagram: ['message', 'watching'],
}

export const INTERNAL_TYPES: readonly string[] = ['relayJoined']
