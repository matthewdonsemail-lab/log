export type ViewerSwipe = [number, number, number, number, number]

export interface ViewerStats {
  swipes: number
  sessions: number
  playMs: [number, number, number, number, number]
  under1s: number
  under2s: number
  commentRate: number
  commentMs: number
  profileRate: number
  profileMs: number
  likeRate: number
  sessionSwipes: number
}

export interface ReelViewer {
  source: string
  userId: number
  stats: ViewerStats
  sessions: ViewerSwipe[][]
}

export interface ViewerFile {
  source: string
  built: string
  viewers: ReelViewer[]
}
