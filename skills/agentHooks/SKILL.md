---
name: agentHooks
description: Keep log-cli's CLI commands, MCP tools, agent hooks (Claude Code and Codex) and the live log in step (rule 55). Use when adding or changing a hook, a CLI command, an MCP tool, a page state or anything that writes progress lines, or when `bun run check:agentHooks` refuses a commit.
---

# agentHooks

One list drives every hook: `src/agentHooks/registry/index.ts` (`AGENT_HOOKS`).
Claude Code reads `.claude/settings.json`, Codex reads `.codex/hooks.json`; both
are written from the list and never edited by hand. Both hosts take the same
hook shape (TinyFish, 2026-10-20: code.claude.com/docs/en/hooks,
learn.chatgpt.com/docs/hooks): `hookSpecificOutput.additionalContext`,
`{"decision":"block","reason":…}` on Stop, exit 2 with stderr to refuse.

| Event | Matcher | Script | What it does |
|---|---|---|---|
| SessionStart | startup, resume, clear, compact | `scripts/hooks/pageState.ts` | Where every open browser is |
| UserPromptSubmit | none | `scripts/hooks/pageState.ts` | The same, with each of matt's prompts |
| PreToolUse | Bash, PowerShell, Monitor | `scripts/hooks/liveLogs.ts` | Refuses a log run piped through tail/head; reminds a long one off a Monitor (rule 26) |
| PostToolUse | Bash, PowerShell, Monitor, `mcp__log__.*` | `scripts/hooks/pageState.ts` | A new known state with its resolver, or a failed step (unconfirmed page: snapshot, then resolve) |
| Stop | none | `scripts/hooks/pageState.ts` | Keeps the turn going while a browser sits on a state log-cli resolves (rule 54); never on a person's state; lets go when sent back once and nothing changed |

What each hook decides is pure and tested: `src/agentHooks/pageState` (`hookReply`),
`src/agentHooks/liveLog` (`liveLogVerdict`), `src/agentHooks/agentHooks.test.ts`.
The known states and their resolvers are `PAGE_STATES` in
`src/browser/flow/helpers/pageState.ts`, and each one's resolver as a ready
tool call is `RESOLVE_CALLS` (`{ tool, input }`, a click's ref read from the
step's snapshot; none for a person's state).

The hooks and the MCP read the open browsers the same way:
`readOpenBrowsers` and `browserView` (`src/browser/inspect/helpers/browserStates.ts`).
So a client without hooks (a claude.ai connector, Duet) gets the same thing in
every tool result: `browsers` (each open browser's step, page and known state),
`next` (the call that resolves it: make it, do not stop, rule 54), `needsMatt`
(what only matt clears) and `progress` (every streamed line, timed), with the
first lines of its text saying the same. `log browsers` (tool `browsers`) reads
them on demand.

## The live log

Every run writes `~/.logCli/mcp/<UTC day>.log` (`src/observability/liveLog`):
the MCP server as `<tool>`, the terminal CLI (`bin/log.ts`, including a detached
`inspect start`) as `cli:<command>`, Python lines as `worker`/`session`. One
Monitor shows a run however it started:

```bash
tail -f ~/.logCli/mcp/$(date -u +%F).log
```

A command run under Monitor itself: `<command> 2>&1 | tee <runFolder>/<name>.log`,
never through `tail`/`head` (the PreToolUse hook refuses it).

## Adding something

- **A hook:** add it to `AGENT_HOOKS`, write its script under `scripts/hooks/`
  with its decision in `src/agentHooks/<domain>/` and a test, then
  `bun run check:agentHooks --write` to rewrite both hosts' files.
- **A CLI command:** it becomes an MCP tool automatically (`toolsFromCommands`);
  if it can't be one, add it to `TERMINAL_ONLY` with why. If it runs long, add it
  to `LONG_RUNNING` (its description then points at the live log).
- **A page state:** add it to `PAGE_STATES` and its call to `RESOLVE_CALLS`; a
  resolver that names a command (`` `log inspect do solve` ``) must name a real
  one, and a call must name a real MCP tool. When Facebook's answers can
  decide it, give it an `answer` test on the step's exchanges (rule 73): with
  the answers there they decide, and its `text` is only used without them.
  `marketplaceCreateLimitReached` (`marketplace_new_seller_can_post_item:
  false`) and `marketplacePartnerFeed` (`product_details_type:
  PARTNER_LISTING`) are decided this way.
- **A new MCP server name:** change `MCP_SERVER_NAME` with `.mcp.json`.

## The check

`bun run check:agentHooks` (lefthook pre-commit and pre-push) refuses a commit when:
either host's hooks differ from the registry; a hook script is missing, fails,
prints non-JSON, or the live-logs hook lets a buffered run through; a command is
neither an MCP tool nor terminal-only; an MCP tool (commands and saved flows)
isn't matched by PostToolUse; a long-running tool doesn't point at the live log;
`.mcp.json` or the server's name differ from `MCP_SERVER_NAME`; a resolver names
a command that doesn't exist; a page state has no resolver call, or a call names
a tool that doesn't exist. Hook scripts run against a scratch memory
(`LOG_HOOK_MEMORY`), so the check never changes what the real hook remembers.
