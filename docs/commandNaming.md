# Command naming: `log <platform> <command> …` (rule 63)

Status: **applied, 2026-10-22** (matt: "yes that is correct enforce that rule"). The questions at the end say what was decided and what is still open.

matt, 2026-10-22: the platform comes first. Every command that acts on one platform is `log <platform> <command> …`, and the poll is `log facebook poll <group> <account> <how long to poll>`. This replaces rule 60's `log warmup <platform> <activity>` (it becomes `log facebook warmup <activity>`) and settles issue [#20](https://github.com/matthewdonsemail-lab/log-cli/issues/20).

## The count today

log-cli has 30 commands (`COMMANDS`, `src/cli/runner/index.ts`):

| Kind | How many | Commands |
|---|---|---|
| Names its platform (`byArgument`) | 1 | `warmup` |
| Acts on Facebook only, doesn't say so (`facebook`) | 19 | `listings`, `listing`, `accounts`, `account`, `lifecycle`, `doctor`, `connect`, `profile`, `host`, `join`, `read`, `scan`, `status`, `watch`, `publish`, `campaign`, `conversations`, `conversation`, `capture` |
| Any platform (`any`) | 10 | `launch`, `adsPower`, `inspect`, `flow`, `proxy`, `errors`, `graph`, `login`, `logout`, `whoami` |

After this change: 21 commands start with the platform (the 19, `warmup`, and the new `poll`), and the 10 any-platform commands are unchanged.

## Every Facebook command, old and new

The platform is always the first word after `log`. Everything after the command stays as it is today unless the row says otherwise.

| Old | New |
|---|---|
| `log listings [--status] [--account] [--campaign]` | `log facebook listings [--status] [--account] [--campaign]` |
| `log listing <id>` · `log listing create --account --file` | `log facebook listing <id>` · `log facebook listing create --account --file` |
| `log accounts` | `log facebook accounts` |
| `log account show\|resave\|resetOpens\|status …` | `log facebook account show\|resave\|resetOpens\|status …` |
| `log lifecycle [--account]` · `log lifecycle states` | `log facebook lifecycle [--account]` · `log facebook lifecycle states` |
| `log doctor` | `log facebook doctor` |
| `log connect --account` | `log facebook connect --account` |
| `log profile setup --account` | `log facebook profile setup --account` |
| `log host start\|send\|status --account` | `log facebook host start\|send\|status --account` |
| `log join group --account --group …` | `log facebook join group --account --group …` |
| `log read group --account --group …` | `log facebook read group --account --group …` |
| `log read group --worker <request>` | **`log facebook poll <group> <account> <how long to poll>`** (below) |
| `log scan --account` | `log facebook scan --account` |
| `log status <listingId> --account` | `log facebook status <listingId> --account` |
| `log watch --account` | `log facebook watch --account` |
| `log publish --listing` | `log facebook publish --listing` |
| `log campaign fill\|heal\|run\|show --campaign …` | `log facebook campaign fill\|heal\|run\|show --campaign …` |
| `log conversations [--account] [--listing]` | `log facebook conversations [--account] [--listing]` |
| `log conversation show\|read\|lead\|link\|record …` | `log facebook conversation show\|read\|lead\|link\|record …` |
| `log capture --har\|--settle\|--docs` | `log facebook capture --har\|--settle\|--docs` (its docs are `docs/platforms/facebook/`, rule 48) |
| `log warmup facebook <activity> …` | `log facebook warmup <activity> …` (e.g. `log facebook warmup reel`, `log facebook warmup stages run`) |

## The poll

matt's words: `log facebook poll <group> <account> <how long to poll>`.

- It replaces `log read group --worker`. OpenMagpie's worker script (`python/openMagpie/facebookWorker.py`) calls `log facebook poll …` instead.
- What one poll does is in the #188 spec (`docs/groupListening.md`, step 2): read the group in the account's open browser, and hand back the posts the cursor hasn't seen.

## How it's kept right

- **One check.** `bun run check:docs` (lefthook, pre-commit and pre-push) refuses a command that acts on one platform whose usage lines don't all read `log <platform> <command> …`. The runner reads the platform first, then the command; `Command.platform` says which platforms a command has.
- **Old forms answer with the new one**, e.g. `log connect --account x` → "the platform comes first: log facebook connect --account x". They don't run.
- **Everything that names a command follows it:**
  - the README and its diagrams (generated, rule 56);
  - each MCP tool's description (rule 47); the tool names stay the command names (`connect`, `poll`…);
  - the agent hooks' resolvers (rule 55);
  - the skills;
  - the commands quoted in AGENTS.md's rules, docs and error-catalog actions.
- **The tests** call the new forms, and one test per command checks the old form is refused with the new one.

## The questions, as applied

1. **`<group> <account>`:** plain words, as matt wrote them: `log facebook poll <group> <account> [<how long to poll>]`.
2. **How long to poll:** a time (`30s`, `45m`, `2h`, up to 24h). It polls once, then every 5 minutes (OpenMagpie's own default feed interval, `poll_interval_seconds` 300) until the time is up, one JSON line per poll. With no time it polls once.
3. **OpenMagpie's call:** `log facebook poll --request <json>`, one poll per call, reading in the account's open browser as #188 says.
4. **`log facebook read group` by hand:** kept beside `poll`; `--worker` on it is refused with the command it became.

Still open for matt:

5. **Code folders:** the warm-up lives in `src/warmup/<platform>` (rule 49), but groups are `src/group/…` (rule 45) with Facebook-only code inside. Should they become `src/group/facebook/…`?
6. **Saved flows** (`groupTabs`, `profileSetup`…) are Facebook-only too. Should their names carry the platform (`log facebook flow run groupTabs`, which would make `flow` take the platform)?
