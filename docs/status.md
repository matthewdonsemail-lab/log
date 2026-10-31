# What works today

This page says, for each Facebook command and step, whether it is proven live,
built but untested, failing, or not built. It was read from the code, the
tests, the "Checked" lines in `log.md` and real run folders, as of 2026-10-22.
Read it before relying on a command, or when picking what to build next.
Where another doc says more than this page, this page is right; those docs are
listed near the end.

| Mark | Means |
|---|---|
| ✅ | Built, unit-tested, and run live against real Facebook (or a real Twenty), with the date of the latest live run |
| 🟡 | Built and unit-tested, but never run live, or not since it last changed |
| 🔴 | Ran live and failed, or only partly built |
| ⬜ | Not built |

## 1. Accounts and Twenty

| Command | State | Evidence |
|---|---|---|
| `log facebook accounts` | ✅ 2026-10-22 | 11 accounts from a live Twenty |
| `log facebook account show` | ✅ 2026-10-22 | One account |
| `log facebook account status` | ✅ 2026-10-20 | Set CHECKPOINT on two accounts. The replacement path (BANNED) ran only on throwaway rows, 2026-10-18. |
| `log facebook account resetOpens` | ✅ 2026-10-20 | All 11 accounts on 10-19, one on 10-20 |
| `log facebook account resave` | 🟡 | Never run live. The host skill gives it as the recovery path. |
| `log facebook lifecycle` | ✅ 2026-10-19 | Placed all 11 accounts (Twenty only, no browser) |
| `log facebook listings` / `listing` | ✅ 2026-10-18 (throwaway rows); `listing create` 2026-10-19 | Real listings only through `create` |

## 2. Signing in and the browser

| Command or step | State | Evidence |
|---|---|---|
| `log inspect start` / `do` (AdsPower) | ✅ 2026-10-22 | Every gate, about 37 recorded runs |
| `log facebook connect` | ✅ 2026-10-19, Camoufox only | Four accounts signed in ACTIVE, one RESTRICTED. The last one signed in, but saving to Twenty hit Twenty's rate limit. **Never run on AdsPower.** |
| `log facebook doctor` | 🟡 2026-10-18, Camoufox | "All green" once. Never on AdsPower. |
| `log facebook scan` | 🔴 2026-10-18, Camoufox | Only reported a login wall for an empty session. Never scanned a real account. |
| `log facebook status` | 🟡 | Never run live |
| `log facebook watch` | 🔴 2026-10-18 | Stopped at `never_connected` / `session_expired`. Never checked a real listing. |
| `log proxy check` / `assign` / `balance` | ✅ 2026-10-22 | Byteful, for two accounts |
| `log proxy static` | 🟡 | Never run live |
| `log facebook messenger pin` and the `messengerPinCreate` flow | ✅ 2026-10-22 | The PIN is saved in Twenty (`--show` says it is set). Recorded with `log inspect`: Create PIN, `pin`, `pin` again; Facebook registered it (`VestaServerGraphQLRegisterProvider…`, 200) and the inbox opened. Made into the flow `messengerPinCreate`, which hasn't run as a flow yet. The "Enter your PIN" screen a new device would show is mapped (`messengerPinEnter`: typed from Twenty) but not recorded yet. The hook runs the flow itself when the PIN is in Twenty, and flags a person only when it isn't. |
| `log adsPower sync` / `status` | ✅ 2026-10-19 | Made 10 profiles. Two capabilities are marked not built: `syncSessions` (publish, connect and profile still launch Camoufox) and `oneMachineAtATime` (the per-account browser lock). |

## 3. The host and the account's lifecycle

