# Harnesses: how log works in each one

A harness is the agent app someone talks to log through: Claude, ChatGPT, Cursor, Codex, Hermes, OpenCode, Antigravity or Grok. log is the same MCP server in all of them. What changes from one to the next is four things:

1. **Whether it draws MCP Apps.** That is the MCP extension `io.modelcontextprotocol/ui`. Two of log's tools draw through it: `report` (the generated view) and `browserView` (the live browser for signing an account in). A host that draws MCP Apps shows them inline in the chat; any other host gets the same answer as text.
2. **How log's guidance reaches the model.** log has three ways in, used in this order:
   - **The prompt router.** It matches the owner's request against every use case's "How the owner asks for it" phrases and returns the use case to follow ([use cases](../useCases/README.md)). Where log has a prompt hook (Claude Code, Codex, OpenCode and Antigravity in the repo, and Hermes through the native `logHooks` plugin's `pre_llm_call`), it runs on every prompt by itself; when the hook's context service is down, the hook falls back to the same word router, so the play is still named. Cursor's prompt hook can't add context, so Cursor gets a `sessionStart` and a `postToolUse` hook and routes with `ask`. Everywhere else the model runs it: `getGuide({ ask: "<the owner's words>" })` calls the same `route` on the server, local or hosted. On the word score alone both give the same answer for the same prompt, and a golden set of prompts checks it (`src/useCases/router/fixtures/golden.json`). The hook's service adds a meaning score from a local embedding model, which the ask path does without. On a clear match `ask` loads that play for the caller; on a tie or a near tie it returns a short menu and loads nothing.
   - **The server's `instructions`.** Sent at connect, they tell the model to load `getGuide({ topic: "logMcpInstructions" })` first.
   - **The tool descriptions.** Each one names its guide and the use cases that call it.
3. **How it connects.** Either to the hosted server, `https://mcp.listeningkit.com/mcp` over OAuth, or to `logMcp` on the same machine over stdio.
4. **Where an account is signed in.** In the chat through `browserView`, in the window on the owner's screen when log runs on their machine, or in the log console. All three drive the same live browser, `src/browser/viewer`.

<!-- harnessTable: written from src/agentHooks/harness (bun run check:agentHooks --write) -->
| Harness | Prompt hook | Session-start hook | Tool hooks | Draws MCP Apps | Server instructions | Skills | URL elicitation | Prompt router | Hook text limit | Connects to | Hooks from |
|---|---|---|---|---|---|---|---|---|---|---|---|
| [Claude Code](claudeApp.md#claude-code) | yes | yes | yes | no | yes | yes | yes | the prompt hook | 10,000 characters | hosted or local | `.claude/settings.json` |
| [Codex](codex.md) | yes | yes | yes | unknown | yes | unknown | unknown | the prompt hook | 7,500 characters | hosted or local | `.codex/hooks.json` |
| [Cursor](cursor.md) | no | yes | yes | yes | unknown | unknown | unknown | `getGuide({ ask })` | 7,500 characters | hosted or local | `.cursor/hooks.json` |
| [Hermes](hermes.md) | yes | no | yes | unknown | unknown | yes | no | the `pre_llm_call` hook (native plugin) | 7,500 characters | hosted or local | `hermesPlugin/native/plugin.yaml` |
| [OpenCode](README.md) | yes | yes | yes | unknown | unknown | unknown | unknown | the prompt hook | 20,000 characters | local | `.opencode/plugins/logHooks/index.ts` |
| [Antigravity](README.md) | yes | yes | yes | unknown | unknown | unknown | unknown | the prompt hook | 7,500 characters | local | `.agents/hooks.json` |
| [Claude (web, desktop, mobile)](claudeApp.md) | no | no | no | yes | unknown | unknown | unknown | `getGuide({ ask })` | no hooks | hosted | none |
| [ChatGPT](chatgpt.md) | no | no | no | yes | yes | unknown | unknown | `getGuide({ ask })` | no hooks | hosted | none |
| [Grok (xAI API)](grok.md) | no | no | no | unknown | unknown | unknown | unknown | `getGuide({ ask })` | no hooks | hosted | none |
<!-- /harnessTable -->

The table is `HARNESSES` in `src/agentHooks/harness/types.ts`; every hook file and this table are written from it and from `AGENT_HOOKS`. "unknown" means no source in [sources.md](../proposals/sources.md) states it. Each hook's text is cut to the limit shown. "Draws MCP Apps" comes from the [MCP extension support matrix](https://modelcontextprotocol.io/extensions/client-matrix), read on 2026-11-13. It is community-maintained, so test before relying on it.

## What this means for log

- **Hosts that draw MCP Apps:**
  - **Views:** `report` shows the view inline, with pages per person and buttons that ask the next question.
  - **Sign-in:** `browserView` shows the account's live browser inline when log runs remotely (hosted or a paired workspace). Locally, it's the window on the owner's screen.
- **Hosts that don't:**
  - **Views:** they get the view as text.
  - **Sign-in:** happens in the window or the log console.
- **Where there is no prompt hook,** the model routes each request with `getGuide({ ask })`. Both servers' instructions say to, and so does `getGuide`'s own description, so it works whether or not a host passes the instructions on.
