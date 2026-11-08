import { homedir } from 'node:os'
import { join } from 'node:path'
import { deleteState, getState, putState } from '../../../storage/state/index'
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
  const stored = getState<CloneStore>('voiceClone', path, { legacyFile: path })?.body
  return { clones: stored?.clones ?? {} }
}

export function readClone(provider: VoiceProvider, path = clonePath()): ProviderClone | null {
  const clone = readClones(path).clones[provider]
  return clone?.voiceId ? clone : null
}

export function writeClone(clone: ProviderClone, path = clonePath()): void {
  const store = readClones(path)
  store.clones[clone.provider] = clone
  putState('voiceClone', path, store)
}

export function forgetClones(path = clonePath()): void {
  deleteState('voiceClone', path)
}

export function stampOf(now: Date = new Date()): string {
  return now.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')
}

export function replacedClone(made: ProviderClone, existing: ProviderClone | null): ProviderClone {
  if (!existing) return made
  const { previous, ...older } = existing
  return { ...made, previous: [older, ...(previous ?? [])] }
}
