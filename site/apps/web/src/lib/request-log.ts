import type { Context, Next } from 'hono'

/** Placeholder written over secret-bearing fields before anything is stringified. */
export const REDACTED = '[redacted]'

/**
 * Field names that must never reach the log stream, even in the mock:
 * `CreatedApiKeyResponse.key` (once-only plaintext), `ApiKey.secretHash`
 * (present on every list row), `ConnectionRecord.cookie` (pasted extension
 * material), and Bark `deviceKey`s.
 */
const SENSITIVE_KEYS = new Set(['key', 'secretHash', 'deviceKey', 'cookie'])

/** Context flag marking a request already logged — `.route()` replays leaf middleware once per mount, so without this a root-routed request would log N times. */
const LOGGED_KEY = 'requestLogged'

const MAX_LOGGED_CHARS = 2000

/**
 * Domain label derived from the request path itself, so the tag is correct
 * no matter which mount's middleware copy runs first: root arrivals look
 * like `/accounts` or `/messaging/<platform>/…`, direct leaf-app calls look
 * like `/accounts` or `/<platform>/threads…` (the messaging app's own
 * namespace, including the legacy `/twitter` alias).
 */
function sourceForPath(path: string): string {
  const [, first, second] = path.split('/')
  if (first === 'messaging' && second) return `messaging/${second}`
  if (first === 'facebook' || first === 'x' || first === 'twitter' || first === 'reddit') {
    return `messaging/${first}`
  }
  return first || 'root'
}

/**
 * Deep copy with secret-bearing fields stripped BY NAME before stringifying —
 * never after. Non-secret fields (ids, labels, statuses) pass through, so the
 * log stays useful for debugging route shapes without becoming a second copy
 * of the secrets.
 */
export function redactForLog(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactForLog)
  if (typeof value === 'object' && value !== null) {
    const out: Record<string, unknown> = {}
    for (const [field, fieldValue] of Object.entries(value)) {
      out[field] = SENSITIVE_KEYS.has(field) ? REDACTED : redactForLog(fieldValue)
    }
    return out
  }
  return value
}

type EnvRecord = Record<string, string | undefined>

function readEnvFlag(name: string): string | undefined {
  const viteEnv = (import.meta as unknown as { env?: EnvRecord }).env?.[name]
  if (typeof viteEnv === 'string') return viteEnv
  return (globalThis as unknown as { process?: { env?: EnvRecord } }).process?.env?.[name]
}

/**
 * Opt-in gate: `VITE_MOCK_API_LOG_REQUESTS=1` (dashboard / vitest) or
 * `MOCK_API_LOG_REQUESTS=1` (standalone `mock:server`). Off by default, so a
 * shell that captures console output only ever sees request lines when
 * someone deliberately turned them on for local debugging.
 */
export function isRequestLoggingEnabled(): boolean {
  const raw = readEnvFlag('VITE_MOCK_API_LOG_REQUESTS') ?? readEnvFlag('MOCK_API_LOG_REQUESTS') ?? ''
  return raw === '1' || raw.toLowerCase() === 'true'
}

/**
 * One Hono middleware implementation shared by every leaf mock app: method,
 * path, status, elapsed ms, plus the redacted request/response bodies. Each
 * domain mounts it on its own app, so dashboard traffic — which calls each
 * sub-app directly, never the `mockApiApp` root — is logged exactly once,
 * and requests arriving through the root (tests, the standalone HTTP
 * server) inherit the same single line via `.route()`: the first middleware
 * copy to run logs (tagged from the request path, so the domain is always
 * right) and stamps the context, the replays skip. Bodies are read from
 * clones, so downstream handlers and callers still see the full, unredacted
 * payloads. The env gate is evaluated per request, so tests can toggle it
 * at runtime.
 */
export function requestLogger(options?: { enabled?: boolean }) {
  return async function requestLoggerMiddleware(c: Context, next: Next): Promise<void> {
    if (!(options?.enabled ?? isRequestLoggingEnabled())) {
      await next()
      return
    }
    if (c.get(LOGGED_KEY)) {
      await next()
      return
    }
    c.set(LOGGED_KEY, true)
    const started = Date.now()
    const requestBody = await c.req.raw.clone().json().catch(() => undefined)
    await next()
    let responseBody: unknown
    if ((c.res.headers.get('content-type') ?? '').includes('application/json')) {
      responseBody = await c.res.clone().json().catch(() => undefined)
    }
    let line = JSON.stringify({ req: redactForLog(requestBody), res: redactForLog(responseBody) })
    if (line.length > MAX_LOGGED_CHARS) line = `${line.slice(0, MAX_LOGGED_CHARS)}…[truncated]`
    console.log(`[mock-api:${sourceForPath(c.req.path)}] ${c.req.method} ${c.req.path} -> ${c.res.status} ${Date.now() - started}ms ${line}`)
  }
}
