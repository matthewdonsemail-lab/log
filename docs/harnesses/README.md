# Harnesses: how log works in each one

A harness is the agent app someone talks to log through: Claude, ChatGPT, Cursor, Codex, Hermes or Grok. log is the same MCP server in all of them. What changes from one to the next is four things:

1. **Whether it draws MCP Apps.** That is the MCP extension `io.modelcontextprotocol/ui`. Two of log's tools draw through it: `report` (the generated view) and `browserView` (the live browser for signing an account in). A host that draws MCP Apps shows them inline in the chat; any other host gets the same answer as text.
2. **How log's guidance reaches the model.** log has three ways in, used in this order:
   - **The prompt router.** It matches the owner's request against every use case's "How the owner asks for it" phrases and returns the use case to follow ([use cases](../useCases/README.md)). Where log installs a prompt hook (Claude Code, Codex), it runs on every prompt by itself. Everywhere else the model runs it: `getGuide({ ask: "<the owner's words>" })` calls the same `route` on the server, local or hosted. On the word score alone both give the same answer for the same prompt, and a golden set of prompts checks it (`src/useCases/router/fixtures/golden.json`). The hook's service adds a meaning score from a local embedding model, which the ask path does without. On a clear match `ask` loads that play for the caller; on a tie or a near tie it returns a short menu and loads nothing.
   - **The server's `instructions`.** Sent at connect, they tell the model to load `getGuide({ topic: "logMcpInstructions" })` first.
   - **The tool descriptions.** Each one names its guide and the use cases that call it.
3. **How it connects.** Either to the hosted server, `https://mcp.listeningkit.com/mcp` over OAuth, or to `logMcp` on the same machine over stdio.
4. **Where an account is signed in.** In the chat through `browserView`, in the window on the owner's screen when log runs on their machine, or in the log console. All three drive the same live browser, `src/browser/viewer`.

| Harness | Draws MCP Apps | Prompt router | Server instructions | Connects to |
|---|---|---|---|---|
| [Claude (web, desktop, mobile)](claudeApp.md) | yes | `getGuide({ ask })` | not confirmed | hosted, as a custom connector |
| [Claude Code](claudeApp.md#claude-code) | no | the hook log installs | yes | hosted or local |
| [ChatGPT](chatgpt.md) | yes | `getGuide({ ask })` | yes (OpenAI's docs) | hosted |
| [Cursor](cursor.md) | yes | `getGuide({ ask })` | not confirmed | hosted or local |
| [Codex](codex.md) | not listed | the hook log installs | yes (OpenAI's docs) | hosted or local |
| [Hermes](hermes.md) | not mentioned in its docs | `getGuide({ ask })` | not mentioned in its docs | hosted (OAuth) or local |
| [Grok (xAI API)](grok.md) | not mentioned in its docs | `getGuide({ ask })` | not mentioned in its docs | hosted only, from xAI's servers |

"Draws MCP Apps" comes from the [MCP extension support matrix](https://modelcontextprotocol.io/extensions/client-matrix), read on 2026-11-13. It is community-maintained, so test before relying on it.

## What this means for log

- **Hosts that draw MCP Apps:**
  - **Views:** `report` shows the view inline, with pages per person and buttons that ask the next question.
  - **Sign-in:** `browserView` shows the account's live browser inline when log runs remotely (hosted or a paired workspace). Locally, it's the window on the owner's screen.
- **Hosts that don't:**
  - **Views:** they get the view as text.
  - **Sign-in:** happens in the window or the log console.
- **Where there is no prompt hook,** the model routes each request with `getGuide({ ask })`. Both servers' instructions say to, and so does `getGuide`'s own description, so it works whether or not a host passes the instructions on.
