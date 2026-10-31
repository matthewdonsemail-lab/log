import { DEVICE_PROFILE_VERSION } from '../types'
import type { DeviceProfile } from '../types'

const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value)
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

export function toDeviceProfile(raw: unknown): DeviceProfile | null {
  let value = raw
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value)
    } catch {
      return null
    }
  }
  if (!isObject(value) || value.version !== DEVICE_PROFILE_VERSION || value.os !== 'windows') return null
  if (!isObject(value.config) || !isObject(value.firefoxUserPrefs) || !isObject(value.home)) return null
  const geo = value.geolocation
  if (!isObject(geo) || !isNumber(geo.latitude) || !isNumber(geo.longitude) || !isNumber(geo.accuracy)) return null
  if (typeof value.config['navigator.userAgent'] !== 'string') return null
  return value as unknown as DeviceProfile
}

export function hasStoredDevice(raw: unknown): boolean {
  if (raw == null || raw === '') return false
  return !(isObject(raw) && Object.keys(raw).length === 0)
}

export function deviceSummary(profile: DeviceProfile | null): string {
  if (!profile) return 'none yet (made on the first launch)'
  const c = profile.config
  const screen = isNumber(c['screen.width']) && isNumber(c['screen.height']) ? `${c['screen.width']}x${c['screen.height']}` : '?'
  const gpu = typeof c['webGl:renderer'] === 'string' ? String(c['webGl:renderer']).slice(0, 60) : '?'
  return `windows ${screen}, ${gpu}, made ${profile.createdAt.slice(0, 10)} (camoufox ${profile.camoufoxVersion})`
}
