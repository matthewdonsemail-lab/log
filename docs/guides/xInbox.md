# xInbox

Reading an X account's DMs and X Chat as one inbox, synced by sequence id, and watching X Chat live.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 56). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "twitter/affiliateMarketing" })` | Affiliate marketing through your DMs | see the page |
| `getGuide({ useCase: "twitter/dmInbox" })` | Reading the DM inbox: who is waiting on you | see the page |
| `getGuide({ useCase: "twitter/engagerDms" })` | DMing the people who liked or reposted your post | see the page |
| `getGuide({ useCase: "twitter/followUps" })` | Following up in your own voice | "follow up with these, not for anything in particular, just warming up the relationship", "say it was cool to meet him", "ask him for some advice on what he's doing", "take him up on the doc he offered". |
| `getGuide({ useCase: "twitter/networkMaxing" })` | Network maxing: grow the network, the niche map | "all them people messaging me, just message them something nice, get the ball moving with the networking", "we're not even trying to get anything out of these people, network max", "throw some new people in the mixer", "network max ... look at the nicheMap", "the whole point of it is to expand our network, which is the niche map", "follow them before you cold message them, and like the tweet you send them". |
| `getGuide({ useCase: "twitter/whoNeedsYou" })` | Finding who needs something from you, or who matters | "look through my messages and find someone who clearly needs something off me", "summarise everything on my twitter, how likely is it we make money", "who's worth following up". |

## The tools in this guide

| Tool | What it does |
|---|---|
| `twitterDms` | Read an X account's direct messages, newest conversations first… |

## The work, step by step: xchatReplies

From `skills/xchatReplies/SKILL.md`.

## xchatReplies

