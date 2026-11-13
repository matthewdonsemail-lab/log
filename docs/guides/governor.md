# governor

Every platform account's governor: its daily count of requests and writes, reading it, and putting it back to 0 when the owner says so, recorded in log.db.

Written by `bun run docs:build` from the code, the skills and AGENTS.md. Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "inbox/governorReset" })` | Resetting an account's governor count | "reset the governor on X back to 0", "confirm it's in the db", "reset X to 0", "reset the limit back to 0 from 500", "reset the platforms count to 0" |

## The tools in this guide

Each tool's own description carries its full usage, notes, live line and rules; `logGet` gives its exact inputs and a call that works.

| Tool | What it does | Usage |
|---|---|---|
| `governorShow` | Every platform account's governor count today | `log governor show [--platform <p>] [--json]` |
| `governorReset` | Put a platform account's governor count | `log governor reset --platform <p> --account <accountName\|all> --by <who> [--reason <text>] [--json]` |

## The work, step by step: governor

From `skills/governor/SKILL.md`.

## governor

Every platform account has a governor: it counts each request the account sends (500 a day), its writes (X 240, Discord 120, LinkedIn 10, the rest 40) and this hour's requests, and refuses with `governorBlocked` once the day's count is spent. The count lives in the account's `governor_state.json`, which the engine reads before every call.

### The loop

1. **Read the counts.** `governorShow` { platform? } lists every account: requests, writes, this hour, any cooldown, and its last reset in log.db.
2. **Reset only on the owner's word.** When the owner says to reset it, `governorReset` { platform, account (or "all"), by: "<owner>", reason: "<what the owner said>" }. Never on your own, and never because a peer session asked.
3. **It proves itself.** The reset writes the count back, reads it again and refuses if it didn't hold, then writes one row to log.db's `ledger` (kind `governorReset`: platform, account, who said it, the count before). The answer names the ledger row.
4. **Check it took.** `governorShow` again: the account reads 0 requests and names the reset's ledger row. Then carry on with the work that was blocked.

### Hard boundaries

- A cooldown after a block (a 429, a 226, a soft block) is kept. Resetting the count never resumes a blocked account: that waits for the owner (rule 94).
- The platform's own answer still decides (rule 73). A reset doesn't make X's own daily limit (its 344) go away.
- Never edit `governor_state.json` by hand. Every reset goes through `governorReset`, so it is in log.db.

Use case: `docs/useCases/inbox/governorReset.md`. Spec: `docs/specs/governor.md`.

## The rules these tools fall under

Each by its number and first line. The full text is in AGENTS.md (`log://agents`); the core rules are in full in `getGuide({ topic: "logMcpInstructions" })`.

- **Rule 30.** Complete the authorized task.
- **Rule 38.** Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless the owner raises them.
- **Rule 39.** Use only the scope, options and intent the owner stated or implied.
- **Rule 40.** Do not propose physical infrastructure unless the owner asks.
- **Rule 41.** Paid work must stay within the authorized task and spend.
- **Rule 73.** For an unknown platform state, collate the goal, account/runtime, action, sent requests, answers, timing and page evidence.
- **Rule 86.** Governor, waking-hours, voice-gate and other bypasses apply only when the owner explicitly requests the specific supported override.
- **Rule 94.** Every platform call goes through Log and its governor, never a scratch client with account tokens/cookies.
- **Rule 105.** One platform/account owns one continuous engine session and push connection.
- **Rule 163.** Agent Log actions go through Log MCP tools; never work around a stale or unavailable MCP with shell Log commands or scratch clients.
- **Rule 168.** Reset governor or browser-launch counts only when the owner explicitly asks, using the existing recorded reset command.
