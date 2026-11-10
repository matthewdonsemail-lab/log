export const RECENT_PER_CHAT = 60

export const MIN_MIRROR_CHARS = 12

export const REACTION = /^\(reacted ([^)]*)\)$/

export const NOT_SAID = /^\((read|could not open|encrypted X Chat message)|^> \*/

export interface LastWordMessage {
  conversationId: string
  seq: number
  ms: number
  at: string
  fromOwner: boolean
  senderUserId: string
  senderLabel: string | null
  text: string
  files: number
}

export interface LastWord {
  platform: string
  account: string
  kind: 'dm' | 'group'
  personKey: string
  conversationIds: string[]
  with: string
  lastAt: string
  lastFromMe: boolean
  lastText: string
  theyReacted: string | null
  youReactedOnly: boolean
  waiting: boolean
  followUp: boolean
}

export interface LastWordQuery {
  platform?: string
  account?: string
}
