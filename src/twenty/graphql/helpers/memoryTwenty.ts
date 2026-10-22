import type { LoginSecrets, TwentyClient, TwentyObject, TwentyObjects } from '../types'

type Row = Record<string, unknown> & { id: string }

/**
 * The subset of Twenty's GraphQL filter input log-cli uses:
 * `{ field: { eq | neq | in | is } }` and `{ and: [...] }`, `{ or: [...] }`.
 * Pure.
 */
export function matchesFilter(row: Row, filter: Record<string, unknown> | undefined | null): boolean {
  if (!filter) return true
  for (const [key, condition] of Object.entries(filter)) {
    if (key === 'and') {
      if (!(condition as Record<string, unknown>[]).every((f) => matchesFilter(row, f))) return false
      continue
    }
    if (key === 'or') {
      if (!(condition as Record<string, unknown>[]).some((f) => matchesFilter(row, f))) return false
      continue
    }
    const value = row[key]
    for (const [op, expected] of Object.entries(condition as Record<string, unknown>)) {
      if (op === 'eq' && !(value != null && String(value) === String(expected))) return false
      if (op === 'neq' && String(value) === String(expected)) return false
      if (op === 'in' && !(expected as unknown[]).map(String).includes(String(value))) return false
      if (op === 'is' && (expected === 'NULL' ? value != null : value == null)) return false
      if (!['eq', 'neq', 'in', 'is'].includes(op)) throw new Error(`memoryTwenty: unsupported filter op "${op}"`)
    }
  }
  return true
}

/**
 * An in-memory Twenty for tests: same interface as the live client, rows
 * keyed by object plural. `rows` is exposed so tests can seed and inspect.
 */
export function createMemoryTwenty(seed: Partial<Record<TwentyObject, Row[]>> = {}): TwentyClient & { rows: Record<string, Row[]> } {
  const rows: Record<string, Row[]> = Object.fromEntries(Object.entries(seed).map(([k, v]) => [k, (v ?? []).map((r) => ({ ...r }))]))
  let next = 1
  const table = (name: string) => (rows[name] ??= [])
  return {
    rows,
    async list<K extends TwentyObject>(object: K, filter?: TwentyObjects[K]['filter']) {
      return table(object)
        .filter((row) => matchesFilter(row, filter as Record<string, unknown> | undefined))
        .map((row) => ({ ...row })) as unknown as TwentyObjects[K]['row'][]
    },
    async get<K extends TwentyObject>(object: K, id: string) {
      const row = table(object).find((r) => r.id === id)
      return (row ? { ...row } : null) as unknown as TwentyObjects[K]['row'] | null
    },
    async create<K extends TwentyObject>(object: K, data: TwentyObjects[K]['create']) {
      const row: Row = { createdAt: new Date().toISOString(), ...(data as Record<string, unknown>), id: `mem${String(next++).padStart(4, '0')}` }
      table(object).push(row)
      return { ...row } as unknown as TwentyObjects[K]['row']
    },
    async update<K extends TwentyObject>(object: K, id: string, data: TwentyObjects[K]['update']) {
      const row = table(object).find((r) => r.id === id)
      if (!row) throw new Error(`memoryTwenty: no ${object} ${id}`)
      Object.assign(row, data)
      return { ...row } as unknown as TwentyObjects[K]['row']
    },
    async loginSecrets(accountId: string): Promise<LoginSecrets | null> {
      const row = table('socialAccounts').find((r) => r.id === accountId)
      if (!row) return null
      const text = (value: unknown) => (typeof value === 'string' && value ? value : null)
      return { email: text(row.email), password: text(row.password), totpSecret: text(row.totpSecret), messengerPin: text(row.messengerPin) }
    }
  }
}
