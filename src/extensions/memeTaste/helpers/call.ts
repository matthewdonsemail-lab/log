import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import type { ModelCall, TasteRating } from '../types'
import { captionLines, skipLines } from './learn'
import type { TasteLines } from './learn'
import { jsonIn } from './llm'
import type { ChatMessage, Llm } from './llm'
import type { LabelledMeme, Situation } from './situation'

export const CALL_SYSTEM = 'You answer X posts as matt, with one meme and his caption, or you skip posts he would not answer. Answer with JSON only.'

export function callPrompt(situation: Situation, memes: readonly Pick<LabelledMeme, 'id' | 'name' | 'fitsWhen'>[], taste: TasteLines = { picked: [], passed: [] }): string {
  return [
    typeof taste.skipRate === 'number' ? `matt skips about ${Math.round(taste.skipRate * 100)}% of the posts he is shown. Skipping is a normal answer, not a failure: most posts are not worth a reply.` : '',
    taste.skips?.length ? 'Posts matt skipped (he would not answer these):\n' + skipLines(taste.skips) : '',
    taste.captions?.length ? 'How matt has answered posts before (the meme he sent and his own caption):\n' + captionLines(taste.captions) : '',
    taste.picked.length ? 'Memes he has picked: ' + JSON.stringify(taste.picked) : '',
    taste.passed.length ? 'Memes he keeps passing over: ' + JSON.stringify(taste.passed) : '',
    'The thread: ' + JSON.stringify(situation.thread.map((p) => ({ handle: p.handle, text: p.text }))),
    'The context: ' + situation.moment,
    'The memes you can send: ' + JSON.stringify(memes.map((m) => ({ id: m.id, name: m.name, fitsWhen: m.fitsWhen }))),
    'Two questions. First: would matt reply to this post at all? Compare it with the posts he skipped and the ones he answered, and give wouldReply, the chance from 0 to 1 that he replies. Second: if he did reply, which one of these memes would he send, with a caption in his own voice (lowercase, short, like his captions above), and memeConfidence, the chance from 0 to 1 that it is that exact meme. Be honest: with many memes that could work, memeConfidence is low.',
    'JSON: {"wouldReply":0.0,"id":"<meme id>","caption":"…","memeConfidence":0.0}',
  ].filter(Boolean).join('\n\n')
}

export const REPLY_SYSTEM = 'You sort X posts into the ones matt answers and the ones he skips, from his own past choices. Answer with JSON only.'

export function replyPrompt(situation: Situation, taste: TasteLines = { picked: [], passed: [] }): string {
  const answered = (taste.captions ?? []).map((c) => `- ANSWERED: ${JSON.stringify(c.post)} (context: ${c.context})`)
  const skipped = (taste.skips ?? []).map((s) => `- SKIPPED: ${JSON.stringify(s.post)} (context: ${s.context})`)
  const examples: string[] = []
  for (let i = 0; i < Math.max(answered.length, skipped.length); i++) examples.push(...[answered[i], skipped[i]].filter((x): x is string => !!x))
  return [
    typeof taste.skipRate === 'number' ? `matt answers about ${Math.round((1 - taste.skipRate) * 100)}% of posts and skips the other ${Math.round(taste.skipRate * 100)}%.` : '',
    examples.length ? 'His past choices:\n' + examples.join('\n') : '',
    'The new post: ' + JSON.stringify(situation.thread.at(-1)?.text ?? '') + (situation.thread.length > 1 ? ' (a reply in a thread: ' + JSON.stringify(situation.thread.slice(0, -1).map((p) => p.text)) + ')' : ''),
    'The context: ' + situation.moment,
    'Is this new post more like the ones he ANSWERED or the ones he SKIPPED? Look at what the skipped ones share (what kind of post, what it is about, its tone) and what the answered ones share, and judge this one against both. Give the chance from 0 to 1 that he answers it.',
    'JSON: {"reason":"<one short line>","answer":0.0}',
  ].filter(Boolean).join('\n\n')
}

export async function wouldReplyTo(llm: Llm, situation: Situation, taste: TasteLines = { picked: [], passed: [] }): Promise<number | null> {
  const text = await llm([{ role: 'system', content: REPLY_SYSTEM }, { role: 'user', content: replyPrompt(situation, taste) }], { temperature: 0.1, maxTokens: 200 })
  const parsed = jsonIn(text) as { answer?: number } | null
  return typeof parsed?.answer === 'number' ? Math.min(1, Math.max(0, parsed.answer)) : null
}

