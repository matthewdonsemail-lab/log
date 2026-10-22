# Facebook client workflows

What log-cli runs on Facebook today, from the code (2026-10-20). Usage is from `Command.usage` (README surface section). Runs: `~/.logCli/runs/<action>/<run>/`, publish under `~/.logCli/publish/`.

Status: **verified live**, **built, not verified** (run, never ended clean), **built, never run live**, **recorded only** (inspect recording, no machine or command), **not built**.

## 1. Workflows

| Workflow | Runs it | On Facebook | Read/write | Machine / flow | Recorded live | Status |
|---|---|---|---|---|---|---|
| Sign in, save cookies | `log facebook connect --account <a> [--noPrompt] [--now]` / MCP `connect` | Login, captcha, two-step (rule 23) | write (session only), no `--live` | `src/marketplace/connect/machine.ts`, `python/session/connectSession.py` | `runs/connect/lastReading.log`, `erie.log` and two more (2026-10-19) | verified live (Camoufox only) |
| Sign in inside the open browser | `log inspect do signIn\|code\|solve --live` | Login form, two-step code, text captcha | write, `--live` | `python/session/inspectSession.py` (`sign_in`, `enter_code`, `solve_text_captcha`) | inspect `20261020T105346` (`solveTextcaptcha`) | verified live |
| Day host (lifecycle) | `log facebook host start --account <a> [--live] [--likes]` / MCP `host` | Open, sign-in, check, profile, location, warm-up | read; profile/location/likes need `--live` | `src/marketplace/lifecycle/machine.ts`, `src/cli/host/helpers/hostActors.ts` | `runs/host/harrisburg*.log`: stopped (loginWall, pageNotReached, opensSpent) | built, not verified |
| Profile photo, cover, name (flow) | `log flow run profileSetup --account <a> --set …  --live` / MCP `flowProfileSetup` | Picture, cover, rename | write, `--live` | `src/browser/flow/definitions/profileSetup.json`, `docs/platforms/facebook/flows/profileSetup.md` | `mcp/2026-10-19.log` 11:46-11:49: "Flow profileSetup: done" | verified live |
| Profile setup (session) | `log facebook profile setup --account <a> [--live]` / MCP `profile` | Same, own launch | write, `--live` | `src/marketplace/profile/machine.ts`, `python/session/profileSession.py` | `runs/profile/lastDryRun.log`: dry run stopped at sessionExpired | built, never run live |
| Marketplace location | host step `setLocation`; `log inspect do setLocation <zip> --live` | Location by zip | write, `--live` | `inspectSession.py` `setLocation`, `hostActors.ts` `setLocation` | inspect `20261019T131409` (cited in code, not on disk) | recorded, built; host path not verified |
| Publish a listing | `log facebook publish --listing <id> [--live] [--now]` / MCP `publish` | Create form, photos, Publish | write, `--live` | `src/marketplace/publish/machine.ts`, `python/session/publishSession.py` | `publish/readingLive3.log` (2026-10-19): Publish clicked, ended `unconfirmedId` / `noListingId` | built, not verified |
| Campaign | `log facebook campaign run --campaign <id> [--live]` / MCP `campaign` | Publish per account | write, `--live` | `src/cli/campaign/index.ts` (over publish) | none found | built, never run live |
| Scan selling | `log facebook scan --account <a>` / MCP `scan` | Read Marketplace > Selling | read | `src/camofox/worker/`, `src/cli/live/index.ts` | none in `~/.logCli` | built, never run live (here) |
| Listing status | `log facebook status <listingId> --account <a>` / MCP `status` | Read one item page | read | `src/camofox/worker/helpers/toListingStatus.ts` | none | built, never run live |
| Listing monitor | `log facebook watch --account <a> [--checks n]` / MCP `watch` | Repeated status checks | read | `src/marketplace/monitor/machine.ts` | none | built, never run live |
| Reels warm-up | `log facebook warmup reel run --account <a> [--persona] [--live] [--likes]` / MCP `warmup` | Watch, Next card, comments, like | read; like needs `--live --likes` | `src/facebook/warmup/activities/machine.ts`, `helpers/reel.ts`, `reelOrderer.ts` | inspect `20261020T050610` (record), `052708` (persona, 5 likes), `080734`, `082836` (orderer) | verified live |
| Feed warm-up | `log facebook warmup feed run --account <a> --persona [--live] [--likes]` | Posts, See more, like | read; like `--live --likes` | `src/facebook/warmup/activities/helpers/feed.ts`, `feedOrderer.ts`, `src/cli/warmup/helpers/feedRun.ts` | inspect `20261020T103516`-`105346`; `runs/join/feedPersonaRun4.log`: 11 posts, 1 liked, 0 failed steps | verified live |
| Listaro stages | `log facebook warmup stages record\|run --account <a> [--likes]` | Listaro's 5 activities | read; likes `--live` | `src/facebook/warmup/stages/machine.ts`, `helpers/scripts.ts` | `runs/warmup/erieRecord.log`: feedBrowse done, stopped in marketplaceBrowse; no saved flow | built, partly recorded |
| Join a group | `log facebook join group --account <a> --group <g> [--live]` / MCP `join` | Read the gate, press Join | write, `--live` | `src/facebook/group/join/machine.ts`, `helpers/readGroupPage.ts` | inspect `20261019T224900` (`runs/join/joinLive_20261020.log`) | verified live |
| Answer group questions | `log facebook join group … --answer [--set n=v] [--agree]`, then `--fill [--live [--submit]]` | Fill, submit questions | write, `--live --submit` | `src/facebook/group/answer/machine.ts`, `helpers/fillPlan.ts` | inspect `20261019T234232` (`fillLiveSubmit4_20261020.log`: submitted) | verified live |
| Read a group's posts | none (extractor only); recorded with `log inspect` | `GroupsCometFeedRegularStoriesPaginationQuery` + HTML | read | `src/facebook/group/read/helpers/extractPosts.ts`, `docs/groupRead.md` | inspect `20261020T134155`, `143506` (13 posts, 0 rejected) | recorded only (+ extractor) |
| Read a post's comments | none; recorded with `log inspect` | Post dialog, Newest, scroll | read (sort click was `--live`) | `src/facebook/group/read/helpers/extractComments.ts` | inspect `20261020T151100` (`readComments.log`: 15 comments) | recorded only (+ extractor) |
| Search groups | none; `log inspect do goto https://www.facebook.com/search/groups/…` | Search results page | read | none (`docs/platforms/facebook/background/SearchComet*.md`) | `runs/join/searchGroups_20261020.log` | recorded only |
| Conversations (Twenty) | `log facebook conversations`, `log facebook conversation show\|read\|lead\|link\|record --file` | Nothing: Twenty only | n/a | `src/marketplace/conversation/`, `docs/conversations.md` | n/a | built (no Facebook side) |
| Free inspect | `log inspect start --account <a> [--detach]`, `log inspect do <action> [--live]` | Any step below | per action | `src/cli/inspect/index.ts` | 22 runs, 2026-10-20 | verified live |
| Recording to flow | `log flow fromInspect <runDir> --name <n>`, `log flow run <n>` | Replays a recording | per step | `src/browser/flow/helpers/flowFromRecording.ts`, `src/cli/flow/helpers/flowSession.ts` | profileSetup only | verified live (one flow) |

