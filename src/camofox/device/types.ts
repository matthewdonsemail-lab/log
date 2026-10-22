export const DEVICE_PROFILE_VERSION = 1

export interface DeviceGeolocation {
  latitude: number
  longitude: number
  accuracy: number
  source: string
}

export interface DeviceProfile {
  version: typeof DEVICE_PROFILE_VERSION
  createdAt: string
  os: 'windows'
  camoufoxVersion: string
  browserVersion: string
  config: Record<string, unknown>
  firefoxUserPrefs: Record<string, unknown>
  geolocation: DeviceGeolocation
  home: { city: string | null; country: string; timezone: string | null }
}

export interface DeviceRunFile {
  accountName: string
  locale: string
  languages: string[]
  facebookLocale: string
  homeCountry: string
  homeCity: string | null
  homeTimezone: string
  homeCoordinates: { latitude: number; longitude: number } | null
  profile: DeviceProfile | null
  created?: boolean
}
