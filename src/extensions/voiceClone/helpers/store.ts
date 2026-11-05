import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type { CloneStore, ProviderClone, VoiceProvider } from '../types'

export function voiceDir(): string {
  return process.env.LOG_VOICE_CLONE_DIR || join(homedir(), '.logCli', 'voice')
}

export function clonePath(): string {
  return join(voiceDir(), 'clone.json')
}

export function voiceNotesDir(): string {
  return process.env.LOG_VOICE_NOTES_DIR || join(homedir(), '.logCli', 'voiceNotes')
}

export function platformStateRoot(platform: string): string {
  return process.env.LOG_PLATFORM_STATE ? join(process.env.LOG_PLATFORM_STATE, platform) : join(homedir(), '.logCli', platform)
}

export function readClones(path = clonePath()): CloneStore {
  if (!existsSync(path)) return { clones: {} }
  try {
    const stored = JSON.parse(readFileSync(path, 'utf8')) as CloneStore
    return { clones: stored.clones ?? {} }
  } catch {
    return { clones: {} }
  }
}

export function readClone(provider: VoiceProvider, path = clonePath()): ProviderClone | null {
  const clone = readClones(path).clones[provider]
  return clone?.voiceId ? clone : null
}

export function writeClone(clone: ProviderClone, path = clonePath()): void {
  const store = readClones(path)
  store.clones[clone.provider] = clone
  mkdirSync(voiceDir(), { recursive: true })
  writeFileSync(path, JSON.stringify(store, null, 2))
}

export function stampOf(now: Date = new Date()): string {
  return now.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')
}
