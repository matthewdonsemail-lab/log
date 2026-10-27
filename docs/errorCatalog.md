# Error catalog

Generated from `src/errors/catalog/types.ts` by `bun run errors:export`. Don't edit by hand:
change the catalog, re-export, and `catalog.test.ts` checks the two match.

Every failure in log-cli carries one of these codes, whether it starts in TypeScript or in
`python/session/logWorker.py` / `python/session/publishSession.py`. A code the catalog doesn't have becomes
`uncatalogued` at the boundary, so nothing unknown passes as known.

- **Retry**: yes means it can clear by itself (a retry, or time). No means a person acts.
- **Ends in**: the state each machine goes to. A publish failure always passes through `stopping`,
  which reads the code's end from this catalog. The monitor retries `failed` checks only when
  the code is retryable. `captcha→skipSolver` drops that solver for the rest of the run.

Print it from the CLI with `log errors`, one code with `log errors --code <code>`, and a machine
with `log graph publish` / `log graph monitor`.

## publish machine

```mermaid
stateDiagram-v2
  [*] --> preparingPhotos
  preparingPhotos --> stopping: done [stepFailed]
  preparingPhotos --> openingForm: done
  preparingPhotos --> stopping: error
  openingForm --> choosingCategory: done [formReady]
  openingForm --> routingCaptcha: done [formCaptcha]
  openingForm --> signingIn: done [canSignIn]
  openingForm --> stopping: done [formIssue]
  openingForm --> stopping: done
  openingForm --> stopping: error
  signingIn --> openingForm: done [signedIn]
  signingIn --> stopping: done
  signingIn --> stopping: error
  routingCaptcha --> solvingCaptcha: always [hasSolver]
  routingCaptcha --> stopping: always
  solvingCaptcha --> openingForm: done
  solvingCaptcha --> stopping: error
  choosingCategory --> stopping: done [stepFailed]
  choosingCategory --> uploadingPhotos: done
  choosingCategory --> stopping: error
  uploadingPhotos --> stopping: done [stepFailed]
  uploadingPhotos --> fillingFields: done
  uploadingPhotos --> stopping: error
  fillingFields --> stopping: done [stepFailed]
  fillingFields --> reviewing: done
  fillingFields --> stopping: error
  reviewing --> stopping: done [stepFailed]
  reviewing --> done: done [isDryRun]
  reviewing --> publishing: done
  reviewing --> stopping: error
  publishing --> stopping: done [stepFailed]
  publishing --> confirming: done
  publishing --> stopping: error
  confirming --> stopping: done [rejected]
  confirming --> capturingId: done
  confirming --> capturingId: error
  capturingId --> done: done [hasListingId]
  capturingId --> stopping: done
  capturingId --> stopping: error
  stopping --> blocked: always [endsBlocked]
  stopping --> needsPerson: always [endsNeedsPerson]
  stopping --> unconfirmedId: always [endsUnconfirmed]
  stopping --> failed: always
  done --> [*]
  unconfirmedId --> [*]
  needsPerson --> [*]
  blocked --> [*]
  failed --> [*]
```

## monitor machine

```mermaid
stateDiagram-v2
  [*] --> checking
  checking --> evaluating: done [isOk]
  checking --> resting: done [isRateLimited]
  checking --> blocked: done [isIssue]
  checking --> failed: done
  checking --> failed: error
  evaluating --> done: always [checksDone]
  evaluating --> waiting: always
  waiting --> checking: after poll
  resting --> checking: after rest
  resting --> done: always [checksDone]
  failed --> tripped: always [circuitOpen]
  failed --> retrying: always [canQuickRetry]
  failed --> done: always [checksDone]
  failed --> waiting: always
  retrying --> checking: after retry
  blocked --> [*]
  tripped --> [*]
  done --> [*]
```

## account

