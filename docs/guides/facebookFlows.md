# facebookFlows

Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 56). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

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
bun bin/log.ts inspect start --account <a> --url https://www.facebook.com/me --bypass --now
bun bin/log.ts inspect do click <ref> --live ...   # one step at a time
bun bin/log.ts inspect do stop

## 2. recording → definition + docs (params renamed from text1/file1)
bun bin/log.ts flow fromInspect ~/.logCli/runs/inspect/<run> --name profileSetup \
  --rename text1=firstName --rename text2=lastName --rename file1=profilePhoto --rename file2=coverPhoto

## 3. run it on another account (dry run first: lists the filled steps, opens nothing)
bun bin/log.ts flow run profileSetup --account <a> --set firstName=Bethlehem --set lastName=Trash \
  --set profilePhoto=<path|url> --set coverPhoto=<path|url>
bun bin/log.ts flow run profileSetup --account <a> ... --live --bypass --now
```

Over MCP the same run is the tool `flowProfileSetup` with `account`, the
params by name; its live twin `flow<Name>Live` runs it on Facebook with `confirmLive: true`.

A failed step ends the run (`failedAt`): read that step's folder in the new
recording (rule 25), re-record the changed part with inspect, rebuild the flow.

### Deterministic steps (rule 79)

A step never guesses which control to press. The session gathers every visible
control and `python/browser/controlMatch.py` scores them: the step's role, then
its name as the accessible name, aria-label, label, text or placeholder (case
and spacing ignored), inside the step's dialog (`within`) or an open dialog
over the page behind it. One match is pressed; two are refused
(`controlAmbiguous`), none is `controlMissing`, a disabled one is waited for
until the step's time runs out (`controlDisabled`). So "Upload Photo" in a
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

Before a flow's first click, fill or upload, `clearOverlays` reads the page
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
Rebuild the request docs after a run (rule 27): `capture --docs`.

### Saved flows

| Flow | Recorded | Does |
| --- | --- | --- |
| `profileSetup` | Lancaster, 2026-10-19; the picture steps checked on Exeter, 2026-10-24 | Profile picture, cover photo, name (13 steps). The picture steps wait on the dialog query, the upload and the set mutation, inside "Choose profile picture". The host runs only the parts Twenty has data for (`flowWithParams`). |
| `marketplaceListingDelete` | Bethlehem, 2026-10-23 | Delete one Marketplace listing from Selling: More options, Delete listing, Delete, then "No, haven't sold" on Facebook's survey (6 steps). The menu answer must name the listing id given, and so must the delete answer (`commerce_for_sale_item_delete.deleted_for_sale_item_id`). Run it through `log facebook listing remove`, which then sets the Twenty row REMOVED. |

## The work, step by step: warmup

From `skills/warmup/SKILL.md`.

## warmup

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
7. **Every step that makes a call is decided by its answer** (rule 73). The
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
4. **Live and watched** (rule 26): run through Monitor; every step goes to the
   stage log as it happens.
5. **Stops on the wrong page.** Every step's landing page is checked
   (`pageProblem`): a checkpoint, a login wall or another section ends the
   activity (`blocked`), and the account's issue is written to Twenty. Erie,
   2026-10-19, scrolled a checkpoint page for a minute before this.
6. **Scrolls like a hand** (`python/human/scrollMotion.py`, ported from the Robotic
   VSL repo): bell-curve wheel steps, overshoot and recoil, mid-pauses. No
   `scrollBy` or `scroll_into_view_if_needed` anywhere.
7. **Reels play with the sound on, every time a reel loads.** Reels start
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
log proxy balance                                      # 2Captcha traffic left, before a run
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
  to `~/.logCli/proxyTraffic.jsonl`.
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
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

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
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

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
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 8, 18, 20, 25, 26, 29, 32, 35, 36, 49, 50, 51, 54, 55, 60, 64, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

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
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 8, 18, 20, 25, 26, 29, 32, 35, 36, 49, 50, 51, 54, 55, 60, 64, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowDeletePost`

log flow run deletePost --account <a> 
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowDeletePostLive`.
Delete the newest post on the account's own profile: its Actions menu, Move to bin, Move (useCometTrashPostMutation; Facebook empties the bin after 30 days). Writes on Facebook (--live).
Steps: gotoprofilePhp → clickActionsForThisPost → clickMoveToBinItems → clickMove. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowDeletePostLive`

