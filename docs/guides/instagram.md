# instagram

An Instagram account: its session, reading its DMs, sending text and photos, and the live realtime watch.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 56). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "inbox/reactions" })` | Reacting to a message | "react to that", "heart his message", "put a 😂 on what she said", "send a reaction to <person>" |
| `getGuide({ useCase: "inbox/voiceNote" })` | Sending a voice note | "send <person> a voice note saying …", "voice note him that …", "send a vn to the group saying …" |
| `getGuide({ useCase: "instagram/dmReply" })` | Reading and answering an Instagram DM | "read my instagram dms", "what did <someone> say on instagram", "reply to <someone> on instagram", "send <someone> a meme on instagram" |

## The tools in this guide

| Tool | What it does |
|---|---|
| `instagramSessionCheck` | Check that Instagram still accepts one account's saved session… |
| `instagramDms` | An Instagram account's DM threads, or one thread's messages with… |
| `instagramSend` | Send text and a photo to an Instagram DM |
| `instagramSendLive` | Send text and a photo to an Instagram DM, live on Instagram |
| `instagramWatch` | Every Instagram DM as Instagram's realtime connection pushes it… |
| `instagramReact` | React to a Instagram message with an emoji, on the direct-API engine |
| `instagramReactLive` | React to a Instagram message with an emoji, on the…, live on Instagram |
| `instagramVoice` | Send a voice note in matt's cloned voice as Instagram's own voice… |
| `instagramVoiceLive` | Send a voice note in matt's cloned voice as…, live on Instagram |

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
3. **Claim the chat before drafting** with `inboxClaim` (rule 133); a chat
   another session holds is left to it, and the send releases the claim.
4. **Read them first.** Read the person's whole thread before drafting
   (`instagramDms` { with }), rule 109.
5. **Gate every draft** with `voice` { to, with, context, text } until it passes.
6. **Send once, and stop if they write.** A multi-line draft goes out one
   message per line, and the send stops the moment they write back
   (`>>> INTERRUPTED`): answer them, never resend (rules 90, 130). Any refusal
   stops the run (rule 94).
7. **Live needs matt.** `instagramSendLive` needs `approvedBy` and
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
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/reactions" }), getGuide({ useCase: "inbox/voiceNote" }), getGuide({ useCase: "instagram/dmReply" }).
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
AGENTS.md (log://agents): rules 8, 13, 63, 64, 73, 83, 90, 94, 111, 129, 130, 133, 135, 137, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

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
AGENTS.md (log://agents): rules 8, 13, 63, 64, 73, 83, 90, 94, 111, 129, 130, 133, 135, 137, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `instagramWatch`

Every Instagram DM as Instagram's realtime connection pushes it, sending nothing.
Watch an Instagram account's DMs as Instagram's realtime connection pushes them, nothing polled, sending nothing
log instagram watch --account <accountName> [--seconds <s>] [--inbox] [--json]
Opens Instagram's own realtime connection on the direct-API engine (vendor/instagrapi, MQTT to edge-mqtt.facebook.com, subscribed to the DM sync, no browser) and prints each DM the moment Instagram pushes it, nothing polled. --seconds stops after that long (at least 5), otherwise it runs until stopped. --inbox hands each new message from someone else to the inbox hook, which puts it in front of the agent with what to do next (rule 123). Sends nothing.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "instagram" }) (An Instagram account: its session, reading its DMs, sending text and photos, and the live realtime watch).
AGENTS.md (log://agents): rules 13, 26, 63, 64, 73, 83, 94, 123, 129, 131, 132, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `instagramReact`

React to a Instagram message with an emoji, on the direct-API engine; a dry run unless --live.
React to a Instagram message with an emoji, on the direct-API engine; a dry run unless --live
log instagram react --account <accountName> --thread <thread> --message <id> --emoji <emoji> [--remove] [--approvedBy <who>] [--live] [--json]
Reacts to one message with an emoji, on the direct-API engine (vendor/instagrapi, no browser), or takes the account's own reaction off with --remove. Instagram takes any emoji; a name (joy, fire, heart) is turned into it. It goes through instagrapi's direct_send_reaction (direct_delete_reaction with --remove) in the account's one session (rule 129).
Without --live it is a dry run and nothing is contacted. --live reacts, only when matt asked, and needs --approvedBy (rule 8). The chat is claimed first, as for a send, and released once it is done (rule 133). The platform's own answer decides (rule 73), the governor counts it as a write, and a refusal stops with nothing retried (rule 94).
Fill the named fields; each value goes through whole. What acts on Instagram is `instagramReactLive`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/reactions" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "instagram" }) (An Instagram account: its session, reading its DMs, sending text and photos, and the live realtime watch).
AGENTS.md (log://agents): rules 8, 13, 63, 64, 73, 83, 94, 128, 129, 133, 140, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `instagramReactLive`

React to a Instagram message with an emoji, on the direct-API engine; a dry run unless --live.
Live on Instagram: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
React to a Instagram message with an emoji, on the direct-API engine; a dry run unless --live
log instagram react --account <accountName> --thread <thread> --message <id> --emoji <emoji> [--remove] [--approvedBy <who>] [--live] [--json]
Reacts to one message with an emoji, on the direct-API engine (vendor/instagrapi, no browser), or takes the account's own reaction off with --remove. Instagram takes any emoji; a name (joy, fire, heart) is turned into it. It goes through instagrapi's direct_send_reaction (direct_delete_reaction with --remove) in the account's one session (rule 129).
Without --live it is a dry run and nothing is contacted. --live reacts, only when matt asked, and needs --approvedBy (rule 8). The chat is claimed first, as for a send, and released once it is done (rule 133). The platform's own answer decides (rule 73), the governor counts it as a write, and a refusal stops with nothing retried (rule 94).
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/reactions" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "instagram" }) (An Instagram account: its session, reading its DMs, sending text and photos, and the live realtime watch).
AGENTS.md (log://agents): rules 8, 13, 63, 64, 73, 83, 94, 128, 129, 133, 140, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `instagramVoice`

Send a voice note in matt's cloned voice as Instagram's own voice note, from text; a dry run unless --live.
Send a voice note in matt's cloned voice as Instagram's own voice note, from text; a dry run unless --live
log instagram voice --account <accountName> --with <with> --text "<what matt says>" [--provider inworld|fishAudio] [--mattsWords] [--approvedBy <who>] [--live] [--json]
Sends a voice note in matt's cloned voice (the voice provider, log clone voice) as instagram's own voice note: a voice clip (instagrapi's direct_send_voice: the audio uploaded to rupload.facebook.com/messenger_audio, then sent as a voice_attachment with its waveform). It takes text only, never an audio file: the words are said in his voice, converted with ffmpeg to AAC in .m4a and uploaded on the direct-API engine through the account's one session (vendor/instagrapi, in the account's one session, no browser).
A voice note goes out only when matt asks for one (rule 142). The provider is --provider, else LOG_VOICE_PROVIDER, else inworld; the command only ever calls the shared voice layer (rule 143). Without --live it is a dry run: nothing is generated and nothing is contacted. --live needs --approvedBy (rule 8). It waits for the account to catch up (rule 135), runs the text through the voice gate every send runs (rule 137), generates and converts it, claims the chat (rule 133) and releases it after. The governor counts it as a write, the platform's answer decides (rule 73), and a refusal stops with nothing retried (rule 94).
--mattsWords says the text is matt's own words, dictated by him for this voice note: the voice gate's read is skipped, since it grades speech as typed text and as a reply, while the AI artifact check still runs and refuses aiArtifacts (rule 144).
Fill the named fields; each value goes through whole. What acts on Instagram is `instagramVoiceLive`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/voiceNote" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "instagram" }) (An Instagram account: its session, reading its DMs, sending text and photos, and the live realtime watch).
AGENTS.md (log://agents): rules 8, 13, 63, 64, 73, 83, 94, 128, 129, 133, 135, 137, 142, 143, 144, 145, 146, 147, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `instagramVoiceLive`

Send a voice note in matt's cloned voice as Instagram's own voice note, from text; a dry run unless --live.
Live on Instagram: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Send a voice note in matt's cloned voice as Instagram's own voice note, from text; a dry run unless --live
log instagram voice --account <accountName> --with <with> --text "<what matt says>" [--provider inworld|fishAudio] [--mattsWords] [--approvedBy <who>] [--live] [--json]
Sends a voice note in matt's cloned voice (the voice provider, log clone voice) as instagram's own voice note: a voice clip (instagrapi's direct_send_voice: the audio uploaded to rupload.facebook.com/messenger_audio, then sent as a voice_attachment with its waveform). It takes text only, never an audio file: the words are said in his voice, converted with ffmpeg to AAC in .m4a and uploaded on the direct-API engine through the account's one session (vendor/instagrapi, in the account's one session, no browser).
A voice note goes out only when matt asks for one (rule 142). The provider is --provider, else LOG_VOICE_PROVIDER, else inworld; the command only ever calls the shared voice layer (rule 143). Without --live it is a dry run: nothing is generated and nothing is contacted. --live needs --approvedBy (rule 8). It waits for the account to catch up (rule 135), runs the text through the voice gate every send runs (rule 137), generates and converts it, claims the chat (rule 133) and releases it after. The governor counts it as a write, the platform's answer decides (rule 73), and a refusal stops with nothing retried (rule 94).
--mattsWords says the text is matt's own words, dictated by him for this voice note: the voice gate's read is skipped, since it grades speech as typed text and as a reply, while the AI artifact check still runs and refuses aiArtifacts (rule 144).
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/voiceNote" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "instagram" }) (An Instagram account: its session, reading its DMs, sending text and photos, and the live realtime watch).
AGENTS.md (log://agents): rules 8, 13, 63, 64, 73, 83, 94, 128, 129, 133, 135, 137, 142, 143, 144, 145, 146, 147, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

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

**Rule 128.** 2026-11-04 · matt: "you're not meant to open up the browser", after a meme went to someone on Instagram through the account's AdsPower browser. Instagram is worked through the direct-API engine on vendor/instagrapi, over the MCP, and the browser is never used for an Instagram action: `log instagram dms` reads the threads or one thread, `log instagram send` sends text and photos (a meme goes as `--photo`, a dry run unless `--live` with `--approvedBy`), and `log instagram watch` holds Instagram's own realtime connection (MQTT to edge-mqtt.facebook.com, the DM sync subscribed), which the inbox hook starts for every signed-in Instagram account so each new DM reaches the agent (`>>> NEW INSTAGRAM MESSAGE`, rule 123). An action the engine doesn't have yet is built on it, never done in the browser. Every HTTP call goes through curl_cffi: instagrapi's private and public transports are both set to curl (`curl-adapter` for the public one), and `check:instagramTransport` (pre-commit and pre-push) refuses anything else; the realtime MQTT socket isn't HTTP and is the one exception. Spec: `docs/specs/instagram.md` (REQ-INSTAGRAM-05 to 08).

**Rule 129.** 2026-11-04 · matt: "it will always be one continuous [session] so we can't have cold start stuff ... we can't open multiple python processes for this because that is going to fuck up our accounts". An Instagram account has one session, always, the way an X account does (rule 105). Every Instagram call (CLI, MCP, the inbox hook's watch) goes through the account's one session host (`python/instagramApi/host.py`, started on the first call, closed after 30 idle minutes or when the engine or instagrapi changes): one process, one instagrapi client signed in once from the saved `sessionid` and reused by every call after (`reused` in its answer), and one realtime connection to edge-mqtt.facebook.com that every watch listens on. Calls other than the watch run one at a time. A second host can't start (`host.lock`); a call that can't reach the host is refused with `instagramSessionHostDown` and sends nothing, never falling back to a session of its own. Every answer carries `instagramSession` (pid, calls, since). `LOG_INSTAGRAM_HOST=inline` runs the old way, for tests only. Spec: `docs/specs/instagram.md` (REQ-INSTAGRAM-09).

**Rule 130.** 2026-11-04 · matt: "we need to make it so we have a monitor on there that will then listen for the new info coming over via the websocket, because look, he responded halfway through ... he just asked something, it breaks the flow". On 2026-11-03 Abel wrote "is this ai" on Discord while an 8-line send was going out, and lines 6 to 8 went on top of his question. A message sent one line at a time stops the moment they write: before each line after the first, the send reads what the platform's push channel put in the inbox for that chat since the send began (`incomingSince`, `src/inbox/watch`, from `pending.jsonl`), and if they wrote, the rest is held and the answer leads with `>>> INTERRUPTED`: what they said and the lines not sent (`interruptedLines`). It holds for `log discord send`, `log slack send`, `log twitter dm` (old DMs and X Chat), the queue's dms and `log instagram send` (in its engine). What was sent stays sent, nothing is resent, and they are answered first (rule 109). An agent following a conversation keeps a Monitor on `~/.logCli/inbox/pending.jsonl` so each push wakes it. Spec: `docs/specs/messageSplit.md` (REQ-SPLIT-08).

**Rule 131.** 2026-11-04 · matt: "WE NEED TO LOUDLY ALERT THAT THIS CANNOT HAPPEN ... WE CAN ONLY HAVE ONE PROCESS PER ACTUAL THING". On 2026-11-04 every watcher was running two or three times (X Chat for both X accounts, Discord and Slack): each new Claude session's hook started them again, the cleanup only killed the pid in `watch.pid`, which the new one had overwritten, and the doubled X watchers polled X's badge counts in bunches until X answered 429 on both accounts. One watcher process per account per platform, always, and every Claude session subscribes to it through the inbox (`pending.jsonl`), never by starting its own. Each watcher takes `watch.lock` (exclusive create, its pid) before it opens anything (`claimWatcher`, `src/inbox/watch`); a second one is refused with `watcherAlreadyRunning` and exits, and the refusal goes to `~/.logCli/inbox/alerts.jsonl`, which the inbox hook puts first in the agent's context (`>>> ONE PROCESS PER ACCOUNT, NEVER TWO`) to be told to matt. A dead holder's lock is taken over, only the holder releases it, the hook never starts a watcher while a live one holds the lock, and the stale-code cleanup stops the holder as well as the pid file's process. Tests run the Instagram engine inline (`LOG_INSTAGRAM_HOST=inline` in the preload) so they never leave a real session host behind. Spec: `docs/specs/agentHooks.md` (REQ-HOOKS-13).

**Rule 132.** 2026-11-04 · matt: "this is what I expect to happen with all platforms": a singleton primary with an exclusive lock and a multi-subscriber relay. On every platform (X Chat, Discord, Slack, Instagram) the first watch to take an account's `watch.lock` is its one owner (`ownOrAttach`, `src/inbox/relay`): it opens the platform's push connection, writes `session.json` (pid, hostname, started, a heartbeat every 5 s, status connecting, streaming, reconnecting or error, its relay port and token, and how many are attached), writes the inbox (`pending.jsonl`) as its only writer, and sends every event to every attached subscriber over its local relay (127.0.0.1, the token first). `log <platform> watch` is the attach command: when an owner is live, a watch attaches to its relay and streams the same events without opening anything, so the hooks, a Monitor, Codex or another agent all see one stream; an inbox watch (`--inbox`) that loses is refused loudly (rule 131). An owner whose heartbeat is quiet for 60 s is stopped and alerted (`>>> ONE PROCESS PER ACCOUNT`, `hungOwner`), and the next start becomes the owner; when the owner closes, its session file goes with it. Spec: `docs/specs/agentHooks.md` (REQ-HOOKS-14).

**Rule 133.** 2026-11-04 · matt, to deepman: "whenever the agent wants to perform an action based on the streamed event information, it must first claim the relevant event ... only the session that successfully claims an event should be allowed to perform the corresponding action. Once the action has been executed through the state machine, the lock is released ... every time an action is executed, the system should also index and persist the associated information". Every message a push channel brings in has an event id (`eventIdOf`, shown in the hook's `>>> CLAIM BEFORE YOU ACT` beside who holds its chat). A session claims a chat before it drafts (`log inbox claim`, MCP `inboxClaim`, 10 minutes, renewed by claiming again; `claimChat`, `src/inbox/claims`, an exclusive claim file per chat, the session being its MCP server's process), and a second session is refused (`chatClaimedElsewhere`). Every send (`log discord send`, `log slack send`, `log twitter dm`, the queue's dms, `log instagram send`) claims the chat itself first (`guardSend`) and releases it once it is sent, interrupted or failed, so two sessions never answer the same chat. An X chat is one chat whether it is named by the person's id or the X Chat pair. A claim held by a session that ended, or past its time, frees itself. Every claim, renewal, refusal, send, interruption, failure and release is written to `~/.logCli/inbox/actions.jsonl`, read with `log inbox actions --chat <id>` (MCP `inboxActions`) before acting; `log inbox claims` lists who holds what. Spec: `docs/specs/agentHooks.md` (REQ-HOOKS-15).

**Rule 135.** 2026-11-04 · matt (through his side session): missing context "is filled by catching up, never by every caller re-reading the client". Each account's owner keeps the platform's own last position in the .db (`positions`: X Chat's sequence id, Discord's last message id per DM, Slack's last ts per chat, Instagram's last activity). A gap opens (`gaps`: from, to, reason, status) when an owner takes over from a stopped or dead one (from its last heartbeat), when the first owner starts on an account that already has events (from the newest), or when the push channel drops. While a gap is open the account is behind, and one catch-up job inside the owner (`catchUpRunner`, `src/inbox/catchUp`) pulls only the delta through the account's own session and governor, paced like reads (0.8 to 2.5 s): X's delta sync after its saved sequence id, Discord's DMs after each one's saved message id, Slack's history after each chat's saved ts (`oldest`), and Instagram's threads active since its last activity. What it pulls is appended to `events` like live pushes, marked `source: catchUp`, and the gap closes. A send (Discord, Slack, X dm and the queue's sends, Instagram) waits up to 90 s for the account to catch up (`waitCaughtUp`) and never reads the platform itself; still behind, it is refused with `accountBehind`. A refused catch-up (a 429 or any refusal) stops, keeps the account behind, alerts (`catchUpRefused`), and nothing resumes until matt says so (rule 94). Discord's gateway RESUME is not used yet. Spec: `docs/specs/agentHooks.md` (REQ-HOOKS-17).

**Rule 137.** 2026-11-04 · matt: keep every part of the voice gate ("necessary") and run it "as the whole voice process on the new .db", required inside every send, only at send time, scoped to that send, quiet; then "Yes, both" to jina-embeddings-v5-omni and the local media model. The voice gate is one step (`gateSend`, `src/cli/twitter/helpers/voice.ts`) inside `log discord send`, `log slack send`, `log twitter dm`, the queue's sends and `log instagram send`, after the account has caught up (rule 135) and before the chat is claimed (rule 133): a draft that fails is refused with `voiceGateFailed` whether or not `log voice` ran first, and in the X queue the item is held to be rewritten with `twitterQueueEdit`. All five checks stay: SubQ's read of matt's voice, the AI tells index with its reranker (rule 112), his own phrasing (rule 127), the watermark checker (rule 111) and the scrambler (rule 127). It reads the chat's context from the .db (rule 136), embeds it, ranks it against the moment being answered (cosine, then `jina-reranker-v3.5`) and gives SubQ the top moments in full (`rankedContext`, `thisConversationRankedForThisMoment`). Only embeddings are kept, in the .db (`embeddings`: the text's hash, model, dimensions and vector, each made once), with the AI tells index's phrase list and matt's baseline (`aiIndexes`); every result is worked out fresh for each send, never saved. Jina is `jina-embeddings-v5-omni-small` at 1024 dimensions (`text-matching`), and an index made with another model is rebuilt. The local embedder stays loaded in its process. A pass is one line; a fail names only what failed and why. Spec: `docs/specs/voiceGate.md` (REQ-VOICE-09 to 11), `docs/specs/aiTells.md` (REQ-AITELLS-05, 10, 12).

**Rule 138.** 2026-11-04 · matt: "a smaller local model" turns every piece of media into "a text representation", labelled with what it is, after a message went out answering only the text around a video someone sent; then "Yes, both" to downloading it. One media describer per machine (`log media describer`, `src/media/describer`), started by the inbox hook and locked like an owner (rule 131, a second is refused), loads `onnx-community/LFM2.5-VL-450M-ONNX` once (SubQ's pick, q4, on the transformers.js runtime log already uses) and keeps it warm. Every image, meme, gif and video a watch receives goes into the .db's `media` queue (`enqueueAttachments`). The describer takes one at a time, describes a video from three frames (ffmpeg), labels each description with its kind, stores it with its `jina-embeddings-v5-omni-small` vector, beats every 5 s, and stops loudly past its memory ceiling (`describerMemory`). The queue holds 20 at most: past that, an item is marked not described yet and alerted (`mediaQueueFull`). Media with no description is shown as `[video clip.mp4 not described yet: …]` in the inbox hook and in the voice gate's ranked context, so nobody replies to it blind; a description reaches both in its place. Audio stays with AssemblyAI (rule 126). A file the platform engine hasn't saved locally yet is listed as not described, with why. `log media describe <path>` queues one local file, and `log media status` shows the queue. Spec: `docs/specs/mediaDescriber.md`.

**Rule 140.** 2026-11-04 · matt: "we're able to send reactions as well, across all of the clients. We need to be able to send reactions to messages as well." Every chat platform reacts to a message with an emoji through its own engine and its one session, never the browser: `log twitter react`, `log discord react`, `log slack react` and `log instagram react` (MCP `twitterReact`, `discordReact`, `slackReact`, `instagramReact`, each with its `…Live` twin), `--remove` taking the account's own reaction off. Each calls the platform's own reaction call: X's DM reaction mutation in `vendor/twikit` (an X Chat id is tried as the same pair, and X's answer decides), endcord's `send_reaction`, Slack's `reactions.add` (by name; the common emoji are turned into their names, `python/platformKit/reactions.py`) and instagrapi's `direct_send_reaction`. A dry run unless `--live` with `--approvedBy` (rule 8). The chat is claimed first and released after, as for a send (rule 133), the governor counts it as a write, the platform's answer decides (rule 73), and a refusal stops with nothing retried (rule 94). `src/cli/react`. Spec: `docs/specs/reactions.md`.

**Rule 142.** 2026-11-05 · matt: "make it so that we can send audio, like upload natively into the platform, voice notes ... directly into the actual clients themselves ... we need to voice clone ourselves from audio ... it will then be an extension, like we have for the meme board stuff", with Fish Audio (hosted) his pick. A voice note only ever goes out when matt asks for one, in his cloned voice, as the platform's own voice note: never on the agent's own initiative and never any other audio. Fish Audio is an extension (`src/extensions/fishAudio`, `docs/extensions/fishAudio.md`): `log fish clone` makes his voice model once from the voice notes he sent himself (fromMe in the conversation store or his `ownMessage` in the .db; Discord voice messages and Instagram voice clips the engines kept, 10 to 60 s in all; nobody else's voice), a dry run listing them unless `--apply`, its id kept in `~/.logCli/voice/fishClone.json`; `log fish speak --text` says words in it to a file under `~/.logCli/voiceNotes` and sends nothing, on the free `s2.1-pro-free` model unless `--model`. `log discord voice`, `log instagram voice` and `log slack voice` take text only (an audio file is refused with `voiceNoteInvalid`), are dry runs unless `--live` with `--approvedBy` (rule 8), wait for the account to catch up (rule 135), run the text through the voice gate (rule 137), make it with the clone, convert it with ffmpeg (Discord ogg/opus, sent as a voice message with flags 8192, its waveform and duration; Instagram AAC in .m4a through instagrapi's `direct_send_voice`, its upload on curl_cffi under the one-call lock, rule 129; Slack AAC in .m4a through `files.getUploadURLExternal`, the upload on gabriel's curl_cffi transport and `files.completeUploadExternal`, rule 125), claim the chat (rule 133), count as a write, and stop on any refusal (rule 94). An engine sends only a file log made under `~/.logCli/voiceNotes`. X isn't built: twikit has no audio send and no vendored code or doc shows X's DM voice upload, so nothing is guessed. `src/cli/voiceNote`. Spec: `docs/specs/voiceClone.md` (was `fishVoice.md`).

**Rule 143.** 2026-11-05 · matt: "the voice cloning and the voice note stuff will be agnostic", after Fish Audio refused the clone without API credit (403, model creation limit 0/0) and he had none to put in. The voice layer is provider-agnostic, the way proxies are (rule 52): `src/extensions/ voiceClone` holds one interface (its models, cheapest model, clone limits, the reference format it takes, clone and speak), and each provider is an extension of its own: `src/extensions/inworld` (the default: instant cloning free, about 70 free speech minutes, wav references 3 to 30 s, `inworld-tts-2-flash`, `INWORLD_API_KEY`) and `src/extensions/fishAudio`. The provider is `--provider`, else `LOG_VOICE_PROVIDER` in `.env.local`, else inworld. `log fish clone|speak` became `log clone voice|speak` (MCP `cloneVoice`, `cloneSpeak`); `log fish` is refused with the form it became (rule 63's pattern). Each provider's clone is kept in `~/.logCli/voice/clone.json`, keyed by provider, made once. `log discord|instagram|slack voice` take `--provider` and call only the shared layer, never a provider. Everything else in rule 142 holds. Spec: `docs/specs/voiceClone.md`.

**Rule 144.** 2026-11-05 · matt: "bro fuckign send th efuckign shit", after the voice gate refused three times the voice note he dictated to deepman word for word ("my phone screen is broken the phone is fine like theres two big green lines going down the side of it and that but it still works thank the lord"). The gate grades speech as typed text and as a reply (voice 0.06 to 0.48, inContext 0.21), so it can't read a voice note in his own spoken words. `--mattsWords` on `log discord|instagram|slack voice` (MCP `mattsWords`) says the text is matt's own words, dictated by him for this voice note: the voice gate's SubQ read is skipped, and the AI artifact check (`watermarkReadingOf`) still runs and refuses `aiArtifacts`. Only when matt gave the exact words; words the agent drafted are always gated (rule 137). Sent live 2026-11-05 08:04 UTC, Discord message 1567811929500811294. Spec: `docs/specs/voiceClone.md` (REQ-VOICE-CLONE-10).

**Rule 145.** 2026-11-05 · matt: "Yes, re-clone it", because the Inworld clone was made with `languageCode` en-US, which pulled his voice towards an American accent, and he is Northern Irish. The voice is cloned and spoken in his accent: `LOG_VOICE_ACCENT` (`.env.local`, default Northern Irish) and `LOG_VOICE_LANGUAGE` (default en-IE, sent again as en-GB when Inworld answers `INVALID_ARGUMENT`). The clone sends that language, a description naming the accent and each sample's AssemblyAI transcript from `~/.logCli/transcripts` when there is one (none is paid for: TTS-2 makes its own), and keeps the language Inworld accepted. `log clone voice --apply --replace` (MCP `replace`) makes it again over the old one, which stays in the clone file under `previous`, never deleted. Speech sends the clone's language; on `inworld-tts-2` the text starts with `[say it in a <accent> accent]`, an instruction Inworld removes before synthesis, and `inworld-tts-2-flash`, which ignores steering, gets none. Spec: `docs/specs/voiceClone.md` (REQ-VOICE-CLONE-11). (Its accent steer was replaced by rule 147, matt 2026-11-05.)

**Rule 146.** 2026-11-05 · matt: "the second one but why does it speak so slowly" and "use the discord audio for the samples". The clone speaks at `LOG_VOICE_SPEED` (`.env.local`, default 1.15, kept between 0.8 and 1.5), sent as Inworld's `speakingRate`, and a clone made on Inworld speaks with `inworld-tts-2` (the provider's `preferred` model, which takes emotion tags), not the cheapest. `log clone voice --from <file>[,<file>]` clones from recordings of matt's own that he names instead of his voice notes, each one's words read from a `.txt` of the same name beside it. Spec: `docs/specs/voiceClone.md` (REQ-VOICE-CLONE-12).

**Rule 147.** 2026-11-05 · matt: "ITS IRISH", none of the accent-steered clips sounded like him, "11_script_long272_b ... was pretty good", then "go through my voice notes ... analyse it", "it still doesn't have that distortion", and "op is real like op not o p ... make it the gate for the voice ... or it won't pass". A voice note sounds like his own voice notes and says what was written, measured both times: - **The clone** is Inworld instant cloning from one continuous 30 s of his own Discord voice note (`matt-long272_b`, 2:30 into his 4.5 minute note), the accent `Irish` (`LOG_VOICE_ACCENT`). No accent instruction is sent with the text: the clone carries the accent. On `inworld-tts-2` breaths are put in (`[breathe]` at the start and once at least 8 words have gone by, `withBreaths`). - **Shaped like his notes** (`processLikeMatt`, `src/extensions/voiceClone/helpers/realism.ts`), every number measured from five of his real Discord voice notes against the clone: phone squash (`dynaudnorm`), the phone mic's own tone curve measured from his notes (`REALISM.phoneCurve`: its low cut under 160 Hz, its dip around 2 to 3 kHz and its dull top over 5 kHz), his slow mic drift (1.9 dB), tone sway as the phone moves, phone-mic saturation on loud words, and his own room tone taken from the gaps in his own voice notes (never a sound effect), laid 22 dB under the voice so it lands where his do (30 to 33 dB). Seeded by the text, so the same words come out the same. - **Listened back** (`readSpoken`, `spoken.ts`): the shaped note is transcribed with AssemblyAI's word timings and lined up with the text. A word in the spoken lexicon (`SPOKEN_LEXICON`: `op` said as a word, written `OP` for the clone, since a lower-case `op` came out as "up") must be heard as itself, as one word under 400 ms; spelled out, heard as something else, or more than a quarter of the words different, and it is refused with `spokenMismatch`, naming what was heard. An acronym the lexicon doesn't have is refused before anything is spoken (`pronunciationUnknown`): how matt says it is never guessed. A note that can't be listened back is never sent (`spokenCheckFailed`). It runs in `log clone speak` and every `log discord|instagram|slack voice`. This replaces rule 145's accent steer. Spec: `docs/specs/voiceClone.md` (REQ-VOICE-CLONE-13, 14).
