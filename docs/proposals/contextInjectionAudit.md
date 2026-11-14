# How context reaches the model: guides, router, hooks and harnesses

14 November 2026.

Status: audit, nothing built. Read-only, on `main` at 4f38eabb. No hook was run, because the inbox hook starts platform watchers. This is the evidence for slices 16 to 19 of [platformNeutralSurfaces.md](platformNeutralSurfaces.md).

Each claim is marked: **R** read in the code, **X** ran in a script, **I** inferred and not traced end to end.

## 1. Every way text reaches the model

| Path | What triggers it | What it injects | Size (X) | Who receives it |
|---|---|---|---|---|
| Local server `instructions` (`src/mcp/server/helpers/agentRules.ts:20-33`) | MCP initialize | 10 rules; load `logMcpInstructions`; call `getGuide({ ask })` when there is no prompt hook | 1,782 chars | any local client that passes instructions on |
| Hosted `INSTRUCTIONS` (`python/controlService/mcpRoutes.py:18-24`) | hosted initialize | different, hand-written text; never says to load `logMcpInstructions` | 481 chars | the Claude app, ChatGPT, Grok, hosted Cursor and Hermes |
| Tool descriptions (`src/mcp/server/helpers/toolsFromCommands.ts:109-173`) | tools/list | summary, live line, usage, notes, long-run line, guide line, use-case line, rules line | 246 tools, 265k chars (about 66k tokens); 36% is the guide and rules boilerplate | every harness |
| `getGuide({ topic })` (`guides.ts:64`) | a model call, required by the instructions and every guide line | `docs/guides/<topic>.md` | 22 guides, 726k chars (about 182k tokens). xSending 128k, facebookFlows 78.5k, facebookBrowser 68.9k, logMcpInstructions 28.4k | every harness |
| `getGuide({ useCase })` | a model call | the use-case page, and it makes that the session's play | 1 to 10k chars | every harness |
| `getGuide({ ask })` (`guideAnswer.ts:19-31`) | a model call | `matchPlays` (words only, floor 0.5), then it activates the top match | | the only router for the Claude app, ChatGPT, Cursor, Hermes and Grok |
| Resource `log://agents` (`src/mcp/server/index.ts:310-321`) | resources/read | the whole AGENTS.md, developer rules included | 17.7k chars | clients that read resources |
| Prompt hook router (`src/agentHooks/registry/index.ts:38`, `scripts/contextLayer/service.ts`) | prompt submit | a play match or a menu. Hybrid: 0.7 meaning + 0.3 words, typo fix, labelled prompts, threshold 0.63, an ambiguity band. It suggests and never activates | small | Claude Code and Codex (generated); opencode and Antigravity (hand-written). Only when the session runs inside the log checkout |
| Session-start play restore (`src/contextLayer/hook/client.ts:11-15`) | session start | the active play with its steps | small | only Claude Code transcripts; a play loaded with `ask` is never restored |
| Other hooks (`src/agentHooks/answers/client.ts`) | session start, prompt, after a tool, stop | browser states, storage, engines, the knowledge pointer, pending inbox messages and the watcher start, the X queue, the X live feed | varies | hook harnesses only. The queue, the live feed and the stored inbox are X only (`:100,105,136`) |
| Refusals before a tool (chat names, live logs) | before a tool call | deny a bare chat id; deny a hand-run `log …` | | Claude Code and Codex |
| Play footer (`activePlay.ts:50-60`) | every tool result once a play is active | which step this call is | about 300 chars | local MCP only. The hosted runtime calls `runToolCall` directly and skips it (`src/cli/runtime/index.ts:29-35`) |
| Result `next`, `browsers`, `needsMatt` | every result | the next call, open browsers | | local only; the hosted relay strips them |
| Skills | the harness's own skill matching | `.claude/skills/log-*` (38, generated); the site's copy; `hermesPlugin/skills` (2, hand-written) | | Claude Code inside the repo; the Hermes plugin. Nothing installs them elsewhere |

## 2. Where the wrong content is injected

### The router, over 44 prompts (X)

The two routers disagree, so each harness gets a different answer for the same prompt. "Ask" is `getGuide({ ask })`, used by every harness without a hook; it activates the play. "Hook" is the Claude Code and Codex hook; it only suggests.

