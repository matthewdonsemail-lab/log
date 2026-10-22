import { createActor, fromPromise } from 'xstate'
import type { FacebookAccount } from '../../socialAccount/types'
import { lifecycleMachine } from '../machine'
import type { AccountStanding, StepOutcome } from '../types'

export function standingOf(account: FacebookAccount): AccountStanding {
  const cookies = Array.isArray(account.cookies) ? account.cookies : []
  return {
    accountId: account.id,
    status: account.status,
    hasProxy: Boolean(account.proxy),
    hasSession: cookies.length > 0,
    profileSet: Boolean(account.profileSetAt),
    wantsName: Boolean(account.profileName),
    named: Boolean(account.profileNamedAt),
    locationSet: Boolean(account.marketplaceLocationAt),
    warmupStartedAt: account.warmupStartedAt,
    warmedAt: account.warmedAt
  }
}

export function statePath(value: unknown): string {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const [key, inner] = Object.entries(value as Record<string, unknown>)[0] ?? []
    return key ? [key, statePath(inner)].filter(Boolean).join('.') : ''
  }
  return ''
}

export function whereNow(standing: AccountStanding): { state: string; firstStep: string | null } {
  const idle = fromPromise<StepOutcome, unknown>(() => new Promise<StepOutcome>(() => {}))
  const names = ['checkProxy', 'openBrowser', 'closeBrowser', 'signIn', 'checkAccount', 'setProfile', 'setName', 'setLocation', 'warmupActivity', 'watchCheck', 'act', 'waitForActiveHours']
  const actor = createActor(lifecycleMachine.provide({ actors: Object.fromEntries(names.map((n) => [n, idle])) as never }), {
    input: { standing, liveActions: false }
  })
  actor.start()
  const snapshot = actor.getSnapshot()
  actor.stop()
  return { state: statePath(snapshot.value), firstStep: snapshot.context.trail.at(-1) ?? null }
}

export function stepsLeft(s: AccountStanding): string[] {
  if (['banned', 'dead', 'restricted'].includes(String(s.status))) return []
  const left: string[] = []
  if (!s.hasProxy) left.push('proxy')
  if (!s.hasSession || s.status === 'needsLogin') left.push('signIn')
  if (s.status === 'checkpoint') left.push('person (checkpoint)')
  if (!s.profileSet) left.push('profile')
  if (s.wantsName && !s.named) left.push('name')
  if (!s.locationSet) left.push('location')
  if (!s.warmedAt) left.push(s.warmupStartedAt ? 'warm-up (started)' : 'warm-up (a day)')
  return left
}
