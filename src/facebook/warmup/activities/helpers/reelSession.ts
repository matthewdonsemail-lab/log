import type { ActivityStep } from '../types'
import { REEL } from './reel'

/** `5-12`: drawn on every session, so no two are the same. */
export interface Range {
  min: number
  max: number
}

/** How a Reels session is drawn. Chances are per reel, 0 to 1. */
export interface ReelSessionOptions {
  reels: Range
  watchSeconds: Range
  /** The chance a reel only gets a glance (1-3 s) and a skip; a skip often runs on for 1-3 more reels. */
  skip: number
  comments: number
  profile: number
  like: number
  /** Likes act on Facebook: only with --likes (rule 8). */
  likes: boolean
}

export const DEFAULT_SESSION: ReelSessionOptions = { reels: { min: 8, max: 20 }, watchSeconds: { min: 4, max: 25 }, skip: 0.6, comments: 0.3, profile: 0.15, like: 0.2, likes: false }

/** A seeded draw (mulberry32), so a session replays from its seed and tests are fixed. Pure. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const draw = (rng: () => number, range: Range) => range.min + Math.floor(rng() * (range.max - range.min + 1))

/** `5-12` → { min: 5, max: 12 }; `7` → 7-7. Null when it isn't a range of whole numbers. Pure. */
export function parseRange(text: string): Range | null {
  const match = /^(\d+)(?:-(\d+))?$/.exec(text.trim())
  if (!match) return null
  const min = Number(match[1])
  const max = match[2] === undefined ? min : Number(match[2])
  return max >= min ? { min, max } : null
}

/** One step of the reel activity by its id, with a watch's or a glance's seconds when given. */
function step(id: string, seconds?: number): ActivityStep {
  const found = REEL.steps.find((s) => s.id === id)!
  if (seconds === undefined) return found
  return { ...found, args: [String(seconds)], why: id === 'glance' ? `a ${seconds} s glance, then on` : `watch ${seconds} s with the sound on, the cursor moving (rule 32)` }
}

/** A session's steps with the reel each belongs to. */
export interface SessionStep {
  reel: number
  step: ActivityStep
}

/**
 * One session, drawn from the reel activity's own steps, the way a thumb
 * goes through Reels (matt, 2026-10-20): open Reels, sound on, then reel by
 * reel. Most reels get a glance (1-3 s) and a skip, and a skip often runs on
 * for 1-3 more reels; the ones that catch are watched (watchSeconds), and only
 * those may get their comments (open, scroll, close), the creator's profile
 * and back, or a like (only with likes on). Next card between reels; the last
 * one ends the session. Pure, given its seed.
 */
export function planSession(options: ReelSessionOptions, seed: number): SessionStep[] {
  const rng = seeded(seed)
  // Sound on once, on the first reel: Reels start muted and keep the sound on from then (matt, 2026-10-20).
  const out: SessionStep[] = [{ reel: 1, step: step('openReels') }, { reel: 1, step: step('unmute') }]
  const reels = draw(rng, options.reels)
  let streak = 0
  for (let reel = 1; reel <= reels; reel++) {
    // A skip streak runs on; otherwise each reel is skipped at the skip chance, and a new skip may start a streak.
    const skipped = streak > 0 || rng() < options.skip
    if (skipped) {
      streak = streak > 0 ? streak - 1 : rng() < 0.5 ? draw(rng, { min: 1, max: 3 }) : 0
      out.push({ reel, step: step('glance', draw(rng, { min: 1, max: 3 })) })
    } else {
      out.push({ reel, step: step('watch', draw(rng, options.watchSeconds)) })
      if (rng() < options.comments) for (const id of ['openComments', 'scrollComments', 'closeComments']) out.push({ reel, step: step(id) })
      if (rng() < options.profile) {
        out.push({ reel, step: step('openProfile') })
        out.push({ reel, step: step('watch', draw(rng, { min: 3, max: 9 })) })
        out.push({ reel, step: step('backToReel') })
      }
      if (options.likes && rng() < options.like) out.push({ reel, step: step('like') })
    }
    if (reel < reels) out.push({ reel, step: step('swipe') })
  }
  return out
}

/** The plan in plain words, one line per step. Pure. */
export function describeSession(steps: SessionStep[]): string[] {
  return steps.map(({ reel, step }, i) => `${String(i + 1).padStart(2)}. reel ${reel}: ${step.id} — ${step.why}${step.likes ? ' (--likes)' : ''}`)
}