X's own chat app never polls: it holds one socket and X pushes every message
down it (`docs/platforms/x/xchat/live.md`, issue #68). log does the same, so
replies show up the second they land and no inbox read ever hits X's 429.

### Hard boundaries

1. **Never poll the inbox to find replies.** The inbox hook keeps
   `log twitter chat watch --inbox` running per signed-in X account. Read a
   thread only to answer it.
2. **Read everything with the person first:** `log twitter dms --account
   <a> --with <handle>` (the old DM thread and X Chat are one conversation,
   rule 88).
3. **Draft from matt's guide, with his facts only.** Read
   `C:/Users/0/.buzz/GUIDES/MATT_WRITING_STYLE.md` before drafting. Lowercase,
   no commas or full stops, his words, almost never end on a question, no
   praise-then-pitch, nothing he didn't say (rules 39-41).
4. **Gate every draft:** `log voice --to <handle> --text "<draft>"
   --context "<what they said>"`. Rewrite until it says PASS.
5. **Show matt and send only when he says**, unless he has handed you the
   conversation (2026-10-28: "let the ai take over the conversation"). Then
   gate each reply and send it, and stop the moment he says it's over.

### The routine

```bash
## who wrote: the hook says it, pushed by X. To watch by hand:
log twitter chat watch --account matthewsoldit --seconds 600
## read them
log twitter dms --account matthewsoldit --with <handle>
## gate the draft
log voice --to <handle> --text "<draft>" --context "<what they said>"
## send, once matt says
log twitter dm --account matthewsoldit --userId <id> --text "<draft>" --approvedBy matt --live
```

### When it goes wrong

- `(could not open: … no matching key found …)`: the conversation's key
  wasn't primed. The watch re-reads the newest inbox page once and retries;
  if it still fails, restart the watch (it primes every key at start).
- `socket closed` / `connectFailed`: the watch takes a new token and
  reconnects on its own (2 s, doubling to 60 s).
- Nothing arriving: check `~/.logCli/inbox/twitter/<a>/watch.log` and
  `watch.pid`; delete the pid file and the next hook starts a fresh watch.
- X changed its code: re-read it with rea, the steps are in
  `docs/platforms/x/xchat/live.md`.

## Every tool, in full

### `twitterDms`

Read an X account's direct messages, newest conversations first, sending nothing.
Read an X account's direct messages and who is waiting on a reply, on the direct-API engine, sending nothing
log twitter dms --account <accountName> [--limit <n>] [--waiting] [--with <handle>] [--conversation <id>] [--full] [--json]
Reads the account's X direct messages on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Sends nothing and marks nothing read.
Without --conversation it syncs the inbox the way X's own chat app does (dm-core): the first read takes the whole X Chat inbox (GetInitialXChatPageQuery, then GetInboxPageRequestQuery pages) and the old DM inbox (dm/inbox_initial_state, then dm/inbox_timeline pages, 1.5 s apart) and keeps them in ~/.logCli/twitter/<account>/inboxSync.json with the newest event's sequence id; every read after that asks X only for what is newer (GetMessageEventsPageQuery from that sequence id, beside one dm/inbox_initial_state), unlocks the PIN and decrypts only when something is new, opening just those conversations' keys (GetInboxPageConversationDataQuery), and keeps each event once by its id. --full reads everything again. Each read saves its conversations for log search and updates the search index in the background with only the chunks that changed. It then lists the newest conversations first, one row per person (their old DM thread and X Chat thread merged): who, when, the last message from either and whether it was yours. --waiting keeps only the ones whose last message isn't yours, the people waiting on a reply, and lists apart the ones that opened your last message, by reacting to it or reading it without replying (read receipts, where the person keeps them on): so each is a follow-up to send, not a reply they're waiting on (--json: followUps). --conversation <id> reads one conversation's messages, oldest first: a legacy id (two user ids joined by a dash) through dm/conversation, an X Chat id (joined by a colon) the same way --with reads it, never the whole inbox.
--with <handle> reads everything with one person by their handle and nobody else: their user id, their legacy thread (dm/conversation) and their X Chat thread (read the way X's own chat app opens a chat, from its dm-core: GetInboxPageConversationDataQuery for that one conversation, then GetConversationPageQuery from the oldest message held, its fetchOlderMessages, up to 5 pages 1.5 s apart while X says there is more), merged into one timeline, oldest first, a message mirrored into both shown once. It never reads the whole inbox. A 429 stops the read with nothing retried, as X's app does (it retries only 5xx), and pauses the account's governor (rule 94). X Chat (encrypted DMs) is opened with the account's X Chat PIN from Twenty (`log twitter chat pin`), recovered through Juicebox by the vendored chat-xdk; without a PIN its text stays encrypted. An old DM thread (<a>-<b>) and its X Chat thread (<a>:<b>) with one person are one conversation: X shows them in the same place, and a dm sent through the old DM API shows in their X Chat too. A sent answer is delivered whichever conversation id it names: never resend it and never call it the wrong inbox. X's own answer decides: the session check first, then the inbox's answer. --limit is how many conversations (or messages) to show, default 20, at most 200.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/affiliateMarketing" }), getGuide({ useCase: "twitter/dmInbox" }), getGuide({ useCase: "twitter/engagerDms" }), getGuide({ useCase: "twitter/followUps" }), getGuide({ useCase: "twitter/networkMaxing" }), getGuide({ useCase: "twitter/whoNeedsYou" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xInbox" }) (Reading an X account's DMs and X Chat as one inbox, synced by sequence id, and watching X Chat live).
AGENTS.md (log://agents): rules 13, 63, 64, 73, 80, 81, 88, 94, 100, 104, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From AGENTS.md (`log://agents`). The newest rules are at the bottom of AGENTS.md and win.

**Rule 13.** 2026-10-18 · Twenty is the only place accounts and listings live: Facebook accounts are `socialAccounts` (platform FACEBOOK), listings are `agencyListings`. Never delete either: a banned or dead account keeps its record with its status, and its campaign listings get replacement accounts in the same country (`docs/accountsAndListings.md`). Fields are only ever added (`scripts/twenty/twentySetup.mjs`), never renamed or retyped, so the twitter-controller keeps working.

**Rule 30.** 2026-10-19 · matt: "If I tell you to do something, do it completely." When matt gives a plan, it is carried out to the end in the same turn, not stopped to ask again or to say what won't be done. `log inspect start --now` (and `log connect --now`, and since 2026-10-19 `log publish --now`, matt: "run it now") skips rule 24's 10-minute gap (the 8 a day still holds) so a recording continues at once. Recording a sign-in or a checkpoint with `log inspect` (signIn, code, solve, click) is the intended work: it is how each state gets documented from rea. The run on 2026-10-19 was interrupted once because a snapshot printed the account's email and password; snapshots now redact every typed field value (`redact_fields`), and signIn/code read only the private login.json (rule 21), so no credential reaches any output.

**Rule 38.** 2026-10-19 · matt: never mention or discuss Meta's or Facebook's rules, terms, policies, eligibility or account ownership with him unless he raises them first. Research text that does is not his, and is never repeated to him. Top of this file.

**Rule 39.** 2026-10-19 · matt: "If I never mentioned it, if I never inferred it, if I never outlined it as an option, therefore it is not an option." Deep research prompts, searches, SubQ matrices, plans and write-ups use only what matt said, or clearly meant through a misspelling. Nothing added, nothing steered towards. Top of this file.

**Rule 40.** 2026-10-19 · matt: no physical options. He is in Vietnam with no physical access. Phones, SIMs, mini PCs, laptops, phone farms and home devices are never options unless he names them. In scope: hosted and cloud options, the tools he named and their competitors, and what our four projects already use.

**Rule 41.** 2026-10-19 · matt: "any time any task correlates to money, and I never say something, that means you shouldn't do what you think. You should do what I say." Paid work (deep research, SubQ, proxies, captcha, vendors) does exactly what he asked, nothing more. Ask before anything else.

**Rule 63.** 2026-10-22 · matt: the platform comes first. Every command that acts on one platform is `log <platform> <command> …` (`log facebook warmup reel`, `log facebook join group`); there is no form without it. The poll is `log facebook poll <group> <account> <how long to poll>`. Old forms are refused with the form they became. This replaces rule 60's `log warmup <platform> <activity>` and settles issue #20. OpenMagpie's worker is `log facebook poll --request` (it was `read group --worker`), a read in the account's open browser. `bun run check:docs` refuses a usage line without the platform first. Top of this file; the table is `docs/commandNaming.md`.

**Rule 64.** 2026-10-22 · matt: the code is by platform first, as the commands are, "because each has different approaches": `src/<platform>/<area>/<domain>`. Facebook's groups are `src/facebook/group/{join,read,answer}` (were `src/group/…`, rule 45) and its warm-up `src/facebook/warmup/activities` and `src/facebook/warmup/stages` (were `src/warmup/facebook` and `src/warmup/facebookStages`, rule 49). What every platform's warm-up draws from stays shared: `src/warmup/persona`, `src/warmup/viewer`. Each area has an `index.ts` (`check:naming`). Top of this file.

**Rule 73.** 2026-10-23 · matt: "IT MUST ALWAYS READ THEM." The number one rule of the stack, above rule 30 and every other: Facebook's internal API answers are the decision-making factor of what and when something is relevant, and the deterministic factor of the system. Every browser step reads the internal API answers it triggers and the requests it sent, keeps them past the prune, and decides on them, never on a page loading, a timer or the step having run. The MCP instructions put it first. Inspect steps read theirs since rule 74, and every flow, warm-up and host step on AdsPower that makes a call since 2026-10-23; the Camoufox-only machines don't yet (#35). Top of this file.

**Rule 80.** 2026-10-25 · matt: X (Twitter) is log-cli's second platform, built around a vendored client the way Facebook's direct API is built around fbk: twikit (`vendor/twikit`, unclecode's fork) and twitter-controller (`vendor/twitterController`, the code being ported). Its commands are `log twitter <command>` (`src/twitter/<area>/<domain>`, `python/twitterApi/engine.py`), declared `directApiOnly` in `DIRECT_ROUTES`. matt: "No: X accounts call X directly as the controller does today": no proxy is required or used for an X account, and rule 12 stays Facebook's. X's own answer decides (`socialAccounts.sessionState`: loggedIn, loggedOut, restricted), each account has its own governor under `~/.logCli/twitter/<account>`, and X's refreshed cookies are merged back into the row. Discovery stays treg's (rule 53). First command: `log twitter session check`. Plan: `docs/twitterPlatform.md`.

**Rule 81.** 2026-10-25 · matt: we own `vendor/twikit` and keep it up to date ourselves, since nobody upstream maintains it. Its HTTP transport is curl_cffi, the way `vendor/fbk` does it, never httpx: `self.http` is a curl_cffi `AsyncSession` pinned to one impersonation target (`IMPERSONATE`, `safari17_0`, matching twikit's Safari user agent), redirects not followed (as httpx did), the proxy kept in the session's `proxies`, media chunks sent as a `CurlMime`. Only the transport changed. `python/checks/twikitTransport.py` finds every httpx touchpoint by syntax tree (`--map`), rewrites the ones with a curl_cffi equivalent (`--apply`) and refuses any left (`--check`, `bun run check:twikitTransport`, pre-commit and pre-push); `vendor/twikit/tests/test_transport.py` holds the behaviour.

**Rule 88.** 2026-10-26 · matt: "DONT OPEN IT IN MY CHROME WE FUCKING BUILT IT OUT BECAUSE THE vendor/twikit hasnt been updated." X Chat (encrypted DMs) is read through log only, in the same shapes as the legacy DMs, never by opening x.com in a browser. X's own encryption SDK is vendored at `vendor/chatXdk` (xdevplatform/chat-xdk v0.5.2: its Rust source and the prebuilt Python wheel, installed from there). `vendor/twikit` reads the account's keys and Juicebox token map (`GetPublicKeysQuery`), unlocks them with the account's X Chat PIN (`client.unlock_xchat`) and decrypts every conversation's events (`client.get_xchat_messages`). The PIN is saved by matt once in a masked Clack prompt, `log twitter chat pin --account <a>`, kept in Twenty (`socialAccounts.messengerPin` on the X row) and handed to the engine only in the run's private folder. `log twitter dms` fills each X Chat thread's last message, and `--with <handle>` merges a person's legacy and X Chat threads into one timeline. Nobody is answered on X without reading their X Chat side first.

**Rule 94.** 2026-10-29 · matt: "whatever you did in such quick succession lead to my account getting disabled, never do that again." Never act on an account in quick succession. What happened (matt's Discord, `sourcedandsoldtothehighestbidder`, 2026-10-29 00:47-01:00 UTC): in about 13 minutes an agent replied in 3 chats, read 1,400 messages from a server (Finn Automated) with a scratch script that went around log-cli (`.scratch/finn/dc.ts`: its own fetch to `discord.com/api/v9` with the session token, pages back to back, retrying straight through 429s), pulled the account's relationships, then opened new DMs to strangers from that server 30 s apart. Discord disabled the account. From now on: - Every call to a platform goes through log-cli's own commands and their governor. Never a hand-rolled script with an account's token or cookies. - A 429 or a failed send stops the run. It is never retried through, and the next action waits for matt. - Reading a server, group or member list in bulk is its own session. It never runs in the same session as sending. - Cold DMs to people the account has never talked to go out at most a few a day, minutes apart, never back to back. Each new DM channel opened counts as a write. - After a block, disable, captcha or cooldown, nothing resumes on that account until matt says so.

**Rule 100.** 2026-10-31 · matt: "reactions are indicators of open messages, so we can then add that as a thing we can follow up on", then "for our already opened messages". When someone's last event is a reaction to matt's message, or their read receipt is past his last message (X Chat's read-marker events, the old DM API's `last_read_event_id`), they opened it and didn't type back: it isn't a reply waiting on him, it's a follow-up to send. `log twitter dms --waiting` lists those apart (`reactedOnly`, `openedNoReply`, `followUpDue`, `src/twitter/dm/person`; `openedByThem` on each thread; `--json` gives `followUps`), and the follow-up is the network-maxing kind: about them and what they're doing, never the opener again and never the ask. `docs/useCases/twitter/networkMaxing.md` ("Everyone who reacted"), `dmInbox.md`.

**Rule 104.** 2026-11-01 · matt: "the timing stuff there i saw you hand rolled the outbound stuff when it should be queued and it has to have random intervals, but the bundle itself actually reveals more information". On 2026-11-01 matthewsoldit got a soft block, then X's 226 ("looks automated") on a reply. The live log showed 8 thread reads fired in 0.2 s by two parallel helpers while sends went out from a hand-written loop, and every `log twitter` call was a fresh client that loaded x.com's home page and its signer before acting, so a 3-line dm was 3 cold starts in 9 s. X's own web client (`sign.o` in its x-web bundle, read 2026-11-01) loads the page once and signs every call from it. From now on: more than one send goes through the queue (`log twitter queue build|plan|run`, random times), never a hand-rolled loop and never helpers reading or sending on one account in parallel. The X engine takes one call per account at a time (`engine.lock`, refused with `accountBusy` after 15 min), waits 4 to 11 s after the last call, and keeps the transaction key in `clientTransaction.json` for 3 hours (`python/twitterApi/engine.py`, `vendor/twikit` `ClientTransaction.state` and `restore`).

**Rule 105.** 2026-11-01 · matt: "we cannot be opening multiple sessions there, that defeats the core purpose of what we use this tool for ... it should always be one, and then it needs to loudly create issues". An X account has one session, always. Every X call (CLI, MCP, hooks, the queue, the X Chat watch) goes through the account's one engine host (`python/twitterApi/host.py`, started on the first call, closed after 30 idle minutes or when the engine code changes): one twikit client, one connection, one cookie jar and one transaction key, the way X's own web app keeps one page and signs every call from it (x-web `startup-dynamic`, read with rea 2026-11-01). A second host can't start (`host.lock`); a call that can't reach the host is refused with `xSessionHostDown` and sends nothing, never falls back to a session of its own. The hook's account line shows the open session (pid, since, calls). `LOG_TWITTER_HOST=inline` runs the old way, for tests only.
