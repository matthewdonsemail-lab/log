---
title: "Command shape"
---

# Command shape

Every log command has one shape: a command that acts on one platform starts with that platform (`log <platform> <command> …`), a command that works on any platform takes none, and an old form is refused with the form it became. Each command declares its platform and carries its full usage, and the reference and the diagrams are written from the code and checked against it. Rules 56, 59, 60, 63, 64 and 103 (rule 63 replaces rule 60's `log warmup <platform>` form, and rule 103 moves rule 56's generated section from the README to `docs/reference.md`).

## The platform comes first

### REQ-COMMAND-01: A platform's command runs as log, the platform, then the command

When the first word after `log` is a platform, the command named in the next word is found for that platform and run with the rest of the words. A command whose platform comes from its argument (`warmup`) is handed the platform as its first argument.

Checked by: code and SubQ

### REQ-COMMAND-02: An old form without the platform is refused with the form it became

A command that acts on one platform, run without the platform in front of it, is refused, and the refusal prints the form it became: `log <platform> <command> …` with the same words after it.

Checked by: SubQ

### REQ-COMMAND-03: A command named under the wrong platform is refused

A command that belongs to one platform, run after another platform's name, is refused, and the refusal prints the form with its own platform.

Checked by: SubQ

### REQ-COMMAND-04: A command that works on any platform takes no platform

A command that works on any platform (`inspect`, `flow`, `proxy`, `errors`, `login`…), run after a platform's name, is refused, and the refusal prints the form without the platform.

Checked by: SubQ

### REQ-COMMAND-05: A platform word with no command after it is refused

`log <platform>` with no command, or with a word that isn't a command, is refused and says to name a command after the platform.

Checked by: SubQ

### REQ-COMMAND-06: The old warm-up forms are refused with the form they became

`warmup` is a `byArgument` command, so `resolvePlatformForm` hands it the platform as its first positional (`log facebook warmup feed run` arrives as `facebook feed run`, the feed activity). A call with no platform whose first positional is `plan`, `record`, `run` or `feed` (the forms from before the stages had their own name, such as `log warmup plan`) is refused with exit code 1, and the refusal prints the form it became (`log facebook warmup stages plan`, `… stages record`, `… stages run`, `… stages log`). Rule 60.

Checked by: code and SubQ

## Every command declares itself

### REQ-COMMAND-07: Every command declares its platform

Every command carries a `platform`: one platform's name, `any`, or `byArgument`. It is a required field of the command's type, so a command without it doesn't typecheck.

Checked by: code and SubQ

### REQ-COMMAND-08: Every command carries its full usage

Every command carries its full usage text, and the docs check refuses a command that parses a flag its usage doesn't name, or whose usage names a flag nothing parses. Global flags (`--proxyMs`) are exempt.

Checked by: code and SubQ

### REQ-COMMAND-09: Every typed input form and flag is in the usage

For a command with a typed input (its MCP forms), the docs check refuses an input form with no usage line that starts with the command and the form's words, and an input flag the usage doesn't name.

Checked by: SubQ

### REQ-COMMAND-10: Usage lines put the platform first

The docs check refuses a usage line of a one-platform command that doesn't start with its platform, a usage line of an any-platform command that puts a platform in front of it, a one-platform command's usage line that starts with another platform, and a `byArgument` command's usage line that starts with a word that isn't a platform.

Checked by: SubQ

## Generated from the code

### REQ-COMMAND-11: The reference and the diagrams are written from the code

`bun run docs:build` writes the command reference into `docs/reference.md` (between the surface markers, not into the README) and every diagram as `docs/diagrams/<name>.mmd`, all from the commands, the flows and the hooks. A diagram file no longer generated is removed. Rule 103.

Checked by: code and SubQ

### REQ-COMMAND-12: The docs check refuses anything out of date

`bun run check:docs` writes nothing and fails when `docs/reference.md`, a diagram file or the command index differs from what the code would write, or a diagram file is no longer generated.

Checked by: code and SubQ

### REQ-COMMAND-13: Every diagram parses as Mermaid

The docs check parses every generated diagram, and every Mermaid block in a page under `docs/`, with Mermaid, and fails on one that doesn't parse.

Checked by: code and SubQ

### REQ-COMMAND-14: A command summary doesn't name one browser

The docs check refuses a command summary that names one browser (Camoufox, AdsPower, Firefox, Chromium), unless it is that browser's own command or a Camoufox-only command naming Camoufox. Rule 59.

