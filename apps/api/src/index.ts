import { serve } from '@hono/node-server'
import { createApp } from './app'
import { createTokenVerifier } from './auth'
import { convexBackend } from './backend'

function required(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is required; see apps/api/.env.example`)
  return value
}
const convexUrl = required('CONVEX_URL')
const verifyToken = createTokenVerifier(required('AUTH_ISSUER'), required('AUTH_AUDIENCE'), required('AUTH_JWKS_URL'))
const port = Number(process.env.PORT ?? 4000)
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT')
const app = createApp({ verifyToken, backend: token => convexBackend(convexUrl, token) })
serve({ fetch: app.fetch, hostname: '127.0.0.1', port })
console.info(`ListeningKit API listening on http://127.0.0.1:${port}`)
