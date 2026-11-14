export type NotificationKind = 'like' | 'repost' | 'reply' | 'quote' | 'follow' | 'mention' | 'other'

export const NOTIFICATION_TYPES = {
  likes: ['like'],
  reposts: ['repost'],
  replies: ['reply'],
  quotes: ['quote'],
  follows: ['follow'],
  all: ['like', 'repost', 'reply', 'quote', 'follow', 'mention', 'other'],
} as const satisfies Record<string, readonly NotificationKind[]>

export type NotificationType = keyof typeof NOTIFICATION_TYPES

export type NotificationSource = 'notification' | 'engagements'

export const ENGAGER_KINDS = ['like', 'repost'] as const satisfies readonly NotificationKind[]

export type EngagerKind = (typeof ENGAGER_KINDS)[number]

export interface TwitterNotification {
  key: string
  kind: NotificationKind
  at: string | null
  userId: string
  handle?: string | null
  name?: string | null
  followsYou?: boolean | null
  youFollow?: boolean | null
  followers?: number | null
  postId?: string | null
  postText?: string | null
  postUrl?: string | null
  tweetId?: string
  tweetUrl?: string | null
  text?: string
  notificationId?: string
  message?: string
  source?: NotificationSource
}

export interface EngagerProgress {
  cursor: string | null
  done: boolean
  pages: number
  seen: number
  added: number
  ownAction?: boolean
  syncedAt: string | null
}

export type PostEngagements = Partial<Record<EngagerKind, EngagerProgress>>

export interface NotificationStore {
  version: number
  userId: string
  bottomCursor: string | null
  historyDone: boolean
  syncedAt: string | null
  rows: Record<string, TwitterNotification>
  engagements?: Record<string, PostEngagements>
}

export interface EngagerCounts {
  fromNotifications: number
  addedByUnroll: number
  total: number
}

export type EngagerReadState = 'readToTheEnd' | 'stoppedBeforeTheEnd' | 'notUnrolled'

export interface EngagerSummary extends EngagerCounts {
  state: EngagerReadState
  pages: number
  syncedAt: string | null
}

export interface PostEngagerSummary {
  postId: string
  likes: EngagerSummary
  reposts: EngagerSummary
}

export interface EngagerSync {
  postId: string
  kind: EngagerKind
  pages: number
  newRows: number
  resumed: boolean
  done: boolean
  stoppedBy: 'end' | 'pageCap'
  counts: EngagerCounts
  syncedAt: string | null
}

export interface UnrollCandidate {
  postId: string
  kinds: EngagerKind[]
  latestAt: string | null
}

export interface NotificationSync {
  mode: 'first' | 'newest' | 'full'
  pages: number
  newRows: number
  total: number
  historyDone: boolean
  stoppedBy: 'caughtUp' | 'newestCap' | 'pageCap' | 'historyDone'
  syncedAt: string | null
}

export interface NotificationQuery {
  kinds: readonly NotificationKind[]
  since?: string
  postId?: string
  limit?: number
}

export interface NotificationEngager {
  userId: string
  handle?: string | null
  name?: string | null
  followsYou?: boolean | null
  kinds: Partial<Record<NotificationKind, number>>
  lastAt: string | null
}