Checked by: code and SubQ

## The command input contract

An MCP call runs the CLI in the same process, so a command's input forms are the one source for its parser, its tool schema, its catalog entry and its reference line. What follows is what each of those says, and the test that holds them together.

### REQ-COMMAND-15: A flag says its kind, range and shape

A flag in an input form is one of `string`, `integer`, `number` (with `min` and `max`), `boolean` (present or not), `booleanValue` (the value `true` or `false`), `enum`, `list` (comma separated on the CLI or the flag repeated, an array in the schema) or `pairs` (`key=value`, repeated). A string or a list item can carry a `pattern` with the words it `takes`, or a named `format`: `date` (YYYY-MM-DD), `time` (anything `Date.parse` reads), `dateOrSpan` (a date, or `7d`, `4w`, `12h`) or `jsonObject`. A form can carry `groups` (`atLeastOne`, `atMostOne`) and `counts` (a positional list that needs at least N entries when another value is one of a set, as `inspect do` needs one value for `goto` and two for `type`). A flag that a refusal already had a code for keeps it (`refusal`, such as `limitInvalid` or `secondsInvalid`); every other bad value is `inputInvalid`. A form marked `terminalOnly` is parsed and documented but is never a tool (`log console --web`).

Checked by: code and SubQ

### REQ-COMMAND-16: The CLI parses once into typed values

`parseArgs` with `parserSpecOf(input)` picks the form by its words, then reads each flag as that form declares it into `values` (numbers, booleans, arrays, objects), and keeps the raw text in `flags`. A bad value is one refusal that names the flag, what it got and what it takes (`inputInvalid: --limit got "ten"; it takes a whole number from 1 to 200`). A scalar flag given twice is refused, on every `parseArgs` spec, instead of the last one winning; a list or pairs flag may repeat. `pairs` and `global` flags are in the parser spec. The groups and counts of the form are enforced after the flags. Commands read `numberOf`, `listOf` and `truthOf`, never `Number(...)` or `.split(",")` over a flag declared `string`; `check:agnostic` counts those (`stringFlagReparses`, baseline 0).

Checked by: code and SubQ

### REQ-COMMAND-17: The tool schema says what run enforces

`inputSchemaOf` gives `integer` and `number` with `minimum` and `maximum`, `array` of strings with `minItems` for a list, `boolean` for a true-or-false value, and `pattern` and `format` for a shaped string. A group or a count is a sentence on each property it names, never a top-level `anyOf` or `oneOf`: some model providers refuse a combinator at the top of a tool's input. `argvOfInput` turns numbers back into `--name=value`, a list into the flag repeated once per item, and a true-or-false value into `--name=true|false`, and enforces the same groups and counts. For one release it coerces a numeric string to a number, a comma string to a list and `"true"`/`"false"` to a boolean, so callers that still send `limit: "20"` keep working.

Checked by: code and SubQ

### REQ-COMMAND-18: approvedBy is required on a live tool whose command needs it

A flag marked `approval` is in `required` on the form's `*Live` tool, and `argvOfInput` refuses a live call without it. It is marked on the commands that refuse `--live` without `--approvedBy`: the X sends, likes, reposts, follows, dms, lists, reacts and voice notes, the Reddit post, reply and vote, the Discord send, delete, react and voice, the Slack send, react and voice, and the Instagram send, react and voice (24 tools). `tregCallLive` is not: a free endpoint runs without it.

Checked by: code and SubQ

### REQ-COMMAND-19: Every form tool is driven through its command's own run

`src/cli/runner/runRoundTrip.test.ts` builds, for every non-live form tool, a minimal input from its schema, then each optional field on its own, passes each through `argvOfInput` and runs the command's own `run` with stubbed engines, Twenty, treg and fetch in a temporary home, and fails when a schema-valid input is refused for a parse or input reason. A second pass sets each bounded flag to its minimum and maximum (they must run) and one past each (the schema and `run` must both refuse it). Its skip list is three forms that start a process (`inspectStart`, `facebookHostStart`, `mediaDescriber`), and `instagramDms.limit` is the one bound that depends on another field.

Checked by: code and SubQ

### REQ-COMMAND-20: The reference lists typed flags from the input forms

For a command with input forms, `docs/reference.md` lists each flag from the forms with its kind and range (`[--limit <integer 1..1000>]`), optional flags in brackets, and adds any flag only its usage names. A command with no forms keeps the flags read from its usage.

Checked by: code and SubQ
