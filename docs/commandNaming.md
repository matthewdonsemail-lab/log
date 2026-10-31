# Command naming

Every log command that acts on one platform starts with that platform: `log <platform> <command> …`, for example `log facebook warmup reel` or `log facebook join group`. Commands that work on any platform (`inspect`, `flow`, `proxy`, `errors`, `login`…) take no platform. This page lists every Facebook command's old and new form, and how the rule is kept. Read it if an old command is refused, or you're adding a new command.

## The commands when the change was made

At the time of the change, log had 30 commands (`COMMANDS`, `src/cli/runner/index.ts`):

| Kind | How many | Commands |
|---|---|---|
| Already named its platform (`byArgument`) | 1 | `warmup` |
| Acted on Facebook only, without saying so (`facebook`) | 19 | `listings`, `listing`, `accounts`, `account`, `lifecycle`, `doctor`, `connect`, `profile`, `host`, `join`, `read`, `scan`, `status`, `watch`, `publish`, `campaign`, `conversations`, `conversation`, `capture` |
| Any platform (`any`) | 10 | `launch`, `adsPower`, `inspect`, `flow`, `proxy`, `errors`, `graph`, `login`, `logout`, `whoami` |

After the change, 21 commands start with the platform (the 19, `warmup`, and the new `poll`), and the 10 any-platform commands are unchanged.

## Every Facebook command, old and new

The platform is always the first word after `log`. Everything after the command stays the same unless the row says otherwise.

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
| `log capture --har\|--settle\|--docs` | `log facebook capture --har\|--settle\|--docs` (its docs are in `docs/platforms/facebook/`) |
| `log warmup facebook <activity> …` | `log facebook warmup <activity> …` (e.g. `log facebook warmup reel`, `log facebook warmup stages run`) |

## The poll

`log facebook poll <group> <account> [<how long to poll>]` reads a group in the account's open browser and hands back the posts the cursor hasn't seen (see [Listening to Facebook groups](groupListening.md), step 2).

- **How long:** a time such as `30s`, `45m` or `2h`, up to 24h. It polls once, then every 5 minutes (the group-listening service's default feed interval, `poll_interval_seconds` 300) until the time is up, printing one JSON line per poll. With no time, it polls once.
- **From the group-listening service:** its worker script (`python/openMagpie/facebookWorker.py`) calls `log facebook poll --request <json>`, one poll per call. This replaced `log read group --worker`.
- **By hand:** `log facebook read group` stays beside `poll`. `--worker` on it is refused, with the command it became.

## How the rule is kept

- **One check.** `bun run check:docs` (run before every commit and push) refuses a single-platform command whose usage lines don't all read `log <platform> <command> …`. The runner reads the platform first, then the command; `Command.platform` says which platforms a command belongs to.
- **Old forms answer with the new one.** For example, `log connect --account x` answers "the platform comes first: log facebook connect --account x" and doesn't run.
- **Everything that names a command follows it:**
  - the README and its diagrams (generated from the code);
  - each MCP tool's description (tool names stay the command names: `connect`, `poll`…);
  - the agent hooks' resolvers;
  - the skills;
  - the commands quoted in AGENTS.md, the docs and the error catalog's actions.
- **The tests** use the new forms, and one test per command checks the old form is refused with the new one.

## Code folders follow the same order

Code is laid out by platform first too, `src/<platform>/<area>/<domain>`, because each platform does things differently: for example `src/facebook/group/read` and `src/facebook/warmup/stages`. See [Where the code lives](layout.md).

## Still open

Saved flows (`groupTabs`, `profileSetup`…) are Facebook-only too. Should their names carry the platform (`log facebook flow run groupTabs`, which would make `flow` take a platform)?

The rules behind this are in AGENTS.md.
