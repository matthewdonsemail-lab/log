# linkedin

A LinkedIn account: saving its cookies, checking its session, posting or deleting its own posts, and inviting people LinkedIn suggests.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 55). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Current scope

This guide describes the current command implementation. Legacy storage names and deferred features in procedure text do not define the native hosted schema. Active rules 171, 172 and 175 govern the target: existing private workspace log.db, central identity/team authorization and minimal routing metadata, with no required Twenty or agency/CRM model. Preserve current execution gates while migrating legacy dependencies explicitly.

## The tools in this guide

| Tool | What it does |
|---|---|
| `linkedinSessionCheck` | Check that LinkedIn still accepts one account's saved session… |
| `linkedinSessionScripts` | Read the signed-in feed page once and save the LinkedIn app's bundle… |
| `linkedinPost` | Post to the account's LinkedIn feed, with an optional image |
| `linkedinPostLive` | Post to the account's LinkedIn feed, with an optional…, live on LinkedIn |
| `linkedinDelete` | Delete one of the account's own LinkedIn posts |
| `linkedinDeleteLive` | Delete one of the account's own LinkedIn posts, live on LinkedIn |
| `linkedinSuggestions` | List the people LinkedIn suggests on the account's My Network page |
| `linkedinConnect` | Send one connection invitation to someone LinkedIn suggests |
| `linkedinConnectLive` | Send one connection invitation to someone LinkedIn…, live on LinkedIn |

## Every tool, in full

### `linkedinSessionCheck`

