import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'

const layout = readFileSync(fileURLToPath(new URL('../../components/DashboardLayout.tsx', import.meta.url)), 'utf8')

// The header is clipped to a squircle with clip-path, which also blocks taps on anything painted outside its box.
// The mobile bottom bar is `fixed`, so when it was a child of the header the menu and tabs could not be tapped on a phone.
it('renders the mobile nav beside the header, never inside it', () => {
  expect(layout).toMatch(/<DashboardMobileNav \/>/)
  expect(layout).not.toMatch(/<DashboardHeader>[\s\S]*<DashboardMobileNav[\s\S]*<\/DashboardHeader>/)
})
