import { describe, expect, test } from 'bun:test'
import { lintVersion, lintVersions, pickVersion, requiredVersions, skipWordsOf, wordDistance } from './index'
import type { CopyVersion } from './index'

const SKIP = skipWordsOf('bethlehem', 'Bethlehem, PA')

const desc = (opening: string) => `${opening}\n\nWhat we take:\n• Furniture, mattresses and appliances\n• Boxes, bags and clutter\n\nSmall load: $99\n\nSend a photo here and get your price.`

const GOOD: CopyVersion[] = [
  { id: 'photoQuote', title: 'Junk Removal Bethlehem PA – Free Quote From a Photo', description: desc("Garage you can't park in? Basement full of boxes?") },
  { id: 'garageCleanout', title: 'Garage & Basement Cleanouts Bethlehem – Same-Day Pickup', description: desc('A garage you can park in again, by tonight.') },
  { id: 'movingOut', title: 'Moving Out of Bethlehem? We Take What You Leave Behind', description: desc('Keys due back and the place still full?') }
]

describe('word distance (copy variations)', () => {
  test('the same text is 0, nothing shared is 1, and the city never counts', () => {
    expect(wordDistance('Junk Removal Bethlehem', 'junk removal, bethlehem!')).toBe(0)
    expect(wordDistance('Garage Cleanout', 'Sofa Pickup')).toBe(1)
    expect(wordDistance('Junk Removal Bethlehem PA', 'Junk Removal', SKIP)).toBe(0)
    expect(wordDistance('Garage Cleanout Bethlehem', 'Sofa Pickup Bethlehem', SKIP)).toBe(1)
  })
})

describe('pickVersion: the version least like what is live', () => {
  test('with nothing live, the first version', () => {
    expect(pickVersion(GOOD, [], { skip: SKIP })?.id).toBe('photoQuote')
  })

  test('the version furthest from every live listing wins', () => {
    const live = [{ title: GOOD[0].title, description: GOOD[0].description, copyVersionId: 'photoQuote' }]
    const picked = pickVersion(GOOD, live, { skip: SKIP })
    expect(picked?.id).not.toBe('photoQuote')
    const both = [...live, { title: GOOD[1].title, description: GOOD[1].description, copyVersionId: 'garageCleanout' }]
    expect(pickVersion(GOOD, both, { skip: SKIP })?.id).toBe('movingOut')
  })

  test('a tie goes to the version used least, then the first', () => {
    const versions: CopyVersion[] = [
      { id: 'one', title: 'Alpha Bravo', description: 'x' },
      { id: 'two', title: 'Charlie Delta', description: 'y' }
    ]
    const live = [{ title: 'Echo Foxtrot', description: 'z', copyVersionId: 'one' }]
    expect(pickVersion(versions, live)?.id).toBe('two')
    expect(pickVersion(versions, [{ title: 'Echo Foxtrot', description: 'z', copyVersionId: null }])?.id).toBe('one')
  })

  test("a replacement skips the lost copy's version when another is there", () => {
    expect(pickVersion(GOOD, [], { skip: SKIP, avoidId: 'photoQuote' })?.id).toBe('garageCleanout')
    expect(pickVersion([GOOD[0]], [], { avoidId: 'photoQuote' })?.id).toBe('photoQuote')
  })

  test('no versions, no pick', () => {
    expect(pickVersion([], [])).toBeNull()
  })

  test('how many versions an ad needs: as many as its live listings in a city, never fewer than 3', () => {
    expect(requiredVersions(1)).toBe(3)
    expect(requiredVersions(3)).toBe(3)
    expect(requiredVersions(5)).toBe(5)
  })
})

describe('the copy rules a machine can check (skills/listingCopy)', () => {
  test("the skill's good versions pass", () => {
    expect(lintVersions(GOOD, 'bethlehem', SKIP)).toEqual([])
  })

  test("each of the skill's bad titles is refused for its own rule", () => {
    const rulesOf = (title: string) => lintVersion({ id: 'bad', title, description: GOOD[0].description }, 'bethlehem').map((p) => p.rule)
    expect(rulesOf('Junk Removal & Cleanouts: Houses, Garages, Basements')).toContain('titleCity')
    expect(rulesOf('JUNK REMOVAL Bethlehem')).toContain('titleCaps')
    expect(rulesOf('Junk Removal Bethlehem ⭐')).toContain('titleSymbols')
    expect(rulesOf('Junk Removal Bethlehem!')).toContain('titleExclamation')
    expect(rulesOf('Cheapest Junk Removal Bethlehem')).toContain('titleBanned')
    expect(rulesOf('Affordable Junk Removal Bethlehem')).toContain('titleBanned')
    expect(rulesOf(`Junk Removal Bethlehem ${'x'.repeat(60)}`)).toContain('titleLength')
    expect(rulesOf('Junk Removal Bethlehem PA – Free Quote')).toEqual([])
  })

  test('a description needs a price, a list and the photo ask, and no hype', () => {
    const rulesOf = (description: string) => lintVersion({ id: 'bad', title: GOOD[0].title, description }, 'bethlehem').map((p) => p.rule)
    expect(rulesOf('Junk removal and full cleanouts in Bethlehem and nearby.')).toEqual(expect.arrayContaining(['descriptionPrice', 'descriptionList', 'descriptionPhoto']))
    expect(rulesOf(`${GOOD[0].description}\nBest service ever!!!`)).toContain('descriptionExclamation')
    expect(rulesOf(`${GOOD[0].description}\nGreat prices, limited time.`)).toContain('descriptionBanned')
    expect(rulesOf(desc('Euro prices are fine too.').replace('$99', '€99'))).toEqual([])
  })

  test('versions must differ by at least half their title words, not counting the city', () => {
    const alike: CopyVersion[] = [GOOD[0], { id: 'nearCopy', title: 'Junk Removal Bethlehem PA – Free Quote From a Pic', description: GOOD[1].description }]
    expect(lintVersions(alike, 'bethlehem', SKIP).map((p) => p.rule)).toContain('titleTooAlike')
    expect(lintVersions([GOOD[0], { ...GOOD[1], title: GOOD[0].title }], 'bethlehem', SKIP).map((p) => p.rule)).toContain('titleSame')
    expect(lintVersions([GOOD[0], { ...GOOD[1], id: 'photoQuote' }], 'bethlehem', SKIP).map((p) => p.rule)).toContain('versionIdTwice')
    expect(lintVersion({ ...GOOD[0], id: 'Not-Camel' }, 'bethlehem').map((p) => p.rule)).toContain('versionId')
  })
})
