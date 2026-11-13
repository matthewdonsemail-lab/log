export const MATCHES_SHOWN = 3

export const MIN_PHRASE_WORDS = 2

export const SHORT_PROMPT_WORDS = 3

export const TOP_K = 5

export const DENSE_WEIGHT = 0.7

export const WINDOW_WORDS = 14

export const WINDOW_STEP = 7

export const DEFAULT_THRESHOLD = 0.63

export const DEFAULT_MENU_FLOOR = 0.4375

export const AMBIGUITY_BAND = 0.03

export const WORD_THRESHOLD = 0.6

export const WORD_MENU_FLOOR = 0.5

export const WORD_AMBIGUITY_BAND = 0.1

export const PLATFORM_BONUS = 0.1

export const FALSE_FIRE_CAP = 0.03

export const ROUTE_UTTERANCES_FILE = 'utterances.json'

export const THRESHOLDS_FILE = 'thresholds.json'

export const GOLDEN_FILE = 'golden.json'

export const NOT_A_PROMPT: readonly RegExp[] = [/<task-notification>/i, /^\s*</, /^\[SYSTEM NOTIFICATION/i, /This session is being continued from a previous conversation/i]

export const STOP_WORDS: ReadonlySet<string> = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'bro', 'but', 'can', 'could', 'do', 'for', 'from', 'get', 'go', 'going', 'got', 'had', 'has', 'have', 'he', 'her', 'him', 'his', 'how', 'i', 'if', 'im', 'in', 'into', 'is', 'it', 'its', 'just', 'like', 'make', 'me', 'my', 'need', 'now', 'of', 'on', 'or', 'our', 'out', 'over', 'so', 'some', 'that', 'the', 'their', 'them', 'then', 'there', 'they', 'this', 'to', 'up', 'us', 'want', 'was', 'we', 'what', 'when', 'which', 'who', 'will', 'with', 'would', 'yeah', 'yo', 'you', 'your',
])

export const PLATFORM_WORDS: Readonly<Record<string, string>> = {
  twitter: 'twitter',
  x: 'twitter',
  tweet: 'twitter',
  retweet: 'twitter',
  retweeted: 'twitter',
  discord: 'discord',
  server: 'discord',
  guild: 'discord',
  slack: 'slack',
  workspace: 'slack',
  reddit: 'reddit',
  subreddit: 'reddit',
  upvote: 'reddit',
  instagram: 'instagram',
  insta: 'instagram',
  ig: 'instagram',
  facebook: 'facebook',
  fb: 'facebook',
  marketplace: 'facebook',
  messenger: 'facebook',
  linkedin: 'linkedin',
}

export const PLATFORM_FOLDERS: ReadonlySet<string> = new Set(Object.values(PLATFORM_WORDS))

export interface RoutableUseCase {
  id: string
  title: string
  asks: string
}

export interface PlayMatch {
  id: string
  title: string
  score: number
  phrase: string
}

export interface Utterance {
  route: string
  text: string
}

export interface RouteIndex {
  model: string
  useCases: RoutableUseCase[]
  utterances: Utterance[]
  extra: Utterance[]
  vectors: Float32Array[]
  vocabulary: Set<string>
  titles: Map<string, string>
}

export type DenseScores = ReadonlyMap<string, { score: number; text: string }>

export interface RouteContext {
  useCases: readonly RoutableUseCase[]
  extra?: readonly Utterance[]
  dense?: DenseScores
  thresholds?: Thresholds
  vocabulary?: ReadonlySet<string> | null
}

export type RouteOutcome = 'play' | 'menu' | 'none'

export interface RouteDecision {
  outcome: RouteOutcome
  play: PlayMatch | null
  matches: PlayMatch[]
  ranked: PlayMatch[]
  menu: PlayMatch[]
  platforms: string[]
  skipped?: 'notAPrompt' | 'trivial'
  corrected: string[]
  ms: { correct: number; embed: number; score: number; total: number }
}

export interface GoldenPrompt {
  prompt: string
  expect: string
  menu?: string
  note?: string
}

export type Thresholds = Record<string, number>

export type EmbedTexts = (texts: string[]) => Promise<Float32Array[]>
