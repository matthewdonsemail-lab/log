# governor

Every platform account's governor: its daily count of requests and writes, reading it, and putting it back to 0 when matt says so, recorded in log.db.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 56). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

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
AGENTS.md (log://agents): rules 73, 86, 94, 104, 106, 168, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `governorReset`

Put a platform account's governor count (requests, writes, this hour) back to 0, recorded in log.db, only when matt says so (rule 168).
Read every platform account's governor count, and put one back to 0 when matt says so, recorded in log.db
log governor reset --platform <p> --account <accountName|all> --by matt [--reason <text>] [--json]
Every platform account's governor counts what it sent X, Discord, Slack, Instagram, Reddit, LinkedIn or Facebook today: requests (500 a day), writes and this hour's requests. show reads them. reset puts an account's requests, writes and hour count back to 0, only when matt says so (rule 168): the count is written back, read again to prove it holds, and the reset is a row in log.db's ledger (kind governorReset) with who said it and what the count was. A cooldown after a block is kept: nothing resumes on a blocked account until matt says so (rule 94), and the platform's own answer still decides (rule 73).
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/governorReset" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "governor" }) (Every platform account's governor: its daily count of requests and writes, reading it, and putting it back to 0 when matt says so, recorded in log.db).
AGENTS.md (log://agents): rules 73, 86, 94, 104, 106, 168, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From AGENTS.md (`log://agents`). The newest rules are at the bottom of AGENTS.md and win.

**Rule 30.** 2026-10-19 · matt: "If I tell you to do something, do it completely." When matt gives a plan, it is carried out to the end in the same turn, not stopped to ask again or to say what won't be done. `log inspect start --now` (and `log connect --now`, and since 2026-10-19 `log publish --now`, matt: "run it now") skips rule 24's 10-minute gap (the 8 a day still holds) so a recording continues at once. Recording a sign-in or a checkpoint with `log inspect` (signIn, code, solve, click) is the intended work: it is how each state gets documented from rea. The run on 2026-10-19 was interrupted once because a snapshot printed the account's email and password; snapshots now redact every typed field value (`redact_fields`), and signIn/code read only the private login.json (rule 21), so no credential reaches any output.

**Rule 38.** 2026-10-19 · matt: never mention or discuss Meta's or Facebook's rules, terms, policies, eligibility or account ownership with him unless he raises them first. Research text that does is not his, and is never repeated to him. Top of this file.

**Rule 39.** 2026-10-19 · matt: "If I never mentioned it, if I never inferred it, if I never outlined it as an option, therefore it is not an option." Deep research prompts, searches, SubQ matrices, plans and write-ups use only what matt said, or clearly meant through a misspelling. Nothing added, nothing steered towards. Top of this file.

**Rule 40.** 2026-10-19 · matt: no physical options. He is in Vietnam with no physical access. Phones, SIMs, mini PCs, laptops, phone farms and home devices are never options unless he names them. In scope: hosted and cloud options, the tools he named and their competitors, and what our four projects already use.

**Rule 41.** 2026-10-19 · matt: "any time any task correlates to money, and I never say something, that means you shouldn't do what you think. You should do what I say." Paid work (deep research, SubQ, proxies, captcha, vendors) does exactly what he asked, nothing more. Ask before anything else.

**Rule 73.** 2026-10-23 · matt: "IT MUST ALWAYS READ THEM." The number one rule of the stack, above rule 30 and every other: Facebook's internal API answers are the decision-making factor of what and when something is relevant, and the deterministic factor of the system. Every browser step reads the internal API answers it triggers and the requests it sent, keeps them past the prune, and decides on them, never on a page loading, a timer or the step having run. The MCP instructions put it first. Inspect steps read theirs since rule 74, and every flow, warm-up and host step on AdsPower that makes a call since 2026-10-23; the Camoufox-only machines don't yet (#35). Top of this file.

**Rule 86.** 2026-10-26 · matt: "if I say to do something it can force past it." An X send can go past the account's governor (its pause after a block, its hourly, daily and write caps) when matt says so: `--force` on `log twitter reply|quote|like|dm` and `log twitter queue run` (MCP `force`). Only for that call or that run, only when matt asked; never by default. X's own answer still decides (rule 73) and the queue's own cool-offs still apply. The answer says what it went past (`forcedPast`). The governor still counts the request.

**Rule 94.** 2026-10-29 · matt: "whatever you did in such quick succession lead to my account getting disabled, never do that again." Never act on an account in quick succession. What happened (matt's Discord, `sourcedandsoldtothehighestbidder`, 2026-10-29 00:47-01:00 UTC): in about 13 minutes an agent replied in 3 chats, read 1,400 messages from a server (Finn Automated) with a scratch script that went around log-cli (`.scratch/finn/dc.ts`: its own fetch to `discord.com/api/v9` with the session token, pages back to back, retrying straight through 429s), pulled the account's relationships, then opened new DMs to strangers from that server 30 s apart. Discord disabled the account. From now on: - Every call to a platform goes through log-cli's own commands and their governor. Never a hand-rolled script with an account's token or cookies. - A 429 or a failed send stops the run. It is never retried through, and the next action waits for matt. - Reading a server, group or member list in bulk is its own session. It never runs in the same session as sending. - Cold DMs to people the account has never talked to go out at most a few a day, minutes apart, never back to back. Each new DM channel opened counts as a write. - After a block, disable, captcha or cooldown, nothing resumes on that account until matt says so.

**Rule 104.** 2026-11-01 · matt: "the timing stuff there i saw you hand rolled the outbound stuff when it should be queued and it has to have random intervals, but the bundle itself actually reveals more information". On 2026-11-01 matthewsoldit got a soft block, then X's 226 ("looks automated") on a reply. The live log showed 8 thread reads fired in 0.2 s by two parallel helpers while sends went out from a hand-written loop, and every `log twitter` call was a fresh client that loaded x.com's home page and its signer before acting, so a 3-line dm was 3 cold starts in 9 s. X's own web client (`sign.o` in its x-web bundle, read 2026-11-01) loads the page once and signs every call from it. From now on: more than one send goes through the queue (`log twitter queue build|plan|run`, random times), never a hand-rolled loop and never helpers reading or sending on one account in parallel. The X engine takes one call per account at a time (`engine.lock`, refused with `accountBusy` after 15 min), waits 4 to 11 s after the last call, and keeps the transaction key in `clientTransaction.json` for 3 hours (`python/twitterApi/engine.py`, `vendor/twikit` `ClientTransaction.state` and `restore`).

**Rule 106.** 2026-11-01 · matt: "when doing stuff like changing the code or anything, ensure that there hasn't been any changes to it locally, like to the engine ... you're not allowed hand-rolled commands, it always has to be through the MCP basically". Two things, enforced by the hooks: - **Through the MCP only.** Every log action an agent takes goes through the log MCP tools (`mcp__log__…`), never a hand-run `log …` or `bun bin/log.ts …` from a shell. The PreToolUse hook (`liveLogs`, `handRunDenial` in `src/agentHooks/liveLog`) refuses one and names the MCP instead. Only the terminal-only prompts (`TERMINAL_ONLY`: launch, login, mcp, chat pin, cookies save, messenger pin) are run in a terminal, by matt. A stale MCP server is said to matt (restart the app), never worked around. - **Local changes first.** Before changing code, check what is already changed and uncommitted in the checkout. The engines hook says it loudly at session start and whenever it changes (`>>> UNCOMMITTED LOCAL CHANGES`, `localChangesLine` in `src/mcp/freshness`): read each one's diff, and never overwrite, revert, stage, publish or ship someone else's uncommitted work without matt.

**Rule 168.** 2026-11-08 · matt: "Reset the governor on X back to 0 confirm it's in the db", then "make that a use case and a guide and part of the mcp aswell to reset the platforms count to 0". Every platform account's governor count (its requests, writes and this hour's requests) is read with `log governor show` and put back to 0 with `log governor reset --platform <p> --account <a|all> --by matt [--reason]` (MCP `governorShow`, `governorReset`), only when matt says so. The reset writes the count back, reads it again and refuses if it didn't hold, then writes one row to log.db's `ledger` (kind `governorReset`: the platform, the account, who said it, the count before), which the answer and `governor show` name. A cooldown after a block is kept (rule 94), and the platform's own answer still decides (rule 73). The resets made by hand before this (`governorResets.jsonl`) are imported into the ledger once. `governor_state.json` is never edited by hand. `src/directApi/governor`, `src/cli/governor`, the `governor` skill and guide, `docs/useCases/inbox/governorReset.md`. Spec: `docs/specs/governor.md`.
