import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FISH_API, FISH_ENDPOINTS, FISH_KEY_NAME } from './types'
import type { FishAnswer, FishFetch, FishModelInfo, FishResponse, FishVoice, SpeakRequest } from './types'

export function fishKey(env: Record<string, string | undefined> = process.env, home = homedir()): string | null {
  if (env[FISH_KEY_NAME]?.trim()) return env[FISH_KEY_NAME]!.trim()
  const repo = resolve(fileURLToPath(new URL('../../..', import.meta.url)))
  for (const file of [join(repo, '.env.local'), join(repo, '..', '..', '.env.local'), join(home, '.buzz', '.env.local')]) {
    if (!existsSync(file)) continue
    const found = new RegExp(`^\\s*${FISH_KEY_NAME}\\s*=\\s*(.*)$`, 'm').exec(readFileSync(file, 'utf8'))?.[1]?.trim().replace(/^["']|["']$/g, '')
    if (found) return found
  }
  return null
}

export function modelInfoOf(body: unknown): FishModelInfo {
  const raw = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>
  const text = (k: string) => (typeof raw[k] === 'string' ? (raw[k] as string) : null)
  return { id: text('_id') ?? '', title: text('title') ?? '', state: text('state'), visibility: text('visibility') }
}

async function refusalOf(answer: FishResponse): Promise<{ code: string; error: string | null }> {
  const body = (await answer.json().catch(() => null)) as Record<string, unknown> | null
  const said = [body?.message, body?.reason].filter((x) => typeof x === 'string' && x).join(': ')
  return { code: answer.status === 402 ? 'fishPaymentRequired' : `fishHttp${answer.status}`, error: said || null }
}

export function createFishClient(key: string | null = fishKey(), fetcher: FishFetch = fetch as unknown as FishFetch) {
  const missing = <T>(): FishAnswer<T> => ({ ok: false, status: 0, code: 'fishKeyMissing', error: `${FISH_KEY_NAME} is not set (the environment, .env.local in the repo, or ~/.buzz/.env.local)`, data: null })
  const auth = () => ({ Authorization: `Bearer ${key}` })
  return {
    async createModel(title: string, voices: readonly FishVoice[]): Promise<FishAnswer<FishModelInfo>> {
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
      if (!info.id) return { ok: false, status: answer.status, code: 'fishRefused', error: 'Fish answered without a model id', data: null }
      return { ok: true, status: answer.status, code: null, error: null, data: info }
    },
    async getModel(id: string): Promise<FishAnswer<FishModelInfo>> {
      if (!key) return missing()
      const answer = await fetcher(`${FISH_API}${FISH_ENDPOINTS.getModel}${encodeURIComponent(id)}`, { method: 'GET', headers: auth() })
      if (answer.status !== 200) return { ok: false, status: answer.status, ...(await refusalOf(answer)), data: null }
      return { ok: true, status: 200, code: null, error: null, data: modelInfoOf(await answer.json().catch(() => null)) }
    },
    async speak(request: SpeakRequest): Promise<FishAnswer<Uint8Array>> {
      if (!key) return missing()
      const body = JSON.stringify({ text: request.text, reference_id: request.referenceId, format: request.format, normalize: true, latency: 'normal' })
      const answer = await fetcher(`${FISH_API}${FISH_ENDPOINTS.speak}`, { method: 'POST', headers: { ...auth(), 'Content-Type': 'application/json', model: request.model }, body })
      if (answer.status !== 200) return { ok: false, status: answer.status, ...(await refusalOf(answer)), data: null }
      const bytes = new Uint8Array(await answer.arrayBuffer())
      if (!bytes.length) return { ok: false, status: 200, code: 'fishRefused', error: 'Fish answered 200 with no audio', data: null }
      return { ok: true, status: 200, code: null, error: null, data: bytes }
    },
  }
}

export type FishClient = ReturnType<typeof createFishClient>
