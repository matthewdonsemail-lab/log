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
    state: { howMattWrites: guide, dmsMattWroteHimself: MATT_DMS, phrasesMattNeverSays: NEVER_SAYS, recipient: draft.to, whatTheySaid: draft.context ?? null, dm: draft.text },
    questions: {
      voice: { type: 'noul', instructions: 'Going by howMattWrites and dmsMattWroteHimself, does this dm sound like matt typed it himself: his words, plain about what he does, no clever phrasing, no praise-then-question, no yap?', criteria: { true: 'It sounds like matt typed it', false: 'It sounds like ai or a copywriter wrote it for him' } },
      inContext: { type: 'noul', instructions: 'Does the dm answer what they actually said or asked (whatTheySaid)? With nothing given, does it pick up on something specific about them?', criteria: { true: 'It answers them specifically', false: 'It is generic and could go to anyone' } },
      friendLike: { type: 'noul', instructions: 'Does this dm read like matt messaging someone he is friendly with: casual, natural and human, not a sales template or a bot?', criteria: { true: 'It reads like a mate texting', false: 'It reads like a template, a pitch or a bot' } },
    },
  })
  const answers = response.answers as Record<string, { noul?: number }>
  const voice = answers.voice?.noul ?? 0
  const inContext = answers.inContext?.noul ?? 0
  const friendLike = answers.friendLike?.noul ?? 0
  return { to: draft.to, voice, inContext, friendLike, neverSays, pass: !neverSays.length && voice >= VOICE_PASS && inContext >= CONTEXT_PASS && friendLike >= CONTEXT_PASS, model: response.model ?? null }
}
