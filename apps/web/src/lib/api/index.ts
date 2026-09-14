import { apiKeysApp } from './server'
import type { ApiKey, ApiKeyScope, ApiKeysResponse, CreateApiKeyInput, CreatedApiKeyResponse } from './types'

export type { ApiKey, ApiKeyScope, ApiKeysResponse, CreateApiKeyInput, CreatedApiKeyResponse } from './types'
export { apiKeysApp, verifyApiKey, type ApiKeysApp } from './server'
export { SEED_API_KEYS } from './mock'
export {
  API_ROUTES,
  authorizeApiKey,
  checkAccess,
  type ApiAccessContext,
  type ApiAccessResult,
  type ApiRouteDef,
  type ApiRouteNeeds,
} from './scopes'
export { apiActivityFor, type ApiActivityEvent } from './activity'

async function request(path: string, init?: RequestInit): Promise<Response> {
  return apiKeysApp.request(path, init)
}

/**
 * All API key reads and writes flow through the api-keys Hono app — the
 * same route surface the platform clients will expose, so swapping the mock
 * for the live backend is a transport change only.
 */

export interface CreateApiKeyParams {
  name: string
  scopes: ApiKeyScope
}

/** List API keys through `GET /api-keys` — records carry the prefix only, never secrets. */
export async function getApiKeys(): Promise<ApiKey[]> {
  const res = await request('/api-keys')
  if (!res.ok) throw new Error(`API keys request failed (${res.status})`)
  const body = (await res.json()) as ApiKeysResponse
  return body.apiKeys
}

/**
 * Create an API key through `POST /api-keys`. The response carries the full
 * secret exactly once — the caller shows it immediately and drops it, since
 * no route will ever hand it out again.
 */
export async function createApiKey(input: CreateApiKeyParams): Promise<CreatedApiKeyResponse> {
  const res = await request('/api-keys', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...input } satisfies CreateApiKeyInput),
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Could not create the key (${res.status})`)
  }
  return (await res.json()) as CreatedApiKeyResponse
}

/** Revoke (delete) an API key through `DELETE /api-keys/:id`. */
export async function revokeApiKey(id: string): Promise<ApiKey[]> {
  const res = await request(`/api-keys/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Could not revoke the key (${res.status})`)
  const body = (await res.json()) as ApiKeysResponse
  return body.apiKeys
}
