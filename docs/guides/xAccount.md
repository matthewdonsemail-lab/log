# xAccount

An X account's session: saving and checking its cookies, who follows whom, and its notifications (who liked, reposted, replied to, quoted or followed it).

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 56). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "twitter/affiliateMarketing" })` | Affiliate marketing through your DMs | see the page |
| `getGuide({ useCase: "twitter/engagementReplies" })` | Answering the people who engaged with your posts | see the page |
| `getGuide({ useCase: "twitter/engagerDms" })` | DMing the people who liked or reposted your post | see the page |
| `getGuide({ useCase: "twitter/followers" })` | Checking who really follows you | see the page |
| `getGuide({ useCase: "twitter/getTheAction" })` | Getting people to do the thing: retweet, like, try it | "get me all them people who liked it ... yo cool to see that you liked that, would you give that a wee retweet", "notifications: people who like, comment, reply", "go through all the people there who need a message", "get them to retweet the thing", "would you do me a favour and give it a wee retweet", "I need them to retweet it so I can get some inbound leads", "I don't know what they're even talking about, explain the context", "make them do the action I need", "get the full context of everything on the account at the time of sending the message". |
| `getGuide({ useCase: "twitter/notifications" })` | Seeing who engaged with your posts | see the page |
| `getGuide({ useCase: "twitter/recruiting" })` | Recruiting on X with a reply queue | see the page |
| `getGuide({ useCase: "twitter/topicReplies" })` | Replying to everyone posting about one topic | see the page |

## The tools in this guide

| Tool | What it does |
|---|---|
| `twitterSessionCheck` | Check that X still accepts one account's saved session, sending… |
| `twitterFollows` | Read whether each handle follows the account and the account follows… |
| `twitterFollowers` | Read an X account's own followers, newest first, sending nothing |
| `twitterNotifications` | Read who liked, reposted, replied to, quoted or followed an X… |

## Every tool, in full

### `twitterSessionCheck`

Check that X still accepts one account's saved session, sending nothing.
Check that X still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty
log twitter session check --account <accountName> [--json]
Checks that X still accepts the account's saved session, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Sends nothing.
X's own answer decides: the session check's HTTP status (401 or 403 loggedOut, 200 or 404 loggedIn), then the account's profile read (suspended or locked: restricted). The result goes to socialAccounts.sessionState, and X's refreshed cookies are merged back into the row.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/affiliateMarketing" }), getGuide({ useCase: "twitter/engagementReplies" }), getGuide({ useCase: "twitter/engagerDms" }), getGuide({ useCase: "twitter/followers" }), getGuide({ useCase: "twitter/notifications" }), getGuide({ useCase: "twitter/recruiting" }), getGuide({ useCase: "twitter/topicReplies" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xAccount" }) (An X account's session: saving and checking its cookies, who follows whom, and its notifications (who liked, reposted, replied to, quoted or followed it)).
AGENTS.md (log://agents): rules 13, 21, 26, 63, 64, 73, 80, 81, 104, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterFollows`

