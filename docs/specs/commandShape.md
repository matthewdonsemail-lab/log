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
