import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { basename, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BASELINE_SAMPLE, MUTE_IF_MATT_USES } from './types'
import type { AiBaseline, AiCloseMatch, AiEmbedder, AiIndex, AiIndexMeta, AiPhrase, AiReading, AiTellHit, AiTellRule } from './types'

const REGEX_CHARS = /[\\()[\]{}^$*+?|.]/

export function aiTellsDir(): string {
  return resolve(fileURLToPath(new URL('../../../vendor/aiTells', import.meta.url)))
}

export function aiIndexDir(): string {
  return process.env.LOG_AI_TELLS_INDEX || join(homedir(), '.logCli', 'aiTells')
}

export function valeRules(dir = join(aiTellsDir(), 'valeAiTells', 'styles')): AiTellRule[] {
  if (!existsSync(dir)) return []
  const rules: AiTellRule[] = []
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.yml')).sort()) {
    const raw = Bun.YAML.parse(readFileSync(join(dir, file), 'utf8')) as Record<string, unknown>
    const tokens = raw.extends === 'substitution' ? Object.keys((raw.swap as Record<string, string>) ?? {}) : raw.extends === 'existence' ? ((raw.tokens as string[]) ?? []) : []
    if (!tokens.length) continue
    rules.push({ name: basename(file, '.yml'), message: String(raw.message ?? ''), tokens: tokens.map(String), exceptions: ((raw.exceptions as string[]) ?? []).map((e) => String(e).toLowerCase()), ignorecase: raw.ignorecase === true, nonword: raw.nonword === true })
  }
  return rules
}

function patternOf(rule: AiTellRule): RegExp | null {
  const body = rule.tokens.map((t) => `(?:${t})`).join('|')
  try {
    return new RegExp(rule.nonword ? body : `\\b(?:${body})\\b`, rule.ignorecase ? 'gi' : 'g')
  } catch {
    return null
  }
}

export function ruleHits(text: string, rules: readonly AiTellRule[], muted: ReadonlySet<string> = new Set()): AiTellHit[] {
  const hits: AiTellHit[] = []
  for (const rule of rules) {
    if (muted.has(rule.name)) continue
    const pattern = patternOf(rule)
    if (!pattern) continue
    for (const m of text.matchAll(pattern)) {
      const match = m[0].trim()
      if (!match || rule.exceptions.some((e) => match.toLowerCase().includes(e))) continue
      hits.push({ rule: rule.name, match, message: rule.message.replace('%s', match) })
    }
  }
  return hits
}

function literal(token: string): string | null {
  const plain = token.replace(/\\b/g, '').trim()
  return plain && !REGEX_CHARS.test(plain) && plain.split(/\s+/).length >= 2 ? plain : null
}

