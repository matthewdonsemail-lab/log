import type { Database } from 'bun:sqlite'
import type { Migration } from '../types'
import { INBOX_TABLES } from './inbox'
import { PLATFORM_TABLES } from './platformTables'

function hasColumn(handle: Database, table: string, column: string): boolean {
  return (handle.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]).some((c) => c.name === column)
}

export const MIGRATIONS: readonly Migration[] = [
  {
    version: 1,
    name: 'inboxBaseline',
    apply(handle) {
      for (const statement of INBOX_TABLES) handle.exec(statement)
      if (!hasColumn(handle, 'events', 'source')) handle.exec(`ALTER TABLE events ADD COLUMN source TEXT NOT NULL DEFAULT 'live'`)
    },
  },
  {
    version: 2,
    name: 'platformTables',
    apply(handle) {
      for (const statement of PLATFORM_TABLES) handle.exec(statement)
    },
  },
]

export const SCHEMA_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version
