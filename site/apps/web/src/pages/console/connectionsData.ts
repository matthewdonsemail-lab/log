import { localApi } from '@/lib/consoleMode'
import type { AccountView } from '@/lib/controlApi'

export type LocalAccount = { id: string; platform: string; accountName: string; sessionState: string | null; browserProfile: boolean; signIn: 'cookies' | 'connect' | 'browser' }
export type LocalConnections = { schemaVersion: 1; source: 'local'; generatedAt: string; path: string; total: number; platforms: { platform: string; label: string; accounts: LocalAccount[] }[] }

export function loadLocalConnections(signal?: AbortSignal): Promise<LocalConnections> {
  return localApi<LocalConnections>('/api/console/connections', signal)
}

export function localAccountViews(data: LocalConnections): AccountView[] {
  return data.platforms.flatMap((group) => group.accounts.map((account) => ({ id: account.id, platform: account.platform, account: account.accountName, displayName: null, status: account.sessionState ?? 'no session yet', sessionState: account.sessionState, browserLocation: account.browserProfile ? 'local' : null, revision: 0 })))
}
