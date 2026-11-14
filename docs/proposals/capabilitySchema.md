# One name and one input shape per capability

14 November 2026.

Status: proposal, not built. A read-only analysis of `main` after PR #133: scripts over `COMMANDS`, `commandTools` and the catalog, with no `log` command and no platform called. This is the design for slice 7 of [platformNeutralSurfaces.md](platformNeutralSurfaces.md).

## Totals

- 110 commands make 207 MCP tools: 36 are `*Live`, 25 take a raw `args` list (all Facebook or shared).
- 185 catalog entries: 171 callable, 14 terminal only.
- Names come from five schemes: the tool name (`platform + Name + FormWords`), the catalog id (`platform.name.words`), `DIRECT_ROUTES` keys (`twitterSession`, no form words), console operation names (`accountCheck`, `connectionsList`) and names built by string (`${platform}SessionCheck`).

## The same capability, different names

| Capability | X | Discord | Slack | Instagram | Reddit | Facebook | Shared already |
|---|---|---|---|---|---|---|---|
| Check a session | `twitterSessionCheck` | `discordSessionCheck` | `slackSessionCheck` | `instagramSessionCheck` | `redditSessionCheck` | `facebookCheck` (a different job) | `sessionsCheck` |
| Sign in | `twitter cookies save` (terminal) | `inspectStart` | `slack cookies save` (terminal) | `inspectStart` | `inspectStart` | `facebookConnect` | console `accountSignIn` |
| List chats | `twitterDms` | `discordChats` | `slackChats` | `instagramDms` | none | `facebookConversations` | `inboxWaiting` |
| Read a chat | `twitterDms --with` | `discordRead` | `slackRead` | `instagramDms --with` | none | `facebookConversationShow` | none |
| Send a message | `twitterDm` | `discordSend` | `slackSend` | `instagramSend` | none | none | none |
| Watch live | `twitter chat watch` (terminal only, by accident) | `discordWatch` | `slackWatch` | `instagramWatch` | none | `facebookWatch` (the listing monitor) | none |
| React | `twitterReact` | `discordReact` | `slackReact` | `instagramReact` | none | none | none |
| Voice note | `twitterVoice` | `discordVoice` | `slackVoice` | `instagramVoice` | none | none | none |
| Post | `twitterPost` | none | none | none | `redditPost` | `facebookPublish` (a listing) | none |
| Reply publicly | `twitterReply` | none | none | none | `redditReply` | `flowPostComment` | none |
| Like or vote | `twitterLike` | none | none | none | `redditVote` | warmup `--likes` | none |

## The same name, different things

- **`read`**: `discordRead`/`slackRead` read a chat; `redditRead*` reads subreddits and posts; `facebookConversationRead` marks messages read (a write); `inspectRead` reads a step folder.
- **`watch`**: Discord, Slack and Instagram stream the inbox; `facebookWatch` runs the listing monitor.
- **`check`**: `facebookCheck` is a browser account check; `*SessionCheck` pings the session; `twitterQueueCheck` checks a queue.
- **`status`**: `facebookStatus` classifies a listing; `facebookAccountStatus` sets a status (a write); `jobStatus`, `mediaStatus`, `twitterQueueStatus` each differ.
- **`dms` vs `dm`**: `twitterDms` reads, `twitterDm` sends. Instagram reads with `dms` and sends with `send`.
- **`send`**: a message on three platforms; a machine event on `facebookHostSend`.
- **`voice`**: `voice` is the voice gate; `*Voice` sends a voice note; `cloneVoice` builds the clone.
- **`post`/`posts`**: `twitterPost` publishes; `discordPosts` lists forum threads.
- **`search`**: `search` is the local index; `discordSearch` searches Discord live.

## Input mismatches

| Canonical input | What each platform calls it today |
|---|---|
| `account` | `--account` in 86 forms; positional in four `facebook account` forms and `facebook poll` |
| `chat` | X `userId` (send), `conversation`/`with` (read), `chat` (react), `with` (voice); Discord `channel`; Slack `chat`; Instagram `with`, but `thread` for react; Facebook positional `<id>` |
| `space` | Slack `workspace`; Discord `server`; Reddit `subreddit`; Facebook `group` |
| `post` | X `tweet`; Reddit `url`; Facebook `group`/`listing` |
| `media` | X `media`; Discord `file`; Instagram `photo`; Slack none |
| `limit` | a string in 17 forms, an integer in 2 |
| `seconds` | a string in all four watches |
| `approvedBy` | `approvedBy` in 25 forms, `by` in the queue, inbox resume and governor reset |
| `platform` | an enum in 5 forms, a free string in 7 |

Other mismatches:
- `approvedBy` is optional in the `*Live` schema, but every command refuses `--live` without it.
- `--apply` acts with no live gate on `storage rebuild`, `runs prune`, `new platform`, `clone voice` and `facebook listing sweep`.
- `--likes` is a second live switch (warmup).
- Live is expressed three ways: CLI `--live`, MCP `*Live` + `confirmLive`, and `logCall { live: true }`.

## Bugs found on the way

