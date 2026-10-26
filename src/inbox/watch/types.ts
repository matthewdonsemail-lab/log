export interface InboxThread {
  conversationId: string
  with: string
  lastAt: string | null
  lastFromMe: boolean
  lastText: string | null
  box: string
}

export interface InboxReader {
  platform: string
  accounts: () => string[]
  read: (account: string) => InboxThread[] | null
}

export interface InboxMessage {
  platform: string
  account: string
  conversationId: string
  with: string
  text: string
  at: string
  box: string
  seenAt: string
}

export type SeenThreads = Record<string, string>

export interface PollPlan {
  nextAt: string
}

export const POLL_MIN_SECONDS = 4 * 60
export const POLL_MAX_SECONDS = 8 * 60
export const POLL_LOCK_SECONDS = 10 * 60
