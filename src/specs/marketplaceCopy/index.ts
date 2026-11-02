import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'
import type { RequirementAnchors } from '../anchors/index'

const TYPES = 'src/facebook/marketplace/copy/types.ts'
const LINT = 'src/facebook/marketplace/copy/helpers/lintCopy.ts'
const PICK = 'src/facebook/marketplace/copy/helpers/pickVersion.ts'
const DISTANCE = 'src/facebook/marketplace/copy/helpers/wordDistance.ts'
const LISTINGS = 'src/marketplace/agencyListing/client.ts'

const VERSION_RULES = [
  'versionId',
  'titleEmpty',
  'titleLength',
  'titleCity',
  'titleSymbols',
  'titleCaps',
  'titleExclamation',
  'titleBanned',
  'descriptionEmpty',
  'descriptionExclamation',
  'descriptionSymbols',
  'descriptionBanned',
  'descriptionPrice',
  'descriptionList',
  'descriptionPhoto',
]

const anchors: RequirementAnchors = {
  'REQ-LISTING-10': [
    { kind: 'value', file: TYPES, name: 'MIN_COPY_VERSIONS', equals: 3 },
    { kind: 'symbol', file: PICK, name: 'requiredVersions' },
    { kind: 'symbol', file: LISTINGS, name: 'copyVersionsShortfall' },
  ],
  'REQ-LISTING-11': [
    { kind: 'value', file: TYPES, name: 'MIN_TITLE_DIFFERENCE', equals: 0.5 },
    { kind: 'symbol', file: LINT, name: 'lintVersions' },
    { kind: 'symbol', file: DISTANCE, name: 'wordDistance' },
    { kind: 'string', file: LINT, includes: 'titleSame' },
    { kind: 'string', file: LINT, includes: 'versionIdTwice' },
    { kind: 'string', file: LINT, includes: 'titleTooAlike' },
  ],
  'REQ-LISTING-12': [
    { kind: 'value', file: TYPES, name: 'MAX_TITLE_LENGTH', equals: 70 },
    { kind: 'symbol', file: LINT, name: 'lintVersion' },
    { kind: 'symbol', file: TYPES, name: 'BANNED_PHRASES' },
    { kind: 'string', file: TYPES, includes: 'cheap' },
    { kind: 'string', file: TYPES, includes: 'best price' },
    { kind: 'string', file: TYPES, includes: 'limited time' },
    ...VERSION_RULES.map((rule) => ({ kind: 'string' as const, file: LINT, includes: rule })),
  ],
  'REQ-LISTING-13': [
    { kind: 'symbol', file: TYPES, name: 'TITLE_WEIGHT' },
    { kind: 'symbol', file: PICK, name: 'pickVersion' },
    { kind: 'symbol', file: DISTANCE, name: 'copyDistance' },
    { kind: 'symbol', file: LISTINGS, name: 'createSlot' },
    { kind: 'symbol', file: LISTINGS, name: 'liveCopiesIn' },
  ],
  'REQ-LISTING-14': [
    { kind: 'symbol', file: PICK, name: 'PickOptions' },
  ],
  'REQ-LISTING-15': [
    { kind: 'symbol', file: 'src/cli/listing/helpers/listingFromJson.ts', name: 'listingFromJson' },
    { kind: 'string', file: 'src/cli/campaign/index.ts', includes: 'notEnoughCopyVersions' },
  ],
}

export const marketplaceCopy = {
  description: 'Marketplace copy versions: enough of them, different enough, checked, and each copy picked from them',
  specPath: 'docs/specs/marketplaceCopy.md',
  codePaths: [
    TYPES,
    LINT,
    PICK,
    DISTANCE,
    LISTINGS,
    'src/marketplace/replacement/client.ts',
    'src/cli/listing/helpers/listingFromJson.ts',
    'src/cli/listing/index.ts',
    'src/cli/campaign/index.ts',
  ],
  anchors,
  rubrics: {
    'REQ-LISTING-10': noul('Does copyVersionsShortfall return no shortfall when fewer than 2 listings will be live in the city, and otherwise a shortfall whenever the ad has fewer versions than requiredVersions(liveAfter), the larger of MIN_COPY_VERSIONS and liveAfter?'),
    'REQ-LISTING-11': noul('Does lintVersions compare every pair of versions and refuse a pair with the same title, the same id twice, and a pair whose title wordDistance, with the city and place words skipped, is below MIN_TITLE_DIFFERENCE?'),
    'REQ-LISTING-12': noul('Does lintVersion refuse a non camelCase id, an empty title, a title over MAX_TITLE_LENGTH or not naming the city, a title with a symbol, a word in capitals, a "!" or a BANNED_PHRASES phrase, and a description that is empty, has a "!", a symbol or a banned phrase, or has no price, no bullet list or no photo ask?'),
    'REQ-LISTING-13': noul('Does createSlot pick the version with pickVersion against liveCopiesIn the same city and save its id as copyVersionId, where pickVersion takes the version whose nearest copyDistance to the live copies is largest and, on a tie, the one used least, and does copyDistance weigh the title by TITLE_WEIGHT (two thirds) and the description by the rest?'),
    'REQ-LISTING-14': noul('When a replacement is made, does createSlot pass the copyVersionId of the lost listing as avoidId, and does pickVersion leave that version out when there is more than one version?'),
    'REQ-LISTING-15': noul('Do listing lint and listing create refuse a file whose copy versions lintVersions finds problems in (through listingFromJson), and does campaign fill refuse when copyVersionsShortfall returns a shortfall, including when a version breaks a lint rule?'),
    unspecifiedBehavior: noul('Does the code create a listing from an ad with copy versions without picking one through pickVersion, or let a version past that breaks a lintVersion rule, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-LISTING-10': MET,
    'REQ-LISTING-11': MET,
    'REQ-LISTING-12': MET,
    'REQ-LISTING-13': MET,
    'REQ-LISTING-14': MET,
    'REQ-LISTING-15': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
