# instagram

An Instagram account: its session, reading its DMs, sending text and photos, and the live realtime watch.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 56). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "instagram/dmReply" })` | Reading and answering an Instagram DM | "read my instagram dms", "what did <someone> say on instagram", "reply to <someone> on instagram", "send <someone> a meme on instagram" |

## The tools in this guide

| Tool | What it does |
|---|---|
| `instagramSessionCheck` | Check that Instagram still accepts one account's saved session… |
| `instagramDms` | An Instagram account's DM threads, or one thread's messages with… |
| `instagramSend` | Send text and a photo to an Instagram DM |
| `instagramSendLive` | Send text and a photo to an Instagram DM, live on Instagram |
| `instagramWatch` | Every Instagram DM as Instagram's realtime connection pushes it… |

## The work, step by step: instagram

From `skills/instagram/SKILL.md`.

## instagram

Instagram is worked over the MCP, on the direct-API engine (`python/instagramApi`,
vendor/instagrapi), never in the account's AdsPower browser (rule 128).

### Hard boundaries

1. **Never the browser.** Every Instagram action is an MCP tool: `instagramDms`,
   `instagramSend` / `instagramSendLive`, `instagramWatch`,
   `instagramSessionCheck`. An action the engine doesn't have yet is built on the
   engine first (rule 128).
2. **One session per account.** Every call goes through the account's one
   session host (`python/instagramApi/host.py`): one client signed in once, one
   realtime connection. Never start a second process for it. A call that can't
   reach the host is refused with `instagramSessionHostDown` (rule 129).
3. **Read them first.** Read the person's whole thread before drafting
   (`instagramDms` { with }), rule 109.
4. **Gate every draft** with `voice` { to, with, context, text } until it passes.
5. **Send once, and stop if they write.** A multi-line draft goes out one
   message per line, and the send stops the moment they write back
   (`>>> INTERRUPTED`): answer them, never resend (rules 90, 130). Any refusal
   stops the run (rule 94).
6. **Live needs matt.** `instagramSendLive` needs `approvedBy` and
   `confirmLive: true` (rule 8).

### The routine

```text
instagramSessionCheck { account }                    the session is still good
instagramDms { account }                             the threads, newest first, ● unread
instagramDms { account, with: "<handle|thread>" }    one thread, oldest first; kept for log search and the voice index
voice { to, with, context }                          how matt writes there
voice { to, with, context, text }                    gate the draft
instagramSendLive { account, with, text, approvedBy: "matt", confirmLive: true }
instagramSendLive { account, with, photo: "<file>", text, ... }   a meme goes as a photo
```

### The live side

The inbox hook keeps `log instagram watch` running for every signed-in Instagram
account. It holds Instagram's own realtime connection (MQTT to
edge-mqtt.facebook.com, the DM sync subscribed) on the session host, and every
new DM lands in `~/.logCli/inbox/pending.jsonl` and reaches the agent as
`>>> NEW INSTAGRAM MESSAGE` (rule 123). An agent following a conversation keeps a
Monitor on that file (rule 130).

### Where things are

- Commands: `src/cli/instagram/index.ts`. Session: `src/instagram/account/session`.
- Engine and host: `python/instagramApi/engine.py`, `python/instagramApi/host.py`.
- Transport: every HTTP call through curl_cffi (`check:instagramTransport`); the
  realtime MQTT socket is the one exception.
- Use cases: `docs/useCases/instagram/dmReply.md`, `newPlatform.md`.
- Spec: `docs/specs/instagram.md`. Platform page: `docs/platforms/instagram/README.md`.

## Every tool, in full

### `instagramSessionCheck`

Check that Instagram still accepts one account's saved session, sending nothing.
Check that Instagram still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty
log instagram session check --account <accountName> [--json]
Checks that Instagram still accepts the account's saved session, on the direct-API engine (instagrapi, no browser). Sends nothing.
Instagram's own answer decides. The result goes to socialAccounts.sessionState, and refreshed cookies are merged back into the row.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "instagram/dmReply" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "instagram" }) (An Instagram account: its session, reading its DMs, sending text and photos, and the live realtime watch).
AGENTS.md (log://agents): rules 13, 63, 64, 73, 83, 129, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `instagramDms`

An Instagram account's DM threads, or one thread's messages with --with, sending nothing.
Read an Instagram account's DMs: its threads, or one thread's messages with --with, on the direct-API engine, sending nothing
log instagram dms --account <accountName> [--with <handle|thread name|thread id>] [--limit <n>] [--json]
Without --with, lists the account's Instagram DM threads, newest first: who each is with, its last message and whether it is unread. With --with, reads that one thread's latest messages, oldest first.
On the direct-API engine (vendor/instagrapi, direct_threads and direct_thread, no browser). Sends nothing, and marks nothing seen.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "instagram/dmReply" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "instagram" }) (An Instagram account: its session, reading its DMs, sending text and photos, and the live realtime watch).
AGENTS.md (log://agents): rules 13, 63, 64, 73, 83, 94, 126, 129, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `instagramSend`

Send text and a photo to an Instagram DM; a dry run unless --live.
Send text and a photo to an Instagram DM, on the direct-API engine; a dry run unless --live
log instagram send --account <accountName> --with <handle|thread name|thread id> [--text "<message>"] [--photo <file>] [--asOne] [--approvedBy <who>] [--live] [--json]
Sends to an Instagram DM on the direct-API engine (vendor/instagrapi, no browser): --with is matched to one thread by handle, name or id, or to a new DM with that handle. --photo sends a picture first (direct_send_photo), then the text one message per line (rule 90), --asOne as one message.
Without --live it is a dry run and Instagram is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). Instagram's answer decides: each message comes back with its id, anything else stops the run with nothing retried (rule 94). The copy is read for what AI chat interfaces leave in text first (rule 111).
Fill the named fields; each value goes through whole. What acts on Instagram is `instagramSendLive`.
Before first using this tool in a session, load its guide: getGuide({ topic: "instagram" }) (An Instagram account: its session, reading its DMs, sending text and photos, and the live realtime watch).
AGENTS.md (log://agents): rules 8, 13, 63, 64, 73, 83, 90, 94, 111, 129, 130, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `instagramSendLive`

Send text and a photo to an Instagram DM; a dry run unless --live.
Live on Instagram: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Send text and a photo to an Instagram DM, on the direct-API engine; a dry run unless --live
log instagram send --account <accountName> --with <handle|thread name|thread id> [--text "<message>"] [--photo <file>] [--asOne] [--approvedBy <who>] [--live] [--json]
Sends to an Instagram DM on the direct-API engine (vendor/instagrapi, no browser): --with is matched to one thread by handle, name or id, or to a new DM with that handle. --photo sends a picture first (direct_send_photo), then the text one message per line (rule 90), --asOne as one message.
Without --live it is a dry run and Instagram is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). Instagram's answer decides: each message comes back with its id, anything else stops the run with nothing retried (rule 94). The copy is read for what AI chat interfaces leave in text first (rule 111).
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "instagram/dmReply" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "instagram" }) (An Instagram account: its session, reading its DMs, sending text and photos, and the live realtime watch).
AGENTS.md (log://agents): rules 8, 13, 63, 64, 73, 83, 90, 94, 111, 129, 130, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `instagramWatch`

Every Instagram DM as Instagram's realtime connection pushes it, sending nothing.
Watch an Instagram account's DMs as Instagram's realtime connection pushes them, nothing polled, sending nothing
log instagram watch --account <accountName> [--seconds <s>] [--inbox] [--json]
Opens Instagram's own realtime connection on the direct-API engine (vendor/instagrapi, MQTT to edge-mqtt.facebook.com, subscribed to the DM sync, no browser) and prints each DM the moment Instagram pushes it, nothing polled. --seconds stops after that long (at least 5), otherwise it runs until stopped. --inbox hands each new message from someone else to the inbox hook, which puts it in front of the agent with what to do next (rule 123). Sends nothing.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "instagram" }) (An Instagram account: its session, reading its DMs, sending text and photos, and the live realtime watch).
AGENTS.md (log://agents): rules 13, 26, 63, 64, 73, 83, 94, 123, 129, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From AGENTS.md (`log://agents`). The newest rules are at the bottom of AGENTS.md and win.

