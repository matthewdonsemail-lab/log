# newPlatform

Making a new platform whole with one command, and where every new file goes.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 56). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

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
| `scripts/commitLog/`, `scripts/docs/`, `scripts/hooks/`, `scripts/twenty/`, `scripts/datasets/` | the log.md gate, the generated docs, the agent hooks, Twenty setup and client, dataset builds |

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
Before first using this tool in a session, load its guide: getGuide({ topic: "newPlatform" }) (Making a new platform whole with one command, and where every new file goes).
AGENTS.md (log://agents): rules 1, 2, 63, 64, 83, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From AGENTS.md (`log://agents`). The newest rules are at the bottom of AGENTS.md and win.

**Rule 1.** 2026-10-18 · camelCase everywhere, never kebab-case: files, folders, values, ids, statuses, error codes, usage text. Other systems' kebab-case is converted once, at the boundary. `bun run check:naming` enforces it.

**Rule 2.** 2026-10-18 · Code lives in `src/{library}/{domain}/`, using the role files (`index.ts`, `types.ts`, `client.ts`, `machine.ts`, `helpers/`).

**Rule 30.** 2026-10-19 · matt: "If I tell you to do something, do it completely." When matt gives a plan, it is carried out to the end in the same turn, not stopped to ask again or to say what won't be done. `log inspect start --now` (and `log connect --now`, and since 2026-10-19 `log publish --now`, matt: "run it now") skips rule 24's 10-minute gap (the 8 a day still holds) so a recording continues at once. Recording a sign-in or a checkpoint with `log inspect` (signIn, code, solve, click) is the intended work: it is how each state gets documented from rea. The run on 2026-10-19 was interrupted once because a snapshot printed the account's email and password; snapshots now redact every typed field value (`redact_fields`), and signIn/code read only the private login.json (rule 21), so no credential reaches any output.

**Rule 38.** 2026-10-19 · matt: never mention or discuss Meta's or Facebook's rules, terms, policies, eligibility or account ownership with him unless he raises them first. Research text that does is not his, and is never repeated to him. Top of this file.

**Rule 39.** 2026-10-19 · matt: "If I never mentioned it, if I never inferred it, if I never outlined it as an option, therefore it is not an option." Deep research prompts, searches, SubQ matrices, plans and write-ups use only what matt said, or clearly meant through a misspelling. Nothing added, nothing steered towards. Top of this file.

**Rule 40.** 2026-10-19 · matt: no physical options. He is in Vietnam with no physical access. Phones, SIMs, mini PCs, laptops, phone farms and home devices are never options unless he names them. In scope: hosted and cloud options, the tools he named and their competitors, and what our four projects already use.

**Rule 41.** 2026-10-19 · matt: "any time any task correlates to money, and I never say something, that means you shouldn't do what you think. You should do what I say." Paid work (deep research, SubQ, proxies, captcha, vendors) does exactly what he asked, nothing more. Ask before anything else.

**Rule 63.** 2026-10-22 · matt: the platform comes first. Every command that acts on one platform is `log <platform> <command> …` (`log facebook warmup reel`, `log facebook join group`); there is no form without it. The poll is `log facebook poll <group> <account> <how long to poll>`. Old forms are refused with the form they became. This replaces rule 60's `log warmup <platform> <activity>` and settles issue #20. OpenMagpie's worker is `log facebook poll --request` (it was `read group --worker`), a read in the account's open browser. `bun run check:docs` refuses a usage line without the platform first. Top of this file; the table is `docs/commandNaming.md`.

**Rule 64.** 2026-10-22 · matt: the code is by platform first, as the commands are, "because each has different approaches": `src/<platform>/<area>/<domain>`. Facebook's groups are `src/facebook/group/{join,read,answer}` (were `src/group/…`, rule 45) and its warm-up `src/facebook/warmup/activities` and `src/facebook/warmup/stages` (were `src/warmup/facebook` and `src/warmup/facebookStages`, rule 49). What every platform's warm-up draws from stays shared: `src/warmup/persona`, `src/warmup/viewer`. Each area has an `index.ts` (`check:naming`). Top of this file.

**Rule 83.** 2026-10-25 · matt: a new platform is made with one command, written normally: `log new platform <name>` (MCP `newPlatform`). It writes the platform's account session on the shared `src/platformKit/session`, `log <name> session check` with its MCP tool, a direct-API engine in `python/<name>Api` on the shared `python/platformKit/engine.py`, and `docs/platforms/<name>/README.md`, and wires it into the repo by editing each file through its syntax tree (`PLATFORMS`, `PLATFORM_LABELS`, `COMMANDS`, `createContext`, `CommandContext`, `DIRECT_ROUTES`, `COMMAND_RULES`), checking every edit landed before anything is written. Without `--apply` it only lists what it would do; nothing is overwritten; it names what Twenty is missing (the `socialAccounts.platform` option) and never changes Twenty. Routes and rules are keyed by the platform-qualified name (`commandKey`: `read`, `twitterSession`, `redditSession`), so two platforms' commands never share one. lefthook's `platforms` (`bun run check:platforms`, pre-commit and pre-push) refuses a platform missing its label, src, command, engine, session route, rules or docs. `src/scaffold/platform`, `src/cli/new`.
