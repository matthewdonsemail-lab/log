# CLI and MCP parity: schemas, results and gates

14 November 2026.

Status: audit, nothing built. Read-only, on `main` at 4f38eabb. The scripts ran with a fake home directory, with fetch, WebSocket and spawn blocked and every engine call stubbed, so no platform was contacted. This is the evidence for slices 11 to 15 of [platformNeutralSurfaces.md](platformNeutralSurfaces.md).

Each claim is marked: **R** read in the code, **X** ran in a script, **I** inferred and not traced end to end.

One fact sits under most of this. An MCP tool call runs the CLI in the same process: `runCli(argv)` at `src/mcp/server/index.ts:154`. So the parser is always the same one. Every gap is in the schema layer, the result wrapper and the gate layer around it.

## 1. Does the MCP schema match what the CLI parses?

**Round trip (X).** All 151 non-live form tools from `commandTools`, each given a minimal input built from its schema, passed through `argvOfInput` and then the command's own `run`:

- 0 hit a parse error.
- 35 exited 0.
- 65 got past parsing and stopped at the stubbed engine call.
- 51 refused for reasons the schema can't express.

The existing test (`src/cli/runner/commandInput.test.ts:36-50`) only round-trips against `parserSpecOf`, never `run`, which is why none of the following is caught today.

| Mismatch | Tools affected | Where |
|---|---|---|
| Schema says string, `run` needs a number | `limit` on inboxWaiting, inboxActions, twitterDms, twitterFollowers, twitterNotifications, search, kbSearch, memelordSearch, memelordTrending, tregSearch, discordPosts, discordSearch, discordRead, slackChats, slackRead, instagramDms, redditReadPost. Also `seconds` on the three watches, `rounds`, `pages`, `hours`, `wait`, `days`, `maxItems`, `likeChance`, `window`, `start`. Only reportData and twitterQueuePlan type `limit` as an integer. | e.g. `src/cli/discord/index.ts:230-231` |
| Boolean typed as string | `discordPosts.archived` | discord usage |
| Comma lists sent as one string | twitterFollows.handles, discordSend.file, discordDelete.message, twitterQueueBuild.variations, tregCall.fields, kbRemember.tags, newPlatform.hosts and sessionCookies, the `media` inputs, cloneVoice.from | `src/cli/discord/index.ts:442,503` |
| A repeated flag: the last one wins silently | every `parseArgs` flag | `src/cli/runner/helpers/parseArgs.ts:25-27` |
| `pairs` and `global` flags are not in `parserSpecOf` | proxyMs, `--set` | `commandInput.ts:17`, `src/cli/runner/client.ts:59-73` |
| A one-of requirement the schema can't express | redditVote (`url` or `target`), instagramSend (`text` or `photo`), twitterListAdd (`handle` or `userId`), voice (`text` or `with`), proxy (`--account` or `--missing`, `--city` or `--anyCity`) | refusals seen in the run |
| The number of values depends on the action | `inspectDo` with `action: "goto"` needs one entry in `values` | X |
| A value format that isn't in the schema | `userId` must be digits (a handle is refused, not resolved); `tweet` must be an x.com URL; `--since` and `--before` must be a date or `7d`; tregCall `params` must be a JSON object | X |
| Required-ness | `approvedBy` is optional in every `*Live` schema, but each command refuses `--live` without it (25 tools) | e.g. `discord/index.ts:446,561` |
| The parser accepts flags the schema doesn't expose | `console`: `--web`, `--port`, `--noOpen`; `facebook read --worker` | `src/cli/console/index.ts:213` |
| Different defaults on each path | MCP adds `--noPrompt` to `connect`; MCP returns after 20 s as a job where the CLI blocks; no path forces `--json` | `guardCall.ts:48-49` |
| A crash with no exit code | `inspectMap` with a bad path throws a raw ENOENT | X |

**Shared error codes with one platform's wording (X, R).**

