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

## Live platform hooks

### REQ-HOOKS-12: Every platform's push channel reaches the agent through the inbox hook

On every event the inbox hook starts the live watcher for each account of every watched platform, if it isn't already running: X's X Chat watch, Discord's gateway watch and Slack's websocket watch (every workspace the account's d cookie is signed in to), each through the account's one session. It stops a watcher that runs older code than the checkout and skips an account whose governor is cooling off. Each message a watcher pushes is put into the agent's context with what to do. A platform without a watcher isn't done yet (rule 123: Reddit and LinkedIn next).

Checked by: code and SubQ

### REQ-HOOKS-13: One watcher process per account, never two

Every platform has one watcher process per account, shared by every Claude session through the inbox. A watcher takes the account's lock, its `owners` row in the database (written in one immediate transaction with its pid), before it opens anything; a second one is refused (`watcherAlreadyRunning`) and exits, and its refusal is written as an alert that the inbox hook puts first in the agent's context (`>>> ONE PROCESS PER ACCOUNT, NEVER TWO`). A dead holder's lock is taken over and only the holder releases it. The hook never starts a watcher while a live one holds the lock, and the stale-code cleanup stops the lock holder too. Rule 131.

Checked by: code and SubQ

### REQ-HOOKS-14: One owner per account, every other watch attaches to its relay

On every platform the watch that takes the account's lock is its one owner: it holds the platform's push connection, writes the inbox, and records its row in the database's `owners` table (pid, hostname, started, a heartbeat every 5 s, status, its local relay's port and token, and how many are attached; rule 134). Every event goes to every subscriber attached to the relay with the token. A later watch attaches to a live owner and streams the same events without opening anything; an inbox watch that loses is refused. An owner whose heartbeat is quiet for 60 s is stopped with a `hungOwner` alert, and the next start becomes the owner. The X Chat, Discord, Slack and Instagram watches all work this way. Rule 132.

Checked by: code and SubQ

### REQ-HOOKS-15: Only the session that claims a chat acts on it

Every pushed message has an event id, and the inbox hook shows each one beside who holds its chat. A session claims a chat before drafting (`log inbox claim`, 10 minutes, renewed by claiming again), and another live session is refused (`chatClaimedElsewhere`). Every send on Discord, Slack, X (direct and the queue's dms) and Instagram claims the chat first and releases it once it is sent, interrupted or failed. An X chat is one chat by the person's id or the X Chat pair. A claim whose session ended or whose time passed frees itself. Every claim, renewal, refusal, send, interruption, failure and release is written to the action log, read with `log inbox actions`. Rule 133.

Checked by: code and SubQ

### REQ-HOOKS-16: The inbox is one database, read from cursors

The inbox's state is one SQLite database (`~/.logCli/log.db`, WAL, each write in an immediate transaction). Every event is appended once to `events` with a sequence number and its event id, and each session reads what is new from its own cursor; a new session starts at the latest event. `pending.jsonl` is imported once. An event type not in the catalogue is stored with its payload and raised as an `unknownEventType` alert. Owners are rows with a generation, and a relay drops a subscriber more than 1 MB behind. Claims are rows with their chat's next generation, and a Discord or Slack send checks before every part after the first that its claim is still held, stopping when it isn't. Every claim, send and release is written to `actions` in the same transaction, with what was done before it, and actions with text are searchable beside the events. Each event's stages are timed. Rule 134.

### REQ-HOOKS-17: An account behind is caught up by its owner, and sends wait for it

Each owner records the platform's own last position (X's sequence id, each Discord DM's last message id, each Slack chat's last ts, Instagram's last activity). A gap opens when an owner takes over from a stopped or dead one (from its last heartbeat), when a first owner starts on an account with events (from the newest), or when the push channel drops. One catch-up job in the owner, never two at once, pulls only what came after the saved positions through the account's own session, paced 0.8 to 2.5 s between reads, appends it as `source: catchUp`, and closes the gap. A refusal stops it, keeps the account behind and alerts `catchUpRefused`. Every send waits up to 90 s for an open gap to close and is refused with `accountBehind` if it doesn't, or at once if the catch-up was refused. Rule 135.