| Code | Retry | Raised in | Ends in | Meaning | Do |
| --- | --- | --- | --- | --- | --- |
| `neverConnected` | no | `worker`, `publish.openingForm` | publish→blocked, monitor→blocked | No saved Facebook session for this account. | Run `log facebook connect --account <id>` and log in by hand. |
| `disconnected` | no | `marketplace/account` | publish→blocked, monitor→blocked | The account was disconnected on purpose. | Run `log facebook connect --account <id>` and log in by hand. |
| `stale` | yes | `marketplace/account` | publish→blocked, monitor→blocked | The account has not been checked for too long to trust its state. | Run `log facebook scan --account <id>`. |
| `sessionExpired` | no | `worker`, `publish.openingForm`, `marketplace/account` | publish→blocked, monitor→blocked | Facebook sent the session to the login page. | Run `log facebook connect --account <id>` and log in by hand. |
| `sessionInvalidatedChanged` | no | `marketplace/account` | publish→blocked, monitor→blocked | The session was invalidated, usually by a password change. | Run `log facebook connect --account <id>` and log in by hand. |
| `checkpointed` | no | `worker`, `publish.openingForm`, `marketplace/account` | publish→blocked, monitor→blocked | Facebook put the account on a checkpoint (verify identity, SMS code, ID). | Log in by hand and clear the checkpoint, then `log facebook connect`. No solver can do it. |
| `accountNotTwitter` | no | `twitter/account/session` | publish→blocked, monitor→blocked | A log twitter command was given an account whose platform in Twenty is not TWITTER. | Name a TWITTER socialAccount (its accountName is the handle). |
| `noTwitterSession` | no | `twitter/account/session` | publish→blocked, monitor→blocked | The X account's saved cookies in Twenty have no auth_token + ct0, so there is no session to call X with. | Save the account's cookies from a normal manual login: `bun bin/log.ts twitter cookies save --account <handle>` in a terminal. |
| `twitterCookiesRefused` | no | `cli/twitter` | publish→blocked, monitor→blocked | X didn't accept the cookies typed into log twitter cookies save, so nothing was saved to Twenty. | Copy auth_token and ct0 again from a browser where the account is signed in to x.com, and run it again. |
| `twitterCookiesWrongAccount` | no | `cli/twitter` | publish→blocked, monitor→blocked | The cookies typed into log twitter cookies save are signed in to a different X account than --account names, so nothing was saved. | Copy the cookies from a browser signed in to that handle, or give --account the handle the cookies belong to. |
| `accountNotOnPlatform` | no | `platformKit/session` | publish→blocked, monitor→blocked | A log <platform> command was given an account whose platform in Twenty isn't that platform. | Name a socialAccount of that platform (its accountName is the handle). |
| `noPlatformSession` | no | `platformKit/session` | publish→blocked, monitor→blocked | The account's saved cookies in Twenty don't hold the session cookies its platform needs, so there is no session to call it with. | Save the account's cookies from a normal manual login into its socialAccounts row. |
| `governorBlocked` | no | `directApi/engine` | publish→blocked, monitor→blocked | The account's direct-API governor refused the call: a soft-block or checkpoint pause, the hourly or daily request cap, or the 40-a-day write budget (fbk's RequestGovernor, one per account under ~/.logCli/fbk/<account>). | Stop for this account until the pause ends or the day rolls over; never retry into it. |
| `wrongPassword` | no | `connect.routing` | publish→blocked, monitor→blocked | Facebook said the password is wrong, or found no account for the email, when `log facebook connect` signed in with Twenty's details. | Fix the account's email or password in Twenty, then `log facebook connect` again. Auto-login stops at once so Facebook doesn't see repeated wrong passwords. |
| `videoSelfieRequired` | no | `connect.routing` | publish→blocked, monitor→blocked | Facebook's checkpoint wants a video selfie ("Confirm that you're a real person with a video selfie"). No solver or auto-login can do it. | A person records the selfie in the Camoufox window (or on the account owner's phone), then `log facebook connect` again. Tell matt. |
| `signInNotFinished` | no | `connect.signingIn` | publish→blocked, monitor→blocked | `log facebook connect` reached its deadline (`--wait`) without a logged-in page: the login, two-step or a captcha was not finished. | Run `log facebook connect` again and finish the step its last page names in the Camoufox window, or give it a longer `--wait`. A two-step page needs the totpSecret in Twenty. |
| `unconfirmedUser` | no | `marketplace/account` | publish→blocked, monitor→blocked | The account has not confirmed its email or phone. | Confirm the email or phone on Facebook by hand. |
| `cookieInvalid` | no | `marketplace/account` | publish→blocked, monitor→blocked | The saved cookies are not accepted. | Run `log facebook connect --account <id>` and log in by hand. |
| `identityVerificationRequired` | no | `marketplace/check`, `flow.marketplaceListingPublish` | publish→blocked, monitor→blocked | Facebook holds the account's listings until a person confirms their identity: Selling says "Confirm your identity to publish this and any future listings", and MarketplaceYourListingDialogQuery answers a seller notice of type INTEGRITY_NEEDS_VERIFICATION_VH ("More Info Needed to Publish This Listing", "Please confirm your mobile number before selling on Marketplace"). | Tell matt. Don't retry the account until it's looked at. |
| `suspended` | no | `worker`, `publish.openingForm`, `marketplace/account` | publish→blocked, monitor→blocked | Marketplace is restricted or the account is disabled ("can't buy or sell"). | Tell matt. Don't retry the account until it's looked at. |
| `readOnlyLimited` | no | `marketplace/account` | publish→blocked, monitor→blocked | The account can read but Facebook refuses its writes ("something went wrong"). | Tell matt. Don't retry the account until it's looked at. |
| `automatedFlagged` | no | `marketplace/account` | publish→blocked, monitor→blocked | Facebook flagged the account as automated. | Tell matt. Don't retry the account until it's looked at. |
| `rateLimited` | yes | `worker`, `publish.openingForm`, `publish.reviewing`, `marketplace/account` | publish→blocked, monitor→resting | Facebook says the account hit a limit ("limit reached", "daily listing limit"). | Wait 24h. The monitor rests by itself; publish again tomorrow. |
| `proxyRateLimited` | yes | `marketplace/account` | publish→blocked, monitor→blocked | The proxy, not Facebook, is rate limiting. | Wait, or move the account to another proxy. |
| `challengeInterstitial` | no | `marketplace/account` | publish→blocked, monitor→blocked | An interstitial challenge page stands in front of the content. | Open the account by hand and clear the page. |
| `ipOrAccountBlocked` | no | `marketplace/account` | publish→blocked, monitor→blocked | The IP or the account is blocked. | Tell matt. Don't retry the account until it's looked at. |
| `restrictedPolicy` | no | `marketplace/account` | publish→blocked, monitor→blocked | A policy restriction applies to the account. | Tell matt. Don't retry the account until it's looked at. |
| `permissionDenied` | no | `marketplace/account` | publish→blocked, monitor→blocked | The account lacks permission for this action. | Tell matt. Don't retry the account until it's looked at. |
| `joinGate` | no | `marketplace/account` | publish→blocked, monitor→blocked | A group asks the account to join first. | Join the group by hand. |
| `removedFromGroup` | no | `marketplace/account` | publish→blocked, monitor→blocked | The account was removed from a group. | Tell matt. Don't retry the account until it's looked at. |
| `proxyUnreachable` | yes | `proxyGate`, `publish.openingForm`, `worker`, `marketplace/account` | publish→blocked, monitor→blocked | No exit IP through the account's proxy: it is down or refusing connections. No browser was opened. | Check the proxy is up, then `log proxy check --account <id>`. |
| `proxyTooSlow` | yes | `proxyGate` | publish→blocked, monitor→blocked | The proxy's exit answers, but takes seconds for each Facebook file, so pages never get past Facebook's loading skeleton. Refused before any page opened. | Run `log proxy assign --account <id>`: it skips slow exits and saves a fresh session that answers quickly. |
| `proxyAuthFailed` | no | `proxyGate`, `publish.openingForm`, `worker`, `marketplace/account` | publish→blocked, monitor→blocked | The proxy answered 407: it refused the username or password. No browser was opened. | Fix the username and password in the socialAccount proxy in Twenty. |
| `proxyMalformed` | no | `proxyGate`, `marketplace/socialAccount`, `publish.openingForm`, `worker`, `marketplace/account` | publish→blocked, monitor→blocked | The account's proxy can't be read: it needs scheme://user:pass@host:port. | Fix the socialAccount proxy in Twenty. |
| `accountNotFacebook` | no | `marketplace/socialAccount` | publish→blocked, monitor→blocked | The socialAccount is not platform FACEBOOK. log-cli only runs Facebook accounts. | Pick a FACEBOOK account, or fix its platform in Twenty. |
| `accountNotUsable` | no | `marketplace/socialAccount` | publish→blocked, monitor→blocked | The account's accountStatus doesn't allow this run (only ACTIVE and WARMING post; connect also takes NEEDS_LOGIN and CHECKPOINT). An empty status counts as not usable. | Set accountStatus in Twenty (log facebook account status), or use another account. |
| `noHomeCountry` | no | `marketplace/socialAccount` | publish→blocked, monitor→blocked | The account has no homeCountry (ISO, e.g. IE), so its proxy and listings can't be checked. Nothing runs without it. | Set homeCountry (and homeCity) on the socialAccount in Twenty. |
| `accountDisabled` | no | `worker`, `publish.openingForm`, `marketplace/account` | publish→blocked, monitor→blocked | Facebook says the account is disabled or locked. | The account becomes BANNED and its campaign listings get replacement accounts. Keep the record. |
| `dailyCapReached` | yes | `cli/publish`, `marketplace/replacement` | publish→blocked, monitor→blocked | The account already published its dailyListingCap listings today (3 when empty). | Wait until tomorrow, or raise dailyListingCap in Twenty. |
| `noProxy` | no | `proxyGate`, `marketplace/socialAccount`, `publish.openingForm`, `worker` | publish→blocked, monitor→blocked | The account has no proxy in Twenty, and no browser opens for an account without one (rule 12), not for a dry run and not for signing in. | Set the socialAccount proxy in Twenty (scheme://user:pass@host:port), then `log proxy check --account <name>`. |
| `proxyCountryMismatch` | no | `proxyGate`, `publish.openingForm`, `worker` | publish→blocked, monitor→blocked | The proxy's exit IP is not in the account's country, so Facebook would see the account in the wrong place. No browser was opened. | Use a proxy that exits in the account's homeCountry, or fix homeCountry in Twenty if it is wrong. |
| `proxyCountryChanged` | yes | `publish.reviewing`, `publish.publishing` | publish→blocked, monitor→blocked | The proxy's exit IP moved to another country during the run (2Captcha's sticky session rotated). Stopped before Publish was clicked. | Run `log proxy check --account <id>`; if it keeps leaving the country, `log proxy assign` it a new session. |
| `outsideActiveHours` | yes | `browser/run`, `cli/watch` | publish→blocked, monitor→blocked | It is outside the account's local waking hours (08:00-22:00 in its home timezone unless activeHoursStart/End say otherwise). Nothing opened. The detail has the local time and when the window opens. | Run it inside the window in the detail, or change activeHoursStart/activeHoursEnd on the socialAccount in Twenty. |
| `accountBusy` | yes | `mcp/jobs` | publish→blocked, monitor→blocked | A job over MCP already holds this account (one browser per account, rule 35). Nothing started. | Follow the job in the detail with jobStatus until it ends, or stop it with jobCancel, then call again. |
| `launchTooSoon` | yes | `browser/run` | publish→blocked, monitor→blocked | The account's browser opened on Facebook less than 10 minutes ago (rule 24). Nothing opened. | Wait the minutes in the detail. Back-to-back launches are what drew the 2026-10-19 checkpoints. |
| `launchBudgetSpent` | yes | `browser/run` | publish→blocked, monitor→blocked | The account's browser has opened on Facebook 8 times today, its local day, dry runs included (rule 24). Nothing opened. | Run it tomorrow (local time), or from another account in the same country. |
| `noHomeLocale` | no | `marketplace/home`, `browser/run` | publish→blocked, monitor→blocked | log-cli has no browser locale for the account's homeCountry, so it can't pin one. Nothing opened. | Add the country to HOME_COUNTRIES in src/marketplace/home/types.ts, or fix homeCountry in Twenty. |
| `noHomeTimezone` | no | `marketplace/home`, `browser/run` | publish→blocked, monitor→blocked | The account's homeCountry has several timezones and its homeCity isn't in the city table, so its local time is unknown. Nothing opened. | Add the city to CITY_TIMEZONES in src/marketplace/home/types.ts, or fix homeCity in Twenty. |
| `deviceProfileInvalid` | no | `browser/run`, `proxyGate`, `publish.openingForm`, `worker` | publish→blocked, monitor→blocked | The account's stored deviceProfile can't be read, or the run's device file is missing. Nothing opened: a new device would look like a different computer. | Tell matt. Don't clear deviceProfile unless he decides the account may get a new device. |
| `browserTimezoneMismatch` | no | `proxyGate`, `publish.openingForm`, `worker` | publish→blocked, monitor→blocked | The launch self-check found a timezone in the page or a worker that isn't the exit IP's. The browser was closed before Facebook loaded. | Tell matt: the timezone forcing is broken (often after a Camoufox upgrade). Re-run the leak tests before any run. |
| `browserLocaleMismatch` | no | `proxyGate`, `publish.openingForm`, `worker` | publish→blocked, monitor→blocked | The launch self-check found navigator.language(s) or the Intl locale, in the page or a worker, not equal to the account's pinned locale. The browser was closed before Facebook loaded. | Tell matt: the locale pinning is broken (often after a Camoufox upgrade). Re-run the leak tests before any run. |
| `browserExitIpMismatch` | yes | `proxyGate`, `publish.openingForm`, `worker` | publish→blocked, monitor→blocked | The exit IP seen from inside the browser isn't the one the proxy gate checked (rotated, or the browser isn't using the proxy). The browser was closed before Facebook loaded. | Run it again. If it repeats, `log proxy check --account <id>` and tell matt. |
| `selfCheckFailed` | yes | `proxyGate`, `publish.openingForm`, `worker` | publish→blocked, monitor→blocked | The launch self-check couldn't run (no IP echo answered through the browser, or the worker didn't start), so nothing proves the browser looks right. Closed before Facebook loaded. | Run it again. If it repeats, check the proxy (`log proxy check`) and tell matt. |
| `listingCountryMismatch` | no | `cli/publish` | publish→blocked, monitor→blocked | The listing's location is not in the account's country, or has no country to check. Refused before any browser opens. | Write the location as "City, Country" in the account's country, or post it from an account in that country. |
| `loginWall` | no | `worker`, `marketplace/account` | publish→blocked, monitor→blocked | The page loaded but shows a login wall instead of content. | Run `log facebook connect --account <id>` and log in by hand. |
| `captchaHtml` | no | `marketplace/account` | publish→blocked, monitor→blocked | The page loaded but shows a captcha instead of content. | Open the account by hand. `log facebook publish` routes captchas itself; `scan` does not. |
| `unknownPlatform` | no | `marketplace/account` | publish→blocked, monitor→blocked | The account belongs to a platform log-cli does not know. | Facebook only (AGENTS.md rule 3). |
| `unknown` | no | `marketplace/account` | publish→blocked, monitor→blocked | The client saw an account failure it could not map. | Look at the raw signal and add a code for it here. |
| `marketplaceMayNotPost` | no | `cli/flow`, `cli/warmup` | publish→blocked | Marketplace's create page answers `marketplace_new_seller_can_post_item: false`: no listing can be created from this account now. Bethlehem, 2026-10-23 (it was true on 2026-10-22). | Publish nothing from this account; matt decides. Read the create page's answer again on a later day. |
| `marketplaceLocationWrong` | yes | `cli/flow`, `cli/warmup` | publish→blocked | A Marketplace page's own answer puts the account somewhere other than its home: `sell_location` on the create page, or `buy_location` on Marketplace, names another city or country (Bethlehem's sell_location was Barranco, Peru on 2026-10-22). | Set the Marketplace location to the account's home with `log inspect do setLocation "City, State" --live` (rule 72), then read the page's answer again. |
| `noHomeRegion` | no | `cli/preflight`, `host.setLocation` | publish→blocked, monitor→blocked | The account's home city has no state or province in CITY_REGIONS, so its Marketplace location can't be typed as "City, State" written out (rule 72). | Add the city with its state or province code to CITY_REGIONS in src/marketplace/home/types.ts. |
| `twoStepNoAuthApp` | no | `host.signIn` | publish→blocked, monitor→blocked | Facebook asked for a passkey and its method picker (TwoStepVerificationChallengePickerDialogQuery) offered no authentication app (TOTP), or disabled it, so the account's authenticator secret can't sign it in. | Tell matt. Don't retry the account until it's looked at. |
| `proxyWrongCountry` | no | `cli/preflight` | publish→blocked, monitor→blocked | The proxy answers, but its exit is in another country than the account's home. | Run `log proxy assign --account <id>`. |
| `proxyCheckFailed` | yes | `cli/preflight` | publish→blocked, monitor→blocked | The proxy check itself could not run (the worker or the run folder failed), so the proxy is unknown. | Run `log proxy check --account <id>` and read its error. |

