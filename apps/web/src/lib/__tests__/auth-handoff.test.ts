import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { readAuthSource, saveAuthSource, clearAuthSource } from '../../pages/onboarding/auth-handoff'

beforeEach(() => {
  const data = new Map<string, string>()
  vi.stubGlobal('window', { sessionStorage: {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
  } })
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
