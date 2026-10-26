export type QueueAction = 'reply' | 'quote' | 'dm'

export const QUEUE_ACTIONS: readonly QueueAction[] = ['reply', 'quote', 'dm']

export type ItemStatus = 'pending' | 'sent' | 'blocked' | 'gone' | 'failed' | 'skipped'

export const ITEM_STATUSES: readonly ItemStatus[] = ['pending', 'sent', 'blocked', 'gone', 'failed', 'skipped']

export interface QueueItem {
  n: number
  action: QueueAction
  handle?: string | null
  text: string
  tweetUrl?: string
  userId?: string
  postText?: string
  status: ItemStatus
  sentId?: string | null
  sentUrl?: string | null
  result?: string
  attemptedAt?: string
  likedAt?: string
  sentAtRun?: string
}

export interface QueueApproval {
  by: string
  at: string
  fingerprint: string
  count: number
}

export type EventKind = 'like' | 'reply'

export interface PlanEvent {
  n: number
  kind: EventKind
  at: string
  done?: string
  skipped?: string
  fails?: number
}

export interface RandomPlan {
  planned: string
  window: string
  minGap: number
  events: PlanEvent[]
}

export interface Queue {
  created: string
  account: string
  approval: QueueApproval | null
  sources?: string[]
  items: QueueItem[]
  randomRun?: RandomPlan
}

export interface BuildTarget {
  handle?: string | null
  tweetUrl?: string
  userId?: string
  postText?: string
  text?: string
}

export interface PlanOptions {
  limit: number
  window: string
  start: Date
  minGap: number
  like: boolean
  likeChance: number
}

export type Rng = () => number
