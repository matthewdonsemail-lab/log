/** Signing webhook deliveries, so a receiver can prove a request came from ListeningKit and was not replayed. */

export const SIGNATURE_VERSION = 'v1'
export const REPLAY_WINDOW_SECONDS = 300

/** A fresh secret, shown once when the webhook is made. */
export function newWebhookSecret(): string {
  return `whsec_${crypto.randomUUID().replaceAll('-', '')}${crypto.randomUUID().replaceAll('-', '')}`
}

export async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  return Array.from(new Uint8Array(mac), byte => byte.toString(16).padStart(2, '0')).join('')
}

/** `v1=<hex>` over `<timestamp>.<body>`. The receiver recomputes it with its copy of the secret and compares. */
export async function signPayload(secret: string, timestampSeconds: number, body: string): Promise<string> {
  return `${SIGNATURE_VERSION}=${await hmacHex(secret, `${timestampSeconds}.${body}`)}`
}

/** For tests and for anyone checking a delivery: true when the signature matches and the timestamp is recent. */
export async function verifySignature(secret: string, timestampSeconds: number, body: string, signature: string, nowSeconds: number): Promise<boolean> {
  if (Math.abs(nowSeconds - timestampSeconds) > REPLAY_WINDOW_SECONDS) return false
  const expected = await signPayload(secret, timestampSeconds, body)
  if (expected.length !== signature.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i)
  return diff === 0
}