## listing

| Code | Retry | Raised in | Ends in | Meaning | Do |
| --- | --- | --- | --- | --- | --- |
| `locationAbbreviated` | no | `facebook/marketplace/location`, `cli/listing`, `cli/publish`, `cli/flow`, `cli/inspect`, `cli/host`, `python/session` | command exits | A Marketplace location is abbreviated ("Bethlehem, PA"), a zip or a number, or names no state or country. "Bethlehem, PA" was offered only as the West Bank and a bare zip offered Granada, Spain first, so nothing is typed. Nothing was done on Facebook. | Write it as "City, State" with the state written out ("Bethlehem, Pennsylvania"), or "City, Country" ("Galway, Ireland"), in the listing's locationQuery or the --set location value. |
| `listingNotFound` | no | `marketplace/agencyListing` | command exits | No agencyListing with that id in Twenty. | Check the id (log facebook listings shows them). |
| `listingNotRemovable` | no | `cli/listing` | command exits | The listing can't be deleted on Facebook: it was never published (no Facebook listing id), it has no account, or its status is not ACTIVE, UNDER_REVIEW, UNCONFIRMED, SOLD or DUPLICATE_TAKEDOWN. | Check it with log facebook listing <id>. A listing already REMOVED stays as it is. |
| `listingNoAccount` | no | `marketplace/agencyListing` | command exits | The agencyListing has no socialAccount, so nothing knows which account posts it. | Set its Social account in Twenty, or fill the campaign with log facebook campaign fill. |
| `listingNotPublishable` | no | `cli/publish` | command exits | The listing is not in a state that may be published (only DRAFT, READY, FAILED and BLOCKED). A live, publishing or unconfirmed listing would make a duplicate. | Check it on Facebook. An UNCONFIRMED one needs a person, never a re-publish. |
| `listingInvalid` | no | `cli/publish` | command exits | The listing's fields would stall the create form (title, price, category, photos, location). | Fix the fields named in the detail in Twenty. |
| `notEnoughCopyVersions` | no | `cli/campaign` | command exits | The ad would be live on several listings in one city without enough copy versions, or a version breaks the copy rules (skills/listingCopy). Nothing was created. | Write at least as many versions as listings it will have live in that city, never fewer than 3, each by skills/listingCopy, in copyVersions; check them with log facebook listing lint --file <listing.json>. |
| `noReplacementAccount` | yes | `marketplace/replacement` | command exits | No FACEBOOK account in the listing's country is ACTIVE, proxied, under its cap and not already in the campaign. The listing stays ACCOUNT_LOST. | Add or activate an account in that country (with a proxy there), then run log facebook campaign heal. |

