import { existsSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fbkStateRoot, platformStateRoot, twitterStateRoot } from '../engine/client'
import { withLedger, writeLedger } from '../../storage/ledger/index'
import { defaultDbPath } from '../../storage/schema/client'
import { GOVERNOR_FILE } from './types'
import type { GovernorCount, GovernorResetRequest, GovernorResetResult, GovernorState } from './types'

export function governorRoot(platform: string): string {
  if (platform === 'facebook') return fbkStateRoot()
  if (platform === 'twitter') return twitterStateRoot()
  return platformStateRoot(platform)
}

export function governorPath(platform: string, account: string): string {
  return join(governorRoot(platform), account, GOVERNOR_FILE)
}

function readState(path: string): GovernorState | null {
  if (!existsSync(path)) return null
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as GovernorState
  } catch {
    return null
  }
}

export function countOf(platform: string, account: string, now: Date = new Date()): GovernorCount | null {
  const path = governorPath(platform, account)
  const state = readState(path)
  if (!state) return null
  const cooldown = typeof state.cooldown_until === 'number' ? Math.max(0, Math.round(state.cooldown_until - now.getTime() / 1000)) : 0
  return { platform, account, day: state.day ?? null, requests: state.day_count ?? 0, writes: state.mutation_count ?? 0, hourRequests: state.hour_count ?? 0, cooldownSeconds: cooldown, path }
}

export function governorAccounts(platform: string): string[] {
  const root = governorRoot(platform)
  if (!existsSync(root)) return []
  return readdirSync(root).filter((name) => existsSync(join(root, name, GOVERNOR_FILE))).sort()
}

export function governorCounts(platforms: readonly string[], now: Date = new Date()): GovernorCount[] {
  return platforms.flatMap((p) => governorAccounts(p).map((a) => countOf(p, a, now)).filter((c): c is GovernorCount => c !== null))
}

export function resetGovernor(request: GovernorResetRequest, now: Date = new Date(), dbPath: string = defaultDbPath()): GovernorResetResult {
  const path = governorPath(request.platform, request.account)
  const state = readState(path)
  if (!state) throw new Error(`no governor count for ${request.platform} ${request.account} (${path})`)
  const before = countOf(request.platform, request.account, now) as GovernorCount
  const next: GovernorState = { ...state, day_count: 0, hour_count: 0, mutation_count: 0 }
  const tmp = `${path}.${process.pid}.tmp`
  writeFileSync(tmp, JSON.stringify(next))
  renameSync(tmp, path)
  const after = countOf(request.platform, request.account, now) as GovernorCount
  if (after.requests !== 0 || after.writes !== 0 || after.hourRequests !== 0) throw new Error(`the reset of ${request.platform} ${request.account} didn't hold: ${after.requests} requests, ${after.writes} writes`)
  const ledgerSeq = withLedger(dbPath, (handle) => {
    writeLedger(handle, { kind: 'governorReset', at: now.toISOString(), platform: request.platform, account: request.account, subject: request.by, amount: before.requests, unit: 'requests', outcome: 'reset', detail: [`requests ${before.requests} → 0, writes ${before.writes} → 0`, request.reason].filter(Boolean).join('; ') })
    return (handle.prepare('SELECT last_insert_rowid() AS seq').get() as { seq: number }).seq
  })
  return { platform: request.platform, account: request.account, before, after, ledgerSeq, cooldownKept: before.cooldownSeconds > 0 }
}
