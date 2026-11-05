import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DecisionsClient } from '../../../subq/decisions/index'
import { CONTEXT_PASS, MATT_DMS, NEVER_SAYS, VOICE_MODEL, VOICE_PASS } from './types'
import type { VoiceDraft, VoiceReading } from './types'
import { watermarkReadingOf } from '../watermark/index'

export function guidePath(env: Record<string, string | undefined> = process.env): string {
  if (env.LOG_VOICE_GUIDE) return env.LOG_VOICE_GUIDE
  const repo = resolve(fileURLToPath(new URL('../../../..', import.meta.url)))
  return join(repo, '..', '..', 'GUIDES', 'MATT_WRITING_STYLE.md')
}

export function readGuide(path = guidePath()): string | null {
  return existsSync(path) ? readFileSync(path, 'utf8') : null
}

export function neverSaysIn(text: string): string[] {
  const lower = text.toLowerCase()
  return NEVER_SAYS.filter((p) => lower.includes(p))
}

export function alreadyTalkedIn(draft: Pick<VoiceDraft, 'evidence' | 'conversation'>): boolean {
  if ((draft.evidence?.recent?.length ?? 0) > 0) return true
  if ((draft.conversation ?? []).some((m) => m.from === 'matt')) return true
  return (draft.evidence?.replies ?? []).some((r) => r.tier === 'sameChat' || r.tier === 'samePerson')
}