## photo

| Code | Retry | Raised in | Ends in | Meaning | Do |
| --- | --- | --- | --- | --- | --- |
| `noPhotos` | no | `publish.preparingPhotos` | publish→failed | The listing has no photos. Facebook keeps Next disabled with 0. | Add at least 1 photo. |
| `tooManyPhotos` | no | `publish.preparingPhotos` | publish→failed | More than 10 photos. Facebook takes 10. | Send 10 or fewer. |
| `photoNeedsProxy` | no | `publish.preparingPhotos` | publish→failed | A photo is a URL, and URLs are only fetched through the account's own HTTP proxy, never from this machine. The account has none that fetch can use (none, or SOCKS5). | Give the account an HTTP proxy (log proxy assign), or store the photo as a local file or data-URL. |
| `unreadablePhoto` | no | `publish.preparingPhotos` | publish→failed | A photo path, URL or data-URL could not be read. | Fix the path or URL in the detail. |
| `notAnImage` | no | `publish.preparingPhotos` | publish→failed | The bytes are not a JPEG, PNG, WebP, GIF, HEIC or AVIF image. | Replace the file. |
| `variationFailed` | no | `publish.preparingPhotos` | publish→failed | sharp could not make the varied JPEG. | Open the photo by hand; it is probably corrupt. |

