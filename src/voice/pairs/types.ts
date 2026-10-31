export interface VoicePair {
  id: string
  platform: string
  account: string
  conversationId: string
  chat: string
  kind: 'dm' | 'group'
  with: string[]
  at: string | null
  said: string
  saidBy: string | null
  reply: string
  parts: number
  gaps: number[]
}

export interface VoiceProfile {
  key: string
  replies: number
  medianWords: number
  lowercase: number
  commas: number
  fullStops: number
  questions: number
  exclamations: number
  emoji: number
  openers: string[]
  words: string[]
  burst: { median: number; oneShare: number; gapSeconds: number; messageWords: number }
  startRates?: Record<string, number>
}

export interface VoiceTarget {
  platform?: string
  conversationId?: string
  with?: string[]
}

export interface NearPair {
  pair: VoicePair
  tier: 'sameChat' | 'samePerson' | 'samePlatform' | 'anywhere'
  rank: number
}

export const SAID_MESSAGES = 3
export const MAX_SPLIT = 4
export const START_MIN_SEEN = 5
export const START_WORDS = 300
export const SPLIT_GAP = { min: 1, max: 8 }
export const NEAR_PAIRS = 8
export const PROFILE_WORDS = 12
export const VOICE_DEPTH = 400
export const TIER_ORDER = ['sameChat', 'samePerson', 'samePlatform', 'anywhere'] as const
