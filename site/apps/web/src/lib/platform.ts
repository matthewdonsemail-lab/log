/**
 * Canonical platform union — the single source of truth every mock domain
 * shares. Feed, connections, communities, keywords, analytics and messaging
 * all speak this exact set (`facebook | x | reddit`), so a platform string
 * from a connected account never 404s in another router.
 *
 * NOTE: X is always `x`, never `twitter`. The messaging mock previously used
 * `twitter` here and broke cross-domain joins — that alias is gone.
 */
export type Platform = 'facebook' | 'x' | 'reddit'

export const PLATFORMS: Platform[] = ['facebook', 'x', 'reddit']

/** Narrow an unknown query/route value into a Platform. */
export function isPlatform(value: unknown): value is Platform {
  return value === 'facebook' || value === 'x' || value === 'reddit'
}
