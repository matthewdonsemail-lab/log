# newPlatform

Making a new platform whole with one command, and where every new file goes.

Written by `bun run docs:build` from the code, the skills and AGENTS.md. Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "instagram/newPlatform" })` | Bringing a new platform up, then vendoring its client | "make a new platform via the MCP for <platform>", "open <platform> in AdsPower", "find me via the gh api the most likely to go into the vendor", "make it work" |

## The tools in this guide

Each tool's own description carries its full usage, notes, live line and rules; `logGet` gives its exact inputs and a call that works.

| Tool | What it does | Usage |
|---|---|---|
| `newPlatform` | Make a new platform's session, command, MCP tool, engine and docs… | `log new platform <name> [--label <shown name>] [--twentyPlatform <ENUM>] [--library <vendor/folder>] [--sessionCookies <a,b>] [--cookieDomain <.site.com>] [--hosts <a.com,b.com>] [--home <https://…>] [--noProxy] [--noBrowser] [--apply] [--json]` |

## The work, step by step: layout

From `skills/layout/SKILL.md`.

## layout

| Where | What goes there |
|---|---|
| `src/{library}/{domain}/` | TypeScript, with the role files (`index.ts`, `types.ts`, `client.ts`, `machine.ts`, `helpers/`; rule 2) |
| `src/browser/` | each browser (`adsPower`, `camoufox`) and what every browser shares: `driver`, `run`, `proxy`, `inspect`, `flow` (rule 2) |
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

## The rules these tools fall under

Each by its number and first line. The full text is in AGENTS.md (`log://agents`); the core rules are in full in `getGuide({ topic: "logMcpInstructions" })`.

- **Rule 30.** Complete the authorized task.
- **Rule 38.** Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless the owner raises them.
- **Rule 39.** Use only the scope, options and intent the owner stated or implied.
- **Rule 40.** Do not propose physical infrastructure unless the owner asks.
- **Rule 41.** Paid work must stay within the authorized task and spend.
