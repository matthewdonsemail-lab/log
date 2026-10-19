/**
 * The account's proxy (Twenty `socialAccounts.proxy`, a URL) as AdsPower's
 * `user_proxy_config`. Put on the profile only for the open, and taken off at close
 * (`NO_PROXY`), so the proxy lives in AdsPower only while its browser is open. Pure.
 */
export const NO_PROXY: Record<string, string> = { proxy_soft: 'no_proxy' }

export function proxyConfig(proxyUrl: string): Record<string, string> | null {
  let url: URL
  try {
    url = new URL(proxyUrl.includes('://') ? proxyUrl : `http://${proxyUrl}`)
  } catch {
    return null
  }
  const type = url.protocol.replace(':', '')
  if (!['http', 'https', 'socks5'].includes(type) || !url.hostname || !url.port) return null
  return {
    proxy_soft: 'other',
    proxy_type: type,
    proxy_host: url.hostname,
    proxy_port: url.port,
    proxy_user: decodeURIComponent(url.username),
    proxy_password: decodeURIComponent(url.password)
  }
}
