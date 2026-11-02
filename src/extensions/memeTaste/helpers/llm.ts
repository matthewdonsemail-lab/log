import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LlmConfig {
  key: string
  baseUrl: string
  model: string
}

export type Llm = (messages: ChatMessage[], opts?: { maxTokens?: number; temperature?: number }) => Promise<string>

function envFile(): Record<string, string> {
  const repo = resolve(fileURLToPath(new URL('../../../..', import.meta.url)))
  const out: Record<string, string> = {}
  for (const file of [join(repo, '.env.local'), join(repo, '..', '..', '.env.local')]) {
    if (!existsSync(file)) continue
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line)
      if (m && out[m[1]!] === undefined) out[m[1]!] = m[2]!.trim().replace(/^"|"$/g, '')
    }
  }
  return out
}

export function llmConfig(env: Record<string, string | undefined> = process.env): LlmConfig | null {
  const file = envFile()
  const pick = (name: string) => file[name]?.trim() || env[name]?.trim() || ''
  const key = pick('OPENAI_API_KEY')
  const baseUrl = pick('OPENAI_BASE_URL').replace(/\/+$/, '')
  const model = pick('OPENAI_ANALYSIS_MODEL')
  return key && baseUrl && model ? { key, baseUrl, model } : null
}

export function sessionHeaders(baseUrl: string, session: string): Record<string, string> {
  return /^https:\/\/opencode\.ai\//.test(baseUrl) ? { 'x-opencode-session': session } : {}
}

export function createLlm(config: LlmConfig | null = llmConfig(), fetcher: typeof fetch = fetch): Llm {
  const session = `memeTaste-${Date.now()}`
  return async (messages, opts = {}) => {
    if (!config) throw Object.assign(new Error('OPENAI_API_KEY, OPENAI_BASE_URL and OPENAI_ANALYSIS_MODEL are needed in .env.local'), { code: 'llmNotConfigured' })
    const answer = await fetcher(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.key}`, 'Content-Type': 'application/json', ...sessionHeaders(config.baseUrl, session) },
      body: JSON.stringify({ model: config.model, messages, max_tokens: opts.maxTokens ?? 900, temperature: opts.temperature ?? 0.9 }),
    })
    const body = (await answer.json().catch(() => null)) as { choices?: { message?: { content?: string } }[]; error?: { message?: string } } | null
    if (!answer.ok) throw Object.assign(new Error(`the model answered HTTP ${answer.status}: ${body?.error?.message ?? ''}`), { code: 'llmFailed' })
    return body?.choices?.[0]?.message?.content ?? ''
  }
}

export function jsonIn(text: string): unknown {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(text)?.[1] ?? text
  const start = fenced.search(/[[{]/)
  if (start === -1) return null
  const open = fenced[start]
  const end = fenced.lastIndexOf(open === '{' ? '}' : ']')
  try {
    return JSON.parse(fenced.slice(start, end + 1))
  } catch {
    return null
  }
}