log flow run deletePost --account <a>  --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Delete the newest post on the account's own profile: its Actions menu, Move to bin, Move (useCometTrashPostMutation; Facebook empties the bin after 30 days). Writes on Facebook (--live).
Steps: gotoprofilePhp → clickActionsForThisPost → clickMoveToBinItems → clickMove. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowFacebookLanguageEnglish`

log flow run facebookLanguageEnglish --account <a> 
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowFacebookLanguageEnglishLive`.
Switch the account's Facebook language to English (US): Settings, Language and region, Account language, English (US), OK; decided by useCometUSFScrollablePickerMutation answering en_US. Recorded on Scranton 2026-10-25 from Arabic.
Steps: gotosettings → click → clickEnglishUs → click. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowFacebookLanguageEnglishLive`

log flow run facebookLanguageEnglish --account <a>  --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Switch the account's Facebook language to English (US): Settings, Language and region, Account language, English (US), OK; decided by useCometUSFScrollablePickerMutation answering en_US. Recorded on Scranton 2026-10-25 from Arabic.
Steps: gotosettings → click → clickEnglishUs → click. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowGroupHeaderMenus`

log flow run groupHeaderMenus --account <a> --set groupId=…
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowGroupHeaderMenusLive`.
Open and close the group header's search, More menu, Joined menu, Invite dialog and Share sheet; nothing inside them is picked
Steps: gotogroups → clickSearchWithinThisGroup → pressEscape → clickMore → pressEscape → clickJoined → pressEscape → clickInvite → pressEscape → clickShareGroup → pressEscape. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowGroupHeaderMenusLive`

log flow run groupHeaderMenus --account <a> --set groupId=… --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Open and close the group header's search, More menu, Joined menu, Invite dialog and Share sheet; nothing inside them is picked
Steps: gotogroups → clickSearchWithinThisGroup → pressEscape → clickMore → pressEscape → clickJoined → pressEscape → clickInvite → pressEscape → clickShareGroup → pressEscape. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowGroupMembers`

log flow run groupMembers --account <a> 
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowGroupMembersLive`.
Open a group's People tab and scroll it read-only so Facebook loads the member list (bio line, page category) for extraction
Steps: gotogroupsJunkremovalwinners → gotogroupsJunkremovalwinnersMembers → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowGroupMembersLive`

log flow run groupMembers --account <a>  --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Open a group's People tab and scroll it read-only so Facebook loads the member list (bio line, page category) for extraction
Steps: gotogroupsJunkremovalwinners → gotogroupsJunkremovalwinnersMembers → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowGroupPostComments`

log flow run groupPostComments --account <a> --set groupId=…
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowGroupPostCommentsLive`.
On a group's Open questions tab, open a post's comments, switch the sort to All comments and scroll them; read-only
Steps: gotogroupsQuestions → clickLeaveAComment → clickMostRelevant → clickAllCommentsShowAll → scroll. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowGroupPostCommentsLive`

log flow run groupPostComments --account <a> --set groupId=… --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
On a group's Open questions tab, open a post's comments, switch the sort to All comments and scroll them; read-only
Steps: gotogroupsQuestions → clickLeaveAComment → clickMostRelevant → clickAllCommentsShowAll → scroll. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowGroupPostDialog`

log flow run groupPostDialog --account <a> --set groupId=…
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowGroupPostDialogLive`.
On a group's Discussion feed, open a post in its dialog with Leave a comment (the comment box takes focus, nothing is typed) and close it
Steps: gotogroups → clickLeaveAComment → clickClose. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowGroupPostDialogLive`

log flow run groupPostDialog --account <a> --set groupId=… --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
On a group's Discussion feed, open a post in its dialog with Leave a comment (the comment box takes focus, nothing is typed) and close it
Steps: gotogroups → clickLeaveAComment → clickClose. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowGroupTabs`

log flow run groupTabs --account <a> --set groupId=…
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowGroupTabsLive`.
Open each tab of a group the account is in (Featured, Open questions, People, Events, Media, Files, About) and come back to Discussion; read-only
Steps: gotogroups → clickFeatured → clickOpenQuestions → clickPeople → clickEvents → clickMedia → clickFiles → clickAbout → clickDiscussion. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowGroupTabsLive`

