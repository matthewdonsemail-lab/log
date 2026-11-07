# newPlatform

Making a new platform whole with one command, where every new file goes, and real phones as a device layer (log mobile android|apple <platform>).

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 56). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "instagram/newPlatform" })` | Bringing a new platform up, then vendoring its client | "make a new platform via the MCP for <platform>", "open <platform> in AdsPower", "find me via the gh api the most likely to go into the vendor", "make it work" |

## The tools in this guide

| Tool | What it does |
|---|---|
| `mobileAndroidDevices` | Every Android phone this machine can reach |
| `mobileAndroid` | One account's Android phone for a platform |
| `mobileApple` | iPhones: not built yet |
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

### `mobileAndroidDevices`

Every Android phone this machine can reach: USB phones over adb, and GeeLark cloud phones when its key is set.
Real phones as a device layer: `log mobile android|apple <platform>`, one phone per account, USB phones over ADB and GeeLark cloud phones
log mobile android devices [--json]   (every Android phone this machine can reach: USB phones over adb, and GeeLark cloud phones when GEELARK_API_TOKEN is set)
Platforms: snapchat, reddit, instagram, twitter, discord, facebook, tiktok. The OS comes first because each one is reached differently: Android over ADB with uiautomator2 (Android platform-tools on PATH or LOG_ADB, and pip install uiautomator2 for LOG_PYTHON), GeeLark cloud phones over the same ADB once GeeLark starts them (start, ADB on, adb connect, glogin). Bindings live in ~/.logCli/mobile/bindings.json (LOG_MOBILE_DIR). inspect taps nothing.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "newPlatform" }) (Making a new platform whole with one command, where every new file goes, and real phones as a device layer (log mobile android|apple <platform>)).
AGENTS.md (log://agents): rules 8, 12, 29, 35, 41, 94, 105, 167, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `mobileAndroid`

One account's Android phone for a platform: bind it (one phone per account, kept for good), unbind it, or inspect it (its UI tree and a screenshot, nothing tapped).
Real phones as a device layer: `log mobile android|apple <platform>`, one phone per account, USB phones over ADB and GeeLark cloud phones
log mobile android devices [--json]   (every Android phone this machine can reach: USB phones over adb, and GeeLark cloud phones when GEELARK_API_TOKEN is set)
log mobile android <platform> bind --account <name> (--device <serial> | --geelark <phoneId>) [--json]   (gives the account its phone, kept for good: one phone per account, one account per phone)
log mobile android <platform> unbind --account <name> [--json]   (only when the phone is gone; the account's next phone is bound again)
log mobile android <platform> inspect --account <name> [--open] [--json]   (connects the account's phone and records the screen: its UI tree and a screenshot, into the run folder; --open starts the platform's app first)
Platforms: snapchat, reddit, instagram, twitter, discord, facebook, tiktok. The OS comes first because each one is reached differently: Android over ADB with uiautomator2 (Android platform-tools on PATH or LOG_ADB, and pip install uiautomator2 for LOG_PYTHON), GeeLark cloud phones over the same ADB once GeeLark starts them (start, ADB on, adb connect, glogin). Bindings live in ~/.logCli/mobile/bindings.json (LOG_MOBILE_DIR). inspect taps nothing.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "newPlatform" }) (Making a new platform whole with one command, where every new file goes, and real phones as a device layer (log mobile android|apple <platform>)).
AGENTS.md (log://agents): rules 8, 12, 29, 35, 41, 94, 105, 167, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `mobileApple`

iPhones: not built yet (Appium XCUITest on a Mac worker, issue #81).
Real phones as a device layer: `log mobile android|apple <platform>`, one phone per account, USB phones over ADB and GeeLark cloud phones
log mobile apple <platform> …   (not built yet: iPhones run through Appium XCUITest on a Mac worker, issue #81)
Platforms: snapchat, reddit, instagram, twitter, discord, facebook, tiktok. The OS comes first because each one is reached differently: Android over ADB with uiautomator2 (Android platform-tools on PATH or LOG_ADB, and pip install uiautomator2 for LOG_PYTHON), GeeLark cloud phones over the same ADB once GeeLark starts them (start, ADB on, adb connect, glogin). Bindings live in ~/.logCli/mobile/bindings.json (LOG_MOBILE_DIR). inspect taps nothing.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "newPlatform" }) (Making a new platform whole with one command, where every new file goes, and real phones as a device layer (log mobile android|apple <platform>)).
AGENTS.md (log://agents): rules 8, 12, 29, 35, 41, 94, 105, 167, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `newPlatform`

Make a new platform's session, command, MCP tool, engine and docs, wired through the syntax tree.
Make a new platform (session, command, MCP tool, engine, docs), wired into the repo through its syntax tree
log new platform <name> [--label <shown name>] [--twentyPlatform <ENUM>] [--library <vendor/folder>] [--sessionCookies <a,b>] [--cookieDomain <.site.com>] [--hosts <a.com,b.com>] [--home <https://…>] [--noProxy] [--noBrowser] [--apply] [--json]
Makes a new platform for log-cli: its account session on the shared platformKit, `log <name> session check` with its MCP tool, a direct-API engine in python/<name>Api on the shared Python kit, and docs/platforms/<name>. The repo is wired by editing each file through its syntax tree (PLATFORMS, PLATFORM_LABELS, COMMANDS, COMMAND_INDEX, createContext, CommandContext, DIRECT_ROUTES, COMMAND_RULES), and every edit is checked to have landed before anything is written.
Without --apply it lists what it would write and change, and writes nothing. Nothing is overwritten: an existing platform or file is refused. It says what Twenty is missing (the socialAccounts.platform option) but never changes Twenty. Then fill in the engine's actions and add the platform's families as commands (rule 83).
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "instagram/newPlatform" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "newPlatform" }) (Making a new platform whole with one command, where every new file goes, and real phones as a device layer (log mobile android|apple <platform>)).
AGENTS.md (log://agents): rules 1, 2, 63, 64, 83, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From AGENTS.md (`log://agents`). The newest rules are at the bottom of AGENTS.md and win.

