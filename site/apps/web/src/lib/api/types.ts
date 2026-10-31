export interface ApiKeyScope {
  /** Account the key acts as; null = all connected accounts. */
  accountId: string | null
  /** Group ids the key may touch; empty = all joined groups. */
  groupIds: string[]
  /** Whether the key may send messages through the platform clients. */
  canSendMessages: boolean
  /** Whether the key may read messages and signals back. */
  canReceiveMessages: boolean
}

export interface ApiKey {
  id: string
  name: string
  /**
   * Display prefix, e.g. `lk_live_4f7ak2••••••••` — the only
   * secret-derived value list reads expose. The full secret is never
   * stored and can never be read back.
   */
  prefix: string
  /** SHA-256 hex of the secret, for verification. */
  secretHash: string
  scopes: ApiKeyScope
  createdAt: string
  lastUsedAt: string | null
}

export interface ApiKeysResponse {
  apiKeys: ApiKey[]
}

/**
 * The create response — the ONLY time the full secret exists outside the
 * hash. The caller shows it immediately and drops it; closing the create
 * form erases it for good.
 */
export interface CreatedApiKeyResponse {
  apiKey: ApiKey
  /** Full secret. Show once, then drop it. */
  key: string
}

export type CreateApiKeyInput = {
  name: string
  scopes: ApiKeyScope
}
