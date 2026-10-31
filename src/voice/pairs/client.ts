import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { BM25, tokenize } from 'bm25s'
import { VectorDB } from 'verso-db'
import type { Collection } from 'verso-db'
import { reciprocalRankFusion, searchRoot } from '../../search/conversations/index'
import type { Conversation, Embedder } from '../../search/conversations/index'
import { profileOf, startRatesOf, wordCounts } from './helpers/index'
import { NEAR_PAIRS, SAID_MESSAGES, TIER_ORDER, VOICE_DEPTH } from './types'
import type { NearPair, VoicePair, VoiceProfile, VoiceTarget } from './types'

type PairMeta = { platform: string; conversationId: string }

export interface VoiceIndex {
  dir: string
  pairs: VoicePair[]
  byId: Map<string, VoicePair>
  profiles: Record<string, VoiceProfile>
  keyword: BM25
  embedder: Embedder
  vectors: Collection<PairMeta>
  wording: Collection<PairMeta>
  close(): Promise<void>
}

export function voiceDir(): string {
  return join(searchRoot(), 'voice')
}

function chatOf(c: Conversation): { chat: string; kind: 'dm' | 'group' } {
  const named = /^group (.+)$/.exec(c.box)?.[1]
  const kind = c.with.length > 1 || c.box.startsWith('group') ? 'group' : 'dm'
  return { chat: named ?? c.with.join(', '), kind }
}

export function pairsOf(conversations: readonly Conversation[]): VoicePair[] {
  const out: VoicePair[] = []
  for (const c of conversations) {
    const { chat, kind } = chatOf(c)
    const said = c.messages.filter((m) => m.text.trim())
    for (let i = 0; i < said.length; i++) {
      if (!said[i].fromMe) continue
      let end = i
      while (end + 1 < said.length && said[end + 1].fromMe) end++
      const before: typeof said = []
      for (let j = i - 1; j >= 0 && !said[j].fromMe && before.length < SAID_MESSAGES; j--) before.unshift(said[j])
      out.push({
        id: `${c.platform}:${c.account}:${c.conversationId}:${said[i].id}`,
        platform: c.platform,
        account: c.account,
        conversationId: c.conversationId,
        chat,
        kind,
        with: c.with,
        at: said[end].at,
        said: before.map((m) => m.text.replace(/\s+/g, ' ').trim()).join('\n'),
        saidBy: before.length ? before[before.length - 1].from : null,
        reply: said.slice(i, end + 1).map((m) => m.text.replace(/\s+/g, ' ').trim()).join('\n'),
        parts: end - i + 1,
        gaps: said.slice(i + 1, end + 1).map((m, k) => Math.max(0, (Date.parse(m.at ?? '') - Date.parse(said[i + k].at ?? '')) / 1000)).filter((g) => Number.isFinite(g)),
      })
      i = end
    }
  }
  return out
}

export function profilesOf(pairs: readonly VoicePair[]): Record<string, VoiceProfile> {
  const everyone = wordCounts(pairs)
  const groups = new Map<string, VoicePair[]>()
  const add = (key: string, pair: VoicePair) => groups.set(key, [...(groups.get(key) ?? []), pair])
  for (const pair of pairs) {
    add(`chat:${pair.platform}:${pair.conversationId}`, pair)
    if (pair.kind === 'dm') for (const person of pair.with) add(`person:${person.toLowerCase()}`, pair)
    add(`platform:${pair.platform}`, pair)
    add('everyone', pair)
  }
  const profiles = Object.fromEntries([...groups.entries()].map(([key, list]) => [key, profileOf(key, list, everyone, pairs.length)]))
  if (profiles.everyone) profiles.everyone.startRates = startRatesOf(pairs)
  return profiles
}

function situationOf(pair: VoicePair): string {
  return pair.said || pair.reply
}

export async function buildVoiceIndex(conversations: readonly Conversation[], embedder: Embedder, dir = voiceDir(), batch = 64): Promise<{ pairs: number; profiles: number; ms: number }> {
  const started = performance.now()
  const pairs = pairsOf(conversations)
  const profiles = profilesOf(pairs)
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'pairs.json'), JSON.stringify(pairs))
  writeFileSync(join(dir, 'profiles.json'), JSON.stringify(profiles))
  writeFileSync(join(dir, 'model.json'), JSON.stringify({ model: embedder.model, dimensions: embedder.dimensions, builtAt: new Date().toISOString() }))
  const keyword = new BM25()
  keyword.index(tokenize(pairs.map(situationOf)))
  await keyword.save(join(dir, 'bm25'))
  const db = await VectorDB.open({ path: join(dir, 'vectors') })
  const collection = await db.createCollection<PairMeta>('pairs', { vector: { dimensions: embedder.dimensions, metric: 'cosine' }, index: { type: 'hnsw', profile: 'balanced' } })
  const wording = await db.createCollection<PairMeta>('wording', { vector: { dimensions: embedder.dimensions, metric: 'cosine' }, index: { type: 'hnsw', profile: 'balanced' } })
  for (let start = 0; start < pairs.length; start += batch) {
    const slice = pairs.slice(start, start + batch)
    const situations = await embedder.embed(slice.map(situationOf))
    const replies = await embedder.embed(slice.map((p) => p.reply))
    const meta = (p: VoicePair) => ({ platform: p.platform, conversationId: p.conversationId })
    await collection.insert(slice.map((p, i) => ({ id: p.id, vector: situations[i], metadata: meta(p) })))
    await wording.insert(slice.map((p, i) => ({ id: p.id, vector: replies[i], metadata: meta(p) })))
  }
  await db.close()
  return { pairs: pairs.length, profiles: Object.keys(profiles).length, ms: performance.now() - started }
}

