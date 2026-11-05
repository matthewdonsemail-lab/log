import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { basename, join, resolve, sep } from 'node:path'
import { assemblyAiKey, createAssemblyAiClient, hashOf, readTranscript, writeTranscript } from '../../../media/voiceNotes/index.ts'
import { AUDIO_SUFFIX, MAX_SPEAK_CHARACTERS, PLATFORM_AUDIO } from '../types'
import type { ProviderClone, SpeakFormat, SpokenReading, SpokenWord, VoiceNote, VoiceNoteCode, VoiceNotePlatform, VoiceProviderClient } from '../types'
import { AUDIO_TOOLS, convertFor, discordWaveform, encodeTo, instagramLevels, samplesOf } from './audio'
import type { AudioTools } from './audio'
import { voiceSettingsOf } from './provider'
import { processLikeMatt } from './realism'
import type { Done } from './realism'
import { mattsRecordings } from './recordings'
import { readSpoken, speakableText, unknownAcronyms } from './spoken'
import { readClone, stampOf, voiceNotesDir } from './store'

export type Spoken = { ok: true; path: string; bytes: number; model: string; clone: ProviderClone; spoken: SpokenReading } | { ok: false; code: VoiceNoteCode; detail: string; spoken?: SpokenReading }

export type Listened = { ok: true; words: SpokenWord[] } | { ok: false; detail: string }

export interface VoiceSteps {
  process: (from: string, to: string, seed: number) => Done
  listen: (path: string) => Promise<Listened>
  encode: (from: string, to: string) => Done
}

export async function listenTo(path: string): Promise<Listened> {
  const bytes = new Uint8Array(readFileSync(path))
  const hash = hashOf(bytes)
  const kept = readTranscript(hash)
  if (kept?.words) return { ok: true, words: kept.words }
  const answer = await createAssemblyAiClient({ key: assemblyAiKey() }).transcribe(bytes, basename(path), hash)
  if (!answer.ok || !answer.transcript) return { ok: false, detail: `AssemblyAI couldn't transcribe it to check the words (${answer.ok ? 'no transcript' : `${answer.code}: ${answer.error}`})` }
  writeTranscript(answer.transcript)
  return answer.transcript.words ? { ok: true, words: answer.transcript.words } : { ok: false, detail: 'AssemblyAI gave no word timings to check the words against' }
}

export const voiceSteps: VoiceSteps = {
  process: (from, to, seed) => processLikeMatt(from, to, mattsRecordings().map((r) => r.path), seed),
  listen: listenTo,
  encode: (from, to) => encodeTo(from, to),
}

const seedOf = (text: string) => Number.parseInt(createHash('sha1').update(text).digest('hex').slice(0, 8), 16)

export function textOnlyProblem(text: string): string | null {
  const said = text.trim()
  if (!said) return 'the voice note needs --text: the words to say'
  const spoken = said.replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim()
  if (spoken.length > MAX_SPEAK_CHARACTERS) return `the voice note says ${spoken.length} characters; keep it under ${MAX_SPEAK_CHARACTERS}`
  if (AUDIO_SUFFIX.test(said) || existsSync(said)) return 'a voice note takes text only, never an audio file: it is always made from the words, in matt\'s cloned voice'
  return null
}

export function insideVoiceNotes(path: string, root = voiceNotesDir()): boolean {
  return resolve(path).startsWith(resolve(root) + sep)
}

