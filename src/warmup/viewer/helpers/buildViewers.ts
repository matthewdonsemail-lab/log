import type { ReelViewer, ViewerStats, ViewerSwipe } from '../types'

/** One KuaiRand log row, the fields a viewer is built from. */
export interface KuaiRow {
  userId: number
  timeMs: number
  tab: number
  playMs: number
  durationMs: number
  commentMs: number
  profileMs: number
  liked: number
}

/** KuaiRand's single-column swipe feed: one video at a time, played as it lands (is_click is a valid play there). */
export const SWIPE_FEED_TAB = 1
/** The next play started within its predecessor's play time plus this: the same session. */
export const SESSION_GAP_MS = 60_000

const quantile = (sorted: number[], p: number) => (sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] : 0)
const median = (xs: number[]) => quantile([...xs].sort((a, b) => a - b), 0.5)

/** A viewer's numbers, from their swipes. Pure. */
export function viewerStats(sessions: ViewerSwipe[][]): ViewerStats {
  const swipes = sessions.flat()
  const plays = swipes.map((s) => s[0]).sort((a, b) => a - b)
  const share = (f: (s: ViewerSwipe) => boolean) => (swipes.length ? swipes.filter(f).length / swipes.length : 0)
  return {
    swipes: swipes.length,
    sessions: sessions.length,
    playMs: [0.1, 0.25, 0.5, 0.75, 0.9].map((p) => quantile(plays, p)) as ViewerStats['playMs'],
    under1s: share((s) => s[0] < 1000),
    under2s: share((s) => s[0] < 2000),
    commentRate: share((s) => s[2] > 0),
    commentMs: median(swipes.filter((s) => s[2] > 0).map((s) => s[2])),
    profileRate: share((s) => s[3] > 0),
    profileMs: median(swipes.filter((s) => s[3] > 0).map((s) => s[3])),
    likeRate: share((s) => s[4] > 0),
    sessionSwipes: median(sessions.map((s) => s.length))
  }
}

/**
 * KuaiRand rows → viewers: each user's plays in the swipe feed, in time order,
 * cut into sessions where the next play didn't start within the last one's
 * play time plus `SESSION_GAP_MS`. Sessions shorter than `minSwipes` are
 * dropped, and at most `maxSessions` are kept per viewer (their longest).
 * Pure.
 */
export function buildViewers(rows: KuaiRow[], source: string, options: { minSwipes?: number; maxSessions?: number; minSessions?: number } = {}): ReelViewer[] {
  const minSwipes = options.minSwipes ?? 8
  const maxSessions = options.maxSessions ?? 12
  const byUser = new Map<number, KuaiRow[]>()
  for (const row of rows) {
    if (row.tab !== SWIPE_FEED_TAB || row.playMs <= 0) continue
    const list = byUser.get(row.userId) ?? []
    list.push(row)
    byUser.set(row.userId, list)
  }
  const viewers: ReelViewer[] = []
  for (const [userId, list] of [...byUser.entries()].sort((a, b) => a[0] - b[0])) {
    list.sort((a, b) => a.timeMs - b.timeMs)
    const sessions: ViewerSwipe[][] = []
    let current: ViewerSwipe[] = []
    let last: KuaiRow | null = null
    for (const row of list) {
      if (last && row.timeMs - last.timeMs > last.playMs + last.commentMs + last.profileMs + SESSION_GAP_MS) {
        if (current.length >= minSwipes) sessions.push(current)
        current = []
      }
      current.push([row.playMs, row.durationMs, row.commentMs, row.profileMs, row.liked ? 1 : 0])
      last = row
    }
    if (current.length >= minSwipes) sessions.push(current)
    if (sessions.length < (options.minSessions ?? 3)) continue
    const kept = [...sessions].sort((a, b) => b.length - a.length).slice(0, maxSessions)
    viewers.push({ source: `${source} ${userId}`, userId, stats: viewerStats(sessions), sessions: kept })
  }
  return viewers
}
