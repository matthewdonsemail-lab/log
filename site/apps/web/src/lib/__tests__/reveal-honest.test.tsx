import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { BrandEntity } from '../brand/types'
import { BrandRevealStep } from '../../components/onboarding/BrandRevealStep'

const profile: BrandEntity = {
  id: 'brand-default',
  identity: { name: 'Acme Plumbing', website: 'https://acmeplumbing.com', tagline: 'Heard across social' },
  location: { label: 'Leeds', lat: 53.8, lng: -1.55, radiusKm: 10 },
  voice: { tone: 'Friendly', formality: 'professional', dos: [], donts: [], examples: [] },
  offerings: [{ name: 'Emergency callouts', detail: 'Day and night' }],
  sources: [],
  channels: {} as BrandEntity['channels'],
  memory: { rules: [] },
  intelligence: { competitors: [], targetCommunities: [] },
  sourceUrl: 'https://acmeplumbing.com/',
  updatedAt: new Date(0).toISOString(),
}

describe('the reveal shows only real data', () => {
  it('streams the live pages stage with no mock rows', () => {
    const html = renderToStaticMarkup(<BrandRevealStep profile={profile} onContinue={() => {}} />)
    expect(html).toContain('Tracking Acme Plumbing')
    expect(html).toContain('Reading acmeplumbing.com')
    for (const mock of ['BluePipe', 'RapidFix', 'HomeServe', 'ProDrain', 'Fixly', 'Edmonton', 'about-us', 'Found Competitor', 'DataForSEO', 'Treg']) {
      expect(html, mock).not.toContain(mock)
    }
  })
})
