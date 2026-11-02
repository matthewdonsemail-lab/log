---
title: "MCP server"
---

# MCP server

The log MCP server is how every agent works with log-cli: it carries matt's rules into the agent's context, serves the guides and the use cases, names on every tool the rules, guide and use cases it falls under, and the hooks keep agents on it. Rules 47, 95 and 106 (rule 95 replaces rule 47's long instructions with short ones that send the agent to the full guide; rule 76 puts rule one first).

## What the server carries

### REQ-MCP-01: The instructions carry the core rules, rule one first

The server's instructions, sent at initialize, list the core rules each with its rule number, and the first of them is rule one ("if we don't know, we do this", rules 73-76), followed by rule 30.

Checked by: code and SubQ

### REQ-MCP-02: The instructions send the agent to the full guide first

The instructions say to load `getGuide({ topic: "logMcpInstructions" })` before the other log tools, once per session. Rule 95.

Checked by: code (anchors)

### REQ-MCP-03: AGENTS.md is the resource log://agents

The server lists one resource, `log://agents`, and reading it returns AGENTS.md as it is in the checkout.

Checked by: code and SubQ

### REQ-MCP-04: Every tool names the rules it falls under

Every tool's description ends with a line naming AGENTS.md (`log://agents`) and the rules it falls under: its command's own rules from `COMMAND_RULES` and the rules every tool falls under (30, 38, 39, 40, 41).

Checked by: code and SubQ

### REQ-MCP-05: Every tool names its guide

Every tool whose command belongs to a guide topic says in its description to load that guide with `getGuide({ topic })` before first using it. A flow tool names the flows guide.

Checked by: code and SubQ

## Guides and use cases

### REQ-MCP-06: getGuide reads a guide or a use case

The `getGuide` tool takes a `topic` (one of the guide topics, read from `docs/guides/<topic>.md`, the core guide when none is given) or a `useCase` (`<platform>/<page>`, read from `docs/useCases/<platform>/<page>.md`), and an unknown one is answered with an error listing the ones there are.

Checked by: code and SubQ

### REQ-MCP-07: Every tool names the use cases that call it

A use case page names its tools in backticks. Every tool named on a use case page carries a line in its description naming those use cases as `getGuide({ useCase: "<id>" })`, placed before its guide line.

Checked by: code and SubQ

### REQ-MCP-08: Every tool declares Claude Code's result limit

Every tool the server lists carries `anthropic/maxResultSizeChars` in its `_meta`, so a guide or a big result arrives whole.

Checked by: code and SubQ

### REQ-MCP-09: The pre-commit review asks SubQ whether the use cases are stale

On pre-commit, `check:useCases` reads the latest Claude Code session for the repo (matt's asks and the tools called) and asks SubQ, for every use case page, whether it is still current, stale or should move, and whether the session did repeatable work no page covers. A stale or misplaced page, or uncovered work, stops the commit unless that page, or a new page, is staged.

Checked by: code and SubQ

## Through the MCP only

### REQ-MCP-10: A log command run by hand from a shell is refused

The PreToolUse hook refuses a shell command that runs `log …` or `bun bin/log.ts …`, and names the MCP tool route instead. Rule 106.

Checked by: code and SubQ

### REQ-MCP-11: The terminal-only prompts are let through

A hand-run command whose name is in `TERMINAL_ONLY` (launch, login, mcp, chat pin, cookies save, messenger pin) is not refused, since matt runs those prompts in a terminal.

Checked by: code and SubQ

### REQ-MCP-12: A stale MCP server is said to matt

When the running MCP server started before the newest change to log-cli's code, the engines hook says so loudly and tells matt to restart the app, and says never to work around it with a hand-run command.

Checked by: code and SubQ

## Local changes first

### REQ-MCP-13: Uncommitted local changes are said loudly

The engines hook lists the uncommitted changes in log-cli's code (src, python, vendor, bin, scripts, package.json) under `>>> UNCOMMITTED LOCAL CHANGES`, and says to read each one's diff and never overwrite, revert, stage, publish or ship them without matt. Rule 106.

Checked by: code and SubQ

### REQ-MCP-14: They are said at session start and whenever they change

The engines hook writes its text at every session start, and on a prompt only when the text differs from the last one it wrote.

Checked by: code and SubQ
