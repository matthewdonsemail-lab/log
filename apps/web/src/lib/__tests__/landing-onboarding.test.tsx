import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LandingPage } from '../../landing/LandingPage'
import { clearLandingWebsite, readLandingWebsite, saveLandingWebsite } from '../../pages/onboarding/auth-handoff'

// The suite runs in Node, so give the handoff a session storage to talk to.
const store = new Map<string, string>()
beforeEach(() => {
  store.clear()
  vi.stubGlobal('window', {
    sessionStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => { store.set(key, value) },
      removeItem: (key: string) => { store.delete(key) },
    },
  })
})
afterEach(() => { vi.unstubAllGlobals() })

describe('the landing page leads into onboarding', () => {
  const html = renderToStaticMarkup(<MemoryRouter><LandingPage /></MemoryRouter>)

  it('has a header with only the logo, sign in and get started', () => {
    for (const gone of ['Features', 'Resources', 'Pricing', 'Changelog']) expect(html, gone).not.toMatch(new RegExp(`>${gone}<`))
    expect(html).toContain('>Sign in<')
    expect(html).toContain('href="/onboarding"')
    expect(html).toContain('>Get started<')
  })

  it('turns the website form into the first step, with a label a screen reader can find', () => {
    expect(html).toContain('name="website"')
    expect(html).toContain('aria-label="Your website"')
    expect(html).not.toContain('Find creators')
  })
})

describe('the website typed on the landing page', () => {
  it('waits for onboarding, trimmed and capped, and can be cleared', () => {
    expect(readLandingWebsite()).toBe('')
    saveLandingWebsite('   acmebooks.com  ')
    expect(readLandingWebsite()).toBe('acmebooks.com')
    saveLandingWebsite('x'.repeat(500))
    expect(readLandingWebsite()).toHaveLength(200)
    clearLandingWebsite()
    expect(readLandingWebsite()).toBe('')
  })

  it('ignores an empty box, so it never overwrites an earlier address with nothing', () => {
    saveLandingWebsite('acmebooks.com')
    saveLandingWebsite('   ')
    expect(readLandingWebsite()).toBe('acmebooks.com')
  })
})
