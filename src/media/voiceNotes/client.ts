import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ASSEMBLY_AI_API, ASSEMBLY_AI_KEY_NAME, ASSEMBLY_AI_KEY_NAMES, POLL_EVERY_MS, POLL_FOR_MS } from './types'
import type { AssemblyAiClient, AssemblyAiOptions, TranscribeAnswer } from './types'

export function assemblyAiKey(env: Record<string, string | undefined> = process.env, home = homedir()): string | null {
  for (const name of ASSEMBLY_AI_KEY_NAMES) if (env[name]?.trim()) return env[name]!.trim()
  const repo = resolve(fileURLToPath(new URL('../../..', import.meta.url)))
  for (const file of [join(repo, '.env.local'), join(repo, '..', '..', '.env.local'), join(home, '.buzz', '.env.local'), join(home, 'filmcraft', '.env.local')]) {
    if (!existsSync(file)) continue
    const text = readFileSync(file, 'utf8')
    for (const name of ASSEMBLY_AI_KEY_NAMES) {
      const named = new RegExp(`^\\s*${name}\\s*=\\s*(.*)$`, 'm').exec(text)?.[1]?.trim().replace(/^"|"$/g, '')
      if (named) return named
    }
  }
  return null
}

export function hashOf(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex')
}

const failed = (status: number, error: string): TranscribeAnswer => ({ ok: false, code: 'transcriptionFailed', status, error })

async function answerOf(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text()
  try {
    return JSON.parse(text) as Record<string, unknown>
  } catch {
    return { error: text.slice(0, 300) }
  }
}

export function createAssemblyAiClient(options: AssemblyAiOptions): AssemblyAiClient {
  const fetcher = options.fetcher ?? fetch
  const wait = options.wait ?? ((ms: number) => new Promise<void>((done) => setTimeout(done, ms)))
  const now = options.now ?? (() => new Date())
  const every = options.pollEveryMs ?? POLL_EVERY_MS
  const limit = options.pollForMs ?? POLL_FOR_MS
  const key = options.key
  return {
    hasKey: Boolean(key),
    async transcribe(bytes, file, hash) {
      if (!key) return { ok: false, code: 'assemblyAiKeyMissing', status: 0, error: `${ASSEMBLY_AI_KEY_NAME} (or ASSEMBLY_AI_KEY) is not set (the environment, .env.local in the repo, ~/.buzz/.env.local or ~/filmcraft/.env.local)` }
      const headers = { authorization: key }
      const uploaded = await fetcher(`${ASSEMBLY_AI_API}/upload`, { method: 'POST', headers: { ...headers, 'content-type': 'application/octet-stream' }, body: bytes })
      const upload = await answerOf(uploaded)
      if (uploaded.status !== 200 || typeof upload.upload_url !== 'string') return failed(uploaded.status, `upload: ${String(upload.error ?? 'no upload_url in the answer')}`)
      const created = await fetcher(`${ASSEMBLY_AI_API}/transcript`, { method: 'POST', headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify({ audio_url: upload.upload_url, language_detection: true }) })
      const job = await answerOf(created)
      if (created.status !== 200 || typeof job.id !== 'string') return failed(created.status, `transcript: ${String(job.error ?? 'no id in the answer')}`)
      const started = now().getTime()
      for (;;) {
        await wait(every)
        const polled = await fetcher(`${ASSEMBLY_AI_API}/transcript/${job.id}`, { method: 'GET', headers })
        const state = await answerOf(polled)
        if (polled.status !== 200) return failed(polled.status, `poll: ${String(state.error ?? 'no answer')}`)
        if (state.status === 'error') return failed(200, `AssemblyAI: ${String(state.error ?? 'error')}`)
        if (state.status === 'completed') {
          return {
            ok: true,
            cached: false,
            transcript: {
              hash,
              text: typeof state.text === 'string' ? state.text.trim() : '',
              languageCode: typeof state.language_code === 'string' ? state.language_code : null,
              seconds: typeof state.audio_duration === 'number' ? state.audio_duration : null,
              transcriptId: job.id,
              file,
              transcribedAt: now().toISOString(),
            },
          }
        }
        if (now().getTime() - started > limit) return failed(0, `transcript ${job.id} was still ${String(state.status)} after ${Math.round(limit / 60_000)} min`)
      }
    },
  }
}