Check that LinkedIn still accepts one account's saved session, sending nothing.
Check that LinkedIn still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty
log linkedin session check --account <accountName> [--json]
Checks that LinkedIn still accepts the account's saved session, on the direct-API engine (openLinkedinApi, no browser). Sends nothing.
LinkedIn's own answer decides. The result goes to socialAccounts.sessionState, and refreshed cookies are merged back into the row.
scripts reads the signed-in /feed/ page once and saves the app's bundle URLs to ~/.logCli/linkedin/<account>/appScripts.json, for rea to read LinkedIn's own code. Sends nothing.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "linkedin" }) (A LinkedIn account: saving its cookies, checking its session, posting or deleting its own posts, and inviting people LinkedIn suggests).
AGENTS.md (log://agents): rules 175, 63, 2, 73, 83, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `linkedinSessionScripts`

Read the signed-in feed page once and save the LinkedIn app's bundle URLs for rea, sending nothing.
Check that LinkedIn still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty
log linkedin session scripts --account <accountName> [--json]
Checks that LinkedIn still accepts the account's saved session, on the direct-API engine (openLinkedinApi, no browser). Sends nothing.
LinkedIn's own answer decides. The result goes to socialAccounts.sessionState, and refreshed cookies are merged back into the row.
scripts reads the signed-in /feed/ page once and saves the app's bundle URLs to ~/.logCli/linkedin/<account>/appScripts.json, for rea to read LinkedIn's own code. Sends nothing.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "linkedin" }) (A LinkedIn account: saving its cookies, checking its session, posting or deleting its own posts, and inviting people LinkedIn suggests).
AGENTS.md (log://agents): rules 175, 63, 2, 73, 83, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `linkedinPost`

Post to the account's LinkedIn feed, with an optional image; a dry run unless --live.
Post to the account's LinkedIn feed, with an optional image, on the direct-API engine; a dry run unless --live
log linkedin post --account <accountName> --text "<post>" [--image <path>] [--approvedBy <who>] [--live] [--json]
Posts to the account's LinkedIn feed (anyone can see and comment), with one image if --image, on the direct-API engine (no browser), replaying the calls LinkedIn's own composer makes (ShareCompose, DispatchPostCreateWithDetour, the image upload, CreatePost), recorded from a real post.
@[Name] in the text mentions a person or page: LinkedIn's own mention search must give exactly one match with that name, and @[Name|entityID] picks one of several. The dry run looks them up (reads only) and shows each pick. After the post, the composer's own follow-up calls go out as the browser sends them (FetchSharingAfterPostNBA, addUpdateToFeedListRequest, restoreTagPills, collaboratorResetOnDiscardAction, TrackShareboxInteraction), and the calls are paced like a person typing. The app version comes from LinkedIn's own x-li-application-version answer header; without one nothing is sent (appVersionUnknown).
A dry run unless --live, which needs --approvedBy (rule 8). The image must be under OUTBOX or ~/.logCli, a JPEG, PNG or GIF of at most 20 MB. The copy is read for what AI chat interfaces leave in text first (rule 111). LinkedIn's answer decides: the new post's activityId is the post, and anything else stops the run with nothing retried (rule 94). The governor counts it as a write, 10 a day (rule 102).
Fill the named fields; each value goes through whole. What acts on LinkedIn is `linkedinPostLive`.
Before first using this tool in a session, load its guide: getGuide({ topic: "linkedin" }) (A LinkedIn account: saving its cookies, checking its session, posting or deleting its own posts, and inviting people LinkedIn suggests).
AGENTS.md (log://agents): rules 8, 63, 2, 73, 94, 83, 137, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `linkedinPostLive`

Post to the account's LinkedIn feed, with an optional image; a dry run unless --live.
Live on LinkedIn: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Post to the account's LinkedIn feed, with an optional image, on the direct-API engine; a dry run unless --live
log linkedin post --account <accountName> --text "<post>" [--image <path>] [--approvedBy <who>] [--live] [--json]
Posts to the account's LinkedIn feed (anyone can see and comment), with one image if --image, on the direct-API engine (no browser), replaying the calls LinkedIn's own composer makes (ShareCompose, DispatchPostCreateWithDetour, the image upload, CreatePost), recorded from a real post.
@[Name] in the text mentions a person or page: LinkedIn's own mention search must give exactly one match with that name, and @[Name|entityID] picks one of several. The dry run looks them up (reads only) and shows each pick. After the post, the composer's own follow-up calls go out as the browser sends them (FetchSharingAfterPostNBA, addUpdateToFeedListRequest, restoreTagPills, collaboratorResetOnDiscardAction, TrackShareboxInteraction), and the calls are paced like a person typing. The app version comes from LinkedIn's own x-li-application-version answer header; without one nothing is sent (appVersionUnknown).
A dry run unless --live, which needs --approvedBy (rule 8). The image must be under OUTBOX or ~/.logCli, a JPEG, PNG or GIF of at most 20 MB. The copy is read for what AI chat interfaces leave in text first (rule 111). LinkedIn's answer decides: the new post's activityId is the post, and anything else stops the run with nothing retried (rule 94). The governor counts it as a write, 10 a day (rule 102).
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "linkedin" }) (A LinkedIn account: saving its cookies, checking its session, posting or deleting its own posts, and inviting people LinkedIn suggests).
AGENTS.md (log://agents): rules 8, 63, 2, 73, 94, 83, 137, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `linkedinDelete`

Delete one of the account's own LinkedIn posts; a dry run unless --live.
Delete one of the account's own LinkedIn posts on the direct-API engine; a dry run unless --live
log linkedin delete --account <accountName> --activity <activityId|post url> [--approvedBy <who>] [--live] [--json]
Deletes one of the account's own LinkedIn posts by its activity id (what log linkedin post printed, or the urn:li:activity in its URL), on the direct-API engine (no browser), replaying LinkedIn's own deletePost call.
A dry run unless --live, which needs --approvedBy (rule 8). LinkedIn's answer decides; a refusal stops it with nothing retried (rule 94). The governor counts it as a write.
Fill the named fields; each value goes through whole. What acts on LinkedIn is `linkedinDeleteLive`.
Before first using this tool in a session, load its guide: getGuide({ topic: "linkedin" }) (A LinkedIn account: saving its cookies, checking its session, posting or deleting its own posts, and inviting people LinkedIn suggests).
AGENTS.md (log://agents): rules 8, 63, 2, 73, 94, 83, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `linkedinDeleteLive`

Delete one of the account's own LinkedIn posts; a dry run unless --live.
Live on LinkedIn: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Delete one of the account's own LinkedIn posts on the direct-API engine; a dry run unless --live
log linkedin delete --account <accountName> --activity <activityId|post url> [--approvedBy <who>] [--live] [--json]
Deletes one of the account's own LinkedIn posts by its activity id (what log linkedin post printed, or the urn:li:activity in its URL), on the direct-API engine (no browser), replaying LinkedIn's own deletePost call.
A dry run unless --live, which needs --approvedBy (rule 8). LinkedIn's answer decides; a refusal stops it with nothing retried (rule 94). The governor counts it as a write.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "linkedin" }) (A LinkedIn account: saving its cookies, checking its session, posting or deleting its own posts, and inviting people LinkedIn suggests).
AGENTS.md (log://agents): rules 8, 63, 2, 73, 94, 83, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `linkedinSuggestions`

List the people LinkedIn suggests on the account's My Network page.
List the people LinkedIn suggests on the account's My Network page, on the direct-API engine
log linkedin suggestions --account <accountName> [--json]
Lists the people LinkedIn suggests on the account's My Network page, on the direct-API engine (no browser): the feed, then My Network the way the browser opens it (the MyNetwork navigation, then its own mojoTabsBadge, addaMarkNotificationsSeen and addaClearUnseenInvitationsMutation), recorded from a real visit. Each suggestion's public id is what log linkedin connect --profile takes.
Reads only: nothing is sent to anyone. Opening My Network marks its notifications seen, as the browser does.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "linkedin" }) (A LinkedIn account: saving its cookies, checking its session, posting or deleting its own posts, and inviting people LinkedIn suggests).
AGENTS.md (log://agents): rules 63, 2, 73, 94, 83, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `linkedinConnect`

Send one connection invitation to someone LinkedIn suggests; a dry run unless --live.
Send one connection invitation to someone LinkedIn suggests, on the direct-API engine; a dry run unless --live
log linkedin connect --account <accountName> --profile <publicId|profile url> [--approvedBy <who>] [--live] [--json]
Sends one connection invitation, without a note, to a person LinkedIn suggests on the account's My Network page, on the direct-API engine (no browser): My Network is opened as log linkedin suggestions opens it, and the invitation is the request that person's own Connect button carries (addaAddConnection), sent as the browser sent it. Someone not among the suggestions is refused (profileNotSuggested), since a profile page's Connect hasn't been recorded yet.
A dry run unless --live, which needs --approvedBy (rule 8); the dry run only says whether the person is suggested. One invitation a run, at least 15 minutes apart and at most 5 in 24 hours (connectTooSoon, connectDailyCap): in a recorded session LinkedIn refused every connect sent within seconds of another, then ended the session (rule 94). LinkedIn's answer decides: the invitation is sent only when it sets it to Pending; its "invitation not sent" stops the run with nothing retried. The governor counts it as a write, 10 a day (rule 102).
Fill the named fields; each value goes through whole. What acts on LinkedIn is `linkedinConnectLive`.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "linkedin" }) (A LinkedIn account: saving its cookies, checking its session, posting or deleting its own posts, and inviting people LinkedIn suggests).
AGENTS.md (log://agents): rules 8, 63, 2, 73, 94, 83, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `linkedinConnectLive`

Send one connection invitation to someone LinkedIn suggests; a dry run unless --live.
Live on LinkedIn: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Send one connection invitation to someone LinkedIn suggests, on the direct-API engine; a dry run unless --live
log linkedin connect --account <accountName> --profile <publicId|profile url> [--approvedBy <who>] [--live] [--json]
Sends one connection invitation, without a note, to a person LinkedIn suggests on the account's My Network page, on the direct-API engine (no browser): My Network is opened as log linkedin suggestions opens it, and the invitation is the request that person's own Connect button carries (addaAddConnection), sent as the browser sent it. Someone not among the suggestions is refused (profileNotSuggested), since a profile page's Connect hasn't been recorded yet.
A dry run unless --live, which needs --approvedBy (rule 8); the dry run only says whether the person is suggested. One invitation a run, at least 15 minutes apart and at most 5 in 24 hours (connectTooSoon, connectDailyCap): in a recorded session LinkedIn refused every connect sent within seconds of another, then ended the session (rule 94). LinkedIn's answer decides: the invitation is sent only when it sets it to Pending; its "invitation not sent" stops the run with nothing retried. The governor counts it as a write, 10 a day (rule 102).
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "linkedin" }) (A LinkedIn account: saving its cookies, checking its session, posting or deleting its own posts, and inviting people LinkedIn suggests).
AGENTS.md (log://agents): rules 8, 63, 2, 73, 94, 83, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From the current AGENTS.md (`log://agents`). Historical citations are consolidated; archived instructions do not override the active scope.

**Rule 2.** 2026-10-18 · Put platform code under src/<platform>/<area>/<domain>; shared code stays in its shared library/domain. Use index.ts, types.ts, client.ts, machine.ts and helpers where appropriate. Keep scripts and Python in domain folders.

**Rule 8.** 2026-10-18 · Platform actions require the user authorization their tool defines. Send, post, react, join, edit and delete only when authorized; preserve explicit live confirmation, governor and account gates. Ordinary reads do not need new approval.

**Rule 30.** 2026-10-19 · Complete the authorized task. Do not repeatedly request confirmation already given. Distinguish implemented behavior, proposed contracts and unverified assumptions.

**Rule 38.** 2026-10-19 · Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless Matt raises them.

**Rule 39.** 2026-10-19 · Use only the scope, options and intent Matt stated or implied. Do not add unrelated alternatives to research, comparisons, plans or implementation.

**Rule 40.** 2026-10-19 · Do not propose physical infrastructure unless Matt asks. His available implementation scope is hosted/cloud environments and the tools already selected.

**Rule 41.** 2026-10-19 · Paid work must stay within the authorized task and spend. Ask before adding a paid operation he did not authorize; do not substitute a new paid provider implicitly.

**Rule 63.** 2026-10-22 · Platform commands are log <platform> <command> <what>. Shared commands remain shared. Preserve the naming boundary described in docs/commandNaming.md.

**Rule 73.** 2026-10-23 · For an unknown platform state, collate the goal, account/runtime, action, sent requests, answers, timing and page evidence. Use the existing REA/SubQ reading workflow when applicable, report the unknown state, write Point/Evidence/Explain and the fix, then name the state. Preserve paid-work scope. This runtime analysis does not add SubQ to commit/CI gates.

**Rule 83.** 2026-10-25 · New platforms use the existing scaffold, shared account/session boundary, command/catalog wiring, platform documentation and spec anchors. Native hosted scaffolds must not recreate a Twenty dependency.

**Rule 94.** 2026-10-29 · Every platform call goes through Log and its governor, never a scratch client with account tokens/cookies. A refusal, failed send, 429, block, disable, captcha or cooldown stops that run/account until Matt authorizes continuation. Do not retry through refusals. Bulk reading and sending are separate sessions; cold DMs stay a few a day, minutes apart, and opening a DM counts as a write.

**Rule 137.** 2026-11-04 · Preserve current context-aware voice and AI-artifact gates for messages sent as Matt. Rework refused drafts from the stated cause. Exact-message overrides and dictated/translated voice-note exceptions require Matt's request and preserve remaining artifact checks. Do not treat an exception as permanent permission.

**Rule 175.** 2026-11-11 · Use existing log.db and platform-agnostic engine contracts for native schemas. Do not copy Twenty agency prefixes or CRM/SMS structures. Old listing/campaign functionality is deferred. Add only missing account/credential and hosted execution contracts; preserve existing identity, message, queue, job and governor authorities.
