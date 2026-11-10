# facebookFlows

Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 55). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Current scope

This guide describes the current command implementation. Legacy storage names and deferred features in procedure text do not define the native hosted schema. Active rules 171, 172 and 175 govern the target: existing private workspace log.db, central identity/team authorization and minimal routing metadata, with no required Twenty or agency/CRM model. Preserve current execution gates while migrating legacy dependencies explicitly.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "facebook/marketplaceListings" })` | From accounts to live Marketplace listings | see the page |

## The tools in this guide

| Tool | What it does |
|---|---|
| `flow` | Recorded inspect runs as flows |
| `flowLive` | Recorded inspect runs as flows, live on Facebook |
| `warmup` | The warm-up, by platform and activity |
| `warmupLive` | The warm-up, by platform and activity, live on Facebook |
| `flowDeletePost` | Delete the newest post on the account's own profile |
| `flowDeletePostLive` | Delete the newest post on the account's own profile, live on Facebook |
| `flowFacebookLanguageEnglish` | Switch the account's Facebook language to English |
| `flowFacebookLanguageEnglishLive` | Switch the account's Facebook language to English, live on Facebook |
| `flowGroupHeaderMenus` | Open and close the group header's search, More menu, Joined menu… |
| `flowGroupHeaderMenusLive` | Open and close the group header's search, More menu…, live on Facebook |
| `flowGroupMembers` | Open a group's People tab and scroll it read-only so Facebook loads… |
| `flowGroupMembersLive` | Open a group's People tab and scroll it read-only so…, live on Facebook |
| `flowGroupPostComments` | On a group's Open questions tab, open a post's comments, switch the… |
| `flowGroupPostCommentsLive` | On a group's Open questions tab, open a post's…, live on Facebook |
| `flowGroupPostDialog` | On a group's Discussion feed, open a post in its dialog with Leave a… |
| `flowGroupPostDialogLive` | On a group's Discussion feed, open a post in its…, live on Facebook |
| `flowGroupTabs` | Open each tab of a group the account is in |
| `flowGroupTabsLive` | Open each tab of a group the account is in, live on Facebook |
| `flowMarketplaceListingDelete` | Delete one Marketplace listing from the Selling page |
| `flowMarketplaceListingDeleteLive` | Delete one Marketplace listing from the Selling page, live on Facebook |
| `flowMarketplaceListingPublish` | Publish one Marketplace listing in the account's open AdsPower browser |
| `flowMarketplaceListingPublishLive` | Publish one Marketplace listing in the account's open…, live on Facebook |
| `flowMessengerPinCreate` | Messenger's Create a PIN |
| `flowMessengerPinCreateLive` | Messenger's Create a PIN, live on Facebook |
| `flowPostComment` | Comment on the newest post on the account's own profile |
| `flowPostCommentLive` | Comment on the newest post on the account's own…, live on Facebook |
| `flowProfilePhotoPost` | Post a photo on the account's own profile |
| `flowProfilePhotoPostLive` | Post a photo on the account's own profile, live on Facebook |
| `flowProfilePost` | Post text on the account's own profile |
| `flowProfilePostLive` | Post text on the account's own profile, live on Facebook |
| `flowProfileSetup` | Give an account its profile picture, cover photo and name, as… |
| `flowProfileSetupLive` | Give an account its profile picture, cover photo and…, live on Facebook |
| `flowWarmupCreateAccessCheck` | Warm-up createAccessCheck |
| `flowWarmupCreateAccessCheckLive` | Warm-up createAccessCheck, live on Facebook |
| `flowWarmupFeedBrowse` | Warm-up feedBrowse |
| `flowWarmupFeedBrowseLive` | Warm-up feedBrowse, live on Facebook |
| `flowWarmupMarketplaceBrowse` | Warm-up marketplaceBrowse |
| `flowWarmupMarketplaceBrowseLive` | Warm-up marketplaceBrowse, live on Facebook |
| `flowWarmupMessagesVisit` | Warm-up messagesVisit |
| `flowWarmupMessagesVisitLive` | Warm-up messagesVisit, live on Facebook |
| `flowWarmupSellingVisit` | Warm-up sellingVisit |
| `flowWarmupSellingVisitLive` | Warm-up sellingVisit, live on Facebook |

## The work, step by step: flow

From `skills/flow/SKILL.md`.

## flow

Record once, then run anywhere: recording → definition → docs → machine →
command → MCP tool.

### Hard boundaries

1. **Built from a recording, never by hand** (rules 25, 29). Each step's
   element is the role and accessible name the recorded snapshot gave it;
   each step's confirming request is the mutation the recorded step sent.
   A confirming request only proves the call happened. **What it answered
   decides the step** (rule 73): a step's `answers` name the call and what its
   answer must say (a value, what we sent, present, the account's home city,
   country or id), with the error code it raises, written from the request's
   doc ("What it sent and what came back"). `marketplaceListingPublish` checks
   `buy_location`, the set-location answer's city, the create page's
   `marketplace_new_seller_can_post_item` and `sell_location` (so it stops
   before the form when the account may not post), and the listing id in the
   create answer (`noListingId`). `profileSetup`'s three saves check their
   mutations answered 2xx (no saved answers to read fields from yet). Every
   other step with a confirming request checks the field its request doc says
   it answers (`deletePost`: `move_to_trash_story.success` true; `postComment`:
   `comment_create.feedback_comment_edge`; the posts: `story_create.story_id`),
   and a test refuses a flow step that waits on a call without checking its
   answer. A streamed answer is read from its first part. The flow's doc shows
   every check, and recording the flow again keeps them.
2. **Dry run unless `--live`** (rule 8); over MCP, live is its own tool, `flow<Name>Live`, with confirmLive.
3. **Every gate** (rules 11-12, 15-18, 22, 24): a run is one launch through
   the inspect session, so every step is recorded again (snapshot,
   screenshot, HAR, rea) and mapped.
4. **No credential in a step or param** (rule 21): sign-in is `signIn`/`code`,
   which read the private login.json; typed values are redacted in snapshots.
5. Run it live (rule 26): Monitor; every machine state prints.

### The routine

```bash
## 1. record (skills/inspect)
log inspect start --account <a> --url https://www.facebook.com/me --bypass --now
log inspect do click <ref> --live ...   # one step at a time
log inspect do stop

