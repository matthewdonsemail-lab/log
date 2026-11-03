# instagram

An Instagram account: its session, and reading its DMs (the inbox, or one thread).

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 56). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## The tools in this guide

| Tool | What it does |
|---|---|
| `instagramSessionCheck` | Check that Instagram still accepts one account's saved session… |
| `instagramDms` | An Instagram account's DM threads, or one thread's messages with… |

## Every tool, in full

### `instagramSessionCheck`

Check that Instagram still accepts one account's saved session, sending nothing.
Check that Instagram still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty
log instagram session check --account <accountName> [--json]
Checks that Instagram still accepts the account's saved session, on the direct-API engine (instagrapi, no browser). Sends nothing.
Instagram's own answer decides. The result goes to socialAccounts.sessionState, and refreshed cookies are merged back into the row.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "instagram" }) (An Instagram account: its session, and reading its DMs (the inbox, or one thread)).
AGENTS.md (log://agents): rules 13, 63, 64, 73, 83, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `instagramDms`

An Instagram account's DM threads, or one thread's messages with --with, sending nothing.
Read an Instagram account's DMs: its threads, or one thread's messages with --with, on the direct-API engine, sending nothing
log instagram dms --account <accountName> [--with <handle|thread name|thread id>] [--limit <n>] [--json]
Without --with, lists the account's Instagram DM threads, newest first: who each is with, its last message and whether it is unread. With --with, reads that one thread's latest messages, oldest first.
On the direct-API engine (vendor/instagrapi, direct_threads and direct_thread, no browser). Sends nothing, and marks nothing seen.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "instagram" }) (An Instagram account: its session, and reading its DMs (the inbox, or one thread)).
AGENTS.md (log://agents): rules 13, 63, 64, 73, 83, 94, 126, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

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

**Rule 83.** 2026-10-25 · matt: a new platform is made with one command, written normally: `log new platform <name>` (MCP `newPlatform`). It writes the platform's account session on the shared `src/platformKit/session`, `log <name> session check` with its MCP tool, a direct-API engine in `python/<name>Api` on the shared `python/platformKit/engine.py`, and `docs/platforms/<name>/README.md`, and wires it into the repo by editing each file through its syntax tree (`PLATFORMS`, `PLATFORM_LABELS`, `COMMANDS`, `createContext`, `CommandContext`, `DIRECT_ROUTES`, `COMMAND_RULES`), checking every edit landed before anything is written. Without `--apply` it only lists what it would do; nothing is overwritten; it names what Twenty is missing (the `socialAccounts.platform` option) and never changes Twenty. Routes and rules are keyed by the platform-qualified name (`commandKey`: `read`, `twitterSession`, `redditSession`), so two platforms' commands never share one. lefthook's `platforms` (`bun run check:platforms`, pre-commit and pre-push) refuses a platform missing its label, src, command, engine, session route, rules or docs. `src/scaffold/platform`, `src/cli/new`.

**Rule 94.** 2026-10-29 · matt: "whatever you did in such quick succession lead to my account getting disabled, never do that again." Never act on an account in quick succession. What happened (matt's Discord, `sourcedandsoldtothehighestbidder`, 2026-10-29 00:47-01:00 UTC): in about 13 minutes an agent replied in 3 chats, read 1,400 messages from a server (Finn Automated) with a scratch script that went around log-cli (`.scratch/finn/dc.ts`: its own fetch to `discord.com/api/v9` with the session token, pages back to back, retrying straight through 429s), pulled the account's relationships, then opened new DMs to strangers from that server 30 s apart. Discord disabled the account. From now on: - Every call to a platform goes through log-cli's own commands and their governor. Never a hand-rolled script with an account's token or cookies. - A 429 or a failed send stops the run. It is never retried through, and the next action waits for matt. - Reading a server, group or member list in bulk is its own session. It never runs in the same session as sending. - Cold DMs to people the account has never talked to go out at most a few a day, minutes apart, never back to back. Each new DM channel opened counts as a write. - After a block, disable, captcha or cooldown, nothing resumes on that account until matt says so.

**Rule 126.** 2026-11-03 · matt: every voice note he was sent or sent, transcribed with AssemblyAI, and "inside of the discord layer we have that and then the social media platforms at large, how can we detect when we have audio". Audio is detected once, in the shared message layer (`python/platformKit/media.py`, `src/platformKit/media`), never per platform: a content type of `audio/*` or `video/ogg`, an extension (`.ogg .oga .opus .m4a .mp3 .wav .aac .webm`), or the platform's own flag (Discord's voice-message flag 8192 with its duration and waveform, X Chat's audio media, Slack's `slack_audio` file). Every platform's messages keep their attachments, and an audio one adds `(audio: <name>)` to the text. Whatever is audio goes through one AssemblyAI path (`log transcribe`, MCP `transcribe`; `src/media/voiceNotes`): kept once by its file's hash in `~/.logCli/transcripts`, written into the conversation store as `(voice note: "<what was said>")` so search, voice and SubQ see it, and done as they come in `discordRead`, `twitterDms`, `slackRead` and the inbox. Files come only through the platform's own engine and session (X's one session, Discord's sound search, Slack's own transport), and any refusal stops the run (rule 94). The key is `ASSEMBLYAI_API_KEY` or `ASSEMBLY_AI_KEY` (`.env.local`, `~/.buzz/.env.local` or `~/filmcraft/.env.local`), never printed. `log new platform` writes the attachments into a new platform's message shape, and `check:platforms` refuses an engine whose messages drop them. Spec: `docs/specs/voiceNotes.md`.
