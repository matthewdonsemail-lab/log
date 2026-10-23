import type { ProxyBilling, ProxyVendorName } from '../types'

const HOSTS: { vendor: ProxyVendorName; billing: ProxyBilling; host: RegExp }[] = [
  { vendor: 'twoCaptcha', billing: 'traffic', host: /(^|\.)proxy\.2captcha\.com$/i },
  { vendor: 'byteful', billing: 'traffic', host: /(^|\.)byteful\.com$/i }
]

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

export function parseVendor(value: string | undefined): ProxyVendorName | null {
  const v = (value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
  if (v === 'twocaptcha' || v === '2captcha') return 'twoCaptcha'
  if (v === 'byteful') return 'byteful'
  return null
}