## form

| Code | Retry | Raised in | Ends in | Meaning | Do |
| --- | --- | --- | --- | --- | --- |
| `pageNotReached` | no | `flow.step`, `warmup.step` | publish→failed | A flow or warm-up step went to a page and Facebook put the browser somewhere else. | Read the step's screenshot and HAR (rule 25): where it landed says why (a checkpoint and a login are their own codes). |
| `formNotFound` | yes | `publish.openingForm` | publish→failed | The create form never showed its Title field. | Run again. If it repeats, Facebook changed the form: update the selectors. |
| `categoryNotSet` | yes | `publish.choosingCategory` | publish→failed | Category was picked 3 times and the box still reads something else. | Check the category name matches the form's list. |
| `photoMissing` | no | `publish.uploadingPhotos` | publish→failed | A prepared photo file was gone when the upload started. | Run again; the photos are prepared fresh each run. |
| `noFileInput` | yes | `publish.uploadingPhotos` | publish→failed | The form has no image file input. | Run again. If it repeats, Facebook changed the form: update the selectors. |
| `photosNotConfirmed` | yes | `publish.uploadingPhotos`, `publish.reviewing` | publish→failed | Facebook's N/10 photo counter doesn't match the photos sent. | Run again. Check the review screenshot for photos Facebook rejected. |
| `titleNotSet` | yes | `publish.fillingFields` | publish→failed | The Title field did not keep the value. | Run again. |
| `priceNotSet` | yes | `publish.fillingFields` | publish→failed | The Price field did not keep the value. | Run again. |
| `conditionNotSet` | yes | `publish.fillingFields` | publish→failed | Condition was picked 3 times and the box still reads something else. | Use new, likeNew, good or fair. |
| `descriptionNotSet` | yes | `publish.fillingFields` | publish→failed | The Description field did not keep the value. | Run again. |
| `locationNotSet` | yes | `publish.fillingFields` | publish→failed | No Location field, no suggestion matched, or it did not keep the value. | Use "City, Region" as Facebook suggests it, or leave location out. |
| `priceMismatch` | yes | `publish.reviewing` | publish→failed | At review the Price reads something other than what was typed. | Run again. |
| `invalidFields` | no | `publish.reviewing` | publish→failed | Facebook marked one or more fields invalid at review. | Open the review screenshot and fix the field. |
| `publishNotFound` | yes | `publish.publishing` | publish→failed | No enabled Next or Publish button. Publish was not clicked. | Run again. Nothing was posted. |
| `rejected` | no | `publish.confirming` | publish→failed | Facebook answered Publish with its "Oops / Something went wrong" dialog. Nothing was listed. | Don't retry straight away: it is often the account. Check it on Facebook. |
| `noConfirmation` | no | `publish.confirming` | command exits | No toast or Selling page within 30s of Publish. It may still have gone out, so the run looks for it. | None: the run goes on to capturingId and ends published or unconfirmedId. |
| `noListingId` | no | `publish.capturingId`, `cli/flow` | publish→unconfirmedId | Publish was clicked but no listing id came back: no Selling card matched the title, or the create call's answer (useCometMarketplaceListingCreateMutation) had no `data.marketplace_listing_create.listing.id`. | Check Marketplace > Selling by hand. Never re-publish: it would duplicate. |

