import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readAuthSource, saveAuthSource, clearAuthSource, readOnboardingProgress, saveOnboardingProgress, clearOnboardingProgress } from '../../pages/onboarding/auth-handoff'

beforeEach(() => {
  const sessionData = new Map<string, string>()
  const localData = new Map<string, string>()
  const store = (data: Map<string, string>) => ({
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value) },
    removeItem: (key: string) => { data.delete(key) },
  })
  vi.stubGlobal('window', { sessionStorage: store(sessionData), localStorage: store(localData) })
})
afterEach(() => vi.unstubAllGlobals())

it('carries only the confirmed platform through OAuth and can consume it once', () => {
  expect(readAuthSource()).toBeNull()
  saveAuthSource('reddit')
  expect(readAuthSource()).toBe('reddit')
  clearAuthSource()
  expect(readAuthSource()).toBeNull()
})
it('does not persist arbitrary text or tokens', () => {
  saveAuthSource('not-a-platform-or-a-token')
  expect(readAuthSource()).toBeNull()
})
it('tolerates unavailable storage', () => {
  vi.stubGlobal('window', { get sessionStorage() { throw new Error('blocked') } })
  expect(() => saveAuthSource('x')).not.toThrow()
  expect(readAuthSource()).toBeNull()
  expect(() => clearAuthSource()).not.toThrow()
})

describe('onboarding progress', () => {
  it('records the furthest step, clears, and ignores junk', () => {
    expect(readOnboardingProgress()).toBeNull()
    saveOnboardingProgress('reveal')
    expect(readOnboardingProgress()).toBe('reveal')
    clearOnboardingProgress()
    expect(readOnboardingProgress()).toBeNull()
  })

  it('never moves backwards once recorded', () => {
    saveOnboardingProgress('tokens')
    saveOnboardingProgress('website')
    expect(readOnboardingProgress()).toBe('tokens')
  })
})
