import type { Database } from 'bun:sqlite'

export interface Migration {
  version: number
  name: string
  apply(handle: Database): void
}

export class SchemaTooNewError extends Error {
  readonly code = 'schemaTooNew'
  constructor(readonly found: number, readonly expected: number) {
    super(`log.db is at schema version ${found}, newer than this code's ${expected}: update log before opening it, nothing was changed (schemaTooNew)`)
  }
}

export interface AppliedMigration {
  version: number
  name: string
  appliedAt: string
}
