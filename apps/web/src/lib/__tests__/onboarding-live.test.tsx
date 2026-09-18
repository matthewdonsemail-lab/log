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
    expect(LIVE_PLATFORMS).toEqual(['reddit'])
  })
})

describe('onboarding first step', () => {
  it('offers all three platforms in live and demo mode alike', () => {
    for (const [mode, url] of [['live', 'https://example.convex.cloud'], ['mock', '']]) {
      vi.stubEnv('VITE_API_MODE', mode)
      vi.stubEnv('VITE_CONVEX_URL', url)
      const html = render()
      expect(html).toContain('Where should we listen?')
      expect(html.match(/Tap to select/g)).toHaveLength(3)
      expect(html).not.toContain('Coming soon')
    }
  })
})
