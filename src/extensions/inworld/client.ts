import { envValue } from '../voiceClone/helpers/provider'
import type { ReferenceAudio, SpeakRequest, VoiceAnswer, VoiceFetch, VoiceProviderClient, VoiceResponse } from '../voiceClone/types'
import { INWORLD_API, INWORLD_ENCODINGS, INWORLD_ENDPOINTS, INWORLD_KEY_NAME, INWORLD_LANGUAGE, INWORLD_LIMITS, INWORLD_MODELS } from './types'

export function inworldKey(env: Record<string, string | undefined> = process.env): string | null {
  return envValue(INWORLD_KEY_NAME, env)
}

async function refusalOf(answer: VoiceResponse): Promise<{ code: string; error: string | null }> {
  const body = (await answer.json().catch(() => null)) as Record<string, unknown> | null
  const said = [body?.message, (body?.error as Record<string, unknown> | undefined)?.message].filter((x) => typeof x === 'string' && x).join(': ')
  return { code: `inworldHttp${answer.status}`, error: said || null }
}

const base64 = (bytes: Uint8Array) => Buffer.from(bytes).toString('base64')

export function createInworldClient(key: string | null = inworldKey(), fetcher: VoiceFetch = fetch as unknown as VoiceFetch) {
  const missing = <T>(): VoiceAnswer<T> => ({ ok: false, status: 0, code: 'voiceKeyMissing', error: `${INWORLD_KEY_NAME} is not set (the environment, .env.local in the repo, or ~/.buzz/.env.local)`, data: null })
  const headers = () => ({ Authorization: `Basic ${key}`, 'Content-Type': 'application/json' })
  return {
    async cloneVoice(displayName: string, samples: readonly ReferenceAudio[]): Promise<VoiceAnswer<{ voiceId: string; warnings: unknown }>> {
      if (!key) return missing()
      const body = JSON.stringify({ displayName, languageCode: INWORLD_LANGUAGE, voiceSamples: samples.map((s) => ({ audioData: base64(s.bytes) })) })
      const answer = await fetcher(`${INWORLD_API}${INWORLD_ENDPOINTS.clone}`, { method: 'POST', headers: headers(), body })
      if (answer.status !== 200) return { ok: false, status: answer.status, ...(await refusalOf(answer)), data: null }
      const read = (await answer.json().catch(() => null)) as { voice?: { voiceId?: unknown }; audioSamplesValidated?: unknown } | null
      const voiceId = typeof read?.voice?.voiceId === 'string' ? read.voice.voiceId : ''
      if (!voiceId) return { ok: false, status: 200, code: 'inworldNoVoiceId', error: 'Inworld answered without a voice id', data: null }
      return { ok: true, status: 200, code: null, error: null, data: { voiceId, warnings: read?.audioSamplesValidated ?? null } }
    },
    async synthesize(request: SpeakRequest): Promise<VoiceAnswer<Uint8Array>> {
      if (!key) return missing()
      const body = JSON.stringify({ text: request.text, voiceId: request.voiceId, modelId: request.model, audioConfig: { audioEncoding: INWORLD_ENCODINGS[request.format] } })
      const answer = await fetcher(`${INWORLD_API}${INWORLD_ENDPOINTS.speak}`, { method: 'POST', headers: headers(), body })
      if (answer.status !== 200) return { ok: false, status: answer.status, ...(await refusalOf(answer)), data: null }
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
    limits: INWORLD_LIMITS,
    referenceFormat: 'wav',
    async clone(title, references) {
      const made = await client.cloneVoice(title, references)
      if (!made.ok || !made.data) return { ...made, data: null }
      return { ok: true, status: made.status, code: null, error: null, data: { voiceId: made.data.voiceId, state: 'ready' } }
    },
    speak: (request) => client.synthesize(request),
  }
}