| Prompt | Ask activates | Hook | Right? |
|---|---|---|---|
| reply to everyone who commented on my last tweet | `discord/serverReply` | a menu with no X play | wrong platform in both |
| check my x notifications | `inbox/signIn` | menu `inbox/signIn` | wrong; `twitter/notifications` has no asks line |
| reply under the big accounts in my niche | `discord/serverReply` | none | wrong platform |
| read the group chat on discord | `discord/memeReply` | `discord/groupChatRead` | ask wrong |
| what did they say in slack | `instagram/dmReply` | menu `slack/dmReply` | ask wrong platform |
| send a message in the slack workspace | `inbox/reactions` | `slack/dmReply` | ask wrong |
| comment on reddit posts, post on reddit, upvote on reddit | none | none; top is an X play | Reddit can't be routed |
| reply to my linkedin dms | `discord/serverReply` | menu | wrong platform |
| join facebook groups for … | `discord/channelReply` | menu `facebook/groups` | ask wrong platform |
| read the posts in the facebook group | `discord/channelReply` | menu `facebook/groups` | ask wrong platform |
| check my accounts | `inbox/signIn` | `inbox/signIn` | a status ask becomes the sign-in play |
| who is waiting on me | none | skipped as trivial | missed |
| reply to her | `discord/serverReply` | skipped as trivial | wrong platform |
| reply to my dms | `discord/serverReply` | menu | ask wrong platform |

Totals for the ask path: about 17 right, about 19 with the wrong play activated, 8 with none. Seven activate a play for a different platform, and six of those are Discord.

Why (R, `src/useCases/router/client.ts`):

- **Ties go to the alphabetically first folder.** `matchPlays` sorts by score (`:31`), the sort is stable, and `listUseCases` reads folders in alphabetical order (`guides.ts:81-82`). Discord wins every tie and X loses every tie.
- **Placeholders count as words.** `phraseScore` divides by the phrase's own words (`:14-17`), and `<server>` counts. "reply in the `<server>` server" is {reply, server}, so any prompt containing "reply" scores 0.5, which is `ASK_FLOOR` (`guideAnswer.ts:10`).
- **The platform word in the prompt adds nothing.**
- **The ask path ignores ties** and activates the top match even on a three-way tie (`guideAnswer.ts:27-28`).
- **The hook drops short prompts** (`TRIVIAL_WORDS = 2`, `types.ts:21`).
- **10 of 38 use cases have no "How the owner asks for it" line**: eight under `twitter/` and both under `facebook/`.
- **The Facebook plays have no parseable steps.** Their tables start with a text column, but `stepsOf` needs a number in the first cell (`activePlay.ts:29`), so every call gets "isn't a step of this play".
- **`docs/harnesses/README.md` says `getGuide({ ask })` "does the same matching".** It is a different algorithm, floor and outcome.

### The play state

- **One play per process, never cleared.** `active` is a module global (`activePlay.ts:21`) and `clearActivePlay` is called only in tests. The first play loaded, possibly a wrong one from `ask`, stays active.
- **Any play unlocks every send.** `playRefusal` checks only that some play exists (`activePlay.ts:63`), so a Discord play unlocks an X DM.
- **`PLAY_REQUIRED` covers 8 tools; 18 live acting tools are ungated** (X): the X post, like, repost, follow and react tools; Reddit post and reply; Discord delete, react and voice; Slack react and voice; Instagram react and voice; four flow tools.
- **The play text cites rule 157**, which is about drafting from context, not about plays (`guideAnswer.ts:16`).

### The guide each tool points to

27 tools point to another platform's guide (X):

| Tools | Guide they point to |
|---|---|
| adsPower, localAccount, the eight `inspect*` tools, browsers, browserView, logout, whoami | `facebookBrowser` (68.9k chars) |
| flow, flowLive, warmup, warmupLive | `facebookFlows` (78.5k chars) |
| the six `inbox*` tools | `xInbox` (`guides.ts:29` holds `any:inbox`) |
| voice, voiceIndex, voiceAiIndex: the voice gate every Discord, Slack and Instagram send passes | `xSending` (128k chars) |
| sessionsCheck | `accountsAndProxies`, "Accounts in Twenty" (`guides.ts:36`) |