## 2. recording → definition + docs (params renamed from text1/file1)
log flow fromInspect ~/.logCli/runs/inspect/<run> --name profileSetup \
  --rename text1=firstName --rename text2=lastName --rename file1=profilePhoto --rename file2=coverPhoto

## 3. run it on another account (dry run first: lists the filled steps, opens nothing)
log flow run profileSetup --account <a> --set firstName=Bethlehem --set lastName=Trash \
  --set profilePhoto=<path|url> --set coverPhoto=<path|url>
log flow run profileSetup --account <a> ... --live --bypass --now
```

Over MCP the same run is the tool `flowProfileSetup` with `account`, the
params by name; its live twin `flow<Name>Live` runs it on Facebook with `confirmLive: true`.

A failed step ends the run (`failedAt`): read that step's folder in the new
recording (rule 25), re-record the changed part with inspect, rebuild the flow.

### Deterministic steps (rule 79)

A step never guesses which control to press: `python/browser/controlMatch.py`
scores every visible control by role, then name, inside the step's dialog
(`within`). The exact requirements (and their error codes) are in
[docs/specs/flows.md](../../docs/specs/flows.md). So "Upload Photo" in a
recording finds Facebook's "Upload photo", and a Dismiss button with no
accessible name is found by its text.

`fromInspect` writes what keeps a step deterministic:

- `within`: the dialog around the control in the snapshot before the step.
- `expect`: the call the step must cause, a mutation first, else a plain
  endpoint (`/profile/picture/upload/` is `profilePictureUpload`), else a
  `…DialogQuery`. The session waits for it, and the step fails without it.
- `answers`: what that call must say (rule 73), added from the recording's
  exchanges before the flow ships; `answers.test.ts` refuses a step with
  `expect` and no `answers`.

Before a flow's first click, fill, upload or location, `clearOverlays` reads the page
and presses Escape for each known overlay over it (`OVERLAY_CLEARS`,
`src/browser/flow/helpers/overlays.ts`), then reads the page again:

| Overlay | Page state | Checked by |
| --- | --- | --- |
| "To allow or block browser notifications from Facebook…" | `browserNotificationsNotice` | gone from the page (Escape sends no call) |
| "What happened" … "Ended on <date>" | `pastNoticeDialog` | `useAccountStatusClearEnrollmentEntryPointActionMutation` answers `data.xfb_ixt_gateway_clear_flow: true` |

One still there after its Escape, or a clear call that answers otherwise,
stops the flow at that step with `overlayNotCleared`. A "What happened" with
no "Ended on" is not cleared: it stays unknown, for SubQ to read (rule 74).
A new overlay is added there with its page state, fixture and answer.

When Facebook changes a page, add its snapshot excerpt to
`python/fixtures/controls/` (no names, no page copy) and a case to
`src/browser/flow/controlMatch.test.ts`, so the next change fails a test, not
a live run.

Rebuild the request docs after a run (rules 27, 85): `log facebook capture --docs`.

### Saved flows

| Flow | Recorded | Does |
| --- | --- | --- |
| `profileSetup` | Lancaster, 2026-10-19; the picture steps checked on Exeter, 2026-10-24 | Profile picture, cover photo, name (13 steps). The picture steps wait on the dialog query, the upload and the set mutation, inside "Choose profile picture". The host runs only the parts Twenty has data for (`flowWithParams`). |
| `marketplaceListingDelete` | Bethlehem, 2026-10-23 | Delete one Marketplace listing from Selling: More options, Delete listing, Delete, then "No, haven't sold" on Facebook's survey (6 steps). The menu answer must name the listing id given, and so must the delete answer (`commerce_for_sale_item_delete.deleted_for_sale_item_id`). Run it through `log facebook listing remove`, which then sets the Twenty row REMOVED. |

## The work, step by step: warmup

From `skills/warmup/SKILL.md`.

## warmup

What the warm-up must do, requirement by requirement: [docs/specs/warmup.md](../../docs/specs/warmup.md).

### Hard boundaries

1. **Recorded, never written blind** (rule 29). `log facebook warmup stages record` drives the
   inspect session headed, every step saved (snapshot, screenshot, HAR, rea),
   and builds each flow from that recording. `log facebook warmup stages run` refuses an
   activity whose flow isn't recorded (`flowNotRecorded`).
2. **One browser** (rule 35). Record and run both open one session and do every
   activity inside it.
3. **Likes act on Facebook** (rule 8): `clickAny button ^Like$` only runs with
   `--likes`, when matt asks. Everything else reads. **A like passes on
   Facebook's answer** (rule 73), not on the "Remove Like" button: the step
   waits for `CometUFIFeedbackReactMutation` and passes only when it answers
   2xx with the reaction we sent saved (`expect.answers`, `answerIssue`). A
   step's answers are read from its own recording and kept as
   `exchanges.json`. Other steps get `expect.answers` the same way, written
   from that request's doc ("What it sent and what came back").
4. **Every step that makes a call is decided by its answer** (rule 73). The
   five stage flows carry `answers` on each step whose recording shows a call
   that answers it, and the run fails the step with its code when the answer
   isn't right (`runFlowInSession`, `answersIssue`):
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
   `readFeed`, `openMarketplace`, `openListings`, and the likes). Dwells and
   steps whose recording shows no call have nothing to read. A home check is
   skipped when Twenty has no home for the account. Each flow's doc shows what
   every step must answer, and recording a flow again keeps the checks
   (`keepAnswers`).
5. **Live and watched** (rule 26): run through Monitor; every step goes to the
   stage log as it happens.
6. **Stops on the wrong page.** Every step's landing page is checked
   (`pageProblem`): a checkpoint, a login wall or another section ends the
   activity (`blocked`), and the account's issue is written to Twenty. Erie,
   2026-10-19, scrolled a checkpoint page for a minute before this.
7. **Scrolls like a hand** (`python/human/scrollMotion.py`, ported from the Robotic
   VSL repo): bell-curve wheel steps, overshoot and recoil, mid-pauses. No
   `scrollBy` or `scroll_into_view_if_needed` anywhere.
8. **Reels play with the sound on, every time a reel loads.** Reels start
   muted, and coming back from the creator's profile loads the reel again,
   muted (matt, 2026-10-23: the run after the profile watched with the audio
   off). So `unmute` follows every `backToReel`, in the drawn session and the
   persona plan, and it presses nothing when `button "Mute"` already shows
   (`already`), so it never mutes.

### The routine

```bash
log facebook warmup stages plan                                        # the five scripts, recorded or not
log facebook warmup stages record --account <a> --now                  # one headed session: each script, then each flow
log facebook warmup stages run --account <a> --now                     # watched run: the machine runs each flow in turn, 10 s apart
log facebook warmup stages log --account <a> --follow                 # the stage log, live
```

`--gapSeconds` is the wait between activities: 10 by default (matt,
2026-10-23: "it should be like 10 seconds", not Listaro's 150 minutes). `--only
feedBrowse,sellingVisit` limits it.

After recording, read each activity's steps with rea (rule 25) and rebuild the
request docs (`log facebook capture --docs`, rule 27) before pushing.

All five are flows since 2026-10-22 (Bethlehem: recorded, then run 27/27 steps):
`src/browser/flow/definitions/warmup*.json`, docs in
`docs/platforms/facebook/flows/warmup*.md`. A record that fails part-way still
saves the activities that finished before it.

Doc: `docs/lifecycle.md` (the warm-up section); scripts:
`src/facebook/warmup/stages/helpers/scripts.ts`.

### By platform: Facebook Reels, for a persona (rules 49-51)

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

It is read from matt's two example photos, which are kept in
`~/.logCli/personaExamples` and are never committed, because they are real
people:

- the camera held low, below the chin, pointing up at the face, with the
  ceiling behind the head: an unflattering angle
- the arm holding the camera out of the frame: an arm in the picture looks
  wrong and unnatural (matt, 2026-10-24)
- a flat, unsmiling expression and ordinary clothes
- bad light: a blown-out ceiling light, or a dark room lit from below
- old front-camera quality: soft focus, noise, washed-out colours

The place comes from the persona's `profession` in the social behaviour dataset
(Engineer, Teacher, Marketer, Researcher, Entrepreneur, Student, Freelancer,
Doctor, Designer, Other), or `Unemployed` from the occupation. Each has three
places in `BACKGROUNDS`, and no two personas in a draw get the same one
(`backgroundOf`), because matt said the pictures can't all look the same. The
light comes from the time of day they scroll. The prompt never says phone, iPhone or screen (`listingCreative`), and
it carries no text or logos.

Generation is done only from the prompt. matt's photos are never passed to the
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

- `likeReference`: taken the same way as the style reference, the picture matt
  liked best (`--styleFrom <id>`, now freelancerSelfEmployedMale36). It is SubQ's
  fourth image, after the picture and matt's two examples.
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

Clothing checks (matt, 2026-10-24):

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

### matt's verdict comes first

- `--approve <id,id>` locks pictures matt likes (`approved`). They are never
  rechecked or regenerated, and `--redo` refuses them.
- `--redo <id>` rejects one picture (it is kept in `rejected`, with its
  attempts) and regenerates it.
- `--recheck` checks every picture that isn't approved against the current
  checks, and regenerates whichever fail.

matt approved fullTimeEmployeeMale30, fullTimeEmployeeMale26 and
freelancerSelfEmployedMale36 ("perfect") and rejected studentFemale25
(2026-10-24).

### Running

```bash
bun scripts/media/personaPictures.ts --count 5 --country US
```

Run it live through Monitor (rule 26). It costs $0.034 an image through
`reapi.image-gen.gemini-3-pro-image`, plus one SubQ call per image (rule 41:
only as many as matt asked for). A new run replaces `personas.jsonl`.

## Every tool, in full

### `flow`

log flow fromInspect <runDir> --name <n> | docs <n> | list | show <n> | run <n> --account <a> [--set k=v]... [--live]
Recorded inspect runs as flows: docs, an XState machine per flow, run on any account (rule 31)
Usage: log flow fromInspect <runDir> --name <name> [--summary <text>] [--rename text1=firstName]...
       log flow docs <name> | list | show <name>
       log flow run <name> --account <accountName> [--set <param>=<value>]... [--live] [--bypass] [--now] [--json]
Pass the arguments after the command name in `args`, e.g. ["--json"]. It never takes --live: that is `flowLive`. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowLive`

