import { hasStoredDevice } from '../../camofox/device/index'
import type { DeviceProfile } from '../../camofox/device/index'
import { TwentyError } from '../../twenty/graphql/index'
import type { TwentyClient, TwentyObjects } from '../../twenty/graphql/index'
import { fromTwentyEnum, hasFacebookSession, toTwentyEnum } from './helpers/index'
import { ACCOUNT_STATUSES, DEFAULT_DAILY_LISTING_CAP } from './types'
import type { AccountStatus, FacebookAccount, SocialAccountRow } from './types'
import type { PlaywrightCookie } from './helpers/index'

export const SOCIAL_ACCOUNTS = 'socialAccounts' as const

type AccountUpdate = TwentyObjects['socialAccounts']['update']

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function toFacebookAccount(row: SocialAccountRow): FacebookAccount {
  const status = row.accountStatus ? fromTwentyEnum(row.accountStatus) : null
  return {
    id: row.id,
    accountName: row.accountName?.trim() || row.id,
    label: row.name?.trim() || row.accountName?.trim() || row.id,
    platform: row.platform ?? null,
    proxy: row.proxy?.trim() || null,
    cookies: row.cookies ?? null,
    homeCity: row.homeCity?.trim() || null,
    homeCountry: row.homeCountry?.trim().toUpperCase() || null,
    status: status && (ACCOUNT_STATUSES as readonly string[]).includes(status) ? (status as AccountStatus) : null,
    statusReason: row.statusReason ?? null,
    statusDetail: row.statusDetail ?? null,
    proxyCheckedAt: row.proxyCheckedAt ?? null,
    proxyExitIp: row.proxyExitIp ?? null,
    proxyExitCountry: row.proxyExitCountry ?? null,
    dailyListingCap: typeof row.dailyListingCap === 'number' && row.dailyListingCap > 0 ? row.dailyListingCap : DEFAULT_DAILY_LISTING_CAP,
    lastPostedAt: row.lastPostedAt ?? null,
    vendor: row.vendor ?? null,
    deviceProfile: row.deviceProfile ?? null,
    activeHoursStart: typeof row.activeHoursStart === 'number' ? row.activeHoursStart : null,
    activeHoursEnd: typeof row.activeHoursEnd === 'number' ? row.activeHoursEnd : null,
    storageOrigins: row.storageOrigins ?? null,
    profileName: row.profileName?.trim() || null,
    profilePhoto: row.profilePhoto?.trim() || null,
    coverPhoto: row.coverPhoto?.trim() || null,
    profileSetAt: row.profileSetAt ?? null,
    lifecycleState: row.lifecycleState ?? null,
    sessionState: row.sessionState ?? null,
    sessionCheckedAt: row.sessionCheckedAt ?? null,
    profileNamedAt: row.profileNamedAt ?? null,
    marketplaceLocationAt: row.marketplaceLocationAt ?? null,
    warmupStartedAt: row.warmupStartedAt ?? null,
    warmedAt: row.warmedAt ?? null,
    adsPowerProfileId: row.adsPowerProfileId?.trim() || null,
    browserDriver: row.browserDriver?.trim() || null
  }
}

export async function listFacebookAccounts(twenty: TwentyClient): Promise<FacebookAccount[]> {
  const rows = await twenty.list(SOCIAL_ACCOUNTS, { platform: { eq: 'FACEBOOK' } })
  return rows.map(toFacebookAccount).sort((a, b) => a.accountName.localeCompare(b.accountName))
}

export async function findAccount(twenty: TwentyClient, ref: string): Promise<FacebookAccount> {
  const key = ref.trim().replace(/^@/, '')
  if (UUID.test(key)) {
    const row = await twenty.get(SOCIAL_ACCOUNTS, key)
    if (row) return toFacebookAccount(row)
  }
  const rows = await twenty.list(SOCIAL_ACCOUNTS, { accountName: { eq: key } })
  const facebook = rows.filter((r) => r.platform === 'FACEBOOK')
  const match = facebook.length ? facebook : rows
  if (match.length === 0) throw new TwentyError('accountNotFound', `no socialAccount "${key}"`)
  if (match.length > 1) throw new TwentyError('accountNotFound', `${match.length} socialAccounts are called "${key}": use the record id`)
  return toFacebookAccount(match[0])
}

export async function setAccountStatus(
  twenty: TwentyClient,
  accountId: string,
  status: AccountStatus,
  reason: string | null,
  detail: string | null = null,
  now: Date = new Date()
): Promise<void> {
  await twenty.update(SOCIAL_ACCOUNTS, accountId, {
    accountStatus: toTwentyEnum(status) as AccountUpdate['accountStatus'],
    statusReason: reason,
    statusDetail: detail ? detail.slice(0, 500) : null,
    statusChangedAt: now.toISOString(),
    ...(status === 'deactivated' ? { proxy: null } : {})
  })
}

export async function recordProxyCheck(
  twenty: TwentyClient,
  accountId: string,
  result: { exitIp: string | null; exitCountry: string | null },
  now: Date = new Date()
): Promise<void> {
  await twenty.update(SOCIAL_ACCOUNTS, accountId, {
    proxyCheckedAt: now.toISOString(),
    proxyExitIp: result.exitIp,
    proxyExitCountry: result.exitCountry
  })
}

export async function saveCookies(twenty: TwentyClient, accountId: string, cookies: PlaywrightCookie[]): Promise<void> {
  await twenty.update(SOCIAL_ACCOUNTS, accountId, { cookies: cookies as unknown as AccountUpdate['cookies'] })
}

export async function saveSession(twenty: TwentyClient, accountId: string, state: { cookies: PlaywrightCookie[]; origins: unknown[] }): Promise<boolean> {
  if (!hasFacebookSession(state.cookies)) return false
  await twenty.update(SOCIAL_ACCOUNTS, accountId, {
    cookies: state.cookies as unknown as AccountUpdate['cookies'],
    storageOrigins: state.origins as unknown as AccountUpdate['storageOrigins']
  })
  return true
}

export async function markProfileSet(twenty: TwentyClient, accountId: string, at: Date): Promise<void> {
  await twenty.update(SOCIAL_ACCOUNTS, accountId, { profileSetAt: at.toISOString() })
}

export async function saveDeviceProfile(twenty: TwentyClient, account: FacebookAccount, profile: DeviceProfile): Promise<boolean> {
  if (hasStoredDevice(account.deviceProfile)) return false
  await twenty.update(SOCIAL_ACCOUNTS, account.id, { deviceProfile: profile as unknown as AccountUpdate['deviceProfile'] })
  return true
}

export async function saveAdsPowerProfileId(twenty: TwentyClient, accountId: string, profileId: string | null): Promise<void> {
  await twenty.update(SOCIAL_ACCOUNTS, accountId, { adsPowerProfileId: profileId })
}

export async function markPosted(twenty: TwentyClient, accountId: string, now: Date = new Date()): Promise<void> {
  await twenty.update(SOCIAL_ACCOUNTS, accountId, { lastPostedAt: now.toISOString() })
}
