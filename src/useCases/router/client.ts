import { MATCH_FLOOR, MATCHES_SHOWN, MIN_PHRASE_WORDS, STOP_WORDS } from './types'
import type { PlayMatch, RoutableUseCase } from './types'

export function contentWords(text: string): string[] {
  return (text.toLowerCase().replace(/https?:\/\/\S+/g, ' ').replace(/['’]/g, '').match(/[a-z0-9]+/g) ?? []).filter((w) => !STOP_WORDS.has(w)).map((w) => (w.length > 4 && w.endsWith('s') ? w.slice(0, -1) : w))
}

export function phrasesOf(useCase: RoutableUseCase): string[] {
  const quoted = [...useCase.asks.matchAll(/"([^"]+)"/g)].map((m) => m[1])
  return [...quoted, useCase.title].filter((p) => contentWords(p).length >= MIN_PHRASE_WORDS)
}

export function phraseScore(promptWords: ReadonlySet<string>, phrase: string): number {
  const words = [...new Set(contentWords(phrase))]
  return words.length ? words.filter((w) => promptWords.has(w)).length / words.length : 0
}

export function matchPlays(prompt: string, useCases: readonly RoutableUseCase[], floor: number = MATCH_FLOOR): PlayMatch[] {
  const promptWords = new Set(contentWords(prompt))
  if (!promptWords.size) return []
  const out: PlayMatch[] = []
  for (const useCase of useCases) {
    let best = { score: 0, phrase: '' }
    for (const phrase of phrasesOf(useCase)) {
      const score = phraseScore(promptWords, phrase)
      if (score > best.score) best = { score, phrase }
    }
    if (best.score >= floor) out.push({ id: useCase.id, title: useCase.title, score: best.score, phrase: best.phrase })
  }
  return out.sort((a, b) => b.score - a.score).slice(0, MATCHES_SHOWN)
}

export function playMatchText(matches: readonly PlayMatch[]): string {
  if (!matches.length) return ''
  const lines = matches.map((m) => `  ${m.id} (${m.title}): matches "${m.phrase}" (${Math.round(m.score * 100)}%)`)
  return [
    `>>> PLAY MATCH: what matt just asked for is a play log already has (rule 158). Load it before doing anything, with the log MCP tool getGuide({ useCase: "${matches[0].id}" }), and follow its steps in order: it becomes this session's play, every log tool's answer says the step you are on, and a send with no play loaded is refused (rule 157).`,
    ...lines,
    'If none of these is what he means, say which one you will follow and why before acting. Draft every message from that person\'s own thread and matt\'s real replies (`search`, `voice` with no text), and never send two that read alike.',
  ].join('\n')
}
