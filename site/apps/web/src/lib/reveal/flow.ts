/**
 * Brand-reveal flow model: the mock group-finding queries the (hidden, demo)
 * related-chains still present. Every stage of the onboarding reveal itself
 * is driven by real data — a live Firecrawl map, the person's own typed
 * input, or suggestions derived from the website read — so no mock
 * competitors, keywords, pages or communities live here anymore.
 */

/**
 * Mock group-finding queries surfaced while looking for communities —
 * operand-style dorks, one per lookup beat. Used only by the demo
 * related-chains, never by the onboarding reveal.
 */
export const GROUP_QUERIES = [
  '"buy and sell" AND "near me"',
  '"homeowners" AND "group" AND "near me"',
  '"trades" AND "services" AND "local"',
  '"recommendations" AND "contractor" AND "near me"',
  '"community" AND "home improvement" AND "local"',
]