## captcha

| Code | Retry | Raised in | Ends in | Meaning | Do |
| --- | --- | --- | --- | --- | --- |
| `noSolverForKind` | no | `publish.routingCaptcha` | publish→needsPerson | Facebook's own challenge, or a captcha no solver recognises. | Log in by hand and clear it, then run again. |
| `noSolverConfigured` | no | `publish.routingCaptcha` | publish→needsPerson | No key for a solver that can take this captcha. | Set CAPTCHA_KRAKEN_API_KEY and/or 2CAPTCHA_API_KEY in .env.local. |
| `arkoseCapReached` | yes | `publish.routingCaptcha` | publish→needsPerson | This account used its Arkose solves for today. | Wait until tomorrow, or clear it by hand. |
| `attemptsUsed` | no | `publish.routingCaptcha` | publish→needsPerson | Every usable solver was tried as many times as the policy allows. | Clear it by hand. The ledger (~/.logCli/captcha/attempts.jsonl) shows each try. |
| `roundsUsed` | no | `publish.routingCaptcha` | publish→needsPerson | The run hit its cap on captcha rounds. | Clear it by hand. Facebook kept serving captchas: the account may be flagged. |
| `captchaNoProxy` | no | `publish.solvingCaptcha` | captcha→skipSolver | 2Captcha would have solved from its own IP: the account's proxy couldn't be passed to it. Refused rather than mixing a foreign IP into the session. | Check the account's proxy file reached the session (rule 12). The captcha goes to a person instead. |
| `missingApiKey` | no | `publish.solvingCaptcha` | captcha→skipSolver | The solver's API key is not set. | Put the key in .env.local. |
| `invalidApiKey` | no | `publish.solvingCaptcha` | captcha→skipSolver | The solver did not accept the API key. | Make a new key on the solver's dashboard. |
| `solverAccountSuspended` | no | `publish.solvingCaptcha` | captcha→skipSolver | The solver suspended our account with it (CaptchaKraken account_suspended, 2Captcha IP_BANNED). | Contact the solver's support. |
| `insufficientCredits` | no | `publish.solvingCaptcha` | captcha→skipSolver | The solver account is out of credits. | Top up on the solver dashboard. |
| `notInstalled` | no | `publish.solvingCaptcha` | captcha→skipSolver | The solver's Python package is not installed. | pip install captchakraken / 2captcha-python into LOG_PYTHON. |
| `unknownSolver` | no | `publish.solvingCaptcha` | captcha→skipSolver | The session was asked for a solver it does not have. | A bug: the router and publishSession.py disagree on solver names. |
| `vendorBlocked` | no | `publish.solvingCaptcha` | captcha→skipSolver | CaptchaKraken refuses this captcha vendor. | None: 2Captcha gets it next, if configured. |
| `unsupportedChallenge` | no | `publish.solvingCaptcha` | captcha→skipSolver | CaptchaKraken does not support this challenge type. | None: 2Captcha gets it next, if configured. |
| `solverRateLimited` | yes | `publish.solvingCaptcha` | captcha→retry | The solver is rate limiting us. | None, unless it repeats: then slow the runs down. |
| `solveAbandoned` | yes | `publish.solvingCaptcha` | captcha→retry | CaptchaKraken served the captcha too many times without it settling: usually IP or fingerprint, not wrong answers. | If it repeats, the account's IP or fingerprint is being rejected. |
| `unrecognizedPrompt` | yes | `publish.solvingCaptcha` | captcha→retry | CaptchaKraken didn't recognise the captcha's prompt. | None: a new round brings a new prompt. |
| `solverBadRequest` | yes | `publish.solvingCaptcha` | captcha→retry | The solver called our request invalid. | A bug in publishSession.py if it repeats. |
| `requestTooLarge` | yes | `publish.solvingCaptcha` | captcha→retry | The screenshot sent to CaptchaKraken was over its size limit. | A bug if it repeats: send the captcha element, not the page. |
| `upstreamUnavailable` | yes | `publish.solvingCaptcha` | captcha→retry | CaptchaKraken's solver fleet is unreachable (their side). | None: retry shortly. |
| `noWidget` | yes | `publish.solvingCaptcha` | captcha→retry | The solver found no captcha widget on the page. | None: the re-check decides whether a captcha is still there. |
| `pageClosed` | yes | `publish.solvingCaptcha` | captcha→retry | The page closed during the solve. | None. |
| `animatedChallenge` | yes | `publish.solvingCaptcha` | captcha→retry | An animated challenge CaptchaKraken could not read. | None. |
| `noSiteKey` | yes | `publish.solvingCaptcha` | captcha→retry | 2Captcha needs the captcha's site key and no frame URL carried one. | If it repeats, FB moved the key: update detect_captcha. |
| `unsolvable` | yes | `publish.solvingCaptcha` | captcha→retry | 2Captcha workers could not solve it. | None. |
| `solverTimeout` | yes | `publish.solvingCaptcha` | captcha→retry | The solver did not answer in time. | None. |
| `notInjected` | yes | `publish.solvingCaptcha` | captcha→retry | 2Captcha returned a token but no field on the page took it. | If it repeats, FB changed the captcha frame: update the inject script. |
| `solveError` | yes | `publish.solvingCaptcha` | captcha→retry | The solver failed with an error that has no code of its own. | Read the detail. If it repeats, give it a code here. |

