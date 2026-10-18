/**
 * A Facebook account, as Twenty's `socialAccounts` object holds it (the same
 * object the twitter-controller reads; log-cli only adds fields, see
 * `scripts/twentySetup.mjs`). Twenty spells SELECT values in UPPER_SNAKE;
 * log-cli is camelCase (rule 1), converted once in `client.ts`.
 */
import type { ErrorCode } from '../../errors/catalog/index'
import type { SocialAccount } from '../../twenty/graphql/generated/index'
import type { SOCIAL_ACCOUNT_FIELDS } from '../../twenty/graphql/client'

export const ACCOUNT_STATUSES = [
  'active',
  'warming',
  'limited',
  'paused',
  'needsLogin',
  'checkpoint',
  'restricted',
  'banned',
  'dead'
] as const

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number]

/**
 * What a run needs from the account. `connect` is a person signing in to fix
 * it; `check` only tests the proxy (no browser), so any status may do it.
 */
export type RunPurpose = 'run' | 'connect' | 'check'

/** Statuses each purpose may run with. Anything else, or no status, is refused (`accountNotUsable`). */
export const USABLE_STATUSES: Record<RunPurpose, readonly AccountStatus[]> = {
  run: ['active', 'warming'],
  connect: ['active', 'warming', 'needsLogin', 'checkpoint'],
  check: ACCOUNT_STATUSES
}

/** Statuses that lose the account's campaign listings to replacement accounts. */
export const LOSING_STATUSES: readonly AccountStatus[] = ['restricted', 'banned', 'dead']

/** Never cleared automatically: a person decided, or Facebook disabled it. */
export const TERMINAL_STATUSES: readonly AccountStatus[] = ['banned', 'dead']

export const DEFAULT_DAILY_LISTING_CAP = 3

/** The row as the generated Twenty client returns it (only the fields log-cli selects). */
export type SocialAccountRow = Pick<SocialAccount, keyof typeof SOCIAL_ACCOUNT_FIELDS>

export interface FacebookAccount {
  id: string
  /** The handle `--account` takes (accountName, else the record id). */
  accountName: string
  label: string
  platform: string | null
  /** The proxy URL as stored. Never printed: `maskProxyUrl` for display. */
  proxy: string | null
  cookies: unknown
  homeCity: string | null
  homeCountry: string | null
  status: AccountStatus | null
  statusReason: string | null
  statusDetail: string | null
  proxyCheckedAt: string | null
  proxyExitIp: string | null
  proxyExitCountry: string | null
  dailyListingCap: number
  lastPostedAt: string | null
  vendor: string | null
}

/** A proxy URL split for Playwright, plus the country it must exit in. */
export interface RunProxy {
  server: string
  username?: string
  password?: string
  country: string
}

export type RunnableCheck = { ok: true; proxy: RunProxy } | { ok: false; code: ErrorCode; detail: string }
