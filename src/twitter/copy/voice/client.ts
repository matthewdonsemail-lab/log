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

export function messagesOf(text: string): string[] {
  return text.split('\n').map((line) => line.trim()).filter(Boolean)
}

export function burstOf(text: string): { messages: string[]; words: number[] } {
  const messages = messagesOf(text)
  return { messages, words: messages.map((m) => (m.match(/[\p{L}\p{N}']+/gu) ?? []).length) }
}

export function outsideXVoice(draft: Pick<VoiceDraft, 'evidence'>): { where: string } | null {
  const platform = draft.evidence?.platform
  if (!platform || platform === 'twitter') return null
  return { where: `${platform} ${draft.evidence?.kind ?? 'chat'}` }
}

export function alreadyTalkedIn(draft: Pick<VoiceDraft, 'evidence' | 'conversation'>): boolean {
  if ((draft.evidence?.recent?.length ?? 0) > 0) return true
  if ((draft.conversation ?? []).some((m) => m.from === 'matt')) return true
  return (draft.evidence?.replies ?? []).some((r) => r.tier === 'sameChat' || r.tier === 'samePerson')
}

export function nobodyToAnswer(draft: Pick<VoiceDraft, 'room'>): boolean {
  return !!draft.room?.nobodyElseLately && draft.room.kind !== 'dm'
}

export async function readVoice(draft: VoiceDraft, guide: string, decide: DecisionsClient): Promise<VoiceReading> {
  const neverSays = neverSaysIn(draft.text)
  const alreadyTalked = alreadyTalkedIn(draft)
  const burst = burstOf(draft.text)
  const outside = outsideXVoice(draft)
  const notX = outside ? ` howMattWrites is how he writes on X only, his public posts and replies; this is ${outside.where}, where he writes in bursts of shorter lines and does ask questions, so read howMattWritesInThisChat (its burst median, messageWords and medianWords) and mattsRealRepliesHere first, and use howMattWrites only for his vocabulary and his spelling.` : ''
  const response = await decide({
    model: VOICE_MODEL,
    state: {
      howMattWrites: guide,
      dmsMattWroteHimself: MATT_DMS,
      ...(burst.messages.length > 1 ? { dmAsItWillBeSent: burst.messages, wordsInEachMessageAsSent: burst.words } : {}),
      ...(outside ? { howMattWritesIsOnlyHisX: true, thisChatIsNotX: outside.where } : {}),
      ...(draft.everywhere ? { howMattWritesEverywhere: draft.everywhere.profile, mattsRealRepliesEverywhere: draft.everywhere.replies, mattsClosestWordingEverywhere: draft.everywhere.wording ?? [] } : {}),
      ...(draft.evidence ? { thisChat: draft.evidence.chat, howMattWritesInThisChat: draft.evidence.profile, mattsRealRepliesHere: draft.evidence.replies, mattsClosestRealWording: draft.evidence.wording ?? [], mattsLatestMessagesHere: draft.evidence.recent ?? [] } : {}),
      phrasesMattNeverSays: NEVER_SAYS,
      ...(draft.phrasesNewToMatt ? { wordPairsMattHasNeverWritten: draft.phrasesNewToMatt } : {}),
      ...(draft.scrambler ? { watermarkScramblerLayerA: draft.scrambler } : {}),
      recipient: draft.to,
      alreadyTalkedInThisChat: alreadyTalked,
      whatTheySaid: draft.context ?? null,
      ...(draft.conversation ? { thisConversationRankedForThisMoment: draft.conversation } : {}),
      ...(draft.room ? { theRoom: draft.room } : {}),
      ...(draft.spoken && draft.howMattTalks?.length ? { howMattTalksInHisOwnVoiceNotes: draft.howMattTalks } : {}),
      dm: draft.text,
    },
    questions: {
      voice: draft.spoken ? { type: 'noul', instructions: 'This is a voice note matt sends, said out loud in his own voice, not a typed message, so it runs longer than his texts and its length, capitals and punctuation never count against it. Going first by how matt actually talks in his own voice notes (howMattTalksInHisOwnVoiceNotes, transcribed from his real recordings: his fillers, his slang, how he strings things together), then by matt\'s own messages across all his conversations (mattsRealRepliesEverywhere, mattsClosestWordingEverywhere, howMattWritesEverywhere), and in this chat when there is one (mattsRealRepliesHere, mattsClosestRealWording, mattsLatestMessagesHere), with howMattWrites and dmsMattWroteHimself behind them, would someone who knows him believe matt said this himself: his words and phrasing, his slang, the way he talks, nothing he never says, nothing that reads polished or written for him?', criteria: { true: 'It sounds like matt saying it', false: 'It sounds like ai or a copywriter wrote it for him' } } : { type: 'noul', instructions: 'Going by matt\'s own messages across all his conversations (mattsRealRepliesEverywhere, mattsClosestWordingEverywhere, howMattWritesEverywhere), and in this chat when there is one (mattsRealRepliesHere, mattsClosestRealWording, mattsLatestMessagesHere), with howMattWrites and dmsMattWroteHimself behind them, would someone who knows him believe matt typed this himself: his words and phrasing, his slang, his length, nothing he never writes, nothing that reads polished or written for him? A draft written on several lines goes out as one message per line, so read it as the messages it will be sent as (dmAsItWillBeSent, with wordsInEachMessageAsSent) and as the burst of them, never as one block: his length is each message against howMattWritesInThisChat burst messageWords and medianWords, and how many he sends in a row against its burst median. A subject he has never written about never counts against him: words for a new subject are new vocabulary, not a voice problem, so judge the phrasing, the shape and the register, never the topic.' + notX, criteria: { true: 'It sounds like matt typed it', false: 'It sounds like ai or a copywriter wrote it for him' } },
      inContext: { type: 'noul', instructions: 'Does the dm answer what they actually said or asked (whatTheySaid), read in this conversation (thisConversationRankedForThisMoment, the moments of this chat that matter most to what is being answered, media described in brackets), including anything they sent that it should have answered? With nothing given, does it pick up on something specific about them?', criteria: { true: 'It answers them specifically', false: 'It is generic and could go to anyone' } },
      openerOnly: { type: 'noul', instructions: 'If matt has never talked with them (alreadyTalkedInThisChat is false and nothing of theirs is in whatTheySaid, or it says they have never chatted), is this first dm only an opener about something relevant to them (their post, their work, how they are connected to matt), with no ask: no pitch, no question about a tool, product or service of matt\'s (treg, log, his consulting), no call, no link to his own stuff? If they have already talked, answer true.', criteria: { true: 'It is only a relevant opener, or they have already talked', false: 'A first message that goes in with an ask or a pitch' } },
      friendLike: { type: 'noul', instructions: 'Does this dm read like matt messaging someone he is friendly with: casual, natural and human, not a sales template or a bot?', criteria: { true: 'It reads like a mate texting', false: 'It reads like a template, a pitch or a bot' } },
      ...(draft.room ? { fitsTheRoom: { type: 'noul', instructions: 'Read theRoom: what kind of chat this is, who has spoken in it lately and who the message must be addressed to (addressTo). Does the draft speak to that audience as it really is? A message to a channel or group where nobody else has spoken lately must talk to the room as a whole, and must not address one person as if they were mid-conversation with matt, answer something they did not just say, or bring up what they said long ago as if it were now. In a direct message where matt sent the latest messages and they have not answered yet, a follow-up that carries on from what matt just sent them (a question about their own post he just shared) is addressed to them as the chat really is: it fails only when it acts as if they had replied, or answers something they never said.', criteria: { true: 'It is addressed to the room as it really is', false: 'It talks to someone who is not there, or as if a conversation were live when it is not' } } } : {}),
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
  const fitsTheRoom = draft.room ? answers.fitsTheRoom?.noul ?? 0 : null
  const watermark = watermarkReadingOf(draft.text)
  return { to: draft.to, voice, inContext, friendLike, openerOnly, toThem, buildsOn, fitsTheRoom, neverSays, watermark, pass: !neverSays.length && watermark.level !== 'artifacts' && voice >= VOICE_PASS && (nobodyToAnswer(draft) || inContext >= CONTEXT_PASS) && friendLike >= CONTEXT_PASS && openerOnly >= CONTEXT_PASS && (toThem === null || toThem >= CONTEXT_PASS) && (buildsOn === null || buildsOn >= CONTEXT_PASS) && (fitsTheRoom === null || fitsTheRoom >= CONTEXT_PASS), model: response.model ?? null }
}
