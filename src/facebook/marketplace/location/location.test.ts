import { describe, expect, test } from 'bun:test'
import { countryOfLocation } from '../../../browser/proxy/index'
import { parseInspectAction } from '../../../browser/inspect/index'
import { toPublishListing } from '../../../marketplace/agencyListing/index'
import type { AgencyListing } from '../../../marketplace/agencyListing/index'
import { fullPlaceName, placeProblem } from './index'

describe('placeProblem: a Marketplace location is typed written out', () => {
  test('"City, State" written out and "City, Country" pass', () => {
    expect(placeProblem('Bethlehem, Pennsylvania')).toBeNull()
    expect(placeProblem('Wilkes-Barre, Pennsylvania')).toBeNull()
    expect(placeProblem('Galway, Ireland')).toBeNull()
    expect(placeProblem('Manchester, United Kingdom')).toBeNull()
  })

  test('a state code is refused and named in full, whatever its case', () => {
    expect(placeProblem('Bethlehem, PA')?.detail).toContain('write "PA" out as "Pennsylvania"')
    expect(placeProblem('Bethlehem, pa')?.detail).toContain('"Pennsylvania"')
    expect(placeProblem('Bethlehem, PA')?.code).toBe('locationAbbreviated')
  })

  test('any acronym, a zip, a number or a place with no region is refused', () => {
    expect(placeProblem('Dublin, IE')?.detail).toContain('write "IE" out in full')
    expect(placeProblem('Bethlehem, Pennsylvania, USA')?.detail).toContain('"USA"')
    expect(placeProblem('18015')?.detail).toContain('Granada, Spain')
    expect(placeProblem('Bethlehem, Pennsylvania 18015')?.detail).toContain('a number')
    expect(placeProblem('Bethlehem')?.detail).toContain('names no state or country')
    expect(placeProblem('')).not.toBeNull()
  })

  test('fullPlaceName writes a state code out', () => {
    expect(fullPlaceName('bethlehem', 'PA')).toBe('Bethlehem, Pennsylvania')
    expect(fullPlaceName('Galway', 'Ireland')).toBe('Galway, Ireland')
  })
})

describe('the check blocks before any action', () => {
  test('inspect do setLocation refuses an abbreviation and passes a written-out place', () => {
    const refused = parseInspectAction(['setLocation', 'Bethlehem, PA'])
    expect(refused.ok).toBe(false)
    if (!refused.ok) expect(refused.error).toStartWith('locationAbbreviated')
    expect(parseInspectAction(['setLocation', 'Bethlehem, Pennsylvania']).ok).toBe(true)
  })

  test('a listing whose locationQuery is abbreviated cannot be created or published', () => {
    const ad: AgencyListing = {
      id: 'bethlehem', title: 'Junk Removal Bethlehem', description: 'Send a photo', price: 99, priceCurrency: 'USD', category: 'Miscellaneous', condition: 'new',
      photos: ['/photos/van.png'], locationQuery: 'Bethlehem, PA', locationCity: 'bethlehem', locationCountry: 'US', locationPostalCode: null,
      status: null, socialAccountId: null, campaignId: null, replacesId: null, generation: 0, listingId: null, listingUrl: null, publishedAt: null,
      lastRunAt: null, lastRunResult: null, lastErrorCode: null, lastError: null, clicksCount: null, lastCheckedAt: null, copyVersions: [], copyVersionId: null
    }
    const checked = toPublishListing(ad)
    expect(checked.ok).toBe(false)
    if (!checked.ok) expect(checked.problems.join(' ')).toContain('write "PA" out as "Pennsylvania"')
    expect(toPublishListing({ ...ad, locationQuery: 'Bethlehem, Pennsylvania' }).ok).toBe(true)
  })

  test('a written-out state is a US place for the country check', () => {
    expect(countryOfLocation('Bethlehem, Pennsylvania')).toBe('US')
    expect(countryOfLocation('Galway, Ireland')).toBe('IE')
  })
})