log flow run groupTabs --account <a> --set groupId=… --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Open each tab of a group the account is in (Featured, Open questions, People, Events, Media, Files, About) and come back to Discussion; read-only
Steps: gotogroups → clickFeatured → clickOpenQuestions → clickPeople → clickEvents → clickMedia → clickFiles → clickAbout → clickDiscussion. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowMarketplaceListingDelete`

log flow run marketplaceListingDelete --account <a> --set listingTitle=… --set listingId=…
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowMarketplaceListingDeleteLive`.
Delete one Marketplace listing from the Selling page: its More options menu, Delete listing, Delete, then "No, haven't sold" on Facebook's survey. Recorded on Bethlehem, 2026-10-23 (listing 1425935622848350).
Steps: gotomarketplaceYouSelling → clickMoreOptions → clickDeleteListing → clickDelete → clickNoHavenTSold → clickNext. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowMarketplaceListingDeleteLive`

log flow run marketplaceListingDelete --account <a> --set listingTitle=… --set listingId=… --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Delete one Marketplace listing from the Selling page: its More options menu, Delete listing, Delete, then "No, haven't sold" on Facebook's survey. Recorded on Bethlehem, 2026-10-23 (listing 1425935622848350).
Steps: gotomarketplaceYouSelling → clickMoreOptions → clickDeleteListing → clickDelete → clickNoHavenTSold → clickNext. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowMarketplaceListingPublish`

log flow run marketplaceListingPublish --account <a> --set location=… --set photo1=… --set photo2=… --set title=… --set price=… --set description=…
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowMarketplaceListingPublishLive`.
Publish one Marketplace listing in the account's open AdsPower browser: set the Marketplace location (City, State written out), open Create, two photos, title, price, category Miscellaneous, condition New, description, Next, Publish, close the Boost offer. Recorded on Bethlehem 2026-10-22 (listing 1425935622848350, held for review).
Steps: gotomarketplace → setLocation → gotomarketplaceCreateItem → uploadAddPhotosOrDrag → uploadAddPhoto → fillTitle → fillPrice → clickCategory → clickMiscellaneous → clickCondition → clickNew → fillDescription → clickNext → clickPublish → clickClose. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowMarketplaceListingPublishLive`

log flow run marketplaceListingPublish --account <a> --set location=… --set photo1=… --set photo2=… --set title=… --set price=… --set description=… --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Publish one Marketplace listing in the account's open AdsPower browser: set the Marketplace location (City, State written out), open Create, two photos, title, price, category Miscellaneous, condition New, description, Next, Publish, close the Boost offer. Recorded on Bethlehem 2026-10-22 (listing 1425935622848350, held for review).
Steps: gotomarketplace → setLocation → gotomarketplaceCreateItem → uploadAddPhotosOrDrag → uploadAddPhoto → fillTitle → fillPrice → clickCategory → clickMiscellaneous → clickCondition → clickNew → fillDescription → clickNext → clickPublish → clickClose. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowMessengerPinCreate`

log flow run messengerPinCreate --account <a> 
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowMessengerPinCreateLive`.
Messenger's Create a PIN: open /messages/, press Create PIN, type the account's PIN from Twenty, then again to confirm (rule 67). Recorded on Bethlehem 2026-10-22.
Steps: gotomessages → clickCreatePin → pin → pin. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowMessengerPinCreateLive`

log flow run messengerPinCreate --account <a>  --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Messenger's Create a PIN: open /messages/, press Create PIN, type the account's PIN from Twenty, then again to confirm (rule 67). Recorded on Bethlehem 2026-10-22.
Steps: gotomessages → clickCreatePin → pin → pin. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowPostComment`

log flow run postComment --account <a> --set comment=…
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowPostCommentLive`.
Comment on the newest post on the account's own profile: type in its Write a comment box, Post comment (useCometUFICreateCommentMutation). Writes on Facebook (--live).
Steps: gotoprofilePhp → fillWriteAComment → clickPostComment. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowPostCommentLive`

log flow run postComment --account <a> --set comment=… --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Comment on the newest post on the account's own profile: type in its Write a comment box, Post comment (useCometUFICreateCommentMutation). Writes on Facebook (--live).
Steps: gotoprofilePhp → fillWriteAComment → clickPostComment. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowProfilePhotoPost`

log flow run profilePhotoPost --account <a> --set photo=…
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowProfilePhotoPostLive`.
Post a photo on the account's own profile: Photo/video hands the file to the chooser, the upload finishes, Post, wait for ComposerStoryCreateMutation. Writes on Facebook (--live).
Steps: gotoprofilePhp → uploadPhotoVideo → clickPost. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowProfilePhotoPostLive`

log flow run profilePhotoPost --account <a> --set photo=… --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Post a photo on the account's own profile: Photo/video hands the file to the chooser, the upload finishes, Post, wait for ComposerStoryCreateMutation. Writes on Facebook (--live).
Steps: gotoprofilePhp → uploadPhotoVideo → clickPost. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowProfilePost`

