import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

export const marketplaceCopy = {
  description: 'Marketplace copy versions: enough of them, different enough, checked, and each copy picked from them',
  specPath: 'docs/specs/marketplaceCopy.md',
  codePaths: [
    'src/facebook/marketplace/copy/types.ts',
    'src/facebook/marketplace/copy/helpers/lintCopy.ts',
    'src/facebook/marketplace/copy/helpers/pickVersion.ts',
    'src/facebook/marketplace/copy/helpers/wordDistance.ts',
    'src/marketplace/agencyListing/client.ts',
    'src/marketplace/replacement/client.ts',
    'src/cli/listing/helpers/listingFromJson.ts',
    'src/cli/listing/index.ts',
    'src/cli/campaign/index.ts',
  ],
  rubrics: {
    'REQ-LISTING-10': noul('Does copyVersionsShortfall return no shortfall when fewer than 2 listings will be live in the city, and otherwise require at least requiredVersions(liveAfter) versions, where requiredVersions is the larger of MIN_COPY_VERSIONS (3) and liveAfter?'),
    'REQ-LISTING-11': noul('Does lintVersions refuse two versions with the same title (titleSame), the same id twice (versionIdTwice), and two titles whose wordDistance, with the city and place words skipped, is below MIN_TITLE_DIFFERENCE (0.5)?'),
    'REQ-LISTING-12': noul('Does lintVersion refuse a non camelCase id, an empty title, a title over MAX_TITLE_LENGTH (70) or not naming the city, a title with a symbol, a capitals word, a "!" or a BANNED_PHRASES phrase, and a description that is empty, has a "!", a symbol or a banned phrase, or has no price, no bullet list or no photo ask?'),
    'REQ-LISTING-13': noul('Does createSlot pick the version with pickVersion against liveCopiesIn the same city, where pickVersion takes the largest nearest copyDistance (TITLE_WEIGHT 2/3 on the title), fewer uses on a tie, and save its id as copyVersionId?'),
    'REQ-LISTING-14': noul('When a replacement is made, does createSlot pass the lost listing\'s copyVersionId as avoidId, and does pickVersion leave that version out when there is more than one version?'),
    'REQ-LISTING-15': noul('Do listing lint and listing create refuse a file whose copy versions lintVersions finds problems in (through listingFromJson), and does campaign fill refuse with notEnoughCopyVersions when copyVersionsShortfall returns a shortfall?'),
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