export async function readVoice(draft: VoiceDraft, guide: string, decide: DecisionsClient): Promise<VoiceReading> {
  const neverSays = neverSaysIn(draft.text)
  const alreadyTalked = alreadyTalkedIn(draft)
  const response = await decide({
    model: VOICE_MODEL,
    state: {
      howMattWrites: guide,
      dmsMattWroteHimself: MATT_DMS,
      ...(draft.everywhere ? { howMattWritesEverywhere: draft.everywhere.profile, mattsRealRepliesEverywhere: draft.everywhere.replies, mattsClosestWordingEverywhere: draft.everywhere.wording ?? [] } : {}),
      ...(draft.evidence ? { thisChat: draft.evidence.chat, howMattWritesInThisChat: draft.evidence.profile, mattsRealRepliesHere: draft.evidence.replies, mattsClosestRealWording: draft.evidence.wording ?? [], mattsLatestMessagesHere: draft.evidence.recent ?? [] } : {}),
      phrasesMattNeverSays: NEVER_SAYS,
      ...(draft.phrasesNewToMatt ? { wordPairsMattHasNeverWritten: draft.phrasesNewToMatt } : {}),
      ...(draft.scrambler ? { watermarkScramblerLayerA: draft.scrambler } : {}),
      recipient: draft.to,
      alreadyTalkedInThisChat: alreadyTalked,
      whatTheySaid: draft.context ?? null,
      ...(draft.conversation ? { thisConversationRankedForThisMoment: draft.conversation } : {}),
      dm: draft.text,
    },
    questions: {
      voice: draft.spoken ? { type: 'noul', instructions: 'This is a voice note matt sends, said out loud in his own voice, not a typed message, so it runs longer than his texts and its length and punctuation never count against it. Going by matt\'s own messages across all his conversations (mattsRealRepliesEverywhere, mattsClosestWordingEverywhere, howMattWritesEverywhere), and in this chat when there is one (mattsRealRepliesHere, mattsClosestRealWording, mattsLatestMessagesHere), with howMattWrites and dmsMattWroteHimself behind them, would someone who knows him believe matt said this himself: his words and phrasing, his slang, the way he talks, nothing he never says, nothing that reads polished or written for him?', criteria: { true: 'It sounds like matt saying it', false: 'It sounds like ai or a copywriter wrote it for him' } } : { type: 'noul', instructions: 'Going by matt\'s own messages across all his conversations (mattsRealRepliesEverywhere, mattsClosestWordingEverywhere, howMattWritesEverywhere), and in this chat when there is one (mattsRealRepliesHere, mattsClosestRealWording, mattsLatestMessagesHere), with howMattWrites and dmsMattWroteHimself behind them, would someone who knows him believe matt typed this himself: his words and phrasing, his slang, his length, nothing he never writes, nothing that reads polished or written for him?', criteria: { true: 'It sounds like matt typed it', false: 'It sounds like ai or a copywriter wrote it for him' } },
      inContext: { type: 'noul', instructions: 'Does the dm answer what they actually said or asked (whatTheySaid), read in this conversation (thisConversationRankedForThisMoment, the moments of this chat that matter most to what is being answered, media described in brackets), including anything they sent that it should have answered? With nothing given, does it pick up on something specific about them?', criteria: { true: 'It answers them specifically', false: 'It is generic and could go to anyone' } },
      openerOnly: { type: 'noul', instructions: 'If matt has never talked with them (alreadyTalkedInThisChat is false and nothing of theirs is in whatTheySaid, or it says they have never chatted), is this first dm only an opener about something relevant to them (their post, their work, how they are connected to matt), with no ask: no pitch, no question about a tool, product or service of matt\'s (treg, log, his consulting), no call, no link to his own stuff? If they have already talked, answer true.', criteria: { true: 'It is only a relevant opener, or they have already talked', false: 'A first message that goes in with an ask or a pitch' } },
      friendLike: { type: 'noul', instructions: 'Does this dm read like matt messaging someone he is friendly with: casual, natural and human, not a sales template or a bot?', criteria: { true: 'It reads like a mate texting', false: 'It reads like a template, a pitch or a bot' } },
      ...(draft.spoken ? { buildsOn: { type: 'noul', instructions: 'Read the whole conversation (thisChat, mattsLatestMessagesHere, thisConversationRankedForThisMoment and whatTheySaid). Does this voice note build on what they are talking about, taking their points further and adding something new to them, rather than repeating or re-explaining what matt has already told them in this chat?', criteria: { true: 'It builds on what they said and adds to it', false: 'It repeats what matt already said or ignores what they are talking about' } } } : {}),
      ...(draft.evidence ? { toThem: draft.spoken ? { type: 'noul', instructions: 'Going by mattsRealRepliesHere and howMattWritesInThisChat, does this voice note sound like matt talking to them in this chat: his words, slang and register here? It is spoken, so its length and punctuation never count against it.', criteria: { true: 'It sounds like him talking to them here', false: 'It sounds like how he talks somewhere else, or like nobody' } } : { type: 'noul', instructions: 'Going by mattsRealRepliesHere (what they said and how matt really replied, the same chat first) and howMattWritesInThisChat (counted from his own messages there), does this dm read like matt writing to them in this chat: the same length, case, punctuation, words and register he uses here?', criteria: { true: 'It reads like his real replies here', false: 'It reads like how he writes somewhere else, or like nobody' } } } : {}),
    },
  })
  const answers = response.answers as Record<string, { noul?: number }>
  const voice = answers.voice?.noul ?? 0
  const inContext = answers.inContext?.noul ?? 0
  const friendLike = answers.friendLike?.noul ?? 0
  const openerOnly = alreadyTalked ? 1 : answers.openerOnly?.noul ?? 0
  const toThem = draft.evidence ? answers.toThem?.noul ?? 0 : null
  const buildsOn = draft.spoken ? answers.buildsOn?.noul ?? 0 : null
  const watermark = watermarkReadingOf(draft.text)
  return { to: draft.to, voice, inContext, friendLike, openerOnly, toThem, buildsOn, neverSays, watermark, pass: !neverSays.length && watermark.level !== 'artifacts' && voice >= VOICE_PASS && inContext >= CONTEXT_PASS && friendLike >= CONTEXT_PASS && openerOnly >= CONTEXT_PASS && (toThem === null || toThem >= CONTEXT_PASS) && (buildsOn === null || buildsOn >= CONTEXT_PASS), model: response.model ?? null }
}
