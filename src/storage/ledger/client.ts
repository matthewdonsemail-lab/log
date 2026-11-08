import type { Database } from 'bun:sqlite'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { defaultDbPath, useDatabase } from '../schema/client'
import { msOf } from '../platform/helpers/time'
import { BACKFILL_BATCH, inBatches } from '../schema/helpers/backfill'
import { fromOldLine } from './helpers'
import { OLD_LEDGER_FILES } from './types'
import type { LedgerEntry, LedgerFilter, LedgerKind, LedgerRow } from './types'

export function writeLedger(handle: Database, entry: LedgerEntry): void {
  handle.prepare('INSERT INTO ledger (kind, provider, platform, account, subject, at, atMs, amount, unit, outcome, code, detail) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(entry.kind, entry.provider ?? null, entry.platform ?? null, entry.account ?? null, entry.subject ?? null, entry.at, msOf(entry.at), entry.amount ?? null, entry.unit ?? null, entry.outcome, entry.code ?? null, entry.detail ?? null)
}

const imported = new Set<string>()

export function homeDbPath(home: string = homedir()): string {
  return join(home, '.logCli', 'log.db')
}

export function withLedger<T>(path: string, work: (handle: Database) => T): T {
  return useDatabase(path, (handle) => {
    if (!imported.has(path)) {
      imported.add(path)
      if (path === homeDbPath()) importOldLedgers(handle)
    }
    return work(handle)
  })
}

export function appendLedger(entry: LedgerEntry, path: string = defaultDbPath()): void {
  withLedger(path, (handle) => writeLedger(handle, entry))
}

export function ledgerRows(kind: LedgerKind, filter: LedgerFilter = {}, path: string = defaultDbPath()): LedgerRow[] {
  const where = ['kind = ?']
  const args: (string | number)[] = [kind]
  if (filter.account !== undefined) {
    where.push('account = ?')
    args.push(filter.account)
  }
  if (filter.provider !== undefined) {
    where.push('provider = ?')
    args.push(filter.provider)
  }
  if (filter.since !== undefined) {
    where.push('at >= ?')
    args.push(filter.since)
  }
  const limit = filter.limit ? ` LIMIT ${Math.max(1, Math.floor(filter.limit))}` : ''
  const order = filter.limit ? 'ORDER BY seq DESC' : 'ORDER BY seq'
  const rows = withLedger(path, (handle) => handle.prepare(`SELECT * FROM ledger WHERE ${where.join(' AND ')} ${order}${limit}`).all(...args) as LedgerRow[])
  return filter.limit ? rows.reverse() : rows
}

export function importOldLedgers(handle: Database, env: Record<string, string | undefined> = process.env, home: string = homedir()): { store: string; rows: number }[] {
  const done: { store: string; rows: number }[] = []
  const now = new Date().toISOString()
  for (const file of OLD_LEDGER_FILES) {
    const already = handle.prepare('SELECT state, rows FROM imports WHERE store = ?').get(file.store) as { state: string; rows: number } | null
    if (already?.state === 'done') continue
    const path = env[file.env]?.trim() || join(home, '.logCli', ...file.homePath)
    const lines = existsSync(path) ? readFileSync(path, 'utf8').split(/\r?\n/) : []
    const resumeAt = already?.state === 'importing' ? already.rows : 0
    const mark = handle.prepare("INSERT INTO imports (store, state, files, rows, detail, startedAt, endedAt) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(store) DO UPDATE SET state = excluded.state, files = excluded.files, rows = excluded.rows, detail = excluded.detail, endedAt = excluded.endedAt")
    let rows = 0
    inBatches(handle, lines.slice(resumeAt), BACKFILL_BATCH, (batch, offset) => {
      for (const line of batch) {
        if (!line.trim()) continue
        try {
          const entry = fromOldLine(file.store, JSON.parse(line) as Record<string, unknown>)
          if (entry) {
            writeLedger(handle, entry)
            rows++
          }
        } catch {}
      }
      mark.run(file.store, 'importing', 1, resumeAt + offset + batch.length, path, now, null)
    })
    mark.run(file.store, 'done', existsSync(path) ? 1 : 0, lines.length, path, now, new Date().toISOString())
    done.push({ store: file.store, rows })
  }
  return done
}
