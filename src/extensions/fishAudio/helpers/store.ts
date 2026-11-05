import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type { VoiceClone } from '../types'

export function voiceDir(): string {
  return process.env.LOG_VOICE_CLONE_DIR || join(homedir(), '.logCli', 'voice')
}

export function clonePath(): string {
  return join(voiceDir(), 'fishClone.json')
}

export function voiceNotesDir(): string {
  return process.env.LOG_VOICE_NOTES_DIR || join(homedir(), '.logCli', 'voiceNotes')
}

export function platformStateRoot(platform: string): string {
  return process.env.LOG_PLATFORM_STATE ? join(process.env.LOG_PLATFORM_STATE, platform) : join(homedir(), '.logCli', platform)
}

export function readClone(path = clonePath()): VoiceClone | null {
  if (!existsSync(path)) return null
  try {
    const clone = JSON.parse(readFileSync(path, 'utf8')) as VoiceClone
    return clone.modelId ? clone : null
  } catch {
    return null
  }
}

export function writeClone(clone: VoiceClone, path = clonePath()): void {
  mkdirSync(voiceDir(), { recursive: true })
  writeFileSync(path, JSON.stringify(clone, null, 2))
}

export function stampOf(now: Date = new Date()): string {
  return now.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')
}
