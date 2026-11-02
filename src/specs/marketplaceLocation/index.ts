import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

export const marketplaceLocation = {
  description: 'The Marketplace location: never abbreviated, checked before any action, the suggestion picked from Facebook\'s answer',
  specPath: 'docs/specs/marketplaceLocation.md',
  codePaths: [
    'src/facebook/marketplace/location/helpers/placeProblem.ts',
    'src/facebook/marketplace/location/types.ts',
    'python/location/placeName.py',
    'src/browser/proxy/helpers/countryOfLocation.ts',
    'src/marketplace/agencyListing/helpers/toPublishListing.ts',
    'src/browser/inspect/helpers/parseInspectAction.ts',
    'src/cli/flow/index.ts',
    'src/cli/host/helpers/hostActors.ts',
    'python/session/inspectSession.py',
  ],
  rubrics: {
    'REQ-LISTING-01': noul('Does placeProblem return code locationAbbreviated for an empty place, a place with any digit, a place with fewer than two comma-separated parts, a part with a word of two or more capital letters, and a part after the first with fewer than MIN_REGION_LETTERS (4) letters?'),
    'REQ-LISTING-02': noul('Does place_problem in placeName.py refuse a place for the same five reasons as placeProblem (empty, a digit, under two parts, a word of two or more capitals, a region under MIN_REGION_LETTERS letters)?'),
    'REQ-LISTING-03': noul('Do fullPlaceName and homePlace write a US state code out through US_STATE_NAMES, and does writtenOut tell the caller the full state name for a state code it refuses?'),
    'REQ-LISTING-04': noul('Does countryOfLocation return US when the last part of the place is a US state name from US_STATE_NAMES or a US state code?'),
    'REQ-LISTING-05': noul('Does toPublishListing add a problem when locationQuery is empty and when placeProblem refuses locationQuery, so the listing is not ok?'),
    'REQ-LISTING-06': noul('Does parseInspectAction return an error naming locationAbbreviated for a setLocation action whose place placeProblem refuses?'),
    'REQ-LISTING-07': noul('Does runFlow run placeProblem on the filled value of every setLocation step and return an error before the dry run listing or opening the account when one is refused?'),
    'REQ-LISTING-08': noul('Does the host\'s setLocation actor take its place from placeFor (homePlace first, then a listing locationQuery), refuse it with placeProblem, and send setLocation only when input.live is true?'),
    'REQ-LISTING-09': noul('In the inspect session\'s setLocation, is the option clicked the one pick_suggestion finds among the single_line_address values of MarketplaceSearchAddressDataSourceQuery answers, and does the step raise with nothing set when pick_suggestion returns None?'),
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
