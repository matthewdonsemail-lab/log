import { withCreditNote } from '../../billing/balance/helpers/answers'
import { envValue } from '../voiceClone/helpers/provider'
import type { ReferenceAudio, SpeakRequest, VoiceAnswer, VoiceFetch, VoiceProviderClient, VoiceResponse } from '../voiceClone/types'
import { FISH_API, FISH_ENDPOINTS, FISH_KEY_NAME, FISH_LIMITS, FISH_MODELS } from './types'
import type { FishModelInfo } from './types'

export function fishKey(env: Record<string, string | undefined> = process.env): string | null {
  return envValue(FISH_KEY_NAME, env)
}

export function modelInfoOf(body: unknown): FishModelInfo {
  const raw = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>
  const text = (k: string) => (typeof raw[k] === 'string' ? (raw[k] as string) : null)
  return { id: text('_id') ?? '', title: text('title') ?? '', state: text('state'), visibility: text('visibility') }
}

async function refusalOf(answer: VoiceResponse): Promise<{ code: string; error: string | null }> {
  const body = (await answer.json().catch(() => null)) as Record<string, unknown> | null
  const said = [body?.message, body?.reason].filter((x) => typeof x === 'string' && x).join(': ')
  return { code: `fishHttp${answer.status}`, error: withCreditNote('fishAudio', answer.status, said) || null }
}

export function createFishClient(key: string | null = fishKey(), fetcher: VoiceFetch = fetch as unknown as VoiceFetch) {
  const missing = <T>(): VoiceAnswer<T> => ({ ok: false, status: 0, code: 'voiceKeyMissing', error: `${FISH_KEY_NAME} is not set (the environment, .env.local in the repo, or ~/.buzz/.env.local)`, data: null })
  const auth = () => ({ Authorization: `Bearer ${key}` })
  return {
    async createModel(title: string, voices: readonly ReferenceAudio[]): Promise<VoiceAnswer<FishModelInfo>> {
      if (!key) return missing()
      const form = new FormData()
      form.set('type', 'tts')
      form.set('title', title)
      form.set('train_mode', 'fast')
      form.set('visibility', 'private')
      form.set('enhance_audio_quality', 'true')
      for (const voice of voices) form.append('voices', new Blob([voice.bytes], { type: voice.type }), voice.name)
      const answer = await fetcher(`${FISH_API}${FISH_ENDPOINTS.createModel}`, { method: 'POST', headers: auth(), body: form })
      if (answer.status !== 201 && answer.status !== 200) return { ok: false, status: answer.status, ...(await refusalOf(answer)), data: null }
      const info = modelInfoOf(await answer.json().catch(() => null))
      if (!info.id) return { ok: false, status: answer.status, code: 'fishNoModelId', error: 'Fish answered without a model id', data: null }
      return { ok: true, status: answer.status, code: null, error: null, data: info }
    },
    async getModel(id: string): Promise<VoiceAnswer<FishModelInfo>> {
      if (!key) return missing()
      const answer = await fetcher(`${FISH_API}${FISH_ENDPOINTS.getModel}${encodeURIComponent(id)}`, { method: 'GET', headers: auth() })
      if (answer.status !== 200) return { ok: false, status: answer.status, ...(await refusalOf(answer)), data: null }
      return { ok: true, status: 200, code: null, error: null, data: modelInfoOf(await answer.json().catch(() => null)) }
    },
    async speak(request: SpeakRequest): Promise<VoiceAnswer<Uint8Array>> {
      if (!key) return missing()
      const body = JSON.stringify({ text: request.text, reference_id: request.voiceId, format: request.format, normalize: true, latency: 'normal' })
      const answer = await fetcher(`${FISH_API}${FISH_ENDPOINTS.speak}`, { method: 'POST', headers: { ...auth(), 'Content-Type': 'application/json', model: request.model }, body })
      if (answer.status !== 200) return { ok: false, status: answer.status, ...(await refusalOf(answer)), data: null }
      const bytes = new Uint8Array(await answer.arrayBuffer())
      if (!bytes.length) return { ok: false, status: 200, code: 'fishNoAudio', error: 'Fish answered 200 with no audio', data: null }
      return { ok: true, status: 200, code: null, error: null, data: bytes }
    },
  }
}

export type FishClient = ReturnType<typeof createFishClient>

export function fishAudioProvider(key: string | null = fishKey(), fetcher?: VoiceFetch): VoiceProviderClient {
  const client = createFishClient(key, fetcher)
  return {
    provider: 'fishAudio',
    keyName: FISH_KEY_NAME,
    models: FISH_MODELS,
    cheapest: FISH_MODELS[0],
    limits: FISH_LIMITS,
    referenceFormat: 'asIs',
    async clone(title, references) {
      const made = await client.createModel(title, references)
      if (!made.ok || !made.data) return { ...made, data: null }
      const read = await client.getModel(made.data.id)
      return { ok: true, status: made.status, code: null, error: null, data: { voiceId: made.data.id, state: read.ok ? read.data?.state ?? null : made.data.state } }
    },
    speak: (request) => client.speak(request),
  }
}