## 2. Inspect step vocabulary

Live set: `LIVE_ACTIONS` in `src/browser/inspect/helpers/parseInspectAction.ts`; handlers in `python/session/inspectSession.py` `handle()`.

| Action | Args | What it does | `--live` | Used by |
|---|---|---|---|---|
| goto | url (facebook.com only) | Navigate | no | every workflow |
| snapshot | none | Accessibility snapshot, refs | no | join, answer, group read |
| back | none | Browser back | no | manual |
| wait | [s] | Sleep | no | answer |
| scroll | [times] [px] | Wheel scrolls, human motion | no | feed, stages, group read |
| scrollIn | role name [times] [px] | Wheel over one element | no | reels (comments), comments dialog |
| dwell | [a-b s] | Pause | no | reels, feed, stages |
| openAny | pattern [count] | Open N matching links, read, come back | no | stages (listings), feed |
| waitRole | role name | Wait for an element | no | flows |
| pageText | none | Body text | no | host (account check) |
| sellLocation | none | Read the create form's location | no | host |
| saveState | none | Save the session | no | host sign-in |
| nextPost | none | Scroll the next unread feed post into view, return its text | no | feed |
| closeTab | none | Close a tab a click opened | no | reels persona run |
| highlight | role name | Circle an element | no | manual |
| clickRole | role name | Click by role/name | yes | reels, join, host, flows, comments sort |
| fillRole | role name text | Type into a field | yes | profileSetup flow |
| uploadRole | role name path | File chooser upload | yes | profileSetup flow |
| clickAny | role pattern [count] | Click N random matches | yes | stages likes, reels |
| likePost | none | Like the current post | yes | feed (`--likes`) |
| postButton | name | A button in the current post (See more, Leave a comment) | yes | feed |
| setLocation | zip | Marketplace location | yes | host |
| click | ref | Click a snapshot ref | yes | answer, join, flows |
| type | ref text | Type into a ref | yes | answer |
| press | key | Key press | yes | manual |
| upload | ref path | Upload by ref | yes | flows |
| signIn / code / solve | none | Login form, two-step, text captcha | yes | host, page-state resolvers |
| stop | none | Close the session | no | all |

