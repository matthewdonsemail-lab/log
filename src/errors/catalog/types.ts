export type ErrorLayer =
  | 'account'
  | 'photo'
  | 'form'
  | 'captcha'
  | 'runtime'
  | 'auth'
  | 'listing'
  | 'twenty'
  | 'proxyVendor'
  | 'profile'
  | 'browser'
  | 'adsPower'
  | 'group'
  | 'warmup'
  | 'twitter'

export type PublishEnd = 'failed' | 'blocked' | 'needsPerson' | 'unconfirmedId'

export type MonitorEnd =
  | 'blocked'
  | 'resting'
  | 'failed'

export type CaptchaEnd =
  | 'retry'
  | 'skipSolver'

export interface ErrorEntry {
  layer: ErrorLayer
  meaning: string
  retryable: boolean
  raisedIn: readonly string[]
  publish?: PublishEnd
  monitor?: MonitorEnd
  captcha?: CaptchaEnd
  action: string
}

const reconnect = 'Run `log facebook connect --account <id>` and log in by hand.'
const tellMatt = "Tell matt. Don't retry the account until it's looked at."

export const ERROR_CATALOG = {
  neverConnected: {
    layer: 'account',
    meaning: 'No saved Facebook session for this account.',
    retryable: false,
    raisedIn: ['worker', 'publish.openingForm'],
    publish: 'blocked',
    monitor: 'blocked',
    action: reconnect
  },
  disconnected: {
    layer: 'account',
    meaning: 'The account was disconnected on purpose.',
    retryable: false,
    raisedIn: ['marketplace/account'],
    publish: 'blocked',
    monitor: 'blocked',
    action: reconnect
  },
  stale: {
    layer: 'account',
    meaning: 'The account has not been checked for too long to trust its state.',
    retryable: true,
    raisedIn: ['marketplace/account'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Run `log facebook scan --account <id>`.'
  },
  sessionExpired: {
    layer: 'account',
    meaning: 'Facebook sent the session to the login page.',
    retryable: false,
    raisedIn: ['worker', 'publish.openingForm', 'marketplace/account'],
    publish: 'blocked',
    monitor: 'blocked',
    action: reconnect
  },
  sessionInvalidatedChanged: {
    layer: 'account',
    meaning: 'The session was invalidated, usually by a password change.',
    retryable: false,
    raisedIn: ['marketplace/account'],
    publish: 'blocked',
    monitor: 'blocked',
    action: reconnect
  },
  checkpointed: {
    layer: 'account',
    meaning: 'Facebook put the account on a checkpoint (verify identity, SMS code, ID).',
    retryable: false,
    raisedIn: ['worker', 'publish.openingForm', 'marketplace/account'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Log in by hand and clear the checkpoint, then `log facebook connect`. No solver can do it.'
  },
  accountNotTwitter: {
    layer: 'account',
    meaning: 'A log twitter command was given an account whose platform in Twenty is not TWITTER.',
    retryable: false,
    raisedIn: ['twitter/account/session'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Name a TWITTER socialAccount (its accountName is the handle).'
  },
  noTwitterSession: {
    layer: 'account',
    meaning: "The X account's saved cookies in Twenty have no auth_token + ct0, so there is no session to call X with.",
    retryable: false,
    raisedIn: ['twitter/account/session'],
    publish: 'blocked',
    monitor: 'blocked',
    action: "Save the account's cookies from a normal manual login into its socialAccounts row."
  },
  targetMissing: {
    layer: 'twitter',
    meaning: "A log twitter send or queue item names no target: a reply, quote or like needs the post's url, a dm the recipient's user id.",
    retryable: false,
    raisedIn: ['twitter/post/send'],
    action: 'Give --tweet <post url> (reply, quote, like) or --userId <id> (dm), taken from treg research.'
  },
  tweetUrlInvalid: {
    layer: 'twitter',
    meaning: "The post given to a log twitter send isn't an x.com post url (https://x.com/<handle>/status/<id>).",
    retryable: false,
    raisedIn: ['twitter/post/send'],
    action: "Give the post's own url, as treg research returned it."
  },
  userIdInvalid: {
    layer: 'twitter',
    meaning: "The dm recipient isn't an X user id (digits only); a handle is not an id.",
    retryable: false,
    raisedIn: ['twitter/post/send'],
    action: "Give the recipient's numeric user id from treg research."
  },
  textMissing: {
    layer: 'twitter',
    meaning: 'A reply, quote or dm was given no text.',
    retryable: false,
    raisedIn: ['twitter/post/send'],
    action: 'Give the approved copy with --text.'
  },
  notApproved: {
    layer: 'twitter',
    meaning: 'A send on X was asked for with --live but without who approved it (rule 8: nothing is sent without a named approver).',
    retryable: false,
    raisedIn: ['twitter/post/send'],
    action: 'Add --approvedBy <who approved it>; only send what matt approved.'
  },
  styleFailed: {
    layer: 'twitter',
    meaning: 'The copy breaks the house style: lowercase only, no commas, semicolons, full stops, em or en dashes (urls are exempt).',
    retryable: false,
    raisedIn: ['twitter/post/send', 'twitter/queue/plan'],
    action: 'Rewrite the copy in house style, or pass --skipStyleCheck when matt asked for it.'
  },
  queueInvalid: {
    layer: 'twitter',
    meaning: "The queue file can't be used: it is missing, isn't a queue, or a target or variations file is wrong.",
    retryable: false,
    raisedIn: ['twitter/queue/plan'],
    action: 'Build it again with log twitter queue build, or fix the file it names.'
  },
  queueNotApproved: {
    layer: 'twitter',
    meaning: "The queue isn't approved, or it changed after it was approved: its fingerprint (the account and every item's action, target and copy) no longer matches.",
    retryable: false,
    raisedIn: ['twitter/queue/plan', 'twitter/queue/run'],
    action: 'Review it with log twitter queue show, then log twitter queue approve --by <who>.'
  },
  queueNoPlan: {
    layer: 'twitter',
    meaning: 'The queue has no random plan to run.',
    retryable: false,
    raisedIn: ['twitter/queue/run'],
    action: 'Draw one with log twitter queue plan <queue> --window <5h>.'
  },
  queueBusy: {
    layer: 'twitter',
    meaning: "Another run holds the queue's lock (<queue>.lock), or nudge was asked for with no run going.",
    retryable: false,
    raisedIn: ['twitter/queue/run'],
    action: 'Wait for the run to end; delete the lock only if no run is going.'
  },
  accountNotOnPlatform: {
    layer: 'account',
    meaning: "A log <platform> command was given an account whose platform in Twenty isn't that platform.",
    retryable: false,
    raisedIn: ['platformKit/session'],
    publish: 'blocked',
    monitor: 'blocked',
    action: "Name a socialAccount of that platform (its accountName is the handle)."
  },
  noPlatformSession: {
    layer: 'account',
    meaning: "The account's saved cookies in Twenty don't hold the session cookies its platform needs, so there is no session to call it with.",
    retryable: false,
    raisedIn: ['platformKit/session'],
    publish: 'blocked',
    monitor: 'blocked',
    action: "Save the account's cookies from a normal manual login into its socialAccounts row."
  },
  engineNotBuilt: {
    layer: 'runtime',
    meaning: "The platform's direct-API engine was made by log new platform and has no client wired in yet, so it can't call the platform.",
    retryable: false,
    raisedIn: ['platformKit/session'],
    action: "Vendor the platform's client under vendor/<library>, then fill in its actions in python/<platform>Api/engine.py."
  },
  governorBlocked: {
    layer: 'account',
    meaning: "The account's direct-API governor refused the call: a soft-block or checkpoint pause, the hourly or daily request cap, or the 40-a-day write budget (fbk's RequestGovernor, one per account under ~/.logCli/fbk/<account>).",
    retryable: false,
    raisedIn: ['directApi/engine'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Stop for this account until the pause ends or the day rolls over; never retry into it.'
  },
  wrongPassword: {
    layer: 'account',
    meaning: "Facebook said the password is wrong, or found no account for the email, when `log facebook connect` signed in with Twenty's details.",
    retryable: false,
    raisedIn: ['connect.routing'],
    publish: 'blocked',
    monitor: 'blocked',
    action: "Fix the account's email or password in Twenty, then `log facebook connect` again. Auto-login stops at once so Facebook doesn't see repeated wrong passwords."
  },
  videoSelfieRequired: {
    layer: 'account',
    meaning: "Facebook's checkpoint wants a video selfie (\"Confirm that you're a real person with a video selfie\"). No solver or auto-login can do it.",
    retryable: false,
    raisedIn: ['connect.routing'],
    publish: 'blocked',
    monitor: 'blocked',
    action: "A person records the selfie in the Camoufox window (or on the account owner's phone), then `log facebook connect` again. Tell matt."
  },
  signInNotFinished: {
    layer: 'account',
    meaning: '`log facebook connect` reached its deadline (`--wait`) without a logged-in page: the login, two-step or a captcha was not finished.',
    retryable: false,
    raisedIn: ['connect.signingIn'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Run `log facebook connect` again and finish the step its last page names in the Camoufox window, or give it a longer `--wait`. A two-step page needs the totpSecret in Twenty.'
  },
  unconfirmedUser: {
    layer: 'account',
    meaning: 'The account has not confirmed its email or phone.',
    retryable: false,
    raisedIn: ['marketplace/account'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Confirm the email or phone on Facebook by hand.'
  },
  cookieInvalid: {
    layer: 'account',
    meaning: 'The saved cookies are not accepted.',
    retryable: false,
    raisedIn: ['marketplace/account'],
    publish: 'blocked',
    monitor: 'blocked',
    action: reconnect
  },
  identityVerificationRequired: {
    layer: 'account',
    meaning: 'Facebook holds the account\'s listings until a person confirms their identity: Selling says "Confirm your identity to publish this and any future listings", and MarketplaceYourListingDialogQuery answers a seller notice of type INTEGRITY_NEEDS_VERIFICATION_VH ("More Info Needed to Publish This Listing", "Please confirm your mobile number before selling on Marketplace").',
    retryable: false,
    raisedIn: ['marketplace/check', 'flow.marketplaceListingPublish'],
    publish: 'blocked',
    monitor: 'blocked',
    action: tellMatt
  },
  suspended: {
    layer: 'account',
    meaning: 'Marketplace is restricted or the account is disabled ("can\'t buy or sell").',
    retryable: false,
    raisedIn: ['worker', 'publish.openingForm', 'marketplace/account'],
    publish: 'blocked',
    monitor: 'blocked',
    action: tellMatt
  },
  readOnlyLimited: {
    layer: 'account',
    meaning: 'The account can read but Facebook refuses its writes ("something went wrong").',
    retryable: false,
    raisedIn: ['marketplace/account'],
    publish: 'blocked',
    monitor: 'blocked',
    action: tellMatt
  },
  automatedFlagged: {
    layer: 'account',
    meaning: 'Facebook flagged the account as automated.',
    retryable: false,
    raisedIn: ['marketplace/account'],
    publish: 'blocked',
    monitor: 'blocked',
    action: tellMatt
  },
  rateLimited: {
    layer: 'account',
    meaning: 'Facebook says the account hit a limit ("limit reached", "daily listing limit").',
    retryable: true,
    raisedIn: ['worker', 'publish.openingForm', 'publish.reviewing', 'marketplace/account'],
    publish: 'blocked',
    monitor: 'resting',
    action: 'Wait 24h. The monitor rests by itself; publish again tomorrow.'
  },
  proxyRateLimited: {
    layer: 'account',
    meaning: 'The proxy, not Facebook, is rate limiting.',
    retryable: true,
    raisedIn: ['marketplace/account'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Wait, or move the account to another proxy.'
  },
  challengeInterstitial: {
    layer: 'account',
    meaning: 'An interstitial challenge page stands in front of the content.',
    retryable: false,
    raisedIn: ['marketplace/account'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Open the account by hand and clear the page.'
  },
  ipOrAccountBlocked: {
    layer: 'account',
    meaning: 'The IP or the account is blocked.',
    retryable: false,
    raisedIn: ['marketplace/account'],
    publish: 'blocked',
    monitor: 'blocked',
    action: tellMatt
  },
  restrictedPolicy: {
    layer: 'account',
    meaning: 'A policy restriction applies to the account.',
    retryable: false,
    raisedIn: ['marketplace/account'],
    publish: 'blocked',
    monitor: 'blocked',
    action: tellMatt
  },
  permissionDenied: {
    layer: 'account',
    meaning: 'The account lacks permission for this action.',
    retryable: false,
    raisedIn: ['marketplace/account'],
    publish: 'blocked',
    monitor: 'blocked',
    action: tellMatt
  },
  joinGate: {
    layer: 'account',
    meaning: 'A group asks the account to join first.',
    retryable: false,
    raisedIn: ['marketplace/account'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Join the group by hand.'
  },
  removedFromGroup: {
    layer: 'account',
    meaning: 'The account was removed from a group.',
    retryable: false,
    raisedIn: ['marketplace/account'],
    publish: 'blocked',
    monitor: 'blocked',
    action: tellMatt
  },
  proxyUnreachable: {
    layer: 'account',
    meaning: "No exit IP through the account's proxy: it is down or refusing connections. No browser was opened.",
    retryable: true,
    raisedIn: ['proxyGate', 'publish.openingForm', 'worker', 'marketplace/account'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Check the proxy is up, then `log proxy check --account <id>`.'
  },
  proxyTooSlow: {
    layer: 'account',
    meaning: "The proxy's exit answers, but takes seconds for each Facebook file, so pages never get past Facebook's loading skeleton. Refused before any page opened.",
    retryable: true,
    raisedIn: ['proxyGate'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Run `log proxy assign --account <id>`: it skips slow exits and saves a fresh session that answers quickly.'
  },
  proxyAuthFailed: {
    layer: 'account',
    meaning: 'The proxy answered 407: it refused the username or password. No browser was opened.',
    retryable: false,
    raisedIn: ['proxyGate', 'publish.openingForm', 'worker', 'marketplace/account'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Fix the username and password in the socialAccount proxy in Twenty.'
  },
  proxyMalformed: {
    layer: 'account',
    meaning: "The account's proxy can't be read: it needs scheme://user:pass@host:port.",
    retryable: false,
    raisedIn: ['proxyGate', 'marketplace/socialAccount', 'publish.openingForm', 'worker', 'marketplace/account'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Fix the socialAccount proxy in Twenty.'
  },
  accountNotFacebook: {
    layer: 'account',
    meaning: 'The socialAccount is not platform FACEBOOK. log-cli only runs Facebook accounts.',
    retryable: false,
    raisedIn: ['marketplace/socialAccount'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Pick a FACEBOOK account, or fix its platform in Twenty.'
  },
  accountNotUsable: {
    layer: 'account',
    meaning: "The account's accountStatus doesn't allow this run (only ACTIVE and WARMING post; connect also takes NEEDS_LOGIN and CHECKPOINT). An empty status counts as not usable.",
    retryable: false,
    raisedIn: ['marketplace/socialAccount'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Set accountStatus in Twenty (log facebook account status), or use another account.'
  },
  noHomeCountry: {
    layer: 'account',
    meaning: "The account has no homeCountry (ISO, e.g. IE), so its proxy and listings can't be checked. Nothing runs without it.",
    retryable: false,
    raisedIn: ['marketplace/socialAccount'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Set homeCountry (and homeCity) on the socialAccount in Twenty.'
  },
  accountDisabled: {
    layer: 'account',
    meaning: 'Facebook says the account is disabled or locked.',
    retryable: false,
    raisedIn: ['worker', 'publish.openingForm', 'marketplace/account'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'The account becomes BANNED and its campaign listings get replacement accounts. Keep the record.'
  },
  dailyCapReached: {
    layer: 'account',
    meaning: "The account already published its dailyListingCap listings today (3 when empty).",
    retryable: true,
    raisedIn: ['cli/publish', 'marketplace/replacement'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Wait until tomorrow, or raise dailyListingCap in Twenty.'
  },
  noProxy: {
    layer: 'account',
    meaning: 'The account has no proxy in Twenty, and no browser opens for an account without one (rule 12), not for a dry run and not for signing in.',
    retryable: false,
    raisedIn: ['proxyGate', 'marketplace/socialAccount', 'publish.openingForm', 'worker'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Set the socialAccount proxy in Twenty (scheme://user:pass@host:port), then `log proxy check --account <name>`.'
  },
  proxyCountryMismatch: {
    layer: 'account',
    meaning: "The proxy's exit IP is not in the account's country, so Facebook would see the account in the wrong place. No browser was opened.",
    retryable: false,
    raisedIn: ['proxyGate', 'publish.openingForm', 'worker'],
    publish: 'blocked',
    monitor: 'blocked',
    action: "Use a proxy that exits in the account's homeCountry, or fix homeCountry in Twenty if it is wrong."
  },
  proxyCountryChanged: {
    layer: 'account',
    meaning: "The proxy's exit IP moved to another country during the run (2Captcha's sticky session rotated). Stopped before Publish was clicked.",
    retryable: true,
    raisedIn: ['publish.reviewing', 'publish.publishing'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Run `log proxy check --account <id>`; if it keeps leaving the country, `log proxy assign` it a new session.'
  },
  outsideActiveHours: {
    layer: 'account',
    meaning: "It is outside the account's local waking hours (08:00-22:00 in its home timezone unless activeHoursStart/End say otherwise). Nothing opened. The detail has the local time and when the window opens.",
    retryable: true,
    raisedIn: ['browser/run', 'cli/watch'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Run it inside the window in the detail, or change activeHoursStart/activeHoursEnd on the socialAccount in Twenty.'
  },
  accountBusy: {
    layer: 'account',
    meaning: "A job over MCP already holds this account (one browser per account, rule 35). Nothing started.",
    retryable: true,
    raisedIn: ['mcp/jobs'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Follow the job in the detail with jobStatus until it ends, or stop it with jobCancel, then call again.'
  },
  launchTooSoon: {
    layer: 'account',
    meaning: "The account's browser opened on Facebook less than 10 minutes ago (rule 24). Nothing opened.",
    retryable: true,
    raisedIn: ['browser/run'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Wait the minutes in the detail. Back-to-back launches are what drew the 2026-10-19 checkpoints.'
  },
  launchBudgetSpent: {
    layer: 'account',
    meaning: "The account's browser has opened on Facebook 8 times today, its local day, dry runs included (rule 24). Nothing opened.",
    retryable: true,
    raisedIn: ['browser/run'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Run it tomorrow (local time), or from another account in the same country.'
  },
  noHomeLocale: {
    layer: 'account',
    meaning: "log-cli has no browser locale for the account's homeCountry, so it can't pin one. Nothing opened.",
    retryable: false,
    raisedIn: ['marketplace/home', 'browser/run'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Add the country to HOME_COUNTRIES in src/marketplace/home/types.ts, or fix homeCountry in Twenty.'
  },
  noHomeTimezone: {
    layer: 'account',
    meaning: "The account's homeCountry has several timezones and its homeCity isn't in the city table, so its local time is unknown. Nothing opened.",
    retryable: false,
    raisedIn: ['marketplace/home', 'browser/run'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Add the city to CITY_TIMEZONES in src/marketplace/home/types.ts, or fix homeCity in Twenty.'
  },
  deviceProfileInvalid: {
    layer: 'account',
    meaning: "The account's stored deviceProfile can't be read, or the run's device file is missing. Nothing opened: a new device would look like a different computer.",
    retryable: false,
    raisedIn: ['browser/run', 'proxyGate', 'publish.openingForm', 'worker'],
    publish: 'blocked',
    monitor: 'blocked',
    action: "Tell matt. Don't clear deviceProfile unless he decides the account may get a new device."
  },
  browserTimezoneMismatch: {
    layer: 'account',
    meaning: "The launch self-check found a timezone in the page or a worker that isn't the exit IP's. The browser was closed before Facebook loaded.",
    retryable: false,
    raisedIn: ['proxyGate', 'publish.openingForm', 'worker'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Tell matt: the timezone forcing is broken (often after a Camoufox upgrade). Re-run the leak tests before any run.'
  },
  browserLocaleMismatch: {
    layer: 'account',
    meaning: "The launch self-check found navigator.language(s) or the Intl locale, in the page or a worker, not equal to the account's pinned locale. The browser was closed before Facebook loaded.",
    retryable: false,
    raisedIn: ['proxyGate', 'publish.openingForm', 'worker'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Tell matt: the locale pinning is broken (often after a Camoufox upgrade). Re-run the leak tests before any run.'
  },
  browserExitIpMismatch: {
    layer: 'account',
    meaning: "The exit IP seen from inside the browser isn't the one the proxy gate checked (rotated, or the browser isn't using the proxy). The browser was closed before Facebook loaded.",
    retryable: true,
    raisedIn: ['proxyGate', 'publish.openingForm', 'worker'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Run it again. If it repeats, `log proxy check --account <id>` and tell matt.'
  },
  selfCheckFailed: {
    layer: 'account',
    meaning: "The launch self-check couldn't run (no IP echo answered through the browser, or the worker didn't start), so nothing proves the browser looks right. Closed before Facebook loaded.",
    retryable: true,
    raisedIn: ['proxyGate', 'publish.openingForm', 'worker'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Run it again. If it repeats, check the proxy (`log proxy check`) and tell matt.'
  },
  listingCountryMismatch: {
    layer: 'account',
    meaning: "The listing's location is not in the account's country, or has no country to check. Refused before any browser opens.",
    retryable: false,
    raisedIn: ['cli/publish'],
    publish: 'blocked',
    monitor: 'blocked',
    action: "Write the location as \"City, Country\" in the account's country, or post it from an account in that country."
  },
  loginWall: {
    layer: 'account',
    meaning: 'The page loaded but shows a login wall instead of content.',
    retryable: false,
    raisedIn: ['worker', 'marketplace/account'],
    publish: 'blocked',
    monitor: 'blocked',
    action: reconnect
  },
  captchaHtml: {
    layer: 'account',
    meaning: 'The page loaded but shows a captcha instead of content.',
    retryable: false,
    raisedIn: ['marketplace/account'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Open the account by hand. `log facebook publish` routes captchas itself; `scan` does not.'
  },
  unknownPlatform: {
    layer: 'account',
    meaning: 'The account belongs to a platform log-cli does not know.',
    retryable: false,
    raisedIn: ['marketplace/account'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Facebook only (AGENTS.md rule 3).'
  },
  unknown: {
    layer: 'account',
    meaning: 'The client saw an account failure it could not map.',
    retryable: false,
    raisedIn: ['marketplace/account'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Look at the raw signal and add a code for it here.'
  },

  noPhotos: {
    layer: 'photo',
    meaning: 'The listing has no photos. Facebook keeps Next disabled with 0.',
    retryable: false,
    raisedIn: ['publish.preparingPhotos'],
    publish: 'failed',
    action: 'Add at least 1 photo.'
  },
  tooManyPhotos: {
    layer: 'photo',
    meaning: 'More than 10 photos. Facebook takes 10.',
    retryable: false,
    raisedIn: ['publish.preparingPhotos'],
    publish: 'failed',
    action: 'Send 10 or fewer.'
  },
  photoNeedsProxy: {
    layer: 'photo',
    meaning: "A photo is a URL, and URLs are only fetched through the account's own HTTP proxy, never from this machine. The account has none that fetch can use (none, or SOCKS5).",
    retryable: false,
    raisedIn: ['publish.preparingPhotos'],
    publish: 'failed',
    action: 'Give the account an HTTP proxy (log proxy assign), or store the photo as a local file or data-URL.'
  },
  unreadablePhoto: {
    layer: 'photo',
    meaning: 'A photo path, URL or data-URL could not be read.',
    retryable: false,
    raisedIn: ['publish.preparingPhotos'],
    publish: 'failed',
    action: 'Fix the path or URL in the detail.'
  },
  notAnImage: {
    layer: 'photo',
    meaning: 'The bytes are not a JPEG, PNG, WebP, GIF, HEIC or AVIF image.',
    retryable: false,
    raisedIn: ['publish.preparingPhotos'],
    publish: 'failed',
    action: 'Replace the file.'
  },
  variationFailed: {
    layer: 'photo',
    meaning: 'sharp could not make the varied JPEG.',
    retryable: false,
    raisedIn: ['publish.preparingPhotos'],
    publish: 'failed',
    action: 'Open the photo by hand; it is probably corrupt.'
  },

  pageNotReached: {
    layer: 'form',
    meaning: 'A flow or warm-up step went to a page and Facebook put the browser somewhere else.',
    retryable: false,
    raisedIn: ['flow.step', 'warmup.step'],
    publish: 'failed',
    action: "Read the step's screenshot and HAR (rule 25): where it landed says why (a checkpoint and a login are their own codes)."
  },
  formNotFound: {
    layer: 'form',
    meaning: 'The create form never showed its Title field.',
    retryable: true,
    raisedIn: ['publish.openingForm'],
    publish: 'failed',
    action: 'Run again. If it repeats, Facebook changed the form: update the selectors.'
  },
  categoryNotSet: {
    layer: 'form',
    meaning: 'Category was picked 3 times and the box still reads something else.',
    retryable: true,
    raisedIn: ['publish.choosingCategory'],
    publish: 'failed',
    action: "Check the category name matches the form's list."
  },
  photoMissing: {
    layer: 'form',
    meaning: 'A prepared photo file was gone when the upload started.',
    retryable: false,
    raisedIn: ['publish.uploadingPhotos'],
    publish: 'failed',
    action: 'Run again; the photos are prepared fresh each run.'
  },
  noFileInput: {
    layer: 'form',
    meaning: 'The form has no image file input.',
    retryable: true,
    raisedIn: ['publish.uploadingPhotos'],
    publish: 'failed',
    action: 'Run again. If it repeats, Facebook changed the form: update the selectors.'
  },
  photosNotConfirmed: {
    layer: 'form',
    meaning: "Facebook's N/10 photo counter doesn't match the photos sent.",
    retryable: true,
    raisedIn: ['publish.uploadingPhotos', 'publish.reviewing'],
    publish: 'failed',
    action: 'Run again. Check the review screenshot for photos Facebook rejected.'
  },
  titleNotSet: {
    layer: 'form',
    meaning: 'The Title field did not keep the value.',
    retryable: true,
    raisedIn: ['publish.fillingFields'],
    publish: 'failed',
    action: 'Run again.'
  },
  priceNotSet: {
    layer: 'form',
    meaning: 'The Price field did not keep the value.',
    retryable: true,
    raisedIn: ['publish.fillingFields'],
    publish: 'failed',
    action: 'Run again.'
  },
  conditionNotSet: {
    layer: 'form',
    meaning: 'Condition was picked 3 times and the box still reads something else.',
    retryable: true,
    raisedIn: ['publish.fillingFields'],
    publish: 'failed',
    action: 'Use new, likeNew, good or fair.'
  },
  descriptionNotSet: {
    layer: 'form',
    meaning: 'The Description field did not keep the value.',
    retryable: true,
    raisedIn: ['publish.fillingFields'],
    publish: 'failed',
    action: 'Run again.'
  },
  locationAbbreviated: {
    layer: 'listing',
    meaning: 'A Marketplace location is abbreviated ("Bethlehem, PA"), a zip or a number, or names no state or country. "Bethlehem, PA" was offered only as the West Bank and a bare zip offered Granada, Spain first, so nothing is typed. Nothing was done on Facebook.',
    retryable: false,
    raisedIn: ['facebook/marketplace/location', 'cli/listing', 'cli/publish', 'cli/flow', 'cli/inspect', 'cli/host', 'python/session'],
    action: 'Write it as "City, State" with the state written out ("Bethlehem, Pennsylvania"), or "City, Country" ("Galway, Ireland"), in the listing\'s locationQuery or the --set location value.'
  },
  locationNotSet: {
    layer: 'form',
    meaning: 'No Location field, no suggestion matched, or it did not keep the value.',
    retryable: true,
    raisedIn: ['publish.fillingFields'],
    publish: 'failed',
    action: 'Use "City, Region" as Facebook suggests it, or leave location out.'
  },
  answerNotAsExpected: {
    layer: 'warmup',
    meaning: "A step's internal API answer isn't what the step must achieve (rule 73): the call wasn't answered in the step, it answered an error status or errors, or a field it reads isn't the value the step needs. The step's own recording says which (exchanges.json).",
    retryable: true,
    raisedIn: ['cli/flow', 'cli/warmup', 'facebook/warmup/activities'],
    action: "Read the step's exchanges.json and its request's doc (\"What it sent and what came back\"), then run the step again or fix the step from what the answer says (rule 25)."
  },
  marketplaceMayNotPost: {
    layer: 'account',
    meaning: "Marketplace's create page answers `marketplace_new_seller_can_post_item: false`: no listing can be created from this account now. Bethlehem, 2026-10-23 (it was true on 2026-10-22).",
    retryable: false,
    raisedIn: ['cli/flow', 'cli/warmup'],
    publish: 'blocked',
    action: 'Publish nothing from this account; matt decides. Read the create page\'s answer again on a later day.'
  },
  marketplaceLocationWrong: {
    layer: 'account',
    meaning: "A Marketplace page's own answer puts the account somewhere other than its home: `sell_location` on the create page, or `buy_location` on Marketplace, names another city or country (Bethlehem's sell_location was Barranco, Peru on 2026-10-22).",
    retryable: true,
    raisedIn: ['cli/flow', 'cli/warmup'],
    publish: 'blocked',
    action: 'Set the Marketplace location to the account\'s home with `log inspect do setLocation "City, State" --live` (rule 72), then read the page\'s answer again.'
  },
  priceMismatch: {
    layer: 'form',
    meaning: 'At review the Price reads something other than what was typed.',
    retryable: true,
    raisedIn: ['publish.reviewing'],
    publish: 'failed',
    action: 'Run again.'
  },
  invalidFields: {
    layer: 'form',
    meaning: 'Facebook marked one or more fields invalid at review.',
    retryable: false,
    raisedIn: ['publish.reviewing'],
    publish: 'failed',
    action: 'Open the review screenshot and fix the field.'
  },
  publishNotFound: {
    layer: 'form',
    meaning: 'No enabled Next or Publish button. Publish was not clicked.',
    retryable: true,
    raisedIn: ['publish.publishing'],
    publish: 'failed',
    action: 'Run again. Nothing was posted.'
  },
  rejected: {
    layer: 'form',
    meaning: 'Facebook answered Publish with its "Oops / Something went wrong" dialog. Nothing was listed.',
    retryable: false,
    raisedIn: ['publish.confirming'],
    publish: 'failed',
    action: "Don't retry straight away: it is often the account. Check it on Facebook."
  },
  noConfirmation: {
    layer: 'form',
    meaning: 'No toast or Selling page within 30s of Publish. It may still have gone out, so the run looks for it.',
    retryable: false,
    raisedIn: ['publish.confirming'],
    action: 'None: the run goes on to capturingId and ends published or unconfirmedId.'
  },
  noListingId: {
    layer: 'form',
    meaning: 'Publish was clicked but no listing id came back: no Selling card matched the title, or the create call\'s answer (useCometMarketplaceListingCreateMutation) had no `data.marketplace_listing_create.listing.id`.',
    retryable: false,
    raisedIn: ['publish.capturingId', 'cli/flow'],
    publish: 'unconfirmedId',
    action: 'Check Marketplace > Selling by hand. Never re-publish: it would duplicate.'
  },

  noSolverForKind: {
    layer: 'captcha',
    meaning: "Facebook's own challenge, or a captcha no solver recognises.",
    retryable: false,
    raisedIn: ['publish.routingCaptcha'],
    publish: 'needsPerson',
    action: 'Log in by hand and clear it, then run again.'
  },
  noSolverConfigured: {
    layer: 'captcha',
    meaning: 'No key for a solver that can take this captcha.',
    retryable: false,
    raisedIn: ['publish.routingCaptcha'],
    publish: 'needsPerson',
    action: 'Set CAPTCHA_KRAKEN_API_KEY and/or 2CAPTCHA_API_KEY in .env.local.'
  },
  arkoseCapReached: {
    layer: 'captcha',
    meaning: 'This account used its Arkose solves for today.',
    retryable: true,
    raisedIn: ['publish.routingCaptcha'],
    publish: 'needsPerson',
    action: 'Wait until tomorrow, or clear it by hand.'
  },
  attemptsUsed: {
    layer: 'captcha',
    meaning: 'Every usable solver was tried as many times as the policy allows.',
    retryable: false,
    raisedIn: ['publish.routingCaptcha'],
    publish: 'needsPerson',
    action: 'Clear it by hand. The ledger (~/.logCli/captcha/attempts.jsonl) shows each try.'
  },
  roundsUsed: {
    layer: 'captcha',
    meaning: 'The run hit its cap on captcha rounds.',
    retryable: false,
    raisedIn: ['publish.routingCaptcha'],
    publish: 'needsPerson',
    action: 'Clear it by hand. Facebook kept serving captchas: the account may be flagged.'
  },

  captchaNoProxy: {
    layer: 'captcha',
    meaning: "2Captcha would have solved from its own IP: the account's proxy couldn't be passed to it. Refused rather than mixing a foreign IP into the session.",
    retryable: false,
    raisedIn: ['publish.solvingCaptcha'],
    captcha: 'skipSolver',
    action: "Check the account's proxy file reached the session (rule 12). The captcha goes to a person instead."
  },
  missingApiKey: {
    layer: 'captcha',
    meaning: "The solver's API key is not set.",
    retryable: false,
    raisedIn: ['publish.solvingCaptcha'],
    captcha: 'skipSolver',
    action: 'Put the key in .env.local.'
  },
  invalidApiKey: {
    layer: 'captcha',
    meaning: 'The solver did not accept the API key.',
    retryable: false,
    raisedIn: ['publish.solvingCaptcha'],
    captcha: 'skipSolver',
    action: "Make a new key on the solver's dashboard."
  },
  solverAccountSuspended: {
    layer: 'captcha',
    meaning: "The solver suspended our account with it (CaptchaKraken account_suspended, 2Captcha IP_BANNED).",
    retryable: false,
    raisedIn: ['publish.solvingCaptcha'],
    captcha: 'skipSolver',
    action: "Contact the solver's support."
  },
  insufficientCredits: {
    layer: 'captcha',
    meaning: 'The solver account is out of credits.',
    retryable: false,
    raisedIn: ['publish.solvingCaptcha'],
    captcha: 'skipSolver',
    action: 'Top up on the solver dashboard.'
  },
  notInstalled: {
    layer: 'captcha',
    meaning: "The solver's Python package is not installed.",
    retryable: false,
    raisedIn: ['publish.solvingCaptcha'],
    captcha: 'skipSolver',
    action: 'pip install captchakraken / 2captcha-python into LOG_PYTHON.'
  },
  unknownSolver: {
    layer: 'captcha',
    meaning: 'The session was asked for a solver it does not have.',
    retryable: false,
    raisedIn: ['publish.solvingCaptcha'],
    captcha: 'skipSolver',
    action: 'A bug: the router and publishSession.py disagree on solver names.'
  },
  vendorBlocked: {
    layer: 'captcha',
    meaning: 'CaptchaKraken refuses this captcha vendor.',
    retryable: false,
    raisedIn: ['publish.solvingCaptcha'],
    captcha: 'skipSolver',
    action: 'None: 2Captcha gets it next, if configured.'
  },
  unsupportedChallenge: {
    layer: 'captcha',
    meaning: 'CaptchaKraken does not support this challenge type.',
    retryable: false,
    raisedIn: ['publish.solvingCaptcha'],
    captcha: 'skipSolver',
    action: 'None: 2Captcha gets it next, if configured.'
  },
  solverRateLimited: {
    layer: 'captcha',
    meaning: 'The solver is rate limiting us.',
    retryable: true,
    raisedIn: ['publish.solvingCaptcha'],
    captcha: 'retry',
    action: 'None, unless it repeats: then slow the runs down.'
  },
  solveAbandoned: {
    layer: 'captcha',
    meaning: 'CaptchaKraken served the captcha too many times without it settling: usually IP or fingerprint, not wrong answers.',
    retryable: true,
    raisedIn: ['publish.solvingCaptcha'],
    captcha: 'retry',
    action: "If it repeats, the account's IP or fingerprint is being rejected."
  },
  unrecognizedPrompt: {
    layer: 'captcha',
    meaning: "CaptchaKraken didn't recognise the captcha's prompt.",
    retryable: true,
    raisedIn: ['publish.solvingCaptcha'],
    captcha: 'retry',
    action: 'None: a new round brings a new prompt.'
  },
  solverBadRequest: {
    layer: 'captcha',
    meaning: 'The solver called our request invalid.',
    retryable: true,
    raisedIn: ['publish.solvingCaptcha'],
    captcha: 'retry',
    action: 'A bug in publishSession.py if it repeats.'
  },
  requestTooLarge: {
    layer: 'captcha',
    meaning: 'The screenshot sent to CaptchaKraken was over its size limit.',
    retryable: true,
    raisedIn: ['publish.solvingCaptcha'],
    captcha: 'retry',
    action: 'A bug if it repeats: send the captcha element, not the page.'
  },
  upstreamUnavailable: {
    layer: 'captcha',
    meaning: "CaptchaKraken's solver fleet is unreachable (their side).",
    retryable: true,
    raisedIn: ['publish.solvingCaptcha'],
    captcha: 'retry',
    action: 'None: retry shortly.'
  },
  noWidget: {
    layer: 'captcha',
    meaning: 'The solver found no captcha widget on the page.',
    retryable: true,
    raisedIn: ['publish.solvingCaptcha'],
    captcha: 'retry',
    action: 'None: the re-check decides whether a captcha is still there.'
  },
  pageClosed: {
    layer: 'captcha',
    meaning: 'The page closed during the solve.',
    retryable: true,
    raisedIn: ['publish.solvingCaptcha'],
    captcha: 'retry',
    action: 'None.'
  },
  animatedChallenge: {
    layer: 'captcha',
    meaning: 'An animated challenge CaptchaKraken could not read.',
    retryable: true,
    raisedIn: ['publish.solvingCaptcha'],
    captcha: 'retry',
    action: 'None.'
  },
  noSiteKey: {
    layer: 'captcha',
    meaning: "2Captcha needs the captcha's site key and no frame URL carried one.",
    retryable: true,
    raisedIn: ['publish.solvingCaptcha'],
    captcha: 'retry',
    action: 'If it repeats, FB moved the key: update detect_captcha.'
  },
  unsolvable: {
    layer: 'captcha',
    meaning: '2Captcha workers could not solve it.',
    retryable: true,
    raisedIn: ['publish.solvingCaptcha'],
    captcha: 'retry',
    action: 'None.'
  },
  solverTimeout: {
    layer: 'captcha',
    meaning: 'The solver did not answer in time.',
    retryable: true,
    raisedIn: ['publish.solvingCaptcha'],
    captcha: 'retry',
    action: 'None.'
  },
  notInjected: {
    layer: 'captcha',
    meaning: "2Captcha returned a token but no field on the page took it.",
    retryable: true,
    raisedIn: ['publish.solvingCaptcha'],
    captcha: 'retry',
    action: 'If it repeats, FB changed the captcha frame: update the inject script.'
  },
  solveError: {
    layer: 'captcha',
    meaning: 'The solver failed with an error that has no code of its own.',
    retryable: true,
    raisedIn: ['publish.solvingCaptcha'],
    captcha: 'retry',
    action: 'Read the detail. If it repeats, give it a code here.'
  },

  workerNotStarted: {
    layer: 'runtime',
    meaning: 'The Python interpreter could not be started.',
    retryable: false,
    raisedIn: ['worker', 'session'],
    publish: 'failed',
    monitor: 'failed',
    action: 'Set LOG_PYTHON to a Python with facebook-camofox-client installed (`log facebook doctor`).'
  },
  workerNoOutput: {
    layer: 'runtime',
    meaning: 'The worker exited without printing a result.',
    retryable: true,
    raisedIn: ['worker'],
    monitor: 'failed',
    action: 'Read the stderr above it. Usually the browser died.'
  },
  workerBadOutput: {
    layer: 'runtime',
    meaning: "The worker's last line was not JSON.",
    retryable: true,
    raisedIn: ['worker'],
    monitor: 'failed',
    action: 'A library printed to stdout: move it to stderr in logWorker.py.'
  },
  badReply: {
    layer: 'runtime',
    meaning: 'The publish session replied with something that is not a step result.',
    retryable: false,
    raisedIn: ['publish.openingForm'],
    publish: 'failed',
    action: 'A bug: publishSession.py and camofox/session disagree.'
  },
  sessionExited: {
    layer: 'runtime',
    meaning: 'The publish session process exited mid-run.',
    retryable: true,
    raisedIn: ['session'],
    publish: 'failed',
    action: 'Read the stderr above it. Usually the browser died or was closed.'
  },
  badConfig: {
    layer: 'runtime',
    meaning: 'publishSession.py could not parse its config.',
    retryable: false,
    raisedIn: ['session'],
    publish: 'failed',
    action: 'A bug in camofox/session.'
  },
  badRequest: {
    layer: 'runtime',
    meaning: 'A Python process got a request it could not parse, or one missing a field.',
    retryable: false,
    raisedIn: ['worker', 'session'],
    publish: 'failed',
    monitor: 'failed',
    action: 'A bug in the caller.'
  },
  unknownAction: {
    layer: 'runtime',
    meaning: 'logWorker.py got an action it does not have.',
    retryable: false,
    raisedIn: ['worker'],
    monitor: 'failed',
    action: 'A bug: camofox/worker and logWorker.py disagree.'
  },
  unknownStep: {
    layer: 'runtime',
    meaning: 'publishSession.py got a step it does not have.',
    retryable: false,
    raisedIn: ['session'],
    publish: 'failed',
    action: 'A bug: camofox/session and publishSession.py disagree.'
  },
  notOpen: {
    layer: 'runtime',
    meaning: 'A step was sent before the form was opened.',
    retryable: false,
    raisedIn: ['session'],
    publish: 'failed',
    action: 'A bug in the machine order.'
  },
  captureMissing: {
    layer: 'runtime',
    meaning: 'A browser context was about to open with no HAR capture folder. Every action records a raw HAR (rule 22), so nothing opened.',
    retryable: false,
    raisedIn: ['proxyGate', 'worker', 'publish.openingForm'],
    publish: 'failed',
    monitor: 'failed',
    action: 'Pass capture_dir with the worker request (prepareRun sets run.captureDir), or receiptDir for the publish session.'
  },
  unguardedLaunch: {
    layer: 'runtime',
    meaning: 'Something tried to launch Camoufox outside the proxy gate, or with launch options the gate does not allow (locale, config, env, persistent context...). Refused.',
    retryable: false,
    raisedIn: ['proxyGate', 'worker', 'publish.openingForm'],
    publish: 'failed',
    monitor: 'failed',
    action: 'Tell matt. Every launch goes through python/browser/proxyGate.py apply(); find the caller in the detail.'
  },
  crashed: {
    layer: 'runtime',
    meaning: 'A step threw before Publish was clicked. Nothing was posted.',
    retryable: true,
    raisedIn: [
      'worker',
      'session',
      'publish.preparingPhotos',
      'publish.openingForm',
      'publish.solvingCaptcha',
      'publish.choosingCategory',
      'publish.uploadingPhotos',
      'publish.fillingFields',
      'publish.reviewing'
    ],
    publish: 'failed',
    monitor: 'failed',
    action: 'Read the detail (exception and message). Run again.'
  },
  crashedAfterPublish: {
    layer: 'runtime',
    meaning: 'A step threw after Publish was clicked. The listing may be live.',
    retryable: false,
    raisedIn: ['publish.publishing', 'publish.capturingId'],
    publish: 'unconfirmedId',
    action: 'Check Marketplace > Selling by hand. Never re-publish: it would duplicate.'
  },
  checkCrashed: {
    layer: 'runtime',
    meaning: "The monitor's check threw instead of returning an outcome.",
    retryable: false,
    raisedIn: ['monitor.checking'],
    monitor: 'failed',
    action: 'A bug in toCheckOutcome or the worker client.'
  },
  uncatalogued: {
    layer: 'runtime',
    meaning: 'A Python process sent a code that is not in this catalog. The detail starts with the code it sent.',
    retryable: false,
    raisedIn: ['worker', 'session'],
    publish: 'failed',
    monitor: 'failed',
    action: 'Add the code to src/errors/catalog/types.ts, then `bun run errors:export`.'
  },

  listingNotFound: {
    layer: 'listing',
    meaning: 'No agencyListing with that id in Twenty.',
    retryable: false,
    raisedIn: ['marketplace/agencyListing'],
    action: 'Check the id (log facebook listings shows them).'
  },
  listingNotRemovable: {
    layer: 'listing',
    meaning: 'The listing can\'t be deleted on Facebook: it was never published (no Facebook listing id), it has no account, or its status is not ACTIVE, UNDER_REVIEW, UNCONFIRMED, SOLD or DUPLICATE_TAKEDOWN.',
    retryable: false,
    raisedIn: ['cli/listing'],
    action: 'Check it with log facebook listing <id>. A listing already REMOVED stays as it is.'
  },
  listingNoAccount: {
    layer: 'listing',
    meaning: 'The agencyListing has no socialAccount, so nothing knows which account posts it.',
    retryable: false,
    raisedIn: ['marketplace/agencyListing'],
    action: 'Set its Social account in Twenty, or fill the campaign with log facebook campaign fill.'
  },
  listingNotPublishable: {
    layer: 'listing',
    meaning: 'The listing is not in a state that may be published (only DRAFT, READY, FAILED and BLOCKED). A live, publishing or unconfirmed listing would make a duplicate.',
    retryable: false,
    raisedIn: ['cli/publish'],
    action: 'Check it on Facebook. An UNCONFIRMED one needs a person, never a re-publish.'
  },
  listingInvalid: {
    layer: 'listing',
    meaning: "The listing's fields would stall the create form (title, price, category, photos, location).",
    retryable: false,
    raisedIn: ['cli/publish'],
    action: 'Fix the fields named in the detail in Twenty.'
  },
  notEnoughCopyVersions: {
    layer: 'listing',
    meaning: "The ad would be live on several listings in one city without enough copy versions, or a version breaks the copy rules (skills/listingCopy). Nothing was created.",
    retryable: false,
    raisedIn: ['cli/campaign'],
    action: 'Write at least as many versions as listings it will have live in that city, never fewer than 3, each by skills/listingCopy, in copyVersions; check them with log facebook listing lint --file <listing.json>.'
  },
  noReplacementAccount: {
    layer: 'listing',
    meaning: "No FACEBOOK account in the listing's country is ACTIVE, proxied, under its cap and not already in the campaign. The listing stays ACCOUNT_LOST.",
    retryable: true,
    raisedIn: ['marketplace/replacement'],
    action: 'Add or activate an account in that country (with a proxy there), then run log facebook campaign heal.'
  },

  twentyNotConfigured: {
    layer: 'twenty',
    meaning: 'TWENTY_BASE_URL or TWENTY_API_KEY is not set.',
    retryable: false,
    raisedIn: ['twenty/graphql'],
    action: 'Put both in log-cli/.env.local.'
  },
  twentyUnreachable: {
    layer: 'twenty',
    meaning: "Twenty didn't answer.",
    retryable: true,
    raisedIn: ['twenty/graphql'],
    action: 'Check the network and twenty.inferencesaver.com, then run again.'
  },
  twentyRateLimited: {
    layer: 'twenty',
    meaning: 'Twenty refused the call for its rate limit ("Limit reached (100 tokens per 60000 ms)"). Nothing was written.',
    retryable: true,
    raisedIn: ['twenty/graphql'],
    action: 'Nothing to do: the client waits out the minute and tries again (twice). If it still fails, fewer calls per minute.'
  },
  twentyAuthFailed: {
    layer: 'twenty',
    meaning: 'Twenty refused the API key (401/403).',
    retryable: false,
    raisedIn: ['twenty/graphql'],
    action: 'Make a new API key in Twenty and put it in log-cli/.env.local.'
  },
  twentyRequestFailed: {
    layer: 'twenty',
    meaning: 'Twenty answered with an error. The detail has its status and message.',
    retryable: true,
    raisedIn: ['twenty/graphql'],
    action: 'Read the detail. A field error means scripts/twenty/twentySetup.mjs needs running.'
  },
  accountNotFound: {
    layer: 'twenty',
    meaning: 'No socialAccount with that accountName or id in Twenty.',
    retryable: false,
    raisedIn: ['marketplace/socialAccount'],
    action: 'log facebook accounts lists the Facebook accounts.'
  },

  twoCaptchaNotConfigured: {
    layer: 'proxyVendor',
    meaning: "The 2Captcha proxy API key or proxy password isn't set.",
    retryable: false,
    raisedIn: ['proxyVendor/twoCaptcha'],
    action: 'Put 2CAPTCHA_API_KEY and 2CAPTCHA_PROXY_PASSWORD (dashboard → Proxy → sub-account password) in log-cli/.env.local.'
  },
  twoCaptchaRefused: {
    layer: 'proxyVendor',
    meaning: "2Captcha's API refused or didn't answer (bad key, no proxy product, network).",
    retryable: true,
    raisedIn: ['proxyVendor/twoCaptcha'],
    action: 'Read the detail. Check the key and that the proxy product is active with traffic left (log proxy balance).'
  },
  twoCaptchaNoPlace: {
    layer: 'proxyVendor',
    meaning: "2Captcha has no exit in that city of the account's home country.",
    retryable: false,
    raisedIn: ['proxyVendor/twoCaptcha'],
    action: 'Pick a city it has (--city), or --anyCity for anywhere in the country.'
  },
  bytefulNotConfigured: {
    layer: 'proxyVendor',
    meaning: "The Byteful API keys aren't set.",
    retryable: false,
    raisedIn: ['proxyVendor/byteful'],
    action: 'Put BYTEFUL_PUBLIC_KEY and BYTEFUL_PRIVATE_KEY (Byteful dashboard → API keys) in log-cli/.env.local.'
  },
  bytefulRefused: {
    layer: 'proxyVendor',
    meaning: "Byteful's API refused or didn't answer (bad keys, no plan, no traffic left, network).",
    retryable: true,
    raisedIn: ['proxyVendor/byteful'],
    action: 'Read the detail. Check the keys and that the plan has traffic left (log proxy balance --vendor byteful).'
  },
  bytefulNoCity: {
    layer: 'proxyVendor',
    meaning: "Byteful's residential pool has no devices in that city.",
    retryable: false,
    raisedIn: ['proxyVendor/byteful'],
    action: 'Pick a nearby city it has (--city), or --anyCity for anywhere in the country.'
  },
  proxyTooFar: {
    layer: 'proxyVendor',
    meaning: "Every proxy 2Captcha gave exited too far from the account's home city (it doesn't always honour the state and city it was asked for), or was too slow for Facebook. Nothing was saved.",
    retryable: true,
    raisedIn: ['proxyVendor/twoCaptcha'],
    action: 'Run `log proxy assign` again, or pick a nearby city it has (--city, --region).'
  },

  timedOut: {
    layer: 'auth',
    meaning: '`log login` waited and the browser never finished signing in.',
    retryable: true,
    raisedIn: ['auth/exchange'],
    action: 'Run `log login` again, or `log login --token <t>`.'
  },
  invalidExchange: {
    layer: 'auth',
    meaning: "The browser's sign-in payload did not match this login's state or PKCE challenge.",
    retryable: false,
    raisedIn: ['auth/exchange'],
    action: 'Run `log login` again from the start.'
  },
  profilePhotoMissing: {
    layer: 'profile',
    meaning: "The account has no profilePhoto or coverPhoto in Twenty, or the file can't be read.",
    retryable: false,
    raisedIn: ['profile.preparing'],
    action: 'Set socialAccounts.profilePhoto and coverPhoto (a URL or a local path) in Twenty, then run again.'
  },
  profileControlNotFound: {
    layer: 'profile',
    meaning: "The profile page had no control for the change (the button, its menu item or the file chooser).",
    retryable: false,
    raisedIn: ['profile.uploadingProfilePhoto', 'profile.uploadingCoverPhoto', 'profileSession'],
    action: "Read the run's capture (rule 25): profileFound.txt lists every button the page had. Update python/session/profileSession.py from it."
  },
  profileUploadNotSaved: {
    layer: 'profile',
    meaning: 'The photo was chosen, but Facebook did not show it saved (no Save button, or the dialog stayed open).',
    retryable: true,
    raisedIn: ['profile.uploadingProfilePhoto', 'profile.uploadingCoverPhoto'],
    action: "Read the run's capture and its saved page text; run once more after the launch gap (rule 24)."
  },
  browserDriverFailed: {
    layer: 'browser',
    meaning: 'A browser driver step threw something without a catalog code, or a session was started without its driver steps.',
    retryable: false,
    raisedIn: ['browser/driver'],
    action: 'Read the detail; give the step a catalog code in its driver.'
  },
  browserGone: {
    layer: 'browser',
    meaning: 'The open browser went away (crashed, or the window was closed).',
    retryable: true,
    raisedIn: ['browser/driver', 'cli/host'],
    action: 'Nothing: the host reopens it once a day; a second crash goes to a person (rule 35).'
  },
  adsPowerUnavailable: {
    layer: 'adsPower',
    meaning: "AdsPower's Local API didn't answer (the app isn't running, or ADSPOWER_HOST is wrong).",
    retryable: true,
    raisedIn: ['browser/adsPower'],
    action: 'Start the AdsPower app (or `ads start`), check ADSPOWER_HOST in .env.local, then `log adsPower status`.'
  },
  adsPowerRequestFailed: {
    layer: 'adsPower',
    meaning: 'The Local API refused the call (its msg is in the detail): a bad field, a missing profile, the plan limit, or a wrong API key.',
    retryable: false,
    raisedIn: ['browser/adsPower'],
    action: "Read the detail. A profile limit means the AdsPower plan holds fewer profiles than accounts; a key error means ADSPOWER_API_KEY doesn't match the app."
  },
  adsPowerRateLimited: {
    layer: 'adsPower',
    meaning: 'The Local API said "Too many request" three times in a row.',
    retryable: true,
    raisedIn: ['browser/adsPower'],
    action: 'Nothing: run it again in a minute. The plan sets the requests per minute (300, 900 or 1500).'
  },
  adsPowerProfileMissing: {
    layer: 'adsPower',
    meaning: 'The account has no AdsPower profile linked in Twenty (socialAccounts.adsPowerProfileId).',
    retryable: false,
    raisedIn: ['browser/adsPower', 'python/browserDriver'],
    action: 'Run `log adsPower sync --apply` (it makes the profile and links it).'
  },
  groupRefInvalid: {
    layer: 'group',
    meaning: '--group names no Facebook group (a facebook.com/groups/<id or name>/ URL, the id, or the name in the URL).',
    retryable: false,
    raisedIn: ['facebook/group/join'],
    action: "Copy the group's URL from the browser and pass it as --group."
  },
  groupBrowserNotOpen: {
    layer: 'group',
    meaning: "The account's browser is not open: a join or a read is a step in it, never a launch of its own (rule 35).",
    retryable: false,
    raisedIn: ['cli/join', 'cli/read'],
    action: 'Open it first: log inspect start --account <a> (or log facebook host start), then run the join or the read again.'
  },
  groupPageNotOpened: {
    layer: 'group',
    meaning: "The group page did not open in the account's browser.",
    retryable: true,
    raisedIn: ['facebook/group/join.opening'],
    action: "Read the run's step folder (rule 25): its screenshot and HAR show where the page went."
  },
  groupGateUnknown: {
    layer: 'group',
    meaning: 'The group page showed neither a Join nor a Joined button: a page not recorded yet.',
    retryable: false,
    raisedIn: ['facebook/group/join.reading'],
    action: "Read the step's snapshot.yml and screenshot: name the page's button in facebook/group/join/helpers/readGroupPage.ts from that recording (rule 29)."
  },
  groupQuestionsNotReopened: {
    layer: 'group',
    meaning: 'The group page shows no way back into its questions: no "Answer questions" button and no open dialog.',
    retryable: false,
    raisedIn: ['facebook/group/answer.choosing', 'facebook/group/answer.reopening'],
    action: "Read the opening step's snapshot (rule 25): a public group's participation questions have no recorded way back in yet. Record one with log inspect before filling it (rule 29)."
  },
  groupFillIncomplete: {
    layer: 'group',
    meaning: "A fill step had no element in the dialog, or one failed: the draft and the dialog don't match.",
    retryable: false,
    raisedIn: ['facebook/group/answer.planning', 'facebook/group/answer.filling'],
    action: "Read the reading step's snapshot.yml: the questions may have changed (run the stepper again: log facebook join group --answer), or a type isn't recorded yet."
  },
  groupSubmitNotConfirmed: {
    layer: 'group',
    meaning: 'Submit was pressed and the dialog stayed open, or the click failed. It is not pressed again.',
    retryable: false,
    raisedIn: ['facebook/group/answer.submitting', 'facebook/group/answer.checking'],
    action: "Read the submitting and checking steps' recordings (rule 25) before another --submit."
  },
  groupJoinNotConfirmed: {
    layer: 'group',
    meaning: 'Join was pressed and the page did not change, or the click failed. It is not pressed again.',
    retryable: false,
    raisedIn: ['facebook/group/join.joining', 'facebook/group/join.checking'],
    action: "Read the joining and checking steps' recordings (rule 25) before another --live run."
  },
  groupIdUnknown: {
    layer: 'group',
    meaning: "The group page never gave the group's numeric id (the read keeps a post only with its group's id).",
    retryable: true,
    raisedIn: ['facebook/group/read.opening'],
    action: "Read the opening step's recording (rule 25), or pass the group's numeric id as --group."
  },
  groupNoAccount: {
    layer: 'group',
    meaning: 'No account in Twenty is in this group (no agencyGroups row with its id), so none can read it.',
    retryable: false,
    raisedIn: ['cli/read.worker'],
    action: 'Join it first with one account: log facebook join group --account <a> --group <id> --live.'
  },
  groupReadStepFailed: {
    layer: 'group',
    meaning: "A step of the group read failed in the account's browser (a scroll, a post page, its comments).",
    retryable: true,
    raisedIn: ['facebook/group/read.scrolling', 'facebook/group/read.openingPost', 'facebook/group/read.scrollingComments'],
    action: "Read the step's recording (rule 25): its screenshot and HAR show where the page was."
  },
  controlMissing: {
    layer: 'browser',
    meaning: "No visible control of the step's role has its name as its accessible name, aria-label, label, text or placeholder (case and spacing ignored), inside the dialog the step names.",
    retryable: false,
    raisedIn: ['inspectSession.by_role'],
    action: "Read the step's snapshot.yml: the page changed or a state came up first. Record the page again with log inspect and rebuild the flow (rule 29)."
  },
  controlAmbiguous: {
    layer: 'browser',
    meaning: 'More than one visible, enabled control matches the step, so none is clicked: the step never guesses.',
    retryable: false,
    raisedIn: ['inspectSession.by_role'],
    action: "Give the step the dialog it sits in (`within`, from the recording's snapshot) or record the page again (rule 29)."
  },
  controlDisabled: {
    layer: 'browser',
    meaning: "The step's control is there but stayed disabled until the step's wait ran out: what it waits on never finished.",
    retryable: true,
    raisedIn: ['inspectSession.by_role'],
    action: "Read the previous step's answers (rule 73): the call that enables it did not come back."
  },
  noHomeRegion: {
    layer: 'account',
    meaning: "The account's home city has no state or province in CITY_REGIONS, so its Marketplace location can't be typed as \"City, State\" written out (rule 72).",
    retryable: false,
    raisedIn: ['cli/preflight', 'host.setLocation'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Add the city with its state or province code to CITY_REGIONS in src/marketplace/home/types.ts.'
  },
  twoStepNoAuthApp: {
    layer: 'account',
    meaning: "Facebook asked for a passkey and its method picker (TwoStepVerificationChallengePickerDialogQuery) offered no authentication app (TOTP), or disabled it, so the account's authenticator secret can't sign it in.",
    retryable: false,
    raisedIn: ['host.signIn'],
    publish: 'blocked',
    monitor: 'blocked',
    action: tellMatt
  },
  overlayNotCleared: {
    layer: 'browser',
    meaning: "A known overlay (the browser-notifications notice, an ended 'What happened' notice) stayed over the page after its key, or its clearing call didn't answer as it must, so the flow's first click never happens.",
    retryable: true,
    raisedIn: ['flow.clearOverlays'],
    action: "Read the press step's snapshot and exchanges (rule 73): the overlay may have changed. Record it with log inspect and update its page state (rule 54)."
  },
  adsPowerKernelMissing: {
    layer: 'adsPower',
    meaning: "The SunBrowser kernel a profile starts is not downloaded, so it can't start: with ua_auto that is the Chrome version in the profile's own user agent (Scranton's is 154, Exeter's 156), not the newest.",
    retryable: true,
    raisedIn: ['host.openBrowser', 'cli/preflight'],
    action: 'Run `log facebook preflight --apply`: it downloads the kernel and waits for it.'
  },
  noAdsPowerProfile: {
    layer: 'adsPower',
    meaning: 'The account has no AdsPower profile linked (adsPowerProfileId is empty).',
    retryable: false,
    raisedIn: ['cli/preflight'],
    action: 'Run `log adsPower sync --apply`.'
  },
  sessionOpen: {
    layer: 'runtime',
    meaning: "A live session already holds the account's browser, so another can't open it.",
    retryable: true,
    raisedIn: ['cli/preflight'],
    action: 'Use that session, or close it: log inspect do stop --account <a>.'
  },
  proxyWrongCountry: {
    layer: 'account',
    meaning: "The proxy answers, but its exit is in another country than the account's home.",
    retryable: false,
    raisedIn: ['cli/preflight'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Run `log proxy assign --account <id>`.'
  },
  proxyCheckFailed: {
    layer: 'account',
    meaning: 'The proxy check itself could not run (the worker or the run folder failed), so the proxy is unknown.',
    retryable: true,
    raisedIn: ['cli/preflight'],
    publish: 'blocked',
    monitor: 'blocked',
    action: 'Run `log proxy check --account <id>` and read its error.'
  },
  opensSpent: {
    layer: 'runtime',
    meaning: "The host already opened the account's browser the most times allowed today (rule 35).",
    retryable: true,
    raisedIn: ['lifecycle.opening', 'cli/preflight'],
    action: 'It opens again tomorrow, local time. Only matt resets it: log facebook account resetOpens <a> (rule 37).'
  },
} as const satisfies Record<string, ErrorEntry>

export type ErrorCode = keyof typeof ERROR_CATALOG

export type CodeOfLayer<L extends ErrorLayer> = {
  [C in ErrorCode]: (typeof ERROR_CATALOG)[C]['layer'] extends L ? C : never
}[ErrorCode]

export type CaptchaStopReason = {
  [C in ErrorCode]: (typeof ERROR_CATALOG)[C] extends { publish: 'needsPerson' } ? C : never
}[ErrorCode]

export interface CodedFailure {
  ok: false
  code: ErrorCode
  detail?: string
}
