import type { VoiceProfile } from '../types'

const EMOJI = /\p{Extended_Pictographic}/u
const RARE = 0.02
const SEEN = 10

const FEATURES: { name: string; share: (p: VoiceProfile) => number; has: (text: string) => boolean }[] = [
  { name: 'an emoji', share: (p) => p.emoji, has: (t) => EMOJI.test(t) },
  { name: 'an exclamation mark', share: (p) => p.exclamations, has: (t) => t.includes('!') },
  { name: 'a question mark', share: (p) => p.questions, has: (t) => t.includes('?') },
  { name: 'a comma', share: (p) => p.commas, has: (t) => t.includes(',') },
  { name: 'a full stop', share: (p) => p.fullStops, has: (t) => /\.(\s|$)/.test(t.replace(/https?:\/\/\S+/g, '')) },
  { name: 'capital letters', share: (p) => 1 - p.lowercase, has: (t) => t !== t.toLowerCase() },
]

export function offProfile(text: string, profile: VoiceProfile | null): string[] {
  if (!profile || profile.replies < SEEN) return []
  return FEATURES.filter((f) => f.share(profile) <= RARE && f.has(text)).map((f) => `${f.name} (he uses it in ${Math.round(f.share(profile) * profile.replies)} of his ${profile.replies} messages here)`)
}
