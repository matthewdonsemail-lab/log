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

describe('the landing page leads to the repository and sign-in', () => {
  const html = renderToStaticMarkup(<MemoryRouter><LandingPage /></MemoryRouter>)

  it('has a header with the landing nav, the GitHub buttons and get started', () => {
    for (const shown of ['Features', 'How it works', 'Use cases', 'Why free']) expect(html, shown).toContain(`>${shown}<`)
    for (const gone of ['Resources', 'Pricing', 'Changelog']) expect(html, gone).not.toMatch(new RegExp(`>${gone}<`))
    expect(html).toMatch(/aria-label="\d+ stars across our open-source projects"/)
    expect(html).toContain('aria-label="matthewdonsemail-lab/log on GitHub"')
    expect(html).toContain('>Get started<')
  })

  it('offers sign-in without exposing onboarding or dashboard links', () => {
    expect(html).toContain('href="/sign-in"')
    expect(html).toContain('>Sign in<')
    for (const gone of ['/onboarding', '/sign-up', '/dashboard']) expect(html, gone).not.toContain(`href="${gone}`)
  })

  it('points every get started at the repository', () => {
    const starts = html.match(/href="[^"]*"[^>]*>(?:<[^>]+>)*\s*Get started/g) ?? []
    expect(starts.length).toBeGreaterThan(0)
    for (const start of starts) expect(start).toContain('href="https://github.com/matthewdonsemail-lab/log"')
  })

  it('swaps the website form for the big GitHub button, in the hero and in Control', () => {
    expect(html).not.toContain('name="website"')
    expect(html).not.toContain('Enter your website')
    expect(html.match(/Get Log by ListeningKit/g)?.length).toBe(2)
    expect(html).toContain('alt="Find new customers"')
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
