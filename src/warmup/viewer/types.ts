/**
 * A real short-form viewer, from KuaiRand-1K (Kuaishou, kuairand.com,
 * zenodo.org/records/10439422, CC BY-SA 4.0): every video 1,000 users were
 * shown in its single-column swipe feed (`tab` 1), with how long they played
 * it (`play_time_ms`), its length, the time they spent in its comments and on
 * the author's profile, and whether they liked it. Consecutive plays of one
 * user are a session. The account's warm-up is decided by SubQ with one such
 * viewer's behaviour as context (rule 50), and each reel's time is drawn from
 * that viewer's own real plays. Read from `~/.logCli/datasets/reelViewers/`,
 * never committed.
 */

/** One swipe: [playMs, durationMs, commentMs, profileMs, liked (0|1)]. */
export type ViewerSwipe = [number, number, number, number, number]

export interface ViewerStats {
  swipes: number
  sessions: number
  /** Play time in ms at the 10th, 25th, 50th, 75th and 90th percentile. */
  playMs: [number, number, number, number, number]
  under1s: number
  under2s: number
  /** Share of reels whose comments they opened, and the median time in them. */
  commentRate: number
  commentMs: number
  profileRate: number
  profileMs: number
  likeRate: number
  /** Median swipes per session. */
  sessionSwipes: number
}

export interface ReelViewer {
  /** `kuaiRand1k 123`. */
  source: string
  userId: number
  stats: ViewerStats
  /** Their sessions, each the swipes in order. */
  sessions: ViewerSwipe[][]
}

export interface ViewerFile {
  source: string
  built: string
  viewers: ReelViewer[]
}