export async function speakToFile(client: VoiceProviderClient, text: string, format: SpeakFormat, model: string | null = null, clone: ProviderClone | null = readClone(client.provider), now: Date = new Date(), steps: VoiceSteps = voiceSteps, language?: string): Promise<Spoken> {
  if (!clone) return { ok: false, code: 'voiceCloneMissing', detail: `there is no clone of matt's voice on ${client.provider} yet: log clone voice --provider ${client.provider} --apply makes it once from his own voice notes` }
  const problem = textOnlyProblem(text)
  if (problem) return { ok: false, code: 'voiceNoteInvalid', detail: problem }
  const unknown = unknownAcronyms(text)
  if (unknown.length) return { ok: false, code: 'pronunciationUnknown', detail: `${unknown.map((u) => `"${u}"`).join(', ')} ${unknown.length > 1 ? 'are' : 'is'} not in the spoken lexicon (SPOKEN_LEXICON), so whether matt says ${unknown.length > 1 ? 'them' : 'it'} as a word or as letters isn't known: write ${unknown.length > 1 ? 'them' : 'it'} out the way it is said, or add ${unknown.length > 1 ? 'them' : 'it'} to the lexicon` }
  const used = model ?? clone.model
  const answer = await client.speak({ text: speakableText(text.trim()), voiceId: clone.voiceId, model: used, format: 'wav', ...(language ?? clone.language ? { language: language ?? clone.language } : {}), accent: clone.accent ?? voiceSettingsOf().accent, speed: voiceSettingsOf().speed })
  if (!answer.ok || !answer.data) return { ok: false, code: answer.code === 'voiceKeyMissing' ? 'voiceKeyMissing' : 'voiceProviderRefused', detail: `${client.provider} answered ${answer.status || 'nothing'}${answer.code ? ` (${answer.code})` : ''}${answer.error ? `: ${answer.error}` : ''} to text to speech with ${used}` }
  mkdirSync(voiceNotesDir(), { recursive: true })
  const stem = join(voiceNotesDir(), `${stampOf(now)}_${client.provider}_${createHash('sha1').update(text.trim()).digest('hex').slice(0, 10)}`)
  const raw = `${stem}_raw.wav`
  writeFileSync(raw, answer.data)
  const wav = `${stem}.wav`
  const processed = steps.process(raw, wav, seedOf(text.trim()))
  rmSync(raw, { force: true })
  if (!processed.ok) return { ok: false, code: 'voiceProcessingFailed', detail: processed.detail }
  const listened = await steps.listen(wav)
  if (!listened.ok) {
    rmSync(wav, { force: true })
    return { ok: false, code: 'spokenCheckFailed', detail: listened.detail }
  }
  const spoken = readSpoken(text, listened.words)
  if (!spoken.ok) {
    rmSync(wav, { force: true })
    return { ok: false, code: 'spokenMismatch', detail: `it didn't say what was written: ${spoken.problems.join('; ')}. Heard: "${spoken.heard}"`, spoken }
  }
  if (format === 'wav') return { ok: true, path: wav, bytes: readFileSync(wav).length, model: used, clone, spoken }
  const path = `${stem}.${format}`
  const converted = steps.encode(wav, path)
  rmSync(wav, { force: true })
  if (!converted.ok) return { ok: false, code: 'voiceNoteConvertFailed', detail: converted.detail }
  return { ok: true, path, bytes: readFileSync(path).length, model: used, clone, spoken }
}

export type Rendered = { ok: true; note: VoiceNote } | { ok: false; code: VoiceNoteCode; detail: string }

export async function renderVoiceNote(client: VoiceProviderClient, platform: VoiceNotePlatform, text: string, tools: AudioTools = AUDIO_TOOLS, now: Date = new Date(), steps: VoiceSteps = voiceSteps, language?: string): Promise<Rendered> {
  const spoken = await speakToFile(client, text, 'wav', null, readClone(client.provider), now, steps, language)
  if (!spoken.ok) return { ok: false, code: spoken.code, detail: spoken.detail }
  const out = spoken.path.replace(/\.wav$/, PLATFORM_AUDIO[platform].suffix)
  const converted = convertFor(platform, spoken.path, out, tools)
  rmSync(spoken.path, { force: true })
  if (!converted.ok) return { ok: false, code: 'voiceNoteConvertFailed', detail: converted.detail }
  const samples = samplesOf(out, 8000, tools)
  const seconds = samples.length / 8000
  if (!seconds) return { ok: false, code: 'voiceNoteConvertFailed', detail: `ffmpeg made ${out}, but it holds no audio` }
  return { ok: true, note: { path: out, platform, seconds: Math.round(seconds * 100) / 100, waveform: discordWaveform(samples, seconds), levels: instagramLevels(samples), provider: client.provider, model: spoken.model, heard: spoken.spoken.heard } }
}
