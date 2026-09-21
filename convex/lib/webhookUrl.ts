/**
 * A webhook URL is an address our server will call on someone else's say-so, so it is checked hard: https only, a real public
 * hostname, no numbers standing in for one, no credentials, no odd ports. This cannot resolve DNS, so a public name that points at a
 * private address is not caught here; deliveries also never follow redirects and never read the response body.
 */

const MAX_URL_LENGTH = 500

// Hostnames that always mean "this machine" or "this network", and wildcard-DNS services that turn any name into a private address.
const BLOCKED_SUFFIXES = [
  '.local', '.localhost', '.internal', '.lan', '.home', '.corp', '.intranet', '.private', '.test', '.example', '.invalid',
  '.nip.io', '.sslip.io', '.xip.io', '.localtest.me', '.lvh.me', '.vcap.me',
]
const BLOCKED_NAMES = new Set(['localhost', 'nip.io', 'sslip.io', 'xip.io', 'localtest.me', 'lvh.me', 'vcap.me'])

export type WebhookUrlCheck = { ok: true; url: string } | { ok: false; reason: string }

export function checkWebhookUrl(raw: string): WebhookUrlCheck {
  const text = raw.trim()
  if (!text) return { ok: false, reason: 'Enter the address to send webhooks to.' }
  if (text.length > MAX_URL_LENGTH) return { ok: false, reason: 'That address is too long.' }
  let url: URL
  try { url = new URL(text) } catch { return { ok: false, reason: 'That address does not parse. It should look like https://example.com/hook.' } }
  if (url.protocol !== 'https:') return { ok: false, reason: 'Webhook addresses must start with https://.' }
  if (url.username || url.password) return { ok: false, reason: 'Leave the username and password out of the address.' }
  if (url.port !== '' && url.port !== '443') return { ok: false, reason: 'Webhook addresses cannot use a custom port.' }
  const host = url.hostname.toLowerCase().replace(/\.$/, '')
  if (!/^[a-z0-9.-]+$/.test(host) || host.startsWith('.') || host.includes('..')) return { ok: false, reason: 'Use a normal public website name.' }
  const labels = host.split('.')
  if (labels.length < 2 || labels.some(label => label === '' || label.length > 63)) return { ok: false, reason: 'Use a public website name, like hooks.example.com.' }
  // A numeric last label means an IP address (dotted, decimal, hex or octal): a hostname's top level is never all digits.
  if (/^(0x[0-9a-f]+|\d+)$/i.test(labels[labels.length - 1])) return { ok: false, reason: 'Use a website name, not an IP address.' }
  if (BLOCKED_NAMES.has(host) || BLOCKED_SUFFIXES.some(suffix => host.endsWith(suffix))) {
    return { ok: false, reason: 'That address points at a private or reserved name, which is not allowed.' }
  }
  url.hash = ''
  return { ok: true, url: url.toString() }
}
