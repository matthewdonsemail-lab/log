import { validateCredentialInput } from '../../../../src/auth/credentials/client'

type Probe = { url: string; headers?: Record<string, string>; body?: string; accepts: (body: Record<string, unknown> | unknown[]) => boolean }

export async function validateProviderCredentials(provider: string, input: unknown) {
  const values = validateCredentialInput(provider, input)
  const key = Object.values(values)[0]
  const bearer = { Authorization: `Bearer ${key}` }
  const probes: Record<string, Probe> = {
    typesafe: { url: 'https://api.typesafe.ai/v1/models', headers: bearer, accepts: (body) => 'models' in body && Array.isArray(body.models) },
    subq: { url: 'https://api.subq.ai/v1/models', headers: bearer, accepts: (body) => 'data' in body && Array.isArray(body.data) },
    memelord: { url: 'https://www.memelord.com/api/v1/image-tools', headers: bearer, accepts: (body) => !('success' in body) || body.success !== false },
    fishAudio: { url: 'https://api.fish.audio/wallet/self/api-credit', headers: bearer, accepts: (body) => 'credit' in body && Number.isFinite(Number(body.credit)) },
    inworld: { url: 'https://api.inworld.ai/voices/v1/voices', headers: { Authorization: `Basic ${key}` }, accepts: (body) => 'voices' in body && Array.isArray(body.voices) },
    jina: { url: `https://embeddings-dashboard-api.jina.ai/api/v1/api_key/fe_user?api_key=${encodeURIComponent(key)}`, accepts: (body) => 'wallet' in body && !!body.wallet && typeof body.wallet === 'object' },
    assemblyAi: { url: 'https://api.assemblyai.com/v2/transcript?limit=1', headers: { authorization: key }, accepts: (body) => 'transcripts' in body && Array.isArray(body.transcripts) },
    parallel: { url: 'https://api.parallel.ai/v1/monitors?limit=1', headers: { 'x-api-key': key }, accepts: (body) => 'monitors' in body && Array.isArray(body.monitors) },
    treg: { url: 'https://treg.to/orgs', headers: { 'X-Treg-Token': key }, accepts: Array.isArray },
    twoCaptcha: { url: 'https://api.2captcha.com/getBalance', body: JSON.stringify({ clientKey: key }), accepts: (body) => 'errorId' in body && body.errorId === 0 && 'balance' in body && Number.isFinite(Number(body.balance)) },
    byteful: { url: 'https://api.byteful.com/1.0/public/user/customer/retrieve', headers: { 'X-API-Public-Key': values.BYTEFUL_PUBLIC_KEY, 'X-API-Private-Key': values.BYTEFUL_PRIVATE_KEY }, accepts: (body) => 'data' in body && !!body.data && typeof body.data === 'object' },
  }
  const probe = probes[provider]
  if (!probe) throw new Error('credentialValidationUnavailable')
  let response: Response
  try {
    response = await fetch(probe.url, { method: probe.body ? 'POST' : 'GET', headers: { ...probe.headers, Accept: 'application/json', ...(probe.body ? { 'Content-Type': 'application/json' } : {}) }, ...(probe.body ? { body: probe.body } : {}), redirect: 'error', signal: AbortSignal.timeout(20000) })
  } catch { throw new Error('credentialValidationUnavailable') }
  if (response.status === 401 || response.status === 403) throw new Error('credentialRejected')
  if (response.status === 429) throw new Error('credentialRateLimited')
  if (!response.ok) throw new Error('credentialValidationUnavailable')
  const body: unknown = await response.json().catch(() => null)
  if (!body || typeof body !== 'object') throw new Error('credentialValidationUnavailable')
  if (provider === 'twoCaptcha' && 'errorId' in body && body.errorId !== 0) throw new Error('credentialRejected')
  if (!probe.accepts(body as Record<string, unknown> | unknown[])) throw new Error('credentialValidationUnavailable')
  return values
}
