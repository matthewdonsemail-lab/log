import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { PASS_REUSE_MS, PASSES_KEPT } from './types'
import type { VoicePass } from './types'

export function passesPath(): string {
  return join(process.env.LOG_INBOX_STATE || join(homedir(), '.logCli', 'inbox'), 'voicePasses.json')
}

export function passKey(text: string): string {
  return createHash('sha256').update(text.replace(/\s+/g, ' ').trim().toLowerCase()).digest('hex').slice(0, 24)
}

function readPasses(): VoicePass[] {
  try {
    return JSON.parse(readFileSync(passesPath(), 'utf8')) as VoicePass[]
  } catch {
    return []
  }
}

export function recordPass(text: string, to: string, voice: number, now: Date = new Date()): void {
  const key = passKey(text)
  const kept = [...readPasses().filter((p) => p.key !== key), { key, to, at: now.toISOString(), voice }].slice(-PASSES_KEPT)
  mkdirSync(dirname(passesPath()), { recursive: true })
  writeFileSync(passesPath(), JSON.stringify(kept))
}

export function recentPass(text: string, now: Date = new Date(), withinMs: number = PASS_REUSE_MS): VoicePass | null {
  const key = passKey(text)
  const found = readPasses().find((p) => p.key === key)
  return found && now.getTime() - Date.parse(found.at) <= withinMs ? found : null
}