log flow run profilePost --account <a> --set text=…
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowProfilePostLive`.
Post text on the account's own profile: open the composer, type the text, Post, wait for ComposerStoryCreateMutation. Writes on Facebook (--live).
Steps: gotoprofilePhp → clickWhatSOnYour → fillWhatSOnYour → clickPost. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowProfilePostLive`

log flow run profilePost --account <a> --set text=… --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Post text on the account's own profile: open the composer, type the text, Post, wait for ComposerStoryCreateMutation. Writes on Facebook (--live).
Steps: gotoprofilePhp → clickWhatSOnYour → fillWhatSOnYour → clickPost. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowProfileSetup`

log flow run profileSetup --account <a> --set profilePhoto=… --set coverPhoto=… --set firstName=… --set lastName=…
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowProfileSetupLive`.
Give an account its profile picture, cover photo and name, as recorded on Lancaster 2026-10-19 (rule 28): profile picture menu, Choose profile picture, Upload Photo, Save; Add Cover Photo, Upload photo, Save changes; Accounts Center name, Review change, Done.
Steps: gotome → clickProfilePictureActions → clickChooseProfilePicture → uploadUploadPhoto → clickSave → clickAddCoverPhoto → uploadUploadPhoto → clickSaveChanges → gotoprofilesName → fillFirstName → fillSurname → clickReviewChange → clickDone. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowProfileSetupLive`

log flow run profileSetup --account <a> --set profilePhoto=… --set coverPhoto=… --set firstName=… --set lastName=… --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Give an account its profile picture, cover photo and name, as recorded on Lancaster 2026-10-19 (rule 28): profile picture menu, Choose profile picture, Upload Photo, Save; Add Cover Photo, Upload photo, Save changes; Accounts Center name, Review change, Done.
Steps: gotome → clickProfilePictureActions → clickChooseProfilePicture → uploadUploadPhoto → clickSave → clickAddCoverPhoto → uploadUploadPhoto → clickSaveChanges → gotoprofilesName → fillFirstName → fillSurname → clickReviewChange → clickDone. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowWarmupCreateAccessCheck`

log flow run warmupCreateAccessCheck --account <a> 
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowWarmupCreateAccessCheckLive`.
Warm-up createAccessCheck: Listaro's runStage3, account-warmup.ts:181-209, recorded on 61594063207669 2026-10-22 (rule 35).
Steps: gotomarketplace → dwell → gotomarketplaceCreateItem → dwell → gotomarketplace → scroll. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowWarmupCreateAccessCheckLive`

log flow run warmupCreateAccessCheck --account <a>  --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Warm-up createAccessCheck: Listaro's runStage3, account-warmup.ts:181-209, recorded on 61594063207669 2026-10-22 (rule 35).
Steps: gotomarketplace → dwell → gotomarketplaceCreateItem → dwell → gotomarketplace → scroll. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowWarmupFeedBrowse`

log flow run warmupFeedBrowse --account <a> 
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowWarmupFeedBrowseLive`.
Warm-up feedBrowse: Listaro's runStage1, account-warmup.ts:92-130, recorded on 61594063207669 2026-10-22 (rule 35).
Steps: goto → dwell → scroll → gotomarketplace → dwell → scroll. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowWarmupFeedBrowseLive`

log flow run warmupFeedBrowse --account <a>  --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Warm-up feedBrowse: Listaro's runStage1, account-warmup.ts:92-130, recorded on 61594063207669 2026-10-22 (rule 35).
Steps: goto → dwell → scroll → gotomarketplace → dwell → scroll. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowWarmupMarketplaceBrowse`

log flow run warmupMarketplaceBrowse --account <a> 
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowWarmupMarketplaceBrowseLive`.
Warm-up marketplaceBrowse: Listaro's runStage2, account-warmup.ts:135-174, recorded on 61594063207669 2026-10-22 (rule 35).
Steps: gotomarketplace → dwell → scroll → openAny. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowWarmupMarketplaceBrowseLive`

log flow run warmupMarketplaceBrowse --account <a>  --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Warm-up marketplaceBrowse: Listaro's runStage2, account-warmup.ts:135-174, recorded on 61594063207669 2026-10-22 (rule 35).
Steps: gotomarketplace → dwell → scroll → openAny. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowWarmupMessagesVisit`

log flow run warmupMessagesVisit --account <a> 
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowWarmupMessagesVisitLive`.
Warm-up messagesVisit: Listaro's runStage4or5 (stage 5), account-warmup.ts:214-246, recorded on 61594063207669 2026-10-22 (rule 35).
Steps: gotomarketplace → scroll → gotomarketplaceYouSelling → dwell → gotomessages → dwell → scroll. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowWarmupMessagesVisitLive`

log flow run warmupMessagesVisit --account <a>  --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Warm-up messagesVisit: Listaro's runStage4or5 (stage 5), account-warmup.ts:214-246, recorded on 61594063207669 2026-10-22 (rule 35).
Steps: gotomarketplace → scroll → gotomarketplaceYouSelling → dwell → gotomessages → dwell → scroll. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowWarmupSellingVisit`