**Rule 1.** 2026-10-18 · camelCase everywhere, never kebab-case: files, folders, values, ids, statuses, error codes, usage text. Other systems' kebab-case is converted once, at the boundary. `bun run check:naming` enforces it.

**Rule 2.** 2026-10-18 · Code lives in `src/{library}/{domain}/`, using the role files (`index.ts`, `types.ts`, `client.ts`, `machine.ts`, `helpers/`).

**Rule 8.** 2026-10-18 · Read-only on Facebook. Nothing is posted, edited or deleted unless matt asks for it.

**Rule 12.** 2026-10-18 · No browser opens for an account unless its proxy is attached and its exit IP is in the account's country (`python/browser/proxyGate.py`). There is no exception: not dry runs, not signing in (matt: "never, ever open" without one). Listings must be in the account's country, and the form's location must be picked in that country. How it works: `docs/proxies.md`.

**Rule 29.** 2026-10-19 · matt: look before writing code for a page. `log inspect start --account <a>` opens one gated, headed Camoufox (async API, same launch and gates as every run) and keeps it open; `log inspect do <action>` runs one step (goto, snapshot, back, wait; click, type, press only with `--live`, rule 8). Each step records, in order, as it happens: the accessibility snapshot with element refs (camofox-mcp's model, `aria_snapshot(mode="ai")`), a screenshot, its own HAR, and rea's reading of that HAR at once. Code that clicks on a page is written from an inspect recording of that page, never before one.

**Rule 30.** 2026-10-19 · matt: "If I tell you to do something, do it completely." When matt gives a plan, it is carried out to the end in the same turn, not stopped to ask again or to say what won't be done. `log inspect start --now` (and `log connect --now`, and since 2026-10-19 `log publish --now`, matt: "run it now") skips rule 24's 10-minute gap (the 8 a day still holds) so a recording continues at once. Recording a sign-in or a checkpoint with `log inspect` (signIn, code, solve, click) is the intended work: it is how each state gets documented from rea. The run on 2026-10-19 was interrupted once because a snapshot printed the account's email and password; snapshots now redact every typed field value (`redact_fields`), and signIn/code read only the private login.json (rule 21), so no credential reaches any output.

**Rule 35.** 2026-10-19 · matt: the browser stays open. One browser per account, opened once per local day by its host and kept open through the account's active hours; every action is a tab in it; it closes only for a logged reason (end of active hours, shutdown, checkpoint or restriction, account lost, a crash reopened once). Every account runs one lifecycle machine (`src/marketplace/lifecycle`, XState) across an onboarding lane (with a day's warm-up after profile and name) and a host lane. Top of this file.

