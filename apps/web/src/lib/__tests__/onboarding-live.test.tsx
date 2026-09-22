import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider } from '@listeningkit/ui'
import { LIVE_PLATFORMS, landingPath } from '../platform-support'
import { OnboardingSteps } from '../../pages/onboarding/OnboardingSteps'

afterEach(() => { vi.unstubAllEnvs() })

const render = () =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={['/onboarding']}>
      <ToastProvider><OnboardingSteps requireSignIn /></ToastProvider>
    </MemoryRouter>,
  )

describe('platform support', () => {
  it('lands on the keywords question when live, and the feed in demo mode', () => {
    vi.stubEnv('VITE_API_MODE', 'live')
    vi.stubEnv('VITE_CONVEX_URL', 'https://example.convex.cloud')
    expect(landingPath()).toBe('/dashboard/keywords')
    vi.stubEnv('VITE_API_MODE', 'mock')
    vi.stubEnv('VITE_CONVEX_URL', '')
    expect(landingPath()).toBe('/dashboard')
    expect(LIVE_PLATFORMS).toEqual(['reddit', 'x', 'facebook'])
  })
})

describe('onboarding first step', () => {
  it('starts on the website step, not platform selection', () => {
    for (const [mode, url] of [['live', 'https://example.convex.cloud'], ['mock', '']]) {
      vi.stubEnv('VITE_API_MODE', mode)
      vi.stubEnv('VITE_CONVEX_URL', url)
      const html = render()
      expect(html).toContain('Whose brand are we listening for?')
      expect(html).not.toContain('Where should we listen?')
    }
  })

  it('skips the website step when a landing website is waiting', () => {
    const data = new Map<string, string>([['listeningkit.landing-website', 'acmebooks.com']])
    vi.stubGlobal('window', {
      sessionStorage: {
        getItem: (key: string) => data.get(key) ?? null,
        setItem: (key: string, value: string) => { data.set(key, value) },
        removeItem: (key: string) => { data.delete(key) },
      },
    })
    try {
      const html = render()
      expect(html).not.toContain('Whose brand are we listening for?')
      // Static render runs no effects, so the client-side lookup fallback shows.
      expect(html).toContain('Enter your website')
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
