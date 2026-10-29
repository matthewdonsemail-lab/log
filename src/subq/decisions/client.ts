import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DecisionRequest, DecisionResponse, DecisionsClient } from './types'
import { SUBQ_DECISIONS_MODEL, SUBQ_DECISIONS_URL } from './types'

export function subqKeyFile(home = homedir()): string {
  return join(home, '.config', 'listeningkit', 'subq-api-key.txt')
}

export function subqKey(env: Record<string, string | undefined> = process.env, keyFile = subqKeyFile()): string | null {
  if (env.SUBQ_API_KEY) return env.SUBQ_API_KEY
  if (existsSync(keyFile)) {
    const text = readFileSync(keyFile, 'utf8')
    const named = /^\s*SUBQ_API_KEY\s*=\s*(.*)$/m.exec(text)?.[1]?.trim().replace(/^"|"$/g, '')
    const fromFile = named ?? (text.includes('=') ? '' : text.trim())
    if (fromFile) return fromFile
  }
  const repo = resolve(fileURLToPath(new URL('../../..', import.meta.url)))
  for (const file of [join(repo, '.env.local'), join(repo, '..', '..', '.env.local')]) {
    if (!existsSync(file)) continue
    const match = /^SUBQ_API_KEY=(.*)$/m.exec(readFileSync(file, 'utf8'))
    if (match?.[1]?.trim()) return match[1].trim().replace(/^"|"$/g, '')
  }
  return null
}

export function createDecisionsClient(key: string | null = subqKey()): DecisionsClient {
  return async (request: DecisionRequest): Promise<DecisionResponse> => {
    if (!key) throw Object.assign(new Error('SUBQ_API_KEY is not set (~/.config/listeningkit/subq-api-key.txt or .env.local)'), { code: 'subqKeyMissing' })
    const body = JSON.stringify({ model: SUBQ_DECISIONS_MODEL, ...request })
    for (const [attempt, wait] of [0, 1000, 3000].entries()) {
      if (wait) await new Promise((r) => setTimeout(r, wait))
      const response = await fetch(SUBQ_DECISIONS_URL, { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body })
      if (response.ok) return (await response.json()) as DecisionResponse
      const text = await response.text()
      const retryable = response.status === 429 || response.status >= 500
      if (!retryable || attempt === 2) {
        let message = text.slice(0, 300)
        try {
          message = (JSON.parse(text) as { detail?: { message?: string } }).detail?.message ?? message
        } catch {
        }
        throw Object.assign(new Error(`SubQ ${response.status}: ${message}`), { code: 'subqRequestFailed' })
      }
    }
    throw Object.assign(new Error('SubQ: no answer'), { code: 'subqRequestFailed' })
  }
}
