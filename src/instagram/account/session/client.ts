import { join } from 'node:path'
import { findPlatformAccount, platformGate, recordPlatformSession, runPlatformEngine, runPlatformEngineLive } from '../../../platformKit/session/index'
import type { PlatformAccount, PlatformEngineRun, PlatformEngineSpec, PlatformGate, PlatformShape } from '../../../platformKit/session/index'
import type { TwentyClient } from '../../../twenty/graphql/index'

export const INSTAGRAM_PLATFORM: PlatformShape = {
  platform: 'instagram',
  twentyPlatform: 'INSTAGRAM',
  label: 'Instagram',
  engine: join(import.meta.dir, '..', '..', '..', '..', 'python', 'instagramApi', 'engine.py'),
  sessionCookies: ['sessionid', 'ds_user_id', 'csrftoken']
}

export const INSTAGRAM_COOKIE_DOMAIN = '.instagram.com'

export function findInstagramAccount(twenty: TwentyClient, ref: string): Promise<PlatformAccount> {
  return findPlatformAccount(twenty, INSTAGRAM_PLATFORM, ref)
}

export function instagramGate(account: PlatformAccount): PlatformGate {
  return platformGate(account, INSTAGRAM_PLATFORM)
}

export function runInstagramEngine(account: PlatformAccount, spec: PlatformEngineSpec): PlatformEngineRun {
  return runPlatformEngine(INSTAGRAM_PLATFORM, account, spec)
}

export function runInstagramEngineLive(account: PlatformAccount, spec: PlatformEngineSpec, onLive: (event: Record<string, unknown>) => void): Promise<PlatformEngineRun> {
  return runPlatformEngineLive(INSTAGRAM_PLATFORM, account, spec, onLive)
}

export function recordInstagramSession(twenty: TwentyClient, account: PlatformAccount, run: PlatformEngineRun, now: Date): Promise<string[]> {
  return recordPlatformSession(twenty, INSTAGRAM_PLATFORM, account, run, now, INSTAGRAM_COOKIE_DOMAIN)
}
