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
}

export interface NotificationStore {
  version: number
  userId: string
  bottomCursor: string | null
  historyDone: boolean
  syncedAt: string | null
  rows: Record<string, TwitterNotification>
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
