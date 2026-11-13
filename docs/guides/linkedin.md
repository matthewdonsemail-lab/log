# linkedin

A LinkedIn account: saving its cookies, checking its session, and posting or deleting its own posts.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 56). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## The tools in this guide

| Tool | What it does |
|---|---|
| `linkedinSessionCheck` | Check that LinkedIn still accepts one account's saved session… |
| `linkedinSessionScripts` | Read the signed-in feed page once and save the LinkedIn app's bundle… |
| `linkedinPost` | Post to the account's LinkedIn feed, with an optional image |
| `linkedinPostLive` | Post to the account's LinkedIn feed, with an optional…, live on LinkedIn |
| `linkedinDelete` | Delete one of the account's own LinkedIn posts |
| `linkedinDeleteLive` | Delete one of the account's own LinkedIn posts, live on LinkedIn |

## Every tool, in full

### `linkedinSessionCheck`

Check that LinkedIn still accepts one account's saved session, sending nothing.
Check that LinkedIn still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty
log linkedin session check --account <accountName> [--json]
Checks that LinkedIn still accepts the account's saved session, on the direct-API engine (openLinkedinApi, no browser). Sends nothing.
LinkedIn's own answer decides. The result goes to socialAccounts.sessionState, and refreshed cookies are merged back into the row.
scripts reads the signed-in /feed/ page once and saves the app's bundle URLs to ~/.logCli/linkedin/<account>/appScripts.json, for rea to read LinkedIn's own code. Sends nothing.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "linkedin" }) (A LinkedIn account: saving its cookies, checking its session, and posting or deleting its own posts).
AGENTS.md (log://agents): rules 13, 63, 64, 73, 83, 102, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `linkedinSessionScripts`

Read the signed-in feed page once and save the LinkedIn app's bundle URLs for rea, sending nothing.
Check that LinkedIn still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty
log linkedin session scripts --account <accountName> [--json]
Checks that LinkedIn still accepts the account's saved session, on the direct-API engine (openLinkedinApi, no browser). Sends nothing.
LinkedIn's own answer decides. The result goes to socialAccounts.sessionState, and refreshed cookies are merged back into the row.
scripts reads the signed-in /feed/ page once and saves the app's bundle URLs to ~/.logCli/linkedin/<account>/appScripts.json, for rea to read LinkedIn's own code. Sends nothing.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "linkedin" }) (A LinkedIn account: saving its cookies, checking its session, and posting or deleting its own posts).
AGENTS.md (log://agents): rules 13, 63, 64, 73, 83, 102, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `linkedinPost`

Post to the account's LinkedIn feed, with an optional image; a dry run unless --live.
Post to the account's LinkedIn feed, with an optional image, on the direct-API engine; a dry run unless --live
log linkedin post --account <accountName> --text "<post>" [--image <path>] [--approvedBy <who>] [--live] [--json]
Posts to the account's LinkedIn feed (anyone can see and comment), with one image if --image, on the direct-API engine (no browser), replaying the calls LinkedIn's own composer makes (ShareCompose, DispatchPostCreateWithDetour, the image upload, CreatePost), recorded from a real post.
@[Name] in the text mentions a person or page: LinkedIn's own mention search must give exactly one match with that name, and @[Name|entityID] picks one of several. The dry run looks them up (reads only) and shows each pick. After the post, the composer's own follow-up calls go out as the browser sends them (FetchSharingAfterPostNBA, addUpdateToFeedListRequest, restoreTagPills, collaboratorResetOnDiscardAction, TrackShareboxInteraction), and the calls are paced like a person typing. The app version comes from LinkedIn's own x-li-application-version answer header; without one nothing is sent (appVersionUnknown).
A dry run unless --live, which needs --approvedBy (rule 8). The image must be under OUTBOX or ~/.logCli, a JPEG, PNG or GIF of at most 20 MB. The copy is read for what AI chat interfaces leave in text first (rule 111). LinkedIn's answer decides: the new post's activityId is the post, and anything else stops the run with nothing retried (rule 94). The governor counts it as a write, 10 a day (rule 102).
Fill the named fields; each value goes through whole. What acts on LinkedIn is `linkedinPostLive`.
Before first using this tool in a session, load its guide: getGuide({ topic: "linkedin" }) (A LinkedIn account: saving its cookies, checking its session, and posting or deleting its own posts).
AGENTS.md (log://agents): rules 8, 63, 64, 73, 94, 102, 111, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `linkedinPostLive`

Post to the account's LinkedIn feed, with an optional image; a dry run unless --live.
Live on LinkedIn: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Post to the account's LinkedIn feed, with an optional image, on the direct-API engine; a dry run unless --live
log linkedin post --account <accountName> --text "<post>" [--image <path>] [--approvedBy <who>] [--live] [--json]
Posts to the account's LinkedIn feed (anyone can see and comment), with one image if --image, on the direct-API engine (no browser), replaying the calls LinkedIn's own composer makes (ShareCompose, DispatchPostCreateWithDetour, the image upload, CreatePost), recorded from a real post.
@[Name] in the text mentions a person or page: LinkedIn's own mention search must give exactly one match with that name, and @[Name|entityID] picks one of several. The dry run looks them up (reads only) and shows each pick. After the post, the composer's own follow-up calls go out as the browser sends them (FetchSharingAfterPostNBA, addUpdateToFeedListRequest, restoreTagPills, collaboratorResetOnDiscardAction, TrackShareboxInteraction), and the calls are paced like a person typing. The app version comes from LinkedIn's own x-li-application-version answer header; without one nothing is sent (appVersionUnknown).
A dry run unless --live, which needs --approvedBy (rule 8). The image must be under OUTBOX or ~/.logCli, a JPEG, PNG or GIF of at most 20 MB. The copy is read for what AI chat interfaces leave in text first (rule 111). LinkedIn's answer decides: the new post's activityId is the post, and anything else stops the run with nothing retried (rule 94). The governor counts it as a write, 10 a day (rule 102).
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "linkedin" }) (A LinkedIn account: saving its cookies, checking its session, and posting or deleting its own posts).
AGENTS.md (log://agents): rules 8, 63, 64, 73, 94, 102, 111, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `linkedinDelete`

Delete one of the account's own LinkedIn posts; a dry run unless --live.
Delete one of the account's own LinkedIn posts on the direct-API engine; a dry run unless --live
log linkedin delete --account <accountName> --activity <activityId|post url> [--approvedBy <who>] [--live] [--json]
Deletes one of the account's own LinkedIn posts by its activity id (what log linkedin post printed, or the urn:li:activity in its URL), on the direct-API engine (no browser), replaying LinkedIn's own deletePost call.
A dry run unless --live, which needs --approvedBy (rule 8). LinkedIn's answer decides; a refusal stops it with nothing retried (rule 94). The governor counts it as a write.
Fill the named fields; each value goes through whole. What acts on LinkedIn is `linkedinDeleteLive`.
Before first using this tool in a session, load its guide: getGuide({ topic: "linkedin" }) (A LinkedIn account: saving its cookies, checking its session, and posting or deleting its own posts).
AGENTS.md (log://agents): rules 8, 63, 64, 73, 94, 102, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `linkedinDeleteLive`

Delete one of the account's own LinkedIn posts; a dry run unless --live.
Live on LinkedIn: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Delete one of the account's own LinkedIn posts on the direct-API engine; a dry run unless --live
log linkedin delete --account <accountName> --activity <activityId|post url> [--approvedBy <who>] [--live] [--json]
Deletes one of the account's own LinkedIn posts by its activity id (what log linkedin post printed, or the urn:li:activity in its URL), on the direct-API engine (no browser), replaying LinkedIn's own deletePost call.
A dry run unless --live, which needs --approvedBy (rule 8). LinkedIn's answer decides; a refusal stops it with nothing retried (rule 94). The governor counts it as a write.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "linkedin" }) (A LinkedIn account: saving its cookies, checking its session, and posting or deleting its own posts).
AGENTS.md (log://agents): rules 8, 63, 64, 73, 94, 102, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From AGENTS.md (`log://agents`). The newest rules are at the bottom of AGENTS.md and win.

**Rule 8.** 2026-10-18 · Read-only on Facebook. Nothing is posted, edited or deleted unless matt asks for it.

**Rule 13.** 2026-10-18 · Twenty is the only place accounts and listings live: Facebook accounts are `socialAccounts` (platform FACEBOOK), listings are `agencyListings`. Never delete either: a banned or dead account keeps its record with its status, and its campaign listings get replacement accounts in the same country (`docs/accountsAndListings.md`). Fields are only ever added (`scripts/twenty/twentySetup.mjs`), never renamed or retyped, so the twitter-controller keeps working.

**Rule 30.** 2026-10-19 · matt: "If I tell you to do something, do it completely." When matt gives a plan, it is carried out to the end in the same turn, not stopped to ask again or to say what won't be done. `log inspect start --now` (and `log connect --now`, and since 2026-10-19 `log publish --now`, matt: "run it now") skips rule 24's 10-minute gap (the 8 a day still holds) so a recording continues at once. Recording a sign-in or a checkpoint with `log inspect` (signIn, code, solve, click) is the intended work: it is how each state gets documented from rea. The run on 2026-10-19 was interrupted once because a snapshot printed the account's email and password; snapshots now redact every typed field value (`redact_fields`), and signIn/code read only the private login.json (rule 21), so no credential reaches any output.

**Rule 38.** 2026-10-19 · matt: never mention or discuss Meta's or Facebook's rules, terms, policies, eligibility or account ownership with him unless he raises them first. Research text that does is not his, and is never repeated to him. Top of this file.

**Rule 39.** 2026-10-19 · matt: "If I never mentioned it, if I never inferred it, if I never outlined it as an option, therefore it is not an option." Deep research prompts, searches, SubQ matrices, plans and write-ups use only what matt said, or clearly meant through a misspelling. Nothing added, nothing steered towards. Top of this file.

**Rule 40.** 2026-10-19 · matt: no physical options. He is in Vietnam with no physical access. Phones, SIMs, mini PCs, laptops, phone farms and home devices are never options unless he names them. In scope: hosted and cloud options, the tools he named and their competitors, and what our four projects already use.

**Rule 41.** 2026-10-19 · matt: "any time any task correlates to money, and I never say something, that means you shouldn't do what you think. You should do what I say." Paid work (deep research, SubQ, proxies, captcha, vendors) does exactly what he asked, nothing more. Ask before anything else.

**Rule 63.** 2026-10-22 · matt: the platform comes first. Every command that acts on one platform is `log <platform> <command> …` (`log facebook warmup reel`, `log facebook join group`); there is no form without it. The poll is `log facebook poll <group> <account> <how long to poll>`. Old forms are refused with the form they became. This replaces rule 60's `log warmup <platform> <activity>` and settles issue #20. OpenMagpie's worker is `log facebook poll --request` (it was `read group --worker`), a read in the account's open browser. `bun run check:docs` refuses a usage line without the platform first. Top of this file; the table is `docs/commandNaming.md`.

**Rule 64.** 2026-10-22 · matt: the code is by platform first, as the commands are, "because each has different approaches": `src/<platform>/<area>/<domain>`. Facebook's groups are `src/facebook/group/{join,read,answer}` (were `src/group/…`, rule 45) and its warm-up `src/facebook/warmup/activities` and `src/facebook/warmup/stages` (were `src/warmup/facebook` and `src/warmup/facebookStages`, rule 49). What every platform's warm-up draws from stays shared: `src/warmup/persona`, `src/warmup/viewer`. Each area has an `index.ts` (`check:naming`). Top of this file.

**Rule 73.** 2026-10-23 · matt: "IT MUST ALWAYS READ THEM." The number one rule of the stack, above rule 30 and every other: Facebook's internal API answers are the decision-making factor of what and when something is relevant, and the deterministic factor of the system. Every browser step reads the internal API answers it triggers and the requests it sent, keeps them past the prune, and decides on them, never on a page loading, a timer or the step having run. The MCP instructions put it first. Inspect steps read theirs since rule 74, and every flow, warm-up and host step on AdsPower that makes a call since 2026-10-23; the Camoufox-only machines don't yet (#35). Top of this file.

**Rule 83.** 2026-10-25 · matt: a new platform is made with one command, written normally: `log new platform <name>` (MCP `newPlatform`). It writes the platform's account session on the shared `src/platformKit/session`, `log <name> session check` with its MCP tool, a direct-API engine in `python/<name>Api` on the shared `python/platformKit/engine.py`, and `docs/platforms/<name>/README.md`, and wires it into the repo by editing each file through its syntax tree (`PLATFORMS`, `PLATFORM_LABELS`, `COMMANDS`, `createContext`, `CommandContext`, `DIRECT_ROUTES`, `COMMAND_RULES`), checking every edit landed before anything is written. Without `--apply` it only lists what it would do; nothing is overwritten; it names what Twenty is missing (the `socialAccounts.platform` option) and never changes Twenty. Routes and rules are keyed by the platform-qualified name (`commandKey`: `read`, `twitterSession`, `redditSession`), so two platforms' commands never share one. lefthook's `platforms` (`bun run check:platforms`, pre-commit and pre-push) refuses a platform missing its label, src, command, engine, session route, rules or docs. `src/scaffold/platform`, `src/cli/new`.

**Rule 94.** 2026-10-29 · matt: "whatever you did in such quick succession lead to my account getting disabled, never do that again." Never act on an account in quick succession. What happened (matt's Discord, `sourcedandsoldtothehighestbidder`, 2026-10-29 00:47-01:00 UTC): in about 13 minutes an agent replied in 3 chats, read 1,400 messages from a server (Finn Automated) with a scratch script that went around log-cli (`.scratch/finn/dc.ts`: its own fetch to `discord.com/api/v9` with the session token, pages back to back, retrying straight through 429s), pulled the account's relationships, then opened new DMs to strangers from that server 30 s apart. Discord disabled the account. From now on: - Every call to a platform goes through log-cli's own commands and their governor. Never a hand-rolled script with an account's token or cookies. - A 429 or a failed send stops the run. It is never retried through, and the next action waits for matt. - Reading a server, group or member list in bulk is its own session. It never runs in the same session as sending. - Cold DMs to people the account has never talked to go out at most a few a day, minutes apart, never back to back. Each new DM channel opened counts as a write. - After a block, disable, captcha or cooldown, nothing resumes on that account until matt says so.

**Rule 102.** 2026-10-30 · mandeep: LinkedIn goes out looking like a browser, the way X does (rule 81). `vendor/openLinkedinApi` reaches LinkedIn only through one curl_cffi `Session` in `open_linkedin_api/transport.py`, pinned to one impersonation target (`IMPERSONATE`, `chrome150`, the closest to the Chrome its cookies come from), sending the target's own user agent, never the library's fixed one or plain `requests`. `python/checks/linkedinTransport.py` refuses anything else (`bun run check:linkedinTransport`, pre-commit and pre-push). Every LinkedIn call runs through the account's governor (`python/platformKit/engine.py`), and a LinkedIn account writes at most 10 times a day (`WRITES_PER_DAY`), not 40 (rule 91).

**Rule 111.** 2026-11-02 · matt: find GitHub repos "good for claude watermarking ... so we're able to pass it through context into the sends so that we can see how likely it is to be watermarked". Claude's own watermark is statistical (word choice under a secret key) and Anthropic's text detector is private preview, so no public repo can score it (`RESEARCH/CLAUDE_WATERMARK_REPOS_2026_11_02.md`). What can be read is what AI chat interfaces leave in text: `OfirYC/claude-watermark-checker` is vendored at `vendor/claudeArtifactDetector` (MIT, no dependencies) and every send's copy is read by it (`watermarkReadingOf`, `src/twitter/copy/watermark`): `clean`, `stylistic` (curly quotes, em dashes) or `artifacts` (zero-width or other hidden characters, odd spaces, pasted Claude HTML), with `statistical: unknown` always said. `planSend` refuses a send with artifacts (`aiArtifacts`) and carries the reading in its plan; `log voice` shows it and fails a draft with artifacts; a direct send and each queue send log it.