- `limitInvalid` says "log twitter dms" when twitterFollowers raises it.
- `secondsInvalid` says "log twitter chat watch" when the Discord, Slack and Instagram watches raise it (`src/errors/catalog/types.ts:214-216,277-279`).
- `mediaInvalid` says "can't go on X" for `mediaView` and `mediaDescribe`.
- `crashed` says "A step threw before Publish was clicked. Nothing was posted." for every command (`types.ts:1439-1441`, through `refuseError` in `src/cli/runner/helpers/refuse.ts:16`).

## 2. Tools with no real schema

25 tools from 20 commands take a raw `args` list.

| Tool(s) | Real inputs | Difficulty | Notes |
|---|---|---|---|
| logout, whoami | apiUrl, json | trivial | |
| facebookDoctor | json | trivial | |
| facebookScan | account, json, bypass | trivial | |
| facebookStatus | listingId, account, json, bypass | trivial | |
| facebookWatch | account, checks, interval, json, bypass | trivial | |
| graph | `publish` or `monitor` | trivial | |
| facebookProfile and Live | setup, account, live, bypass, json | trivial | |
| facebookConnect | account, wait, bypass, now | trivial | |
| facebookPreflight | account, homes, noProxy, apply, json | trivial | marked `read`, but `--apply` writes (`src/cli/preflight/index.ts:65,69`) |
| facebookLifecycle | two forms; `states --write` | moderate | marked `read`, but `--write` rewrites `docs/lifecycle.md` |
| adsPower | status, profiles, sync; apply, account, homes | moderate | `sync --apply` acts with no live gate; the console calls it (`src/console/browserCheck/client.ts:105`) |
| localAccount | add, list, pull; platform, account, adsPower, proxy, home, city, refresh | moderate | the proxy URL carries a password and travels in `args` and the live log (I) |
| proxy | check, assign, balance, static | moderate | |
| facebookCapture | three modes that exclude each other | moderate | |
| facebookPoll | positionals or `--request <json>` | moderate | |
| facebookCampaign and Live | fill, heal, run, show | moderate | |
| flow and flowLive | fromInspect, docs, list, show, run; repeated `--set` | moderate | `run` already has generated per-flow tools |
| facebookJoin and Live | group, then show, answer, fill, submit | needs redesign | multi-step state |
| warmup and warmupLive | `<platform> <activity>` plus about 20 flags, ranges, a second live flag | needs redesign | |

**Tools that aren't generated from commands (R).**

| Tool | Schema | CLI twin | In the catalog | On the hosted relay |
|---|---|---|---|---|
| getGuide | hand-written (`src/mcp/server/helpers/guides.ts:112`) | none | no | yes |
| logSearch, logGet, logCall | hand-written (`src/mcp/catalog/index.ts:33-101`) | none | n/a | no |
| report | zod; its data source is X only | partial (`log report data`) | no | yes |
| browserViewStream, Frame, Input, Done | hand-written, app only | none | no | app only |
| `flow<Name>` and Live | generated from flow JSON; every parameter is a string | `log flow run <n> --set` | no (`src/mcp/catalog/helpers/entries.ts:98-103`) | no |
| accountsList, toolManifest, uiResources | hand-written in Python (`python/controlService/mcpRoutes.py:31,38`) | none | no | hosted only |
| 14 console operations | Python `CONSOLE_TOOLS` | partial | no | yes, by role |

## 3. What a caller gets back

