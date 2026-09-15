import type { ConnectionPlatform } from '../connections/types'
import type { AccountIssue } from './types'

/**
 * The normalized issues a human can clear inside an embedded browser view:
 * a checkpoint, an interstitial challenge, or a false-success challenge
 * page the client cannot pass on its own. An explicit set, not fix-based —
 * `unknown` also carries fix `resolve` but has no challenge to show, and
 * `checkpointed` carries fix `login_in_browser` yet is exactly what the
 * resolver embeds.
 */
export const CHALLENGE_RESOLVABLE_ISSUES: ReadonlySet<AccountIssue> = new Set([
  'checkpointed',
  'challenge_interstitial',
  'captcha_html'
])

/** Mock browser view per platform, served same-origin from `public/`. */
const CHALLENGE_PAGES: Record<ConnectionPlatform, string> = {
  facebook: '/challenge/facebook.html',
  x: '/challenge/x.html',
  reddit: '/challenge/reddit.html'
}

export function challengePageFor(platform: ConnectionPlatform): string {
  return CHALLENGE_PAGES[platform]
}

/**
 * The `postMessage` type the mock challenge pages emit once the visitor
 * clears the challenge. The resolver only honors same-origin messages for
 * the open account's platform.
 */
export const CHALLENGE_SOLVED_MESSAGE = 'lk:challenge-solved'
