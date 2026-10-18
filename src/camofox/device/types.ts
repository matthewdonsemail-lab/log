/**
 * One device per account (AGENTS.md rule 15). The first launch for an account
 * generates a Camoufox identity (Windows, like this PC's real GPU and fonts),
 * and every later launch replays it exactly: same user agent, screen, WebGL,
 * fonts, voices, and canvas/audio/font-spacing seeds. It lives in Twenty on
 * `socialAccounts.deviceProfile` (RAW_JSON) and reaches Python through the
 * run's private `device.json`, like the proxy. It is never printed.
 *
 * Only Camoufox's own config (what it would send as CAMOU_CONFIG_*) and the
 * Firefox prefs are kept. Never the environment `launch_options()` copies:
 * that holds every secret in the process. Values that belong to one launch
 * (timezone, WebRTC IP, locale, humanize, cursor, addon paths) are set fresh
 * each time by python/proxyGate.py and never stored.
 */

export const DEVICE_PROFILE_VERSION = 1

export interface DeviceGeolocation {
  latitude: number
  longitude: number
  /** Metres, pinned per account (20-1500), never Camoufox's 1e-10. */
  accuracy: number
  /** `geoLite2City` (the home city, looked up once) or `exitIp` (fallback). */
  source: string
}

export interface DeviceProfile {
  version: typeof DEVICE_PROFILE_VERSION
  createdAt: string
  os: 'windows'
  /** The camoufox Python package and browser it was generated with. */
  camoufoxVersion: string
  browserVersion: string
  /** Camoufox config: navigator, screen, window, WebGL, fonts, voices, seeds. */
  config: Record<string, unknown>
  firefoxUserPrefs: Record<string, unknown>
  geolocation: DeviceGeolocation
  home: { city: string | null; country: string; timezone: string | null }
}

/** What `device.json` holds for one run (written by `camofox/run`, read by python/proxyGate.py). */
export interface DeviceRunFile {
  accountName: string
  locale: string
  /** navigator.languages, e.g. ["en-IE", "en"]. */
  languages: string[]
  facebookLocale: string
  homeCountry: string
  homeCity: string | null
  homeTimezone: string
  /** The stored device, or null on the account's first launch. */
  profile: DeviceProfile | null
  /** Set by Python when it generated `profile` in this run, so it gets saved to Twenty. */
  created?: boolean
}
