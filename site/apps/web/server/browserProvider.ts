import { envValue } from '../../../../src/extensions/voiceClone/helpers/provider'
import { savedCredential, saveProviderCredentials } from '../../../../src/auth/credentials'

export function browserProviderConfig() {
  const driver = envValue('LOG_BROWSER_DRIVER') || 'adsPower'
  if (!['adsPower', 'camoufox'].includes(driver)) throw new Error('browserProviderInvalid')
  const apiUrl = envValue('ADSPOWER_HOST') || 'http://local.adspower.net:50325'
  const key = envValue('ADSPOWER_API_KEY') || ''
  return { driver: driver as 'adsPower' | 'camoufox', apiUrl, hasKey: !!key, configured: driver === 'camoufox' || !!envValue('ADSPOWER_HOST') || !!key }
}
export function browserProviderKeys() { return { ...browserProviderConfig(), key: envValue('ADSPOWER_API_KEY') || '' } }
export async function saveBrowserProvider(input: Record<string, unknown>) {
  if (input.driver !== 'adsPower') throw new Error('consoleInputInvalid')
  if (typeof input.homes !== 'string') throw new Error('credentialInputInvalid')
  const homes = input.homes.trim().toLowerCase() === 'all' ? 'all' : [...new Set(input.homes.split(',').map((value) => value.trim().toUpperCase()))].join(',')
  if (homes !== 'all' && !/^[A-Z]{2}(,[A-Z]{2})*$/.test(homes)) throw new Error('credentialInputInvalid')
  const values: Record<string, string> = { LOG_BROWSER_DRIVER: input.driver, LOG_ADSPOWER_HOMES: homes }
  if (input.driver === 'adsPower') {
    if (typeof input.apiUrl !== 'string' || typeof input.key !== 'string') throw new Error('consoleInputInvalid')
    const url = new URL(input.apiUrl)
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error('consoleInputInvalid')
    const apiUrl = url.origin
    const key = input.key.trim()
    if (key.length > 8192 || /[\r\n\0"']/.test(key)) throw new Error('consoleInputInvalid')
    let response: Response
    try { response = await fetch(`${apiUrl}/status`, { headers: key ? { Authorization: `Bearer ${key}` } : {}, redirect: 'error', signal: AbortSignal.timeout(8000) }) } catch { throw new Error('browserProviderUnavailable') }
    const answer = await response.json().catch(() => null)
    if (!response.ok || answer?.code !== 0) throw new Error('browserProviderUnavailable')
    values.ADSPOWER_HOST = apiUrl
    if (key) values.ADSPOWER_API_KEY = key
    else if (browserProviderConfig().hasKey) throw new Error('browserProviderKeyRequired')
  }
  saveProviderCredentials('browser', values)
  if (savedCredential('LOG_ADSPOWER_HOMES') !== homes) throw new Error('credentialSaveUnconfirmed')
  return browserProviderConfig()
}
