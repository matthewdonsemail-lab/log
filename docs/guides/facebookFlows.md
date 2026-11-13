# facebookFlows

Facebook's recorded flows and its warm-up, each a facebookFlow tool run as steps in the account's open browser.

Load next, when the work needs it: getGuide({ topic: "flows" }) (Recorded flows and the warm-up on any platform: a recording turned into steps that run in the account's open browser, each step checked against the call it must cause); getGuide({ topic: "facebookBrowser" }) (A Facebook account's browser for its day: preflight, opening and signing in, the host and its lifecycle, the profile and Messenger PIN, its accounts and the account checks).

Written by `bun run docs:build` from the code, the skills and AGENTS.md. Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "facebook/marketplaceListings" })` | From accounts to live Marketplace listings | "post a marketplace listing in <town>", "get listings up on facebook marketplace in every town", "set up the facebook accounts and publish the listings", "take the marketplace listing down". |

## The tools in this guide

Each tool's own description carries its full usage, notes, live line and rules; `logGet` gives its exact inputs and a call that works.

| Tool | What it does | Usage |
|---|---|---|
| `facebookFlowDeletePost` | Delete the newest post on the account's own profile | `log flow run deletePost --account <a> ` |
| `facebookFlowDeletePostLive` | Delete the newest post on the account's own profile, live on Facebook | `log flow run deletePost --account <a>  --live` |
| `facebookFlowLanguageEnglish` | Switch the account's Facebook language to English | `log flow run facebookLanguageEnglish --account <a> ` |
| `facebookFlowLanguageEnglishLive` | Switch the account's Facebook language to English, live on Facebook | `log flow run facebookLanguageEnglish --account <a>  --live` |
| `facebookFlowGroupHeaderMenus` | Open and close the group header's search, More menu, Joined menu… | `log flow run groupHeaderMenus --account <a> --set groupId=…` |
| `facebookFlowGroupHeaderMenusLive` | Open and close the group header's search, More menu…, live on Facebook | `log flow run groupHeaderMenus --account <a> --set groupId=… --live` |
| `facebookFlowGroupMembers` | Open a group's People tab and scroll it read-only so Facebook loads… | `log flow run groupMembers --account <a> ` |
| `facebookFlowGroupMembersLive` | Open a group's People tab and scroll it read-only so…, live on Facebook | `log flow run groupMembers --account <a>  --live` |
| `facebookFlowGroupPostComments` | On a group's Open questions tab, open a post's comments, switch the… | `log flow run groupPostComments --account <a> --set groupId=…` |
| `facebookFlowGroupPostCommentsLive` | On a group's Open questions tab, open a post's…, live on Facebook | `log flow run groupPostComments --account <a> --set groupId=… --live` |
| `facebookFlowGroupPostDialog` | On a group's Discussion feed, open a post in its dialog with Leave a… | `log flow run groupPostDialog --account <a> --set groupId=…` |
| `facebookFlowGroupPostDialogLive` | On a group's Discussion feed, open a post in its…, live on Facebook | `log flow run groupPostDialog --account <a> --set groupId=… --live` |
| `facebookFlowGroupTabs` | Open each tab of a group the account is in | `log flow run groupTabs --account <a> --set groupId=…` |
| `facebookFlowGroupTabsLive` | Open each tab of a group the account is in, live on Facebook | `log flow run groupTabs --account <a> --set groupId=… --live` |
| `facebookFlowMarketplaceListingDelete` | Delete one Marketplace listing from the Selling page | `log flow run marketplaceListingDelete --account <a> --set listingTitle=… --set listingId=…` |
| `facebookFlowMarketplaceListingDeleteLive` | Delete one Marketplace listing from the Selling page, live on Facebook | `log flow run marketplaceListingDelete --account <a> --set listingTitle=… --set listingId=… --live` |
| `facebookFlowMarketplaceListingPublish` | Publish one Marketplace listing in the account's open AdsPower browser | `log flow run marketplaceListingPublish --account <a> --set location=… --set photo1=… --set photo2=… --set title=… --set price=… --set description=…` |
| `facebookFlowMarketplaceListingPublishLive` | Publish one Marketplace listing in the account's open…, live on Facebook | `log flow run marketplaceListingPublish --account <a> --set location=… --set photo1=… --set photo2=… --set title=… --set price=… --set description=… --live` |
| `facebookFlowMessengerPinCreate` | Messenger's Create a PIN | `log flow run messengerPinCreate --account <a> ` |
| `facebookFlowMessengerPinCreateLive` | Messenger's Create a PIN, live on Facebook | `log flow run messengerPinCreate --account <a>  --live` |
| `facebookFlowPostComment` | Comment on the newest post on the account's own profile | `log flow run postComment --account <a> --set comment=…` |
| `facebookFlowPostCommentLive` | Comment on the newest post on the account's own…, live on Facebook | `log flow run postComment --account <a> --set comment=… --live` |
| `facebookFlowProfilePhotoPost` | Post a photo on the account's own profile | `log flow run profilePhotoPost --account <a> --set photo=…` |
| `facebookFlowProfilePhotoPostLive` | Post a photo on the account's own profile, live on Facebook | `log flow run profilePhotoPost --account <a> --set photo=… --live` |
| `facebookFlowProfilePost` | Post text on the account's own profile | `log flow run profilePost --account <a> --set text=…` |
| `facebookFlowProfilePostLive` | Post text on the account's own profile, live on Facebook | `log flow run profilePost --account <a> --set text=… --live` |
| `facebookFlowProfileSetup` | Give an account its profile picture, cover photo and name, as… | `log flow run profileSetup --account <a> --set profilePhoto=… --set coverPhoto=… --set firstName=… --set lastName=…` |
| `facebookFlowProfileSetupLive` | Give an account its profile picture, cover photo and…, live on Facebook | `log flow run profileSetup --account <a> --set profilePhoto=… --set coverPhoto=… --set firstName=… --set lastName=… --live` |
| `facebookFlowWarmupCreateAccessCheck` | Warm-up createAccessCheck | `log flow run warmupCreateAccessCheck --account <a> ` |
| `facebookFlowWarmupCreateAccessCheckLive` | Warm-up createAccessCheck, live on Facebook | `log flow run warmupCreateAccessCheck --account <a>  --live` |
| `facebookFlowWarmupFeedBrowse` | Warm-up feedBrowse | `log flow run warmupFeedBrowse --account <a> ` |
| `facebookFlowWarmupFeedBrowseLive` | Warm-up feedBrowse, live on Facebook | `log flow run warmupFeedBrowse --account <a>  --live` |
| `facebookFlowWarmupMarketplaceBrowse` | Warm-up marketplaceBrowse | `log flow run warmupMarketplaceBrowse --account <a> ` |
| `facebookFlowWarmupMarketplaceBrowseLive` | Warm-up marketplaceBrowse, live on Facebook | `log flow run warmupMarketplaceBrowse --account <a>  --live` |
| `facebookFlowWarmupMessagesVisit` | Warm-up messagesVisit | `log flow run warmupMessagesVisit --account <a> ` |
| `facebookFlowWarmupMessagesVisitLive` | Warm-up messagesVisit, live on Facebook | `log flow run warmupMessagesVisit --account <a>  --live` |
| `facebookFlowWarmupSellingVisit` | Warm-up sellingVisit | `log flow run warmupSellingVisit --account <a> ` |
| `facebookFlowWarmupSellingVisitLive` | Warm-up sellingVisit, live on Facebook | `log flow run warmupSellingVisit --account <a>  --live` |

## The work, step by step: facebookFlows

From `skills/facebookFlows/SKILL.md`.

## facebookFlows

How every flow is recorded, built and run (inspect, `log flow fromInspect`,
params, dry run, live run, the machine, confirming requests) is
`skills/flow/SKILL.md`. This is what only applies on Facebook.

### Tools

Each Facebook flow has its own MCP tool, `facebookFlow<Name>`, and a live
twin, `facebookFlow<Name>Live`, that runs it on Facebook with
`confirmLive: true` (`profileSetup` is `facebookFlowProfileSetup` and
`facebookFlowProfileSetupLive`; `facebookLanguageEnglish` is
`facebookFlowLanguageEnglish`). The CLI words stay `log flow run <name>`.

The flows recorded on Facebook (`src/browser/flow/definitions/`):
`deletePost`, `facebookLanguageEnglish`, `groupHeaderMenus`, `groupMembers`,
`groupPostComments`, `groupPostDialog`, `groupTabs`,
`marketplaceListingDelete`, `marketplaceListingPublish`,
`messengerPinCreate`, `postComment`, `profilePhotoPost`, `profilePost`,
`profileSetup`, and the five warm-up activities (`warmupCreateAccessCheck`,
`warmupFeedBrowse`, `warmupMarketplaceBrowse`, `warmupMessagesVisit`,
`warmupSellingVisit`; see `skills/facebookWarmup/SKILL.md`).

### What Facebook's flows check

- `marketplaceListingPublish` checks `buy_location`, the set-location
  answer's city, the create page's `marketplace_new_seller_can_post_item`
  and `sell_location` (so it stops before the form when the account may not
  post), and the listing id in the create answer (`noListingId`).
- `profileSetup`'s three saves check their mutations answered 2xx (no saved
  answers to read fields from yet).
- `deletePost`: `move_to_trash_story.success` true; `postComment`:
  `comment_create.feedback_comment_edge`; the posts:
  `story_create.story_id`.
- A plain endpoint `expect`: `/profile/picture/upload/` is
  `profilePictureUpload`.

### The profileSetup example

```bash
log inspect start --account <a> --url https://www.facebook.com/me --bypass --now
log inspect do click <ref> --live ...   # one step at a time
log inspect do stop

