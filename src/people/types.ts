import type { FactRow } from './facts/types'

export const PERSON_ID_PREFIX = 'p_'

export const PRIOR_MATCH_SHARE = 0.04

export const STRONG_BITS = 4

export const REVIEW_BITS = 0

export const SUGGESTED = 50

export const SOURCES_KEPT = 3

export const ONE_TO_ONE_SHARE = 0.95

export const CARD_CHATS = 8

export const CARD_LINES = 8

export const CARD_CHARS = 2000

export const PEOPLE_IN_PROMPT = 2

export const HANDLE_MIN = 4

export const M_PROBABILITIES = {
  handle: { same: 0.3, sameLoose: 0.1, different: 0.6 },
  displayName: { same: 0.3, different: 0.7 },
  sharesOwnPosts: { fivePlus: 0.05, twoToFour: 0.1, once: 0.15, never: 0.7 },
} as const

export const M_PRIORS: Readonly<Record<string, Readonly<Record<string, number>>>> = {
  sharesOwnPosts: M_PROBABILITIES.sharesOwnPosts,
  handle: M_PROBABILITIES.handle,
  displayName: M_PROBABILITIES.displayName,
  mentionsHandle: { handedOver: 0.08, claimsOwn: 0.12, mentioned: 0.05, never: 0.75 },
  writingStyle: { close: 0.35, near: 0.35, far: 0.3 },
  meaning: { close: 0.35, near: 0.35, far: 0.3 },
  activeHours: { close: 0.35, near: 0.35, far: 0.3 },
  topicsWithOwner: { close: 0.3, near: 0.35, far: 0.35 },
  sharedCircle: { many: 0.2, some: 0.3, none: 0.5 },
  claimsPlatform: { says: 0.3, never: 0.7 },
}

export const SIMILARITY_LEVELS = { close: 0.99, near: 0.9 } as const

export const SIMILARITY_FALLBACK = { writingStyle: [0.8, 0.65], meaning: [0.8, 0.65], activeHours: [0.9, 0.75], topicsWithOwner: [0.35, 0.15] } as const

export const EM_ROUNDS = 25

export const EM_PRIOR_STRENGTH = 4

export const RANDOM_PAIRS = 400

export const RANDOM_PROFILES = 120

export const PROFILE_MESSAGES = 400

export const PROFILE_MIN_MESSAGES = 8

export const PROFILE_MIN_CHARS = 200

export const MEANING_LINES = 20

export const MENTION_COMMON = 25

export const CIRCLE_ROOM_MAX = 300

export const NAME_GROUP_MAX = 5

export const REVIEW_CHECKS = 10

export const REVIEW_SURE = 0.8

export const REVIEW_LINES = [4, 12] as const