**Rule 8.** 2026-10-18 · Read-only on Facebook. Nothing is posted, edited or deleted unless matt asks for it.

**Rule 13.** 2026-10-18 · Twenty is the only place accounts and listings live: Facebook accounts are `socialAccounts` (platform FACEBOOK), listings are `agencyListings`. Never delete either: a banned or dead account keeps its record with its status, and its campaign listings get replacement accounts in the same country (`docs/accountsAndListings.md`). Fields are only ever added (`scripts/twenty/twentySetup.mjs`), never renamed or retyped, so the twitter-controller keeps working.

**Rule 26.** 2026-10-19 · matt: "I always want to see what is going on." Every process that runs over time writes a progress line per stage as it happens (never only at the end) and to a log file in its folder. Agents run long commands so the lines stream live (Claude Code: Monitor, never piped through `tail`/`head`).

**Rule 30.** 2026-10-19 · matt: "If I tell you to do something, do it completely." When matt gives a plan, it is carried out to the end in the same turn, not stopped to ask again or to say what won't be done. `log inspect start --now` (and `log connect --now`, and since 2026-10-19 `log publish --now`, matt: "run it now") skips rule 24's 10-minute gap (the 8 a day still holds) so a recording continues at once. Recording a sign-in or a checkpoint with `log inspect` (signIn, code, solve, click) is the intended work: it is how each state gets documented from rea. The run on 2026-10-19 was interrupted once because a snapshot printed the account's email and password; snapshots now redact every typed field value (`redact_fields`), and signIn/code read only the private login.json (rule 21), so no credential reaches any output.