- **38 flow tools are Facebook flows with no platform in their names** (`flowPostComment`, `flowProfilePost` and so on). Their text hard-codes Facebook while the title says "the platform" (`src/mcp/server/helpers/toolsFromFlows.ts:14,19,23,30-31`).
- **The skills embedded in those guides are Facebook skills.** A Discord sign-in loads `logMcpInstructions`, `facebookBrowser` and `accountsAndProxies`: about 27k tokens, most of it about Facebook.
- **Guides always carry the shell text.** `scripts/docs/buildDocs.ts:90` renders every guide with `shell: true`, so a hosted client is still told to start a Monitor on a log file.
- **12% of all guide text is repeated paragraphs** (85k of 726k chars). The "Current scope" block appears 22 times (`guides.ts:181`).
- **Developer rules in operator text.** `CONSOLIDATED_RULES` (`agentRules.ts:149-267`) maps old operating rules onto developer rules, so 103 tools cite rule 2 (code layout) and 102 cite rule 175 (schema). 38 tools list rule 30 twice.
- **The owner's name is in every tool description** (386 times), 958 times in guides, and in the server instructions, all served to hosted teams, against rule 47.

## 3. Stale and contradictory content

**Rule citations to rules that aren't in the current AGENTS.md** (X):

| Where | Citations | Dead | Worst |
|---|---|---|---|
| `docs/useCases` (hand-written) | 160 | 78 | `facebook/marketplaceListings` 10, `twitter/replyGuyFunnel` 9, `inbox/voiceNote` 8 |
| `skills/` (hand-written) | 248 | 124 | inspect 14, flow 12, accountToDryRun 11, agentHooks 10 |
| `docs/guides` (generated) | 4,350 | 304 | xSending 57, facebookBrowser 53 |
| generated skills | 233 and 239 | 79 and 82 | copied from the use cases |
| Tool descriptions at runtime | 3,280 | 85 | rule 10 in the live line (`toolsFromCommands.ts:107`) |
| Rule numbers written as literals | | | `toolsFromCommands.ts:64,71,83,94`; `src/agentHooks/registry/index.ts:30-47`; `src/agentHooks/answers/client.ts:96,134` |

**Hooks contradict each other (R).** The page-state hook says to run `log inspect do snapshot` (`src/agentHooks/pageState/index.ts:28`), the knowledge hook says `log kb search` (`answers/client.ts:96`), and the storage verdict says `log runs prune --apply` (`src/browser/runStore/helpers/storageVerdict.ts:5`). The live-log hook then refuses all three as hand-run shell commands.

**Twenty-era text (R).** The knowledge hook, the `accountsAndProxies` topic and the notes for `connect` and `join` (`toolsFromCommands.ts:83,91`) still describe Twenty. The guides mention it 210 times.

**The Hermes plugin's skills (R, I).** `hermesPlugin/skills/*` never call `getGuide`, so their own sends are all play-gated and are refused with `playMissing`. They name tools `mcp__log__*`, which is right for a plugin install: Hermes names a portable plugin's tools `mcp__<server>__<tool>` ([sources.md](sources.md)). `docs/harnesses/hermes.md` gives `mcp_log_*`, the name for a server added in `config.yaml`, and doesn't say the two differ.

**No deterministic check covers use cases (R).** `check:useCases` is a paid review that reads Claude Code session files only (`scripts/checks/checkUseCases.ts`), and it is in neither `lefthook.yml` nor the `check` script.

**Generated or hand-written:**

- Generated: `docs/guides/*` (`scripts/docs/buildDocs.ts:88-152`); `.claude/skills/log-*` and the site's skills (`scripts/docs/syncSiteSkills.mjs:53-78`); `.claude/settings.json` and `.codex/hooks.json` (`scripts/checks/checkAgentHooks.ts:19`).
- Hand-written: `docs/useCases/**`, `skills/**`, `docs/harnesses/*`, `SERVER_INSTRUCTIONS`, `CONSOLIDATED_RULES`, `NOTES`, the hosted `INSTRUCTIONS`, `hermesPlugin/**`, `.opencode/plugins/logHooks/**`, `.agents/hooks.json`, `scripts/hooks/antigravity.ts`.