log flow run warmupSellingVisit --account <a> 
A dry run: lists the steps and opens nothing. What runs them on Facebook is `flowWarmupSellingVisitLive`.
Warm-up sellingVisit: Listaro's runStage4or5 (stage 4), account-warmup.ts:214-246, recorded on 61594063207669 2026-10-22 (rule 35).
Steps: gotomarketplace → scroll → gotomarketplaceYouSelling → dwell. Every step is recorded (snapshot, screenshot, HAR, rea).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `flowWarmupSellingVisitLive`

log flow run warmupSellingVisit --account <a>  --live
Live on Facebook: runs every step in the account's browser. Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Warm-up sellingVisit: Listaro's runStage4or5 (stage 4), account-warmup.ts:214-246, recorded on 61594063207669 2026-10-22 (rule 35).
Steps: gotomarketplace → scroll → gotomarketplaceYouSelling → dwell. Every step is recorded (snapshot, screenshot, HAR, rea).
Runs for minutes in the account's browser: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookFlows" }) (Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause).
AGENTS.md (log://agents): rules 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From AGENTS.md (`log://agents`). The newest rules are at the bottom of AGENTS.md and win.

**Rule 8.** 2026-10-18 · Read-only on Facebook. Nothing is posted, edited or deleted unless matt asks for it.

**Rule 18.** 2026-10-18 · No run outside the account's local waking hours (08:00-22:00 in its home timezone, or `activeHoursStart`/`activeHoursEnd`): publish, scan, status, watch, campaign run and connect are refused with `outsideActiveHours`. Daily caps count the account's local day.

**Rule 20.** 2026-10-19 · matt asked for `--bypass`: on publish, scan, status, watch, campaign run and connect it skips rule 18's waking hours for that run, and nothing else. The proxy gate, home locale, device and launch self-check (rules 11, 12, 15-17) still run, and `--live` still needs matt (rule 10). It is never on by default; pass it only when matt asks for a run outside the account's hours.

**Rule 25.** 2026-10-19 · matt: a run that fails or hangs is fixed from its own recording, never by guessing. Read its HAR with rea (timeline, cause line, compare runs), then fix the machine. The outline is at the top of this file.

**Rule 26.** 2026-10-19 · matt: "I always want to see what is going on." Every process that runs over time writes a progress line per stage as it happens (never only at the end) and to a log file in its folder. Agents run long commands so the lines stream live (Claude Code: Monitor, never piped through `tail`/`head`).

**Rule 29.** 2026-10-19 · matt: look before writing code for a page. `log inspect start --account <a>` opens one gated, headed Camoufox (async API, same launch and gates as every run) and keeps it open; `log inspect do <action>` runs one step (goto, snapshot, back, wait; click, type, press only with `--live`, rule 8). Each step records, in order, as it happens: the accessibility snapshot with element refs (camofox-mcp's model, `aria_snapshot(mode="ai")`), a screenshot, its own HAR, and rea's reading of that HAR at once. Code that clicks on a page is written from an inspect recording of that page, never before one.

**Rule 30.** 2026-10-19 · matt: "If I tell you to do something, do it completely." When matt gives a plan, it is carried out to the end in the same turn, not stopped to ask again or to say what won't be done. `log inspect start --now` (and `log connect --now`, and since 2026-10-19 `log publish --now`, matt: "run it now") skips rule 24's 10-minute gap (the 8 a day still holds) so a recording continues at once. Recording a sign-in or a checkpoint with `log inspect` (signIn, code, solve, click) is the intended work: it is how each state gets documented from rea. The run on 2026-10-19 was interrupted once because a snapshot printed the account's email and password; snapshots now redact every typed field value (`redact_fields`), and signIn/code read only the private login.json (rule 21), so no credential reaches any output.

**Rule 31.** 2026-10-19 · matt: a recorded procedure becomes the whole pipeline, not a one-off. `log inspect` records it (rule 29); `log flow fromInspect` turns the recording into a flow definition (each step's element by role and name from the snapshot it acted on, each step's confirming request from what it sent, rea's Evidence per step, `src/browser/flow/definitions/<name>.json`); `log flow docs` writes its documentation (`docs/platforms/facebook/flows/<name>.md`, linked to each request's doc); `createFlowMachine` makes it an XState machine; `log flow run <name> --account <a> --set …` runs it on any account (dry run unless `--live`), recording every step again; and every saved flow is an MCP tool of its own (`flowProfileSetup`). The docs gate requires each flow's doc.

**Rule 32.** 2026-10-19 · matt: the cursor moves as his own hand does, measured, not guessed. `python/human/recordMouse.py` recorded his mouse on a Facebook page (60 s, ~/.logCli/mouse/20261019T192448.json); `python/human/humanMouse.py` is fitted to it: one continuous velocity profile per move (Bezier path, speed peak in the first third, long settle, 0.42-0.45 s for 400-800 px), overshoot of 10-60 px and return in about half of reaches, loose 80-350 px loops around what is looked at, pauses of 0.1-1.5 s, still ~25 % of the time. The same module drives every session: the async inspect/flow sessions (idle loop between steps, preempted by any step) and the sync publish/connect/profile sessions (`Session.mouse.look()` before each step, every click through `human_click`). Those sessions launch with `own_trajectory=True`: humanize stays on (rule 11) with its per-hop curve capped at 20 ms, because its 0.6 s cap cost 100 ms per 5 px hop and made every move crawl. Each step saves its samples (`mouseSamples.json`) so `recordMouse.py --analyze` measures ours the way it measured his. Nothing is injected into the page.

**Rule 35.** 2026-10-19 · matt: the browser stays open. One browser per account, opened once per local day by its host and kept open through the account's active hours; every action is a tab in it; it closes only for a logged reason (end of active hours, shutdown, checkpoint or restriction, account lost, a crash reopened once). Every account runs one lifecycle machine (`src/marketplace/lifecycle`, XState) across an onboarding lane (with a day's warm-up after profile and name) and a host lane. Top of this file.

**Rule 36.** 2026-10-19 · matt: the warm-up is recorded and watched, then wrapped. Each of Listaro's five warm-up activities (`account-warmup.ts` stages 1-5) is done through `log inspect` in a headed session, recorded step by step, turned into a flow and its XState machine (`warmupFeedBrowse`…), and wrapped as `log warmup`: `record` (once), `run` (the warm-up machine runs each flow in turn in one open browser) and `feed` (the activity feed, live). Warm-up steps are `scroll`, `openAny`, `clickAny`, `dwell`, their ranges drawn each run; the likes need `--likes` (rule 8).

**Rule 38.** 2026-10-19 · matt: never mention or discuss Meta's or Facebook's rules, terms, policies, eligibility or account ownership with him unless he raises them first. Research text that does is not his, and is never repeated to him. Top of this file.

**Rule 39.** 2026-10-19 · matt: "If I never mentioned it, if I never inferred it, if I never outlined it as an option, therefore it is not an option." Deep research prompts, searches, SubQ matrices, plans and write-ups use only what matt said, or clearly meant through a misspelling. Nothing added, nothing steered towards. Top of this file.

**Rule 40.** 2026-10-19 · matt: no physical options. He is in Vietnam with no physical access. Phones, SIMs, mini PCs, laptops, phone farms and home devices are never options unless he names them. In scope: hosted and cloud options, the tools he named and their competitors, and what our four projects already use.

**Rule 41.** 2026-10-19 · matt: "any time any task correlates to money, and I never say something, that means you shouldn't do what you think. You should do what I say." Paid work (deep research, SubQ, proxies, captcha, vendors) does exactly what he asked, nothing more. Ask before anything else.

**Rule 49.** 2026-10-20 · matt: the warm-up is by platform, then activity: `log warmup <platform> <activity>`, first `log warmup facebook reel` (`src/warmup/<platform>`, the library the warm-up and the domain the platform). It opens the account's browser (`inspect start --detach`) primed with the activity and runs its steps as a flow of events, each recorded (rule 22). A warm-up spans many activities; each is a unit of its own, so it is watched alone, and every step says what it must achieve (a swipe changes the reel's URL, the comments show their heading): each run writes the outline of the steps that didn't (`warmup_<platform>_<activity>.json`), and the steps are fixed from that recording (rule 25). Reels: sound on first (they start muted: nobody watches a reel with the audio off); most reels get a glance and a skip, often a few in a row, and only some are watched (`--skip`, default 0.6); on those: Next card, the comments opened, scrolled (the wheel over the panel, `scrollIn`) and closed, the creator's profile, a like only with --likes (rule 8); a session is drawn from ranges (`plan`). Its requests are in `docs/platforms/facebook/reels/` (rule 48).

