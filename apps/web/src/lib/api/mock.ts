import type { ApiKey } from './types'
import { uuid } from '../ids'

/** Opaque key for a newly created API key — delegates to the shared id generator. */
export function apiKeyId(): string {
  return uuid()
}

// 256 bits of CSPRNG entropy over the base64url alphabet: long enough to be
// unguessable, shaped like the live client's secret format.
export function generateApiKey(): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  let secret = ''
  for (const byte of bytes) secret += alphabet[byte % alphabet.length]
  return `lk_live_${secret}`
}

// Display prefix for the key list: the `lk_live_` scheme plus the first few
// characters of the random part, then dots. Never enough of the secret to
// be usable — the table identifies keys without exposing them.
export function prefixOfSecret(secret: string): string {
  const prefix = 'lk_live_'
  const random = secret.startsWith(prefix) ? secret.slice(prefix.length) : secret
  return `${prefix}${random.slice(0, 6)}••••••••`
}

// One-way hash for secret storage and verification. The plaintext is handed
// out once at creation and never persisted anywhere after that.
export async function hashSecret(secret: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Demo seed so the page reads populated, mirroring the keyword seeds. The
 * hash below is SHA-256 of the old demo secret — kept so the seeded row
 * verifies like a real one; its plaintext was never stored.
 */
export const SEED_API_KEYS: ApiKey[] = [
  {
    id: '9d3c1f5a-4b6e-4a8c-b2d7-5e8f0a1c3d49',
    name: 'Production',
    prefix: 'lk_live_4f7ak2••••••••',
    secretHash: '0f7108da17078975ef027b08940fb6bf8d4dbca4fc4661113bb687cf5130982d',
    scopes: { accountId: null, groupIds: [], canSendMessages: true, canReceiveMessages: true },
    createdAt: '2026-09-10T16:00:00.000Z',
    lastUsedAt: null,
  },
]
