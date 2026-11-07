import { homedir } from 'node:os'
import { join } from 'node:path'

export const MOBILE_OSES = ['android', 'apple'] as const
export type MobileOs = (typeof MOBILE_OSES)[number]

export const MOBILE_PROVIDERS = ['usb', 'geelark'] as const
export type MobileProvider = (typeof MOBILE_PROVIDERS)[number]

export const APP_PACKAGES: Record<string, { android: string; apple: string }> = {
  snapchat: { android: 'com.snapchat.android', apple: 'com.toyopagroup.picaboo' },
  reddit: { android: 'com.reddit.frontpage', apple: 'com.reddit.Reddit' },
  instagram: { android: 'com.instagram.android', apple: 'com.burbn.instagram' },
  twitter: { android: 'com.twitter.android', apple: 'com.atebits.Tweetie2' },
  discord: { android: 'com.discord', apple: 'com.hammerandchisel.discord' },
  facebook: { android: 'com.facebook.katana', apple: 'com.facebook.Facebook' },
  tiktok: { android: 'com.zhiliaoapp.musically', apple: 'com.zhiliaoapp.musically' },
}

export interface MobileDevice {
  os: MobileOs
  provider: MobileProvider
  id: string
  state: string
  name: string
  detail: string
}

export interface MobileBinding {
  account: string
  platform: string
  os: MobileOs
  provider: MobileProvider
  deviceId: string
  boundAt: string
  by: string
}

export const MOBILE_DIR_ENV = 'LOG_MOBILE_DIR'
export const ADB_ENV = 'LOG_ADB'

export function mobileDir(env: Record<string, string | undefined> = process.env, home = homedir()): string {
  return env[MOBILE_DIR_ENV]?.trim() || join(home, '.logCli', 'mobile')
}

export function bindingsFile(dir = mobileDir()): string {
  return join(dir, 'bindings.json')
}

export const APPLE_NOT_BUILT = 'log mobile apple is not built yet: iPhones run through Appium XCUITest on a Mac worker (github.com/matthewdonsemail-lab/log/issues/81)'
