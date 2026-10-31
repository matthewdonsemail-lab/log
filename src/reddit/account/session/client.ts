import { join } from 'node:path'
import { findPlatformAccount, platformGate, recordPlatformSession, runPlatformEngine } from '../../../platformKit/session/index'
import type { PlatformAccount, PlatformEngineRun, PlatformEngineSpec, PlatformGate, PlatformShape } from '../../../platformKit/session/index'
import type { TwentyClient } from '../../../twenty/graphql/index'

export const REDDIT_PLATFORM: PlatformShape = {
  platform: 'reddit',
  twentyPlatform: 'REDDIT',
  label: 'Reddit',
  engine: join(import.meta.dir, '..', '..', '..', '..', 'python', 'redditApi', 'engine.py'),
  sessionCookies: ['reddit_session']
}

export const REDDIT_COOKIE_DOMAIN = '.reddit.com'

export function findRedditAccount(twenty: TwentyClient, ref: string): Promise<PlatformAccount> {
  return findPlatformAccount(twenty, REDDIT_PLATFORM, ref)
}

export function redditGate(account: PlatformAccount): PlatformGate {
  return platformGate(account, REDDIT_PLATFORM)
}

export function runRedditEngine(account: PlatformAccount, spec: PlatformEngineSpec): PlatformEngineRun {
  return runPlatformEngine(REDDIT_PLATFORM, account, spec)
}

export function recordRedditSession(twenty: TwentyClient, account: PlatformAccount, run: PlatformEngineRun, now: Date): Promise<string[]> {
  return recordPlatformSession(twenty, REDDIT_PLATFORM, account, run, now, REDDIT_COOKIE_DOMAIN)
}
