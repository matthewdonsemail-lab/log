import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'
import type { RequirementAnchors } from '../anchors/index'

const PLACE = 'src/facebook/marketplace/location/helpers/placeProblem.ts'
const TYPES = 'src/facebook/marketplace/location/types.ts'
const PY = 'python/location/placeName.py'
const SESSION = 'python/session/inspectSession.py'
const PUBLISH_SESSION = 'python/session/publishSession.py'
const HOST = 'src/cli/host/helpers/hostActors.ts'
const COUNTRY = 'src/browser/proxy/helpers/countryOfLocation.ts'
const LISTING = 'src/marketplace/agencyListing/helpers/toPublishListing.ts'

const anchors: RequirementAnchors = {
  'REQ-LISTING-01': [
    { kind: 'symbol', file: PLACE, name: 'placeProblem' },
    { kind: 'string', file: PLACE, includes: 'locationAbbreviated' },
    { kind: 'value', file: TYPES, name: 'MIN_REGION_LETTERS', equals: 4 },
  ],
  'REQ-LISTING-02': [
    { kind: 'symbol', file: PY, name: 'place_problem' },
    { kind: 'value', file: PY, name: 'MIN_REGION_LETTERS', equals: 4 },
    { kind: 'string', file: SESSION, includes: 'locationAbbreviated' },
    { kind: 'string', file: PUBLISH_SESSION, includes: 'locationAbbreviated' },
  ],
  'REQ-LISTING-03': [
    { kind: 'symbol', file: PLACE, name: 'fullPlaceName' },
    { kind: 'symbol', file: PLACE, name: 'homePlace' },
    { kind: 'symbol', file: PLACE, name: 'writtenOut' },
    { kind: 'value', file: TYPES, name: 'US_STATE_NAMES', path: ['PA'], equals: 'Pennsylvania' },
  ],
  'REQ-LISTING-04': [
    { kind: 'symbol', file: COUNTRY, name: 'countryOfLocation' },
    { kind: 'symbol', file: COUNTRY, name: 'CODE_BY_NAME' },
  ],
  'REQ-LISTING-05': [
    { kind: 'symbol', file: LISTING, name: 'toPublishListing' },
    { kind: 'string', file: LISTING, includes: 'locationQuery is empty (e.g. "Galway, Ireland")' },
  ],
  'REQ-LISTING-06': [
    { kind: 'symbol', file: 'src/browser/inspect/helpers/parseInspectAction.ts', name: 'parseInspectAction' },
  ],
  'REQ-LISTING-07': [
    { kind: 'symbol', file: 'src/cli/flow/index.ts', name: 'runFlow' },
  ],
  'REQ-LISTING-08': [
    { kind: 'symbol', file: HOST, name: 'placeFor' },
    { kind: 'string', file: HOST, includes: 'needsLive' },
  ],
  'REQ-LISTING-09': [
    { kind: 'symbol', file: PY, name: 'pick_suggestion' },
    { kind: 'string', file: SESSION, includes: 'MarketplaceSearchAddressDataSourceQuery' },
    { kind: 'string', file: SESSION, includes: 'single_line_address' },
  ],
}

export const marketplaceLocation = {
  description: 'The Marketplace location: never abbreviated, checked before any action, the suggestion picked from the answer Facebook gives',
  specPath: 'docs/specs/marketplaceLocation.md',
  codePaths: [
    PLACE,
    TYPES,
    PY,
    COUNTRY,
    LISTING,
    'src/browser/inspect/helpers/parseInspectAction.ts',
    'src/cli/flow/index.ts',
    HOST,
    SESSION,
  ],
  anchors,
  rubrics: {
    'REQ-LISTING-01': noul('Does placeProblem refuse a place in exactly these cases, in this order: empty, any digit, fewer than two comma-separated parts, any part with a word of two or more capital letters, and any part after the first with fewer than MIN_REGION_LETTERS letters, and return null for anything else?'),
    'REQ-LISTING-02': noul('Does place_problem in placeName.py refuse a place in the same five cases as placeProblem (empty, a digit, under two parts, a word of two or more capitals, a region under MIN_REGION_LETTERS letters), and does the setLocation of the inspect session raise before typing anything when place_problem returns a problem?'),
    'REQ-LISTING-03': noul('Do fullPlaceName and homePlace replace a US state code with its full name from US_STATE_NAMES, and does a refusal of a state code tell the caller the full name to write instead?'),
    'REQ-LISTING-04': noul('Does countryOfLocation return US when the last part of the place is a US state name from US_STATE_NAMES or a US state code?'),
    'REQ-LISTING-05': noul('Does toPublishListing add a problem when locationQuery is empty and when placeProblem refuses locationQuery, so the listing is not ok?'),
    'REQ-LISTING-06': noul('Does parseInspectAction return an error carrying the code placeProblem gives for a setLocation action whose place placeProblem refuses, before the action is accepted?'),
    'REQ-LISTING-07': noul('Does runFlow run placeProblem on the filled value of every setLocation step and return an error before the dry run listing or opening the account when one is refused?'),
    'REQ-LISTING-08': noul('Does the setLocation actor of the host take its place from placeFor (homePlace first, then a listing locationQuery, never a zip), refuse it with placeProblem, and send setLocation only when input.live is true?'),
    'REQ-LISTING-09': noul('In the setLocation of the inspect session, is the option clicked the one pick_suggestion finds among the addresses in the address search answers from Facebook (an exact match first, then one that starts with the place), and does the step raise with nothing set when pick_suggestion returns None?'),
    unspecifiedBehavior: noul('Does any code path type or set a Marketplace location without first checking it with placeProblem or place_problem?'),
  },
  assertions: {
    'REQ-LISTING-01': MET,
    'REQ-LISTING-02': MET,
    'REQ-LISTING-03': MET,
    'REQ-LISTING-04': MET,
    'REQ-LISTING-05': MET,
    'REQ-LISTING-06': MET,
    'REQ-LISTING-07': MET,
    'REQ-LISTING-08': MET,
    'REQ-LISTING-09': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