export async function makeCall(llm: Llm, situation: Situation, memes: readonly LabelledMeme[], taste: TasteLines = { picked: [], passed: [] }): Promise<ModelCall | null> {
  if (!memes.length) return null
  const [text, decided] = await Promise.all([
    llm([{ role: 'system', content: CALL_SYSTEM }, { role: 'user', content: callPrompt(situation, memes, taste) }], { temperature: 0.2, maxTokens: 400 }),
    wouldReplyTo(llm, situation, taste).catch(() => null),
  ])
  const parsed = jsonIn(text) as { wouldReply?: number; id?: string; caption?: string; memeConfidence?: number } | null
  const unit = (n: unknown) => (typeof n === 'number' ? Math.min(1, Math.max(0, n)) : 0)
  if (decided === null && typeof parsed?.wouldReply !== 'number') return null
  const wouldReply = decided ?? unit(parsed?.wouldReply)
  if (!parsed) return { action: 'skip', templateId: '', name: '', caption: '', confidence: 1 - wouldReply, odds: { wouldReply, meme: 0 } }
  const meme = memes.find((m) => m.id === parsed.id)
  const odds = { wouldReply, meme: unit(parsed.memeConfidence) }
  if (wouldReply < 0.5 || !meme) return { action: 'skip', templateId: '', name: '', caption: '', confidence: 1 - wouldReply, odds }
  return { action: 'reply', templateId: meme.id, name: meme.name, caption: String(parsed.caption ?? ''), confidence: wouldReply * odds.meme, odds }
}

export function callMatched(call: ModelCall, rating: Pick<TasteRating, 'skipped' | 'good' | 'templateId' | 'name'>): boolean {
  if (call.action === 'skip') return !!rating.skipped
  if (rating.skipped || !rating.good) return false
  return call.templateId === rating.templateId || call.name.toLowerCase() === rating.name.toLowerCase()
}

export interface CalibrationBand {
  from: number
  to: number
  right: number
  calls: number
}

export interface Gate {
  calls: number
  right: number
  bands: CalibrationBand[]
  threshold: number | null
  above: { right: number; calls: number }
  needed: { accuracy: number; calls: number }
}

export const GATE_ACCURACY = 0.9
export const GATE_MIN_CALLS = 10
const BAND_EDGES = [0, 0.5, 0.7, 0.8, 0.9, 1.0001]

export function gateFrom(ratings: readonly TasteRating[], accuracy = GATE_ACCURACY, minCalls = GATE_MIN_CALLS): Gate {
  const judged = ratings.filter((r): r is TasteRating & { call: ModelCall; callMatched: boolean } => !!r.call && typeof r.callMatched === 'boolean')
  const bands = BAND_EDGES.slice(0, -1).map((from, i) => {
    const to = BAND_EDGES[i + 1]!
    const inside = judged.filter((r) => r.call.confidence >= from && r.call.confidence < to)
    return { from, to: Math.min(1, to), right: inside.filter((r) => r.callMatched).length, calls: inside.length }
  })
  let threshold: number | null = null
  let above = { right: 0, calls: 0 }
  const levels = [...new Set(judged.map((r) => r.call.confidence))].sort((a, b) => a - b)
  for (const level of levels) {
    const over = judged.filter((r) => r.call.confidence >= level)
    const right = over.filter((r) => r.callMatched).length
    if (over.length >= minCalls && right / over.length >= accuracy) {
      threshold = level
      above = { right, calls: over.length }
      break
    }
  }
  return { calls: judged.length, right: judged.filter((r) => r.callMatched).length, bands, threshold, above, needed: { accuracy, calls: minCalls } }
}

export function trainingExample(rating: TasteRating): { messages: ChatMessage[] } | null {
  if (!rating.skipped && !(rating.good && rating.name)) return null
  const memes = (rating.shown ?? []).map((name) => ({ id: name, name, fitsWhen: '' }))
  if (rating.good && !memes.some((m) => m.name === rating.name)) memes.push({ id: rating.name, name: rating.name, fitsWhen: rating.fitsWhen ?? '' })
  const situation = { thread: (rating.thread ?? []).map((p) => ({ ...p, name: p.handle })), replyingTo: rating.person?.handle ?? '', moment: rating.word, searches: [] }
  const answer = rating.skipped ? { wouldReply: 0 } : { wouldReply: 1, id: rating.name, caption: rating.reply ?? '', memeConfidence: 1, ...(rating.fromSearch && rating.searched ? { searched: rating.searched } : {}) }
  return { messages: [{ role: 'system', content: CALL_SYSTEM }, { role: 'user', content: callPrompt(situation, memes) }, { role: 'assistant', content: JSON.stringify(answer) }] }
}

export function writeTrainingData(ratings: readonly TasteRating[], path: string): number {
  const lines = ratings.flatMap((r) => {
    const example = trainingExample(r)
    return example ? [JSON.stringify(example)] : []
  })
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, lines.length ? lines.join('\n') + '\n' : '')
  return lines.length
}
