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

export function generateCodeVerifier(): string {
  return randomBase64Url(32);
}

export function generateState(): string {
  return randomBase64Url(16);
}

export async function codeChallengeForVerifier(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64UrlEncode(new Uint8Array(digest));
}

export function isTokenExpired(obtainedAtMs: number, expiresIn: number | null, nowMs = Date.now()): boolean {
  if (expiresIn === null) return false;
  return nowMs >= obtainedAtMs + expiresIn * 1000 - 60_000;
}
