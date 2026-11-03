---
title: "Platform scaffold"
---

# Platform scaffold

A new platform is made whole with one command, `log new platform <name>` (MCP `newPlatform`), and one table, `PLATFORM_SITES`, says what each platform is: its Twenty value, cookie domain, hosts, home page, whether it needs a proxy and whether it has a browser path. `log inspect`, the account's browser and the AdsPower sync read that table, so a new platform is explored the same way as Facebook. Rules 83 and 84.

## Making a platform

### REQ-PLATFORM-01: One command writes the platform's files

`log new platform <name>` writes the platform's account session on the shared `platformKit` session, its `log <name> session check` command and its test, a direct-API engine in `python/<name>Api` on the shared Python engine kit, whose message shape (`message_of`) keeps every attachment and marks audio through the shared media layer (rule 126), and `docs/platforms/<name>/README.md`.

Checked by: code and SubQ

### REQ-PLATFORM-02: The repo is wired by editing each file through its syntax tree

The platform is wired in by editing each file through its TypeScript syntax tree, never by text search: `PLATFORMS`, `PLATFORM_LABELS`, `PLATFORM_SITES`, `COMMANDS` and its import, `COMMAND_INDEX`, `createContext` and its import, `CommandContext`, `DIRECT_ROUTES` and `COMMAND_RULES`. Its routes and rules are keyed by the platform-qualified name (`<name>Session`).

Checked by: code and SubQ

### REQ-PLATFORM-03: Every edit is checked to have landed before anything is written

Every edit is applied in memory first and checked to have landed in the parsed file. If any edit didn't land, the command fails and nothing is written, neither the new files nor the edits.

Checked by: code and SubQ

### REQ-PLATFORM-04: Without --apply it only lists what it would do

Without `--apply` the command lists the files it would write, the edits it would make and its notes, and writes nothing.

Checked by: code and SubQ

### REQ-PLATFORM-05: Nothing is overwritten

A name that is already a platform, or a file the plan would write that already exists, is refused before anything is written.

Checked by: SubQ

### REQ-PLATFORM-06: The name is camelCase

A platform name that isn't camelCase starting with a lowercase letter is refused (rule 1).

Checked by: code and SubQ

### REQ-PLATFORM-07: It names what Twenty is missing and never changes Twenty

When Twenty's `socialAccounts.platform` has no option for the new platform, the plan says so in a note (add it in the Twenty setup script, then regenerate the client). The command never writes to Twenty.

Checked by: code and SubQ

### REQ-PLATFORM-08: The command writes the platform's row in the table

The new platform's `PLATFORM_SITES` row is written from `--hosts` (default `<name>.com`), `--home` (default `https://www.<first host>/`, which must be a https URL on one of its hosts), `--noProxy` (proxy `none`, else `required`) and `--noBrowser` (no browser path).

Checked by: code and SubQ

### REQ-PLATFORM-09: The check refuses a platform half wired

`bun run check:platforms` fails on a platform missing its `PLATFORM_SITES` entry, its label, `src/<name>`, its CLI, its Python engine, its docs, a `session` command, its `DIRECT_ROUTES.<name>Session`, or a command of it without its `COMMAND_RULES` or `DIRECT_ROUTES` entry under the platform-qualified name.

Checked by: code and SubQ

## One table for every platform

### REQ-PLATFORM-10: Each platform's row says what it is

`PLATFORM_SITES` has a row for every platform, with its Twenty value, cookie domain, hosts, home page, `proxy` (`required` or `none`) and `browser`. Facebook's proxy is `required` (rule 12, unchanged). X (twitter) has no browser path (rule 80). Reddit's proxy is `none`.

Checked by: code (anchors)

### REQ-PLATFORM-11: Inspect goes only to known platforms' hosts

`log inspect do goto` takes only a https URL whose host is one of a known platform's hosts, or under one.

Checked by: code and SubQ

### REQ-PLATFORM-12: A no-proxy platform opens with no proxy

An account on a platform whose proxy is `none` passes the run check with a direct connection and no proxy. An account on a platform with no browser path is refused, since it runs on the direct-API engine only. A Facebook account still needs its proxy in its home country.

Checked by: code and SubQ

### REQ-PLATFORM-13: The AdsPower sync gives every browser platform's accounts a profile

`log adsPower sync` plans a profile for the accounts of every browser platform. An account on a no-proxy platform needs no home: it is not released for its home being outside the homes kept, and its profile runs in en-US when it has no home.

Checked by: code and SubQ

### REQ-PLATFORM-14: A new platform is made with its spec and anchors

`log new platform` also writes the platform's spec, `docs/specs/<name>.md`, and its questions and anchors, `src/specs/<name>/index.ts`. They cover the account's session, the engine, the platform's own answer being recorded, and the wiring. Every anchor points at a symbol or string in the files the command just wrote or edited, so the spec gate proves them by syntax tree from the first commit (rules 117 and 124).

Checked by: code and SubQ
