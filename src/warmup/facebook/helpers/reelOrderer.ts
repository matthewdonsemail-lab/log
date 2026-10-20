import type { PersonaPack, PersonaSegment } from '../../persona/types'
import { watchRatio } from '../../viewer/helpers/interestEffect'
import type { InterestEffect } from '../../viewer/helpers/interestEffect'
import type { ReelViewer } from '../../viewer/types'
import type { ReelRead } from './reelDecision'
import { seeded } from './reelSession'

/**
 * The action orderer (the persona-conditioned Reels handoff, 2026-10-20),
 * deterministic first, on SubQ's read of the reel (rule 50). The read says
 * how likely the reel is the persona's kind of content; the plan draws it.
 * The watch is the real viewer's next play, in their own session's order
 * (KuaiRand-1K), scaled by the measured interest effect at that play's
 * percentile (KuaiRand-Pure's random log: longer on their kind, shorter
 * outside it), capped by the pack's attention span; a sponsored reel is
 * skipped at once as often as the pack's ad skip. Then at most one action
 * (one primary action per reel): each scored
 *
 *   U(a) = p(a | pack) × interest effect(a) × segment weight(a) × attention fit(a)
 *
 * sorted and drawn from the seed. A close call (the top two within `eps`, one
 * drawn) is settled by the read's own pick when it names one of the two. The
 * same pack, viewer, read, seed and reel always give the same plan. Like
 * cooldown and the run's allowed actions (rule 8) apply before scoring.
 */

export type ReelAction = 'like' | 'openComments' | 'openProfile'

/** The handoff's base orders; this repo has no save, follow or share, so those only hold their place. */
export const SEGMENT_ORDERS: Record<PersonaSegment, string[]> = {
  lurker: ['save'],
  skipper: [],
  social: ['like', 'openComments', 'share'],
  commerce: ['like', 'save', 'openProfile']
}

/** An action's weight from its place in the segment's order: 1, 0.8, 0.6…; not in the order, 0.3. Pure. */
export function segmentWeight(segment: PersonaSegment, action: ReelAction): number {
  const at = SEGMENT_ORDERS[segment].indexOf(action)
  return at < 0 ? 0.3 : Math.max(0.2, 1 - 0.2 * at)
}

/** Close call: the top two within this share of the top score. */
export const TIE_EPS = 0.2

export interface ReelPlanInput {
  pack: PersonaPack
  viewer: ReelViewer
  effect: InterestEffect
  /** SubQ's read of the reel; null when SubQ couldn't answer (the reel is then taken as not theirs). */
  read: ReelRead | null
  /** 1-based. */
  reel: number
  seed: number
  allowed: { comments: boolean; profile: boolean; like: boolean }
  /** The reel the last like was on, for the cooldown. */
  lastLikeReel: number | null
  /** The reel as it landed says Sponsored. */
  sponsored: boolean
}

export interface ReelPlan {
  /** The read's interest drawn: their kind of content or not. */
  match: boolean
  watchMs: number
  /** Which real play it is: `kuaiRand1k 995 session 3 swipe 7 ×1.23`. */
  watchFrom: string
  capped: boolean
  adSkip: boolean
  scores: Record<ReelAction, number>
  order: ReelAction[]
  /** The action done, or none. */
  action: ReelAction | null
  runnerUp: ReelAction | null
  eps: number
  /** The top two were close and one was drawn: settled by the read's pick (`read`) or the score (`score`). */
  closeCall: { between: [ReelAction, ReelAction]; by: 'read' | 'score' } | null
}

/** The real viewer's play for this reel: their sessions in order, from the one the seed starts at. Pure. */
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

/** Where a play falls among the viewer's own plays, 0-1. Pure. */
export function playQuantile(viewer: ReelViewer, ms: number): number {
  const [p10, p25, p50, p75, p90] = viewer.stats.playMs
  return ms <= p10 ? 0.1 : ms <= p25 ? 0.25 : ms <= p50 ? 0.5 : ms <= p75 ? 0.75 : ms <= p90 ? 0.9 : 1
}

/** The viewer's own play at quantile `q` (0-1) of all their plays. Pure. */
export function playAt(viewer: ReelViewer, q: number): number {
  const plays = viewer.sessions.flat().map((w) => w[0]).sort((a, b) => a - b)
  return plays.length ? plays[Math.min(plays.length - 1, Math.max(0, Math.floor(q * plays.length)))] : viewer.stats.playMs[2]
}

/** One reel's plan. Pure, given its inputs. */
export function planReel(input: ReelPlanInput): ReelPlan {
  const { pack, viewer, reel, effect, read } = input
  const rng = seeded(input.seed + reel * 7919)
  const match = read !== null && rng() < read.interest
  // The real session's play keeps the rhythm (its place among the viewer's plays); what is on screen picks the
  // half: their kind from their median up, the rest from their median down. The measured effect scales it.
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
  // Acting on a reel takes attention: full weight once watched past the viewer's own median play.
  const fit = adSkip ? 0 : Math.min(1, watchMs / Math.max(viewer.stats.playMs[2], 1))
  const cooling = input.lastLikeReel !== null && reel - input.lastLikeReel <= pack.traits.likeCooldownReels
  // The measured interest effect on engagement: likes and comments; the profile follows the likes (KuaiRand has no profile visits to measure).
  const like = match ? effect.likeIn : effect.likeOut
  const comment = match ? effect.commentIn : effect.commentOut
  const p: Record<ReelAction, number> = {
    like: input.allowed.like && !cooling ? pack.traits.likeP * like : 0,
    openComments: input.allowed.comments ? pack.traits.commentP * comment : 0,
    openProfile: input.allowed.profile ? pack.traits.profileP * like : 0
  }
  const scores = Object.fromEntries((Object.keys(p) as ReelAction[]).map((a) => [a, Math.round(p[a] * segmentWeight(pack.segment, a) * fit * 10_000) / 10_000])) as Record<ReelAction, number>
  // Ties keep a fixed order, so the same inputs always sort the same.
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