## runtime

| Code | Retry | Raised in | Ends in | Meaning | Do |
| --- | --- | --- | --- | --- | --- |
| `engineNotBuilt` | no | `platformKit/session` | command exits | The platform's direct-API engine was made by log new platform and has no client wired in yet, so it can't call the platform. | Vendor the platform's client under vendor/<library>, then fill in its actions in python/<platform>Api/engine.py. |
| `workerNotStarted` | no | `worker`, `session` | publish→failed, monitor→failed | The Python interpreter could not be started. | Set LOG_PYTHON to a Python with facebook-camofox-client installed (`log facebook doctor`). |
| `workerNoOutput` | yes | `worker` | monitor→failed | The worker exited without printing a result. | Read the stderr above it. Usually the browser died. |
| `workerBadOutput` | yes | `worker` | monitor→failed | The worker's last line was not JSON. | A library printed to stdout: move it to stderr in logWorker.py. |
| `badReply` | no | `publish.openingForm` | publish→failed | The publish session replied with something that is not a step result. | A bug: publishSession.py and camofox/session disagree. |
| `sessionExited` | yes | `session` | publish→failed | The publish session process exited mid-run. | Read the stderr above it. Usually the browser died or was closed. |
| `badConfig` | no | `session` | publish→failed | publishSession.py could not parse its config. | A bug in camofox/session. |
| `badRequest` | no | `worker`, `session` | publish→failed, monitor→failed | A Python process got a request it could not parse, or one missing a field. | A bug in the caller. |
| `unknownAction` | no | `worker` | monitor→failed | logWorker.py got an action it does not have. | A bug: camofox/worker and logWorker.py disagree. |
| `unknownStep` | no | `session` | publish→failed | publishSession.py got a step it does not have. | A bug: camofox/session and publishSession.py disagree. |
| `notOpen` | no | `session` | publish→failed | A step was sent before the form was opened. | A bug in the machine order. |
| `captureMissing` | no | `proxyGate`, `worker`, `publish.openingForm` | publish→failed, monitor→failed | A browser context was about to open with no HAR capture folder. Every action records a raw HAR (rule 22), so nothing opened. | Pass capture_dir with the worker request (prepareRun sets run.captureDir), or receiptDir for the publish session. |
| `unguardedLaunch` | no | `proxyGate`, `worker`, `publish.openingForm` | publish→failed, monitor→failed | Something tried to launch Camoufox outside the proxy gate, or with launch options the gate does not allow (locale, config, env, persistent context...). Refused. | Tell matt. Every launch goes through python/browser/proxyGate.py apply(); find the caller in the detail. |
| `crashed` | yes | `worker`, `session`, `publish.preparingPhotos`, `publish.openingForm`, `publish.solvingCaptcha`, `publish.choosingCategory`, `publish.uploadingPhotos`, `publish.fillingFields`, `publish.reviewing` | publish→failed, monitor→failed | A step threw before Publish was clicked. Nothing was posted. | Read the detail (exception and message). Run again. |
| `crashedAfterPublish` | no | `publish.publishing`, `publish.capturingId` | publish→unconfirmedId | A step threw after Publish was clicked. The listing may be live. | Check Marketplace > Selling by hand. Never re-publish: it would duplicate. |
| `checkCrashed` | no | `monitor.checking` | monitor→failed | The monitor's check threw instead of returning an outcome. | A bug in toCheckOutcome or the worker client. |
| `uncatalogued` | no | `worker`, `session` | publish→failed, monitor→failed | A Python process sent a code that is not in this catalog. The detail starts with the code it sent. | Add the code to src/errors/catalog/types.ts, then `bun run errors:export`. |
| `sessionOpen` | yes | `cli/preflight` | command exits | A live session already holds the account's browser, so another can't open it. | Use that session, or close it: log inspect do stop --account <a>. |
| `opensSpent` | yes | `lifecycle.opening`, `cli/preflight` | command exits | The host already opened the account's browser the most times allowed today (rule 35). | It opens again tomorrow, local time. Only matt resets it: log facebook account resetOpens <a> (rule 37). |

