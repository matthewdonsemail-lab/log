import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DecisionsClient } from '../../../subq/decisions/index'
import { CONTEXT_PASS, MATT_DMS, NEVER_SAYS, VOICE_MODEL, VOICE_PASS } from './types'
import type { VoiceDraft, VoiceReading } from './types'

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

export async function readVoice(draft: VoiceDraft, guide: string, decide: DecisionsClient): Promise<VoiceReading> {
  const neverSays = neverSaysIn(draft.text)
  const response = await decide({
    model: VOICE_MODEL,
    state: draft.evidence
      ? { thisChat: draft.evidence.chat, howMattWritesInThisChat: draft.evidence.profile, mattsRealRepliesHere: draft.evidence.replies, mattsClosestRealWording: draft.evidence.wording ?? [], mattsLatestMessagesHere: draft.evidence.recent ?? [], phrasesMattNeverSays: NEVER_SAYS, recipient: draft.to, whatTheySaid: draft.context ?? null, dm: draft.text }
      : { howMattWrites: guide, dmsMattWroteHimself: MATT_DMS, phrasesMattNeverSays: NEVER_SAYS, recipient: draft.to, whatTheySaid: draft.context ?? null, dm: draft.text },
    questions: {
      voice: { type: 'noul', instructions: draft.evidence ? 'Going only by matt\'s own messages here (mattsRealRepliesHere, mattsClosestRealWording, mattsLatestMessagesHere), would someone who knows him in this chat believe matt typed this himself: his words and phrasing, his slang, his length, nothing he never writes, nothing that reads polished or written for him?' : 'Going by howMattWrites and dmsMattWroteHimself, does this dm sound like matt typed it himself: his words, plain about what he does, no clever phrasing, no praise-then-question, no yap?', criteria: { true: 'It sounds like matt typed it', false: 'It sounds like ai or a copywriter wrote it for him' } },
      inContext: { type: 'noul', instructions: 'Does the dm answer what they actually said or asked (whatTheySaid)? With nothing given, does it pick up on something specific about them?', criteria: { true: 'It answers them specifically', false: 'It is generic and could go to anyone' } },
      openerOnly: { type: 'noul', instructions: 'If matt has never talked with them (nothing of theirs in whatTheySaid, or it says they have never chatted), is this first dm only an opener about something relevant to them (their post, their work, how they are connected to matt), with no ask: no pitch, no question about a tool, product or service of matt\'s (treg, log, his consulting), no call, no link to his own stuff? If they have already talked, answer true.', criteria: { true: 'It is only a relevant opener, or they have already talked', false: 'A first message that goes in with an ask or a pitch' } },
      friendLike: { type: 'noul', instructions: 'Does this dm read like matt messaging someone he is friendly with: casual, natural and human, not a sales template or a bot?', criteria: { true: 'It reads like a mate texting', false: 'It reads like a template, a pitch or a bot' } },
      ...(draft.evidence ? { toThem: { type: 'noul', instructions: 'Going by mattsRealRepliesHere (what they said and how matt really replied, the same chat first) and howMattWritesInThisChat (counted from his own messages there), does this dm read like matt writing to them in this chat: the same length, case, punctuation, words and register he uses here?', criteria: { true: 'It reads like his real replies here', false: 'It reads like how he writes somewhere else, or like nobody' } } } : {}),
    },
  })
  const answers = response.answers as Record<string, { noul?: number }>
  const voice = answers.voice?.noul ?? 0
  const inContext = answers.inContext?.noul ?? 0
  const friendLike = answers.friendLike?.noul ?? 0
  const openerOnly = answers.openerOnly?.noul ?? 0
  const toThem = draft.evidence ? answers.toThem?.noul ?? 0 : null
  return { to: draft.to, voice, inContext, friendLike, openerOnly, toThem, neverSays, pass: !neverSays.length && voice >= VOICE_PASS && inContext >= CONTEXT_PASS && friendLike >= CONTEXT_PASS && openerOnly >= CONTEXT_PASS && (toThem === null || toThem >= CONTEXT_PASS), model: response.model ?? null }
}