export async function openVoiceIndex(embedder: Embedder, dir = voiceDir()): Promise<VoiceIndex> {
  if (!existsSync(join(dir, 'pairs.json'))) throw new Error(`no voice index at ${dir}: build it with \`log voice index\``)
  const pairs = JSON.parse(readFileSync(join(dir, 'pairs.json'), 'utf8')) as VoicePair[]
  const profiles = JSON.parse(readFileSync(join(dir, 'profiles.json'), 'utf8')) as Record<string, VoiceProfile>
  const keyword = await BM25.load(join(dir, 'bm25'))
  const db = await VectorDB.open({ path: join(dir, 'vectors') })
  const vectors = await db.collection<PairMeta>('pairs')
  const wording = await db.collection<PairMeta>('wording')
  return { dir, pairs, byId: new Map(pairs.map((p) => [p.id, p])), profiles, keyword, embedder, vectors, wording, close: () => db.close() }
}

export function tierOf(pair: VoicePair, target: VoiceTarget): NearPair['tier'] {
  if (target.conversationId && pair.conversationId === target.conversationId && (!target.platform || pair.platform === target.platform)) return 'sameChat'
  const people = new Set((target.with ?? []).map((w) => w.toLowerCase()))
  if (people.size && pair.with.some((w) => people.has(w.toLowerCase()))) return 'samePerson'
  if (target.platform && pair.platform === target.platform) return 'samePlatform'
  return 'anywhere'
}

export async function nearestPairs(index: VoiceIndex, situation: string, target: VoiceTarget, limit = NEAR_PAIRS): Promise<NearPair[]> {
  const depth = Math.min(index.pairs.length, VOICE_DEPTH)
  if (!depth) return []
  const byKeyword = (() => {
    const tokens = tokenize([situation])
    const words = new Map([...tokens.vocab].map(([word, id]) => [id, word]))
    const terms = [tokens.ids[0].map((id) => words.get(id) ?? '').filter(Boolean)]
    if (!terms[0].length) return []
    const found = index.keyword.retrieve(terms, { k: depth })
    return Array.from(found.documents[0]).filter((_, i) => found.scores[0][i] > 0).map((n) => index.pairs[n as number].id)
  })()
  const [vector] = await index.embedder.embed([situation])
  const byMeaning = (await index.vectors.search({ vector, limit: depth })).matches.map((m: { id: string | number }) => String(m.id))
  const fused = reciprocalRankFusion([byKeyword, byMeaning]).filter((f) => index.byId.has(f.id))
  const ranked = fused.map((f, i) => ({ pair: index.byId.get(f.id)!, rank: i + 1 })).map((r) => ({ ...r, tier: tierOf(r.pair, target) }))
  const inChat = index.pairs.filter((p) => tierOf(p, target) === 'sameChat')
  const seen = new Set(ranked.map((r) => r.pair.id))
  const recent = inChat.filter((p) => !seen.has(p.id)).sort((a, b) => String(b.at ?? '').localeCompare(String(a.at ?? ''))).map((pair, i) => ({ pair, rank: ranked.length + i + 1, tier: 'sameChat' as const }))
  return [...ranked, ...recent].sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) || a.rank - b.rank).slice(0, limit)
}

export async function closestWording(index: VoiceIndex, draft: string, target: VoiceTarget, limit = NEAR_PAIRS): Promise<NearPair[]> {
  const depth = Math.min(index.pairs.length, VOICE_DEPTH)
  if (!depth || !draft.trim()) return []
  const [vector] = await index.embedder.embed([draft])
  const found = (await index.wording.search({ vector, limit: depth })).matches.map((m: { id: string | number }) => String(m.id)).filter((id) => index.byId.has(id))
  return found
    .map((id, i) => ({ pair: index.byId.get(id)!, rank: i + 1 }))
    .map((r) => ({ ...r, tier: tierOf(r.pair, target) }))
    .sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) || a.rank - b.rank)
    .slice(0, limit)
}

export function recentInChat(index: Pick<VoiceIndex, 'pairs'>, target: VoiceTarget, limit = NEAR_PAIRS): VoicePair[] {
  return index.pairs
    .filter((p) => tierOf(p, target) === 'sameChat')
    .sort((a, b) => String(b.at ?? '').localeCompare(String(a.at ?? '')))
    .slice(0, limit)
}

export function readProfiles(dir = voiceDir()): Record<string, VoiceProfile> {
  const path = join(dir, 'profiles.json')
  return existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as Record<string, VoiceProfile>) : {}
}

export function profileFor(index: Pick<VoiceIndex, 'profiles'>, target: VoiceTarget): VoiceProfile | null {
  const p = index.profiles
  if (target.conversationId && target.platform && p[`chat:${target.platform}:${target.conversationId}`]?.replies) return p[`chat:${target.platform}:${target.conversationId}`]
  for (const person of target.with ?? []) if (p[`person:${person.toLowerCase()}`]?.replies) return p[`person:${person.toLowerCase()}`]
  if (target.platform && p[`platform:${target.platform}`]) return p[`platform:${target.platform}`]
  return p.everyone ?? null
}
