import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'
import type { RequirementAnchors } from '../anchors/index'

const MACHINE = 'src/marketplace/publish/machine.ts'
const END = 'src/marketplace/publish/helpers/publishEnd.ts'
const COMMAND = 'src/cli/publish/index.ts'
const SOLVER = 'src/captcha/router/helpers/planNextSolver.ts'
const CAPTCHA = 'src/captcha/router/types.ts'
const CHECK = 'src/facebook/marketplace/check/client.ts'
const ACCESS = 'src/facebook/marketplace/check/helpers/marketplaceAccess.ts'
const SELLING = 'src/facebook/marketplace/check/helpers/sellingListings.ts'
const INBOX = 'src/facebook/marketplace/check/helpers/sellerInbox.ts'

const anchors: RequirementAnchors = {
  'REQ-LISTING-16': [
    { kind: 'symbol', file: MACHINE, name: 'publishMachine' },
    { kind: 'string', file: MACHINE, includes: 'isDryRun' },
    { kind: 'string', file: COMMAND, includes: 'Dry run unless --live: fills and checks everything, never clicks Publish.' },
  ],
  'REQ-LISTING-17': [
    { kind: 'symbol', file: END, name: 'publishEnd' },
    { kind: 'string', file: END, includes: 'crashedAfterPublish' },
    { kind: 'string', file: MACHINE, includes: 'unconfirmedId' },
  ],
  'REQ-LISTING-18': [
    { kind: 'symbol', file: SOLVER, name: 'planNextSolver' },
    { kind: 'value', file: CAPTCHA, name: 'DEFAULT_CAPTCHA_POLICY', path: ['krakenAttempts'], equals: 2 },
    { kind: 'value', file: CAPTCHA, name: 'DEFAULT_CAPTCHA_POLICY', path: ['twoCaptchaAttempts'], equals: 1 },
    { kind: 'string', file: SOLVER, includes: 'noSolverForKind' },
    { kind: 'string', file: SOLVER, includes: 'facebookChallenge' },
    { kind: 'string', file: MACHINE, includes: 'needsPerson' },
  ],
  'REQ-LISTING-19': [
    { kind: 'symbol', file: COMMAND, name: 'checkPublishable' },
    { kind: 'symbol', file: 'src/marketplace/replacement/helpers/pickAccount.ts', name: 'countPostedToday' },
    { kind: 'string', file: COMMAND, includes: 'dailyCapReached' },
  ],
  'REQ-LISTING-20': [
    { kind: 'symbol', file: CHECK, name: 'CHECK_PAGES' },
    { kind: 'symbol', file: CHECK, name: 'readMarketplace' },
    { kind: 'symbol', file: CHECK, name: 'harOf' },
    { kind: 'string', file: CHECK, includes: 'network.har' },
  ],
  'REQ-LISTING-21': [
    { kind: 'symbol', file: ACCESS, name: 'marketplaceAccessOf' },
    { kind: 'symbol', file: ACCESS, name: 'accessProblem' },
    { kind: 'string', file: ACCESS, includes: 'CometMarketplaceStatusContentContainerQuery' },
    { kind: 'string', file: ACCESS, includes: 'ELIGIBLE' },
    { kind: 'string', file: ACCESS, includes: 'GOOD' },
    { kind: 'string', file: CHECK, includes: 'suspended' },
  ],
  'REQ-LISTING-22': [
    { kind: 'symbol', file: SELLING, name: 'sellingListingsOf' },
    { kind: 'symbol', file: SELLING, name: 'statusOfListing' },
    { kind: 'symbol', file: CHECK, name: 'keepCheck' },
  ],
  'REQ-LISTING-23': [
    { kind: 'symbol', file: INBOX, name: 'sellerInboxOf' },
  ],
}

export const marketplacePublish = {
  description: 'Publishing one Marketplace listing and the scheduled account check',
  specPath: 'docs/specs/marketplacePublish.md',
  codePaths: [
    MACHINE,
    END,
    COMMAND,
    SOLVER,
    CAPTCHA,
    CHECK,
    ACCESS,
    SELLING,
    INBOX,
    'src/cli/check/index.ts',
    'src/cli/host/helpers/hostActors.ts',
  ],
  anchors,
  rubrics: {
    'REQ-LISTING-16': noul('In publishMachine, does the reviewing state go to done with result dryRun when the isDryRun guard holds, so the publishing state is only entered when dryRun is false, and does the publish command set dryRun true unless the --live flag is given?'),
    'REQ-LISTING-17': noul('Does the publishing state set publishClicked on entry, does no transition after it lead back to openingForm or publishing, and does publishEnd turn a runtime failure after publishClicked into unconfirmedId with code crashedAfterPublish?'),
    'REQ-LISTING-18': noul('Does planNextSolver plan captchaKraken before twoCaptcha for recaptcha and textImage, using up policy.krakenAttempts before moving to twoCaptcha, twoCaptcha only for arkose, and no solver (noSolverForKind) for facebookChallenge and unknown?'),
    'REQ-LISTING-19': noul('When live is true, does checkPublishable refuse with dailyCapReached once countPostedToday for the account, counted in its home timezone, reaches its dailyListingCap?'),
    'REQ-LISTING-20': noul('Does readMarketplace only send goto to CHECK_PAGES.status, CHECK_PAGES.selling and CHECK_PAGES.inbox and read each page from the HAR of its own step, and do both the check command and the check actor of the host call readMarketplace and keepCheck?'),
    'REQ-LISTING-21': noul('Does keepCheck set the issue code suspended whenever accessProblem finds a ban, sell not ELIGIBLE, an enforcementId or a profileStatus other than GOOD?'),
    'REQ-LISTING-22': noul('Does keepCheck match each listing from sellingListingsOf to its Twenty row by listingId and update the status (from statusOfListing), clicksCount and lastCheckedAt of that row?'),
    'REQ-LISTING-23': noul('When the seller inbox has threads, does keepCheck write the raw answer of the inbox to a sellerInbox file in the run folder and count the threads, without mapping the fields of a thread?'),
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
