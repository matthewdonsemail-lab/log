import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { ENGAGER_KINDS, NOTIFICATION_TYPES } from './types'
import type { EngagerCounts, EngagerKind, EngagerSummary, NotificationEngager, NotificationKind, NotificationQuery, NotificationStore, NotificationType, PostEngagerSummary, TwitterNotification, UnrollCandidate } from './types'

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

export function notificationsFresh(store: NotificationStore | null, now: Date, seconds = 120): boolean {
  return Boolean(store?.syncedAt && now.getTime() - Date.parse(store.syncedAt) < seconds * 1000)
}

export function engagerCountsOf(store: NotificationStore | null, postId: string, kind: EngagerKind): EngagerCounts {
  const rows = store ? Object.values(store.rows).filter((row) => row.kind === kind && row.postId === postId) : []
  const addedByUnroll = rows.filter((row) => row.source === 'engagements').length
  return { fromNotifications: rows.length - addedByUnroll, addedByUnroll, total: rows.length }
}

export function engagerSummaryOf(store: NotificationStore | null, postId: string, kind: EngagerKind): EngagerSummary {
  const progress = store?.engagements?.[postId]?.[kind]
  const state = !progress ? 'notUnrolled' : progress.done ? 'readToTheEnd' : 'stoppedBeforeTheEnd'
  return { ...engagerCountsOf(store, postId, kind), state, pages: progress?.pages ?? 0, syncedAt: progress?.syncedAt ?? null }
}

export function postEngagerSummaryOf(store: NotificationStore | null, postId: string): PostEngagerSummary {
  return { postId, likes: engagerSummaryOf(store, postId, 'like'), reposts: engagerSummaryOf(store, postId, 'repost') }
}

const AGGREGATED = /\bothers?\b/i

function ownPost(row: TwitterNotification, account: string): boolean {
  return Boolean(row.postId && row.postUrl?.toLowerCase().includes(`/${account.toLowerCase()}/status/`))
}

export function unrollCandidatesOf(store: NotificationStore | null, account: string, since?: string): UnrollCandidate[] {
  if (!store) return []
  const from = since ? Date.parse(since) : null
  const named = Object.values(store.rows).filter((row) => (ENGAGER_KINDS as readonly NotificationKind[]).includes(row.kind) && row.source !== 'engagements' && ownPost(row, account))
  const sharing = new Map<string, number>()
  for (const row of named) if (row.notificationId) sharing.set(row.notificationId, (sharing.get(row.notificationId) ?? 0) + 1)
  const wanted = new Map<string, UnrollCandidate>()
  for (const row of named) {
    const aggregated = AGGREGATED.test(row.message ?? '') || (row.notificationId !== undefined && (sharing.get(row.notificationId) ?? 0) > 1)
    if (!aggregated || (from !== null && (row.at === null || Date.parse(row.at) < from))) continue
    const kind = row.kind as EngagerKind
    const progress = store.engagements?.[row.postId!]?.[kind]
    if (progress?.done && progress.syncedAt && (row.at === null || progress.syncedAt >= row.at)) continue
    const held = wanted.get(row.postId!) ?? { postId: row.postId!, kinds: [], latestAt: null }
    if (!held.kinds.includes(kind)) held.kinds.push(kind)
    if (row.at && (!held.latestAt || row.at > held.latestAt)) held.latestAt = row.at
    wanted.set(row.postId!, held)
  }
  return [...wanted.values()]
    .map((candidate) => ({ ...candidate, kinds: ENGAGER_KINDS.filter((kind) => candidate.kinds.includes(kind)) }))
    .sort((a, b) => (b.latestAt ?? '').localeCompare(a.latestAt ?? '') || a.postId.localeCompare(b.postId))
}
