# AGENTS.md — Log

Current instructions, consolidated at Matt's request on 11 November 2026.

## Current implementation scope

Log is platform agnostic. The current work specifies an independent hosted MCP/control service around the existing private workspace SQLite runtime. Start with [the native schema](docs/proposals/listeningKitSchema.md), [the data boundary](docs/proposals/listeningKitNativeData.md) and [instance contracts](docs/proposals/listeningKitInstanceContracts.md).

The native target has no required Twenty service, generated agency domain model or CRM/SMS schema. Old listing/campaign features are deferred. The current code still has legacy account/session dependencies: migrate them explicitly; do not claim specification changes removed them.

Treg supplies the accepted identity/control reference. Website sign-in uses email OTP and explicit team selection. Private accounts, sessions, inbox content and execution remain in the selected persistent cloud workspace. Own-cloud and Boat share that runtime contract. AI-provider login is optional future work, not a prerequisite for V1.

## Rule one: if we do not know

Read the internal request/response evidence and collate the goal, account/runtime, action and timing. Use the scoped REA/SubQ workflow where applicable, report unknown states and record Point/Evidence/Explain. See active rules 25, 29 and 73. A platform refusal or checkpoint remains a stop.

## How to read these instructions

Use the current task and active rules below. Stable rule numbers are retained for tool citations; gaps are intentional. Consolidated rule mappings and the full historical snapshot live in [the rule archive index](ruleHistory/index.md). Do not load the full archive as active instructions.

For platform work, read the relevant skill/use-case and current domain spec. Platform browser gates, current account-specific limits and credential formats remain enforced by existing implementations. Do not turn their historical storage conventions into a new native schema.

## Hard rules (from matt)

1. 2026-10-18 · Use camelCase for owned files, folders, values, ids, statuses and error codes. Convert external naming once at the boundary. See docs/namingConventions.md.

2. 2026-10-18 · Put platform code under src/<platform>/<area>/<domain>; shared code stays in its shared library/domain. Use index.ts, types.ts, client.ts, machine.ts and helpers where appropriate. Keep scripts and Python in domain folders.

4. 2026-10-18 · Commit and push as Matt to GitHub origin. Preserve unrelated work and inspect current changes before editing. Never bypass hooks.

5. 2026-10-18 · Each commit needs its AST-backed day-log entry, written by the pre-commit hook to the private devlog (`LOG_DEVLOG_DIR`, default `~/.logCli/devlog/<UTC-date>.md`), never into the repo. Follow skills/commitLog/SKILL.md; never fabricate or hand-edit the generated AST evidence.

6. 2026-10-18 · Processes that run over time use XState machines and observable stages through the existing CLI/trace infrastructure.

7. 2026-10-18 · Keep reusable procedures in skills/<camelCaseName>/SKILL.md and skills.md. Update the relevant skill when a procedure changes. Keep task history out of reusable instructions.

8. 2026-10-18 · Platform actions require the user authorization their tool defines. Send, post, react, join, edit and delete only when authorized; preserve explicit live confirmation, governor and account gates. Ordinary reads do not need new approval.

19. 2026-10-18 · Every browser action records its raw HAR and timed step evidence, with no switch to disable capture. Raw private captures may contain credentials. Keep them in the selected private runtime/browser-host storage, never in git, central payload logs or user-facing output. Retention/pruning must preserve required analysis evidence.

25. 2026-10-19 · Fix failed or unfamiliar behavior from its own recorded action/request/response timeline. Identify the first response deciding the outcome, compare evidence, then change the machine. Do not infer success from a screen, timer or completed tool call.

26. 2026-10-19 · Stream progress while work runs, one meaningful line per stage, with the run log retained. Explain stages in plain words; do not leave the user waiting silently for a final buffered result.

29. 2026-10-19 · Record a browser page with the existing inspect tool before implementing actions on it. Preserve per-step snapshots, screenshots, HAR and the reading of the internal calls.

30. 2026-10-19 · Complete the authorized task. Do not repeatedly request confirmation already given. Distinguish implemented behavior, proposed contracts and unverified assumptions.

31. 2026-10-19 · Turn a repeatable recorded browser procedure into its flow, deterministic machine, documentation and matching CLI/MCP surface. Confirm each consequential step by the request and answer it causes.

35. 2026-10-19 · Browser work uses one account browser through its active day, with actions as tabs/steps; close only for a logged lifecycle reason. Preserve existing proxy-country, locale/timezone, device/profile, headed visibility, capture, active-hours and launch-budget gates. Keep checkpoint stops and account-specific constraints in the browser/flow guides. Do not create a fresh browser per action.

38. 2026-10-19 · Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless Matt raises them.

39. 2026-10-19 · Use only the scope, options and intent Matt stated or implied. Do not add unrelated alternatives to research, comparisons, plans or implementation.

40. 2026-10-19 · Do not propose physical infrastructure unless Matt asks. His available implementation scope is hosted/cloud environments and the tools already selected.

