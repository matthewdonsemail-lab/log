---
name: surfaceDocs
description: Keep the README's command table and the Mermaid diagrams (docs/diagrams/*.mmd) generated from the code (rule 56). Use when adding or changing a command, a flag, an MCP tool, a hook or a page state, or when `bun run check:docs` refuses a commit.
---

# surfaceDocs

The README's "Commands, MCP tools and hooks" section and `docs/diagrams/*.mmd`
are generated, never edited by hand. Everything comes from the code:

| What | From |
|---|---|
| Each command, what it does, its flags | `COMMANDS` (`src/cli/runner/index.ts`), each command's `usage` |
| Its MCP tool, or why it is terminal-only | `toolsFromCommands`, `TERMINAL_ONLY` |
| The hooks that fire on it (shell, MCP) | `AGENT_HOOKS` (`src/agentHooks/registry`) |
| Live log, rules | `LONG_RUNNING`, `COMMAND_RULES` |
| Saved flows | `src/browser/flow/definitions/*.json` |
| Page states | `PAGE_STATES` (`src/browser/flow/helpers/pageState.ts`) |

`src/surface/catalog` gathers it, `src/surface/diagrams` draws the four
diagrams (surface, commands, hooks, pageStates), `src/surface/readme` writes the
section between `<!-- surface:start` and `<!-- surface:end -->`.

## After a change

```bash
bun run docs:build     # rewrites README.md's section and docs/diagrams/*.mmd
bun run check:docs     # what lefthook runs: refuses any drift
```

## A new command or flag

- Give the command a `usage` (its `*_USAGE` constant): every subcommand and flag.
  The typecheck refuses a command without one.
- A flag the command parses (`parseArgs`, `takePairs`, `token === "--x"`) must be
  in its usage, and every flag in its usage must be parsed: `check:docs` names
  the folder and the flag either way.
- The MCP tool's description carries the same usage, so agents over MCP see the
  same flags as the terminal.