Read whether each handle follows the account and the account follows it, sending nothing.
Read whether handles follow an X account and it follows them, on the direct-API engine, sending nothing
log twitter follows --account <accountName> --handles <handle,handle…> [--json]
Reads, for each handle, whether it follows the account and whether the account follows it, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Sends nothing.
X's own answer decides: one friendships/show read per handle, 1.5 s apart, after the session check. Handles come from treg research or matt, never a guess (rule 53).
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/engagerDms" }), getGuide({ useCase: "twitter/followers" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xAccount" }) (An X account's session: saving and checking its cookies, who follows whom, and its notifications (who liked, reposted, replied to, quoted or followed it)).
AGENTS.md (log://agents): rules 13, 53, 63, 64, 73, 80, 81, 104, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterFollowers`

Read an X account's own followers, newest first, sending nothing.
Read an X account's own followers on the direct-API engine, sending nothing
log twitter followers --account <accountName> [--limit <n>] [--json]
Reads the account's own followers on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80), newest first: handle, name, bio, location, follower and post counts, whether they take DMs. Sends nothing.
X's own answer decides: the session check first, then X's followers list, 100 a page, 1.5 s apart. --limit is how many to read, default 200, at most 4000.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "xAccount" }) (An X account's session: saving and checking its cookies, who follows whom, and its notifications (who liked, reposted, replied to, quoted or followed it)).
AGENTS.md (log://agents): rules 13, 63, 64, 73, 80, 81, 104, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterNotifications`

Read who liked, reposted, replied to, quoted or followed an X account, new and back through its history, sending nothing.
Read who liked, reposted, replied to, quoted or followed an X account, new and historical, kept locally, sending nothing
log twitter notifications --account <accountName> [--type likes|reposts|replies|quotes|follows|all] [--since <date>] [--post <id|url>] [--full] [--pages <n>] [--stored] [--limit <n>] [--json]
Reads the account's X notifications on the direct-API engine through its one X session, the engine host (rule 105: no session of its own; no browser, no proxy, rule 80) and keeps them in ~/.logCli/twitter/<account>/notifications.json: one row per person per thing they did (like, repost, reply, quote, follow, mention), with which of the account's posts it was on and when. Sends nothing.
Without --full it reads only what is new: the newest page, then older pages until it meets rows already kept (the first run reads up to 5 pages). --full then pages back through the history from where the last --full stopped, as far as X gives, at most --pages pages a run (default 25). The read is one engine call (rule 104: one call per account at a time); its pages are 40 notifications, 4 to 11 s apart, each through the account's governor; a 429 or a governor stop ends the read and keeps what came.
--stored answers from what is kept, calling nothing. --type, --since, --post and --limit (default 50 shown, at most 5000) narrow what is shown; --json gives the rows, counts by kind and the people who engaged most.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/engagerDms" }), getGuide({ useCase: "twitter/getTheAction" }), getGuide({ useCase: "twitter/notifications" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xAccount" }) (An X account's session: saving and checking its cookies, who follows whom, and its notifications (who liked, reposted, replied to, quoted or followed it)).
AGENTS.md (log://agents): rules 13, 26, 63, 64, 73, 80, 81, 94, 104, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From AGENTS.md (`log://agents`). The newest rules are at the bottom of AGENTS.md and win.

**Rule 13.** 2026-10-18 · Twenty is the only place accounts and listings live: Facebook accounts are `socialAccounts` (platform FACEBOOK), listings are `agencyListings`. Never delete either: a banned or dead account keeps its record with its status, and its campaign listings get replacement accounts in the same country (`docs/accountsAndListings.md`). Fields are only ever added (`scripts/twenty/twentySetup.mjs`), never renamed or retyped, so the twitter-controller keeps working.

**Rule 21.** 2026-10-19 · matt asked for auto-login: `log connect --noPrompt` (always, over MCP) signs in by itself with the account's Twenty email, password and totpSecret, typing the current authenticator code on the two-step page (`python/login/autoLogin.py`). They are read only by `twenty.loginSecrets`, for that run, into the run folder's `login.json` (0600, deleted with it), and are never printed or logged. Every vendor order in `docs/vendors/*.txt` (git-ignored) is imported with all its fields by `scripts/twenty/importVendorAccounts.mjs`, which shows each field only as `<set>` or `<empty>`.

**Rule 26.** 2026-10-19 · matt: "I always want to see what is going on." Every process that runs over time writes a progress line per stage as it happens (never only at the end) and to a log file in its folder. Agents run long commands so the lines stream live (Claude Code: Monitor, never piped through `tail`/`head`).

**Rule 30.** 2026-10-19 · matt: "If I tell you to do something, do it completely." When matt gives a plan, it is carried out to the end in the same turn, not stopped to ask again or to say what won't be done. `log inspect start --now` (and `log connect --now`, and since 2026-10-19 `log publish --now`, matt: "run it now") skips rule 24's 10-minute gap (the 8 a day still holds) so a recording continues at once. Recording a sign-in or a checkpoint with `log inspect` (signIn, code, solve, click) is the intended work: it is how each state gets documented from rea. The run on 2026-10-19 was interrupted once because a snapshot printed the account's email and password; snapshots now redact every typed field value (`redact_fields`), and signIn/code read only the private login.json (rule 21), so no credential reaches any output.

**Rule 38.** 2026-10-19 · matt: never mention or discuss Meta's or Facebook's rules, terms, policies, eligibility or account ownership with him unless he raises them first. Research text that does is not his, and is never repeated to him. Top of this file.

**Rule 39.** 2026-10-19 · matt: "If I never mentioned it, if I never inferred it, if I never outlined it as an option, therefore it is not an option." Deep research prompts, searches, SubQ matrices, plans and write-ups use only what matt said, or clearly meant through a misspelling. Nothing added, nothing steered towards. Top of this file.

**Rule 40.** 2026-10-19 · matt: no physical options. He is in Vietnam with no physical access. Phones, SIMs, mini PCs, laptops, phone farms and home devices are never options unless he names them. In scope: hosted and cloud options, the tools he named and their competitors, and what our four projects already use.

**Rule 41.** 2026-10-19 · matt: "any time any task correlates to money, and I never say something, that means you shouldn't do what you think. You should do what I say." Paid work (deep research, SubQ, proxies, captcha, vendors) does exactly what he asked, nothing more. Ask before anything else.

**Rule 53.** 2026-10-20 · matt: when something has to be found (a group to join, a provider, a price, a fact), it comes from an external source, never from memory or a guess: search with TinyFish through treg (`treg call tinyfish.web.search`, `tinyfish.web.fetch`, free) as the basis for every lookup, and pull the actual candidates from it. A suggestion names where it came from (the page, the search), and a pick is one of what the search returned.

**Rule 63.** 2026-10-22 · matt: the platform comes first. Every command that acts on one platform is `log <platform> <command> …` (`log facebook warmup reel`, `log facebook join group`); there is no form without it. The poll is `log facebook poll <group> <account> <how long to poll>`. Old forms are refused with the form they became. This replaces rule 60's `log warmup <platform> <activity>` and settles issue #20. OpenMagpie's worker is `log facebook poll --request` (it was `read group --worker`), a read in the account's open browser. `bun run check:docs` refuses a usage line without the platform first. Top of this file; the table is `docs/commandNaming.md`.

**Rule 64.** 2026-10-22 · matt: the code is by platform first, as the commands are, "because each has different approaches": `src/<platform>/<area>/<domain>`. Facebook's groups are `src/facebook/group/{join,read,answer}` (were `src/group/…`, rule 45) and its warm-up `src/facebook/warmup/activities` and `src/facebook/warmup/stages` (were `src/warmup/facebook` and `src/warmup/facebookStages`, rule 49). What every platform's warm-up draws from stays shared: `src/warmup/persona`, `src/warmup/viewer`. Each area has an `index.ts` (`check:naming`). Top of this file.

**Rule 73.** 2026-10-23 · matt: "IT MUST ALWAYS READ THEM." The number one rule of the stack, above rule 30 and every other: Facebook's internal API answers are the decision-making factor of what and when something is relevant, and the deterministic factor of the system. Every browser step reads the internal API answers it triggers and the requests it sent, keeps them past the prune, and decides on them, never on a page loading, a timer or the step having run. The MCP instructions put it first. Inspect steps read theirs since rule 74, and every flow, warm-up and host step on AdsPower that makes a call since 2026-10-23; the Camoufox-only machines don't yet (#35). Top of this file.

**Rule 80.** 2026-10-25 · matt: X (Twitter) is log-cli's second platform, built around a vendored client the way Facebook's direct API is built around fbk: twikit (`vendor/twikit`, unclecode's fork) and twitter-controller (`vendor/twitterController`, the code being ported). Its commands are `log twitter <command>` (`src/twitter/<area>/<domain>`, `python/twitterApi/engine.py`), declared `directApiOnly` in `DIRECT_ROUTES`. matt: "No: X accounts call X directly as the controller does today": no proxy is required or used for an X account, and rule 12 stays Facebook's. X's own answer decides (`socialAccounts.sessionState`: loggedIn, loggedOut, restricted), each account has its own governor under `~/.logCli/twitter/<account>`, and X's refreshed cookies are merged back into the row. Discovery stays treg's (rule 53). First command: `log twitter session check`. Plan: `docs/twitterPlatform.md`.

**Rule 81.** 2026-10-25 · matt: we own `vendor/twikit` and keep it up to date ourselves, since nobody upstream maintains it. Its HTTP transport is curl_cffi, the way `vendor/fbk` does it, never httpx: `self.http` is a curl_cffi `AsyncSession` pinned to one impersonation target (`IMPERSONATE`, `safari17_0`, matching twikit's Safari user agent), redirects not followed (as httpx did), the proxy kept in the session's `proxies`, media chunks sent as a `CurlMime`. Only the transport changed. `python/checks/twikitTransport.py` finds every httpx touchpoint by syntax tree (`--map`), rewrites the ones with a curl_cffi equivalent (`--apply`) and refuses any left (`--check`, `bun run check:twikitTransport`, pre-commit and pre-push); `vendor/twikit/tests/test_transport.py` holds the behaviour.

**Rule 94.** 2026-10-29 · matt: "whatever you did in such quick succession lead to my account getting disabled, never do that again." Never act on an account in quick succession. What happened (matt's Discord, `sourcedandsoldtothehighestbidder`, 2026-10-29 00:47-01:00 UTC): in about 13 minutes an agent replied in 3 chats, read 1,400 messages from a server (Finn Automated) with a scratch script that went around log-cli (`.scratch/finn/dc.ts`: its own fetch to `discord.com/api/v9` with the session token, pages back to back, retrying straight through 429s), pulled the account's relationships, then opened new DMs to strangers from that server 30 s apart. Discord disabled the account. From now on: - Every call to a platform goes through log-cli's own commands and their governor. Never a hand-rolled script with an account's token or cookies. - A 429 or a failed send stops the run. It is never retried through, and the next action waits for matt. - Reading a server, group or member list in bulk is its own session. It never runs in the same session as sending. - Cold DMs to people the account has never talked to go out at most a few a day, minutes apart, never back to back. Each new DM channel opened counts as a write. - After a block, disable, captcha or cooldown, nothing resumes on that account until matt says so.

**Rule 104.** 2026-11-01 · matt: "the timing stuff there i saw you hand rolled the outbound stuff when it should be queued and it has to have random intervals, but the bundle itself actually reveals more information". On 2026-11-01 matthewsoldit got a soft block, then X's 226 ("looks automated") on a reply. The live log showed 8 thread reads fired in 0.2 s by two parallel helpers while sends went out from a hand-written loop, and every `log twitter` call was a fresh client that loaded x.com's home page and its signer before acting, so a 3-line dm was 3 cold starts in 9 s. X's own web client (`sign.o` in its x-web bundle, read 2026-11-01) loads the page once and signs every call from it. From now on: more than one send goes through the queue (`log twitter queue build|plan|run`, random times), never a hand-rolled loop and never helpers reading or sending on one account in parallel. The X engine takes one call per account at a time (`engine.lock`, refused with `accountBusy` after 15 min), waits 4 to 11 s after the last call, and keeps the transaction key in `clientTransaction.json` for 3 hours (`python/twitterApi/engine.py`, `vendor/twikit` `ClientTransaction.state` and `restore`).

**Rule 105.** 2026-11-01 · matt: "we cannot be opening multiple sessions there, that defeats the core purpose of what we use this tool for ... it should always be one, and then it needs to loudly create issues". An X account has one session, always. Every X call (CLI, MCP, hooks, the queue, the X Chat watch) goes through the account's one engine host (`python/twitterApi/host.py`, started on the first call, closed after 30 idle minutes or when the engine code changes): one twikit client, one connection, one cookie jar and one transaction key, the way X's own web app keeps one page and signs every call from it (x-web `startup-dynamic`, read with rea 2026-11-01). A second host can't start (`host.lock`); a call that can't reach the host is refused with `xSessionHostDown` and sends nothing, never falls back to a session of its own. The hook's account line shows the open session (pid, since, calls). `LOG_TWITTER_HOST=inline` runs the old way, for tests only.