- **Envelope (R).** Command tools return `ToolResult` (`src/mcp/server/types.ts:37-85`). getGuide returns text only, report returns its own payload, and app tools return `{ error, message }`. The hosted relay drops `browsers` and `next` and returns `{ state, result, error }` (`src/cli/runtime/index.ts:116-118`).
- **`json` (R).** It is filled whenever stdout as a whole parses as JSON, whether or not `--json` was passed (`index.ts:70-78,194`). `--json` is never forced.
- **Error codes (R).** There is no machine-readable `code` field. `refuse()` writes the code into stderr (`refuse.ts:6-9`). 280 refusals go through `refuse()` and 380 return plain stderr with no code (X).
  - Consumers fall back to a regex over stderr: `src/platformKit/sessionCheck/client.ts:36-39`.
  - The hosted relay only takes `content.error`, which command tools never set, so every refused command reaches a hosted caller as `toolFailed` (`runtime/index.ts:118`).
- **Exit codes (R).**
  - `queue run` exits 5 when it doesn't finish (`src/cli/twitter/helpers/queue.ts:339`). The schema documents 0, 1, 2 and -1.
  - `sessions check` exits 1 when any account needs signing in (`src/cli/sessions/index.ts:62-63`), so a check that worked is marked as an error.
- **Jobs (R).** `LONG_RUNNING` is keyed by bare command name and decides `waitMs`, job wrapping and the `accountBusy` check (`index.ts:247-255`). Sends aren't long-running, so a send skips the busy check while a job holds the same account. The CLI never checks it.
- **`logCall` (R).** It checks inputs itself, in different words from the guard, then runs the same `runToolCall`. It can't reach flow tools, getGuide, report or the app tools. Passing a `*Live` name as `id` without `live: true` silently runs the plain tool (`entries.ts:101-103`).

**The same capability answers with different fields on each platform (R).**

| Capability | X | Discord | Slack | Instagram | Reddit, LinkedIn |
|---|---|---|---|---|---|
| Session check | has `library`, no `platform` (`python/twitterApi/engine.py:432`) | adds `globalName`, `verified`, `mfaEnabled` (`discordApi/engine.py:60`) | adds `workspaces` (`slackApi/engine.py:149-153`) | adds `transport`, `reused`, no `httpStatus` (`instagramApi/engine.py:83`) | LinkedIn adds `premium` (`linkedinApi/engine.py:55-61`) |
| Send | `target`, `action`, `split` (`send.ts:248`) | `sent`, `interrupted`, `watermark`, `split` (`discord:655`) | `chat`, `split` (`slack:491`) | the engine's answer, no `split` (`instagram:283`) | Reddit has no `engine` (`reddit:327`) |
| Dry run | `target`, `split` | `target` | `chat` | `with`, `plan` | `action` and fields |
| Read a chat | two shapes, by source (`dms.ts:181,218`) | `channelId`, `messages`, `source` | `messages` | the engine's answer | Reddit reads have no `engine` |

**Tools with no `--json` (X).** runsPrune, inspectStart, inspectMap, inspectFinding, the three `facebookHost*` tools, facebookAccountResave, ResetOpens and Status, four `facebookConversation*` tools, six `twitterQueue*` tools, jobCancel.

## 4. Which gates apply on which path

| Gate | CLI | MCP tool | logCall | Alias | Console, in process | Hosted relay |
|---|---|---|---|---|---|---|
| Live confirmation | `--live` only | `*Live` + confirmLive (`guardCall.ts:26`) | `live` + confirmLive | as the tool | set automatically (`browserCheck/client.ts:118`); `adsPower sync --apply` with no gate (`:105`) | write tools always refused (`dispatcher.py:85`) |
| approvedBy | in 9 command files | same | same | same | n/a | n/a |
| Play required | none | `PLAY_REQUIRED` (`activePlay.ts:17`) | yes | yes | yes | yes, with no play footer |
| Voice and AI-artifact gate | in the command, so the same everywhere | | | | | |
| Claims, catch-up, governor | in the command, so the same everywhere | | | | | |
| Waking hours | `--bypass` | confirmBypass | confirmBypass | same | n/a | n/a |
| accountBusy | none | only for `LONG_RUNNING` names | same | same | same | same |

**Where the gates are uneven (R).**

