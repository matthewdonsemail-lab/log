import type { Database } from 'bun:sqlite'
import type { IdentityInfo, IdentityRef } from '../types'

export const keyOf = (i: IdentityRef): string => `${i.platform}:${i.userId}`

export function infoOf(handle: Database, ref: IdentityRef): IdentityInfo {
  const row = handle.prepare('SELECT handle, displayName FROM identities WHERE platform = ? AND userId = ?').get(ref.platform, ref.userId) as { handle: string | null; displayName: string | null } | null
  const link = handle.prepare('SELECT personId FROM identityLinks WHERE platform = ? AND userId = ? AND revokedAt IS NULL').get(ref.platform, ref.userId) as { personId: string } | null
  const account = handle.prepare('SELECT account FROM accounts WHERE platform = ? AND userId = ?').get(ref.platform, ref.userId) as { account: string } | null
  return { platform: ref.platform, userId: ref.userId, handle: row?.handle?.replace(/^@/, '') ?? (ref.userId.startsWith('@') ? ref.userId.slice(1) : null), name: row?.displayName ?? null, personId: link?.personId ?? null, runByLogAs: account?.account ?? null }
}

export function identitySpec(spec: string): { platform: string | null; who: string } {
  const text = spec.trim()
  const colon = text.indexOf(':')
  return { platform: colon > 0 ? text.slice(0, colon).toLowerCase() : null, who: (colon > 0 ? text.slice(colon + 1) : text).trim() }
}

export function identitiesNamed(handle: Database, spec: string): IdentityRef[] {
  const { platform, who } = identitySpec(spec)
  const bare = who.replace(/^@/, '').toLowerCase()
  if (!bare) return []
  const onPlatform = platform ? ' AND platform = ?' : ''
  const args = platform ? [platform] : []
  if (!who.startsWith('@') && /^\d{5,}$/.test(who)) return handle.prepare(`SELECT platform, userId FROM identities WHERE userId = ?${onPlatform}`).all(who, ...args) as IdentityRef[]
  return handle.prepare(`SELECT platform, userId FROM identities WHERE (lower(handle) = ? OR lower(userId) = ?)${onPlatform} ORDER BY CASE WHEN userId LIKE '@%' THEN 1 ELSE 0 END`).all(bare, `@${bare}`, ...args) as IdentityRef[]
}