function quoted(text: string): string[] {
  return [...text.matchAll(/["“]([^"”]{4,120})["”]/g)].map((m) => m[1].trim())
}

export function aiPhrases(dir = aiTellsDir(), rules = valeRules(join(dir, 'valeAiTells', 'styles'))): AiPhrase[] {
  const out = new Map<string, AiPhrase>()
  const add = (text: string, source: string) => {
    const clean = text.replace(/\s+/g, ' ').trim()
    if (clean.length >= 6 && clean.split(' ').length >= 2 && !out.has(clean.toLowerCase())) out.set(clean.toLowerCase(), { text: clean, source })
  }
  for (const rule of rules) for (const token of rule.tokens) {
    const plain = literal(token)
    if (plain) add(plain, `valeAiTells ${rule.name}`)
  }
  const feed = join(dir, 'feedHive', 'patterns.json')
  if (existsSync(feed)) {
    const data = JSON.parse(readFileSync(feed, 'utf8')) as { categories: { patterns: { name: string; description: string; bad?: string }[] }[] }
    for (const p of data.categories.flatMap((c) => c.patterns)) for (const q of [...quoted(p.description), ...quoted(p.bad ?? '')]) add(q, `aiSlopDetector ${p.name}`)
  }
  const guide = join(dir, 'sanderFrentz', 'styleGuide.json')
  if (existsSync(guide)) {
    const data = JSON.parse(readFileSync(guide, 'utf8')) as { avoid_phrases?: Record<string, unknown>; avoid_openers?: string[] }
    for (const phrase of Object.keys(data.avoid_phrases ?? {})) add(phrase, 'aiVocabulary phrase')
    for (const opener of data.avoid_openers ?? []) add(opener, 'aiVocabulary opener')
  }
  const slop = join(dir, 'sicarius', 'slop.yml')
  if (existsSync(slop)) {
    const data = Bun.YAML.parse(readFileSync(slop, 'utf8')) as { phrases?: string[] }
    for (const phrase of data.phrases ?? []) if (!String(phrase).startsWith('re:')) add(String(phrase), 'SLOP_Detector')
  }
  const examples = join(dir, 'aiExamples')
  if (existsSync(examples)) for (const file of readdirSync(examples)) {
    for (const sentence of readFileSync(join(examples, file), 'utf8').replace(/[#*>`_]/g, ' ').split(/(?<=[.!?])\s+|\n+/)) if (sentence.split(/\s+/).length >= 4) add(sentence, `aiExample ${file}`)
  }
  return [...out.values()]
}

export function overusedWords(dir = aiTellsDir()): Map<string, number> {
  const file = join(dir, 'lexaIndex', 'overusedWords.json')
  const words = new Map<string, number>()
  if (!existsSync(file)) return words
  const data = JSON.parse(readFileSync(file, 'utf8')) as { models: Record<string, { word: string; ratio: number }[]> }
  for (const list of Object.values(data.models)) for (const w of list) if (w.ratio >= 4) words.set(w.word.toLowerCase(), Math.max(words.get(w.word.toLowerCase()) ?? 0, w.ratio))
  return words
}

export function chunksOf(text: string, size = 6, step = 3, max = 60): string[] {
  const chunks: string[] = []
  for (const line of text.split(/\n+/).map((l) => l.trim()).filter(Boolean)) {
    const words = line.split(/\s+/)
    if (words.length <= size * 2) chunks.push(line)
    if (words.length > size) for (let i = 0; i + size <= words.length; i += step) chunks.push(words.slice(i, i + size).join(' '))
  }
  return [...new Set(chunks)].slice(0, max)
}

function cosine(a: ArrayLike<number>, b: ArrayLike<number>): number {
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0
}

export function percentile(values: readonly number[], p: number): number {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1))]
}

function bestPerChunk(chunkVectors: number[][], index: Pick<AiIndex, 'vectors'>): { chunk: number; phrase: number; cosine: number }[] {
  return chunkVectors.map((v, chunk) => {
    let phrase = -1
    let best = -1
    index.vectors.forEach((w, i) => {
      const c = cosine(v, w)
      if (c > best) {
        best = c
        phrase = i
      }
    })
    return { chunk, phrase, cosine: best }
  })
}

export function mutedRules(replies: readonly string[], rules: readonly AiTellRule[], share = MUTE_IF_MATT_USES): string[] {
  if (!replies.length) return []
  return rules.filter((rule) => replies.filter((r) => ruleHits(r, [rule]).length).length / replies.length > share).map((r) => r.name)
}

export async function buildAiIndex(embedder: AiEmbedder, replies: readonly string[], dir = aiIndexDir(), phrases = aiPhrases(), rules = valeRules(), log: (line: string) => void = () => {}): Promise<AiIndexMeta> {
  log(`ai tells: embedding ${phrases.length} AI phrases with ${embedder.model}`)
  const vectors = await embedder.embed(phrases.map((p) => p.text))
  const index = { vectors: vectors.map((v) => Float32Array.from(v)) }
  const sample = replies.filter((r) => r.trim().split(/\s+/).length >= 3).slice(-BASELINE_SAMPLE)
  log(`ai tells: measuring how close ${sample.length} of matt's own messages sit to them`)
  const scores: number[] = []
  const chunked = sample.map((r) => chunksOf(r))
  const flat = await embedder.embed(chunked.flat())
  let at = 0
  for (const chunks of chunked) {
    const mine = flat.slice(at, at + chunks.length)
    at += chunks.length
    scores.push(Math.max(...bestPerChunk(mine, index).map((b) => b.cosine)))
  }
  const baseline: AiBaseline = { messages: scores.length, p50: percentile(scores, 50), p99: percentile(scores, 99), mutedRules: mutedRules(replies, rules) }
  const meta: AiIndexMeta = { model: embedder.model, dimensions: embedder.dimensions, builtAt: new Date().toISOString(), phrases, baseline }
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.json'), JSON.stringify(meta))
  const flatVectors = new Float32Array(vectors.length * embedder.dimensions)
  vectors.forEach((v, i) => flatVectors.set(v, i * embedder.dimensions))
  writeFileSync(join(dir, 'vectors.f32'), Buffer.from(flatVectors.buffer))
  return meta
}

export function openAiIndex(dir = aiIndexDir()): AiIndex | null {
  if (!existsSync(join(dir, 'index.json')) || !existsSync(join(dir, 'vectors.f32'))) return null
  const meta = JSON.parse(readFileSync(join(dir, 'index.json'), 'utf8')) as AiIndexMeta
  const raw = readFileSync(join(dir, 'vectors.f32'))
  const all = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4)
  const vectors = meta.phrases.map((_, i) => all.subarray(i * meta.dimensions, (i + 1) * meta.dimensions))
  return { ...meta, vectors }
}

export async function readAiTells(text: string, index: AiIndex, embedder: AiEmbedder, rules = valeRules(), words = overusedWords(), top = 8): Promise<AiReading> {
  const hits = ruleHits(text, rules, new Set(index.baseline.mutedRules))
  const overused = [...new Set(text.toLowerCase().match(/[a-z]+/g) ?? [])].filter((w) => words.has(w)).map((w) => ({ word: w, ratio: words.get(w)! }))
  const chunks = chunksOf(text)
  const best = chunks.length ? bestPerChunk(await embedder.embed(chunks), index) : []
  const ranked = best.sort((a, b) => b.cosine - a.cosine).slice(0, top)
  const reranks = ranked.length ? await embedder.rerank(text, ranked.map((r) => index.phrases[r.phrase].text)) : []
  const closest: AiCloseMatch[] = ranked.map((r, i) => ({ chunk: chunks[r.chunk], phrase: index.phrases[r.phrase].text, source: index.phrases[r.phrase].source, cosine: Number(r.cosine.toFixed(4)), rerank: reranks[i] === undefined ? null : Number(reranks[i].toFixed(4)) }))
  const score = closest[0]?.cosine ?? 0
  const flagged = score > index.baseline.p99
  return { hits, overused, closest, score, p50: index.baseline.p50, p99: index.baseline.p99, flagged, pass: !hits.length && !flagged }
}

export function aiTellsLine(reading: AiReading): string {
  const head = reading.pass ? 'ai tells: none' : 'AI TELLS'
  const hits = reading.hits.map((h) => `"${h.match}" (${h.rule})`).join(', ')
  const close = reading.closest[0] ? `closest AI phrase "${reading.closest[0].phrase}" to "${reading.closest[0].chunk}" at ${reading.score.toFixed(3)} (matt's own p50 ${reading.p50.toFixed(3)}, p99 ${reading.p99.toFixed(3)}${reading.flagged ? ', past his p99' : ''})` : 'nothing to compare'
  const words = reading.overused.length ? `; words AI overuses: ${reading.overused.map((w) => `${w.word} ×${w.ratio.toFixed(1)}`).join(', ')}` : ''
  return `${head}${hits ? `: ${hits}` : ''}; ${close}${words}`
}
