import { createRemoteJWKSet, jwtVerify } from 'jose'

/** Only identity-provider access tokens; never Convex deploy keys or platform cookies. */
export function createTokenVerifier(issuer: string, audience: string, jwksUrl: string) {
  const url = new URL(jwksUrl)
  if (url.protocol !== 'https:') throw new Error('AUTH_JWKS_URL must use HTTPS')
  const keys = createRemoteJWKSet(url)
  return async (token: string): Promise<void> => {
    const { payload } = await jwtVerify(token, keys, {
      issuer, audience, algorithms: ['RS256'], requiredClaims: ['sub', 'exp', 'iat'],
    })
    if (!payload.sub?.trim()) throw new Error('Missing subject')
  }
}
