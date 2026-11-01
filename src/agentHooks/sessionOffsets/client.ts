import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Offsets, SessionOffsets } from './types'

export const SHARED_SESSION = 'shared'
const KEEP_MS = 3 * 24 * 3600 * 1000

export function sessionIdOf(raw: string): string {
  try {
    const id = (JSON.parse(raw || '{}') as { session_id?: string }).session_id
    return id ? id.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 80) || SHARED_SESSION : SHARED_SESSION
  } catch {
    return SHARED_SESSION
  }
}

const sessionsDir = (dir: string) => join(dir, '.hookSessions')
const sessionPath = (dir: string, session: string) => join(sessionsDir(dir), `${session}.json`)

export function readSessionOffsets(dir: string, session: string): SessionOffsets {
  const path = sessionPath(dir, session)
  if (!existsSync(path)) return { offsets: {}, firstLook: true }
  try {
    return { offsets: JSON.parse(readFileSync(path, 'utf8')) as Offsets, firstLook: false }
  } catch {
    return { offsets: {}, firstLook: true }
  }
}

export function writeSessionOffsets(dir: string, session: string, offsets: Offsets, now: number = Date.now()): void {
  mkdirSync(sessionsDir(dir), { recursive: true })
  writeFileSync(sessionPath(dir, session), JSON.stringify(offsets))
  for (const file of readdirSync(sessionsDir(dir))) {
    const path = join(sessionsDir(dir), file)
    try {
      if (now - statSync(path).mtimeMs > KEEP_MS) unlinkSync(path)
    } catch {}
  }
}
