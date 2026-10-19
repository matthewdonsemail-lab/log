/**
 * `log adsPower sync`: every Facebook account in Twenty gets its AdsPower profile, and
 * Twenty keeps the link (`adsPowerProfileId`). A dry run unless `apply`. Nothing is ever
 * deleted on either side (rule 13). One line per account is reported as it is done.
 */
import { listFacebookAccounts, saveAdsPowerProfileId } from '../../marketplace/socialAccount/index'
import type { TwentyClient } from '../../twenty/graphql/index'
import type { AdsPowerClient } from '../localApi/index'
import { planSync, profileRequest } from './helpers/index'
import { ADS_POWER_GROUP } from './types'
import type { ProfileSyncEntry, ProfileSyncResult } from './types'

export async function syncProfiles(
  twenty: TwentyClient,
  adsPower: AdsPowerClient,
  options: { apply: boolean; account?: string; log?: (line: string) => void }
): Promise<ProfileSyncResult> {
  const log = options.log ?? (() => {})
  const all = await listFacebookAccounts(twenty)
  const accounts = options.account ? all.filter((a) => a.accountName === options.account || a.id === options.account) : all
  log(`adsPower: ${accounts.length} account(s) from Twenty; reading AdsPower's profiles`)
  const profiles = await adsPower.listProfiles()
  const entries = planSync(accounts, profiles)
  if (!options.apply) return { applied: false, entries }
  const groupId = await adsPower.ensureGroup(ADS_POWER_GROUP)
  const done: ProfileSyncEntry[] = []
  for (const [i, entry] of entries.entries()) {
    const account = accounts.find((a) => a.id === entry.accountId)!
    try {
      if (entry.action === 'create') {
        const body = profileRequest(account, groupId)!
        const made = await adsPower.createProfile(body)
        await saveAdsPowerProfileId(twenty, account.id, made.profileId)
        done.push({ ...entry, profileId: made.profileId })
        log(`adsPower ${i + 1}/${entries.length} ${account.accountName}: made profile ${made.profileId}, linked in Twenty`)
      } else if (entry.action === 'relink') {
        await saveAdsPowerProfileId(twenty, account.id, entry.profileId!)
        done.push(entry)
        log(`adsPower ${i + 1}/${entries.length} ${account.accountName}: relinked profile ${entry.profileId}`)
      } else {
        done.push(entry)
        log(`adsPower ${i + 1}/${entries.length} ${account.accountName}: ${entry.action}${entry.note ? ` (${entry.note})` : ''}`)
      }
    } catch (error) {
      const note = error instanceof Error ? error.message : String(error)
      done.push({ ...entry, note })
      log(`adsPower ${i + 1}/${entries.length} ${account.accountName}: ${entry.action} failed: ${note}`)
    }
  }
  return { applied: true, entries: done }
}