41. 2026-10-19 · Paid work must stay within the authorized task and spend. Ask before adding a paid operation he did not authorize; do not substitute a new paid provider implicitly.

44. 2026-10-20 · Keep browser-independent actions on the shared Playwright layer. AdsPower is a driver; shared gates, recording, motion and flows must not be forked per browser.

47. 2026-10-20 · CLI, MCP, hooks and guides share the current instructions. Hosted product clients receive appropriately scoped product guidance, not a server owner's personal secrets or memories. A target design does not mean the current MCP/runtime dependencies have already migrated.

53. 2026-10-20 · Verify current external facts from sources. Use the connected tools and applicable guide first for platform/account work; do not invent provider capabilities or production infrastructure from memory.

55. 2026-10-20 · Keep CLI commands, MCP catalog/tools, hooks and generated documentation aligned. Change their source and regenerate the affected surfaces; do not hand-edit generated guides.

63. 2026-10-22 · Platform commands are log <platform> <command> <what>. Shared commands remain shared. Preserve the naming boundary described in docs/commandNaming.md.

66. 2026-10-22 · Prune recordings only through the existing evidence-aware routine after analysis and documentation requirements are satisfied. Keep findings, exchanges and required recovery evidence; do not delete private data as incidental cleanup.

70. 2026-10-22 · Owned TypeScript, JavaScript and Python code carries no comments/docstrings under the existing naming/comment gates. Explain implementation in documentation and meaningful names.

73. 2026-10-23 · For an unknown platform state, collate the goal, account/runtime, action, sent requests, answers, timing and page evidence. Use the existing REA/SubQ reading workflow when applicable, report the unknown state, write Point/Evidence/Explain and the fix, then name the state. Preserve paid-work scope. This runtime analysis does not add SubQ to commit/CI gates.

79. 2026-10-25 · Flow controls must match deterministically by the recorded role/name and scope; ambiguous, missing or disabled controls refuse. Await the confirming API answer. Known resolvable states follow their recorded resolver; checkpoints/refusals remain stops.

83. 2026-10-25 · New platforms use the existing scaffold, shared account/session boundary, command/catalog wiring, platform documentation and spec anchors. Native hosted scaffolds must not recreate a Twenty dependency.

86. 2026-10-26 · Governor, waking-hours, voice-gate and other bypasses apply only when Matt explicitly requests the specific supported override. A bypass never implicitly disables unrelated gates.

89. 2026-10-26 · Find conversational context by scoped search and existing private records. Do not reread every thread for a single person or task.

90. 2026-10-28 · Preserve platform message splitting: draft lines send as separate messages unless Matt explicitly requests the supported asOne behavior.

94. 2026-10-29 · Every platform call goes through Log and its governor, never a scratch client with account tokens/cookies. A refusal, failed send, 429, block, disable, captcha or cooldown stops that run/account until Matt authorizes continuation. Do not retry through refusals. Bulk reading and sending are separate sessions; cold DMs stay a few a day, minutes apart, and opening a DM counts as a write.

103. 2026-10-31 · The public log repository on origin is the working repository. Keep archived repository references as history, not implementation destinations.

105. 2026-11-01 · One platform/account owns one continuous engine session and push connection. Reads, writes, queues and watches share that owner through existing relay/serialization. Never open a parallel client to bypass the owner or its governor.

109. 2026-11-01 · Read the full relevant chat and current private context before drafting or sending. Include media/transcript/attachment context and pending queued actions; hold a send if required context cannot be obtained. Follow the selected channel's voice and task-brief contract. Cold outreach excludes existing conversations through the current prior-conversation check; bypass it only when Matt asks.

117. 2026-11-02 · Current behavior belongs in its domain spec with code anchors; generator/wiring changes update that spec and relevant use cases. Distinguish implemented anchors from future design. Rule 170 governs which checks run automatically.

123. 2026-11-03 · Platforms use their existing push/watch path to keep private records current. Catch up gaps through the account owner and resume only with valid generation/position; do not poll the whole inbox independently per caller.

133. 2026-11-04 · Claim a chat before acting; consult recent actions, preserve claim generation and check it before subsequent message parts. A lost claim stops the remaining send. Release when done; retain claim/action evidence in the existing private store.

134. 2026-11-04 · Existing workspace log.db is the native private record/coordination foundation. Preserve events, stable identities, chats/messages, attachments/interactions, claims/owners/cursors, queues/jobs, media/search and records/state. Keep current WAL/migration/version semantics and transaction boundaries; unknown events retain source payload and are surfaced for analysis. Only proven projections are rebuildable.

137. 2026-11-04 · Preserve current context-aware voice and AI-artifact gates for messages sent as Matt. Rework refused drafts from the stated cause. Exact-message overrides and dictated/translated voice-note exceptions require Matt's request and preserve remaining artifact checks. Do not treat an exception as permanent permission.

