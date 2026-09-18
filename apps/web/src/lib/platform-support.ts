import { keywordsOnConvex } from './live-keywords'
import type { Platform } from './platform'

/** Platforms whose posts are collected on the live backend today. Add X and Facebook as their connectors ship. */
export const LIVE_PLATFORMS: readonly Platform[] = ['reddit']

/** Where the last onboarding button lands: the question "what should we listen for?" when live. */
export function landingPath(): string {
  return keywordsOnConvex() ? '/dashboard/keywords' : '/dashboard'
}
