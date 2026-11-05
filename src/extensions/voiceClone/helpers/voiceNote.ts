import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve, sep } from 'node:path'
import { AUDIO_SUFFIX, MAX_SPEAK_CHARACTERS, PLATFORM_AUDIO } from '../types'
import type { ProviderClone, SpeakFormat, VoiceNote, VoiceNoteCode, VoiceNotePlatform, VoiceProviderClient } from '../types'
import { AUDIO_TOOLS, convertFor, discordWaveform, instagramLevels, samplesOf } from './audio'
import type { AudioTools } from './audio'
import { voiceSettingsOf } from './provider'
import { readClone, stampOf, voiceNotesDir } from './store'

export type Spoken = { ok: true; path: string; bytes: number; model: string; clone: ProviderClone } | { ok: false; code: VoiceNoteCode; detail: string }

export function textOnlyProblem(text: string): string | null {
  const said = text.trim()
  if (!said) return 'the voice note needs --text: the words to say'
  if (said.length > MAX_SPEAK_CHARACTERS) return `the voice note is ${said.length} characters; keep it under ${MAX_SPEAK_CHARACTERS}`
  if (AUDIO_SUFFIX.test(said) || existsSync(said)) return 'a voice note takes text only, never an audio file: it is always made from the words, in matt\'s cloned voice'
  return null
}

export function insideVoiceNotes(path: string, root = voiceNotesDir()): boolean {
  return resolve(path).startsWith(resolve(root) + sep)
}

export async function speakToFile(client: VoiceProviderClient, text: string, format: SpeakFormat, model: string | null = null, clone: ProviderClone | null = readClone(client.provider), now: Date = new Date()): Promise<Spoken> {
  if (!clone) return { ok: false, code: 'voiceCloneMissing', detail: `there is no clone of matt's voice on ${client.provider} yet: log clone voice --provider ${client.provider} --apply makes it once from his own voice notes` }
  const problem = textOnlyProblem(text)
  if (problem) return { ok: false, code: 'voiceNoteInvalid', detail: problem }
  const used = model ?? clone.model
  const answer = await client.speak({ text: text.trim(), voiceId: clone.voiceId, model: used, format, ...(clone.language ? { language: clone.language } : {}), accent: clone.accent ?? voiceSettingsOf().accent })
  if (!answer.ok || !answer.data) return { ok: false, code: answer.code === 'voiceKeyMissing' ? 'voiceKeyMissing' : 'voiceProviderRefused', detail: `${client.provider} answered ${answer.status || 'nothing'}${answer.code ? ` (${answer.code})` : ''}${answer.error ? `: ${answer.error}` : ''} to text to speech with ${used}` }
  mkdirSync(voiceNotesDir(), { recursive: true })
  const path = join(voiceNotesDir(), `${stampOf(now)}_${client.provider}_${createHash('sha1').update(text.trim()).digest('hex').slice(0, 10)}.${format}`)
  writeFileSync(path, answer.data)
  return { ok: true, path, bytes: answer.data.length, model: used, clone }
}

export type Rendered = { ok: true; note: VoiceNote } | { ok: false; code: VoiceNoteCode; detail: string }

export async function renderVoiceNote(client: VoiceProviderClient, platform: VoiceNotePlatform, text: string, tools: AudioTools = AUDIO_TOOLS, now: Date = new Date()): Promise<Rendered> {
  const spoken = await speakToFile(client, text, 'wav', null, readClone(client.provider), now)
  if (!spoken.ok) return spoken
  const out = spoken.path.replace(/\.wav$/, PLATFORM_AUDIO[platform].suffix)
  const converted = convertFor(platform, spoken.path, out, tools)
  rmSync(spoken.path, { force: true })
  if (!converted.ok) return { ok: false, code: 'voiceNoteConvertFailed', detail: converted.detail }
  const samples = samplesOf(out, 8000, tools)
  const seconds = samples.length / 8000
  if (!seconds) return { ok: false, code: 'voiceNoteConvertFailed', detail: `ffmpeg made ${out}, but it holds no audio` }
  return { ok: true, note: { path: out, platform, seconds: Math.round(seconds * 100) / 100, waveform: discordWaveform(samples, seconds), levels: instagramLevels(samples), provider: client.provider, model: spoken.model } }
}