export const CLAIM_CUE = /\b(?:my|i'?m|im)\s+(?:@|insta(?:gram)?|ig|twitter|x|discord|tiktok|telegram|tg|handle|account|acc|username|user|@ is)\b|\b(?:add|follow|dm|find) me\b/i

export const MY_PLATFORM: readonly (readonly [string, RegExp])[] = [
  ['instagram', /\bmy\s+(?:insta(?:gram)?|ig)\b/i],
  ['twitter', /\bmy\s+(?:twitter|x\s+(?:account|handle|is|page))\b/i],
  ['discord', /\bmy\s+discord\b/i],
  ['slack', /\bmy\s+slack\b/i],
  ['reddit', /\bmy\s+reddit\b/i],
]

export const STOP_WORDS: ReadonlySet<string> = new Set(['that', 'this', 'with', 'have', 'just', 'like', 'what', 'from', 'your', 'they', 'will', 'would', 'there', 'their', 'about', 'been', 'were', 'when', 'then', 'them', 'than', 'some', 'into', 'more', 'also', 'only', 'very', 'yeah', 'dont', "don't", 'its', "it's", 'thats', "that's", 'im', "i'm", 'know', 'think', 'want', 'need', 'make', 'good', 'right', 'really', 'still', 'thing', 'things', 'going', 'gonna', 'cant', "can't", 'here', 'which', 'where', 'could', 'should', 'does', 'doing', 'done', 'after', 'before', 'over', 'because', 'other', 'every', 'much', 'many', 'well', 'even', 'okay', 'sure', 'thanks', 'thank'])

export const BOT_NAMES: readonly string[] = ['mee6', 'dyno', 'carl bot', 'vibe bot', 'vibebot', 'rythm', 'trebel music', 'watch together', 'probot', 'arcane', 'tatsu']

export const ASKS = /\b(like|rt|retweet|repost|share|support|boost|check (?:out )?my|my (?:post|tweet|thread|video|account|profile|twitter|x|insta|ig|channel))\b/i

export const RECOMMENDS = /\b(this (?:dude|guy|girl|person)|check out (?:his|her|their)|follow (?:him|her|them)|shout ?out to|credit to)\b/i

export interface IdentityRef {
  platform: string
  userId: string
}

export interface IdentityInfo extends IdentityRef {
  handle: string | null
  name: string | null
  personId: string | null
  runByLogAs: string | null
}

export type Band = 'strong' | 'review' | 'hidden'

export interface MessageSource {
  messageKey: string
  chatId: string
  at: string | null
  text: string
}

export type ComparisonName = 'sharesOwnPosts' | 'handle' | 'displayName' | 'mentionsHandle' | 'claimsPlatform' | 'writingStyle' | 'meaning' | 'activeHours' | 'topicsWithOwner' | 'sharedCircle'

export interface Comparison {
  comparison: ComparisonName
  level: string
  values: string[]
  m: number
  u: number
  bayesFactor: number
  matchWeight: number
  count?: number
  asks?: number
  sources?: MessageSource[]
}

export interface Suggestion {
  suggestionId: string
  a: IdentityInfo
  b: IdentityInfo
  prior: number
  comparisons: Comparison[]
  matchWeight: number
  probability: number
  band: Band
  throughSeq: number
  veto?: string | null
  review?: ReviewAnswer | null
}

export interface ReviewAnswer {
  choice: string
  confidence: number
  steps: number
  inputTokens: number
}

export interface Recheck {
  personId: string
  a: IdentityInfo
  b: IdentityInfo
  matchWeight: number
  veto: string | null
  comparisons: Comparison[]
}

export interface Cluster {
  identities: IdentityInfo[]
  suggestionIds: string[]
  weakestBits: number
  personIds: string[]
}

export interface LinkReport {
  suggestions: Suggestion[]
  vetoed: Suggestion[]
  clusters: Cluster[]
  rechecks: Recheck[]
  learned: { rounds: number; sessions: number; candidates: number; matchShare: number; m: Record<string, Record<string, number>>; u: Record<string, Record<string, number>>; thresholds: Record<string, readonly number[]> }
  throughSeq: number
}

export interface PersonRow {
  personId: string
  name: string | null
  identities: IdentityInfo[]
}

export interface CardChat {
  chatId: string
  platform: string
  account: string
  name: string | null
  oneToOne: boolean
  others: number
  theirs: number
  ours: number
  lastAtMs: number | null
  lastFrom: 'owner' | 'them' | 'someone else' | null
  backfilled: boolean
}

export interface CardLine {
  platform: string
  account: string
  fromOwner: boolean
  at: string | null
  text: string
  messageKey: string
}

export interface PersonCard {
  personId: string | null
  name: string | null
  identities: IdentityInfo[]
  arrived: { platform: string; kind: string; atMs: number; text: string | null } | null
  waitingOn: 'owner' | 'them' | null
  perPlatform: { platform: string; oneToOne: number; theirs: number; ours: number; groups: number; theirsInGroups: number; firstAtMs: number | null; lastAtMs: number | null; engaged: { account: string; kind: string; times: number }[] }[]
  chats: CardChat[]
  onTheirAccounts: number
  last: CardLine[]
  facts: FactRow[]
  throughSeq: number
  text: string
}
