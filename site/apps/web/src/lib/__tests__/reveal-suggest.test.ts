import { describe, expect, it } from 'vitest'
import type { BrandEntity } from '../brand/types'
import { suggestKeywordsFromBrand } from '../reveal/suggest'

function brand(over: Partial<BrandEntity> = {}): BrandEntity {
  return {
    id: 'brand-default',
    identity: { name: 'Acme Plumbing', website: 'https://acmeplumbing.com', tagline: 'Heard across social' },
    location: { label: 'Leeds', lat: 53.8, lng: -1.55, radiusKm: 10 },
    voice: { tone: 'Friendly', formality: 'professional', dos: [], donts: [], examples: [] },
    offerings: [{ name: 'Emergency callouts', detail: 'Day and night' }, { name: 'Boiler installs', detail: '' }],
    sources: [],
    channels: {} as BrandEntity['channels'],
    memory: { rules: [] },
    intelligence: { competitors: [], targetCommunities: [] },
    sourceUrl: 'https://acmeplumbing.com/',
    updatedAt: new Date(0).toISOString(),
    ...over,
  }
}

describe('keyword suggestions from the brand', () => {
  it('derives plain phrases from the name, offerings and location', () => {
    expect(suggestKeywordsFromBrand(brand())).toEqual([
      { phrase: 'Acme Plumbing', basedOn: 'your business name' },
      { phrase: 'Emergency callouts', basedOn: 'offering: Emergency callouts' },
      { phrase: 'Emergency callouts Leeds', basedOn: 'offering: Emergency callouts' },
      { phrase: 'Boiler installs', basedOn: 'offering: Boiler installs' },
      { phrase: 'Boiler installs Leeds', basedOn: 'offering: Boiler installs' },
    ])
  })

  it('skips the location forms when no location was read', () => {
    const profile = brand({ location: { label: '', lat: 0, lng: 0, radiusKm: 10 } })
    expect(suggestKeywordsFromBrand(profile).map((s) => s.phrase)).toEqual([
      'Acme Plumbing',
      'Emergency callouts',
      'Boiler installs',
    ])
  })

  it('returns nothing to derive from when the read found nothing', () => {
    const profile = brand({
      identity: { name: '', website: '', tagline: '' },
      location: { label: '', lat: 0, lng: 0, radiusKm: 10 },
      offerings: [],
    })
    expect(suggestKeywordsFromBrand(profile)).toEqual([])
  })

  it('dedupes and caps the list', () => {
    const profile = brand({
      offerings: [
        { name: 'Drains', detail: '' },
        { name: 'drains', detail: '' },
        { name: 'Leaks', detail: '' },
        { name: 'Boilers', detail: '' },
      ],
    })
    const phrases = suggestKeywordsFromBrand(profile).map((s) => s.phrase)
    expect(phrases).toHaveLength(5)
    expect(new Set(phrases.map((p) => p.toLowerCase())).size).toBe(5)
  })
})
