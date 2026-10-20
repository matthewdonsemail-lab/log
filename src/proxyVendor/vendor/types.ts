/**
 * Where an account's proxy comes from, whichever provider (docs/proxyVendors/,
 * AGENTS.md rules 12, 43, 51). Twenty keeps one thing per account, the
 * socialAccount's `proxy` URL (scheme://user:pass@host:port, rule 13): the
 * provider is read from its host, so nothing else is stored and every launch,
 * gate and check works the same on any provider. Each provider is a domain of
 * its own beside this one (`proxyVendor/twoCaptcha`, `proxyVendor/byteful`).
 */
export type ProxyVendorName = 'twoCaptcha' | 'byteful'

export const PROXY_VENDORS: readonly ProxyVendorName[] = ['twoCaptcha', 'byteful']

/** What a provider's proxy is billed by: traffic (residential) or per IP (static). */
export type ProxyBilling = 'traffic' | 'perIp'
