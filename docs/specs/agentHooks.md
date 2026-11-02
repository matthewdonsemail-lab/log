---
title: "Agent hooks"
---

# Agent hooks

The agent hooks put log-cli's state in front of the agent (Claude Code or Codex) at the right moment and stop it from running log the wrong way. One hook list writes both hosts' files, and a check refuses a commit when the hooks, the CLI and the MCP tools drift apart. Rule 55 (with rule 54 for the page states the hooks resolve, and rule 26 for the live log).

## One list, both hosts

### REQ-HOOKS-01: One hook list writes both hosts' files

The hooks are one list in the code. Claude Code's `.claude/settings.json` and Codex's `.codex/hooks.json` are both written from it, each hook as a command that runs its script from the repo, so both hosts run the same hooks.

Checked by: code and SubQ

### REQ-HOOKS-02: The check refuses a host file that differs from the list

`bun run check:agentHooks` fails when either host's hooks differ from what the list would write, and with `--write` it rewrites them.

Checked by: code and SubQ

## The events

### REQ-HOOKS-03: SessionStart and every prompt say where every open browser is

At session start (startup, resume, clear, compact) and with every prompt, the page-state hook puts every open browser's account, step, page and known state into the agent's context.

Checked by: code and SubQ

### REQ-HOOKS-04: After every log or shell call a known state gets its resolver

After every Bash, PowerShell or Monitor call and every `mcp__log__` tool call, the page-state hook says a browser that landed on a known state with its resolver, and a failed step as an unconfirmed page to snapshot and resolve. A browser it has already reported unchanged is not said again.

Checked by: code and SubQ

### REQ-HOOKS-05: Stop holds the turn while a browser sits on a state log-cli resolves itself

The Stop hook blocks the end of the turn while an open browser sits on a known state log-cli resolves itself, or a failed step, or an inspect goal not yet met. It never blocks on a state only a person can clear, and never twice on the same unchanged states.

Checked by: code and SubQ

### REQ-HOOKS-06: A log run that would hide its lines is refused before it starts

The PreToolUse hook on Bash, PowerShell and Monitor refuses a log run piped through `tail` or `head` (or PowerShell's `Select-Object -First/-Last`), since nothing would show until it ends (rule 26). A long log run outside a Monitor is told to start one.

Checked by: code and SubQ

## The check

### REQ-HOOKS-07: Every hook script answers its event

The check runs every hook script with a sample of its event and fails on a script that is missing, exits with an error (a PreToolUse or Stop hook may refuse with exit 2 and a reason), or prints something that isn't JSON. It also fails when the PreToolUse hook lets a log run piped through tail through.

Checked by: code and SubQ

### REQ-HOOKS-08: Every command is an MCP tool or terminal-only

The check fails on a command that has no MCP tool and isn't listed as terminal-only, and on a terminal-only entry that isn't a command.

Checked by: SubQ

### REQ-HOOKS-09: Every MCP tool is hooked

The check fails on an MCP tool (a command's or a saved flow's) that the PostToolUse hook's matcher doesn't match.

Checked by: code and SubQ

### REQ-HOOKS-10: Every long-running tool points at the live log

The check fails on a long-running command's MCP tool whose description doesn't point at the live log, `~/.logCli/mcp/<day>.log`.

Checked by: code and SubQ

### REQ-HOOKS-11: Every resolver is a real call

The check fails on a page state with no resolver call, a resolver call that names a tool that isn't an MCP tool, a resolver for a state that doesn't exist, and a state whose resolve text names a `log` command that doesn't exist.

Checked by: code and SubQ
