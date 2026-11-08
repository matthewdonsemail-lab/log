import type { Database } from 'bun:sqlite'

export interface Migration {
  version: number
  name: string
  apply(handle: Database): void
}

export class SchemaTooNewError extends Error {
  readonly code = 'schemaTooNew'
  constructor(readonly found: number, readonly expected: number, readonly needs: number = found) {
    super(`log.db is at schema version ${found} and needs code that reads version ${needs} or later, newer than this code's ${expected}: update log before opening it, nothing was changed (schemaTooNew)`)
  }
}

export interface AppliedMigration {
  version: number
  name: string
  appliedAt: string
}
