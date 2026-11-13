import { correctTypos, denseScores, windowsOf } from './helpers'
import { AMBIGUITY_BAND, DEFAULT_MENU_FLOOR, DEFAULT_THRESHOLD, DENSE_WEIGHT, MATCHES_SHOWN, MIN_PHRASE_WORDS, NOT_A_PROMPT, PLATFORM_BONUS, PLATFORM_FOLDERS, PLATFORM_WORDS, SHORT_PROMPT_WORDS, STOP_WORDS, WORD_AMBIGUITY_BAND, WORD_MENU_FLOOR, WORD_THRESHOLD } from './types'
import type { EmbedTexts, PlayMatch, RoutableUseCase, RouteContext, RouteDecision, RouteIndex, Thresholds, Utterance } from './types'

const PLACEHOLDER = /<[^<>]*>/g

const TIE_EPSILON = 1e-9

export function stem(word: string): string {
  if (word.length > 4 && word.endsWith('ies')) return `${word.slice(0, -3)}y`
  if (word.length > 5 && word.endsWith('ied')) return `${word.slice(0, -3)}y`
  const plain = word.length > 4 && word.endsWith('s') && !word.endsWith('ss') ? word.slice(0, -1) : word
  if (plain.length > 5 && plain.endsWith('ing')) return plain.slice(0, -3)
  if (plain.length > 5 && plain.endsWith('ed')) return plain.slice(0, -2)
  if (plain.length > 4 && plain.endsWith('e')) return plain.slice(0, -1)
  return plain
}

