# Command naming

Every log command that acts on one platform starts with that platform: `log <platform> <command> …`, for example `log facebook warmup reel` or `log facebook join group`. Commands that work on any platform (`inspect`, `flow`, `proxy`, `errors`, `login`…) take no platform. This page lists every Facebook command's old and new form, and how the rule is kept. Read it if an old command is refused, or you're adding a new command.

When the change was made, 19 commands acted on Facebook without saying so; they, `warmup` and the new `poll` now start with the platform. The any-platform commands (`launch`, `adsPower`, `inspect`, `flow`, `proxy`, `errors`, `graph`, `login`, `logout`, `whoami`…) were unchanged.

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
| `log facebook warmup plan\|record\|run\|feed` | `log facebook warmup stages plan\|record\|run\|log` |

## Every Facebook MCP tool, old and new

The MCP tools follow the same rule: every platform's tools start with the platform, Facebook's too (2026-11-13). Until then Facebook was the one platform whose tools had bare names (`accounts`, `check`, `status`), so an agent couldn't tell they were Facebook only. The CLI words did not change. The old names still run the new tool for one release, with a line saying the tool was renamed, but `tools/list` shows only the new ones (`RENAMED_TOOLS` in `src/mcp/server/helpers/toolAliases.ts`).

| Old tool | New tool |
|---|---|
| `listings` | `facebookListings` |
| `listing` | `facebookListing` |
| `listingCreate` | `facebookListingCreate` |
| `listingRemove` | `facebookListingRemove` |
| `listingRemoveLive` | `facebookListingRemoveLive` |
| `listingSweep` | `facebookListingSweep` |
| `listingLint` | `facebookListingLint` |
| `accounts` | `facebookAccounts` |
| `accountShow` | `facebookAccountShow` |
| `accountResave` | `facebookAccountResave` |
| `accountResetOpens` | `facebookAccountResetOpens` |
| `accountStatus` | `facebookAccountStatus` |
| `lifecycle` | `facebookLifecycle` |
| `preflight` | `facebookPreflight` |
| `doctor` | `facebookDoctor` |
| `connect` | `facebookConnect` |
| `profile` | `facebookProfile` |
| `profileLive` | `facebookProfileLive` |
| `hostStart` | `facebookHostStart` |
| `hostStartLive` | `facebookHostStartLive` |
| `hostSend` | `facebookHostSend` |
| `hostStatus` | `facebookHostStatus` |
| `join` | `facebookJoin` |
| `joinLive` | `facebookJoinLive` |
| `readGroup` | `facebookReadGroup` |
| `readGroupLive` | `facebookReadGroupLive` |
| `readMembers` | `facebookReadMembers` |
| `poll` | `facebookPoll` |
| `check` | `facebookCheck` |
| `scan` | `facebookScan` |
| `status` | `facebookStatus` |
| `watch` | `facebookWatch` |
| `publish` | `facebookPublish` |
| `publishLive` | `facebookPublishLive` |
| `campaign` | `facebookCampaign` |
| `campaignLive` | `facebookCampaignLive` |
| `conversations` | `facebookConversations` |
| `conversationShow` | `facebookConversationShow` |
| `conversationRead` | `facebookConversationRead` |
| `conversationLead` | `facebookConversationLead` |
| `conversationLink` | `facebookConversationLink` |
| `conversationRecord` | `facebookConversationRecord` |
| `capture` | `facebookCapture` |

## The poll

`log facebook poll <group> <account> [<how long to poll>]` reads a group in the account's open browser and hands back the posts the cursor hasn't seen (see [Listening to Facebook groups](groupListening.md), step 2).

- **How long:** a time such as `30s`, `45m` or `2h`, up to 24h. It polls once, then every 5 minutes (the group-listening service's default feed interval, `poll_interval_seconds` 300) until the time is up, printing one JSON line per poll. With no time, it polls once.
- **From the group-listening service:** its worker script (`python/openMagpie/facebookWorker.py`) calls `log facebook poll --request <json>`, one poll per call. This replaced `log read group --worker`.
- **By hand:** `log facebook read group` stays beside `poll`. `--worker` on it is refused, with the command it became.

## How the rule is kept

What the runner refuses and what `bun run check:docs` checks are in the spec, [Command shape](specs/commandShape.md). An old form answers with the new one and doesn't run, for example `log connect --account x` answers `log connect: the platform comes first (rule 63): log facebook connect --account x`. The reference (`docs/reference.md`), the diagrams, each MCP tool's description, the hooks' resolvers, the skills and the error catalog all use the new forms, and the tests check each old form is refused.

## Code folders follow the same order

Code is laid out by platform first too, `src/<platform>/<area>/<domain>`, because each platform does things differently: for example `src/facebook/group/read` and `src/facebook/warmup/stages`. See [Where the code lives](layout.md).

The rules behind this are in AGENTS.md.
