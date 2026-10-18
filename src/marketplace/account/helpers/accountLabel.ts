import type { ConnectionRecord } from '../types'

/** Resolve an account label from its stable id; falls back to the platform name. */
export function getAccountLabel(accounts: ConnectionRecord[], accountId: string): string {
  return accounts.find((account) => account.id === accountId)?.label ?? 'Facebook'
}
