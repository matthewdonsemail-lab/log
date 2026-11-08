import { homedir } from 'node:os'
import { join } from 'node:path'
import { getState, putState } from '../../storage/state/index'
import type { DecisionImage, DecisionsClient } from '../../subq/decisions/index'
import { MEME_AT, TASTE_OTHER, TASTE_STYLES } from './types'
import type { TasteCandidate, TasteFit, TasteIndex, TasteMeme, TasteRating, TasteStyle } from './types'

export function tastePath(env: Record<string, string | undefined> = process.env): string {
  return env.LOG_MEME_TASTE || join(homedir(), '.logCli', 'memes', 'taste.json')
}

export function readTaste(path = tastePath()): TasteIndex | null {
  return getState<TasteIndex>('memeTaste', path, { legacyFile: path })?.body ?? null
}

export function writeTaste(index: TasteIndex, path = tastePath()): void {
  putState('memeTaste', path, index)
}

interface XMediaItem {
  media_url_https?: string
  variants?: { content_type?: string; url?: string; bitrate?: number }[]
}

interface XPost {
  tweet_id?: string
  created_at?: string
  text?: string
  author?: { screen_name?: string }
  media?: { photo?: XMediaItem[]; video?: XMediaItem[]; animated_gif?: XMediaItem[] }
}

export function candidatesFromXPosts(posts: readonly XPost[]): TasteCandidate[] {
  const out: TasteCandidate[] = []
  for (const post of posts) {
    const id = String(post.tweet_id ?? '')
    if (!id || !post.media) continue
    const handle = post.author?.screen_name ?? 'i'
    const pick = (items: XMediaItem[] | undefined, kind: TasteCandidate['kind']) => {
      for (const item of items ?? []) {
        if (!item.media_url_https) continue
        const mp4 = (item.variants ?? []).filter((v) => v.content_type === 'video/mp4' && v.url).sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0]?.url ?? null
        out.push({ id: `${id}:${out.length}`, source: 'x', url: `https://x.com/${handle}/status/${id}`, text: (post.text ?? '').replace(/https:\/\/t\.co\/\S+/g, '').trim(), at: post.created_at ?? null, imageUrl: item.media_url_https, mediaUrl: kind === 'photo' ? item.media_url_https : mp4, kind: kind === 'video' && /tweet_video/.test(item.media_url_https) ? 'gif' : kind })
        return
      }
    }
    pick(post.media.photo, 'photo')
    pick(post.media.video, 'video')
    pick(post.media.animated_gif, 'gif')
  }
  return out
}

export async function imageOf(url: string, fetcher: typeof fetch = fetch): Promise<DecisionImage | null> {
  const answer = await fetcher(url).catch(() => null)
  if (!answer?.ok) return null
  const type = (answer.headers.get('content-type') ?? '').split(';')[0]!.trim()
  const mediaType = type === 'image/png' || type === 'image/webp' ? type : type === 'image/jpeg' || type === 'image/jpg' ? 'image/jpeg' : /\.png(\?|$)/.test(url) ? 'image/png' : /\.webp(\?|$)/.test(url) ? 'image/webp' : 'image/jpeg'
  const bytes = Buffer.from(await answer.arrayBuffer())
  if (!bytes.length || bytes.length > 4 * 1024 * 1024) return null
  return { mediaType, base64: bytes.toString('base64') }
}

const styleCriteria = (): Record<string, string | null> => ({ ...TASTE_STYLES, [TASTE_OTHER]: 'None of these: a meme of some other kind' })

export async function readCandidate(decide: DecisionsClient, candidate: TasteCandidate, image: DecisionImage): Promise<TasteMeme> {
  const response = await decide({
    state: { postText: candidate.text, kind: candidate.kind },
    images: [image],
    questions: {
      meme: { type: 'noul', instructions: 'Is the attached picture a meme or a reaction (a joke image, a reaction face or clip, a shitpost), rather than a screenshot of a product, a demo, a chart, a code editor or a photo shared as news?', criteria: { true: 'A meme or a reaction', false: 'A screenshot, demo, chart or plain photo' } },
      style: { type: 'choice', instructions: 'Which kind of meme is the attached picture?', criteria: styleCriteria() },
    },
  })
  const answers = response.answers as Record<string, { noul?: number; choice?: string; confidence?: number }>
  return { ...candidate, meme: answers.meme?.noul ?? 0, style: (answers.style?.choice ?? TASTE_OTHER) as TasteMeme['style'], styleConfidence: answers.style?.confidence ?? 0 }
}