export function contentWords(text: string): string[] {
  return (text.toLowerCase().replace(/https?:\/\/\S+/g, ' ').replace(PLACEHOLDER, ' ').replace(/['’]/g, '').match(/[a-z0-9]+/g) ?? []).filter((w) => !STOP_WORDS.has(w)).map(stem)
}

const STEMMED_PLATFORM_WORDS: ReadonlyMap<string, string> = new Map(Object.entries(PLATFORM_WORDS).flatMap(([word, platform]) => [[word, platform], [stem(word), platform]]))

export function platformsOf(words: Iterable<string>): string[] {
  const out = new Set<string>()
  for (const word of words) {
    const platform = STEMMED_PLATFORM_WORDS.get(word)
    if (platform) out.add(platform)
  }
  return [...out].sort()
}

export function folderOf(id: string): string {
  return id.split('/')[0] ?? ''
}

export function isPlatformFolder(id: string): boolean {
  return PLATFORM_FOLDERS.has(folderOf(id))
}

export function phrasesOf(useCase: RoutableUseCase): string[] {
  const quoted = [...useCase.asks.matchAll(/"([^"]+)"/g)].map((m) => m[1])
  return [...quoted, useCase.title].filter((p) => {
    const words = new Set(contentWords(p)).size
    return words >= MIN_PHRASE_WORDS || (words === 1 && !/<[^<>]*>/.test(p))
  })
}

export function phraseScore(promptWords: ReadonlySet<string>, phrase: string): number {
  const words = [...new Set(contentWords(phrase))]
  if (!words.length) return 0
  if (words.length < MIN_PHRASE_WORDS) return promptWords.has(words[0]) ? (promptWords.size <= SHORT_PROMPT_WORDS ? 1 : 1 / MIN_PHRASE_WORDS) : 0
  return words.filter((w) => promptWords.has(w)).length / words.length
}

export function isPrompt(text: string): boolean {
  return !NOT_A_PROMPT.some((pattern) => pattern.test(text))
}

export function utterancesOf(useCases: readonly RoutableUseCase[], extra: readonly Utterance[] = []): Utterance[] {
  const known = new Set(useCases.map((u) => u.id))
  return [...useCases.flatMap((u) => phrasesOf(u).map((text) => ({ route: u.id, text }))), ...extra.filter((u) => known.has(u.route))]
}

export function vocabularyOf(texts: readonly string[]): Set<string> {
  const vocabulary = new Set(texts.flatMap((t) => (t.toLowerCase().match(/[a-z]+/g) ?? []).filter((w) => w.length >= 3)))
  for (const word of STOP_WORDS) vocabulary.add(word)
  for (const word of Object.keys(PLATFORM_WORDS)) vocabulary.add(word)
  return vocabulary
}

const vocabularies = new WeakMap<readonly RoutableUseCase[], Set<string>>()

let lastVocabulary: { key: string; vocabulary: Set<string> } | null = null

const textOf = (useCase: RoutableUseCase) => (useCase as RoutableUseCase & { text?: string }).text ?? ''

export function useCaseVocabulary(useCases: readonly RoutableUseCase[]): Set<string> {
  const known = vocabularies.get(useCases)
  if (known) return known
  const key = useCases.map((u) => `${u.id}\u0000${u.asks}\u0000${textOf(u)}`).join('\u0001')
  const built = lastVocabulary?.key === key ? lastVocabulary.vocabulary : vocabularyOf([...utterancesOf(useCases).map((u) => u.text), ...useCases.map(textOf)])
  lastVocabulary = { key, vocabulary: built }
  vocabularies.set(useCases, built)
  return built
}

export async function buildRouteIndex(useCases: readonly RoutableUseCase[], embed: EmbedTexts, model: string, extra: readonly Utterance[] = [], vocabularyText = ''): Promise<RouteIndex> {
  const utterances = utterancesOf(useCases, extra)
  const vectors = await embed(utterances.map((u) => u.text.toLowerCase()))
  const vocabulary = vocabularyOf([...utterances.map((u) => u.text), vocabularyText])
  return { model, useCases: [...useCases], utterances, extra: [...extra], vectors, vocabulary, titles: new Map(useCases.map((u) => [u.id, u.title])) }
}

export function sparseScores(prompt: string, utterances: readonly Utterance[]): Map<string, { score: number; text: string }> {
  const words = new Set(contentWords(prompt))
  const out = new Map<string, { score: number; text: string }>()
  for (const u of utterances) {
    const score = phraseScore(words, u.text)
    if (score > (out.get(u.route)?.score ?? 0)) out.set(u.route, { score, text: u.text })
  }
  return out
}

interface Scored extends PlayMatch {
  base: number
  named: boolean
  guess: boolean
}

const byScore = (a: Scored, b: Scored) => b.score - a.score || Number(b.named) - Number(a.named) || a.id.localeCompare(b.id)

const emptyDecision = (started: number, skipped?: RouteDecision['skipped']): RouteDecision => ({ outcome: 'none', play: null, matches: [], ranked: [], menu: [], platforms: [], ...(skipped ? { skipped } : {}), corrected: [], ms: { correct: 0, embed: 0, score: 0, total: performance.now() - started } })

export function route(prompt: string, context: RouteContext): RouteDecision {
  const started = performance.now()
  if (!isPrompt(prompt)) return emptyDecision(started, 'notAPrompt')
  const vocabulary = context.vocabulary === undefined ? useCaseVocabulary(context.useCases) : context.vocabulary
  const fixed = vocabulary ? correctTypos(prompt.replace(/https?:\/\/\S+/g, ' '), vocabulary) : { text: prompt, corrected: [] }
  const corrected = performance.now()
  const words = new Set(contentWords(fixed.text))
  if (!words.size) return { ...emptyDecision(started, 'trivial'), corrected: fixed.corrected }
  const platforms = platformsOf(words)
  const named = new Set(platforms)
  const sparse = sparseScores(fixed.text, utterancesOf(context.useCases, context.extra ?? []))
  const dense = context.dense
  const thresholds: Thresholds = context.thresholds ?? {}
  const scored: Scored[] = []
  for (const useCase of context.useCases) {
    const folder = folderOf(useCase.id)
    if (named.size && PLATFORM_FOLDERS.has(folder) && !named.has(folder)) continue
    const s = sparse.get(useCase.id)
    const d = dense?.get(useCase.id)
    const base = dense ? DENSE_WEIGHT * (d?.score ?? 0) + (1 - DENSE_WEIGHT) * (s?.score ?? 0) : (s?.score ?? 0)
    if (base <= 0) continue
    const onPlatform = named.has(folder)
    const phrase = (dense ? (d?.text ?? s?.text) : s?.text) ?? ''
    const guess = !onPlatform && platformsOf(contentWords(phrase)).some((p) => !named.has(p))
    scored.push({ id: useCase.id, title: useCase.title, score: base + (onPlatform ? PLATFORM_BONUS : 0), base, phrase, named: onPlatform, guess })
  }
  scored.sort(byScore)
  const ranked = scored.slice(0, MATCHES_SHOWN).map(({ named: _n, guess: _g, base: _b, ...m }) => m)
  const threshold = (id: string) => thresholds[id] ?? thresholds.default ?? (dense ? DEFAULT_THRESHOLD : WORD_THRESHOLD)
  const band = dense ? AMBIGUITY_BAND : WORD_AMBIGUITY_BAND
  const menuFloor = thresholds.menu ?? (dense ? DEFAULT_MENU_FLOOR : WORD_MENU_FLOOR)
  const [top, second] = scored
  const clear = Boolean(top) && !top.guess && top.base >= threshold(top.id) && (!second || top.score - second.score >= band - TIE_EPSILON)
  const done = performance.now()
  const ms = { correct: corrected - started, embed: 0, score: done - corrected, total: done - started }
  if (clear) {
    const play = ranked[0]
    return { outcome: 'play', play, matches: [play], ranked, menu: [], platforms, corrected: fixed.corrected, ms }
  }
  const menu = ranked.filter((m) => m.score >= menuFloor)
  return { outcome: menu.length ? 'menu' : 'none', play: null, matches: [], ranked, menu, platforms, corrected: fixed.corrected, ms }
}

export async function routePrompt(prompt: string, index: RouteIndex, embed: EmbedTexts, thresholds: Thresholds = {}): Promise<RouteDecision> {
  const started = performance.now()
  if (!isPrompt(prompt)) return emptyDecision(started, 'notAPrompt')
  const fixed = correctTypos(prompt.replace(/https?:\/\/\S+/g, ' '), index.vocabulary)
  if (!contentWords(fixed.text).length) return { ...emptyDecision(started, 'trivial'), corrected: fixed.corrected }
  const corrected = performance.now()
  const vectors = await embed(windowsOf(fixed.text))
  const embedded = performance.now()
  const decision = route(fixed.text, { useCases: index.useCases, extra: index.extra, dense: denseScores(vectors, index), thresholds, vocabulary: null })
  const done = performance.now()
  return { ...decision, corrected: fixed.corrected, ms: { correct: corrected - started, embed: embedded - corrected, score: done - embedded, total: done - started } }
}

export function outcomeOf(decision: Pick<RouteDecision, 'play' | 'menu' | 'skipped'>): string {
  if (decision.play) return decision.play.id
  return decision.menu.length ? 'menu' : 'none'
}

export function playMatchText(matches: readonly PlayMatch[], menu: readonly PlayMatch[] = []): string {
  const draft = "In a play, every message is drafted from that person's own thread and the owner's real replies (`search`, `voice` with no text), and no two read alike."
  const none = 'Building, fixing or talking about log itself is not a play.'
  if (matches.length) {
    const [top] = matches
    return [
      `>>> PLAY MATCH: the prompt matches the log play ${top.id} (${top.title}), closest to "${top.phrase}" (${Math.round(top.score * 100)}%). Its steps load with getGuide({ useCase: "${top.id}" }). ${none}`,
      draft,
    ].join('\n')
  }
  if (!menu.length) return ''
  return [
    `>>> MAYBE A PLAY: the prompt is close to these log plays, and none of them is a clear match. A play loads with getGuide({ useCase }). ${none}`,
    ...menu.map((m) => `  ${m.id}: ${m.title}`),
  ].join('\n')
}