- Live tools with no `approvedBy` input at all: facebookPublishLive, facebookListingRemoveLive, facebookReadGroupLive, facebookHostStartLive, inspectDoLive, twitterQueueRunLive, and the raw-args Live tools.
- Writes with no live gate: `--apply` on preflight, adsPower sync, storage rebuild, runs prune, new platform, clone voice and listing sweep; `--write` on lifecycle.
- Voice gate: on X only DMs have it, and `overGate` exists only for DMs (`send.ts:53,222`). Slack and Instagram are gated but have no `overGate`. Reddit post and reply have no voice gate, no AI-artifact check and no claim (`src/cli/reddit/index.ts`).
- Play gate: misses twitterPostLive, redditPostLive, redditReplyLive, every react tool, discordDeleteLive and the Discord, Slack and Instagram voice tools.

**Gates and lists keyed by a hand-maintained name list.**

- `PLAY_REQUIRED` (`src/mcp/server/helpers/activePlay.ts:17`)
- `LONG_RUNNING`, `ARGS_LIVE_FLAGS`, `NOTES` (`src/mcp/server/helpers/toolsFromCommands.ts:10,24,82`)
- `TERMINAL_ONLY`, `NO_PROMPT` (`src/mcp/server/types.ts:87-99`)
- `RENAMED_TOOLS` (`src/mcp/server/helpers/toolAliases.ts`)
- `READ_TOOLS`, `WRITE_TOOLS`, `APP_TOOLS`, `CONSOLE_TOOLS` (`python/controlService/tools.py`)
- `HIDDEN` (`python/controlService/mcpRoutes.py:25`)
- `SECRET_ARGS`, `STREAM_TOOLS`, `FRAME_TOOLS` (`src/console/operations/client.ts`)
- `${platform}SessionCheck`, built from a string (`src/console/accountCheck/machine.ts:19`)

## 5. Platform scoping in schemas and the catalog

- **`platform` is an enum in five tools and a free string in seven** (the `inbox*` tools, `search`, `searchIndex`).
- **Shared tools take an account without saying which platforms it can be on**: `inspect*`, `browserView`, `reportData` (X only), `search` and `searchIndex` (X and Discord only), `transcribe`.
- **An account from the wrong platform is caught late.** Platform tools answer `accountNotFound` without saying the account exists on another platform (`src/platformKit/session/client.ts:17-22`). Shared and Facebook commands use `findAccount`, which accepts any platform and prefers Facebook when names collide (`src/marketplace/socialAccount/client.ts:65-79`), then fail with `accountNotFacebook` (`checkRunnable.ts:50-53`).

**`logSearch` ranking (X, 38 queries).** It ranks by words; a platform word only filters and adds 2 (`src/mcp/catalog/helpers/search.ts:89-121`). The verdict `strong` was wrong in these cases:

| Query | Top result | Problem |
|---|---|---|
| post a tweet | `discord.posts` | "tweet" is a synonym, not a platform word |
| list my accounts | `facebook.listing.remove` | `localAccount` isn't returned |
| read new messages from discord | `search.index` | `discord.read` isn't in the top three |
| who liked my post, who followed me | `twitter.like`, `twitter.follow` | write tools rank above `twitter.notifications` |
| check my accounts | `discord.session.check` | `sessions.check` isn't in the top three |
| is my x account signed in | `twitter.session.webClient` | ranked above `session.check` |
| sign in to discord | `discord.session.check` | there is no sign-in capability to return |
| watch my inbox | second is `twitter.chat.watch` | a terminal-only entry that `logCall` refuses |
| upvote a post | `discord.posts` | `reddit.vote` isn't in the top three |

## 6. Docs: generated or hand-maintained

**Generated (R).** `bun run docs:build` runs `scripts/docs/buildDocs.ts`. The guides' "Every tool, in full" come from `toolsFromCommands`, the same source as the schemas.

