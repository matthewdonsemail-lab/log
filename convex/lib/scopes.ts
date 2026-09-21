/**
 * What an API key may do. Every key can read. Writing phrases and managing webhooks are separate scopes that a
 * person ticks on purpose when making the key; a key made before scopes existed keeps only `read`.
 */

export const SCOPES = ['read', 'write:phrases', 'webhooks'] as const
export type Scope = typeof SCOPES[number]

export const SCOPE_DESCRIPTIONS: Record<Scope, string> = {
  read: 'Read your plan, phrases and matches',
  'write:phrases': 'Add, pause, resume and remove phrases',
  webhooks: 'Manage webhook subscriptions (a Pro feature)',
}

/** The scopes a key ends up with: only known ones, no repeats, always including read, in a fixed order. */
export function normalizeScopes(input: readonly string[] | undefined): Scope[] {
  const wanted = new Set(input ?? [])
  return SCOPES.filter(scope => scope === 'read' || wanted.has(scope))
}

export function hasScope(scopes: readonly string[], needed: Scope): boolean {
  return normalizeScopes(scopes).includes(needed)
}

export function scopesOf(row: { scopes?: string[] }): Scope[] {
  return normalizeScopes(row.scopes)
}