## 3. Gaps

### Groups (`src/facebook/group/`, rule 45)
- **Read posts:** missing flow (`src/browser/flow/definitions/groupRead.json`), machine (`src/facebook/group/read/machine.ts`, `client.ts`), Twenty cursor fields (`scripts/twenty/twentySetup.mjs`), command (`src/cli/read/index.ts`, `log facebook read group` is a proposal in `docs/groupRead.md`), MCP tool. Steps 4-7 of `docs/groupRead.md`.
- **Read comments:** extractor done; missing the same machine and command. Its queries are documented under `background/` (`CommentListComponentsRootQuery.md`), not `groups/`.
- **Reply threads:** `comment_direct_parent` is parsed (`extractComments.ts`); "View replies" expansion is not recorded.
- **Write a comment / reply:** not recorded, no flow, machine, command or MCP tool (`src/facebook/group/comment/`). Needs `--live` (rule 8).
- **React:** only feed-post Like exists (`likePost`, `CometUFIFeedbackReactMutation.md`); no group-post react, no reaction picker (`src/facebook/group/react/`).
- **Post to a group:** not recorded (`src/facebook/group/post/`).
- **Search groups:** recorded only; no extractor, machine or command (`src/facebook/group/search/`).

### Marketplace
- **Publish:** the live run ended `noListingId`; the id capture needs fixing from that run's recording (`src/marketplace/publish/machine.ts`). Not on the driver (`OPENER_ACTIONS`, `src/browser/run`), and still a launch per action (rule 35).
- **Scan, status, watch, campaign:** Camoufox-only, no runs in `~/.logCli`; no tab-in-host versions.
- **Edit, mark sold, delete, renew:** not built (rule 8 until matt asks).
- **Browse listings:** only `openAny` in stages; no reader.

### Messages
- **Read inbox / threads:** not recorded; `log facebook conversation record --file` needs a scanner that doesn't exist (`docs/conversations.md`, "Not built yet"). Would be `src/marketplace/conversation/machine.ts` plus a flow.
- **Reply to a buyer:** not built (recording, flow, machine, command, MCP tool).

### Profile
- `log facebook profile setup` never run live; the flow path is the verified one (`hostActors.ts` `setProfile`). Bio and other fields are read-only (rule 28).

### Search
- `SearchCometResults*` is documented from background traffic only (`background/`); no flow, machine or command (`src/search/`, by platform).

### Lifecycle
- Host never ran to the end (`runs/host/harrisburg*.log`); acting (publish, replies as a tab) is not built (AGENTS.md, rule 35 status).
- Stages flows (`warmupFeedBrowse` …) were never saved to `src/browser/flow/definitions/`.

## Writes on the account's own profile (recorded 2026-10-20, run 20261020T162343)

Each is a flow and an MCP tool, `--live` only (rule 8). Recorded live on Bethlehem: a text post, a comment on it, a photo post and its deletion.

| Workflow | Run it | What it sends | Status |
| --- | --- | --- | --- |
| Post text | `log flow run profilePost --account <a> --set text=… --live` (`flowProfilePost`) | `ComposerStoryCreateMutation` | recorded live, flow built, not yet run as a flow |
| Post a photo | `log flow run profilePhotoPost --account <a> --set photo=<path or URL> --live` (`flowProfilePhotoPost`) | `/ajax/react_composer/attachments/photo/upload`, then `ComposerStoryCreateMutation` | recorded live, flow built, not yet run as a flow |
| Comment on the newest own post | `log flow run postComment --account <a> --set comment=… --live` (`flowPostComment`) | `useCometUFICreateCommentMutation` (typing broadcasts around it) | recorded live, flow built, not yet run as a flow |
| Delete the newest own post | `log flow run deletePost --account <a> --live` (`flowDeletePost`; its menu is named by the account's `profileName` from Twenty) | `CometFeedStoryMenuQuery`, `useCometTrashPostMutation` (to the bin, emptied after 30 days) | recorded live, flow built, not yet run as a flow |
| Read notifications | recorded only (step 19): each notification is a link with its text and age | the list opens from the bell; closing it sends `CometNotificationsUpdateSeenStateMutation` | not a flow: the bell's name carries the unread count |

**Two accounts, one acting and one receiving:** not run yet. Every other account is on Facebook's checkpoint 1501092823525282, which ends at a video selfie after its text captcha (Reading, Allentown, Lancaster on 2026-10-20), and the 2Captcha proxies the rest use have no traffic left (`log proxy balance`). Lancaster is now on Byteful and opens; a second account needs its video selfie done by a person first.
