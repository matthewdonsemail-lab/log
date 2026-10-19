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
  /** The pinned Camoufox device, as stored (`camofox/device`). Never printed. */
  deviceProfile: unknown
  /** Local hours a run may happen in (null: 08:00-22:00, `marketplace/home`). */
  activeHoursStart: number | null
  activeHoursEnd: number | null
  /** localStorage per origin from the last run (Playwright storage_state origins). Never printed. */
  storageOrigins: unknown
  /** The name `log profile setup` gives the profile (rule 28). */
  profileName: string | null
  /** The profile picture `log profile setup` uploads: a URL or a local path (rule 28). */
  profilePhoto: string | null
  /** The cover (background) photo it uploads. */
  coverPhoto: string | null
  /** When `log profile setup --live` last saved both. */
  profileSetAt: string | null
  /** Rule 35, the lifecycle: where its machine has it, and the onboarding steps it has done. */
  lifecycleState: string | null
  profileNamedAt: string | null
  marketplaceLocationAt: string | null
  warmupStartedAt: string | null
  warmedAt: string | null
}

/** A proxy URL split for Playwright, plus the country it must exit in. */
export interface RunProxy {
  server: string
  username?: string
  password?: string
  country: string
}

export type RunnableCheck = { ok: true; proxy: RunProxy } | { ok: false; code: ErrorCode; detail: string }