## 4. What each harness actually gets, from the code

`HookHost` is `claudeCode | codex` (`src/agentHooks/registry/types.ts:12`), and `hooksFor()` is used only by the checker. Nothing installs hooks or skills for a user: `log launch --setup` installs only opencode's, and prints an `mcp add` line for Claude Code and Codex (`src/cli/launch/index.ts:87-88`, `launch/helpers/setup.ts:99`). So the hooks run only when the session's project is the log checkout.

| Path | Claude Code in the repo | Claude Code elsewhere | Codex in the repo | Cursor | Claude app, ChatGPT, Grok (hosted) | Hermes plugin |
|---|---|---|---|---|---|---|
| Server instructions | local text | local | local | local or hosted | hosted text | local |
| Prompt router | hook, suggests | `getGuide({ ask })` only | hook | `getGuide({ ask })` only | `getGuide({ ask })` only | `getGuide({ ask })` only |
| Play restored after compaction | yes | no | unlikely (I) | no | no | no |
| Watchers start, pending messages delivered | yes | no | yes | no | no | no |
| Page state, queue, inbox mid-task | yes | no | yes | no | no | no |
| Stop held on a resolvable browser | yes | no | yes | no | no | no |
| Play footer per call | yes | yes | yes | yes | no | yes |
| Result `next` and `browsers` | yes | yes | yes | yes | stripped | yes |
| Skills | 38 | none | none | none | none | 2, hand-written |
| Plays that can run | 38 | 38 | 38 | 38 | 6 of 38 (`python/controlService/tools.py:1-21`) | 38, but its skills' sends are refused |

**What a harness without hooks silently loses:**

1. The router runs only if the model chooses to call it, and it is the weaker one.
2. Every live watcher and the media describer. They are started only by `inboxAnswer` (`answers/client.ts:128-132`), the only caller of `ensureLiveWatchers`.
3. Delivery of pending messages; `takePending` is called only there.
4. Browser state, its resolvers and the stop guard.
5. The chat-name and shell refusals.
6. The play after compaction.
7. The X queue and live feed.
8. Engine and governor freshness, and storage warnings.

**Hard-coded to Claude Code (R):** `.claude/` paths and `CLAUDE_PROJECT_DIR` (`registry/index.ts:51,62`); the `mcp__log__` prefix (`registry/index.ts:9,44,98`, `src/contextLayer/session/types.ts:3`, `src/agentHooks/chatNames/index.ts:10`); `SHELL_CLIENTS` (`toolsFromCommands.ts:56`); the knowledge base's memory root (`src/cli/kb/index.ts:57`); `src/useCases/review/client.ts:9`.

## 5. Files to change