`docs/reference.md` comes from a second catalog (`src/surface/catalog/index.ts:25-27`). It finds flags by a regex over the hand-written `usage` text, not from the input forms, so it carries no types and no required-ness. Drift found today: the console's `web`, `port` and `noOpen`, and `facebook read --worker`.

**Hand-maintained, restating tool names or inputs (R).**

- `src/inbox/watch/client.ts:425,438,451,474`: hook prompts with literal calls such as `discordRead { …, limit: "20" }`.
- `hermesPlugin/skills/dm-inbox/SKILL.md` and `hermesPlugin/skills/outreach/SKILL.md`.
- `python/controlService/tools.py` and `python/controlService/mcpRoutes.py:25-38`.
- `site/apps/web/src/landing/mcp/mcpContent.ts`, `useCases/platformSessions.ts`, `quickAnswers.ts`, `harnessPages.ts`, `platformPages.ts`, `agentSessionScript.ts`.
- `src/mcp/server/helpers/toolsFromCommands.ts:82-95` (`NOTES`).
- Every `usage` string, which `docs/reference.md` depends on.

## 7. Files to change

| Fix | File | What changes |
|---|---|---|
| **A. One schema source, round-trip tested** | `src/cli/runner/types.ts` | `FlagSpec` gains `number`, `list`, `date` and `span` kinds, `min`, `max`, `pattern`, and groups for one-of and exclusive flags |
| | `src/cli/runner/helpers/commandInput.ts` | `inputSchemaOf` emits those; `argvOfInput` joins lists |
| | `src/cli/runner/helpers/parseArgs.ts` | parses into typed values; a repeated scalar flag is refused |
| | every `src/cli/**/index.ts` that calls `Number(parsed.flags…)` or `.split(",")` | reads typed values |
| | `src/cli/twitter/helpers/send.ts`, `list.ts`, `voice.ts`, `src/cli/reddit/index.ts`, `src/cli/instagram/index.ts`, `src/cli/inspect/index.ts` | declare one-of groups and value-count rules |
| | `src/mcp/server/helpers/toolsFromCommands.ts` | `approvedBy` required in the Live schema; `LONG_RUNNING` and `NOTES` move onto the command |
| | `src/surface/catalog/index.ts` | `docs/reference.md` built from input forms |
| | `src/cli/console/index.ts` | console flags moved into its input forms |
| | `src/cli/runner/commandInput.test.ts` | a round-trip test through `run` with a stubbed context |
| **B. Every tool has named inputs** | `src/cli/{auth,live,adsPower,localAccount,lifecycle,preflight,proxy,capture,poll,campaign,profile,errors}/index.ts` | add `input.forms` |
| | `src/cli/flow/index.ts`, `src/cli/join/**`, `src/cli/warmup/**` | redesign as typed forms |
| | `src/mcp/server/helpers/toolsFromCommands.ts`, `guardCall.ts` | remove the args path once the list is empty |
| | `src/mcp/server/helpers/toolsFromFlows.ts`, `src/mcp/catalog/helpers/entries.ts` | flow tools enter the catalog, with their platform |
| **C. One result envelope with error codes** | `src/mcp/server/types.ts` | `ToolResult` gains `code`, `platform`, `capability`; exit codes listed |
| | `src/cli/runner/types.ts`, `src/cli/runner/helpers/refuse.ts` | refusals carry `code` as a field; the 380 plain refusals go through `refuse` |
| | `src/errors/catalog/types.ts` | platform-neutral copy for `limitInvalid`, `secondsInvalid`, `mediaInvalid`, `crashed`; new `inputInvalid` |
| | `src/mcp/server/index.ts` | always fill `json`; guard refusals carry codes; getGuide and report use the same envelope |
| | `src/mcp/apps/report/client.ts`, `src/mcp/apps/browserView/client.ts` | same envelope |
| | `src/cli/twitter/helpers/{send,dms}.ts`, `src/cli/{discord,slack,instagram,reddit,linkedin,react,voiceNote}/index.ts`, `python/*Api/engine.py` | one answer shape per capability |
| | `src/cli/runtime/index.ts:116-118` | forward `code`; stop dropping `next` |
| | `src/platformKit/sessionCheck/client.ts:36-39` | read `code`, not a regex over stderr |
| | `src/cli/sessions/index.ts:62` | a check that worked exits 0 |
| **D. One gate pipeline for every path** | new `src/platformKit/gates/` | one `gateCall(tool, input, caller)` for live, approval, play, bypass, busy and terminal-only, called by the CLI runner, `runToolCall`, the console and the runtime |
| | `src/mcp/server/helpers/activePlay.ts` | `PLAY_REQUIRED` derived from command metadata |
| | `src/mcp/server/types.ts`, `toolsFromCommands.ts` | `TERMINAL_ONLY`, `NO_PROMPT`, `LONG_RUNNING` move onto the command, keyed by `commandKey` |
| | `src/cli/reddit/index.ts` | add the voice gate, the AI-artifact check and the claim |
| | `src/cli/slack/index.ts`, `src/cli/instagram/index.ts` | add `overGate` |
| | `src/cli/twitter/helpers/send.ts` | voice gate on reply, quote and post |
| | `src/console/browserCheck/client.ts` | no `confirmLive: true` or `--apply` set on the caller's behalf |
| | `src/cli/{preflight,adsPower,lifecycle,storage,runs,new,clone,listing}/index.ts` | `--apply` and `--write` become a live flag, with effect `write` |
| | `python/controlService/tools.py`, `dispatcher.py`, `mcpRoutes.py` | lists generated from `toolManifest`; add logSearch, logGet, logCall |
| **E. Platform-scoped catalog** | `src/mcp/catalog/helpers/search.ts` | synonyms as platform words; reads above writes for "who…"; terminal-only entries never `strong`; results grouped by capability |
| | `src/mcp/catalog/helpers/entries.ts` | entries for flows, getGuide and report; `platforms` on each entry |
| | `src/platformKit/session/client.ts`, `src/marketplace/socialAccount/client.ts` | `accountPlatformMismatch { account, platform, foundOn }` |
| | the `platform` flag specs on inbox, search and searchIndex | an enum |
| **F. Drift sources** | `src/inbox/watch/client.ts`, `hermesPlugin/skills/*`, `site/apps/web/src/landing/**`, `src/console/accountCheck/machine.ts:19` | names and input examples generated from the catalog, or checked |