**Rule 38.** 2026-10-19 · matt: never mention or discuss Meta's or Facebook's rules, terms, policies, eligibility or account ownership with him unless he raises them first. Research text that does is not his, and is never repeated to him. Top of this file.

**Rule 39.** 2026-10-19 · matt: "If I never mentioned it, if I never inferred it, if I never outlined it as an option, therefore it is not an option." Deep research prompts, searches, SubQ matrices, plans and write-ups use only what matt said, or clearly meant through a misspelling. Nothing added, nothing steered towards. Top of this file.

**Rule 40.** 2026-10-19 · matt: no physical options. He is in Vietnam with no physical access. Phones, SIMs, mini PCs, laptops, phone farms and home devices are never options unless he names them. In scope: hosted and cloud options, the tools he named and their competitors, and what our four projects already use.

**Rule 41.** 2026-10-19 · matt: "any time any task correlates to money, and I never say something, that means you shouldn't do what you think. You should do what I say." Paid work (deep research, SubQ, proxies, captcha, vendors) does exactly what he asked, nothing more. Ask before anything else.

**Rule 63.** 2026-10-22 · matt: the platform comes first. Every command that acts on one platform is `log <platform> <command> …` (`log facebook warmup reel`, `log facebook join group`); there is no form without it. The poll is `log facebook poll <group> <account> <how long to poll>`. Old forms are refused with the form they became. This replaces rule 60's `log warmup <platform> <activity>` and settles issue #20. OpenMagpie's worker is `log facebook poll --request` (it was `read group --worker`), a read in the account's open browser. `bun run check:docs` refuses a usage line without the platform first. Top of this file; the table is `docs/commandNaming.md`.

**Rule 64.** 2026-10-22 · matt: the code is by platform first, as the commands are, "because each has different approaches": `src/<platform>/<area>/<domain>`. Facebook's groups are `src/facebook/group/{join,read,answer}` (were `src/group/…`, rule 45) and its warm-up `src/facebook/warmup/activities` and `src/facebook/warmup/stages` (were `src/warmup/facebook` and `src/warmup/facebookStages`, rule 49). What every platform's warm-up draws from stays shared: `src/warmup/persona`, `src/warmup/viewer`. Each area has an `index.ts` (`check:naming`). Top of this file.