**Rule 50.** 2026-10-20 · matt: the Reels warm-up builds the persona's For you feed by engaging with what it would engage with, from the datasets (the persona-conditioned Reels handoff he collated; `~/.logCli/datasets/SOURCES.md`). `log warmup facebook reel run --persona` keeps one persona per account (the three datasets he named), one real viewer from KuaiRand-1K (`src/warmup/viewer`, matched to the persona's scroll speed) and one persona pack (`buildPersonaPack`): every dataset gives a trait, said in its provenance, real or synthetic, including what the persona is into (`interests`). Each reel, the moment it lands, is read by SubQ from its frame (matt: SubQ analyses the images), with the caption and the persona: what it is, whether it is this persona's kind of content, the one action they'd pick. The action orderer (`planReel`, deterministic from the seed) then plans it: the watch is the viewer's next real play scaled by the interest effect measured on KuaiRand-Pure's random log (their kind ×1.10-1.67, outside ×0.90-0.99; likes ×1.28 against ×0.95, comments ×1.40 against ×0.93, `scripts/datasets/buildInterestEffect.ts`), and at most one action (U = p × interest effect × segment weight × attention fit, a like cooldown of 3 reels, only what the run allows, rule 8), a close call settled by the read's pick. The watch counts from when the reel landed, so SubQ's answer is the glance. rea still reads each step at once without holding up the next (`reaLater`, rule 29); a dwell doesn't wait for the network, a swipe only for the next reel's URL, and the cursor rests on Next card between quick swipes. Save, follow and share aren't built.

