import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DEFAULT_PROVIDER, PROVIDER_ENV, VOICE_PROVIDERS } from '../types'
import type { VoiceProvider } from '../types'

export function envValue(name: string, env: Record<string, string | undefined> = process.env, home = homedir()): string | null {
  if (env[name]?.trim()) return env[name]!.trim()
  const repo = resolve(fileURLToPath(new URL('../../../..', import.meta.url)))
  for (const file of [join(repo, '.env.local'), join(repo, '..', '..', '.env.local'), join(home, '.buzz', '.env.local')]) {
    if (!existsSync(file)) continue
    const found = new RegExp(`^\\s*${name}\\s*=\\s*(.*)$`, 'm').exec(readFileSync(file, 'utf8'))?.[1]?.trim().replace(/^["']|["']$/g, '')
    if (found) return found
  }
  return null
}

export type ProviderChoice = { ok: true; provider: VoiceProvider; from: string } | { ok: false; detail: string }

export function providerOf(said: unknown, env: Record<string, string | undefined> = process.env): ProviderChoice {
  const given = typeof said === 'string' && said.trim() ? { value: said.trim(), from: '--provider' } : null
  const configured = given ?? (() => {
    const value = envValue(PROVIDER_ENV, env)
    return value ? { value, from: PROVIDER_ENV } : null
  })()
  const chosen = configured ?? { value: DEFAULT_PROVIDER, from: 'the default' }
  if (!(VOICE_PROVIDERS as readonly string[]).includes(chosen.value)) return { ok: false, detail: `${chosen.from} names ${chosen.value}: the voice providers are ${VOICE_PROVIDERS.join(', ')}` }
  return { ok: true, provider: chosen.value as VoiceProvider, from: chosen.from }
}
