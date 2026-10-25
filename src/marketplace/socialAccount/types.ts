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
  'dead',
  'deactivated'
] as const

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number]

export type RunPurpose = 'run' | 'connect' | 'check'

export const USABLE_STATUSES: Record<RunPurpose, readonly AccountStatus[]> = {
  run: ['active', 'warming'],
  connect: ['active', 'warming', 'needsLogin', 'checkpoint'],
  check: ACCOUNT_STATUSES
}

export const LOSING_STATUSES: readonly AccountStatus[] = ['checkpoint', 'restricted', 'banned', 'dead', 'deactivated']

export const BLOCKING_REASONS: readonly string[] = ['wrongPassword']

export function accountBlocked(status: AccountStatus | null, reason: string | null): boolean {
  return (status !== null && LOSING_STATUSES.includes(status)) || (reason !== null && BLOCKING_REASONS.includes(reason))
}

export const TERMINAL_STATUSES: readonly AccountStatus[] = ['banned', 'dead']

export const DEFAULT_DAILY_LISTING_CAP = 3

export type SocialAccountRow = Pick<SocialAccount, keyof typeof SOCIAL_ACCOUNT_FIELDS>

export interface FacebookAccount {
  id: string
  accountName: string
  label: string
  platform: string | null
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
  deviceProfile: unknown
  activeHoursStart: number | null
  activeHoursEnd: number | null
  storageOrigins: unknown
  profileName: string | null
  profilePhoto: string | null
  coverPhoto: string | null
  profileSetAt: string | null
  lifecycleState: string | null
  sessionState: string | null
  sessionCheckedAt: string | null
  profileNamedAt: string | null
  marketplaceLocationAt: string | null
  warmupStartedAt: string | null
  warmedAt: string | null
  adsPowerProfileId: string | null
  browserDriver: string | null
}

export interface RunProxy {
  server: string
  username?: string
  password?: string
  country: string
}

export type RunnableCheck = { ok: true; proxy: RunProxy } | { ok: false; code: ErrorCode; detail: string }
