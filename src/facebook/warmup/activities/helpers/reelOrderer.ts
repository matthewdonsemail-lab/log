import type { PersonaPack, PersonaSegment } from '../../../../warmup/persona/types'
import { watchRatio } from '../../../../warmup/viewer/helpers/interestEffect'
import type { InterestEffect } from '../../../../warmup/viewer/helpers/interestEffect'
import type { ReelViewer } from '../../../../warmup/viewer/types'
import type { ReelRead } from './reelDecision'
import { seeded } from './reelSession'

export type ReelAction = 'like' | 'openComments' | 'openProfile'

export const SEGMENT_ORDERS: Record<PersonaSegment, string[]> = {
  lurker: ['save'],
  skipper: [],
  social: ['like', 'openComments', 'share'],
  commerce: ['like', 'save', 'openProfile']
}

export function segmentWeight(segment: PersonaSegment, action: ReelAction): number {
  const at = SEGMENT_ORDERS[segment].indexOf(action)
  return at < 0 ? 0.3 : Math.max(0.2, 1 - 0.2 * at)
}

export const TIE_EPS = 0.2

export interface ReelPlanInput {
  pack: PersonaPack
  viewer: ReelViewer
  effect: InterestEffect
  read: ReelRead | null
  reel: number
  seed: number
  allowed: { comments: boolean; profile: boolean; like: boolean }
  lastLikeReel: number | null
  sponsored: boolean
}

export interface ReelPlan {
  match: boolean
  watchMs: number
  watchFrom: string
  capped: boolean
  adSkip: boolean
  scores: Record<ReelAction, number>
  order: ReelAction[]
  action: ReelAction | null
  runnerUp: ReelAction | null
  eps: number
  closeCall: { between: [ReelAction, ReelAction]; by: 'read' | 'score' } | null
}

export function realPlay(viewer: ReelViewer, seed: number, reel: number): { ms: number; from: string } {
  const start = seed % viewer.sessions.length
  let left = reel - 1
  for (let i = 0; i < viewer.sessions.length * 2; i++) {
    const index = (start + i) % viewer.sessions.length
    const session = viewer.sessions[index]
    if (left < session.length) return { ms: session[left][0], from: `${viewer.source} session ${index + 1} swipe ${left + 1}` }
    left -= session.length
  }
  return { ms: viewer.stats.playMs[2], from: `${viewer.source} median` }
}

export function playQuantile(viewer: ReelViewer, ms: number): number {
  const [p10, p25, p50, p75, p90] = viewer.stats.playMs
  return ms <= p10 ? 0.1 : ms <= p25 ? 0.25 : ms <= p50 ? 0.5 : ms <= p75 ? 0.75 : ms <= p90 ? 0.9 : 1
}

export function playAt(viewer: ReelViewer, q: number): number {
  const plays = viewer.sessions.flat().map((w) => w[0]).sort((a, b) => a - b)
  return plays.length ? plays[Math.min(plays.length - 1, Math.max(0, Math.floor(q * plays.length)))] : viewer.stats.playMs[2]
}

export function planReel(input: ReelPlanInput): ReelPlan {
  const { pack, viewer, reel, effect, read } = input
  const rng = seeded(input.seed + reel * 7919)
  const match = read !== null && rng() < read.interest
  const base = realPlay(viewer, input.seed, reel)
  const q = playQuantile(viewer, base.ms)
  const half = match ? 0.5 + q / 2 : q / 2
  const play = { ms: playAt(viewer, half), from: `${base.from}, at their ${Math.round(half * 100)}th percentile` }
  const ratio = watchRatio(effect, half, match)
  const scaled = Math.round(play.ms * ratio)
  const cap = pack.traits.attentionCapS * 1000
  let watchMs = Math.min(scaled, cap)
  const capped = scaled > cap
  const adSkip = input.sponsored && rng() < pack.traits.adSkipP
  if (adSkip) watchMs = Math.min(watchMs, viewer.stats.playMs[0])
  const fit = adSkip ? 0 : Math.min(1, watchMs / Math.max(viewer.stats.playMs[2], 1))
  const cooling = input.lastLikeReel !== null && reel - input.lastLikeReel <= pack.traits.likeCooldownReels
  const like = match ? effect.likeIn : effect.likeOut
  const comment = match ? effect.commentIn : effect.commentOut
  const p: Record<ReelAction, number> = {
    like: input.allowed.like && !cooling ? pack.traits.likeP * like : 0,
    openComments: input.allowed.comments ? pack.traits.commentP * comment : 0,
    openProfile: input.allowed.profile ? pack.traits.profileP * like : 0
  }
  const scores = Object.fromEntries((Object.keys(p) as ReelAction[]).map((a) => [a, Math.round(p[a] * segmentWeight(pack.segment, a) * fit * 10_000) / 10_000])) as Record<ReelAction, number>
  const order = (Object.keys(scores) as ReelAction[]).sort((a, b) => scores[b] - scores[a] || a.localeCompare(b))
  const r = rng()
  let drawn: ReelAction | null = null
  let sum = 0
  for (const a of order) {
    sum += scores[a]
    if (scores[a] > 0 && r < sum) {
      drawn = a
      break
    }
  }
  const [top, second] = order
  const eps = Math.round(TIE_EPS * scores[top] * 10_000) / 10_000
  const close = drawn !== null && scores[second] > 0 && scores[top] - scores[second] <= eps && (drawn === top || drawn === second)
  const readPick = read && (read.pick === top || read.pick === second) ? read.pick : null
  const action = close && readPick ? readPick : drawn
  return {
    match,
    watchMs,
    watchFrom: `${play.from} ×${ratio}`,
    capped,
    adSkip,
    scores,
    order,
    action,
    runnerUp: action === top ? second : top,
    eps,
    closeCall: close ? { between: [top, second], by: readPick ? 'read' : 'score' } : null
  }
}