| Step | State | Evidence |
|---|---|---|
| `log facebook host start` | 🔴 2026-10-19, Camoufox only | One live day on one account: signed in, passed the account check, then failed at the profile step (`/me` landed on `/profile.php`), then `opensSpent`. **Never run on AdsPower.** |
| proxying, opening, signingIn, checkingAccount | ✅ 2026-10-19 (Camoufox) | The same account |
| settingProfile | 🔴 2026-10-19 | `pageNotReached` |
| settingName | ⬜ | A placeholder that returns "ok" |
| settingLocation | 🟡 | Never run by the host (one account's location was set by hand in inspect) |
| warming | 🟡 | Never run by the host |
| host lane: opening, watching, checking | 🟡 | The host never ran its day live. Its check is now the Marketplace check below (2026-10-22), proven by hand with `log facebook check`, not yet inside a host run. |
| `log facebook check` (and the host's check) | ✅ 2026-10-22 | In the account's open browser: "You have full access to Marketplace" (profile GOOD, selling ELIGIBLE), one listing active on Selling (Twenty moved it UNDER_REVIEW → ACTIVE), seller inbox: no chats. Since 2026-10-23, each listing's clicks in the last 14 days (`listing_insights`) go to its `clicksCount`. A chat's own fields aren't mapped yet: they are kept as sent until a recording holds one. |
| **acting** (publish or reply as a tab) | ⬜ | Returns `actNotBuilt`; `host send` can't trigger it |
| overnight, cooling | 🟡 | Never reached live |
| `hostActors.ts` (every real step) | — | No unit tests of its own; the lifecycle tests use stand-ins |

## 4. Marketplace: publishing, campaigns, conversations

| Command | State | Evidence |
|---|---|---|
| `marketplaceListingPublish` flow (AdsPower) | ✅ 2026-10-22 | A listing published from the open AdsPower browser, step by step with `log inspect`, then made into the flow (15 steps). Facebook held it for review; Twenty has it UNDER_REVIEW. The flow hasn't run as a flow yet. |
| `log facebook publish --live` | ✅ 2026-10-19, Camoufox | One listing posted, held UNDER_REVIEW, after two live tries failed on the location. The zip-location fix has never run live. It still launches its own browser instead of using the account's open one. |
| `log facebook campaign fill` / `heal` / `run` / `show` | 🟡 | Never run on real accounts. `run --live` has never run on Facebook. |
| `log facebook profile setup` | 🔴 2026-10-19 | One real dry run: `sessionExpired` (checkpoint page). `--live` never ran through this command. The photos and names that are set were done through `log flow run profileSetup`. |
| profile rename | ⬜ | `renameNotBuilt` |
| `log facebook conversations` / `conversation show\|read\|lead\|link` | 🟡 Twenty only | Run against Twenty (no conversations yet) |
| `log facebook conversation record --file` | 🟡 | Fed only by a JSON file written by hand |
| **Reading the Marketplace inbox and its messages** | ⬜ | No code opens the inbox. No inspect recording of it exists. |
| **Sending a reply** | ⬜ | Only the Twenty fields exist |

## 5. Warm-up

| Activity | State | Evidence |
|---|---|---|
| `log facebook warmup feed` (record, run `--persona`) | ✅ 2026-10-20 | 33 steps, none failing, 13 posts, a like |
| `log facebook warmup reel` (record, run) | 🔴 2026-10-20 | Swipe and `openProfile` failed in some runs |
| `log facebook warmup reel run --persona` | 🔴 2026-10-20 | The latest run failed at Unmute, 0 reels. The fixes (Unmute, the profile opening in a new tab) are in the code but haven't run live. The comments-panel scroll was never recorded. |
| `log facebook warmup stages` (the five stages) | ✅ 2026-10-22 | With `--bypass`: `stages record` recorded all five in one browser (27 steps) and saved each as a flow (`warmupFeedBrowse`, `warmupMarketplaceBrowse`, `warmupCreateAccessCheck`, `warmupSellingVisit`, `warmupMessagesVisit`); `stages run` then ran the five flows in one browser, 27 of 27 steps, and closed with its reason logged. |
| save, follow, share | ⬜ | Not built |

## 6. Facebook groups

| Command | State | Evidence |
|---|---|---|
| `log facebook join group` (gate, `--live` Join) | ✅ 2026-10-20 | REQUESTED, 3 questions kept |
| `join --answer` / `--fill --live --submit` | ✅ 2026-10-19 | Submitted; Facebook answered QUESTIONNAIRE_COMPLETED |
| `log facebook read group` | ✅ 2026-10-22 for the first version | 16 posts, 8 comments. 🟡 The current version (id cursor, cursor-only saves) hasn't run live. |
| `log facebook poll` / `--request` | 🟡 | Never run live. The group-listening service's parser accepted its records' shape. |
| Acting on `socialListening` matches | ⬜ | Not built |
| The group-listening service's side (the watch, the webhook) | ⬜ | Not started |

## 7. Recording and documenting

| Command | State | Evidence |
|---|---|---|
| `log flow fromInspect` / `docs` | ✅ 2026-10-20 | 8 flows made from recordings |
| `log flow run profileSetup` | ✅ 2026-10-19 | Two accounts: done |
| `log flow run` for the other 8 flows | 🟡 | Never run as flows: groupTabs, groupHeaderMenus, groupPostComments, groupPostDialog, and the four that write (profilePost, profilePhotoPost, postComment, deletePost). They were only recorded. |
| `log facebook capture --settle` / `--docs` | ✅ 2026-10-22 | 190 requests documented |
| `log runs` / `runs prune` | ✅ 2026-10-22 | Pruned 116 analysed runs, 12.5 GB, each one's findings, steps and domains kept |
| `log facebook capture --har` | 🟡 | Never run live |
| `log errors` | ✅ 2026-10-22 | |
| `log graph`, `log launch` | 🟡 | Never run live |
| `log login` / `logout` / `whoami` | 🟡 | Only a bogus token rejected, 2026-10-18; never a full sign-in |
| MCP server and agent hooks | ✅ 2026-10-20 | MCP calls on 10-19 and 10-20; the hook reported a video selfie |

## The count

| | ✅ live | 🟡 untested live | 🔴 failed or partial | ⬜ not built |
|---|---|---|---|---|
| The 57 commands and steps above | 26 | 16 | 7 | 8 |

Under half of what is built has been proven live. Most of what is proven is
Twenty, inspect, joining and reading a group, the five warm-up stages and one
publish. Almost everything that acts on its own (the host's day, connect,
scan and watch on AdsPower, campaigns) hasn't been. Group reading counts as ✅
for its first version, though the current version hasn't run live.

## What the next work needs

These are the ⬜ rows, and the 🔴 rows that block something.

1. **Reading the Marketplace inbox and its messages.** Nothing opens it.
2. **Sending a reply.**
3. **The host acting:** publish or reply as a tab in the open browser.
4. **The host on AdsPower,** and `connect`, `doctor`, `scan`, `status`,
   `watch` and `publish` on AdsPower (`syncSessions`).
5. **The per-account browser lock** (`oneMachineAtATime`), so two callers
   can't act in one browser.
6. **Acting on `socialListening` matches.**
7. **The profile rename**, and `settingName` in the host.
8. **The Reels persona run** passing live again.
9. **Messenger's "Enter your PIN"**, when an account with a PIN meets
   Messenger on a new device (not seen yet). The Create PIN screens are
   recorded and a flow since 2026-10-22.

Done on 2026-10-22: the five warm-up stages as flows (recorded, saved, run).

## How each gap gets built

The same five steps every time. Nothing is coded before step 2.

1. **Write down what we expect** before opening anything: the page, what the
   account must do there, and what must be true after (the request that
   confirms it, what the page shows). That is the step's "must achieve".
2. **Record it with `log inspect`** in the account's open browser (AdsPower):
   goto, snapshot, and each click or type with `--live` only when asked. Every
   step keeps its snapshot, screenshot, HAR and rea's reading.
3. **Document the requests** with `log facebook capture --docs`, so every
   request the page made is in `docs/platforms/facebook/<domain>/`, with what
   it sends and reads.
4. **Turn the recording into a flow and its machine** with
   `log flow fromInspect`, then `log flow run` it once on the same account and
   read it with rea. Each step checks its "must achieve".
5. **Wrap it as a command** (`log facebook <command> …`), an MCP tool and a
   README entry, with tests from the recording. Then run it live once more and
   mark it ✅ here.

### Applied to the first gaps

| Gap | 1. What we expect | 2. What to record with `log inspect` |
|---|---|---|
| Marketplace inbox and messages | The inbox lists the account's buyer threads. Each thread shows the buyer, the listing it is about, and the messages with their times. The request that carries them is named from the recording, not guessed. | Open the Marketplace inbox, snapshot, open one thread, scroll it back, snapshot. Read-only: no `--live`. On an account that has a real buyer thread. |
| Sending a reply | Typing in a thread and pressing send makes one message appear, and Facebook answers with the request that confirms it. | The same thread with `--live` and one reply text, only when asked. |
| Host acting (a tab) | A publish or a reply opens its own tab in the host's browser, does its steps there, and closes only that tab. The host's window stays open. | A recording of a publish and of a reply, each done as a new tab in an open inspect session. |
| Acting on a `socialListening` match | For a NEW row: open the post from its link in the account that saw it, read its thread, then take the chosen action. | Open a matched post by its link and read its comments. Which action follows is decided before anything runs `--live`. |

## Where other docs say more or less than this

| Doc | What it says | Reality |
|---|---|---|
| `docs/platforms/facebook/workflows.md` | Reading a group is "extractor only", the command is "missing"; poll isn't listed | Both are built (see above) |
| `docs/groupRead.md` (top) | "not yet run live end to end" | The first version ran live on 2026-10-22 |
| `skills/lifecycle/SKILL.md` | Describes acting as working | Not built |
| `skills/host/SKILL.md`, AGENTS.md | The host "signs in by the session cookie" | It types the email and password; the cookies decide whether it is signed in |
| `skills/flow/SKILL.md` | Lists only profileSetup as a saved flow | There are 9 |
| `skills/logCli/SKILL.md` | "Read-only on Facebook, except publish --live" | Join, fill, submit, the `--live` flows and `read --live` also act |
| `docs/accountsAndListings.md`, `skills/logCli` | Campaigns as a working flow, `--live` publishes them | Never run on real accounts |
| `src/facebook/warmup/activities/helpers/feed.ts` | `nextPost`, `likePost` and `openListings` "not recorded yet" | They ran live on 2026-10-20 |
| `docs/groupListening.md:16` | `log join group` | `log facebook join group` |

## Housekeeping found on the way

- **The tests wrote into the real run folder** (about 76 test folders). Fixed
  2026-10-22: `bun test` now writes runs to a scratch folder
  (`scripts/tests/preload.ts`), and the old ones were pruned.
- **Recordings that are gone:** the 2026-10-19 host and connect capture
  folders, and `runs/flow`. Only their `.log` files remain, so those runs
  can't be read again with rea.
- **Missing unit tests:** `src/cli/host/helpers/hostActors.ts` and
  `src/warmup/viewer` have none.
