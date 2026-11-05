import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { db } from '../../../inbox/store/index'
import { conversationsRoot } from '../../../search/conversations/index'
import { SHORTEST_CLIP } from '../types'
import type { CloneLimits, Recording } from '../types'
import { secondsOf } from './audio'
import { platformStateRoot } from './store'

export const OWN_RECORDING_NAMES: Readonly<Record<string, RegExp>> = {
  discord: /^(\d+)_voice-message\.ogg$/,
  instagram: /^voice_(\d+)\.m4a$/,
}

const dirsIn = (path: string): string[] => (existsSync(path) ? readdirSync(path).filter((name) => statSync(join(path, name)).isDirectory()) : [])

export function recordingFiles(platforms: readonly string[] = Object.keys(OWN_RECORDING_NAMES)): Omit<Recording, 'seconds'>[] {
  const found: Omit<Recording, 'seconds'>[] = []
  for (const platform of platforms) {
    const pattern = OWN_RECORDING_NAMES[platform]
    const root = platformStateRoot(platform)
    for (const account of dirsIn(root)) {
      const mediaRoot = join(root, account, 'media')
      for (const conversationId of dirsIn(mediaRoot)) {
        for (const name of readdirSync(join(mediaRoot, conversationId))) {
          const messageId = pattern.exec(name)?.[1]
          if (messageId) found.push({ path: join(mediaRoot, conversationId, name), platform, account, conversationId, messageId })
        }
      }
    }
  }
  return found
}

export function sentByMatt(recording: Pick<Recording, 'platform' | 'account' | 'conversationId' | 'messageId'>): boolean {
  const file = join(conversationsRoot(), recording.platform, recording.account, `${recording.conversationId}.json`)
  if (existsSync(file)) {
    try {
      const stored = JSON.parse(readFileSync(file, 'utf8')) as { messages?: { id?: unknown; fromMe?: unknown }[] }
      const message = (stored.messages ?? []).find((m) => String(m.id) === recording.messageId)
      if (message) return message.fromMe === true
    } catch {}
  }
  const row = db().query(`SELECT 1 FROM events WHERE platform = ? AND account = ? AND type = 'ownMessage' AND json_extract(payload, '$.id') = ? LIMIT 1`).get(recording.platform, recording.account, recording.messageId)
  return !!row
}

export function pickReferences(recordings: readonly Recording[], limits: CloneLimits): Recording[] {
  const most = limits.most
  const usable = recordings.filter((r) => r.seconds >= SHORTEST_CLIP && r.seconds <= most).sort((a, b) => a.seconds - b.seconds || a.path.localeCompare(b.path))
  const picked: Recording[] = []
  let total = 0
  for (const r of usable) {
    if (total + r.seconds > most) continue
    picked.push(r)
    total += r.seconds
  }
  return picked
}

export function mattsRecordings(deps: { files?: () => Omit<Recording, 'seconds'>[]; mine?: (r: Omit<Recording, 'seconds'>) => boolean; seconds?: (path: string) => number | null } = {}): Recording[] {
  const files = (deps.files ?? recordingFiles)()
  const mine = deps.mine ?? sentByMatt
  const seconds = deps.seconds ?? ((path: string) => secondsOf(path))
  const kept: Recording[] = []
  for (const file of files) {
    if (!mine(file)) continue
    const s = seconds(file.path)
    if (s) kept.push({ ...file, seconds: Math.round(s * 100) / 100 })
  }
  return kept
}
