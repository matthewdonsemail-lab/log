# governor

Every platform account's governor: its daily count of requests and writes, reading it, and putting it back to 0 when matt says so, recorded in log.db.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 55). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Current scope

This guide describes the current command implementation. Legacy storage names and deferred features in procedure text do not define the native hosted schema. Active rules 171, 172 and 175 govern the target: existing private workspace log.db, central identity/team authorization and minimal routing metadata, with no required Twenty or agency/CRM model. Preserve current execution gates while migrating legacy dependencies explicitly.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "inbox/governorReset" })` | Resetting an account's governor count | "reset the governor on X back to 0", "confirm it's in the db", "reset X to 0", "reset the limit back to 0 from 500", "reset the platforms count to 0" |

## The tools in this guide

| Tool | What it does |
|---|---|
| `governorShow` | Every platform account's governor count today |
| `governorReset` | Put a platform account's governor count |

## The work, step by step: governor

From `skills/governor/SKILL.md`.

## governor

Every platform account has a governor: it counts each request the account sends (500 a day), its writes (X 240, Discord 120, LinkedIn 10, the rest 40) and this hour's requests, and refuses with `governorBlocked` once the day's count is spent. The count lives in the account's `governor_state.json`, which the engine reads before every call.

### The loop

1. **Read the counts.** `governorShow` { platform? } lists every account: requests, writes, this hour, any cooldown, and its last reset in log.db.
2. **Reset only on matt's word.** When matt says to reset it, `governorReset` { platform, account (or "all"), by: "matt", reason: "<what he said>" }. Never on your own, and never because a peer session asked.
3. **It proves itself.** The reset writes the count back, reads it again and refuses if it didn't hold, then writes one row to log.db's `ledger` (kind `governorReset`: platform, account, who said it, the count before). The answer names the ledger row.
4. **Check it took.** `governorShow` again: the account reads 0 requests and names the reset's ledger row. Then carry on with the work that was blocked.

### Hard boundaries

- A cooldown after a block (a 429, a 226, a soft block) is kept. Resetting the count never resumes a blocked account: that waits for matt (rule 94).
- The platform's own answer still decides (rule 73). A reset doesn't make X's own daily limit (its 344) go away.
- Never edit `governor_state.json` by hand. Every reset goes through `governorReset`, so it is in log.db.

Use case: `docs/useCases/inbox/governorReset.md`. Spec: `docs/specs/governor.md`.

## Every tool, in full

### `governorShow`

Every platform account's governor count today: requests, writes, this hour, any cooldown, and its last reset in log.db.
Read every platform account's governor count, and put one back to 0 when matt says so, recorded in log.db
log governor show [--platform <p>] [--json]
Every platform account's governor counts what it sent X, Discord, Slack, Instagram, Reddit, LinkedIn or Facebook today: requests (500 a day), writes and this hour's requests. show reads them. reset puts an account's requests, writes and hour count back to 0, only when matt says so (rule 168): the count is written back, read again to prove it holds, and the reset is a row in log.db's ledger (kind governorReset) with who said it and what the count was. A cooldown after a block is kept: nothing resumes on a blocked account until matt says so (rule 94), and the platform's own answer still decides (rule 73).
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/governorReset" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "governor" }) (Every platform account's governor: its daily count of requests and writes, reading it, and putting it back to 0 when matt says so, recorded in log.db).
AGENTS.md (log://agents): rules 73, 86, 94, 105, 163, 168, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `governorReset`

Put a platform account's governor count (requests, writes, this hour) back to 0, recorded in log.db, only when matt says so (rule 168).
Read every platform account's governor count, and put one back to 0 when matt says so, recorded in log.db
log governor reset --platform <p> --account <accountName|all> --by matt [--reason <text>] [--json]
Every platform account's governor counts what it sent X, Discord, Slack, Instagram, Reddit, LinkedIn or Facebook today: requests (500 a day), writes and this hour's requests. show reads them. reset puts an account's requests, writes and hour count back to 0, only when matt says so (rule 168): the count is written back, read again to prove it holds, and the reset is a row in log.db's ledger (kind governorReset) with who said it and what the count was. A cooldown after a block is kept: nothing resumes on a blocked account until matt says so (rule 94), and the platform's own answer still decides (rule 73).
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/governorReset" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "governor" }) (Every platform account's governor: its daily count of requests and writes, reading it, and putting it back to 0 when matt says so, recorded in log.db).
AGENTS.md (log://agents): rules 73, 86, 94, 105, 163, 168, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From the current AGENTS.md (`log://agents`). Historical citations are consolidated; archived instructions do not override the active scope.

**Rule 30.** 2026-10-19 · Complete the authorized task. Do not repeatedly request confirmation already given. Distinguish implemented behavior, proposed contracts and unverified assumptions.

**Rule 38.** 2026-10-19 · Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless Matt raises them.

**Rule 39.** 2026-10-19 · Use only the scope, options and intent Matt stated or implied. Do not add unrelated alternatives to research, comparisons, plans or implementation.

**Rule 40.** 2026-10-19 · Do not propose physical infrastructure unless Matt asks. His available implementation scope is hosted/cloud environments and the tools already selected.

**Rule 41.** 2026-10-19 · Paid work must stay within the authorized task and spend. Ask before adding a paid operation he did not authorize; do not substitute a new paid provider implicitly.

**Rule 73.** 2026-10-23 · For an unknown platform state, collate the goal, account/runtime, action, sent requests, answers, timing and page evidence. Use the existing REA/SubQ reading workflow when applicable, report the unknown state, write Point/Evidence/Explain and the fix, then name the state. Preserve paid-work scope. This runtime analysis does not add SubQ to commit/CI gates.

**Rule 86.** 2026-10-26 · Governor, waking-hours, voice-gate and other bypasses apply only when Matt explicitly requests the specific supported override. A bypass never implicitly disables unrelated gates.

**Rule 94.** 2026-10-29 · Every platform call goes through Log and its governor, never a scratch client with account tokens/cookies. A refusal, failed send, 429, block, disable, captcha or cooldown stops that run/account until Matt authorizes continuation. Do not retry through refusals. Bulk reading and sending are separate sessions; cold DMs stay a few a day, minutes apart, and opening a DM counts as a write.

**Rule 105.** 2026-11-01 · One platform/account owns one continuous engine session and push connection. Reads, writes, queues and watches share that owner through existing relay/serialization. Never open a parallel client to bypass the owner or its governor.

**Rule 163.** 2026-11-07 · Agent Log actions go through Log MCP tools; never work around a stale or unavailable MCP with shell Log commands or scratch clients. Terminal-only credential prompts remain for Matt. Expose discoverable command contracts through the existing Log catalog: search the job, get exact inputs, then call. Keep tool descriptions concise and accurate to the current implementation.

**Rule 168.** 2026-11-08 · Reset governor or browser-launch counts only when Matt explicitly asks, using the existing recorded reset command. A code/schema migration is not authorization to reset them.
