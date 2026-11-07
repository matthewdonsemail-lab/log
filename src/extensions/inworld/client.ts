import { noteProviderAnswer, withCreditNote } from '../../billing/balance/helpers/answers'
import { accentDescriptionOf, envValue, voiceSettingsOf } from '../voiceClone/helpers/provider'
import type { ReferenceAudio, SpeakRequest, VoiceAnswer, VoiceFetch, VoiceProviderClient, VoiceResponse, VoiceSettings } from '../voiceClone/types'
import { withBreaths } from '../voiceClone/helpers/spoken'
import { INWORLD_API, INWORLD_ENCODINGS, INWORLD_ENDPOINTS, INWORLD_KEY_NAME, INWORLD_LANGUAGE_REFUSED, INWORLD_LIMITS, INWORLD_MODELS, INWORLD_STEERING_MODELS } from './types'
import type { InworldModel } from './types'

export function inworldKey(env: Record<string, string | undefined> = process.env): string | null {
  return envValue(INWORLD_KEY_NAME, env)
}

async function refusalOf(answer: VoiceResponse): Promise<{ code: string; error: string | null }> {
  const body = (await answer.json().catch(() => null)) as Record<string, unknown> | null
  const said = [body?.message, (body?.error as Record<string, unknown> | undefined)?.message].filter((x) => typeof x === 'string' && x).join(': ')
  return { code: `inworldHttp${answer.status}`, error: withCreditNote('inworld', answer.status, said) || null }
}

const base64 = (bytes: Uint8Array) => Buffer.from(bytes).toString('base64')

export function steeredText(model: string, text: string): string {
  return (INWORLD_STEERING_MODELS as readonly string[]).includes(model as InworldModel) ? withBreaths(text, seedOfText(text)) : text
}

const seedOfText = (text: string) => [...text].reduce((h, c) => (Math.imul(h, 31) + c.codePointAt(0)!) >>> 0, 7)

export function cloneBodyOf(displayName: string, samples: readonly ReferenceAudio[], language: string, accent: string): string {
  return JSON.stringify({ displayName, languageCode: language, description: accentDescriptionOf(accent), voiceSamples: samples.map((s) => ({ audioData: base64(s.bytes), ...(s.transcription ? { transcription: s.transcription } : {}) })) })
}

export function createInworldClient(key: string | null = inworldKey(), fetcher: VoiceFetch = fetch as unknown as VoiceFetch) {
  const missing = <T>(): VoiceAnswer<T> => ({ ok: false, status: 0, code: 'voiceKeyMissing', error: `${INWORLD_KEY_NAME} is not set (the environment, .env.local in the repo, or ~/.buzz/.env.local)`, data: null })
  const headers = () => ({ Authorization: `Basic ${key}`, 'Content-Type': 'application/json' })
  return {
    async cloneVoice(displayName: string, samples: readonly ReferenceAudio[], settings: VoiceSettings = voiceSettingsOf()): Promise<VoiceAnswer<{ voiceId: string; warnings: unknown; language: string; refused: string[] }>> {
      if (!key) return missing()
      const refused: string[] = []
      for (const language of [...new Set([settings.language, settings.fallback])]) {
        const answer = await fetcher(`${INWORLD_API}${INWORLD_ENDPOINTS.clone}`, { method: 'POST', headers: headers(), body: cloneBodyOf(displayName, samples, language, settings.accent) })
        if (answer.status !== 200) {
          const refusal = await refusalOf(answer)
          if (answer.status === 400 && language !== settings.fallback && INWORLD_LANGUAGE_REFUSED.test(refusal.error ?? 'INVALID_ARGUMENT')) {
            refused.push(`${language}: ${refusal.error ?? 'INVALID_ARGUMENT'}`)
            continue
          }
          return { ok: false, status: answer.status, code: refusal.code, error: [...refused, `${language}: ${refusal.error ?? ''}`].join('; '), data: null }
        }
        const read = (await answer.json().catch(() => null)) as { voice?: { voiceId?: unknown; languageCode?: unknown }; audioSamplesValidated?: unknown } | null
        const voiceId = typeof read?.voice?.voiceId === 'string' ? read.voice.voiceId : ''
        if (!voiceId) return { ok: false, status: 200, code: 'inworldNoVoiceId', error: 'Inworld answered without a voice id', data: null }
        const accepted = typeof read?.voice?.languageCode === 'string' && read.voice.languageCode ? read.voice.languageCode : language
        return { ok: true, status: 200, code: null, error: null, data: { voiceId, warnings: read?.audioSamplesValidated ?? null, language: accepted, refused } }
      }
      return { ok: false, status: 400, code: 'inworldHttp400', error: refused.join('; '), data: null }
    },
    async synthesize(request: SpeakRequest): Promise<VoiceAnswer<Uint8Array>> {
      if (!key) return missing()
      const body = JSON.stringify({ text: steeredText(request.model, request.text), voiceId: request.voiceId, modelId: request.model, ...(request.language ? { language: request.language } : {}), audioConfig: { audioEncoding: INWORLD_ENCODINGS[request.format], ...(request.speed ? { speakingRate: request.speed } : {}) } })
      const answer = await fetcher(`${INWORLD_API}${INWORLD_ENDPOINTS.speak}`, { method: 'POST', headers: headers(), body })
      if (answer.status !== 200) return { ok: false, status: answer.status, ...(await refusalOf(answer)), data: null }
      noteProviderAnswer('inworld', answer.status)
      const read = (await answer.json().catch(() => null)) as { audioContent?: unknown } | null
      const bytes = typeof read?.audioContent === 'string' ? new Uint8Array(Buffer.from(read.audioContent, 'base64')) : new Uint8Array()
      if (!bytes.length) return { ok: false, status: 200, code: 'inworldNoAudio', error: 'Inworld answered 200 with no audioContent', data: null }
      return { ok: true, status: 200, code: null, error: null, data: bytes }
    },
  }
}

export type InworldClient = ReturnType<typeof createInworldClient>

export function inworldProvider(key: string | null = inworldKey(), fetcher?: VoiceFetch): VoiceProviderClient {
  const client = createInworldClient(key, fetcher)
  return {
    provider: 'inworld',
    keyName: INWORLD_KEY_NAME,
    models: INWORLD_MODELS,
    cheapest: INWORLD_MODELS[0],
    preferred: 'inworld-tts-2',
    limits: INWORLD_LIMITS,
    referenceFormat: 'wav',
    async clone(title, references, settings) {
      const made = await client.cloneVoice(title, references, settings)
      if (!made.ok || !made.data) return { ...made, data: null }
      return { ok: true, status: made.status, code: null, error: null, data: { voiceId: made.data.voiceId, state: 'ready', language: made.data.language } }
    },
    speak: (request) => client.synthesize(request),
  }
}
