import { existsSync, readFileSync } from 'node:fs'

export function readLocalAccountRows(path: string): (Record<string, unknown> & { id: string })[] {
  if (!existsSync(path)) return []
  const parsed = JSON.parse(readFileSync(path, 'utf8')) as { socialAccounts?: (Record<string, unknown> & { id: string })[] }
  return Array.isArray(parsed.socialAccounts) ? parsed.socialAccounts : []
}
