import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { savedCredential } from '../../../auth/credentials'
export function subqKeyFile(home = homedir()): string {
  return join(home, '.config', 'listeningkit', 'subq-api-key.txt')
}

export function subqKey(env: Record<string, string | undefined> = process.env, keyFile = subqKeyFile()): string | null {
  const saved = savedCredential('SUBQ_API_KEY', env)
  if (saved) return saved
  if (env.SUBQ_API_KEY) return env.SUBQ_API_KEY
  if (existsSync(keyFile)) {
    const text = readFileSync(keyFile, 'utf8')
    const named = /^\s*SUBQ_API_KEY\s*=\s*(.*)$/m.exec(text)?.[1]?.trim().replace(/^"|"$/g, '')
    const fromFile = named ?? (text.includes('=') ? '' : text.trim())
    if (fromFile) return fromFile
  }
  const repo = resolve(fileURLToPath(new URL('../../../..', import.meta.url)))
  for (const file of [join(repo, '.env.local'), join(repo, '..', '..', '.env.local')]) {
    if (!existsSync(file)) continue
    const match = /^SUBQ_API_KEY=(.*)$/m.exec(readFileSync(file, 'utf8'))
    if (match?.[1]?.trim()) return match[1].trim().replace(/^"|"$/g, '')
  }
  return null
}