**Rule 38.** 2026-10-19 · matt: never mention or discuss Meta's or Facebook's rules, terms, policies, eligibility or account ownership with him unless he raises them first. Research text that does is not his, and is never repeated to him. Top of this file.

**Rule 39.** 2026-10-19 · matt: "If I never mentioned it, if I never inferred it, if I never outlined it as an option, therefore it is not an option." Deep research prompts, searches, SubQ matrices, plans and write-ups use only what matt said, or clearly meant through a misspelling. Nothing added, nothing steered towards. Top of this file.

**Rule 40.** 2026-10-19 · matt: no physical options. He is in Vietnam with no physical access. Phones, SIMs, mini PCs, laptops, phone farms and home devices are never options unless he names them. In scope: hosted and cloud options, the tools he named and their competitors, and what our four projects already use.

**Rule 41.** 2026-10-19 · matt: "any time any task correlates to money, and I never say something, that means you shouldn't do what you think. You should do what I say." Paid work (deep research, SubQ, proxies, captcha, vendors) does exactly what he asked, nothing more. Ask before anything else.

**Rule 63.** 2026-10-22 · matt: the platform comes first. Every command that acts on one platform is `log <platform> <command> …` (`log facebook warmup reel`, `log facebook join group`); there is no form without it. The poll is `log facebook poll <group> <account> <how long to poll>`. Old forms are refused with the form they became. This replaces rule 60's `log warmup <platform> <activity>` and settles issue #20. OpenMagpie's worker is `log facebook poll --request` (it was `read group --worker`), a read in the account's open browser. `bun run check:docs` refuses a usage line without the platform first. Top of this file; the table is `docs/commandNaming.md`.

**Rule 64.** 2026-10-22 · matt: the code is by platform first, as the commands are, "because each has different approaches": `src/<platform>/<area>/<domain>`. Facebook's groups are `src/facebook/group/{join,read,answer}` (were `src/group/…`, rule 45) and its warm-up `src/facebook/warmup/activities` and `src/facebook/warmup/stages` (were `src/warmup/facebook` and `src/warmup/facebookStages`, rule 49). What every platform's warm-up draws from stays shared: `src/warmup/persona`, `src/warmup/viewer`. Each area has an `index.ts` (`check:naming`). Top of this file.

**Rule 83.** 2026-10-25 · matt: a new platform is made with one command, written normally: `log new platform <name>` (MCP `newPlatform`). It writes the platform's account session on the shared `src/platformKit/session`, `log <name> session check` with its MCP tool, a direct-API engine in `python/<name>Api` on the shared `python/platformKit/engine.py`, and `docs/platforms/<name>/README.md`, and wires it into the repo by editing each file through its syntax tree (`PLATFORMS`, `PLATFORM_LABELS`, `COMMANDS`, `createContext`, `CommandContext`, `DIRECT_ROUTES`, `COMMAND_RULES`), checking every edit landed before anything is written. Without `--apply` it only lists what it would do; nothing is overwritten; it names what Twenty is missing (the `socialAccounts.platform` option) and never changes Twenty. Routes and rules are keyed by the platform-qualified name (`commandKey`: `read`, `twitterSession`, `redditSession`), so two platforms' commands never share one. lefthook's `platforms` (`bun run check:platforms`, pre-commit and pre-push) refuses a platform missing its label, src, command, engine, session route, rules or docs. `src/scaffold/platform`, `src/cli/new`.

