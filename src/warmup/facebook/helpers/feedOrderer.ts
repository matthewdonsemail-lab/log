import type { DecisionImage, DecisionRequest } from '../../../subq/decisions/types'
import type { PersonaPack } from '../../persona/types'
import type { InterestEffect } from '../../viewer/helpers/interestEffect'
import { REEL_LABELS } from './reelDecision'
import type { ReelRead } from './reelDecision'
import { segmentWeight, TIE_EPS } from './reelOrderer'
import { seeded } from './reelSession'

/**
 * The feed, post by post, for a persona (rule 50, matt 2026-10-20: "use the
 * platform like it would"). Each post the feed brings into view is read by
 * SubQ (its screenshot, heading, text and Facebook's image descriptions):
 * what it is, whether it is this persona's kind, whether they'd like it. Then
 * it is planned here, deterministic from the seed:
 *
 *   time on it  not theirs: a glance around 2.5 s, Facebook's own figure for
 *               a piece of feed content on desktop (facebook.com/business,
 *               "Capturing attention in feed": 2.5 s desktop, 1.7 s mobile);
 *               theirs: its text at 238 words a minute plus one 2.5 s look,
 *               longer by the interest effect measured on real viewers
 *               (KuaiRand, `InterestEffect.watchIn`), capped by the attention
 *               span. Found with TinyFish, rule 53.
 *   a like      p(like | pack) × interest effect × segment weight, drawn;
 *               a cooldown of the pack's posts; a close draw settled by
 *               SubQ's pick; only with --live and --likes (rule 8).
 */

/** Facebook: people spend 2.5 s on average with a piece of feed content on desktop. */
export const FEED_GLANCE_MS = 2500
/** A common adult silent-reading rate, words per minute (as the persona pack's comment time). */
export const FEED_READING_WPM = 238

export interface PostPlanInput {
  pack: PersonaPack
  effect: InterestEffect
  read: ReelRead | null
  post: { words: number; liked: boolean }
  /** 1-based. */
  index: number
  seed: number
  allowLike: boolean
  lastLikeIndex: number | null
}

export interface PostPlan {
  match: boolean
  dwellMs: number
  /** How the time was made: `glance`, or `read 42 words`. */
  from: string
  like: boolean
  likeScore: number
  closeCall: boolean
}

/** One post's plan. Pure, given its inputs. */
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
  const cooling = input.lastLikeIndex !== null && input.index - input.lastLikeIndex <= pack.traits.likeCooldownReels
  const likeScore = input.allowLike && !cooling && !post.liked ? Math.round(pack.traits.likeP * (match ? effect.likeIn : effect.likeOut) * segmentWeight(pack.segment, 'like') * 10_000) / 10_000 : 0
  const r = rng()
  const closeCall = likeScore > 0 && Math.abs(r - likeScore) <= TIE_EPS * likeScore
  const like = likeScore > 0 && (closeCall ? read?.pick === 'like' : r < likeScore)
  return { match, dwellMs, from, like, likeScore, closeCall }
}

/** The read for one post: its frame as the image, its heading, text and image descriptions, the persona. Pure. */
export function postReadRequest(
  pack: PersonaPack,
  persona: Record<string, string>,
  frame: DecisionImage,
  input: { heading: string; text: string; images: string[]; sessionSoFar: string; allowLike: boolean }
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
        criteria: input.allowLike ? { like: 'Like this post', none: 'Nothing: read or scroll on' } : { none: 'Nothing: read or scroll on' }
      }
    }
  }
}
