import { describe, expect, test } from 'bun:test'
import { allowedTransition, listingActions } from './machine'

describe('allowedTransition', () => {
  test('seller can sell or remove an active listing', () => {
    expect(allowedTransition('active', 'sold', 'seller').allowed).toBe(true)
    expect(allowedTransition('active', 'removed', 'seller').allowed).toBe(true)
  })

  test('only the platform moves a listing out of review to active', () => {
    expect(allowedTransition('under-review', 'active', 'seller').allowed).toBe(false)
    expect(allowedTransition('under-review', 'active', 'platform').allowed).toBe(true)
  })

  test('a platform takedown blocks the seller relist', () => {
    const verdict = allowedTransition('removed', 'active', 'seller', { removedBy: 'platform' })
    expect(verdict.allowed).toBe(false)
    expect(verdict.reason).toContain('request a review')
    expect(allowedTransition('removed', 'active', 'seller', { removedBy: 'seller' }).allowed).toBe(true)
  })

  test('a write-blocked account refuses seller writes', () => {
    expect(allowedTransition('active', 'sold', 'seller', { accountIssue: 'suspended' }).allowed).toBe(false)
  })

  test('observation states belong to the platform', () => {
    expect(allowedTransition('active', 'login-wall', 'seller').allowed).toBe(false)
    expect(allowedTransition('active', 'login-wall', 'platform').allowed).toBe(true)
  })
})

describe('listingActions', () => {
  test('a sold listing offers mark-available, not relist', () => {
    const actions = listingActions('sold')
    expect(actions.markAvailable).toBe(true)
    expect(actions.relist).toBe(false)
  })
})