## Priorities, each with a check

1. **Round-trip through `run`.** A test with a stubbed context fails when schema-valid input is refused for a parse or input reason.
2. **Typed number, list and one-of kinds; `approvedBy` required on Live.** A static scan fails when `Number(parsed.flags[...])` or `.split(",")` reads a flag declared `string`.
3. **A `code` on every refusal and in `ToolResult`.** Every stderr return goes through `refuse`; the hosted relay test asserts a refusal's code reaches the caller.
4. **Gate lists derived from metadata.** `PLAY_REQUIRED`, `LONG_RUNNING`, `TERMINAL_ONLY` and the hosted lists must equal what the metadata derives.
5. **One gate function for every path.** A table test calls the same live action through the CLI, MCP, logCall, an alias, the console and the runtime with fake engines, and asserts the same refusal code.
6. **One answer shape per capability.** Fixture engines for session check, send, read and react on each platform, with one key set asserted per capability.
7. **No raw args tools.** A baseline count that may only go down.
8. **Platform-neutral error copy.** A shared code raised by more than one platform names no platform.
9. **Catalog quality.** A golden set of about 40 queries, each with its expected top id.
10. **Hand-written mentions stay valid.** Scan the inbox hook, the Hermes skills, the site sources and `tools.py` for tool names and inputs, and check each against `inputSchemaOf`.
