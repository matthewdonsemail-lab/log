## The problem

Tool calls are slow because of processes, not data (issue #99). A SQLite read takes under 1 ms. Around it:
- Each tool call runs hooks, each a new Bun process through Git Bash, about 200 to 260 ms each.
- The MCP proxy walks the source tree on every call, about 79 ms.
- Every engine call starts a Python process: about 400 ms to start plus about 360 ms of imports. For X and Instagram that process only passes the call to an already-running host.

matt wants the decisions made on the fundamentals, measured on his machine, and judged by SubQ before anything is built.

## The two decisions

- **D1: how Claude Code's hooks reach log's code.**
- **D2: how log's Bun side reaches the Python engines.**

## Settled by test on 2026-11-08 (Claude Code 2.1.305, Windows 11)

- **Hooks run side by side.** Three hooks on one event started within 55 ms of each other, each slept 1 s, and all ended together.
- **A command hook with `args` runs with no shell.** The three test hooks ran as `bun.exe` with `args`.
- **An `http` hook's added context reaches the model.** A `type: "http"` hook returned `additionalContext` with a marker word, and the model read it back. Claude Code connected with `connection: keep-alive`.

## Done when

- A tool call's hooks and engine call meet the targets in `docs/hookStartup.md` at p99 and p99.9, measured by the method in issue #99.
- The rules still hold:
  - one session per account (rules 105, 129, 131);
  - the refusing hooks still refuse (rules 106, 155);
  - a refused or broken path stops loudly (rule 94).
