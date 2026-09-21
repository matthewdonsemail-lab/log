/**
 * The proxy every X and Facebook helper must go through. Users never choose, see or type it: the operator
 * sets it once in the deployment environment and only a helper holding a valid ingest key can fetch it.
 * Nothing here ever logs or returns the proxy anywhere else.
 */

export type ProxyConfig = { server: string; username?: string; password?: string }
export type ProxyState = { proxy: ProxyConfig | null; required: boolean }

/** A proxy address like http://user:pass@host:port (http, https or socks5), split into the parts a browser needs. Null when unusable. */
export function parseProxyUrl(raw: string | undefined): ProxyConfig | null {
  const text = (raw ?? '').trim()
  if (!text || !/^(https?|socks5h?):\/\//i.test(text)) return null
  let url: URL
  try { url = new URL(text) } catch { return null }
  if (!url.hostname) return null
  const server = `${url.protocol}//${url.host}`
  const username = url.username ? decodeURIComponent(url.username) : undefined
  const password = url.password ? decodeURIComponent(url.password) : undefined
  return { server, ...(username ? { username } : {}), ...(password ? { password } : {}) }
}

/**
 * A proxy is mandatory. With `PROXY_URL` set, helpers use it. Without it, helpers are refused, unless the
 * operator has switched the requirement off with `PROXY_REQUIRED=false` (an operator-only escape hatch for a
 * deployment that has no proxy yet; users cannot reach it).
 */
export function proxyState(env: { PROXY_URL?: string; PROXY_REQUIRED?: string }): ProxyState {
  const proxy = parseProxyUrl(env.PROXY_URL)
  const required = (env.PROXY_REQUIRED ?? '').trim().toLowerCase() !== 'false'
  return { proxy, required }
}

/** True when a helper may run: it has a proxy to use, or the operator has waived the requirement. */
export function mayRead(state: ProxyState): boolean {
  return state.proxy !== null || !state.required
}
