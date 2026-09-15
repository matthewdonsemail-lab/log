/**
 * Brand shapes: the single BrandEntity the whole app reads — identity,
 * location, voice, offerings, plus the intelligence the reveal step
 * discovers — and the query object the inspect-form follow-ups build from
 * an event + brand.
 */

export interface BrandIdentity {
  /** Display name, e.g. "Acme Plumbing". */
  name: string
  /** Canonical website URL the profile was extracted from. */
  website: string
  /** One-line description; empty when the lookup could not infer one. */
  tagline: string
  /** Logo URL, when the lookup finds one. */
  logoUrl?: string
}

export interface BrandLocation {
  /** Human label, e.g. "Galway, County Galway, Ireland". */
  label: string
  /** Default latitude. */
  lat: number
  /** Default longitude. */
  lng: number
  /** Service / delivery radius in km. */
  radiusKm: number
}

export interface BrandVoice {
  /** How replies should read, e.g. "Friendly, plain-spoken local pro". */
  tone: string
  /** Areas served, e.g. ["Dallas", "Fort Worth"]. */
  serviceAreas: string[]
}

export interface BrandIntelligence {
  /** The related keyword the user picked during the reveal. */
  selectedKeyword?: string
  /** Competitor domains confirmed during the reveal. */
  competitors: string[]
  /** Communities the user chose to listen in. */
  targetCommunities: CommunityPick[]
}

/**
 * The central brand record — one entity, one store key. Onboarding creates
 * the base (identity, location defaults, voice); the reveal enriches
 * `intelligence` as each machine step completes; DashboardBrand edits it;
 * listings, groups, and reply drafting all read it. Replaces the old split
 * of BrandProfile + keyword-strategy-mapping (the mapping key stays around
 * for the reveal's own bookkeeping until it migrates onto `intelligence`).
 */
export interface BrandEntity {
  /** "brand-default" (single workspace for now). */
  id: string
  identity: BrandIdentity
  location: BrandLocation
  voice: BrandVoice
  /** Services / products, e.g. ["Emergency callouts", "Boiler installs"]. */
  offerings: string[]
  intelligence: BrandIntelligence
  /** URL the profile was extracted from (mock lookup for now). */
  sourceUrl: string
  /** ISO timestamp of the last save. */
  updatedAt: string
}

/** The three follow-up actions on the event inspect sheet. */
export type AiFollowUpAction = 'related' | 'communities' | 'reply'

/** A keyword target the brand wants to rank for, with example ranking pages. */
export interface KeywordTargetEntry {
  phrase: string
  intent: string
  pages: { title: string; href: string }[]
}

/** A Google Search / Dorking strategy card the user can select. */
export interface SearchStrategyEntry {
  id: string
  category: string
  title: string
  problem: string
  /** Query template with {keyword} and {site} placeholders. */
  dork: string
}

/** The saved keyword + search-strategy mapping for the rest of the workflow. */
export interface KeywordStrategyMapping {
  targets: KeywordTargetEntry[]
  strategies: SearchStrategyEntry[]
  /** The operand phrase the user said relates to what they're doing. */
  selectedPhrase?: string
  /** The community set the user recognized, if any. */
  groups?: CommunityPick[]
  /** Ids of the groups they want to post in and listen to. */
  interested?: string[]
  savedAt: string
}

/** A community suggestion the reveal surfaced. */
export interface CommunityPick {
  id: string
  platform: string
  name: string
  detail: string
}
/**
 * The query a follow-up runs: the captured event, the tracked phrases to
 * exclude, and the brand snapshot the mock AI drafts against. A null brand
 * means the user skipped onboarding — drafts fall back to generic phrasing.
 */
export interface AiQuery {
  action: AiFollowUpAction
  eventId: string
  keywordId: string
  platform: string
  author: string
  group: string
  type: string
  sentiment: string
  text: string
  url: string
  trackedPhrases: string[]
  brand: BrandEntity | null
}
