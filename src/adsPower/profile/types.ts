/**
 * One AdsPower profile per Facebook account in Twenty (`socialAccounts`). Twenty stays the
 * only place accounts live (rule 13): the profile is the browser for that account, linked
 * by `socialAccounts.adsPowerProfileId`, and named by its accountName. The profile is made
 * with no proxy, password, cookies or 2FA key: those stay in Twenty only, and the proxy is
 * put on the profile by the gate right before it opens (rule 12, `browser/driver`).
 */

/** The AdsPower group every log-cli profile goes in. */
export const ADS_POWER_GROUP = 'logCli'

/** Accounts with these statuses get no profile: their records stay in Twenty, unused (rule 13). */
export const NO_PROFILE_STATUSES = ['banned', 'dead'] as const

/** What `log adsPower sync` does for one account. */
export type ProfileSyncAction =
  /** Already linked to a profile that exists. */
  | 'linked'
  /** A profile with this account's Twenty id in its remark exists but Twenty lost the link: relink it. */
  | 'relink'
  /** No profile yet: make one. */
  | 'create'
  /** Banned or dead, or no home country we can pin a locale for: no profile. */
  | 'skip'

export interface ProfileSyncEntry {
  accountId: string
  accountName: string
  action: ProfileSyncAction
  profileId: string | null
  /** Why it is skipped, or what went wrong applying it. */
  note: string | null
}

export interface ProfileSyncResult {
  applied: boolean
  entries: ProfileSyncEntry[]
}