log flow fromInspect <runDir> --name <n> | docs <n> | list | show <n> | run <n> --account <a> [--set k=v]... [--live]
Live on Facebook: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Recorded inspect runs as flows: docs, an XState machine per flow, run on any account (rule 31)
Usage: log flow fromInspect <runDir> --name <name> [--summary <text>] [--rename text1=firstName]...
       log flow docs <name> | list | show <name>
       log flow run <name> --account <accountName> [--set <param>=<value>]... [--live] [--bypass] [--now] [--json]
Pass the arguments after the command name in `args`, with --live. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `warmup`

log <platform> warmup <platform> <activity> [plan|record|run|log|persona] [--account <a>] [--live] [--likes] [--bypass]
The warm-up, by platform and activity: `log facebook warmup reel|feed|stages` (the account's browser primed with the activity, each step checked, the outline written; rules 49, 60)
Usage: log <platform> warmup <activity> [--account <a>] [--live] [--likes] [--bypass] [--now]   (record: the account's browser opened primed with the activity, each step checked, the outline written)
       log <platform> warmup <activity> plan [--json]   (the activity's steps and what each must do)
       log <platform> warmup persona --account <a> [--newPersona] [--seed <n>]   (the account's behaviour profile and real viewer, from the datasets; no browser, no SubQ)
       log facebook warmup reel plan [--reels 8-20] [--watch 4-25] [--skip 0.6] [--comments 0.3] [--profile 0.15] [--likes] [--seed <n>] [--json]   (a drawn Reels session)
       log facebook warmup reel run --account <a> [reel plan flags] [--live] [--likes] [--bypass]   (a drawn session, stopped at the first step that doesn't do what it should)
       log facebook warmup reel run --account <a> --persona [--newPersona] [--reels 8-20] [--trafficMb 1024] [--live] [--likes] [--bypass]   (the persona's For you feed: SubQ reads each reel, the orderer plans it from the pack and real viewer, rule 50)
       log facebook warmup feed run --account <a> --persona [--posts 8-15] [--trafficMb 1024] [--live] [--likes] [--bypass]   (the home feed post by post: SubQ reads each post, a glance or a read and a like where the persona would, then Marketplace and listings)
  Platforms: facebook. Facebook activities: reel, feed, stages.
       log facebook warmup stages plan
       log facebook warmup stages record --account <accountName> [--only feedBrowse,marketplaceBrowse] [--likes] [--bypass] [--now]
       log facebook warmup stages run --account <accountName> [--only …] [--likes] [--gapSeconds <n>] [--bypass] [--now]
       log facebook warmup stages log [--account <accountName>] [--lines <n>] [--follow [--seconds <n>]]
Pass the arguments after the command name in `args`, e.g. ["--json"]. It never takes --live or --likes: that is `warmupLive`. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "facebook/marketplaceListings" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 8, 35, 25, 26, 29, 31, 63, 55, 1, 2, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `warmupLive`

log <platform> warmup <platform> <activity> [plan|record|run|log|persona] [--account <a>] [--live] [--likes] [--bypass]
Live on Facebook: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
The warm-up, by platform and activity: `log facebook warmup reel|feed|stages` (the account's browser primed with the activity, each step checked, the outline written; rules 49, 60)
Usage: log <platform> warmup <activity> [--account <a>] [--live] [--likes] [--bypass] [--now]   (record: the account's browser opened primed with the activity, each step checked, the outline written)
       log <platform> warmup <activity> plan [--json]   (the activity's steps and what each must do)
       log <platform> warmup persona --account <a> [--newPersona] [--seed <n>]   (the account's behaviour profile and real viewer, from the datasets; no browser, no SubQ)
       log facebook warmup reel plan [--reels 8-20] [--watch 4-25] [--skip 0.6] [--comments 0.3] [--profile 0.15] [--likes] [--seed <n>] [--json]   (a drawn Reels session)
       log facebook warmup reel run --account <a> [reel plan flags] [--live] [--likes] [--bypass]   (a drawn session, stopped at the first step that doesn't do what it should)
       log facebook warmup reel run --account <a> --persona [--newPersona] [--reels 8-20] [--trafficMb 1024] [--live] [--likes] [--bypass]   (the persona's For you feed: SubQ reads each reel, the orderer plans it from the pack and real viewer, rule 50)
       log facebook warmup feed run --account <a> --persona [--posts 8-15] [--trafficMb 1024] [--live] [--likes] [--bypass]   (the home feed post by post: SubQ reads each post, a glance or a read and a like where the persona would, then Marketplace and listings)
  Platforms: facebook. Facebook activities: reel, feed, stages.
       log facebook warmup stages plan
       log facebook warmup stages record --account <accountName> [--only feedBrowse,marketplaceBrowse] [--likes] [--bypass] [--now]
       log facebook warmup stages run --account <accountName> [--only …] [--likes] [--gapSeconds <n>] [--bypass] [--now]
       log facebook warmup stages log [--account <accountName>] [--lines <n>] [--follow [--seconds <n>]]
Pass the arguments after the command name in `args`, with --live or --likes. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "facebook/marketplaceListings" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 8, 35, 25, 26, 29, 31, 63, 55, 1, 2, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowDeletePost`

log flow run deletePost --account <a> 
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowDeletePostLive`.
Delete the newest post on the account's own profile: its Actions menu, Move to bin, Move (useCometTrashPostMutation; Facebook empties the bin after 30 days). Writes on Facebook (--live).
Steps: gotoprofilePhp → clickActionsForThisPost → clickMoveToBinItems → clickMove. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowDeletePostLive`

log flow run deletePost --account <a>  --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Delete the newest post on the account's own profile: its Actions menu, Move to bin, Move (useCometTrashPostMutation; Facebook empties the bin after 30 days). Writes on Facebook (--live).
Steps: gotoprofilePhp → clickActionsForThisPost → clickMoveToBinItems → clickMove. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowFacebookLanguageEnglish`

log flow run facebookLanguageEnglish --account <a> 
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowFacebookLanguageEnglishLive`.
Switch the account's Facebook language to English (US): Settings, Language and region, Account language, English (US), OK; decided by useCometUSFScrollablePickerMutation answering en_US. Recorded on Scranton 2026-10-25 from Arabic.
Steps: gotosettings → click → clickEnglishUs → click. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowFacebookLanguageEnglishLive`

log flow run facebookLanguageEnglish --account <a>  --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Switch the account's Facebook language to English (US): Settings, Language and region, Account language, English (US), OK; decided by useCometUSFScrollablePickerMutation answering en_US. Recorded on Scranton 2026-10-25 from Arabic.
Steps: gotosettings → click → clickEnglishUs → click. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowGroupHeaderMenus`

log flow run groupHeaderMenus --account <a> --set groupId=…
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowGroupHeaderMenusLive`.
Open and close the group header's search, More menu, Joined menu, Invite dialog and Share sheet; nothing inside them is picked
Steps: gotogroups → clickSearchWithinThisGroup → pressEscape → clickMore → pressEscape → clickJoined → pressEscape → clickInvite → pressEscape → clickShareGroup → pressEscape. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowGroupHeaderMenusLive`

log flow run groupHeaderMenus --account <a> --set groupId=… --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Open and close the group header's search, More menu, Joined menu, Invite dialog and Share sheet; nothing inside them is picked
Steps: gotogroups → clickSearchWithinThisGroup → pressEscape → clickMore → pressEscape → clickJoined → pressEscape → clickInvite → pressEscape → clickShareGroup → pressEscape. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowGroupMembers`

log flow run groupMembers --account <a> 
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowGroupMembersLive`.
Open a group's People tab and scroll it read-only so Facebook loads the member list (bio line, page category) for extraction
Steps: gotogroupsJunkremovalwinners → gotogroupsJunkremovalwinnersMembers → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowGroupMembersLive`

log flow run groupMembers --account <a>  --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Open a group's People tab and scroll it read-only so Facebook loads the member list (bio line, page category) for extraction
Steps: gotogroupsJunkremovalwinners → gotogroupsJunkremovalwinnersMembers → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowGroupPostComments`

log flow run groupPostComments --account <a> --set groupId=…
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowGroupPostCommentsLive`.
On a group's Open questions tab, open a post's comments, switch the sort to All comments and scroll them; read-only
Steps: gotogroupsQuestions → clickLeaveAComment → clickMostRelevant → clickAllCommentsShowAll → scroll. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowGroupPostCommentsLive`

log flow run groupPostComments --account <a> --set groupId=… --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
On a group's Open questions tab, open a post's comments, switch the sort to All comments and scroll them; read-only
Steps: gotogroupsQuestions → clickLeaveAComment → clickMostRelevant → clickAllCommentsShowAll → scroll. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowGroupPostDialog`

log flow run groupPostDialog --account <a> --set groupId=…
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowGroupPostDialogLive`.
On a group's Discussion feed, open a post in its dialog with Leave a comment (the comment box takes focus, nothing is typed) and close it
Steps: gotogroups → clickLeaveAComment → clickClose. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowGroupPostDialogLive`

log flow run groupPostDialog --account <a> --set groupId=… --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
On a group's Discussion feed, open a post in its dialog with Leave a comment (the comment box takes focus, nothing is typed) and close it
Steps: gotogroups → clickLeaveAComment → clickClose. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowGroupTabs`

log flow run groupTabs --account <a> --set groupId=…
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowGroupTabsLive`.
Open each tab of a group the account is in (Featured, Open questions, People, Events, Media, Files, About) and come back to Discussion; read-only
Steps: gotogroups → clickFeatured → clickOpenQuestions → clickPeople → clickEvents → clickMedia → clickFiles → clickAbout → clickDiscussion. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowGroupTabsLive`

log flow run groupTabs --account <a> --set groupId=… --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Open each tab of a group the account is in (Featured, Open questions, People, Events, Media, Files, About) and come back to Discussion; read-only
Steps: gotogroups → clickFeatured → clickOpenQuestions → clickPeople → clickEvents → clickMedia → clickFiles → clickAbout → clickDiscussion. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowMarketplaceListingDelete`

log flow run marketplaceListingDelete --account <a> --set listingTitle=… --set listingId=…
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowMarketplaceListingDeleteLive`.
Delete one Marketplace listing from the Selling page: its More options menu, Delete listing, Delete, then "No, haven't sold" on Facebook's survey. Recorded on Bethlehem, 2026-10-23 (listing 1425935622848350).
Steps: gotomarketplaceYouSelling → clickMoreOptions → clickDeleteListing → clickDelete → clickNoHavenTSold → clickNext. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowMarketplaceListingDeleteLive`

log flow run marketplaceListingDelete --account <a> --set listingTitle=… --set listingId=… --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Delete one Marketplace listing from the Selling page: its More options menu, Delete listing, Delete, then "No, haven't sold" on Facebook's survey. Recorded on Bethlehem, 2026-10-23 (listing 1425935622848350).
Steps: gotomarketplaceYouSelling → clickMoreOptions → clickDeleteListing → clickDelete → clickNoHavenTSold → clickNext. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowMarketplaceListingPublish`

log flow run marketplaceListingPublish --account <a> --set location=… --set photo1=… --set photo2=… --set title=… --set price=… --set description=…
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowMarketplaceListingPublishLive`.
Publish one Marketplace listing in the account's open AdsPower browser: set the Marketplace location (City, State written out), open Create, two photos, title, price, category Miscellaneous, condition New, description, Next, Publish, close the Boost offer. Recorded on Bethlehem 2026-10-22 (listing 1425935622848350, held for review).
Steps: gotomarketplace → setLocation → gotomarketplaceCreateItem → uploadAddPhotosOrDrag → uploadAddPhoto → fillTitle → fillPrice → clickCategory → clickMiscellaneous → clickCondition → clickNew → fillDescription → clickNext → clickPublish → clickClose. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowMarketplaceListingPublishLive`

log flow run marketplaceListingPublish --account <a> --set location=… --set photo1=… --set photo2=… --set title=… --set price=… --set description=… --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Publish one Marketplace listing in the account's open AdsPower browser: set the Marketplace location (City, State written out), open Create, two photos, title, price, category Miscellaneous, condition New, description, Next, Publish, close the Boost offer. Recorded on Bethlehem 2026-10-22 (listing 1425935622848350, held for review).
Steps: gotomarketplace → setLocation → gotomarketplaceCreateItem → uploadAddPhotosOrDrag → uploadAddPhoto → fillTitle → fillPrice → clickCategory → clickMiscellaneous → clickCondition → clickNew → fillDescription → clickNext → clickPublish → clickClose. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "facebook/marketplaceListings" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowMessengerPinCreate`

log flow run messengerPinCreate --account <a> 
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowMessengerPinCreateLive`.
Messenger's Create a PIN: open /messages/, press Create PIN, type the account's PIN from Twenty, then again to confirm (rule 67). Recorded on Bethlehem 2026-10-22.
Steps: gotomessages → clickCreatePin → pin → pin. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowMessengerPinCreateLive`

log flow run messengerPinCreate --account <a>  --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Messenger's Create a PIN: open /messages/, press Create PIN, type the account's PIN from Twenty, then again to confirm (rule 67). Recorded on Bethlehem 2026-10-22.
Steps: gotomessages → clickCreatePin → pin → pin. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowPostComment`

log flow run postComment --account <a> --set comment=…
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowPostCommentLive`.
Comment on the newest post on the account's own profile: type in its Write a comment box, Post comment (useCometUFICreateCommentMutation). Writes on Facebook (--live).
Steps: gotoprofilePhp → fillWriteAComment → clickPostComment. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowPostCommentLive`

log flow run postComment --account <a> --set comment=… --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Comment on the newest post on the account's own profile: type in its Write a comment box, Post comment (useCometUFICreateCommentMutation). Writes on Facebook (--live).
Steps: gotoprofilePhp → fillWriteAComment → clickPostComment. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowProfilePhotoPost`

log flow run profilePhotoPost --account <a> --set photo=…
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowProfilePhotoPostLive`.
Post a photo on the account's own profile: Photo/video hands the file to the chooser, the upload finishes, Post, wait for ComposerStoryCreateMutation. Writes on Facebook (--live).
Steps: gotoprofilePhp → uploadPhotoVideo → clickPost. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowProfilePhotoPostLive`

log flow run profilePhotoPost --account <a> --set photo=… --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Post a photo on the account's own profile: Photo/video hands the file to the chooser, the upload finishes, Post, wait for ComposerStoryCreateMutation. Writes on Facebook (--live).
Steps: gotoprofilePhp → uploadPhotoVideo → clickPost. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowProfilePost`

log flow run profilePost --account <a> --set text=…
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowProfilePostLive`.
Post text on the account's own profile: open the composer, type the text, Post, wait for ComposerStoryCreateMutation. Writes on Facebook (--live).
Steps: gotoprofilePhp → clickWhatSOnYour → fillWhatSOnYour → clickPost. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowProfilePostLive`

log flow run profilePost --account <a> --set text=… --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Post text on the account's own profile: open the composer, type the text, Post, wait for ComposerStoryCreateMutation. Writes on Facebook (--live).
Steps: gotoprofilePhp → clickWhatSOnYour → fillWhatSOnYour → clickPost. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowProfileSetup`

log flow run profileSetup --account <a> --set profilePhoto=… --set coverPhoto=… --set firstName=… --set lastName=…
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowProfileSetupLive`.
Give an account its profile picture, cover photo and name, as recorded on Lancaster 2026-10-19 (rule 28): profile picture menu, Choose profile picture, Upload Photo, Save; Add Cover Photo, Upload photo, Save changes; Accounts Center name, Review change, Done.
Steps: gotome → clickProfilePictureActions → clickChooseProfilePicture → uploadUploadPhoto → clickSave → clickAddCoverPhoto → uploadUploadPhoto → clickSaveChanges → gotoprofilesName → fillFirstName → fillSurname → clickReviewChange → clickDone. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowProfileSetupLive`

log flow run profileSetup --account <a> --set profilePhoto=… --set coverPhoto=… --set firstName=… --set lastName=… --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Give an account its profile picture, cover photo and name, as recorded on Lancaster 2026-10-19 (rule 28): profile picture menu, Choose profile picture, Upload Photo, Save; Add Cover Photo, Upload photo, Save changes; Accounts Center name, Review change, Done.
Steps: gotome → clickProfilePictureActions → clickChooseProfilePicture → uploadUploadPhoto → clickSave → clickAddCoverPhoto → uploadUploadPhoto → clickSaveChanges → gotoprofilesName → fillFirstName → fillSurname → clickReviewChange → clickDone. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowWarmupCreateAccessCheck`

log flow run warmupCreateAccessCheck --account <a> 
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowWarmupCreateAccessCheckLive`.
Warm-up createAccessCheck: Listaro's runStage3, account-warmup.ts:181-209, recorded on 61594063207669 2026-10-22 (rule 35).
Steps: gotomarketplace → dwell → gotomarketplaceCreateItem → dwell → gotomarketplace → scroll. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowWarmupCreateAccessCheckLive`

log flow run warmupCreateAccessCheck --account <a>  --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Warm-up createAccessCheck: Listaro's runStage3, account-warmup.ts:181-209, recorded on 61594063207669 2026-10-22 (rule 35).
Steps: gotomarketplace → dwell → gotomarketplaceCreateItem → dwell → gotomarketplace → scroll. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowWarmupFeedBrowse`

log flow run warmupFeedBrowse --account <a> 
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowWarmupFeedBrowseLive`.
Warm-up feedBrowse: Listaro's runStage1, account-warmup.ts:92-130, recorded on 61594063207669 2026-10-22 (rule 35).
Steps: goto → dwell → scroll → gotomarketplace → dwell → scroll. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowWarmupFeedBrowseLive`

log flow run warmupFeedBrowse --account <a>  --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Warm-up feedBrowse: Listaro's runStage1, account-warmup.ts:92-130, recorded on 61594063207669 2026-10-22 (rule 35).
Steps: goto → dwell → scroll → gotomarketplace → dwell → scroll. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowWarmupMarketplaceBrowse`

log flow run warmupMarketplaceBrowse --account <a> 
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowWarmupMarketplaceBrowseLive`.
Warm-up marketplaceBrowse: Listaro's runStage2, account-warmup.ts:135-174, recorded on 61594063207669 2026-10-22 (rule 35).
Steps: gotomarketplace → dwell → scroll → openAny. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowWarmupMarketplaceBrowseLive`

log flow run warmupMarketplaceBrowse --account <a>  --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Warm-up marketplaceBrowse: Listaro's runStage2, account-warmup.ts:135-174, recorded on 61594063207669 2026-10-22 (rule 35).
Steps: gotomarketplace → dwell → scroll → openAny. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowWarmupMessagesVisit`

log flow run warmupMessagesVisit --account <a> 
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowWarmupMessagesVisitLive`.
Warm-up messagesVisit: Listaro's runStage4or5 (stage 5), account-warmup.ts:214-246, recorded on 61594063207669 2026-10-22 (rule 35).
Steps: gotomarketplace → scroll → gotomarketplaceYouSelling → dwell → gotomessages → dwell → scroll. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowWarmupMessagesVisitLive`

log flow run warmupMessagesVisit --account <a>  --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Warm-up messagesVisit: Listaro's runStage4or5 (stage 5), account-warmup.ts:214-246, recorded on 61594063207669 2026-10-22 (rule 35).
Steps: gotomarketplace → scroll → gotomarketplaceYouSelling → dwell → gotomessages → dwell → scroll. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowWarmupSellingVisit`

log flow run warmupSellingVisit --account <a> 
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowWarmupSellingVisitLive`.
Warm-up sellingVisit: Listaro's runStage4or5 (stage 4), account-warmup.ts:214-246, recorded on 61594063207669 2026-10-22 (rule 35).
Steps: gotomarketplace → scroll → gotomarketplaceYouSelling → dwell. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowWarmupSellingVisitLive`

log flow run warmupSellingVisit --account <a>  --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Warm-up sellingVisit: Listaro's runStage4or5 (stage 4), account-warmup.ts:214-246, recorded on 61594063207669 2026-10-22 (rule 35).
Steps: gotomarketplace → scroll → gotomarketplaceYouSelling → dwell. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From the current AGENTS.md (`log://agents`). Historical citations are consolidated; archived instructions do not override the active scope.

**Rule 1.** 2026-10-18 · Use camelCase for owned files, folders, values, ids, statuses and error codes. Convert external naming once at the boundary. See docs/namingConventions.md.

**Rule 2.** 2026-10-18 · Put platform code under src/<platform>/<area>/<domain>; shared code stays in its shared library/domain. Use index.ts, types.ts, client.ts, machine.ts and helpers where appropriate. Keep scripts and Python in domain folders.

**Rule 8.** 2026-10-18 · Platform actions require the user authorization their tool defines. Send, post, react, join, edit and delete only when authorized; preserve explicit live confirmation, governor and account gates. Ordinary reads do not need new approval.

**Rule 25.** 2026-10-19 · Fix failed or unfamiliar behavior from its own recorded action/request/response timeline. Identify the first response deciding the outcome, compare evidence, then change the machine. Do not infer success from a screen, timer or completed tool call.

**Rule 26.** 2026-10-19 · Stream progress while work runs, one meaningful line per stage, with the run log retained. Explain stages in plain words; do not leave the user waiting silently for a final buffered result.

**Rule 29.** 2026-10-19 · Record a browser page with the existing inspect tool before implementing actions on it. Preserve per-step snapshots, screenshots, HAR and the reading of the internal calls.

**Rule 30.** 2026-10-19 · Complete the authorized task. Do not repeatedly request confirmation already given. Distinguish implemented behavior, proposed contracts and unverified assumptions.

**Rule 31.** 2026-10-19 · Turn a repeatable recorded browser procedure into its flow, deterministic machine, documentation and matching CLI/MCP surface. Confirm each consequential step by the request and answer it causes.

**Rule 35.** 2026-10-19 · Browser work uses one account browser through its active day, with actions as tabs/steps; close only for a logged lifecycle reason. Preserve existing proxy-country, locale/timezone, device/profile, headed visibility, capture, active-hours and launch-budget gates. Keep checkpoint stops and account-specific constraints in the browser/flow guides. Do not create a fresh browser per action.

**Rule 38.** 2026-10-19 · Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless Matt raises them.

**Rule 39.** 2026-10-19 · Use only the scope, options and intent Matt stated or implied. Do not add unrelated alternatives to research, comparisons, plans or implementation.

**Rule 40.** 2026-10-19 · Do not propose physical infrastructure unless Matt asks. His available implementation scope is hosted/cloud environments and the tools already selected.

**Rule 41.** 2026-10-19 · Paid work must stay within the authorized task and spend. Ask before adding a paid operation he did not authorize; do not substitute a new paid provider implicitly.

**Rule 55.** 2026-10-20 · Keep CLI commands, MCP catalog/tools, hooks and generated documentation aligned. Change their source and regenerate the affected surfaces; do not hand-edit generated guides.

**Rule 63.** 2026-10-22 · Platform commands are log <platform> <command> <what>. Shared commands remain shared. Preserve the naming boundary described in docs/commandNaming.md.

**Rule 73.** 2026-10-23 · For an unknown platform state, collate the goal, account/runtime, action, sent requests, answers, timing and page evidence. Use the existing REA/SubQ reading workflow when applicable, report the unknown state, write Point/Evidence/Explain and the fix, then name the state. Preserve paid-work scope. This runtime analysis does not add SubQ to commit/CI gates.

**Rule 79.** 2026-10-25 · Flow controls must match deterministically by the recorded role/name and scope; ambiguous, missing or disabled controls refuse. Await the confirming API answer. Known resolvable states follow their recorded resolver; checkpoints/refusals remain stops.
