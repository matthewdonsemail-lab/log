import type { Database } from 'bun:sqlite'
import { MIGRATIONS, SCHEMA_VERSION } from './helpers'
import { SchemaTooNewError } from './types'
import type { AppliedMigration } from './types'

export function schemaVersionOf(handle: Database): number {
  return (handle.prepare('PRAGMA user_version').get() as { user_version: number }).user_version
}

export function migrate(handle: Database, now: Date = new Date()): AppliedMigration[] {
  const found = schemaVersionOf(handle)
  if (found > SCHEMA_VERSION) throw new SchemaTooNewError(found, SCHEMA_VERSION)
  const applied: AppliedMigration[] = []
  for (const migration of MIGRATIONS) {
    if (migration.version <= found) continue
    handle.exec('BEGIN IMMEDIATE')
    try {
      if (schemaVersionOf(handle) >= migration.version) {
        handle.exec('COMMIT')
        continue
      }
      migration.apply(handle)
      handle.exec(`PRAGMA user_version = ${migration.version}`)
      handle.exec('COMMIT')
      applied.push({ version: migration.version, name: migration.name, appliedAt: now.toISOString() })
    } catch (error) {
      handle.exec('ROLLBACK')
      throw error
    }
  }
  return applied
}