138. 2026-11-04 · Media and voice-note context uses the existing private media descriptions and transcripts. Do not claim to have understood undescribed media. Preserve hash-based deduplication, private storage and the one describer process.

142. 2026-11-05 · Send a cloned voice note only when Matt asks, through the platform's native voice-note tool and existing provider adapter. Use his authorized words, requested language/translation and pronunciation checks. Follow the voice-note guide for exact behavior; do not turn historical sample/model choices into a new global deployment requirement.

154. 2026-11-05 · Show people/chats by meaningful names and handles; keep routing ids internal unless needed for the specific technical artifact. Do not show a person as a bare UUID.

157. 2026-11-07 · Draft from each recipient's actual context. Do not fill a queue with interchangeable copy or mechanically reword the same message for everyone.

158. 2026-11-07 · Select the relevant guide/use case from the task. Read the guide before using its Log tools and carry context across the full workflow; do not require Matt to remember internal command names.

160. 2026-11-07 · Answer eligible chat reads from log.db when the owner is live, caught up and the needed history is present/backfilled. Otherwise fill the missing scope once through the owner. A refused catch-up is a refusal, never a reason to bypass it with another live read. Report the read source.

163. 2026-11-07 · Agent Log actions go through Log MCP tools; never work around a stale or unavailable MCP with shell Log commands or scratch clients. Terminal-only credential prompts remain for Matt. Expose discoverable command contracts through the existing Log catalog: search the job, get exact inputs, then call. Keep tool descriptions concise and accurate to the current implementation.

164. 2026-11-07 · Use existing provider balance/status and timing diagnostics when needed. Do not buy credit or change paid providers merely because a call failed.

165. 2026-11-07 · Preserve per-stage call timings in the private observability store so latency can be traced to its cause. Keep proposed central metadata free of private payloads.

167. 2026-11-07 · Use supported MCP/runtime reload behavior for changes. Avoid restarting healthy sessions unnecessarily; never silently interrupt active account work or bypass owner locks.

168. 2026-11-08 · Reset governor or browser-launch counts only when Matt explicitly asks, using the existing recorded reset command. A code/schema migration is not authorization to reset them.

170. 2026-11-08 · SubQ is not part of commit, push or CI checks. Existing spec anchor/wiring checks remain; paid semantic/spec reviews run only when explicitly requested. Do not add or run application tests unless the user asks; report checks actually performed and respect required hooks when committing/pushing.

171. 2026-11-11 · Hosted Log moves away from Twenty. Treg is the reference for the accepted FastAPI/SQLModel/PostgreSQL identity/control service. Its schema does not define private platform data; rule 172 fixes that boundary.

172. 2026-11-11 · The selected persistent cloud workspace owns private accounts, credentials/sessions, messages and execution data in existing SQLite plus protected files. Central storage owns identity, team authorization, scoped grants and minimal routing/recovery metadata only. No durable central private payload/message catalog. Use paired outbound routing, fencing and uncertain-write reconciliation; one selected workspace per team in V1.

173. 2026-11-11 · The previously excluded hosting/database provider remains excluded. Follow the accepted Treg deployment reference and distinguish public deployment examples from unverified production infrastructure. Do not silently select a replacement.

174. 2026-11-11 · AdsPower stays the default: provided access through the paid installation or user-owned keys. Keep the installation management key at its host, separate from single-use Log pairing authority; disclose actual browser/profile storage location.

175. 2026-11-11 · Use existing log.db and platform-agnostic engine contracts for native schemas. Do not copy Twenty agency prefixes or CRM/SMS structures. Old listing/campaign functionality is deferred. Add only missing account/credential and hosted execution contracts; preserve existing identity, message, queue, job and governor authorities.

176. 2026-11-11 · Matt requested pruning obsolete agent rules. AGENTS.md is the concise active instruction set; ruleHistory preserves prior instructions as non-authoritative history. Keep platform procedures in their relevant skills/specs and dated one-off incidents out of global instructions. A historical citation does not restore superseded architecture.

177. 2026-11-12 · Website and console errors show as toasts through the shared `@listeningkit/ui` toast, never inline under a field, in a form or on the page. A failed load toasts its error and leaves only a neutral empty state with its Try again action. Errors from embedded widgets (Clerk's form) are hidden in place and raised as toasts.

178. 2026-11-13 · Real people's names, handles, DMs and money never go in tracked files: this repo is public. Anecdotes are anonymised, or marked `<!-- private -->` … `<!-- /private -->` so the site and skill sync drop them (the source stays public, so a private block still holds no real names), and `check:privacy` must pass on every commit and push.

## Checks

Use targeted document/source checks appropriate to the task. Do not add or run application tests unless asked. When committing or pushing, follow the existing hooks and commit-log procedure; do not disable them. SubQ is excluded from automatic gates under rule 170.

## Rule maintenance

Follow [captureRule](skills/captureRule/SKILL.md). Update current guidance and its skill/spec in the same change; record retired rule ids in the archive index. Historical instructions cannot override current storage ownership or scope.
