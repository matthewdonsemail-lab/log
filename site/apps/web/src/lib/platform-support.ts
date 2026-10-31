import { keywordsOnConvex } from './live-keywords'
import type { Platform } from './platform'

/** Platforms that have a working source today. Reddit is read by the server; X and Facebook are read by a helper on the person's own computer. */
export const LIVE_PLATFORMS: readonly Platform[] = ['reddit', 'x', 'facebook']

/** Where the last onboarding button lands: the question "what should we listen for?" when live. */
export function landingPath(): string {
  return keywordsOnConvex() ? '/dashboard/keywords' : '/dashboard'
}
