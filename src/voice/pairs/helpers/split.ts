import { MAX_SPLIT, SPLIT_GAP } from '../types'
import type { VoiceProfile } from '../types'

export interface SplitPlan {
  parts: string[]
  gapSeconds: number
  why: string
}

export function partsFor(text: string, profile: VoiceProfile | null): { count: number; why: string } {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  if (!profile?.burst) return { count: 1, why: 'no messages of his in this chat yet, so one message' }
  const { median, oneShare, messageWords } = profile.burst
  if (oneShare >= 0.5 || median <= 1) return { count: 1, why: `he sends one message here ${Math.round(oneShare * 100)}% of the time` }
  const count = Math.min(MAX_SPLIT, median, Math.max(1, Math.round(words / Math.max(1, messageWords))))
  if (count <= 1) return { count: 1, why: `${words} words is about one of his messages here (${messageWords} words each)` }
  return { count, why: `he sends ${median} in a row here, ${messageWords} words each (one message only ${Math.round(oneShare * 100)}% of the time)` }
}

function nextWord(text: string, at: number): string {
  return (/^[\p{L}\p{N}']+/u.exec(text.slice(at).trimStart().toLowerCase()) ?? [''])[0]
}

function cutAt(text: string, target: number, startRates: Record<string, number>): number {
  const breaks: { at: number; strength: number }[] = []
  for (let i = 1; i < text.length - 1; i++) {
    if (text[i] === '\n') breaks.push({ at: i, strength: 3 })
    else if (/[.!?]/.test(text[i - 1]) && text[i] === ' ') breaks.push({ at: i, strength: 2 })
    else if (text[i - 1] === ',' && text[i] === ' ') breaks.push({ at: i, strength: 1 + (startRates[nextWord(text, i)] ?? 0) })
    else if (text[i] === ' ') breaks.push({ at: i, strength: startRates[nextWord(text, i)] ?? 0 })
  }
  if (!breaks.length) return -1
  const reach = Math.max(8, target * 0.5)
  const near = breaks.filter((b) => Math.abs(b.at - target) <= reach)
  const pool = near.length ? near : breaks
  return pool.sort((a, b) => b.strength - a.strength || Math.abs(a.at - target) - Math.abs(b.at - target))[0].at
}

export function splitDraft(text: string, count: number, startRates: Record<string, number> = {}): string[] {
  let rest = text.trim()
  const out: string[] = []
  for (let left = count; left > 1 && rest; left--) {
    const at = cutAt(rest, rest.length / left, startRates)
    if (at < 0) break
    out.push(rest.slice(0, at).trim())
    rest = rest.slice(at).trim()
  }
  if (rest) out.push(rest)
  return out.filter(Boolean)
}

export function splitPlan(text: string, profile: VoiceProfile | null, asOne = false, startRates: Record<string, number> = {}): SplitPlan {
  const gap = Math.min(SPLIT_GAP.max, Math.max(SPLIT_GAP.min, profile?.burst?.gapSeconds || 3))
  if (asOne) return { parts: [text.trim()], gapSeconds: gap, why: 'sent as one, as asked' }
  const { count, why } = partsFor(text, profile)
  return { parts: splitDraft(text, count, startRates), gapSeconds: gap, why }
}
