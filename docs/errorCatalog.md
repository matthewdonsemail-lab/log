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
| `disconnected` | no | `platformKit/account` | publish→blocked, monitor→blocked | The account was disconnected on purpose. | Run `log facebook connect --account <id>` and log in by hand. |
| `stale` | yes | `platformKit/account` | publish→blocked, monitor→blocked | The account has not been checked for too long to trust its state. | Run `log facebook scan --account <id>`. |
| `sessionExpired` | no | `worker`, `publish.openingForm`, `platformKit/account` | publish→blocked, monitor→blocked | Facebook sent the session to the login page. | Run `log facebook connect --account <id>` and log in by hand. |
| `sessionInvalidatedChanged` | no | `platformKit/account` | publish→blocked, monitor→blocked | The session was invalidated, usually by a password change. | Run `log facebook connect --account <id>` and log in by hand. |
| `checkpointed` | no | `worker`, `publish.openingForm`, `platformKit/account` | publish→blocked, monitor→blocked | Facebook put the account on a checkpoint (verify identity, SMS code, ID). | Log in by hand and clear the checkpoint, then `log facebook connect`. No solver can do it. |
| `accountNotTwitter` | no | `twitter/account/session` | publish→blocked, monitor→blocked | A log twitter command was given an account whose platform in Twenty is not TWITTER. | Name a TWITTER socialAccount (its accountName is the handle). |
| `noTwitterSession` | no | `twitter/account/session` | publish→blocked, monitor→blocked | The X account's saved cookies in Twenty have no auth_token + ct0, so there is no session to call X with. | Save the account's cookies from a normal manual login: `log twitter cookies save --account <handle>` in a terminal. |
| `twitterCookiesRefused` | no | `cli/twitter` | publish→blocked, monitor→blocked | X didn't accept the cookies typed into log twitter cookies save, so nothing was saved to Twenty. | Copy auth_token and ct0 again from a browser where the account is signed in to x.com, and run it again. |
| `linkedinCookiesRefused` | no | `cli/linkedin` | publish→blocked, monitor→blocked | LinkedIn didn't accept the cookies typed into log linkedin cookies save, so nothing was saved to Twenty. | Copy li_at and JSESSIONID again from a browser where the account is signed in to linkedin.com, and run it again. |
| `linkedinCookiesWrongAccount` | no | `cli/linkedin` | publish→blocked, monitor→blocked | The cookies typed into log linkedin cookies save are signed in to a different LinkedIn profile than --account names, so nothing was saved. | Copy the cookies from a browser signed in to that profile, or give --account the public id the cookies belong to. |
| `slackCookiesRefused` | no | `cli/slack` | publish→blocked, monitor→blocked | Slack didn't accept the d cookie typed into log slack cookies save, so nothing was saved. | Copy the d cookie again from a browser where the account is signed in to app.slack.com, and run it again. |
| `workspaceNeeded` | yes | `cli/slack` | publish→blocked, monitor→blocked | The Slack session is signed in to more than one workspace and the command was not told which one. | Give --workspace with one of the domains it lists (log slack workspaces shows them all). |
| `slackRefused` | no | `cli/slack` | publish→blocked, monitor→blocked | Slack answered a send with ok false (its error is in the detail). The run stopped and nothing was retried. | Tell the owner. Don't retry the account until it's looked at. |
| `twitterCookiesWrongAccount` | no | `cli/twitter` | publish→blocked, monitor→blocked | The cookies typed into log twitter cookies save are signed in to a different X account than --account names, so nothing was saved. | Copy the cookies from a browser signed in to that handle, or give --account the handle the cookies belong to. |
| `accountNotOnPlatform` | no | `platformKit/session` | publish→blocked, monitor→blocked | A log <platform> command was given an account whose platform in Twenty isn't that platform. | Name a socialAccount of that platform (its accountName is the handle). |
| `noPlatformSession` | no | `platformKit/session` | publish→blocked, monitor→blocked | The account's saved cookies in Twenty don't hold the session cookies its platform needs, so there is no session to call it with. | Save the account's cookies from a normal manual login into its socialAccounts row. |
| `governorBlocked` | no | `directApi/engine` | publish→blocked, monitor→blocked | The account's direct-API governor refused the call: a soft-block or checkpoint pause, the hourly or daily request cap, or the platform's daily write budget (X 240, Discord 60, LinkedIn 10, every other platform 40; docs/specs/writeBudgets.md), one RequestGovernor per account under its state folder (~/.logCli/fbk/<account>, ~/.logCli/twitter/<account>). | Stop for this account until the pause ends or the day rolls over; never retry into it. |
| `wrongPassword` | no | `connect.routing` | publish→blocked, monitor→blocked | Facebook said the password is wrong, or found no account for the email, when `log facebook connect` signed in with Twenty's details. | Fix the account's email or password in Twenty, then `log facebook connect` again. Auto-login stops at once so Facebook doesn't see repeated wrong passwords. |
| `videoSelfieRequired` | no | `connect.routing` | publish→blocked, monitor→blocked | Facebook's checkpoint wants a video selfie ("Confirm that you're a real person with a video selfie"). No solver or auto-login can do it. | A person records the selfie in the Camoufox window (or on the account owner's phone), then `log facebook connect` again. Tell the owner. |
| `signInNotFinished` | no | `connect.signingIn` | publish→blocked, monitor→blocked | `log facebook connect` reached its deadline (`--wait`) without a logged-in page: the login, two-step or a captcha was not finished. | Run `log facebook connect` again and finish the step its last page names in the Camoufox window, or give it a longer `--wait`. A two-step page needs the totpSecret in Twenty. |
| `unconfirmedUser` | no | `platformKit/account` | publish→blocked, monitor→blocked | The account has not confirmed its email or phone. | Confirm the email or phone on Facebook by hand. |
| `cookieInvalid` | no | `platformKit/account` | publish→blocked, monitor→blocked | The saved cookies are not accepted. | Run `log facebook connect --account <id>` and log in by hand. |
| `identityVerificationRequired` | no | `marketplace/check`, `flow.marketplaceListingPublish` | publish→blocked, monitor→blocked | Facebook holds the account's listings until a person confirms their identity: Selling says "Confirm your identity to publish this and any future listings", and MarketplaceYourListingDialogQuery answers a seller notice of type INTEGRITY_NEEDS_VERIFICATION_VH ("More Info Needed to Publish This Listing", "Please confirm your mobile number before selling on Marketplace"). | Tell the owner. Don't retry the account until it's looked at. |
| `suspended` | no | `worker`, `publish.openingForm`, `platformKit/account` | publish→blocked, monitor→blocked | Marketplace is restricted or the account is disabled ("can't buy or sell"). | Tell the owner. Don't retry the account until it's looked at. |
| `readOnlyLimited` | no | `platformKit/account` | publish→blocked, monitor→blocked | The account can read but Facebook refuses its writes ("something went wrong"). | Tell the owner. Don't retry the account until it's looked at. |
| `automatedFlagged` | no | `platformKit/account` | publish→blocked, monitor→blocked | Facebook flagged the account as automated. | Tell the owner. Don't retry the account until it's looked at. |
| `rateLimited` | yes | `worker`, `publish.openingForm`, `publish.reviewing`, `platformKit/account` | publish→blocked, monitor→resting | Facebook says the account hit a limit ("limit reached", "daily listing limit"). | Wait 24h. The monitor rests by itself; publish again tomorrow. |
| `proxyRateLimited` | yes | `platformKit/account` | publish→blocked, monitor→blocked | The proxy, not Facebook, is rate limiting. | Wait, or move the account to another proxy. |
| `challengeInterstitial` | no | `platformKit/account` | publish→blocked, monitor→blocked | An interstitial challenge page stands in front of the content. | Open the account by hand and clear the page. |
| `ipOrAccountBlocked` | no | `platformKit/account` | publish→blocked, monitor→blocked | The IP or the account is blocked. | Tell the owner. Don't retry the account until it's looked at. |
| `restrictedPolicy` | no | `platformKit/account` | publish→blocked, monitor→blocked | A policy restriction applies to the account. | Tell the owner. Don't retry the account until it's looked at. |
| `permissionDenied` | no | `platformKit/account` | publish→blocked, monitor→blocked | The account lacks permission for this action. | Tell the owner. Don't retry the account until it's looked at. |
| `joinGate` | no | `platformKit/account` | publish→blocked, monitor→blocked | A group asks the account to join first. | Join the group by hand. |
| `removedFromGroup` | no | `platformKit/account` | publish→blocked, monitor→blocked | The account was removed from a group. | Tell the owner. Don't retry the account until it's looked at. |
| `proxyUnreachable` | yes | `proxyGate`, `publish.openingForm`, `worker`, `platformKit/account` | publish→blocked, monitor→blocked | No exit IP through the account's proxy: it is down or refusing connections. No browser was opened. | Check the proxy is up, then `log proxy check --account <id>`. |
| `proxyTooSlow` | yes | `proxyGate` | publish→blocked, monitor→blocked | The proxy's exit answers, but takes seconds for each Facebook file, so pages never get past Facebook's loading skeleton. Refused before any page opened. | Run `log proxy assign --account <id>`: it skips slow exits and saves a fresh session that answers quickly. |
| `proxyAuthFailed` | no | `proxyGate`, `publish.openingForm`, `worker`, `platformKit/account` | publish→blocked, monitor→blocked | The proxy answered 407: it refused the username or password. No browser was opened. | Fix the username and password in the socialAccount proxy in Twenty. |
| `proxyMalformed` | no | `proxyGate`, `platformKit/socialAccount`, `publish.openingForm`, `worker`, `platformKit/account` | publish→blocked, monitor→blocked | The account's proxy can't be read: it needs scheme://user:pass@host:port. | Fix the socialAccount proxy in Twenty. |
| `accountNotFacebook` | no | `platformKit/socialAccount` | publish→blocked, monitor→blocked | The socialAccount is not platform FACEBOOK. log-cli only runs Facebook accounts. | Pick a FACEBOOK account, or fix its platform in Twenty. |
| `accountPlatformMissing` | no | `cli/runner/platforms` | publish→blocked, monitor→blocked | The account has no platform, or one log doesn't know. No platform is assumed for it. | Set the account's platform (FACEBOOK, TWITTER, REDDIT, DISCORD, LINKEDIN, SLACK or INSTAGRAM) on its row. |
| `accountPlatformMismatch` | no | `platformKit/capability`, `platformKit/session` | publish→blocked, monitor→blocked | The account named is kept under another platform than the one given. Nothing was contacted. | Leave the platform out so the account decides it, or name the account kept on that platform. The detail says where it was found. |
| `platformAmbiguous` | no | `platformKit/capability` | publish→blocked, monitor→blocked | More than one platform keeps an account by that name, and no platform was given. Nothing was contacted. | Call again with the platform: the detail lists the platforms that keep it. |
| `capabilityMissing` | no | `platformKit/capability` | publish→blocked, monitor→blocked | The account's platform has no command for this capability, so log can't do it there. Nothing was contacted. | The detail lists the platforms that have it. Use an account on one of those, or the platform-specific tool if one does something close. |
| `accountNotUsable` | no | `platformKit/socialAccount` | publish→blocked, monitor→blocked | The account's accountStatus doesn't allow this run (only ACTIVE and WARMING post; connect also takes NEEDS_LOGIN and CHECKPOINT). An empty status counts as not usable. | Set accountStatus in Twenty (log facebook account status), or use another account. |
| `noHomeCountry` | no | `platformKit/socialAccount` | publish→blocked, monitor→blocked | The account has no homeCountry (ISO, e.g. IE), so its proxy and listings can't be checked. Nothing runs without it. | Set homeCountry (and homeCity) on the socialAccount in Twenty. |
| `accountDisabled` | no | `worker`, `publish.openingForm`, `platformKit/account` | publish→blocked, monitor→blocked | Facebook says the account is disabled or locked. | The account becomes BANNED and its campaign listings get replacement accounts. Keep the record. |
| `dailyCapReached` | yes | `cli/publish`, `facebook/marketplace/replacement` | publish→blocked, monitor→blocked | The account already published its dailyListingCap listings today (3 when empty). | Wait until tomorrow, or raise dailyListingCap in Twenty. |
| `noProxy` | no | `proxyGate`, `platformKit/socialAccount`, `publish.openingForm`, `worker` | publish→blocked, monitor→blocked | The account has no proxy in Twenty, and no browser opens for an account without one (rule 12), not for a dry run and not for signing in. | Set the socialAccount proxy in Twenty (scheme://user:pass@host:port), then `log proxy check --account <name>`. |
| `proxyCountryMismatch` | no | `proxyGate`, `publish.openingForm`, `worker` | publish→blocked, monitor→blocked | The proxy's exit IP is not in the account's country, so Facebook would see the account in the wrong place. No browser was opened. | Use a proxy that exits in the account's homeCountry, or fix homeCountry in Twenty if it is wrong. |
| `proxyCountryChanged` | yes | `publish.reviewing`, `publish.publishing` | publish→blocked, monitor→blocked | The proxy's exit IP moved to another country during the run (2Captcha's sticky session rotated). Stopped before Publish was clicked. | Run `log proxy check --account <id>`; if it keeps leaving the country, `log proxy assign` it a new session. |
| `outsideActiveHours` | yes | `browser/run`, `cli/watch` | publish→blocked, monitor→blocked | It is outside the account's local waking hours (08:00-22:00 in its home timezone unless activeHoursStart/End say otherwise). Nothing opened. The detail has the local time and when the window opens. | Run it inside the window in the detail, or change activeHoursStart/activeHoursEnd on the socialAccount in Twenty. |
| `xSessionHostDown` | yes | `twitterApi/host` | publish→blocked, monitor→blocked | The account's one X session (its engine host, rule 105) didn't start or didn't answer, so the call was not sent and no second session was opened. | Read the host's log named in the detail (~/.logCli/twitter/<account>/host.log), fix what stopped it, then call again. Never work around it with a second session or a hand-rolled script. |
| `xSessionHostRefused` | no | `twitterApi/host` | publish→blocked, monitor→blocked | A call reached an X session that isn't this account's, or without its token (rule 105). Nothing was sent. | Delete the stale ~/.logCli/twitter/<account>/host.json only once its pid is gone, then call again; log starts the right session. |
| `xSessionHostError` | no | `twitterApi/host` | publish→blocked, monitor→blocked | The account's X session failed inside, or closed without an answer (rule 105). What it sent before failing stays sent. | Read the host's log (~/.logCli/twitter/<account>/host.log) and the detail; don't resend a write until you know whether X got it. |
| `accountBusy` | yes | `mcp/jobs`, `twitterApi/engine` | publish→blocked, monitor→blocked | A job over MCP already holds this account (one browser per account, rule 35), or another X engine call held it for over 15 minutes (one call per account at a time, rule 104). Nothing started. | Follow the job in the detail with jobStatus until it ends, or stop it with jobCancel, then call again. On X, find the other log twitter call still running on the account (a watch or a stuck run), let it end, then call again. |
| `chatClaimedElsewhere` | yes | `inbox/claims` | publish→blocked, monitor→blocked | Another Claude session has claimed this chat (rule 133): only the session that claims an event acts on it, and the claim is released once its send is done. Nothing was sent. | Leave the chat to the session holding it. See who holds what with `log inbox claims`, and what was done with `log inbox actions --chat <id>`. A claim held by a session that ended frees itself; one left by a live session frees itself after 10 minutes. |
| `describerStopped` | yes | `media/describer` | publish→blocked, monitor→blocked | The media describer stopped (rule 138): it went past its memory ceiling or its vision model could not load. What is queued waits, and every context shows it as not described yet. | The next session start brings the describer back. Read its alert for why it stopped; a model that will not load usually means its files are still downloading or were cut off, and a new start fetches them again. |
| `voiceGateFailed` | yes | `voice/gate` | publish→blocked, monitor→blocked | The voice gate read the draft right before it went out (rule 137) and it failed one of its checks: SubQ's read of the owner's voice, the AI tells index, the owner's own phrasing, the watermark checker or the scrambler. Nothing was sent. | Rewrite the draft in the owner's words from what the refusal names, then send it again. In the X queue the item is held: put the rewrite back with `twitterQueueEdit`. |
| `sameAsSent` | yes | `voice/sameness` | publish→blocked, monitor→blocked | The message repeats another one the account sent: half or more of its word pairs (links left out) are already in a message sent to someone else in the last 24 hours, or in another item of the same queue (rule 157). The voice gate reads each message alone, so a run of near-copies with a different first line passed it. Nothing was sent. | Write this one from the person's own thread: answer what they said in their words, then the ask in a way that fits them. Every message in a batch reads differently. In the X queue, put the rewrite back with `twitterQueueEdit`. |
| `accountBehind` | yes | `inbox/catchUp` | publish→blocked, monitor→blocked | The account's owner is catching up on a gap (rule 135): the push channel dropped, the owner restarted or no owner was running, so the context in the .db is incomplete. A send waits up to 90 s for the catch-up to close the gap, and this one didn't, or the catch-up was refused. Nothing was sent. | Wait for the owner's catch-up (its watch log says when it has caught up), then send again. If the catch-up was refused (a 429 or another refusal), nothing resumes on the account until the owner says so (rule 94). |
| `watcherAlreadyRunning` | no | `inbox/watch` | publish→blocked, monitor→blocked | Another watcher process already holds this account's push channel on this platform (rule 131): one process per account, shared by every Claude session through the inbox. This one stopped before opening anything. | Don't start another. Read what the running watcher pushes from ~/.logCli/inbox/pending.jsonl (the inbox hook puts it in front of you), or keep a Monitor on that file. |
| `launchTooSoon` | yes | `browser/run` | publish→blocked, monitor→blocked | The account's browser opened on Facebook less than 10 minutes ago (rule 24). Nothing opened. | Wait the minutes in the detail. Back-to-back launches are what drew the 2026-10-19 checkpoints. |
| `launchBudgetSpent` | yes | `browser/run` | publish→blocked, monitor→blocked | The account's browser has opened on Facebook 8 times today, its local day, dry runs included (rule 24). Nothing opened. | Run it tomorrow (local time), or from another account in the same country. |
| `noHomeLocale` | no | `platformKit/home`, `browser/run` | publish→blocked, monitor→blocked | log-cli has no browser locale for the account's homeCountry, so it can't pin one. Nothing opened. | Add the country to HOME_COUNTRIES in src/platformKit/home/types.ts, or fix homeCountry in Twenty. |
| `noHomeTimezone` | no | `platformKit/home`, `browser/run` | publish→blocked, monitor→blocked | The account's homeCountry has several timezones and its homeCity isn't in the city table, so its local time is unknown. Nothing opened. | Add the city to CITY_TIMEZONES in src/platformKit/home/types.ts, or fix homeCity in Twenty. |
| `deviceProfileInvalid` | no | `browser/run`, `proxyGate`, `publish.openingForm`, `worker` | publish→blocked, monitor→blocked | The account's stored deviceProfile can't be read, or the run's device file is missing. Nothing opened: a new device would look like a different computer. | Tell the owner. Don't clear deviceProfile unless they decide the account may get a new device. |
| `browserTimezoneMismatch` | no | `proxyGate`, `publish.openingForm`, `worker` | publish→blocked, monitor→blocked | The launch self-check found a timezone in the page or a worker that isn't the exit IP's. The browser was closed before Facebook loaded. | Tell the owner: the timezone forcing is broken (often after a Camoufox upgrade). Re-run the leak tests before any run. |
| `browserLocaleMismatch` | no | `proxyGate`, `publish.openingForm`, `worker` | publish→blocked, monitor→blocked | The launch self-check found navigator.language(s) or the Intl locale, in the page or a worker, not equal to the account's pinned locale. The browser was closed before Facebook loaded. | Tell the owner: the locale pinning is broken (often after a Camoufox upgrade). Re-run the leak tests before any run. |
| `browserExitIpMismatch` | yes | `proxyGate`, `publish.openingForm`, `worker` | publish→blocked, monitor→blocked | The exit IP seen from inside the browser isn't the one the proxy gate checked (rotated, or the browser isn't using the proxy). The browser was closed before Facebook loaded. | Run it again. If it repeats, `log proxy check --account <id>` and tell the owner. |
| `selfCheckFailed` | yes | `proxyGate`, `publish.openingForm`, `worker` | publish→blocked, monitor→blocked | The launch self-check couldn't run (no IP echo answered through the browser, or the worker didn't start), so nothing proves the browser looks right. Closed before Facebook loaded. | Run it again. If it repeats, check the proxy (`log proxy check`) and tell the owner. |
| `listingCountryMismatch` | no | `cli/publish` | publish→blocked, monitor→blocked | The listing's location is not in the account's country, or has no country to check. Refused before any browser opens. | Write the location as "City, Country" in the account's country, or post it from an account in that country. |
| `loginWall` | no | `worker`, `platformKit/account` | publish→blocked, monitor→blocked | The page loaded but shows a login wall instead of content. | Run `log facebook connect --account <id>` and log in by hand. |
| `captchaHtml` | no | `platformKit/account` | publish→blocked, monitor→blocked | The page loaded but shows a captcha instead of content. | Open the account by hand. `log facebook publish` routes captchas itself; `scan` does not. |
| `unknownPlatform` | no | `platformKit/account` | publish→blocked, monitor→blocked | The account belongs to a platform log-cli does not know. | Facebook only (AGENTS.md rule 3). |
| `unknown` | no | `platformKit/account` | publish→blocked, monitor→blocked | The client saw an account failure it could not map. | Look at the raw signal and add a code for it here. |
| `marketplaceMayNotPost` | no | `cli/flow`, `cli/warmup` | publish→blocked | Marketplace's create page answers `marketplace_new_seller_can_post_item: false`: no listing can be created from this account now. Bethlehem, 2026-10-23 (it was true on 2026-10-22). | Publish nothing from this account; the owner decides. Read the create page's answer again on a later day. |
| `marketplaceLocationWrong` | yes | `cli/flow`, `cli/warmup` | publish→blocked | A Marketplace page's own answer puts the account somewhere other than its home: `sell_location` on the create page, or `buy_location` on Marketplace, names another city or country (Bethlehem's sell_location was Barranco, Peru on 2026-10-22). | Set the Marketplace location to the account's home with `log inspect do setLocation "City, State" --live` (rule 72), then read the page's answer again. |
| `noHomeRegion` | no | `cli/preflight`, `host.setLocation` | publish→blocked, monitor→blocked | The account's home city has no state or province in CITY_REGIONS, so its Marketplace location can't be typed as "City, State" written out (rule 72). | Add the city with its state or province code to CITY_REGIONS in src/platformKit/home/types.ts. |
| `twoStepNoAuthApp` | no | `host.signIn` | publish→blocked, monitor→blocked | Facebook asked for a passkey and its method picker (TwoStepVerificationChallengePickerDialogQuery) offered no authentication app (TOTP), or disabled it, so the account's authenticator secret can't sign it in. | Tell the owner. Don't retry the account until it's looked at. |
| `proxyWrongCountry` | no | `cli/preflight` | publish→blocked, monitor→blocked | The proxy answers, but its exit is in another country than the account's home. | Run `log proxy assign --account <id>`. |
| `proxyCheckFailed` | yes | `cli/preflight` | publish→blocked, monitor→blocked | The proxy check itself could not run (the worker or the run folder failed), so the proxy is unknown. | Run `log proxy check --account <id>` and read its error. |
| `chatMovedOn` | yes | `inbox/claims`, `src/cli/discord`, `src/cli/slack`, `src/cli/twitter` | publish→blocked, monitor→blocked | Someone wrote in the chat after the voice gate read it, so the draft answers an older moment. Nothing was sent. | Read what they said (it is in the refusal), redraft to answer it, gate it and send again. |
| `chatClaimLost` | yes | `inbox/claims`, `src/cli/twitter` | publish→blocked, monitor→blocked | The claim on this chat was lost (expired, taken over, or another send took it) before the first part went out. Nothing was sent. | Check `log inbox actions --chat <id>` for who holds it now; claim it again only if nobody else is answering, then send. |
| `accountCheckBusy` | yes | `platformKit/sessionCheck`, `platformKit/signIn` | publish→blocked, monitor→blocked | Another check or sign-in of this account is running, held by a live process. Nothing was sent. | Wait for the running check to finish, then check again. |
| `accountCheckStopped` | no | `platformKit/sessionCheck` | publish→blocked, monitor→blocked | The account is held stopped: its status, its session or its last check was a platform refusal, so it isn't checked or signed in again (rule 94). Nothing was sent. | The owner looks at the stop first; it lifts once a newer session check or sign-in is recorded. |
| `signInRouteUnavailable` | no | `platformKit/signIn` | publish→blocked, monitor→blocked | The platform doesn't sign in by that route: browser needs a platform with a browser, cookies a platform with a cookie prompt. Nothing was opened. | Sign in by the route the refusal names (X: cookies). |
| `accountNotConfigured` | no | `platformKit/signIn`, `platformKit/sessionCheck` | publish→blocked, monitor→blocked | No account by that name is set up in this workspace (on that platform, when one was given), so there is nothing to sign in. The answer carries the platform and the step that adds it. | Add the account (the console's Connections page, or log localAccount add), then sign it in. |

## listing

| Code | Retry | Raised in | Ends in | Meaning | Do |
| --- | --- | --- | --- | --- | --- |
| `locationAbbreviated` | no | `facebook/marketplace/location`, `cli/listing`, `cli/publish`, `cli/flow`, `cli/inspect`, `cli/host`, `python/session` | command exits | A Marketplace location is abbreviated ("Bethlehem, PA"), a zip or a number, or names no state or country. "Bethlehem, PA" was offered only as the West Bank and a bare zip offered Granada, Spain first, so nothing is typed. Nothing was done on Facebook. | Write it as "City, State" with the state written out ("Bethlehem, Pennsylvania"), or "City, Country" ("Galway, Ireland"), in the listing's locationQuery or the --set location value. |
| `listingNotFound` | no | `facebook/marketplace/agencyListing` | command exits | No agencyListing with that id in Twenty. | Check the id (log facebook listings shows them). |
| `listingNotRemovable` | no | `cli/listing` | command exits | The listing can't be deleted on Facebook: it was never published (no Facebook listing id), it has no account, or its status is not ACTIVE, UNDER_REVIEW, UNCONFIRMED, SOLD or DUPLICATE_TAKEDOWN. | Check it with log facebook listing <id>. A listing already REMOVED stays as it is. |
| `listingNoAccount` | no | `facebook/marketplace/agencyListing` | command exits | The agencyListing has no socialAccount, so nothing knows which account posts it. | Set its Social account in Twenty, or fill the campaign with log facebook campaign fill. |
| `listingNotPublishable` | no | `cli/publish` | command exits | The listing is not in a state that may be published (only DRAFT, READY, FAILED and BLOCKED). A live, publishing or unconfirmed listing would make a duplicate. | Check it on Facebook. An UNCONFIRMED one needs a person, never a re-publish. |
| `listingInvalid` | no | `cli/publish` | command exits | The listing's fields would stall the create form (title, price, category, photos, location). | Fix the fields named in the detail in Twenty. |
| `notEnoughCopyVersions` | no | `cli/campaign` | command exits | The ad would be live on several listings in one city without enough copy versions, or a version breaks the copy rules (skills/listingCopy). Nothing was created. | Write at least as many versions as listings it will have live in that city, never fewer than 3, each by skills/listingCopy, in copyVersions; check them with log facebook listing lint --file <listing.json>. |
| `noReplacementAccount` | yes | `facebook/marketplace/replacement` | command exits | No FACEBOOK account in the listing's country is ACTIVE, proxied, under its cap and not already in the campaign. The listing stays ACCOUNT_LOST. | Add or activate an account in that country (with a proxy there), then run log facebook campaign heal. |

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
| `inputUnsupported` | no | `platformKit/capability` | command exits | An input was given that the resolved platform's command doesn't take for this capability. Nothing was contacted. | Call again without that input. The detail names the input and the platform. |
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
| `attemptsUsed` | no | `publish.routingCaptcha` | publish→needsPerson | Every usable solver was tried as many times as the policy allows. | Clear it by hand. The ledger (the ledger table in ~/.logCli/log.db (kind captchaAttempt)) shows each try. |
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
| `chatNotFound` | no | `cli/discord`, `cli/twitter/voice` | command exits | None of the saved chats (X, Discord or any other platform) matches the chat as it was said. | Say it another way (a word of its name, or who it is with), or list them with log discord chats and give its id. |
| `chatAmbiguous` | no | `cli/discord` | command exits | More than one of the Discord account's DMs or groups matches the chat as it was said, equally well. | Pick one of the chats listed and give its id, or say more of its name. |
| `messageInvalid` | no | `cli/discord` | command exits | The --message given to log discord delete isn't a Discord message id, or a list of them separated by commas. | Give the message ids from log discord read, separated by commas. |
| `messageNotFound` | no | `cli/discord` | command exits | Discord has no message with that id in that channel. | Read the chat again with log discord read and take the id from there. |
| `notOwnMessage` | no | `cli/discord` | command exits | The message was sent by someone else; log discord delete only deletes the account's own messages. | Pick only messages the account sent, marked (me) in log discord read. |
| `deleteFailed` | no | `cli/discord` | command exits | Discord didn't take the delete: it refused it or didn't answer. | Nothing is retried (rule 94). Tell the owner Discord's answer and wait for them. |
| `providerOutOfCredit` | no | `subq/decisions`, `voice/aiTells`, `extensions/inworld`, `extensions/fishAudio`, `media/voiceNotes` | command exits | A paid provider log calls (SubQ, Jina, Inworld, Fish Audio, AssemblyAI) answered that it is out of credit (402, or words like insufficient credit). The call failed for want of money, not a bug. | Run log balance (MCP balance) to see every provider, then tell the owner which one needs topping up and where. Never top up from log (rule 41). |
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
| `unguardedLaunch` | no | `proxyGate`, `worker`, `publish.openingForm` | publish→failed, monitor→failed | Something tried to launch Camoufox outside the proxy gate, or with launch options the gate does not allow (locale, config, env, persistent context...). Refused. | Tell the owner. Every launch goes through python/browser/proxyGate.py apply(); find the caller in the detail. |
| `crashed` | yes | `worker`, `session`, `publish.preparingPhotos`, `publish.openingForm`, `publish.solvingCaptcha`, `publish.choosingCategory`, `publish.uploadingPhotos`, `publish.fillingFields`, `publish.reviewing` | publish→failed, monitor→failed | A step threw an error the command didn't expect, so nothing after it ran (a publish that throws after its Publish click is crashedAfterPublish instead). | Read the detail (exception and message). Run again. |
| `crashedAfterPublish` | no | `publish.publishing`, `publish.capturingId` | publish→unconfirmedId | A step threw after Publish was clicked. The listing may be live. | Check Marketplace > Selling by hand. Never re-publish: it would duplicate. |
| `checkCrashed` | no | `monitor.checking` | monitor→failed | The monitor's check threw instead of returning an outcome. | A bug in toCheckOutcome or the worker client. |
| `uncatalogued` | no | `worker`, `session` | publish→failed, monitor→failed | A Python process sent a code that is not in this catalog. The detail starts with the code it sent. | Add the code to src/errors/catalog/types.ts, then `bun run errors:export`. |
| `sessionOpen` | yes | `cli/preflight` | command exits | A live session already holds the account's browser, so another can't open it. | Use that session, or close it: log inspect do stop --account <a>. |
| `opensSpent` | yes | `lifecycle.opening`, `cli/preflight` | command exits | The host already opened the account's browser the most times allowed today (rule 35). | It opens again tomorrow, local time. Only the owner resets it: log facebook account resetOpens <a> (rule 37). |
| `assemblyAiKeyMissing` | no | `cli/transcribe`, `media/voiceNotes` | command exits | ASSEMBLYAI_API_KEY is not set, so no voice note can be transcribed. Nothing was read from a platform and nothing was sent to AssemblyAI. | Tell the owner: the AssemblyAI key goes in ~/.buzz/.env.local (or the repo .env.local) as ASSEMBLYAI_API_KEY; ~/filmcraft/.env.local ASSEMBLY_AI_KEY is read too. Never print it. |
| `transcriptionFailed` | yes | `cli/transcribe`, `media/voiceNotes` | command exits | AssemblyAI didn't give a transcript for a voice note: its upload, its transcript request or its poll answered with an error, or it was still not done after 15 minutes. | Read AssemblyAI's answer in the detail. Run log transcribe again: what is done is kept by its file's hash and isn't sent again. |
| `reactInvalid` | no | `cli/react`, `python/twitterApi`, `python/discordApi`, `python/slackApi`, `python/instagramApi` | command exits | A reaction was missing its chat, its message id or an emoji the platform takes (Slack reacts by name, and an emoji the kit has no name for is refused). Nothing was sent. | Give the chat and the message's id from the platform's read, and the emoji or its name (joy, fire, eyes; on Slack the emoji's Slack name). |
| `reactRefused` | no | `python/twitterApi`, `python/discordApi`, `python/instagramApi` | command exits | The platform answered the reaction with a refusal (X's errors or no data, Discord's non-204, Instagram's error). Nothing was retried. | Read the platform's answer in the detail. On X a message only X Chat holds may not take the old DM reaction. Nothing more goes out on that account until the owner says so (rule 94). |
| `listInvalid` | no | `cli/twitter`, `python/twitterApi` | command exits | An X list change was missing what it needs: create needs the list's name, add needs a list the account has (by name or id) and the person's handle or user id. Nothing was sent. | Run log twitter list show for the lists and their ids, then give the list and the person. |
| `listRefused` | no | `python/twitterApi` | command exits | X answered a list change with no list: the list wasn't made, or the person wasn't added. Nothing was retried. | Read X's answer in the detail. Nothing more goes out on that account until the owner says so (rule 94). |
| `reactFailed` | no | `python/discordApi` | command exits | Discord didn't answer the reaction at all (no status). Whether it landed is unknown. | Read the chat again to see whether the reaction is there before anything else; never react again blind (rule 94). |
| `voiceKeyMissing` | no | `cli/clone`, `cli/voiceNote`, `extensions/voiceClone`, `extensions/inworld`, `extensions/voiceClone` | command exits | The voice provider's key (INWORLD_API_KEY or FISH_API_KEY) is not set, so it was not called. Nothing was cloned or generated. | Put the provider key in .env.local (or ~/.buzz/.env.local); its name is in .env.example. Never print it. |
| `voiceProviderRefused` | no | `cli/clone`, `cli/voiceNote`, `extensions/voiceClone`, `extensions/inworld`, `extensions/voiceClone` | command exits | The voice provider answered a clone or a text to speech with a refusal (its status and message are in the detail). Nothing was retried. | Read the provider's answer in the detail. A 402, or a 403 saying a limit is reached, means the account needs credit: only the owner decides whether to spend (rule 41). Another provider can be picked with --provider or LOG_VOICE_PROVIDER. |
| `voiceProviderUnknown` | no | `cli/clone`, `cli/voiceNote`, `extensions/voiceClone` | command exits | The voice provider or its speech model named by --provider, LOG_VOICE_PROVIDER or --model is not one log knows. Nothing was called. | Name inworld or fishAudio, and one of that provider's models (log clone speak --help lists them). |
| `voiceCloneMissing` | no | `cli/clone`, `cli/voiceNote`, `extensions/voiceClone` | command exits | There is no clone of the owner's voice on that provider yet (~/.logCli/voice/clone.json), so no voice note can be made. | Run `log clone voice` to see the recordings it would use, then `log clone voice --apply` once (per provider). |
| `voiceRecordingsMissing` | no | `cli/clone`, `extensions/voiceClone` | command exits | Too few of the owner's own voice notes (fromMe, at least 5 s each, within the provider's limit) were found to clone their voice: the provider needs its least (Inworld 3 s, Fish 10 s). Nothing was sent to the provider. | Read their chats so the engines keep their voice notes (log discord read, log instagram dms), then run log clone voice again. Never clone anyone else's voice. |
| `callTimingMissing` | no | `cli/timing` | command exits | No call with that id is stored in log.db's spans table: the id was mistyped, the call ran before timing existed, or it is older than the 90 days timings are kept. | Copy the call id from the call's ▶ or ■ line in the live log (~/.logCli/mcp/<day>.log), or run log timing without --call for the report. |
| `tregFailed` | no | `cli/treg`, `extensions/treg` | command exits | treg answered with an error, or couldn't be run: the endpoint id is wrong, its params were refused, the team balance is out, or treg isn't on this machine's PATH. | Read treg's own words in the refusal. Check the id with log treg search, its params with log treg get, the balance with log balance; set TREG_BIN if treg isn't on the PATH. |
| `tregParamsInvalid` | no | `cli/treg` | command exits | The params given to log treg call weren't a JSON object of query params. | Pass --params as a JSON object, e.g. {"query":"kick streamer managers","domain_type":"web"}; log treg get lists the params the endpoint takes. |
| `tregTrimInvalid` | no | `cli/treg` | command exits | The trimming given to log treg call was malformed: --where wasn't key=value pairs, or --maxItems wasn't a whole number from 1 to 1000. | Pass --where as key=value[,key=value] (e.g. isReply=false), --maxItems as a whole number and --fields as comma-separated keys (e.g. id,text,createdUtc). |
| `logMcpRestarted` | yes | `mcp/reload` | command exits | The log MCP server restarted while this call ran (it crashed, or its new code was swapped in), so the call's answer was lost. The proxy Claude Code talks to stayed up. | Call the tool again. If it keeps happening, read the live log (~/.logCli/mcp/<day>.log) for why the server exited. |
| `xchatPinMissing` | no | `cli/voiceNote`, `python/twitterApi` | command exits | X Chat couldn't be opened to send, because the X account has no X Chat PIN saved. Sending in X Chat needs the conversation key, which only the PIN unlocks. Nothing was sent. | The owner saves the PIN once in a terminal with log twitter chat pin --account <a>; then send again. |
| `voiceNoteInvalid` | no | `cli/voiceNote`, `extensions/voiceClone`, `python/discordApi`, `python/instagramApi`, `python/slackApi`, `python/twitterApi` | command exits | A voice note was given no text, too much text, or an audio file instead of text; or an engine was handed audio log didn't make itself. A voice note is only ever made from words, in the owner's cloned voice. | Give --text with what the owner says, in their words. Never pass an audio file: log makes the voice note itself. |
| `voiceNoteConvertFailed` | no | `cli/voiceNote`, `extensions/voiceClone` | command exits | ffmpeg couldn't turn the generated speech into the platform's voice note format (ogg/opus for Discord, AAC in .m4a for Instagram and Slack). Nothing was sent. | Check ffmpeg is installed with libopus and aac (ffmpeg -encoders), then send it again. |
| `pronunciationUnknown` | no | `cli/voiceNote`, `cli/clone`, `extensions/voiceClone` | command exits | The voice note's text has an acronym that isn't in the spoken lexicon (SPOKEN_LEXICON), so whether the owner says it as a word or as letters isn't known. Nothing was spoken or sent. | Write the word out the way the owner says it, or add it to SPOKEN_LEXICON with how they say it (a word or letters) once they have said, then send it again. |
| `spokenMismatch` | no | `cli/voiceNote`, `cli/clone`, `extensions/voiceClone` | command exits | The voice note was spoken, transcribed back with AssemblyAI and didn't say what was written: a lexicon word heard as something else or spelled out as letters, or too many words different. Nothing was sent. | Read what was heard in the detail, then rewrite the word the clone got wrong (or fix its lexicon entry) and send it again. |
| `spokenCheckFailed` | no | `cli/voiceNote`, `cli/clone`, `extensions/voiceClone` | command exits | The voice note was spoken but couldn't be transcribed back to check its words (AssemblyAI's key missing, a refusal or no word timings). Nothing was sent: an unchecked voice note never goes out. | Check ASSEMBLYAI_API_KEY (or ASSEMBLY_AI_KEY) in .env.local and the AssemblyAI answer in the detail, then send it again. |
| `voiceProcessingFailed` | no | `cli/voiceNote`, `cli/clone`, `extensions/voiceClone` | command exits | ffmpeg couldn't read or write the spoken audio while shaping it like the owner's own voice notes (their room tone, phone squash, mic drift and saturation). Nothing was sent. | Check ffmpeg runs (ffmpeg -version) and the detail, then send it again. |
| `voiceNoteRefused` | no | `python/discordApi`, `python/instagramApi`, `python/slackApi` | command exits | The platform refused the voice note's upload or its message (its answer is in the detail). Nothing was retried. | Read the platform's answer in the detail. Nothing more goes out on that account until the owner says so (rule 94). |
| `voiceNoteFailed` | no | `python/discordApi` | command exits | Discord didn't answer the voice note's message at all (no status). Whether it landed is unknown. | Read the chat again to see whether the voice note is there before anything else; never send it again blind (rule 94). |
| `fileRefused` | no | `src/cli/discord`, `python/discordApi` | command exits | A file to attach isn't under OUTBOX or ~/.logCli, isn't a file, or is over Discord's 10 MB upload limit. Nothing was sent. | Put the file in OUTBOX (or ~/.logCli), keep it under 10 MB, and send again. |

## twenty

| Code | Retry | Raised in | Ends in | Meaning | Do |
| --- | --- | --- | --- | --- | --- |
| `twentyNotConfigured` | no | `twenty/graphql` | command exits | TWENTY_BASE_URL or TWENTY_API_KEY is not set. | Put both in log-cli/.env.local. |
| `twentyUnreachable` | yes | `twenty/graphql` | command exits | Twenty didn't answer. | Check the network and twenty.inferencesaver.com, then run again. |
| `twentyRateLimited` | yes | `twenty/graphql` | command exits | Twenty refused the call for its rate limit ("Limit reached (100 tokens per 60000 ms)"). Nothing was written. | Nothing to do: the client waits out the minute and tries again (twice). If it still fails, fewer calls per minute. |
| `twentyAuthFailed` | no | `twenty/graphql` | command exits | Twenty refused the API key (401/403). | Make a new API key in Twenty and put it in log-cli/.env.local. |
| `twentyRequestFailed` | yes | `twenty/graphql` | command exits | Twenty answered with an error. The detail has its status and message. | Read the detail. A field error means scripts/twenty/twentySetup.mjs needs running. |
| `accountNotFound` | no | `platformKit/socialAccount` | command exits | No socialAccount with that accountName or id in Twenty. | Check the accountName in Twenty (log facebook accounts lists the Facebook ones). An inbox watcher for an account gone from Twenty is not restarted. |

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
| `credentialInputInvalid` | no | `auth/credentials`, `console/credentials` | command exits | The provider is not one log keeps keys for, a value is missing, holds a quote or a line break, or doesn't fit its field (a country list, a local API URL). Nothing was saved. | Give a known provider and every field it needs, each on one line. |
| `credentialRejected` | no | `auth/credentials` | command exits | The provider refused the key when log checked it. Nothing was saved. | Copy the key again from the provider's dashboard and save it again. |
| `credentialRateLimited` | yes | `auth/credentials` | command exits | The provider answered 429 while log checked the key. Nothing was saved. | Save it again in a minute. |
| `credentialValidationUnavailable` | yes | `auth/credentials` | command exits | The provider didn't answer the key check, or answered in a shape log doesn't know. Nothing was saved. | Check the network and the provider's status, then save it again. |
| `credentialSaveUnconfirmed` | yes | `auth/credentials`, `console/credentials` | command exits | The key passed its check, but reading the settings file back did not show it saved. | Check the settings file (LOG_USER_ENV) is writable, then save it again. |

## profile

| Code | Retry | Raised in | Ends in | Meaning | Do |
| --- | --- | --- | --- | --- | --- |
| `profilePhotoMissing` | no | `profile.preparing` | command exits | The account has no profilePhoto or coverPhoto in Twenty, or the file can't be read. | Set socialAccounts.profilePhoto and coverPhoto (a URL or a local path) in Twenty, then run again. |
| `profileControlNotFound` | no | `profile.uploadingProfilePhoto`, `profile.uploadingCoverPhoto`, `profileSession` | command exits | The profile page had no control for the change (the button, its menu item or the file chooser). | Read the run's capture (rule 25): profileFound.txt lists every button the page had. Update python/session/profileSession.py from it. |
| `profileUploadNotSaved` | yes | `profile.uploadingProfilePhoto`, `profile.uploadingCoverPhoto` | command exits | The photo was chosen, but Facebook did not show it saved (no Save button, or the dialog stayed open). | Read the run's capture and its saved page text; run once more after the launch gap (rule 24). |

## tool

| Code | Retry | Raised in | Ends in | Meaning | Do |
| --- | --- | --- | --- | --- | --- |
| `limitInvalid` | no | `cli/twitter/dms`, `cli/twitter/followers`, `cli/twitter/notifications` | command exits | The --limit given isn't a whole number inside the command's range (the refusal says the range). | Give --limit as a whole number inside the range the refusal names, or leave it out for the default. |
| `secondsInvalid` | no | `cli/twitter/chat`, `cli/discord`, `cli/slack`, `cli/instagram` | command exits | The --seconds given to a watch isn't a number of seconds of at least 5. | Give --seconds as a number of seconds, at least 5, or leave it out to watch until stopped. |
| `mediaInvalid` | no | `twitter/post/send`, `cli/media` | command exits | The media given can't be used: a file or media item that isn't there or is empty, a type the platform doesn't take, one over the platform's size, too many files, or media on something that takes none. The detail names which. | Read the detail, then give media the platform takes (its limits are in the platform's guide), or a media item that exists (log media status). |
| `inputInvalid` | no | `cli/runner`, `mcp/server` | command exits | An input isn't one the command takes: an unknown or repeated field, a missing required one, a value of the wrong kind or out of its range, or a group of inputs given wrongly. The refusal names the input. | Read the input's kind and range in the tool's schema (logGet), fix that input, and call again. |
| `commandFailed` | no | `cli/runner` | command exits | The command ended without success and gave no catalog code of its own; its reason is in stderr (or stdout). | Read stderr for the reason. Nothing is retried through a platform refusal (rule 94). |
| `toolUnknown` | no | `mcp/server`, `cli/runner` | command exits | No tool or command has that name. | Find the tool for the job with logSearch, then call the name it gives. |
| `terminalOnly` | no | `mcp/server` | command exits | That command only runs in a terminal: it prompts for a secret or holds a long-lived service. | The owner runs it in a terminal; the refusal says the command line. |
| `liveNotConfirmed` | no | `mcp/server` | command exits | A live tool was called without confirmLive: true, so nothing acted. | Call it again with confirmLive: true only when the owner asked for this live run (rule 8). |
| `bypassNotConfirmed` | no | `mcp/server` | command exits | bypass (a run outside the account's waking hours) was given without confirmBypass: true, so nothing ran. | Pass confirmBypass: true only when the owner asked for a run outside the hours (rule 86). |
| `approvalRequired` | no | `platformKit/gates` | command exits | A live tool reached the hosted runtime, where a live run needs an approval that is not built yet, so nothing ran. | The owner runs it from a local client, where confirmLive and approvedBy are the approval. |
| `playMissing` | no | `mcp/server` | command exits | A tool that sends as the owner was called with no play loaded for the caller, so nothing was sent. | Load the play that fits with getGuide({ useCase }), the refusal lists them, then call again. |
| `playNotCovering` | no | `mcp/server` | command exits | A tool that sends as the owner was called under a play that neither names it nor is filed under its platform, so nothing was sent. | End the play with getGuide({ clearPlay: true }) or load the play that fits, then call again. |
| `sessionPlatformInvalid` | no | `platformKit/sessionCheck` | command exits | The platform given isn't one log knows. | Give one of the platforms log lists in its usage, or leave the platform out to check every account. |
| `signInLinkInvalid` | no | `platformKit/signInLink` | command exits | The sign-in link is unknown, already used or more than ten minutes old. A link works once and grants nothing by itself. | Ask for sign-in again (sessionsSignIn) to get a new link. |
| `signInLinkNotYours` | no | `platformKit/signInLink` | command exits | The sign-in link was made for another person. It was not used up; only the person who asked for the sign-in can open it. | The person who asked for the sign-in opens the link, signed in to the console as themself. |
| `signInInputInvalid` | no | `console/signIn` | command exits | The sign-in input is missing a field, names no known platform or method, or a value is empty, too long or holds a line break. Nothing was saved. | Give the platform, the account and each value on one line. |
| `passwordSignInUnavailable` | no | `console/signIn` | command exits | The platform doesn't sign in from a saved email and password. Nothing was saved. | Sign the account in by its own route (sessionsSignIn names it). |
| `reportFieldInvalid` | no | `mcp/apps/report`, `cli/report` | command exits | A report's input doesn't fit its source's fields: a field is missing, of the wrong kind, or one the source doesn't take. Nothing was read. | Fix the fields the refusal names and ask again. |
| `reportSourceNoData` | no | `inbox/senders` | command exits | log.db holds no conversations on that platform, so there is nothing to count. | Read that platform's inbox first, or ask about a platform that has chats. |
| `identityProfileMissing` | no | `inbox/profiles` | command exits | log.db holds no stored profile for that person on that platform. No platform was asked. | Profiles are kept when a session check or a followers read sees the person; ask after one has. |