**Rule 73.** 2026-10-23 · matt: "IT MUST ALWAYS READ THEM." The number one rule of the stack, above rule 30 and every other: Facebook's internal API answers are the decision-making factor of what and when something is relevant, and the deterministic factor of the system. Every browser step reads the internal API answers it triggers and the requests it sent, keeps them past the prune, and decides on them, never on a page loading, a timer or the step having run. The MCP instructions put it first. Inspect steps read theirs since rule 74, and every flow, warm-up and host step on AdsPower that makes a call since 2026-10-23; the Camoufox-only machines don't yet (#35). Top of this file.

**Rule 83.** 2026-10-25 · matt: a new platform is made with one command, written normally: `log new platform <name>` (MCP `newPlatform`). It writes the platform's account session on the shared `src/platformKit/session`, `log <name> session check` with its MCP tool, a direct-API engine in `python/<name>Api` on the shared `python/platformKit/engine.py`, and `docs/platforms/<name>/README.md`, and wires it into the repo by editing each file through its syntax tree (`PLATFORMS`, `PLATFORM_LABELS`, `COMMANDS`, `createContext`, `CommandContext`, `DIRECT_ROUTES`, `COMMAND_RULES`), checking every edit landed before anything is written. Without `--apply` it only lists what it would do; nothing is overwritten; it names what Twenty is missing (the `socialAccounts.platform` option) and never changes Twenty. Routes and rules are keyed by the platform-qualified name (`commandKey`: `read`, `twitterSession`, `redditSession`), so two platforms' commands never share one. lefthook's `platforms` (`bun run check:platforms`, pre-commit and pre-push) refuses a platform missing its label, src, command, engine, session route, rules or docs. `src/scaffold/platform`, `src/cli/new`.

**Rule 90.** 2026-10-28 · matt: "stop sending as one." A message drafted on several lines goes out one message per line, in every chat, whatever matt's habit there (`splitPlan`, `src/voice/pairs`). Only `--asOne` sends it as one, and only when matt asks for that. A one-line draft is still split the way he writes in that chat.

**Rule 94.** 2026-10-29 · matt: "whatever you did in such quick succession lead to my account getting disabled, never do that again." Never act on an account in quick succession. What happened (matt's Discord, `sourcedandsoldtothehighestbidder`, 2026-10-29 00:47-01:00 UTC): in about 13 minutes an agent replied in 3 chats, read 1,400 messages from a server (Finn Automated) with a scratch script that went around log-cli (`.scratch/finn/dc.ts`: its own fetch to `discord.com/api/v9` with the session token, pages back to back, retrying straight through 429s), pulled the account's relationships, then opened new DMs to strangers from that server 30 s apart. Discord disabled the account. From now on: - Every call to a platform goes through log-cli's own commands and their governor. Never a hand-rolled script with an account's token or cookies. - A 429 or a failed send stops the run. It is never retried through, and the next action waits for matt. - Reading a server, group or member list in bulk is its own session. It never runs in the same session as sending. - Cold DMs to people the account has never talked to go out at most a few a day, minutes apart, never back to back. Each new DM channel opened counts as a write. - After a block, disable, captcha or cooldown, nothing resumes on that account until matt says so.

**Rule 111.** 2026-11-02 · matt: find GitHub repos "good for claude watermarking ... so we're able to pass it through context into the sends so that we can see how likely it is to be watermarked". Claude's own watermark is statistical (word choice under a secret key) and Anthropic's text detector is private preview, so no public repo can score it (`RESEARCH/CLAUDE_WATERMARK_REPOS_2026_11_02.md`). What can be read is what AI chat interfaces leave in text: `OfirYC/claude-watermark-checker` is vendored at `vendor/claudeArtifactDetector` (MIT, no dependencies) and every send's copy is read by it (`watermarkReadingOf`, `src/twitter/copy/watermark`): `clean`, `stylistic` (curly quotes, em dashes) or `artifacts` (zero-width or other hidden characters, odd spaces, pasted Claude HTML), with `statistical: unknown` always said. `planSend` refuses a send with artifacts (`aiArtifacts`) and carries the reading in its plan; `log voice` shows it and fails a draft with artifacts; a direct send and each queue send log it.

**Rule 123.** 2026-11-03 · matt: "make it a rule all platforms need the web socket hooks stuff there". Every platform log-cli talks to gets the live hooks X and Discord have. Its account's one session holds the platform's own push channel open: X Chat's socket, Discord's gateway, Slack's `wss-primary.slack.com`. That is never a poll from a second client. The inbox hook starts that watcher for every account and puts each new message, mention and reply in front of the agent with what to do (`>>> NEW MESSAGE`), per session (rules 105, 108, 115). It also stops a watcher running older code, skips an account cooling off, and stops on any refusal (rule 94). A platform isn't done until its watcher is in the inbox hook (`scripts/hooks/inbox.ts`, `src/inbox/watch`), starting with Slack. Reddit and LinkedIn aren't built yet. Spec: `docs/specs/agentHooks.md` (REQ-HOOKS-12).

**Rule 126.** 2026-11-03 · matt: every voice note he was sent or sent, transcribed with AssemblyAI, and "inside of the discord layer we have that and then the social media platforms at large, how can we detect when we have audio". Audio is detected once, in the shared message layer (`python/platformKit/media.py`, `src/platformKit/media`), never per platform: a content type of `audio/*` or `video/ogg`, an extension (`.ogg .oga .opus .m4a .mp3 .wav .aac .webm`), or the platform's own flag (Discord's voice-message flag 8192 with its duration and waveform, X Chat's audio media, Slack's `slack_audio` file). Every platform's messages keep their attachments, and an audio one adds `(audio: <name>)` to the text. Whatever is audio goes through one AssemblyAI path (`log transcribe`, MCP `transcribe`; `src/media/voiceNotes`): kept once by its file's hash in `~/.logCli/transcripts`, written into the conversation store as `(voice note: "<what was said>")` so search, voice and SubQ see it, and done as they come in `discordRead`, `twitterDms`, `slackRead` and the inbox. Files come only through the platform's own engine and session (X's one session, Discord's sound search, Slack's own transport), and any refusal stops the run (rule 94). The key is `ASSEMBLYAI_API_KEY` or `ASSEMBLY_AI_KEY` (`.env.local`, `~/.buzz/.env.local` or `~/filmcraft/.env.local`), never printed. `log new platform` writes the attachments into a new platform's message shape, and `check:platforms` refuses an engine whose messages drop them. Spec: `docs/specs/voiceNotes.md`.

