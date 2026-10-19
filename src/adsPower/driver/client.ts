/**
 * AdsPower as a browser driver (rule 42): the account's linked profile, opened through the
 * Local API and attached over CDP. The gate (rule 12) and the launch self-check (rule 17)
 * live in python/proxyGate.py and are not wired to AdsPower yet, so this driver's gate
 * refuses (`adsPowerGateNotBuilt`) and no AdsPower browser opens for an account until they
 * are. Every other step is real and tested with a fake Local API.
 */
import type { FacebookAccount } from '../../marketplace/socialAccount/index'
import type { BrowserDriver, GateResult } from '../../browser/driver/index'
import type { AdsPowerClient } from '../localApi/index'
import { NO_PROXY, proxyConfig } from './helpers/index'

export interface AdsPowerDriverDeps {
  adsPower: AdsPowerClient
  /** The account the session is for (read from Twenty by the caller). */
  account: (accountId: string) => Promise<FacebookAccount>
  /** The proxy gate for an AdsPower profile; until it is built the driver refuses. */
  gate?: (account: FacebookAccount) => Promise<GateResult>
}

const fail = (code: string, detail: string) => ({ code, detail })

export function adsPowerDriver(deps: AdsPowerDriverDeps): BrowserDriver {
  return {
    name: 'adsPower',
    async prepare(input) {
      const account = await deps.account(input.accountId)
      if (!account.adsPowerProfileId) throw fail('adsPowerProfileMissing', `${account.accountName} has no AdsPower profile: run log adsPower sync --apply`)
      return account.adsPowerProfileId
    },
    async gate(input) {
      if (!deps.gate) throw fail('adsPowerGateNotBuilt', 'the proxy gate (python/proxyGate.py) is not wired to AdsPower yet, so nothing opens')
      return deps.gate(await deps.account(input.accountId))
    },
    async start(input, handle) {
      const account = await deps.account(input.accountId)
      const proxy = account.proxy ? proxyConfig(account.proxy) : null
      if (!proxy) throw fail('noProxy', `${account.accountName} has no usable proxy`)
      await deps.adsPower.updateProfile(handle, { user_proxy_config: proxy })
      const started = await deps.adsPower.startBrowser(handle)
      return { cdpUrl: started.cdpUrl, handle }
    },
    async selfCheck() {
      return { ok: false, failure: fail('adsPowerSelfCheckNotBuilt', 'the launch self-check is not wired to AdsPower yet') }
    },
    async stop(_input, endpoint) {
      try {
        await deps.adsPower.stopBrowser(endpoint.handle)
      } finally {
        await deps.adsPower.updateProfile(endpoint.handle, { user_proxy_config: NO_PROXY })
      }
    }
  }
}
