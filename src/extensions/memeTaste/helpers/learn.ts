import type { MemeTemplate } from '../../memelord/index'
import type { TasteIndex, TasteRating } from '../types'
import type { LabelledMeme } from './situation'

export interface MemeLean {
  name: string
  picked: number
  passed: number
}

export function memeLeans(ratings: readonly TasteRating[]): Map<string, MemeLean> {
  const leans = new Map<string, MemeLean>()
  const lean = (name: string) => {
    const key = name.toLowerCase()
    const found = leans.get(key) ?? { name, picked: 0, passed: 0 }
    leans.set(key, found)
    return found
  }
  for (const r of ratings) {
    if (r.skipped) continue
    if (r.good && r.name) lean(r.name).picked++
    for (const shown of r.shown ?? []) if (!r.good || shown.toLowerCase() !== r.name.toLowerCase()) lean(shown).passed++
  }
  return leans
}

export function passedOver(lean: MemeLean | undefined): boolean {
  return !!lean && lean.passed >= 2 && lean.picked === 0
}

export function learnedScore(meme: LabelledMeme, lean: MemeLean | undefined): number {
  if (!lean) return meme.fit
  return meme.fit + 0.35 * lean.picked - 0.2 * lean.passed
}

export function rankLearned(memes: readonly LabelledMeme[], ratings: readonly TasteRating[], max = 9): LabelledMeme[] {
  const leans = memeLeans(ratings)
  const kept = memes.filter((m) => !passedOver(leans.get(m.name.toLowerCase())))
  return kept
    .map((m) => ({ m, score: learnedScore(m, leans.get(m.name.toLowerCase())) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((x) => x.m)
}

export interface CaptionedReply {
  post: string
  context: string
  meme: string
  searched: string | null
  caption: string
}

export interface TasteLines {
  picked: string[]
  passed: string[]
  captions?: CaptionedReply[]
  skips?: SkippedPost[]
  skipRate?: number
}

export interface SkippedPost {
  post: string
  context: string
  role: string
}

export function skipsOf(ratings: readonly TasteRating[], max = 15): SkippedPost[] {
  return ratings
    .filter((r) => r.skipped)
    .slice(-max)
    .map((r) => ({ post: (r.thread?.at(-1)?.text ?? r.word).slice(0, 200), context: r.word, role: r.person?.role || 'unknown' }))
}

export function skipRateOf(ratings: readonly TasteRating[], recent = 40): number {
  const answered = ratings.filter((r) => r.skipped || r.good).slice(-recent)
  return answered.length ? answered.filter((r) => r.skipped).length / answered.length : 0
}

export function skipLines(skips: readonly SkippedPost[] = []): string {
  return skips.map((s) => `- ${s.role.replace(/_/g, ' ')}: ${JSON.stringify(s.post)} (context: ${s.context})`).join('\n')
}

export function captionsOf(ratings: readonly TasteRating[], max = 20): CaptionedReply[] {
  const captioned = ratings.filter((r) => !r.skipped && r.good && r.name && r.reply?.trim())
  const byRole = new Map<string, TasteRating[]>()
  for (const r of [...captioned].reverse()) {
    const role = r.person?.role || 'unknown'
    byRole.set(role, [...(byRole.get(role) ?? []), r])
  }
  const chosen = new Set<TasteRating>()
  const lanes = [...byRole.values()]
  for (let i = 0; chosen.size < Math.min(max, captioned.length); i++) for (const lane of lanes) if (lane[i] && chosen.size < max) chosen.add(lane[i]!)
  return captioned
    .filter((r) => chosen.has(r))
    .map((r) => ({ post: (r.thread?.at(-1)?.text ?? r.word).slice(0, 200), context: r.word, meme: r.name, searched: r.fromSearch && r.searched ? r.searched : null, caption: r.reply!.trim() }))
}

export function captionLines(captions: readonly CaptionedReply[] = []): string {
  return captions.map((c) => `- the post ${JSON.stringify(c.post)} (context: ${c.context}): ${c.searched ? `none of the suggestions fit, so he searched ${JSON.stringify(c.searched)} and sent` : 'he sent'} the meme "${c.meme}" captioned ${JSON.stringify(c.caption)}`).join('\n')
}

export function tasteLines(ratings: readonly TasteRating[]): TasteLines {
  const leans = [...memeLeans(ratings).values()]
  return {
    picked: leans.filter((l) => l.picked).sort((a, b) => b.picked - a.picked).slice(0, 15).map((l) => l.name),
    passed: leans.filter((l) => passedOver(l)).sort((a, b) => b.passed - a.passed).slice(0, 25).map((l) => l.name),
    captions: captionsOf(ratings),
    skips: skipsOf(ratings),
    skipRate: skipRateOf(ratings),
  }
}

export interface LearnedPoint {
  label: string
}

export function learnedFrom(rating: TasteRating): LearnedPoint[] {
  const role = rating.person?.role?.replace(/_/g, ' ')
  if (rating.skipped) return role ? [{ label: `+1 skip ${role}` }] : [{ label: '+1 skip' }]
  const out: LearnedPoint[] = []
  if (role) out.push({ label: `+1 ${role}` })
  if (rating.good && rating.name) out.push({ label: `+1 ${rating.name}` })
  if (rating.fromSearch && rating.searched) out.push({ label: '+1 your search' })
  if (rating.good && rating.reply?.trim()) out.push({ label: '+1 caption' })
  return out
}

export const MINE = 'mine:'

type OwnMeme = NonNullable<TasteIndex>['memes'][number]

export function saidWith(m: Pick<OwnMeme, 'text'>): string {
  return m.text.replace(/^(@\w+\s*)+/, '').replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim()
}

export function mineName(m: Pick<OwnMeme, 'id' | 'text' | 'kind' | 'style' | 'at'>): string {
  const said = saidWith(m)
  if (said) return `yours: ${said.slice(0, 48)}`
  const when = m.at ? new Date(m.at) : null
  const day = when && !Number.isNaN(when.getTime()) ? ` from ${when.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}` : ''
  const style = m.style && m.style !== 'other' ? `${m.style.replace(/([A-Z])/g, ' $1').toLowerCase()} ` : ''
  return `yours: ${style}${m.kind}${day} #${m.id.split(':')[0]!.slice(-4)}`
}

export function theirMemes(index: TasteIndex | null, recent: ReadonlySet<string>, count: number, random: () => number = Math.random): MemeTemplate[] {
  const pool = (index?.memes ?? []).filter((m) => !recent.has(MINE + m.id))
  const picked: MemeTemplate[] = []
  while (picked.length < count && pool.length) {
    const m = pool.splice(Math.floor(random() * pool.length), 1)[0]!
    const said = saidWith(m)
    picked.push({ id: MINE + m.id, name: mineName(m), type: m.kind === 'photo' ? 'image' : m.kind, mediaUrl: m.mediaUrl ?? m.imageUrl, textSlots: null, context: null, raw: { preview_url: m.imageUrl, description: `a ${m.kind} meme matt sent himself on X (${m.style}), with the post: ${said}` } })
  }
  return picked
}

export function shownCounts(ratings: readonly TasteRating[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const r of ratings) for (const name of r.shown ?? []) counts.set(name.toLowerCase(), (counts.get(name.toLowerCase()) ?? 0) + 1)
  return counts
}

export function mixed(memes: readonly LabelledMeme[], shown: ReadonlyMap<string, number>, max: number): LabelledMeme[] {
  return memes
    .map((m, i) => ({ m, score: -i * 0.02 - 0.12 * (m.id.startsWith(MINE) ? 0 : shown.get(m.name.toLowerCase()) ?? 0) + (m.id.startsWith(MINE) ? 0.15 : 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((x) => x.m)
}