**Rule 129.** 2026-11-04 · matt: "it will always be one continuous [session] so we can't have cold start stuff ... we can't open multiple python processes for this because that is going to fuck up our accounts". An Instagram account has one session, always, the way an X account does (rule 105). Every Instagram call (CLI, MCP, the inbox hook's watch) goes through the account's one session host (`python/instagramApi/host.py`, started on the first call, closed after 30 idle minutes or when the engine or instagrapi changes): one process, one instagrapi client signed in once from the saved `sessionid` and reused by every call after (`reused` in its answer), and one realtime connection to edge-mqtt.facebook.com that every watch listens on. Calls other than the watch run one at a time. A second host can't start (`host.lock`); a call that can't reach the host is refused with `instagramSessionHostDown` and sends nothing, never falling back to a session of its own. Every answer carries `instagramSession` (pid, calls, since). `LOG_INSTAGRAM_HOST=inline` runs the old way, for tests only. Spec: `docs/specs/instagram.md` (REQ-INSTAGRAM-09).

**Rule 130.** 2026-11-04 · matt: "we need to make it so we have a monitor on there that will then listen for the new info coming over via the websocket, because look, he responded halfway through ... he just asked something, it breaks the flow". On 2026-11-03 Abel wrote "is this ai" on Discord while an 8-line send was going out, and lines 6 to 8 went on top of his question. A message sent one line at a time stops the moment they write: before each line after the first, the send reads what the platform's push channel put in the inbox for that chat since the send began (`incomingSince`, `src/inbox/watch`, from `pending.jsonl`), and if they wrote, the rest is held and the answer leads with `>>> INTERRUPTED`: what they said and the lines not sent (`interruptedLines`). It holds for `log discord send`, `log slack send`, `log twitter dm` (old DMs and X Chat), the queue's dms and `log instagram send` (in its engine). What was sent stays sent, nothing is resent, and they are answered first (rule 109). An agent following a conversation keeps a Monitor on `~/.logCli/inbox/pending.jsonl` so each push wakes it. Spec: `docs/specs/messageSplit.md` (REQ-SPLIT-08).
