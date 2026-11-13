---
title: "The platform-neutral scorecard"
---

# The platform-neutral scorecard

`bun run check:agnostic` measures, from the code alone, how far log is from one platform-neutral capability set ([platformNeutralSurfaces.md](../proposals/platformNeutralSurfaces.md)), and fails a commit that makes any number worse than the committed baseline. Each slice of that plan lowers its numbers and lowers the baseline in the same change. Nothing is read from the network or from this machine's state: only the commands, the tool definitions, the committed flows, use cases, guides, skills, AGENTS.md and the source files.

## The check

### REQ-AGNOSTIC-01: Every number is computed from the code

`measureRepo` (`src/surface/scorecard/client.ts`) builds one input from the repo and `measure` (`src/surface/scorecard/helpers/measure.ts`) turns it into numbers. The tools are the ones the local server lists to a host with a shell: `getGuide`, the catalog tools, every command and flow tool with its use-case line, and `report`.

Checked by: code and SubQ

### REQ-AGNOSTIC-02: A number worse than its baseline fails, and says which

`scripts/checks/agnosticBaseline.json` holds every number. `check:agnostic` prints a table (number, baseline, better, same or worse) or `--json`, and exits 1 when a number is worse than its baseline or is not in the baseline yet, naming each one with what it counted. A number that got better passes, with a note to move the baseline in the same change. A number no longer measured passes and is dropped by the next `--write`. Numbers marked info (tool counts, use cases per folder, citation totals) are shown and never fail.

Checked by: code and SubQ

### REQ-AGNOSTIC-03: The baseline only moves down without an explicit flag

`--write` rewrites the baseline from the current numbers. It refuses when any number would get worse, unless `--allowWorse` is passed too. Lowering a number, adding a new one and dropping a gone one need no flag.

Checked by: code and SubQ

### REQ-AGNOSTIC-04: It runs on every commit and in CI

`check:agnostic` is in `lefthook.yml` (pre-commit and pre-push) and in `bun run check`, which CI runs.

Checked by: code and SubQ

## What each number means, and how a slice lowers it

| Key | What it counts | Lowered by |
|---|---|---|
| `sharedCommandsUnderPlatformGuide`, `sharedToolsUnderPlatformGuide` | Commands with platform `any` or `byArgument`, and their tools, whose guide topic (`guideOfCommand`) is named for one platform: the topic is a platform id or label, or starts with one followed by a capital (`facebookBrowser`, `xInbox`) | slices 2 and 18: shared topics |
| `sharedCommandsNamingPlatform` | Shared commands whose summary, usage or tool notes (`NOTES`) name exactly one platform (Facebook, Marketplace and Messenger count as Facebook; Twitter, tweet and a capital X as X). A text naming several platforms is a list and is not counted | slice 2 |
| `toolsPerPlatform.*` | Command tools by their command's platform (`shared` for `any` and `byArgument`), and the flow tools (info) | slice 7 moves tools to shared capabilities |
| `flowToolsWithoutPlatform` | Flow tools whose name holds no platform id | slices 12 and 18 |
| `useCases.*` | Use cases per folder under `docs/useCases/` (info) | |
| `useCasesWithoutAsks` | Use cases with no `How the owner asks for it:` line | slice 16 |
| `useCasesWithoutSteps` | Use cases where `stepsOf` reads zero steps | slice 16 |
| `toolsInNoUseCase` | Command and flow tools no use case names | slices 7 and 16 |
| `argsTools` | Listed tools whose input is a raw `args` list | slice 12 |
| `actingTools`, `actingToolsWithoutPlay` | Live tools that act (not spend), command and flow; and those not in `PLAY_REQUIRED` | slices 14 and 17 |
| `liveCommands`, `liveCommandsWithoutMachine` | Commands with an acting live tool; and those with no machine by the rule below | slice 8 |
| `hookHosts` | Members of `HookHost` (higher is better) | slices 9 and 19 |
| `serverInstructionsChars`, `toolsListed`, `toolDescriptionChars`, `toolDescriptionAverage`, `boilerplatePercent` | The server instructions; the listed tools, their description text in total and on average, and the share of it that is the guide line plus the rules line | slice 18 |
| `guideChars.*`, `guidesOverLimit` | Each generated guide's size in characters, and how many are over 50,000 (the size Claude Code saves to a file, [sources.md](../proposals/sources.md)) | slice 18 |
| `ruleCitations.*`, `deadRuleCitations.*` | "rule N" and "rules N, M" (lists and ranges) in `docs/useCases/**`, `skills/**` and the listed tool descriptions; dead when AGENTS.md has no rule N | slice 18 |
| `platformFallbacks` | `?? 'facebook'` in any quoting and case, and `PLATFORMS[0]`, in `src/` and `scripts/` | slice 1 follow-ups |

**Has a machine.** A command has a machine when the file that declares its export (its module in `COMMAND_INDEX`, or the file under that module's folder that declares `export const <exportName>`) calls `createMachine`, or directly imports a file that calls it or whose folder holds a `machine.ts` that calls it. One import deep, nothing transitive. Commands declared in the same file share the answer.

### REQ-AGNOSTIC-05: The measuring functions are tested over fixtures

`src/surface/scorecard/scorecard.test.ts` runs each measure over fake commands, a fake guides map and a temporary use-case folder, and the compare logic: worse fails, better passes with the note, `--write` refuses to raise.

Checked by: code and SubQ
