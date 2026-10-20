import type { ProxyBilling, ProxyVendorName } from '../types'

/** Each provider's gateway hosts. A static IP's host is the IP itself, so it isn't listed here. */
const HOSTS: { vendor: ProxyVendorName; billing: ProxyBilling; host: RegExp }[] = [
  { vendor: 'twoCaptcha', billing: 'traffic', host: /(^|\.)proxy\.2captcha\.com$/i },
  { vendor: 'byteful', billing: 'traffic', host: /(^|\.)byteful\.com$/i }
]

/** The provider and billing of an account's proxy URL, from its host; null when it isn't one of ours (a static IP, or none). Pure. */
export function vendorOfProxy(proxy: string | null | undefined): { vendor: ProxyVendorName; billing: ProxyBilling } | null {
  if (!proxy) return null
  let host: string
  try {
    host = new URL(proxy).hostname
  } catch {
    return null
  }
  const hit = HOSTS.find((h) => h.host.test(host))
  return hit ? { vendor: hit.vendor, billing: hit.billing } : null
}

/** `twoCaptcha`, `byteful` from a flag, any case; null when it isn't a provider. Pure. */
export function parseVendor(value: string | undefined): ProxyVendorName | null {
  const v = (value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
  if (v === 'twocaptcha' || v === '2captcha') return 'twoCaptcha'
  if (v === 'byteful') return 'byteful'
  return null
}
