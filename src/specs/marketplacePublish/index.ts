import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

export const marketplacePublish = {
  description: 'Publishing one Marketplace listing and the scheduled account check',
  specPath: 'docs/specs/marketplacePublish.md',
  codePaths: [
    'src/marketplace/publish/machine.ts',
    'src/marketplace/publish/helpers/publishEnd.ts',
    'src/cli/publish/index.ts',
    'src/captcha/router/helpers/planNextSolver.ts',
    'src/captcha/router/types.ts',
    'src/facebook/marketplace/check/client.ts',
    'src/facebook/marketplace/check/helpers/marketplaceAccess.ts',
    'src/facebook/marketplace/check/helpers/sellingListings.ts',
    'src/cli/check/index.ts',
    'src/cli/host/helpers/hostActors.ts',
  ],
  rubrics: {
    'REQ-LISTING-16': noul('In publishMachine, does the reviewing state go to done with result dryRun when the isDryRun guard holds, so the publishing state is only entered when dryRun is false, and is dryRun true unless the --live flag is given?'),
    'REQ-LISTING-17': noul('Does the publishing state set publishClicked on entry, does no transition after it lead back to openingForm or publishing, and does publishEnd turn a runtime failure after publishClicked into unconfirmedId with code crashedAfterPublish?'),
    'REQ-LISTING-18': noul('Does planNextSolver plan captchaKraken before twoCaptcha for recaptcha and textImage (krakenAttempts 2, twoCaptchaAttempts 1), twoCaptcha only for arkose, and no solver (noSolverForKind) for facebookChallenge and unknown?'),
    'REQ-LISTING-19': noul('When live is true, does checkPublishable refuse with dailyCapReached once countPostedToday for the account, in its home timezone, reaches its dailyListingCap?'),
    'REQ-LISTING-20': noul('Does readMarketplace only send goto to CHECK_PAGES.status, CHECK_PAGES.selling and CHECK_PAGES.inbox and read each page from its step\'s network.har, and do both the check command and the host\'s check actor call readMarketplace and keepCheck?'),
    'REQ-LISTING-21': noul('Does marketplaceAccessOf read CometMarketplaceStatusContentContainerQuery from the HAR, and does keepCheck set the issue code suspended whenever accessProblem finds a ban, sell not ELIGIBLE, an enforcementId or a profileStatus other than GOOD?'),
    'REQ-LISTING-22': noul('Does keepCheck match each listing from sellingListingsOf to its Twenty row by listingId and update the row\'s status (from statusOfListing), clicksCount and lastCheckedAt?'),
    'REQ-LISTING-23': noul('When the seller inbox has threads, does keepCheck write the inbox\'s raw answer to a sellerInbox file in the run folder and count the threads, without mapping a thread\'s fields?'),
    unspecifiedBehavior: noul('Does the publish or check code click Publish, retry after Publish, or click anything during the account check by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-LISTING-16': MET,
    'REQ-LISTING-17': MET,
    'REQ-LISTING-18': MET,
    'REQ-LISTING-19': MET,
    'REQ-LISTING-20': MET,
    'REQ-LISTING-21': MET,
    'REQ-LISTING-22': MET,
    'REQ-LISTING-23': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