**Rule 51.** 2026-10-20 · matt: proxy traffic is money. Reels ran 2Captcha's traffic out (about 4.5 MB a reel through the residential proxy), so each account has a budget of its own traffic for 24 hours, 1 GB by default (`--trafficMb`). A warm-up reads 2Captcha's counter before and after, refuses to start over the budget (`trafficBudgetSpent`), checks every 5 reels and stops at it, and writes each run's use to `~/.logCli/proxyTraffic.jsonl` (`src/proxyVendor/traffic`).

**Rule 54.** 2026-10-20 · matt: a known state is resolved, never a reason to stop. When a page lands on a state log-cli already knows (a checkpoint's first page, a text captcha, the Remember password prompt, the login form, two-step, "automated behaviour"), its resolver runs: press the checkpoint's Continue (plain text, by its ref), `solve` the captcha (2Captcha, then Continue), Not now, signIn, code. Only what a person must clear stops an account (a video selfie, an ID or photo, a disabled account; rules 10, 23), and that is said to matt. A Claude Code hook (`.claude/settings.json`, `scripts/hooks/pageState.ts`) reads the latest step of every open browser after each tool call and each prompt, matches it against the known states (`pageStateOf`, `src/browser/flow/helpers/pageState.ts`) and puts the state and its resolver into the agent's context. A state not mapped yet is pressed through (its Continue) and added to the map.

**Rule 55.** 2026-10-20 · matt: the CLI, the MCP tools, the agent hooks and the live log line up, and a commit is refused when they don't. One hook list (`src/agentHooks/registry`) writes both hosts' files, Claude Code's `.claude/settings.json` and Codex's `.codex/hooks.json`: SessionStart and UserPromptSubmit say where every open browser is; PostToolUse (Bash, PowerShell, Monitor, every `mcp__log__` tool) gives a known state its resolver, and a failed step is an unconfirmed page (snapshot, then resolve); Stop keeps the turn going while a browser sits on a state log-cli resolves itself (rule 54), never on a person's state, and never twice on the same unchanged one; PreToolUse refuses a log run piped through tail/head (rule 26). The terminal CLI writes the same live log as the MCP, `~/.logCli/mcp/<day>.log`, so one Monitor shows a run however it started. lefthook's `agentHooks` (`bun run check:agentHooks`, pre-commit and pre-push) refuses drift: both hosts' files, every command an MCP tool or terminal-only, every MCP tool hooked, every hook script answering its events, every resolver a real command (`skills/agentHooks/SKILL.md`).

**Rule 60.** 2026-10-20 · matt: log-cli is platform-agnostic as well as browser-agnostic. Facebook (Marketplace and groups) is the first platform, and what is scoped by platform names it in every form: `log warmup <platform> <activity>`, with no form that skips the platform. Listaro's five Facebook activities are the Facebook activity `stages`: `log warmup facebook stages plan|record|run|log` (was `log warmup plan|record|run|feed`; those are refused with the form they became), their code in `src/warmup/facebookStages` (was `src/marketplace/warmup`), and their log the stage log (`~/.logCli/runs/warmup/stageLog.jsonl`, was the "activity feed", which clashed with the Facebook feed activity). Every command declares its platform (`Command.platform`: `facebook`, `any` or `byArgument`, a typecheck error without one), the README shows it in its Platform column, and `check:docs` refuses a `byArgument` command with a usage line that doesn't name the platform. The Facebook-only commands that don't yet take the platform in their name are listed in issue #20 (github.com/matthewdonsemail-lab/log-cli/issues/20), to be scoped as matt decides.

**Rule 64.** 2026-10-22 · matt: the code is by platform first, as the commands are, "because each has different approaches": `src/<platform>/<area>/<domain>`. Facebook's groups are `src/facebook/group/{join,read,answer}` (were `src/group/…`, rule 45) and its warm-up `src/facebook/warmup/activities` and `src/facebook/warmup/stages` (were `src/warmup/facebook` and `src/warmup/facebookStages`, rule 49). What every platform's warm-up draws from stays shared: `src/warmup/persona`, `src/warmup/viewer`. Each area has an `index.ts` (`check:naming`). Top of this file.

**Rule 68.** 2026-10-22 · matt: the Marketplace location is typed as "City, State" with the state written out in full ("Bethlehem, Pennsylvania", never "PA"): "Bethlehem, PA" was offered only as the West Bank, and a bare zip offered Granada, Spain first (Bethlehem, inspect 20261022T105341 and 20261022T110738). `setLocation` writes a US state code out, picks the option Facebook's own answer names as the place typed, clicks it, and sets nothing when none matches. A listing is published from the account's open AdsPower browser by the recorded flow `marketplaceListingPublish` (location, Create, photos, title, price, category, condition, description, Next, Publish; never Boost, rule 41), not by a second browser. "Discover more when you shop" (partner listings, a European location) is a known page state, pressed through with Update.

**Rule 72.** 2026-10-23 · matt: a Marketplace location is never abbreviated. It is typed as "City, State" with the state written out ("Bethlehem, Pennsylvania") or "City, Country" ("Galway, Ireland"): "Bethlehem, PA" was offered only as the West Bank, and a bare zip offered Granada, Spain first (rule 68). A check blocks before any action: a place with an acronym, a state code, a zip or any number, or no state or country is refused with `locationAbbreviated` (`placeProblem`, `src/facebook/marketplace/location`; `python/location/placeName.py` in the sessions), in a listing's `locationQuery` (`listing create`, `lint`, `publish`, `campaign fill`), `log inspect do setLocation`, a flow's `location`, and the host's setLocation, which types the listing's `locationQuery` and never a zip. A written-out state counts as the US for the country check.

**Rule 73.** 2026-10-23 · matt: "IT MUST ALWAYS READ THEM." The number one rule of the stack, above rule 30 and every other: Facebook's internal API answers are the decision-making factor of what and when something is relevant, and the deterministic factor of the system. Every browser step reads the internal API answers it triggers and the requests it sent, keeps them past the prune, and decides on them, never on a page loading, a timer or the step having run. The MCP instructions put it first. Inspect steps read theirs since rule 74, and every flow, warm-up and host step on AdsPower that makes a call since 2026-10-23; the Camoufox-only machines don't yet (#35). Top of this file.

**Rule 79.** 2026-10-25 · matt: "we can't do that in production, that's why we need it deterministic." A flow step never depends on a page's exact wording or a person stepping in. A control is picked by one scored match (`python/browser/controlMatch.py`): its role, then its name as the accessible name, aria-label, label, text or placeholder, case and spacing ignored, inside the dialog the step names (`within`, taken from the recording's snapshot) or an open dialog over the page behind it; two equal matches are refused (`controlAmbiguous`), none is `controlMissing`, a disabled one is waited for (`controlDisabled`). Every step waits for the call it must cause (`expect`: a mutation, a plain endpoint such as `profilePictureUpload`, or a dialog query) and checks its answer (rule 73) before the next one fires. `log facebook preflight` says before any browser opens what would stop each account (home timezone, hours, proxy country and speed, the browser kernel, launches and host opens left, a session left open, its picture on disk); `--apply` downloads a missing kernel and the host waits for one. A session whose process is gone is dropped. Snapshot excerpts of each page version are test fixtures (`python/fixtures/controls/`). Before a flow's first click it clears the known overlays with Escape, each checked: the browser-notifications notice (gone from the page) and an ended "What happened" notice (`useAccountStatusClearEnrollmentEntryPointActionMutation` answers `xfb_ixt_gateway_clear_flow: true`); one that stays stops the flow with `overlayNotCleared`.
