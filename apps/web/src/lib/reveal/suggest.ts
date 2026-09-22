import type { BrandEntity } from '@/lib/brand'

export type KeywordSuggestion = {
  /** Plain phrase the matcher understands (whole-word match, no operators). */
  phrase: string
  /** Which real profile field it came from, shown next to the suggestion. */
  basedOn: string
}

/**
 * Candidate listening phrases derived only from what the website really
 * said: the business name (for mention tracking), the offerings Firecrawl
 * extracted, and the location it stated. Plain phrases — the matcher does
 * whole-word matching, so there are no operators to learn. Empty when the
 * profile has nothing to derive from; the caller then asks the person to
 * type their own phrase instead of inventing one.
 */
export function suggestKeywordsFromBrand(profile: BrandEntity, limit = 5): KeywordSuggestion[] {
  const out: KeywordSuggestion[] = []
  const seen = new Set<string>()
  const push = (phrase: string, basedOn: string) => {
    const clean = phrase.replace(/\s+/g, ' ').trim()
    if (!clean || out.length >= limit || seen.has(clean.toLowerCase())) return
    seen.add(clean.toLowerCase())
    out.push({ phrase: clean, basedOn })
  }
  const name = profile.identity.name.replace(/\s+/g, ' ').trim()
  if (name) push(name, 'your business name')
  const location = profile.location.label.replace(/\s+/g, ' ').trim()
  for (const offering of profile.offerings) {
    const offeringName = offering.name.replace(/\s+/g, ' ').trim()
    if (!offeringName) continue
    push(offeringName, `offering: ${offeringName}`)
    if (location) push(`${offeringName} ${location}`, `offering: ${offeringName}`)
  }
  return out
}