## twenty

| Code | Retry | Raised in | Ends in | Meaning | Do |
| --- | --- | --- | --- | --- | --- |
| `twentyNotConfigured` | no | `twenty/graphql` | command exits | TWENTY_BASE_URL or TWENTY_API_KEY is not set. | Put both in log-cli/.env.local. |
| `twentyUnreachable` | yes | `twenty/graphql` | command exits | Twenty didn't answer. | Check the network and twenty.inferencesaver.com, then run again. |
| `twentyRateLimited` | yes | `twenty/graphql` | command exits | Twenty refused the call for its rate limit ("Limit reached (100 tokens per 60000 ms)"). Nothing was written. | Nothing to do: the client waits out the minute and tries again (twice). If it still fails, fewer calls per minute. |
| `twentyAuthFailed` | no | `twenty/graphql` | command exits | Twenty refused the API key (401/403). | Make a new API key in Twenty and put it in log-cli/.env.local. |
| `twentyRequestFailed` | yes | `twenty/graphql` | command exits | Twenty answered with an error. The detail has its status and message. | Read the detail. A field error means scripts/twenty/twentySetup.mjs needs running. |
| `accountNotFound` | no | `marketplace/socialAccount` | command exits | No socialAccount with that accountName or id in Twenty. | log facebook accounts lists the Facebook accounts. |

## proxyVendor

| Code | Retry | Raised in | Ends in | Meaning | Do |
| --- | --- | --- | --- | --- | --- |
| `twoCaptchaNotConfigured` | no | `proxyVendor/twoCaptcha` | command exits | The 2Captcha proxy API key or proxy password isn't set. | Put 2CAPTCHA_API_KEY and 2CAPTCHA_PROXY_PASSWORD (dashboard → Proxy → sub-account password) in log-cli/.env.local. |
| `twoCaptchaRefused` | yes | `proxyVendor/twoCaptcha` | command exits | 2Captcha's API refused or didn't answer (bad key, no proxy product, network). | Read the detail. Check the key and that the proxy product is active with traffic left (log proxy balance). |
| `twoCaptchaNoPlace` | no | `proxyVendor/twoCaptcha` | command exits | 2Captcha has no exit in that city of the account's home country. | Pick a city it has (--city), or --anyCity for anywhere in the country. |
| `bytefulNotConfigured` | no | `proxyVendor/byteful` | command exits | The Byteful API keys aren't set. | Put BYTEFUL_PUBLIC_KEY and BYTEFUL_PRIVATE_KEY (Byteful dashboard → API keys) in log-cli/.env.local. |
| `bytefulRefused` | yes | `proxyVendor/byteful` | command exits | Byteful's API refused or didn't answer (bad keys, no plan, no traffic left, network). | Read the detail. Check the keys and that the plan has traffic left (log proxy balance --vendor byteful). |
| `bytefulNoCity` | no | `proxyVendor/byteful` | command exits | Byteful's residential pool has no devices in that city. | Pick a nearby city it has (--city), or --anyCity for anywhere in the country. |
| `proxyTooFar` | yes | `proxyVendor/twoCaptcha` | command exits | Every proxy 2Captcha gave exited too far from the account's home city (it doesn't always honour the state and city it was asked for), or was too slow for Facebook. Nothing was saved. | Run `log proxy assign` again, or pick a nearby city it has (--city, --region). |

## auth

| Code | Retry | Raised in | Ends in | Meaning | Do |
| --- | --- | --- | --- | --- | --- |
| `timedOut` | yes | `auth/exchange` | command exits | `log login` waited and the browser never finished signing in. | Run `log login` again, or `log login --token <t>`. |
| `invalidExchange` | no | `auth/exchange` | command exits | The browser's sign-in payload did not match this login's state or PKCE challenge. | Run `log login` again from the start. |

## profile

| Code | Retry | Raised in | Ends in | Meaning | Do |
| --- | --- | --- | --- | --- | --- |
| `profilePhotoMissing` | no | `profile.preparing` | command exits | The account has no profilePhoto or coverPhoto in Twenty, or the file can't be read. | Set socialAccounts.profilePhoto and coverPhoto (a URL or a local path) in Twenty, then run again. |
| `profileControlNotFound` | no | `profile.uploadingProfilePhoto`, `profile.uploadingCoverPhoto`, `profileSession` | command exits | The profile page had no control for the change (the button, its menu item or the file chooser). | Read the run's capture (rule 25): profileFound.txt lists every button the page had. Update python/session/profileSession.py from it. |
| `profileUploadNotSaved` | yes | `profile.uploadingProfilePhoto`, `profile.uploadingCoverPhoto` | command exits | The photo was chosen, but Facebook did not show it saved (no Save button, or the dialog stayed open). | Read the run's capture and its saved page text; run once more after the launch gap (rule 24). |

