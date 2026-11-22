import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { BM25, tokenize } from 'bm25s'
import { VectorDB } from 'verso-db'
import type { Collection } from 'verso-db'
import { buildPhraseIndex, writePhraseIndex } from '../../voice/phrases/index'
import { profilesOf, readProfiles, voiceDir } from '../../voice/pairs/index'
import type { VoicePair, VoiceProfile } from '../../voice/pairs/types'
import type { Conversation, Embedder } from '../../search/conversations/types'
import { pairsOf } from '../../voice/pairs/index'

type PairMeta = { platform: string; conversationId: string }
type Store = Awaited<ReturnType<typeof VectorDB.open>>

export interface VoiceStageReport {
  pairs: number
  paired: number
  embedded: number
  profiles: number
  created: boolean
  ms: number
}

const situationOf = (pair: VoicePair): string => pair.said || pair.reply

const keyOfConversation = (c: { platform: string; account: string; conversationId: string }): string => `${c.platform}\u0000${c.account}\u0000${c.conversationId}`

const keyOfPair = (p: VoicePair): string => `${p.platform}\u0000${p.account}\u0000${p.conversationId}`

export class VoiceStage {
  private dir: string
  private embedder: Embedder
  private batch: number
  private held: VoicePair[] | null = null
  private pending = new Map<string, VoicePair>()
  private gone = new Set<string>()
  private db: Store | null = null
  private vectors: Collection<PairMeta> | null = null
  private wording: Collection<PairMeta> | null = null
  private embedded = 0
  private created = false
  private started = performance.now()

  constructor(embedder: Embedder, dir = voiceDir(), batch = 64) {
    this.embedder = embedder
    this.dir = dir
    this.batch = batch
  }

  private load(): VoicePair[] {
    if (this.held) return this.held
    const file = join(this.dir, 'pairs.json')
    this.created = !existsSync(file) || !existsSync(join(this.dir, 'profiles.json')) || !existsSync(join(this.dir, 'vectors'))
    this.held = existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as VoicePair[]) : []
    return this.held
  }

  async add(conversations: readonly Conversation[]): Promise<{ pairs: number; embedded: number }> {
    const held = this.load()
    const fresh = pairsOf(conversations)
    const touched = new Set(conversations.map((c) => keyOfConversation(c)))
    const mine = new Set(fresh.map((p) => p.id))
    const older = new Map(held.map((p) => [p.id, p]))
    for (const pair of fresh) this.pending.set(pair.id, pair)
    for (const pair of held) {
      if (mine.has(pair.id) || !touched.has(keyOfPair(pair))) continue
      this.gone.add(pair.id)
      this.pending.delete(pair.id)
    }
    const changed = fresh.filter((p) => {
      const before = older.get(p.id)
      return !before || before.said !== p.said || before.reply !== p.reply || before.at !== p.at
    })
    if (!changed.length && !this.gone.size) return { pairs: fresh.length, embedded: 0 }
    await this.open()
    if (this.gone.size) {
      await this.vectors!.delete([...this.gone])
      await this.wording!.delete([...this.gone])
    }
    const answered = changed.filter((p) => p.reply.trim())
    for (let start = 0; start < changed.length; start += this.batch) {
      const slice = changed.slice(start, start + this.batch)
      const vectors = await this.embedder.embed(slice.map(situationOf))
      await this.vectors!.upsert(slice.map((p, i) => ({ id: p.id, vector: vectors[i], metadata: { platform: p.platform, conversationId: p.conversationId } })))
    }
    for (let start = 0; start < answered.length; start += this.batch) {
      const slice = answered.slice(start, start + this.batch)
      const vectors = await this.embedder.embed(slice.map((p) => p.reply))
      await this.wording!.upsert(slice.map((p, i) => ({ id: p.id, vector: vectors[i], metadata: { platform: p.platform, conversationId: p.conversationId } })))
    }
    this.embedded += changed.length
    return { pairs: fresh.length, embedded: changed.length }
  }

  private async open(): Promise<void> {
    if (this.vectors) return
    mkdirSync(this.dir, { recursive: true })
    this.db = await VectorDB.open({ path: join(this.dir, 'vectors') })
    const shape = { vector: { dimensions: this.embedder.dimensions, metric: 'cosine' as const }, index: { type: 'hnsw' as const, profile: 'balanced' as const } }
    this.vectors = this.created ? await this.db.createCollection<PairMeta>('pairs', shape) : await this.db.collection<PairMeta>('pairs')
    this.wording = this.created ? await this.db.createCollection<PairMeta>('wording', shape) : await this.db.collection<PairMeta>('wording')
  }

  pendingCount(): number {
    return this.pending.size + this.gone.size
  }

  async flush(): Promise<VoiceStageReport> {
    const held = this.load()
    const embedded = this.embedded
    const created = this.created
    if (!embedded && !this.gone.size) {
      await this.close()
      return { pairs: held.length, paired: 0, embedded: 0, profiles: Object.keys(readProfiles(this.dir)).length, created, ms: performance.now() - this.started }
    }
    const kept = held.filter((p) => !this.gone.has(p.id))
    const byId = new Map(kept.map((p) => [p.id, p]))
    for (const [id, pair] of this.pending) byId.set(id, pair)
    const pairs = [...byId.values()].sort((a, b) => a.platform.localeCompare(b.platform) || a.account.localeCompare(b.account) || a.conversationId.localeCompare(b.conversationId) || String(a.at ?? '').localeCompare(String(b.at ?? '')))
    await this.close()
    const profiles: Record<string, VoiceProfile> = profilesOf(pairs)
    mkdirSync(this.dir, { recursive: true })
    writeFileSync(join(this.dir, 'pairs.json'), JSON.stringify(pairs))
    writeFileSync(join(this.dir, 'profiles.json'), JSON.stringify(profiles))
    writePhraseIndex(buildPhraseIndex(pairs.filter((p) => p.reply.trim()).map((p) => p.reply)), this.dir)
    const newest = pairs.reduce((latest, p) => (String(p.at ?? '') > latest ? String(p.at ?? '') : latest), '')
    writeFileSync(join(this.dir, 'model.json'), JSON.stringify({ model: this.embedder.model, dimensions: this.embedder.dimensions, builtAt: newest || new Date().toISOString() }))
    const keyword = new BM25()
    keyword.index(tokenize(pairs.map(situationOf)))
    await keyword.save(join(this.dir, 'bm25'))
    this.pending.clear()
    this.gone.clear()
    this.embedded = 0
    this.created = false
    this.held = pairs
    return { pairs: pairs.length, paired: Object.keys(profiles).length ? profiles.everyone?.replies ?? 0 : 0, embedded, profiles: Object.keys(profiles).length, created, ms: performance.now() - this.started }
  }

  async close(): Promise<void> {
    const db = this.db
    this.db = null
    this.vectors = null
    this.wording = null
    if (db) await db.close()
  }
}

export async function updateVoiceFor(conversations: readonly Conversation[], embedder: Embedder, dir = voiceDir()): Promise<VoiceStageReport> {
  const stage = new VoiceStage(embedder, dir)
  try {
    await stage.add(conversations)
    return await stage.flush()
  } finally {
    await stage.close()
  }
}
