import type { ActivityStep } from '../types'
import { REEL } from './reel'

export interface Range {
  min: number
  max: number
}

export interface ReelSessionOptions {
  reels: Range
  watchSeconds: Range
  skip: number
  comments: number
  profile: number
  like: number
  likes: boolean
}

export const DEFAULT_SESSION: ReelSessionOptions = { reels: { min: 8, max: 20 }, watchSeconds: { min: 4, max: 25 }, skip: 0.6, comments: 0.3, profile: 0.15, like: 0.2, likes: false }

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

export function parseRange(text: string): Range | null {
  const match = /^(\d+)(?:-(\d+))?$/.exec(text.trim())
  if (!match) return null
  const min = Number(match[1])
  const max = match[2] === undefined ? min : Number(match[2])
  return max >= min ? { min, max } : null
}

function step(id: string, seconds?: number): ActivityStep {
  const found = REEL.steps.find((s) => s.id === id)!
  if (seconds === undefined) return found
  return { ...found, args: [String(seconds)], why: id === 'glance' ? `a ${seconds} s glance, then on` : `watch ${seconds} s with the sound on, the cursor moving (rule 32)` }
}

export interface SessionStep {
  reel: number
  step: ActivityStep
}

export function planSession(options: ReelSessionOptions, seed: number): SessionStep[] {
  const rng = seeded(seed)
  const out: SessionStep[] = [{ reel: 1, step: step('openReels') }, { reel: 1, step: step('unmute') }]
  const reels = draw(rng, options.reels)
  let streak = 0
  for (let reel = 1; reel <= reels; reel++) {
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
        out.push({ reel, step: step('unmute') })
      }
      if (options.likes && rng() < options.like) out.push({ reel, step: step('like') })
    }
    if (reel < reels) out.push({ reel, step: step('swipe') })
  }
  return out
}

export function describeSession(steps: SessionStep[]): string[] {
  return steps.map(({ reel, step }, i) => `${String(i + 1).padStart(2)}. reel ${reel}: ${step.id} — ${step.why}${step.likes ? ' (--likes)' : ''}`)
}
