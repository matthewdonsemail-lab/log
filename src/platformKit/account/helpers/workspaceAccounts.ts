import { readLocalAccounts } from '../../../twenty/graphql/index'

export const WORKSPACE_ACCOUNTS_DEFAULT_LIMIT = 50
export const WORKSPACE_ACCOUNTS_MAX_LIMIT = 200

export interface WorkspaceAccount {
  id: string
  platform: string
  account: string
  displayName: string | null
  status: string
  sessionState: string | null
  browserLocation: 'workspace' | null
  revision: number
}

export interface WorkspaceAccountsPage {
  accounts: WorkspaceAccount[]
  cursor: string | null
}

export function workspaceAccounts(options: { limit?: unknown; cursor?: unknown } = {}, path?: string): WorkspaceAccountsPage {
  const limit = Math.max(1, Math.min(Number(options.limit ?? WORKSPACE_ACCOUNTS_DEFAULT_LIMIT) || WORKSPACE_ACCOUNTS_DEFAULT_LIMIT, WORKSPACE_ACCOUNTS_MAX_LIMIT))
  const start = Math.max(0, Number(options.cursor ?? 0) || 0)
  const rows = path === undefined ? readLocalAccounts() : readLocalAccounts(path)
  const accounts = rows.slice(start, start + limit).map((row) => ({
    id: String(row.id ?? ''),
    platform: String(row.platform ?? '').toLowerCase(),
    account: String(row.accountName ?? ''),
    displayName: row.name ? String(row.name) : null,
    status: String(row.status ?? 'unknown'),
    sessionState: row.sessionState ? String(row.sessionState) : null,
    browserLocation: row.adsPowerProfileId ? ('workspace' as const) : null,
    revision: 1,
  }))
  return { accounts, cursor: start + limit < rows.length ? String(start + limit) : null }
}
