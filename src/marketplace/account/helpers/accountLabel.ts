import type { ConnectionRecord } from '../types'

export function getAccountLabel(accounts: ConnectionRecord[], accountId: string): string {
  return accounts.find((account) => account.id === accountId)?.label ?? 'Facebook'
}
