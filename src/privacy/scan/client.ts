import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { EMPTY_ALLOWLIST } from './index.ts'
import type { PrivacyAllowlist } from './types.ts'

export function denylistPath(env: Record<string, string | undefined> = process.env): string {
  return env.LOG_PRIVACY_DENYLIST || join(homedir(), '.logCli', 'privacy', 'denylist.txt')
}

export function parseDenylist(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
}

export function loadDenylist(env: Record<string, string | undefined> = process.env): string[] {
  const path = denylistPath(env)
  if (!existsSync(path)) return []
  try {
    return parseDenylist(readFileSync(path, 'utf8'))
  } catch {
    return []
  }
}

export function loadAllowlist(path: string): PrivacyAllowlist {
  if (!existsSync(path)) return EMPTY_ALLOWLIST
  const parsed = JSON.parse(readFileSync(path, 'utf8')) as Partial<PrivacyAllowlist>
  return { emails: parsed.emails ?? [], findings: parsed.findings ?? [] }
}