- `TERMINAL_ONLY`, `LONG_RUNNING` and `NO_PROMPT` are keyed by bare command name (`src/mcp/server/types.ts:87-99`, `toolsFromCommands.ts:10`). So `twitter chat watch`, a read-only watch, is hidden from MCP, and `discordRead`, `slackRead`, `redditRead*` and every `twitterQueue*` get long-running handling by accident.
- Nine read tools are marked `write` (`twitterQueueShow/Status/Check`, `inboxWaiting/Claims/Actions`, `inspectRead/Map/Goal`), so hosts see them as not read-only.
- `PLAY_REQUIRED` includes `twitterVoiceLive` but not the Discord, Slack or Instagram voice tools, or any react tool.
- The hosted `WRITE_TOOLS` is X plus `discordSendLive` only.
- Flow tools are `flow{Name}` with no platform though they are Facebook only, and their refusal says "Facebook" (`toolsFromFlows.ts:60`).

## The proposed uniform schema

**Naming.** A capability is a shared command. CLI: `log <noun> <verb> [--platform p] --account a …`. MCP tool: the same words in camelCase, `<noun><Verb>`. Catalog id: `<noun>.<verb>`. One function derives all three. The platform is never a word in the name. The live twin is always `<tool>Live`.

**Capabilities.** `sessionsCheck` (exists), `sessionsSignIn`, `chatsList`, `messagesRead`, `messagesWatch`, `messagesSend`, `messagesReact`, `messagesDelete`, `voiceNotesSend`, `postsCreate`, `postsReply`, `postsQuote`, `postsRepost`, `postsLike`, `postsList`, `postsRead`, `spacesList`, `peopleFollow`, `followersList`, `notificationsList`, `messagesSearch`.

**Platform.** If `platform` is given, it is checked against the account (`accountPlatformMismatch`). Otherwise the account is looked up: one match gives the platform, several give `platformAmbiguous`, none gives `accountNotFound`. Never a default.

**Per-platform extras.** An optional block per platform, for example `twitter: { force, skipStyleCheck, overGate }`, `discord: { brief, noMedia, after }`. Only the resolved platform's block is allowed. No `oneOf`, since many hosts handle it badly.

**Missing.** A platform without the capability answers `capabilityMissing { capability, platform, platformsWithIt }` and contacts nothing. An input that platform doesn't take answers `inputUnsupported { input, platform }`.

**Live.** Keep twin tools (`messagesSend`, `messagesSendLive`), generated from one entry. Hosts, the play gate and the hosted write list all decide by tool name, so one tool with a `live` input would have to be marked destructive even for a dry run. `approvedBy` becomes required in the Live schema. `--apply` and `--likes` fold into the same mechanism.

**Where it lives.** `src/platformKit/capability/` holds the `CAPABILITIES` table: words, effect, live, longRunning, playRequired, canonical inputs, and per platform the command, form and input map. A `toolsFromCapabilities` generator sits beside `toolsFromCommands`. `LONG_RUNNING`, `PLAY_REQUIRED`, `TERMINAL_ONLY` and the hosted lists are derived from the table. The `react` and `voiceNote` factories (`src/cli/react/index.ts`, `src/cli/voiceNote/index.ts`) already build one command from a per-platform shape and are the seed.

### Three worked examples

**Send a message**
- Old: `twitterDm { account, userId, text, media }`, `discordSend { account, channel, text, file }`, `slackSend { account, chat, workspace, text }`, `instagramSend { account, with, text?, photo }`.
- New: `log messages send --account a --chat c --text t [--media f]`, tools `messagesSend` / `messagesSendLive { platform?, account, chat, text, media?, asOne?, space?, approvedBy, confirmLive }`.
- Mapping: `chat` becomes X `userId` (after resolving a handle to its id, which is missing today), Discord `channel`, Slack `chat`, Instagram `with`. `media` becomes `media`/`file`/`photo`, and `inputUnsupported` on Slack. Facebook answers `capabilityMissing`.

**Read a chat**
- Old: `twitterDms`, `discordRead`, `slackRead`, `instagramDms`, `facebookConversationShow`.
- New: `messagesRead { platform?, account, chat, limit?, space? }`. Listing chats moves to `chatsList`.

**Check a session**
- Old: six `*SessionCheck` tools, `facebookCheck`, console `accountCheck`, `sessionsCheck`.
- New: `sessionsCheck { platform?, account? }` stays the one name. The per-platform tools and the console's `accountCheck` become hidden aliases.

## What breaks, and the order

What names platform tools today:
- 37 use-case files, 17 guides, 10 platform docs, 11 skills, 36 `.claude/skills`, and the 2 Hermes plugin skills.
- The inbox hook's prompts (`src/inbox/watch/client.ts`) and the queue runner (`src/twitter/queue/run/client.ts:175`).
- The hosted lists in `python/controlService/tools.py`.
- `agentRules` keys, `DIRECT_ROUTES` keys, and the tool names stored in timing history.

What stays per platform: the engines and governors, the credential prompts, Facebook's browser commands (Marketplace, host, campaign, warmup, join), and the X queue and lists.

Aliases: PR #133's alias table maps names only. An old tool has different inputs, so it keeps running its own command, unlisted, and says which capability replaced it.

Order:
1. Key `TERMINAL_ONLY`, `LONG_RUNNING` and `NO_PROMPT` by command key. This also brings the X watch into MCP.
2. Add the capability table, generator and resolver, checked with fixtures only.
3. Ship the read capabilities: `chatsList`, `messagesRead`, `messagesWatch`, and the `sessionsCheck` aliases.
4. Ship the write capabilities with Live twins, deriving the play gate and hosted lists.
5. Regenerate use cases, guides, skills, the Hermes skills and the inbox hook text so they name capabilities.
6. Ship the post and social capabilities for X and Reddit.
7. Hide the old tools from the list, then remove the aliases a release later.