export async function buildTaste(candidates: readonly TasteCandidate[], decide: DecisionsClient, from: string, opts: { fetcher?: typeof fetch; progress?: (line: string) => void } = {}): Promise<TasteIndex> {
  const memes: TasteMeme[] = []
  let read = 0
  for (const [i, candidate] of candidates.entries()) {
    const image = await imageOf(candidate.imageUrl, opts.fetcher)
    if (!image) continue
    const reading = await readCandidate(decide, candidate, image)
    read++
    if (reading.meme >= MEME_AT) memes.push(reading)
    opts.progress?.(`taste ${i + 1}/${candidates.length}: ${reading.meme >= MEME_AT ? `meme, ${reading.style}` : 'not a meme'} (${candidate.url})`)
  }
  return { builtAt: new Date().toISOString(), from, read, memes }
}

export function tasteCounts(index: TasteIndex): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const meme of index.memes) counts[meme.style] = (counts[meme.style] ?? 0) + 1
  return counts
}

export function tasteSummary(index: TasteIndex | null): string {
  const named = Object.entries(TASTE_STYLES).map(([k, v]) => `${k}: ${v.split(': ').slice(1).join(': ')}`).join('; ')
  if (!index) return `matt's meme taste: ${named}. No index of the memes he has sent yet (log memelord taste --build).`
  const counts = Object.entries(tasteCounts(index)).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(', ')
  const lines = index.memes.map((m) => m.text.replace(/^(@\w+\s*)+/, '').replace(/\s+/g, ' ').trim()).filter(Boolean)
  const said = lines.slice(0, 6).map((l) => `"${l.slice(0, 60)}"`).join(', ')
  return `matt's meme taste: ${named}. Of the ${index.memes.length} memes he has sent (${counts})${said ? `, with lines like ${said}` : ''}.`
}

export async function tasteFit(decide: DecisionsClient, index: TasteIndex | null, template: { name: string; description: string }, image: DecisionImage, ratings: readonly TasteRating[] = []): Promise<TasteFit> {
  const rated = ratings.filter((r) => r.name).slice(-80)
  const response = await decide({
    state: { mattsTaste: tasteSummary(index), styles: TASTE_STYLES, examplesHeSent: (index?.memes ?? []).slice(0, 25).map((m) => ({ style: m.style, line: m.text.slice(0, 120) })), memesHePicked: rated.filter((r) => r.good).map((r) => `${r.name} (for: ${r.word})`), memesHePassedOn: rated.filter((r) => !r.good).flatMap((r) => (r.shown?.length ? r.shown : r.name ? [r.name] : []).map((n) => `${n} (for: ${r.word})`)).slice(-60), whatHeWouldSendInstead: rated.filter((r) => r.other).map((r) => `${r.other} (for: ${r.word})`), candidate: template },
    images: [image],
    questions: {
      fit: { type: 'noul', instructions: 'Going by mattsTaste, the styles, the examples he has sent and the memes he picked, passed on or would send instead, is the attached meme his kind of meme, one he would send himself?', criteria: { true: 'His kind: deep fried, larping, a streamer reacting or a shitpost, like what he sends', false: 'A clean, mainstream or corporate meme he would not send' } },
      style: { type: 'choice', instructions: 'Which kind of meme is the attached picture?', criteria: styleCriteria() },
    },
  })
  const answers = response.answers as Record<string, { noul?: number; choice?: string; confidence?: number }>
  return { fit: answers.fit?.noul ?? 0, style: (answers.style?.choice ?? TASTE_OTHER) as TasteStyle, styleConfidence: answers.style?.confidence ?? 0 }
}
