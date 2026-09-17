import { afterEach, expect, it, vi } from 'vitest'
import { exportJWK, generateKeyPair, SignJWT } from 'jose'
import { createTokenVerifier } from './auth'

afterEach(() => vi.unstubAllGlobals())

it('verifies signatures, issuer, audience and expiration against JWKS', async () => {
  const { privateKey, publicKey } = await generateKeyPair('RS256')
  const jwk = await exportJWK(publicKey)
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ keys: [{ ...jwk, kid: 'test', alg: 'RS256' }] })))
  const verify = createTokenVerifier('https://identity.example', 'listeningkit', 'https://identity.example/.well-known/jwks.json')
  const token = (issuer = 'https://identity.example', audience = 'listeningkit', exp: string | number = '5m') =>
    new SignJWT({}).setProtectedHeader({ alg: 'RS256', kid: 'test' }).setSubject('alice')
      .setIssuedAt().setIssuer(issuer).setAudience(audience).setExpirationTime(exp).sign(privateKey)
  await expect(verify(await token())).resolves.toBeUndefined()
  await expect(verify(await token('https://attacker.example'))).rejects.toThrow()
  await expect(verify(await token(undefined, 'other-app'))).rejects.toThrow()
  await expect(verify(await token(undefined, undefined, 1))).rejects.toThrow()
  const forged = `${(await token()).split('.').slice(0, 2).join('.')}.invalid`
  await expect(verify(forged)).rejects.toThrow()
})

it('rejects insecure JWKS endpoints', () => {
  expect(() => createTokenVerifier('issuer', 'audience', 'http://example.com/keys')).toThrow('HTTPS')
})
