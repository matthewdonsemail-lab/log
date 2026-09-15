import type { ConnectionRecord } from '../connections/types'
import type { AccountIssue, RawSignal } from './types'
import { accountIssuePatch } from './state'

export interface AccountStateStore {
  getAccounts(): Promise<ConnectionRecord[]>
  getAccount(id: string): Promise<ConnectionRecord | null>
  updateIssue(id: string, issue: AccountIssue | null, signal?: RawSignal | null, retryAfter?: number | null): Promise<ConnectionRecord[]>
  resolveChallenge(id: string): Promise<ConnectionRecord[]>
  subscribe(listener: (accounts: ConnectionRecord[]) => void): () => void
}

/**
 * In-memory store for component development. It deliberately exposes the
 * same contract a Convex-backed implementation will expose later: reads,
 * explicit state mutations, and a subscription for reactive updates.
 */
export function createMockAccountStateStore(initial: ConnectionRecord[]): AccountStateStore {
  let accounts = initial.map((account) => ({ ...account }))
  const listeners = new Set<(accounts: ConnectionRecord[]) => void>()

  const snapshot = () => accounts.map((account) => ({ ...account }))
  const emit = () => {
    const next = snapshot()
    listeners.forEach((listener) => listener(next))
  }

  return {
    async getAccounts() {
      return snapshot()
    },

    async getAccount(id) {
      return snapshot().find((account) => account.id === id) ?? null
    },

    async updateIssue(id, issue, signal, retryAfter) {
      const index = accounts.findIndex((account) => account.id === id)
      if (index < 0) throw new Error(`Unknown account: ${id}`)
      accounts[index] = { ...accounts[index], ...accountIssuePatch({ issue, signal, retryAfter }) }
      emit()
      return snapshot()
    },

    async resolveChallenge(id) {
      const index = accounts.findIndex((account) => account.id === id)
      if (index < 0) throw new Error(`Unknown account: ${id}`)
      const account = accounts[index]
      accounts[index] = {
        ...account,
        connectedAt: account.connectedAt ?? new Date().toISOString(),
        lastIssue: null,
        rawSignal: null,
        lastCheckedAt: new Date().toISOString(),
        retryAfter: null
      }
      emit()
      return snapshot()
    },

    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    }
  }
}
