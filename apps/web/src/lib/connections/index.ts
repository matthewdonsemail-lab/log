import { apiMode, apiRequest } from '../transport'
import { assertCookie } from './cookie'
import { normalizeProxy } from './proxy'
import { connectionsApp } from './server'
import { platformLabel } from './store'
import type { ConnectInput, ConnectionPlatform, ConnectionRecord } from './types'

export type {
  ConnectInput,
  ConnectionPlatform,
  ConnectionRecord,
  ConnectionStatus,
} from './types'
export { platformLabel } from './store'
export {
  MOCK_CONNECTIONS,
  MOCK_FACEBOOK_ACCOUNTS,
} from './mock'
export { connectionsApp, type ConnectionsApp } from './server'

async function request(path: string, init?: RequestInit): Promise<Response> {
  return apiMode() === 'live' ? apiRequest(path, init) : connectionsApp.request(path, init)
}

/**
 * All account reads and writes flow through the connections Hono app — the
 * same route surface the real camoufox-client accounts API will expose, so
 * swapping the mock for the live backend is a transport change only.
 */

/** List every account through `GET /accounts`. */
export async function getAccounts(): Promise<ConnectionRecord[]> {
  const res = await request('/accounts')
  if (!res.ok) throw new Error(`Accounts request failed (${res.status})`)
  const body = (await res.json()) as { accounts: ConnectionRecord[] }
  return body.accounts
}

/** Add a fresh, not-yet-connected account through `POST /accounts`. */
export async function createAccount(platform: ConnectionPlatform): Promise<ConnectionRecord> {
  const res = await request('/accounts', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ platform }),
  })
  if (!res.ok) throw new Error(`Could not add an account (${res.status})`)
  const body = (await res.json()) as { account: ConnectionRecord }
  return body.account
}

/** Upsert one account (matched by id) through `PATCH /accounts/:id`. */
export async function saveAccount(record: ConnectionRecord): Promise<ConnectionRecord[]> {
  const res = await request(`/accounts/${record.id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(record),
  })
  if (!res.ok) throw new Error(`Could not save the account (${res.status})`)
  const body = (await res.json()) as { accounts: ConnectionRecord[] }
  return body.accounts
}

/** Delete an account through `DELETE /accounts/:id`. */
export async function deleteAccount(id: string): Promise<ConnectionRecord[]> {
  const res = await request(`/accounts/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Could not delete the account (${res.status})`)
  const body = (await res.json()) as { accounts: ConnectionRecord[] }
  return body.accounts
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const id = window.setTimeout(() => resolve(), ms)
    signal?.addEventListener(
      'abort',
      () => {
        window.clearTimeout(id)
        reject(new DOMException('Connection cancelled.', 'AbortError'))
      },
      { once: true },
    )
  })
}

/**
 * Dry-run validation of the cookie + proxy without persisting anything.
 * Throws on invalid input; aborts via signal.
 */
export async function testConnection(
  input: ConnectInput,
  signal?: AbortSignal,
): Promise<{ ok: true; viaProxy: boolean }> {
  if (apiMode() === 'live') throw new Error('Live platform verification is not implemented yet')
  assertCookie(input.cookie)
  const proxy = normalizeProxy(input.proxy)
  await delay(800, signal)
  if (signal?.aborted) throw new DOMException('Test cancelled.', 'AbortError')
  return { ok: true, viaProxy: proxy !== undefined }
}

/**
 * Validate the cookie + proxy, run the handshake, persist the connection
 * through `PATCH /accounts/:id`. Throws on invalid input; aborts via signal.
 */
export async function connectAccount(
  input: ConnectInput,
  signal?: AbortSignal,
): Promise<ConnectionRecord> {
  if (apiMode() === 'live') throw new Error('Live platform connection is not implemented yet')
  assertCookie(input.cookie)
  const proxy = normalizeProxy(input.proxy)
  await delay(1100, signal)
  if (signal?.aborted) throw new DOMException('Connection cancelled.', 'AbortError')
  const accounts = await getAccounts()
  const existing = accounts.find((a) => a.id === input.id)
  const record: ConnectionRecord = {
    id: input.id,
    platform: input.platform,
    label: existing?.label ?? platformLabel(input.platform),
    viaProxy: proxy !== undefined,
    connectedAt: new Date().toISOString(),
    lastIssue: null,
    lastCheckedAt: new Date().toISOString(),
    retryAfter: null,
  }
  await saveAccount(record)
  return record
}

/** Mark the account as disconnected (keeps the row, clears the connection). */
export async function disconnectAccount(id: string): Promise<ConnectionRecord[]> {
  const accounts = await getAccounts()
  const existing = accounts.find((a) => a.id === id)
  if (!existing) return deleteAccount(id)
  return saveAccount({ ...existing, viaProxy: false, connectedAt: null, lastIssue: 'disconnected', rawSignal: null })
}

/**
 * Clear a human-resolved challenge through `POST /accounts/:id/resolve`:
 * the visitor passed the checkpoint / interstitial / captcha in the session
 * view, so the persisted issue and its raw signal go away and the account
 * resumes. Throws when the id is unknown (404) or when the account carries
 * no resolvable challenge (409) — the server, not the client, owns that
 * gate.
 */
export async function resolveChallenge(id: string): Promise<ConnectionRecord[]> {
  const res = await request(`/accounts/${id}/resolve`, { method: 'POST' })
  if (res.status === 404) throw new Error('Account not found.')
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Could not clear the challenge (${res.status})`)
  }
  const body = (await res.json()) as { accounts: ConnectionRecord[] }
  return body.accounts
}