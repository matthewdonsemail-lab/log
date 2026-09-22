import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEMO_ONLY_PATHS, NAV, navItems } from '../../components/DashboardSidebar'

afterEach(() => vi.unstubAllEnvs())

describe('the dashboard menu', () => {
  it('shows every page in demo mode', () => {
    vi.stubEnv('VITE_API_MODE', 'mock')
    expect(navItems()).toEqual(NAV)
  })

  it('hides the pages that only have mock data on the live site, and keeps the real ones', () => {
    vi.stubEnv('VITE_API_MODE', 'live')
    vi.stubEnv('VITE_CONVEX_URL', 'https://example.convex.cloud')
    const labels = navItems().map((item) => item.label)
    expect(labels).toEqual(['Feed', 'Keywords', 'Accounts', 'Messages', 'Docs', 'API', 'Settings'])
    expect(DEMO_ONLY_PATHS).toEqual(['/dashboard/groups', '/dashboard/facebook/listings', '/dashboard/analytics', '/dashboard/brand'])
  })
})