| Fix | File | What changes |
|---|---|---|
| **One router for every harness** | `src/useCases/router/client.ts`, `types.ts` | one `route(prompt, context)` for both paths; the platform word is weighted; placeholders are ignored; ties are broken by platform, never by folder order |
| | `src/mcp/server/helpers/guideAnswer.ts` | `ask` calls the same router; no activation on a tie |
| | `scripts/contextLayer/service.ts`, `src/contextLayer/hook/client.ts` | thin callers of the shared router |
| | `src/useCases/router/fixtures/` (new) | golden prompts with their expected play |
| | `docs/useCases/**` (10 pages) | add the asks lines; give the Facebook pages numbered step tables |
| **Play state** | `src/mcp/server/helpers/activePlay.ts` | per session; it expires; `playRefusal` checks the play covers the tool; `PLAY_REQUIRED` derived from the tool's effect |
| | `src/cli/runtime/index.ts:29-35,117` | the hosted path applies the footer and keeps `next` |
| | `src/contextLayer/session/client.ts` | restore plays loaded with `ask`; a transcript reader per harness |
| **Guides by capability and platform** | `src/mcp/server/helpers/guides.ts:22-45` | shared topics `accountBrowser`, `flows`, `inbox`, `voiceGate`, `sessions`; the Facebook and X topics keep only their own commands |
| | `scripts/docs/buildDocs.ts:90,106-141` | shell and no-shell variants; shared rules and scope once, not 22 times |
| | `src/mcp/server/helpers/guides.ts:176-199` | cite rules by id, not the full text in every guide |
| | `src/mcp/server/helpers/toolsFromFlows.ts` | the platform from the flow definition; prefixed names with aliases |
| | `skills/{host,inspect,profileSetup,humanMouse,warmup,flow}/SKILL.md` | Facebook-specific sections split out of the skills that shared topics embed |
| **Text injected by tools** | `src/mcp/server/helpers/toolsFromCommands.ts:64,70-71,83-95,107` | rule numbers checked against the current rules; no Twenty text; "the owner", not a name |
| | `src/mcp/server/helpers/agentRules.ts:149-283` | operator rules split from developer rules; the rules line deduplicated |
| | `python/controlService/mcpRoutes.py:18-24` | generated from the same source as `SERVER_INSTRUCTIONS` |
| **Hooks as adapters from one contract** | `src/agentHooks/registry/types.ts`, `index.ts` | `HookHost` covers claudeCode, codex, opencode, antigravity, cursor and hermes; a capability table per harness |
| | `.opencode/plugins/logHooks/**`, `.agents/hooks.json`, `scripts/hooks/antigravity.ts` | generated from `AGENT_HOOKS` |
| | `src/cli/launch/index.ts:87-88`, `src/cli/launch/helpers/setup.ts`, `start.ts` | install user-level hooks and skills for each harness |
| | `hermesPlugin/` | the 38 play skills, generated. A portable plugin can't register hooks, so the router hook needs a native plugin (`plugin.yaml`, `__init__.py`) beside it or in its place |
| | `src/agentHooks/answers/client.ts:92-138` | watchers and the describer start from the runtime or the MCP server too; the X-only hooks become per platform; MCP tool names, not shell lines |
| | `src/agentHooks/pageState/index.ts:28`, `src/browser/runStore/helpers/storageVerdict.ts:5` | name MCP tools |
| | `src/mcp/server/helpers/toolsFromCommands.ts:56-60` | shell detection per harness from the capability table |
| | `src/cli/kb/index.ts:57`, `src/useCases/review/client.ts:9` | harness-neutral memory and session sources |
| | `docs/harnesses/*.md`, the README's install section | generated from the harness table |
| **Stale-content checks** | `scripts/checks/` (new), `lefthook.yml`, `package.json` | the checks below |
| | `docs/useCases/**`, `skills/**` | rewrite the 78 and 124 dead rule citations, the Twenty text and the old names |

## The ten fixes, each with a check

| # | Fix | Check |
|---|---|---|
| 1 | One shared router; `ask` and the hook call it | `check:router`: golden prompts hit the expected play, or none, on both entry points with the same output |
| 2 | Platform-aware scoring, no activation on a tie | no prompt naming one platform activates a play under another platform's folder |
| 3 | Every use case has asks and numbered steps | `check:useCases` made deterministic and added to the hooks: an asks line, at least one parsed step, every step's tool exists |
| 4 | Play state per session, expiring, covering the tool | a play for one platform does not unlock a send on another; `PLAY_REQUIRED` contains every live send tool |
| 5 | Shared guide topics | `check:platformNeutral`: no tool's guide topic starts with another platform (27 today); flow tools carry a platform |
| 6 | No dead rule citations in any injected text | `check:ruleCitations` over use cases, skills, guides, tool descriptions and hook text |
| 7 | Hooks generated for every harness and installed by setup | `check:agentHooks` covers every `HookHost`; a test that setup writes user-level hooks for each |
| 8 | Watchers and inbox delivery not tied to hooks | starting the MCP server or the runtime with no hook starts the watchers; pending messages can be read as a tool |
| 9 | The hosted path keeps the footer, `next` and the same instructions | the hosted result for a played tool has the footer and `next`; the hosted instructions equal the generated text |
| 10 | A budget on injected text | `check:injectionBudget`: fails when a guide, the average tool description or the boilerplate share grows past a committed baseline; no owner name in hosted text; no shell `log …` lines in hook output |
