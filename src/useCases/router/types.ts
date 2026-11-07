export const MATCH_FLOOR = 0.6

export const MATCHES_SHOWN = 2

export const MIN_PHRASE_WORDS = 2

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
