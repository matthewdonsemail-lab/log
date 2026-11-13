# newPlatform

Making a new platform whole with one command, and where every new file goes.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 55). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Current scope

This guide describes the current command implementation. Legacy storage names and deferred features in procedure text do not define the native hosted schema. Active rules 171, 172 and 175 govern the target: existing private workspace log.db, central identity/team authorization and minimal routing metadata, with no required Twenty or agency/CRM model. Preserve current execution gates while migrating legacy dependencies explicitly.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "instagram/newPlatform" })` | Bringing a new platform up, then vendoring its client | "make a new platform via the MCP for <platform>", "open <platform> in AdsPower", "find me via the gh api the most likely to go into the vendor", "make it work" |

## The tools in this guide

| Tool | What it does |
|---|---|
| `newPlatform` | Make a new platform's session, command, MCP tool, engine and docs… |

## The work, step by step: layout

From `skills/layout/SKILL.md`.

## layout

| Where | What goes there |
|---|---|
| `src/{library}/{domain}/` | TypeScript, with the role files (`index.ts`, `types.ts`, `client.ts`, `machine.ts`, `helpers/`; rule 2) |
| `src/browser/` | each browser (`adsPower`, `camoufox`) and what every browser shares: `driver`, `run`, `proxy`, `inspect`, `flow` (rule 57) |
| `python/browser/` | opening the account's browser through its gates: `browserDriver`, `adsPowerBrowser`, `visibleBrowser`, `proxyGate`, `harRecorder` |
| `python/human/` | how the cursor and wheel move: `humanMouse`, `scrollMotion`, `recordMouse` |
| `python/session/` | the processes TypeScript runs: `inspectSession`, `connectSession`, `publishSession`, `profileSession`, `logWorker` |
| `python/login/`, `python/device/`, `python/errors/`, `python/fixtures/` | sign-in, Camoufox's device, the error codes and catalog, test pages |
| `scripts/checks/` | the lefthook gates (`check:*`) |
| `scripts/commitLog/`, `scripts/docs/`, `scripts/hooks/`, `scripts/privacy/`, `scripts/twenty/`, `scripts/datasets/` | the private day-log gate, the generated docs, the agent hooks, the privacy check, Twenty setup and client, dataset builds |

### A new Python module

- Put it in its domain package; a new domain gets its own folder with an `__init__.py` (a docstring saying what it holds).
- Import by package: `from browser import proxyGate`, `from human.humanMouse import HumanMouse`.
- A script run directly (it has `if __name__ == "__main__"`) puts `python/` on its path before its first local import:

```python
import sys as _sys
from pathlib import Path as _Path

_sys.path.insert(0, str(_Path(__file__).resolve().parents[1]))
from browser import proxyGate
```

- TypeScript reaches it by its path (`python/session/inspectSession.py`); tests import it the same way (`sys.path.insert(0, 'python'); from login import autoLogin`).

### A new script

- Put it in its domain folder under `scripts/`; its repo root is two folders up (`join(import.meta.dir, "..", "..")`) and `src` is `../../src/`.
- Add its `package.json` entry and, for a gate, its lefthook command.

`bun run check:layout` (lefthook pre-commit and pre-push) refuses a loose file, tracked or new, and a Python domain without its `__init__.py`.

## Every tool, in full

### `newPlatform`

Make a new platform's session, command, MCP tool, engine and docs, wired through the syntax tree.
Make a new platform (session, command, MCP tool, engine, docs), wired into the repo through its syntax tree
log new platform <name> [--label <shown name>] [--twentyPlatform <ENUM>] [--library <vendor/folder>] [--sessionCookies <a,b>] [--cookieDomain <.site.com>] [--hosts <a.com,b.com>] [--home <https://…>] [--noProxy] [--noBrowser] [--apply] [--json]
Makes a new platform for log-cli: its account session on the shared platformKit, `log <name> session check` with its MCP tool, a direct-API engine in python/<name>Api on the shared Python kit, and docs/platforms/<name>. The repo is wired by editing each file through its syntax tree (PLATFORMS, PLATFORM_LABELS, COMMANDS, COMMAND_INDEX, createContext, CommandContext, DIRECT_ROUTES, COMMAND_RULES), and every edit is checked to have landed before anything is written.
Without --apply it lists what it would write and change, and writes nothing. Nothing is overwritten: an existing platform or file is refused. It says what Twenty is missing (the socialAccounts.platform option) but never changes Twenty. Then fill in the engine's actions and add the platform's families as commands (rule 83).
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "instagram/newPlatform" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "newPlatform" }) (Making a new platform whole with one command, and where every new file goes).
AGENTS.md (log://agents): rules 1, 2, 63, 83, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From the current AGENTS.md (`log://agents`). Historical citations are consolidated; archived instructions do not override the active scope.

**Rule 1.** 2026-10-18 · Use camelCase for owned files, folders, values, ids, statuses and error codes. Convert external naming once at the boundary. See docs/namingConventions.md.

**Rule 2.** 2026-10-18 · Put platform code under src/<platform>/<area>/<domain>; shared code stays in its shared library/domain. Use index.ts, types.ts, client.ts, machine.ts and helpers where appropriate. Keep scripts and Python in domain folders.

**Rule 30.** 2026-10-19 · Complete the authorized task. Do not repeatedly request confirmation already given. Distinguish implemented behavior, proposed contracts and unverified assumptions.

**Rule 38.** 2026-10-19 · Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless Matt raises them.

**Rule 39.** 2026-10-19 · Use only the scope, options and intent Matt stated or implied. Do not add unrelated alternatives to research, comparisons, plans or implementation.

**Rule 40.** 2026-10-19 · Do not propose physical infrastructure unless Matt asks. His available implementation scope is hosted/cloud environments and the tools already selected.

**Rule 41.** 2026-10-19 · Paid work must stay within the authorized task and spend. Ask before adding a paid operation he did not authorize; do not substitute a new paid provider implicitly.

**Rule 63.** 2026-10-22 · Platform commands are log <platform> <command> <what>. Shared commands remain shared. Preserve the naming boundary described in docs/commandNaming.md.

**Rule 83.** 2026-10-25 · New platforms use the existing scaffold, shared account/session boundary, command/catalog wiring, platform documentation and spec anchors. Native hosted scaffolds must not recreate a Twenty dependency.
