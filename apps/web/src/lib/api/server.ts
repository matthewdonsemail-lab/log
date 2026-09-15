import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { SEED_API_KEYS, apiKeyId, generateApiKey, hashSecret, prefixOfSecret } from './mock'
import type { ApiKey, ApiKeyScope, CreateApiKeyInput } from './types'
import { isArray, isRecord, loadPersistedState, savePersistedState } from '../persist'
import {
  ApiKeyCreateJson,
  ApiKeyListJson,
  CreateApiKeyInputJson,
  errorResponse
} from '../openapi'

const API_KEYS_KEY = 'api-keys'

function isApiKeyScope(value: unknown): value is ApiKeyScope {
  return (
    isRecord(value) &&
    (typeof (value as { accountId?: unknown }).accountId === 'string' ||
      (value as { accountId?: unknown }).accountId === null) &&
    isArray((value as { groupIds?: unknown }).groupIds) &&
    ((value as { groupIds?: unknown }).groupIds as unknown[]).every((id) => typeof id === 'string') &&
    typeof (value as { canSendMessages?: unknown }).canSendMessages === 'boolean' &&
    typeof (value as { canReceiveMessages?: unknown }).canReceiveMessages === 'boolean'
  )
}

function isApiKeyArray(value: unknown): value is ApiKey[] {
  return (
    isArray(value) &&
    value.every(
      (row) =>
        isRecord(row) &&
        typeof (row as { id?: unknown }).id === 'string' &&
        typeof (row as { secretHash?: unknown }).secretHash === 'string' &&
        isApiKeyScope((row as { scopes?: unknown }).scopes)
    )
  )
}

/**
 * In-memory API key store. Seeds from SEED_API_KEYS; every write is
 * persisted to localStorage and rehydrated on load, so created and revoked
 * keys survive a refresh.
 *
 * The route table mirrors what the live platform client will expose, so
 * swapping the mock for the live backend is a transport change only. One
 * deliberate property, mock and live alike: only the secret HASH is stored.
 * The plaintext leaves the server exactly once — inside the create
 * response — and no route ever hands it out again. Rows persisted under the
 * old shape (full `key` field) fail the guard above and fall back to seeds.
 */
let apiKeys: ApiKey[] = loadPersistedState(API_KEYS_KEY, isApiKeyArray) ?? [...SEED_API_KEYS]

function persistApiKeys(): void {
  savePersistedState(API_KEYS_KEY, apiKeys)
}

/**
 * Verify a presented secret: hash it, find the key, stamp last use. Returns
 * null for unknown or revoked keys. The gate in `./scopes` builds on this.
 */
export async function verifyApiKey(secret: string): Promise<ApiKey | null> {
  const secretHash = await hashSecret(secret)
  const found = apiKeys.find((apiKey) => apiKey.secretHash === secretHash) ?? null
  if (!found) return null
  const touched: ApiKey = { ...found, lastUsedAt: new Date().toISOString() }
  apiKeys = apiKeys.map((apiKey) => (apiKey.id === touched.id ? touched : apiKey))
  persistApiKeys()
  return touched
}

export const apiKeysApp = new Hono()
  .get(
    '/api-keys',
    describeRoute({
      operationId: 'listApiKeys',
      tags: ['API keys'],
      summary: 'List API keys',
      description: 'Records carry the prefix only — there is no secret field to leak.',
      responses: {
        200: {
          description: 'Key list.',
          content: { 'application/json': { schema: ApiKeyListJson } }
        }
      }
    }),
    (c) => {
      // Records carry the prefix only — there is no secret field to leak.
      return c.json({ apiKeys: [...apiKeys] })
    }
  )
  .post(
    '/api-keys',
    describeRoute({
      operationId: 'createApiKey',
      tags: ['API keys'],
      summary: 'Create an API key',
      description: 'The full secret appears exactly once, in this response.',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: CreateApiKeyInputJson } }
      },
      responses: {
        201: {
          description: 'Created; `key` is the full secret (once-only).',
          content: { 'application/json': { schema: ApiKeyCreateJson } }
        },
        400: errorResponse('Invalid request body · A key needs a name · Scopes are missing or malformed.'),
        409: errorResponse('A key with that name already exists.')
      }
    }),
    async (c) => {
    const body = await c.req.json<CreateApiKeyInput>().catch(() => null)
    if (!body) return c.json({ error: 'Invalid request body' }, 400)
    const name = (body.name ?? '').trim()
    if (!name) return c.json({ error: 'A key needs a name' }, 400)
    // Duplicate names (case-insensitive) are rejected — two keys called
    // "Production" can't be told apart in the list or in audit logs.
    const dupe = apiKeys.find((existing) => existing.name.toLowerCase() === name.toLowerCase())
    if (dupe) return c.json({ error: 'A key with that name already exists' }, 409)
    if (!isApiKeyScope(body.scopes)) return c.json({ error: 'Scopes are missing or malformed' }, 400)
    const secret = generateApiKey()
    const record: ApiKey = {
      id: apiKeyId(),
      name,
      prefix: prefixOfSecret(secret),
      secretHash: await hashSecret(secret),
      scopes: {
        accountId: body.scopes.accountId,
        groupIds: [...body.scopes.groupIds],
        canSendMessages: body.scopes.canSendMessages,
        canReceiveMessages: body.scopes.canReceiveMessages,
      },
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
    }
    apiKeys = [...apiKeys, record]
    persistApiKeys()
    return c.json({ apiKey: record, apiKeys: [...apiKeys], key: secret }, 201)
  })
  .delete(
    '/api-keys/:id',
    describeRoute({
      operationId: 'deleteApiKey',
      tags: ['API keys'],
      summary: 'Revoke an API key',
      description: 'Revoking is immediate; unknown ids are a no-op returning the list.',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Key id.'
        }
      ],
      responses: {
        200: {
          description: 'Remaining key list.',
          content: { 'application/json': { schema: ApiKeyListJson } }
        }
      }
    }),
    (c) => {
    const id = c.req.param('id')
    apiKeys = apiKeys.filter((apiKey) => apiKey.id !== id)
    persistApiKeys()
    return c.json({ apiKeys: [...apiKeys] })
  })

export type ApiKeysApp = typeof apiKeysApp
