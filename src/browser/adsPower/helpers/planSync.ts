import { HOME_COUNTRIES } from '../../../marketplace/home/index'
import type { FacebookAccount } from '../../../marketplace/socialAccount/index'
import type { AdsPowerProfile } from '../types'
import { NO_PROFILE_STATUSES, RELEASE_STATUSES } from '../types'
import type { ProfileSyncEntry } from '../types'
import { remarkAccountId } from './profileRequest'

export function planSync(accounts: FacebookAccount[], profiles: AdsPowerProfile[], homes: readonly string[] | null = null): ProfileSyncEntry[] {
  const byId = new Map(profiles.map((p) => [p.profileId, p]))
  const byAccount = new Map(profiles.flatMap((p) => { const id = remarkAccountId(p.remark); return id ? [[id, p] as const] : [] }))
  return accounts.map((account) => {
    const base = { accountId: account.id, accountName: account.accountName }
    const held = account.adsPowerProfileId ?? byAccount.get(account.id)?.profileId ?? null
    const releasing = account.status && (RELEASE_STATUSES as readonly string[]).includes(account.status) ? `status ${account.status}` : homes && !homes.includes((account.homeCountry ?? '').toUpperCase()) ? `home ${account.homeCountry ?? '(none)'} is not in ${homes.join(', ')}` : null
    if (releasing) return held ? { ...base, action: 'release', profileId: held, note: releasing } : { ...base, action: 'skip', profileId: null, note: releasing }
    if (account.status && (NO_PROFILE_STATUSES as readonly string[]).includes(account.status)) return { ...base, action: 'skip', profileId: account.adsPowerProfileId, note: `status ${account.status}` }
    if (!HOME_COUNTRIES[account.homeCountry ?? '']) return { ...base, action: 'skip', profileId: null, note: `no home locale for country ${account.homeCountry ?? '(none)'}` }
    if (account.adsPowerProfileId && byId.has(account.adsPowerProfileId)) return { ...base, action: 'linked', profileId: account.adsPowerProfileId, note: null }
    const found = byAccount.get(account.id)
    if (found) return { ...base, action: 'relink', profileId: found.profileId, note: account.adsPowerProfileId ? `stored ${account.adsPowerProfileId} is gone` : null }
    return { ...base, action: 'create', profileId: null, note: account.adsPowerProfileId ? `stored ${account.adsPowerProfileId} is gone` : null }
  })
}
