import type { DecisionImage, DecisionRequest } from '../../../../subq/decisions/types'
import type { PersonaPack } from '../../../../warmup/persona/types'
import type { InterestEffect } from '../../../../warmup/viewer/helpers/interestEffect'
import { REEL_LABELS } from './reelDecision'
import type { ReelRead } from './reelDecision'
import { segmentWeight, TIE_EPS } from './reelOrderer'
import { seeded } from './reelSession'

export const FEED_GLANCE_MS = 2500
export const FEED_READING_WPM = 238

export interface PostPlanInput {
  pack: PersonaPack
  effect: InterestEffect
  read: ReelRead | null
  post: { words: number; liked: boolean; truncated?: boolean }
  index: number
  seed: number
  allowLike: boolean
  allowClicks?: boolean
  lastLikeIndex: number | null
}

export type PostAction = 'like' | 'openComments'

export interface PostPlan {
  match: boolean
  dwellMs: number
  from: string
  seeMore: boolean
  action: PostAction | null
  like: boolean
  likeScore: number
  commentScore: number
  commentMs: number
  closeCall: boolean
}

export function planPost(input: PostPlanInput): PostPlan {
  const { pack, effect, read, post } = input
  const rng = seeded(input.seed + input.index * 104729)
  const match = read !== null && rng() < read.interest
  const cap = pack.traits.attentionCapS * 1000
  let dwellMs: number
  let from: string
  if (match) {
    const reading = (post.words / FEED_READING_WPM) * 60_000
    dwellMs = Math.min(cap, Math.round((reading + FEED_GLANCE_MS) * effect.watchIn[1]))
    from = `read ${post.words} words ×${effect.watchIn[1]}`
  } else {
    dwellMs = Math.round(FEED_GLANCE_MS * (0.5 + rng() * 0.7))
    from = 'glance'
  }
  const clicks = input.allowClicks ?? input.allowLike
  const cooling = input.lastLikeIndex !== null && input.index - input.lastLikeIndex <= pack.traits.likeCooldownReels
  const round = (x: number) => Math.round(x * 10_000) / 10_000
  const likeScore = input.allowLike && !cooling && !post.liked ? round(pack.traits.likeP * (match ? effect.likeIn : effect.likeOut) * segmentWeight(pack.segment, 'like')) : 0
  const commentScore = clicks ? round(pack.traits.commentP * (match ? effect.commentIn : effect.commentOut) * segmentWeight(pack.segment, 'openComments')) : 0
  const r = rng()
  const order: [PostAction, number][] = (
    [
      ['like', likeScore],
      ['openComments', commentScore]
    ] as [PostAction, number][]
  ).sort((a, b) => b[1] - a[1])
  let action: PostAction | null = null
  let sum = 0
  let closeCall = false
  for (const [a, score] of order) {
    if (score <= 0) continue
    if (Math.abs(r - (sum + score)) <= TIE_EPS * score) closeCall = true
    sum += score
    if (r < sum) {
      action = a
      break
    }
  }
  if (closeCall) action = read?.pick === 'like' && likeScore > 0 ? 'like' : read?.pick === 'openComments' && commentScore > 0 ? 'openComments' : null
  return { match, dwellMs, from, seeMore: match && clicks && post.truncated === true, action, like: action === 'like', likeScore, commentScore, commentMs: pack.traits.commentMs, closeCall }
}

export function postReadRequest(
  pack: PersonaPack,
  persona: Record<string, string>,
  frame: DecisionImage,
  input: { heading: string; text: string; images: string[]; sessionSoFar: string; allowLike: boolean; allowComments?: boolean }
): DecisionRequest {
  const into = pack.interests.length ? pack.interests.map((i) => REEL_LABELS[i] ?? i).join('; ') : 'their profile below'
  return {
    state: {
      persona: Object.entries(persona).map(([k, v]) => `${k}: ${v}`).join('; '),
      personaPack: JSON.stringify({ segment: pack.segment, interests: pack.interests, traits: pack.traits }),
      sessionSoFar: input.sessionSoFar,
      post: `A post in their Facebook home feed, on a desktop, the screen as it came into view. From: ${input.heading}. Text: ${input.text.slice(0, 1200)}${input.images.length ? ` Images: ${input.images.join('; ')}` : ''}`
    },
    images: [frame],
    questions: {
      label: { type: 'choice', instructions: 'What is this post about?', criteria: REEL_LABELS },
      interest: {
        type: 'noul',
        instructions: 'Is this post the kind this person is into, the kind they would stop and read?',
        criteria: { true: `It is what they are into (${into}), for their age, life and mood`, false: 'Not their kind: they would scroll past' }
      },
      pick: {
        type: 'choice',
        instructions: 'If this person did one thing on this post beyond reading, which would it be?',
        criteria: { ...(input.allowLike ? { like: 'Like this post' } : {}), ...(input.allowComments ? { openComments: "Open this post's comments and read them" } : {}), none: 'Nothing: read or scroll on' }
      }
    }
  }
}
