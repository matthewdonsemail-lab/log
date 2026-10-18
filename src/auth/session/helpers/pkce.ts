/**
 * PKCE and state nonces, ported from blaster
 * `packages/core/src/twenty/oauth/helpers/oauth.ts`. WebCrypto only.
 */

export function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function randomBase64Url(
  byteLength: number,
  rand: (bytes: Uint8Array) => Uint8Array = (bytes) => crypto.getRandomValues(bytes),
): string {
  return base64UrlEncode(rand(new Uint8Array(byteLength)));
}

/** 32 random bytes: 43 chars, inside the RFC 7636 43-128 bound. */
export function generateCodeVerifier(): string {
  return randomBase64Url(32);
}

/** 16 random bytes: the per-flow state nonce. */
export function generateState(): string {
  return randomBase64Url(16);
}

/** S256 challenge: base64url(SHA256(verifier)). */
export async function codeChallengeForVerifier(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64UrlEncode(new Uint8Array(digest));
}

/** True when `expiresIn` seconds from `obtainedAtMs` have passed (60s skew). */
export function isTokenExpired(obtainedAtMs: number, expiresIn: number | null, nowMs = Date.now()): boolean {
  if (expiresIn === null) return false;
  return nowMs >= obtainedAtMs + expiresIn * 1000 - 60_000;
}
