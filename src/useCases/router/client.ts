import { correctTypos, denseScores, windowsOf } from './helpers'
import { AMBIGUITY_BAND, DEFAULT_MENU_FLOOR, DEFAULT_THRESHOLD, DENSE_WEIGHT, MATCH_FLOOR, MATCHES_SHOWN, MIN_PHRASE_WORDS, NOT_A_PROMPT, STOP_WORDS, TRIVIAL_WORDS } from './types'
import type { EmbedTexts, PlayMatch, RoutableUseCase, RouteDecision, RouteIndex, Thresholds, Utterance } from './types'

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

export function isPrompt(text: string): boolean {
  return !NOT_A_PROMPT.some((pattern) => pattern.test(text))
}

export function utterancesOf(useCases: readonly RoutableUseCase[], extra: readonly Utterance[] = []): Utterance[] {
  const known = new Set(useCases.map((u) => u.id))
  return [...useCases.flatMap((u) => phrasesOf(u).map((text) => ({ route: u.id, text }))), ...extra.filter((u) => known.has(u.route))]
}

export async function buildRouteIndex(useCases: readonly RoutableUseCase[], embed: EmbedTexts, model: string, extra: readonly Utterance[] = [], vocabularyText = ''): Promise<RouteIndex> {
  const utterances = utterancesOf(useCases, extra)
  const vectors = await embed(utterances.map((u) => u.text.toLowerCase()))
  const vocabulary = new Set([...utterances.map((u) => u.text), vocabularyText].flatMap((t) => (t.toLowerCase().match(/[a-z]+/g) ?? []).filter((w) => w.length >= 3)))
  for (const word of STOP_WORDS) vocabulary.add(word)
  return { model, utterances, vectors, vocabulary, titles: new Map(useCases.map((u) => [u.id, u.title])) }
}

export function sparseScores(prompt: string, index: RouteIndex): Map<string, { score: number; text: string }> {
  const words = new Set(contentWords(prompt))
  const out = new Map<string, { score: number; text: string }>()
  for (const u of index.utterances) {
    const score = phraseScore(words, u.text)
    if (score > (out.get(u.route)?.score ?? 0)) out.set(u.route, { score, text: u.text })
  }
  return out
}

export async function routePrompt(prompt: string, index: RouteIndex, embed: EmbedTexts, thresholds: Thresholds = {}): Promise<RouteDecision> {
  const started = performance.now()
  if (!isPrompt(prompt)) return { matches: [], ranked: [], menu: [], skipped: 'notAPrompt', corrected: [], ms: { correct: 0, embed: 0, score: 0, total: performance.now() - started } }
  if (contentWords(prompt).length < TRIVIAL_WORDS) return { matches: [], ranked: [], menu: [], skipped: 'trivial', corrected: [], ms: { correct: 0, embed: 0, score: 0, total: performance.now() - started } }
  const fixed = correctTypos(prompt.replace(/https?:\/\/\S+/g, ' '), index.vocabulary)
  const corrected = performance.now()
  const vectors = await embed(windowsOf(fixed.text))
  const embedded = performance.now()
  const dense = denseScores(vectors, index)
  const sparse = sparseScores(fixed.text, index)
  const ranked = [...new Set([...dense.keys(), ...sparse.keys()])]
    .map((route) => {
      const d = dense.get(route)
      const s = sparse.get(route)
      return { id: route, title: index.titles.get(route) ?? route, score: DENSE_WEIGHT * (d?.score ?? 0) + (1 - DENSE_WEIGHT) * (s?.score ?? 0), phrase: d?.text ?? s?.text ?? '' }
    })
    .sort((a, b) => b.score - a.score)
  const passing = ranked.filter((m) => m.score >= (thresholds[m.id] ?? thresholds.default ?? DEFAULT_THRESHOLD))
  const matches = passing.length ? passing.filter((m, i) => i === 0 || passing[0].score - m.score <= AMBIGUITY_BAND).slice(0, MATCHES_SHOWN) : []
  const done = performance.now()
  const menu = matches.length ? [] : ranked.slice(0, MATCHES_SHOWN).filter((m) => m.score >= (thresholds.menu ?? DEFAULT_MENU_FLOOR))
  return { matches, menu, ranked: ranked.slice(0, MATCHES_SHOWN), corrected: fixed.corrected, ms: { correct: corrected - started, embed: embedded - corrected, score: done - embedded, total: done - started } }
}

export function topCandidates(decision: RouteDecision): PlayMatch[] {
  return decision.matches
}

export function playMatchText(matches: readonly PlayMatch[], menu: readonly PlayMatch[] = []): string {
  const draft = "Draft every message from that person's own thread and matt's real replies (`search`, `voice` with no text), and never send two that read alike."
  if (matches.length) {
    const lines = matches.map((m) => `  ${m.id} (${m.title}): closest to "${m.phrase}" (${Math.round(m.score * 100)}%)`)
    return [
      `>>> PLAY MATCH: matt's message reads like a play log already has (rule 158). If it is, load it before doing anything with the log MCP tool getGuide({ useCase: "${matches[0].id}" }) and follow its steps in order (rule 157).`,
      ...lines,
      `First say in one line which play you are following, or that it's none of these (building, fixing or talking about the system is none). ${draft}`,
    ].join('\n')
  }
  if (!menu.length) return ''
  return [
    '>>> MAYBE A PLAY (rule 158): before any tool, decide in one line whether matt is asking for one of these, or none (building, fixing or talking about the system is none). If one, load it with getGuide({ useCase }) and follow it.',
    ...menu.map((m) => `  ${m.id}: ${m.title}`),
  ].join('\n')
}