log flow fromInspect ~/.logCli/runs/inspect/<run> --name profileSetup \
  --rename text1=firstName --rename text2=lastName --rename file1=profilePhoto --rename file2=coverPhoto

log flow run profileSetup --account <a> --set firstName=Bethlehem --set lastName=Trash \
  --set profilePhoto=<path|url> --set coverPhoto=<path|url>
log flow run profileSetup --account <a> ... --live --bypass --now
```

Over MCP: `facebookFlowProfileSetup` with `account` and the params by name;
`facebookFlowProfileSetupLive` with `confirmLive: true`.

### Controls on Facebook

"Upload Photo" in a recording finds Facebook's "Upload photo": controls
match by role, then name (`skills/flow/SKILL.md`, Deterministic steps).

### Facebook's overlays

| Overlay | Page state | Checked by |
| --- | --- | --- |
| "To allow or block browser notifications from Facebook…" | `browserNotificationsNotice` | gone from the page (Escape sends no call) |
| "What happened" … "Ended on <date>" | `pastNoticeDialog` | `useAccountStatusClearEnrollmentEntryPointActionMutation` answers `data.xfb_ixt_gateway_clear_flow: true` |

A "What happened" with no "Ended on" is not cleared: it stays unknown, for
SubQ to read (rule 73).

Rebuild Facebook's request docs after a run: `log facebook capture --docs`.

### Saved flows

| Flow | Recorded | Does |
| --- | --- | --- |
| `profileSetup` | Lancaster, 2026-10-19; the picture steps checked on Exeter, 2026-10-24 | Profile picture, cover photo, name (13 steps). The picture steps wait on the dialog query, the upload and the set mutation, inside "Choose profile picture". The host runs only the parts Twenty has data for (`flowWithParams`). |
| `marketplaceListingDelete` | Bethlehem, 2026-10-23 | Delete one Marketplace listing from Selling: More options, Delete listing, Delete, then "No, haven't sold" on Facebook's survey (6 steps). The menu answer must name the listing id given, and so must the delete answer (`commerce_for_sale_item_delete.deleted_for_sale_item_id`). Run it through `log facebook listing remove`, which then sets the Twenty row REMOVED. |

## The work, step by step: facebookWarmup

From `skills/facebookWarmup/SKILL.md`.

## facebookWarmup

How a warm-up is recorded and run (activities as flows in one open browser,
the stage log, the hard boundaries) is `skills/warmup/SKILL.md`. This is what
only applies on Facebook.

### The five activities

The feed, Marketplace browse, the create-page check, Selling and Messages.
All five are flows since 2026-10-22 (Bethlehem: recorded, then run 27/27 steps):
`src/browser/flow/definitions/warmup*.json`, docs in
`docs/platforms/facebook/flows/warmup*.md`.

```bash
log facebook warmup stages plan                                        # the five scripts, recorded or not
log facebook warmup stages record --account <a> --now                  # one headed session: each script, then each flow
log facebook warmup stages run --account <a> --now                     # watched run: the machine runs each flow in turn, 10 s apart
log facebook warmup stages log --account <a> --follow                 # the stage log, live
```

`--only feedBrowse,sellingVisit` limits it. After recording, rebuild the
request docs: `log facebook capture --docs`.

Doc: `docs/lifecycle.md` (the warm-up section); scripts:
`src/facebook/warmup/stages/helpers/scripts.ts`.

### Likes on Facebook

`clickAny button ^Like$` only runs with `--likes`, when the owner asks. A like
passes on Facebook's answer, not on the "Remove Like" button: the step waits
for `CometUFIFeedbackReactMutation` and passes only when it answers 2xx with
the reaction we sent saved.

### What each step must answer

- the create page: `marketplace_new_seller_can_post_item` true (else
  `marketplaceMayNotPost`), and `sell_location`'s country and city the
  account's home (else `marketplaceLocationWrong`);
- Marketplace: `buy_location.display_name` names the home city (else
  `marketplaceLocationWrong`);
- the home feed: `FeedComposerCometRootQuery` answers this account's id;
- a scroll that pages: `CometNewsFeedPaginationQuery` or
  `MarketplaceCometBrowseFeedLightPaginationQuery` answers more;
- a listing: `MarketplacePDPContainerQuery` answers its details page;
- Selling and Messages: the page answers 2xx (Selling's
  `current_marketplace`).

The Reels and feed activities do the same (`openReels`, `openFeed`,
`readFeed`, `openMarketplace`, `openListings`, and the likes).

### Wrong pages

Erie, 2026-10-19, scrolled a checkpoint page for a minute before
`pageProblem` checked every step's landing page.

### Reels play with the sound on, every time a reel loads

Reels start muted, and coming back from the creator's profile loads the reel
again, muted (the owner, 2026-10-23: the run after the profile watched with
the audio off). So `unmute` follows every `backToReel`, in the drawn session
and the persona plan, and it presses nothing when `button "Mute"` already
shows (`already`), so it never mutes.

### Facebook Reels, for a persona

```bash
bun scripts/datasets/buildReelViewers.ts                        # once: 980 real viewers from KuaiRand-1K (~/.logCli/datasets)
bun scripts/datasets/buildInterestEffect.ts                     # once: the interest effect, from KuaiRand-Pure's random log
log facebook warmup persona --account <a>              # the persona, its real viewer and its pack (every dataset a trait)
log proxy balance                                      # each provider's traffic left, before a run
log facebook warmup reel run --account <a> --persona --live [--likes] [--trafficMb 1024]
```

- Each reel, the moment it lands, is read by SubQ from its frame (theirs or
  not, what it is, the one action they'd pick); the orderer (`planReel`)
  plans the watch from the real viewer's plays (their kind from their median
  up, the rest from it down, scaled by the measured effect) and at most one
  action. Watch every line live (rule 26): `= reel N: THEIRS|not theirs; watch …`.
- Reels streams video through the proxy: about 4.5 MB a reel (2026-10-20).
  A run is refused when the account used its `--trafficMb` (default 1 GB) in
  the last 24 hours, checks every 5 reels and stops at it; each run's use goes
  to the `ledger` table in `~/.logCli/log.db` (kind `proxyTraffic`).
- The creator's profile opens in its own tab: back to the reel closes it
  (`closeTab`). Stop a run with the browser left open (rule 35); if a session
  dies, close its AdsPower profile and clear its proxy, then log the close.

## The work, step by step: personaPicture

From `skills/personaPicture/SKILL.md`.

## personaPicture

A persona here is just a person, not a buyer persona: who they are, drawn from
the same datasets the Reels warm-up uses (`src/warmup/persona`,
`~/.logCli/datasets`). Code: `src/media/persona`, run by
`scripts/media/personaPictures.ts`.

Only adults are drawn (`PERSONA_MIN_AGE`, 18). The doomscrolling dataset has
teenagers in it, and they are filtered out before the draw.

### What's stored

`media/personas/personas.jsonl` holds one line per persona:

- `personaId`, `seed`, `country`
- `characteristics`: age, gender, occupation, education, when and why they
  scroll, mood, sleep, device and the rest of the draw's summary
- `sources`: the dataset rows it came from
- `prompt`, `avoid`, `size`, `resolution`, `generatedWith`: what is fed to the
  image model
- `attempts`: every generation, with its task, URL, credits, the prompt used and
  SubQ's scores
- `profilePicture`, `matched`

Each picture is at `media/personas/<personaId>/profilePicture.png`.

### The style

It is read from the owner's two example photos, which are kept in
`~/.logCli/personaExamples` and are never committed, because they are real
people:

- the camera held low, below the chin, pointing up at the face, with the
  ceiling behind the head: an unflattering angle
- the arm holding the camera out of the frame: an arm in the picture looks
  wrong and unnatural (the owner, 2026-10-24)
- a flat, unsmiling expression and ordinary clothes
- bad light: a blown-out ceiling light, or a dark room lit from below
- old front-camera quality: soft focus, noise, washed-out colours

The place comes from the persona's `profession` in the social behaviour dataset
(Engineer, Teacher, Marketer, Researcher, Entrepreneur, Student, Freelancer,
Doctor, Designer, Other), or `Unemployed` from the occupation. Each has three
places in `BACKGROUNDS`, and no two personas in a draw get the same one
(`backgroundOf`), because the owner said the pictures can't all look the same. The
light comes from the time of day they scroll. The prompt never says phone, iPhone or screen (`listingCreative`), and
it carries no text or logos.

Generation is done only from the prompt. The owner's photos are never passed to the
image model, so no real face is copied. They go only to SubQ, as the style to
judge against.

### The check

SubQ (Decisions API) gets the picture as image 1 and the examples as images 2
and 3. It is asked about image 1 only:

- `matchesPersona` (must reach 0.7)
- `ageFits`, `genderFits`, `lifeFits`, `selfieStyle`, `looksReal`, `noText`
  (each must reach 0.6)
- `armHidden`: the arm holding the camera is out of the picture or under 20% of
  it (must reach 0.6)
- `lowAngle`: the camera is below the face pointing up at it (must reach 0.6)
- `unflattering`: an unflattering, careless shot, not posed or attractive (must
  reach 0.6)

When any of them is low, it regenerates. The first prompt already carries the
fixes for selfieStyle, noText, armHidden, lowAngle and unflattering, because
first attempts missed them. Each later prompt adds a fix for every check that
has failed so far. It tries at most 5 times, then keeps the closest attempt and
sets `matched: false`.

- `likeReference`: taken the same way as the style reference, the picture the owner
  liked best (`--styleFrom <id>`, now freelancerSelfEmployedMale36). It is SubQ's
  fourth image, after the picture and the owner's two examples.
- `backgroundDistinct`: a second SubQ call shows the picture beside the other
  personas' pictures (three at a time) and asks whether its kind of room
  differs from every one of theirs. Only the kind of room counts, because a
  classroom and an office failed for sharing ceiling tiles. When it fails, the
  persona moves to the next place for its profession (`nextBackground`,
  `backgroundsTried`) before the retry.

Every image sent to SubQ is shrunk to a 768 px JPEG first (`shrinkImage`), because
SubQ refuses more than 8 MiB of images in one call.

### The accounts' own personas

`--accounts` gives every new Facebook account (`needsLogin`, no `profilePhoto`)
a persona of its own:

- It is drawn in the account's country with `seedOf(accountName)`, the seed the
  Reels warm-up uses, and written to `~/.logCli/personas/<account>.json` when
  that file is missing. The picture and the warm-up are the same person.
- The id starts with the city (`kamloopsPartTimeEmployeeFemale18`), the prompt
  names the home ("from Kamloops, Canada"), and the record keeps `account`
  (accountName, homeCity, homeCountry).
- The background check compares each picture with the last three pictures from
  the same country.
- A picture goes into Twenty only when it passes every check:
  `socialAccounts.profilePhoto` is set to its path (`saveProfilePhoto`), the
  field the host's profile step uploads from.

`--accountsRedo` re-checks every account picture that isn't approved against
the current checks and regenerates whichever fail. An account whose last
attempts never passed moves to another place first, and an account with no
picture yet is generated.

Clothing checks (the owner, 2026-10-24):

- `noStonewashedHoodie`: no stonewashed, acid-washed or faded washed-out
  hoodie or sweatshirt.
- `clothingFits`: casual clothes that suit the home and the place, not formal
  and not a plain t-shirt.

`backgroundDistinct` passes at 0.25 (`PERSONA_BACKGROUND_PASS`). Places are
unique when they are assigned, and SubQ scored different rooms as low as 0.11,
so a higher bar only burned tries. A picture kept after failing keeps the
background it was taken in.

On 2026-10-24 all 20 accounts (10 in Pennsylvania, 10 around Kamloops) matched,
and each one's picture is its profilePhoto in Twenty.

### The owner's verdict comes first

- `--approve <id,id>` locks pictures the owner likes (`approved`). They are never
  rechecked or regenerated, and `--redo` refuses them.
- `--redo <id>` rejects one picture (it is kept in `rejected`, with its
  attempts) and regenerates it.
- `--recheck` checks every picture that isn't approved against the current
  checks, and regenerates whichever fail.

The owner approved fullTimeEmployeeMale30, fullTimeEmployeeMale26 and
freelancerSelfEmployedMale36 ("perfect") and rejected studentFemale25
(2026-10-24).

### Running

```bash
bun scripts/media/personaPictures.ts --count 5 --country US
```

Run it live through Monitor (rule 26). It costs $0.034 an image through
`reapi.image-gen.gemini-3-pro-image`, plus one SubQ call per image (rule 41:
only as many as the owner asked for). A new run replaces `personas.jsonl`.

## The rules these tools fall under

Each by its number and first line. The full text is in AGENTS.md (`log://agents`); the core rules are in full in `getGuide({ topic: "logMcpInstructions" })`.

- **Rule 29.** Record a browser page with the existing inspect tool before implementing actions on it.
- **Rule 30.** Complete the authorized task.
- **Rule 31.** Turn a repeatable recorded browser procedure into its flow, deterministic machine, documentation and matching CLI/MCP surface.
- **Rule 35.** Browser work uses one account browser through its active day, with actions as tabs/steps; close only for a logged lifecycle reason.
- **Rule 38.** Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless the owner raises them.
- **Rule 39.** Use only the scope, options and intent the owner stated or implied.
- **Rule 40.** Do not propose physical infrastructure unless the owner asks.
- **Rule 41.** Paid work must stay within the authorized task and spend.
- **Rule 73.** For an unknown platform state, collate the goal, account/runtime, action, sent requests, answers, timing and page evidence.
- **Rule 79.** Flow controls must match deterministically by the recorded role/name and scope; ambiguous, missing or disabled controls refuse.
