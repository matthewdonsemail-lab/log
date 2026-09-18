import { ConvexError } from 'convex/values'

const KEY_ENV = 'SESSION_ENCRYPTION_KEY'

function bytes(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), char => char.charCodeAt(0))
}
function base64(data: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < data.length; i += 0x8000) binary += String.fromCharCode(...data.subarray(i, i + 0x8000))
  return btoa(binary)
}

async function importKey(): Promise<CryptoKey> {
  const raw = process.env[KEY_ENV]
  if (!raw) throw new ConvexError('Connecting accounts is not set up on this deployment yet.')
  const key = bytes(raw)
  if (key.length !== 32) throw new ConvexError('Connecting accounts is misconfigured on this deployment.')
  return await crypto.subtle.importKey('raw', key, 'AES-GCM', false, ['encrypt', 'decrypt'])
}

/** AES-256-GCM with a fresh random IV per call. The key lives only in the deployment's env. */
export async function encryptText(plain: string): Promise<{ iv: string; data: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await importKey(), new TextEncoder().encode(plain))
  return { iv: base64(iv), data: base64(new Uint8Array(cipher)) }
}

export async function decryptText(sealed: { iv: string; data: string }): Promise<string> {
  try {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes(sealed.iv) }, await importKey(), bytes(sealed.data))
    return new TextDecoder().decode(plain)
  } catch (error) {
    if (error instanceof ConvexError) throw error
    throw new ConvexError('Could not read the saved login. Connect the account again.')
  }
}
