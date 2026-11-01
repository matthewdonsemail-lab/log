import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { NOTIFICATION_TYPES } from './types'
import type { NotificationEngager, NotificationKind, NotificationQuery, NotificationStore, NotificationType, TwitterNotification } from './types'

export function notificationStorePath(account: string, root = process.env.LOG_TWITTER_STATE || join(homedir(), '.logCli', 'twitter')): string {
  return join(root, account, 'notifications.json')
}

export function readNotificationStore(path: string): NotificationStore | null {
  if (!existsSync(path)) return null
  try {
    const store = JSON.parse(readFileSync(path, 'utf8')) as NotificationStore
    return store && typeof store === 'object' && store.rows && typeof store.rows === 'object' ? store : null
  } catch {
    return null
  }
}

export function isNotificationType(value: string): value is NotificationType {
  return Object.hasOwn(NOTIFICATION_TYPES, value)
}

export function postIdOf(value: string): string | null {
  const trimmed = value.trim()
  if (/^\d+$/.test(trimmed)) return trimmed
  return trimmed.match(/\/status(?:es)?\/(\d+)/)?.[1] ?? null
}

const newestFirst = (a: TwitterNotification, b: TwitterNotification): number => (b.at ?? '').localeCompare(a.at ?? '') || a.key.localeCompare(b.key)

export function queryNotifications(store: NotificationStore | null, query: NotificationQuery): TwitterNotification[] {
  if (!store) return []
  const kinds = new Set<NotificationKind>(query.kinds)
  const since = query.since ? Date.parse(query.since) : null
  const rows = Object.values(store.rows)
    .filter((row) => kinds.has(row.kind))
    .filter((row) => since === null || (row.at !== null && Date.parse(row.at) >= since))
    .filter((row) => !query.postId || row.postId === query.postId)
    .sort(newestFirst)
  return query.limit === undefined ? rows : rows.slice(0, query.limit)
}

export function countByKind(rows: readonly TwitterNotification[]): Partial<Record<NotificationKind, number>> {
  const out: Partial<Record<NotificationKind, number>> = {}
  for (const row of rows) out[row.kind] = (out[row.kind] ?? 0) + 1
  return out
}

export function engagersOf(rows: readonly TwitterNotification[]): NotificationEngager[] {
  const people = new Map<string, NotificationEngager>()
  for (const row of rows) {
    const held = people.get(row.userId) ?? { userId: row.userId, handle: row.handle, name: row.name, followsYou: row.followsYou, kinds: {}, lastAt: null }
    held.kinds[row.kind] = (held.kinds[row.kind] ?? 0) + 1
    if (row.at && (!held.lastAt || row.at > held.lastAt)) held.lastAt = row.at
    people.set(row.userId, held)
  }
  const total = (e: NotificationEngager) => Object.values(e.kinds).reduce((a, b) => a + (b ?? 0), 0)
  return [...people.values()].sort((a, b) => total(b) - total(a) || (b.lastAt ?? '').localeCompare(a.lastAt ?? ''))
}
