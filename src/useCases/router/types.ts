export const MATCH_FLOOR = 0.6

export const MATCHES_SHOWN = 3

export const MIN_PHRASE_WORDS = 2

export const TOP_K = 5

export const DENSE_WEIGHT = 0.7

export const WINDOW_WORDS = 14

export const WINDOW_STEP = 7

export const DEFAULT_THRESHOLD = 0.63

export const DEFAULT_MENU_FLOOR = 0.4375

export const AMBIGUITY_BAND = 0.03

export const TRIVIAL_WORDS = 2

export const FALSE_FIRE_CAP = 0.03

export const ROUTE_UTTERANCES_FILE = 'utterances.json'

export const THRESHOLDS_FILE = 'thresholds.json'

export const NOT_A_PROMPT: readonly RegExp[] = [/<task-notification>/i, /^\s*</, /^\[SYSTEM NOTIFICATION/i, /This session is being continued from a previous conversation/i]

export const STOP_WORDS: ReadonlySet<string> = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'bro', 'but', 'can', 'could', 'do', 'for', 'from', 'get', 'go', 'going', 'got', 'had', 'has', 'have', 'he', 'her', 'him', 'his', 'how', 'i', 'if', 'im', 'in', 'into', 'is', 'it', 'its', 'just', 'like', 'make', 'me', 'my', 'need', 'now', 'of', 'on', 'or', 'our', 'out', 'over', 'so', 'some', 'that', 'the', 'their', 'them', 'then', 'there', 'they', 'this', 'to', 'up', 'us', 'want', 'was', 'we', 'what', 'when', 'which', 'who', 'will', 'with', 'would', 'yeah', 'yo', 'you', 'your',
])

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
  utterances: Utterance[]
  vectors: Float32Array[]
  vocabulary: Set<string>
  titles: Map<string, string>
}

export interface RouteDecision {
  matches: PlayMatch[]
  ranked: PlayMatch[]
  menu: PlayMatch[]
  skipped?: 'notAPrompt' | 'trivial'
  corrected: string[]
  ms: { correct: number; embed: number; score: number; total: number }
}

export type Thresholds = Record<string, number>

export type EmbedTexts = (texts: string[]) => Promise<Float32Array[]>
