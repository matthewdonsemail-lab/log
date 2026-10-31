import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { matchesFilter } from './memoryTwenty'
import type { LoginSecrets, TwentyClient, TwentyObject, TwentyObjects } from '../types'

type Row = Record<string, unknown> & { id: string }

const ACCOUNTS = 'socialAccounts'
export const LOCAL_ID_PREFIX = 'local:'

export function localAccountsPath(env: Record<string, string | undefined> = process.env): string {
  return env.LOG_LOCAL_ACCOUNTS || join(homedir(), '.logCli', 'localAccounts.json')
}

export function localOnly(env: Record<string, string | undefined> = process.env): boolean {
  return (env.LOG_ACCOUNTS ?? '').trim().toLowerCase() === 'local'
}

export function isLocalId(id: string): boolean {
  return id.startsWith(LOCAL_ID_PREFIX)
}

export function readLocalAccounts(path = localAccountsPath()): Row[] {
  if (!existsSync(path)) return []
  const parsed = JSON.parse(readFileSync(path, 'utf8')) as { socialAccounts?: Row[] }
  return Array.isArray(parsed.socialAccounts) ? parsed.socialAccounts : []
}

export function writeLocalAccounts(rows: Row[], path = localAccountsPath()): void {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify({ socialAccounts: rows }, null, 2), { mode: 0o600 })
}

export function upsertLocalAccount(fields: Record<string, unknown> & { accountName: string }, path = localAccountsPath()): Row {
  const rows = readLocalAccounts(path)
  const id = `${LOCAL_ID_PREFIX}${String(fields.platform ?? 'account').toLowerCase()}:${fields.accountName}`
  const held = rows.find((r) => r.id === id)
  const row: Row = { ...(held ?? { createdAt: new Date().toISOString() }), name: fields.accountName, ...fields, id }
  writeLocalAccounts([...rows.filter((r) => r.id !== id), row], path)
  return row
}

export function withLocalAccounts(remote: TwentyClient, env: Record<string, string | undefined> = process.env): TwentyClient {
  const path = localAccountsPath(env)
  const only = localOnly(env)
  const local = (filter?: unknown) => readLocalAccounts(path).filter((row) => matchesFilter(row, filter as Record<string, unknown> | undefined))
  return {
    async list<K extends TwentyObject>(object: K, filter?: TwentyObjects[K]['filter']) {
      if (object !== ACCOUNTS) return remote.list(object, filter)
      const mine = local(filter)
      if (only) return mine as unknown as TwentyObjects[K]['row'][]
      const names = new Set(mine.map((r) => `${r.platform}:${r.accountName}`))
      const theirs = (await remote.list(object, filter)) as unknown as Row[]
      return [...mine, ...theirs.filter((r) => !names.has(`${r.platform}:${r.accountName}`))] as unknown as TwentyObjects[K]['row'][]
    },
    async get<K extends TwentyObject>(object: K, id: string) {
      if (object !== ACCOUNTS) return remote.get(object, id)
      const row = readLocalAccounts(path).find((r) => r.id === id)
      if (row || only || isLocalId(id)) return (row ?? null) as unknown as TwentyObjects[K]['row'] | null
      return remote.get(object, id)
    },
    async create<K extends TwentyObject>(object: K, data: TwentyObjects[K]['create']) {
      if (object !== ACCOUNTS || !only) return remote.create(object, data)
      const fields = data as Record<string, unknown>
      return upsertLocalAccount({ ...fields, accountName: String(fields.accountName ?? fields.name ?? '') }, path) as unknown as TwentyObjects[K]['row']
    },
    async update<K extends TwentyObject>(object: K, id: string, data: TwentyObjects[K]['update']) {
      if (object !== ACCOUNTS || !isLocalId(id)) return remote.update(object, id, data)
      const rows = readLocalAccounts(path)
      const row = rows.find((r) => r.id === id)
      if (!row) throw new Error(`localAccounts: no socialAccount ${id} in ${path}`)
      Object.assign(row, data, { updatedAt: new Date().toISOString() })
      writeLocalAccounts(rows, path)
      return { ...row } as unknown as TwentyObjects[K]['row']
    },
    async loginSecrets(accountId: string): Promise<LoginSecrets | null> {
      if (!isLocalId(accountId)) return only ? null : remote.loginSecrets(accountId)
      const row = readLocalAccounts(path).find((r) => r.id === accountId)
      if (!row) return null
      const text = (value: unknown) => (typeof value === 'string' && value ? value : null)
      return { email: text(row.email), password: text(row.password), totpSecret: text(row.totpSecret), messengerPin: text(row.messengerPin) }
    }
  }
}
