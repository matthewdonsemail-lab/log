import { describe, expect, it } from 'vitest'
import { accountStateNotification, accountStateView } from './state'
import type { ConnectionRecord } from '../connections/types'

const base: ConnectionRecord = {
  id: 'test-account',
  platform: 'facebook',
  label: 'Test account',
  connectedAt: '2026-09-16T00:00:00.000Z',
  lastIssue: null,
  rawSignal: null,
  lastCheckedAt: '2026-09-16T01:00:00.000Z',
  retryAfter: null
}

describe('account state contract', () => {
  it('turns a challenge into an actionable component state', () => {
    const record = { ...base, lastIssue: 'captcha_html' as const, rawSignal: { status: 200, marker: 'captcha' } }
    const view = accountStateView(record)

    expect(view.state).toBe('action_required')
    expect(view.action).toBe('open_challenge')
    expect(view.requiresAction).toBe(true)
    expect(view.issue?.label).toBe('Captcha interstitial (false success)')
  })

  it('does not require user action for a transient rate limit', () => {
    const record = { ...base, lastIssue: 'rate_limited' as const, rawSignal: { status: 429 } }
    const view = accountStateView(record)

    expect(view.state).toBe('degraded')
    expect(view.action).toBe('wait')
    expect(view.requiresAction).toBe(false)
  })

  it('emits one notification when a healthy account enters a challenge', () => {
    const next = { ...base, lastIssue: 'checkpointed' as const, rawSignal: { code: 190, subcode: 459 } }
    const event = accountStateNotification(base, next)

    expect(event?.type).toBe('account-state-changed')
    expect(event?.issue).toBe('checkpointed')
    expect(event?.requiresAction).toBe(true)
  })

  it('surfaces the platform-specific remediation copy in the notification', () => {
    const next = { ...base, lastIssue: 'checkpointed' as const, rawSignal: { code: 190, subcode: 459 } }
    const event = accountStateNotification(base, next)

    expect(event?.title).toBe('Checkpoint challenge')
    expect(event?.detail).toBe('Log in at facebook.com in a normal browser and clear the checkpoint, then re-export the cookie.')
  })

  it('emits a recovery notification when the issue clears', () => {
    const previous = { ...base, lastIssue: 'checkpointed' as const, rawSignal: { code: 190, subcode: 459 } }
    const event = accountStateNotification(previous, base)

    expect(event?.issue).toBeNull()
    expect(event?.state).toBe('healthy')
    expect(event?.requiresAction).toBe(false)
  })

  it('does not emit duplicate notifications for the same state', () => {
    const event = accountStateNotification(base, base)
    expect(event).toBeNull()
  })
})
