---
title: "Capabilities"
---

# Capabilities

A capability is one thing log does on any platform, with one name and one input shape: `chatsList` lists an account's chats, `messagesRead` reads one chat, `messagesWatch` listens to an account's messages for a set time. The platform is an input, taken from the account when it isn't given, never a default. Each platform's own command stays the implementation. The design is [capabilitySchema.md](../proposals/capabilitySchema.md), slice 7 of [platformNeutralSurfaces.md](../proposals/platformNeutralSurfaces.md).

## The table

### REQ-CAP-01: One capability table, bound to the commands that exist

`CAPABILITIES` (`src/platformKit/capability/helpers/table.ts`) holds each capability's noun, verb, summary, effect and canonical inputs (`account`, `chat`, `space`, `limit`, `seconds`), each integer input with its range, and per platform the command key, its input form's words and which of that form's flags (or its positional) each canonical input becomes. `capabilityRows` (`src/platformKit/capability/client.ts`) derives the table from `COMMANDS`: it throws when a binding names a command, a form or a flag that doesn't exist, and reads each row's effect and whether it has a live flag from the command's own form, so nothing about a command is restated by hand. The tool name is `<noun><Verb>` (`capabilityTool`), never a platform word.

Checked by: code and SubQ

### REQ-CAP-02: The platform comes from the account

`choosePlatform` takes the workspace's accounts (`readConnectionAccounts`: the local accounts file and the session folders), the account's name (an `@` and case ignored) and the platform if given. One platform keeping the name gives that platform. Two give `platformAmbiguous`, listing them. None, with no platform given, gives `accountNotFound`. A platform given that the account is kept under is used; one it isn't kept under, when it is kept elsewhere, gives `accountPlatformMismatch` with where it is; an account not kept locally under any platform is passed to the given platform's own command, which looks it up (an account kept in Twenty).

Checked by: code and SubQ

### REQ-CAP-03: Canonical inputs become that platform's flags, or a refusal that contacts nothing

`argvFor` turns the canonical inputs into the bound command's argv: `chat` is Discord's `--channel`, Slack's `--chat`, Instagram's `--with`, X's `--conversation` for an id like `a-b` and `--with` otherwise, and Facebook's conversation id; `space` is Slack's `--workspace`; `seconds` is each watch's `--seconds`, and `messagesWatch` binds X's `twitter chat watch`, `discord watch` (`chat` is its `--channel`), `slack watch` and `instagram watch` (no `chat`), so Reddit, LinkedIn and Facebook answer `capabilityMissing`. A platform with no binding answers `capabilityMissing` with `platformsWithIt`; an input the bound command doesn't take answers `inputUnsupported`. Both are error catalog codes and are decided before any command runs.

Checked by: code and SubQ

## The commands

### REQ-CAP-04: Each noun is one shared command, and its tools are generated like any other

`capabilityCommandOf` (`src/cli/capabilities/index.ts`) makes one shared command (platform `any`) per noun, one input form per verb: `log chats list`, `log messages read` and `log messages watch`, so the MCP tools `chatsList`, `messagesRead` and `messagesWatch` come from `toolsFromCommands` like every other command. A run checks its inputs (an integer input against its range: `seconds` is 5 to 3600, 60 when left out), chooses the platform, maps the inputs, says on its progress line which platform command it runs, and returns that command's own result. The per-platform tools (`discordRead`, `slackChats`, `twitterDms` …) stay listed. All three are in the `inbox` guide. `messagesWatch` runs the platform's watch without `--inbox`, so it attaches to the account's running watcher when there is one and owns the socket for its seconds only when there is none; the platform's own watch through it reaches MCP, which X's terminal-only `twitter chat` command did not. `messages` is in `LONG_RUNNING`, so a watch runs as a job with progress.

Checked by: code and SubQ