**Rule 94.** 2026-10-29 · matt: "whatever you did in such quick succession lead to my account getting disabled, never do that again." Never act on an account in quick succession. What happened (matt's Discord, `sourcedandsoldtothehighestbidder`, 2026-10-29 00:47-01:00 UTC): in about 13 minutes an agent replied in 3 chats, read 1,400 messages from a server (Finn Automated) with a scratch script that went around log-cli (`.scratch/finn/dc.ts`: its own fetch to `discord.com/api/v9` with the session token, pages back to back, retrying straight through 429s), pulled the account's relationships, then opened new DMs to strangers from that server 30 s apart. Discord disabled the account. From now on: - Every call to a platform goes through log-cli's own commands and their governor. Never a hand-rolled script with an account's token or cookies. - A 429 or a failed send stops the run. It is never retried through, and the next action waits for matt. - Reading a server, group or member list in bulk is its own session. It never runs in the same session as sending. - Cold DMs to people the account has never talked to go out at most a few a day, minutes apart, never back to back. Each new DM channel opened counts as a write. - After a block, disable, captcha or cooldown, nothing resumes on that account until matt says so.

**Rule 105.** 2026-11-01 · matt: "we cannot be opening multiple sessions there, that defeats the core purpose of what we use this tool for ... it should always be one, and then it needs to loudly create issues". An X account has one session, always. Every X call (CLI, MCP, hooks, the queue, the X Chat watch) goes through the account's one engine host (`python/twitterApi/host.py`, started on the first call, closed after 30 idle minutes or when the engine code changes): one twikit client, one connection, one cookie jar and one transaction key, the way X's own web app keeps one page and signs every call from it (x-web `startup-dynamic`, read with rea 2026-11-01). A second host can't start (`host.lock`); a call that can't reach the host is refused with `xSessionHostDown` and sends nothing, never falls back to a session of its own. The hook's account line shows the open session (pid, since, calls). `LOG_TWITTER_HOST=inline` runs the old way, for tests only.

**Rule 167.** 2026-11-07 · matt: "it will be log mobile android <platform>, log mobile apple <platform> ... I will buy a bunch of phones to put into one of them things", then "find out the information of all the providers ... begin to start implementing it". Real phones are a device layer of their own, the OS first because each one is reached differently, then the platform the phone runs. `log mobile android devices` lists every Android phone this machine reaches: USB phones over adb (`LOG_ADB`), and GeeLark cloud phones when `GEELARK_API_TOKEN` is set. `log mobile android <platform> bind --account <a> --device <serial> | --geelark <phoneId>` gives an account its phone for good: one phone per account, one account per phone (`accountBound`, `deviceTaken`), kept in `~/.logCli/mobile/bindings.json` (`LOG_MOBILE_DIR`). `inspect` connects the account's phone (a GeeLark phone is started, ADB turned on, `adb connect` and `glogin`, the way GeeLark's own docs do it) and records its screen, the UI tree and a screenshot, through uiautomator2 (`python/mobile/androidDriver.py`) into the run folder, tapping nothing (rules 8, 29). `log mobile apple` is refused (`appleNotBuilt`) until the Mac worker with Appium XCUITest is built. Provider docs: `RESEARCH/LOG_MOBILE_DEVICES_2026_11_07/` in the buzz workspace; the plan: github.com/matthewdonsemail-lab/log/issues/81. `src/mobile`, `src/cli/mobile`. Spec: `docs/specs/mobile.md`.
