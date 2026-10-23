import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { DOCUMENT_FIELDS, EXCHANGES_FILE } from '../types'
import type { StepExchange } from '../types'
import { exchangesOf } from './exchangesOf'

export function stepExchangesAt(folder: string, platform = 'facebook'): StepExchange[] {
  const kept = join(folder, EXCHANGES_FILE)
  try {
    if (existsSync(kept)) return JSON.parse(readFileSync(kept, 'utf8')) as StepExchange[]
    const har = join(folder, 'network.har')
    if (!existsSync(har)) return []
    const exchanges = exchangesOf(JSON.parse(readFileSync(har, 'utf8')), new Set(), DOCUMENT_FIELDS[platform] ?? [])
    writeFileSync(kept, `${JSON.stringify(exchanges, null, 2)}
`, { mode: 0o600 })
    return exchanges
  } catch {
    return []
  }
}
