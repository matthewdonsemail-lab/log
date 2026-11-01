import type { TwitterNotification } from '../../notification/feed/types'

export interface BadgeCounts {
  dm_unread_count?: number
  ntab_unread_count?: number
  xchat_unread_count?: number
  total_unread_count?: number
}

export type LiveEvent =
  | ({ type: 'badge'; seenAt: string } & BadgeCounts)
  | ({ type: 'notification'; seenAt: string } & TwitterNotification)
  | { type: 'notificationsRefused' | 'pollRefused'; seenAt: string; code?: string; detail?: string; error?: string }

export interface AccountLive {
  account: string
  events: LiveEvent[]
  latest: (LiveEvent & { type: 'badge' }) | null
  firstLook: boolean
}
