# Sources for the platform-neutral surfaces spec

14 November 2026.

Status: reference. Every external claim in [platformNeutralSurfaces.md](platformNeutralSurfaces.md) and its audits, checked against the primary page on 14 November 2026. Each row says what the page states. Where a page was cut off or dropped part of its content, the row says so.

The pages were found with a web search and then read directly. Nothing here was verified by running a harness.

## What the sources changed in the spec

These are corrections. The spec files now say what the source says.

| # | The spec said | The source says | Effect |
|---|---|---|---|
| 1 | The Hermes plugin gets a `pre_llm_call` hook | A portable plugin (`plugin.json`, `mcp.json`, `skills/`) can't register hooks. Hooks need a native plugin: `plugin.yaml` and an `__init__.py` with `register(ctx)` | `hermesPlugin/` is a portable plugin. Routing in Hermes needs a native plugin beside it, or the plugin converted. Slice 19 |
| 2 | Hermes names log's tools `mcp_log_*`, so the plugin's skills use the wrong prefix | A portable plugin's MCP tools are named `mcp__<server>__<tool>`. Servers in `config.yaml` follow the config reference | The plugin's skills use the right prefix for a plugin install. `docs/harnesses/hermes.md` describes the `config.yaml` path. Both need stating |
| 3 | A host with URL elicitation gets `inputRequests: [{ type: "url", url, message }]` | In revision 2026-07-28 the input request is `{ method: "elicitation/create", params: { mode: "url", url, message } }` inside `InputRequiredResult.inputRequests`, with `resultType: "input_required"` | The shape in [inAppVerificationAndGenerativeUI.md](inAppVerificationAndGenerativeUI.md) is corrected. Slice 20 |
| 4 | The sign-in link is "signed and single-use" | The server must not send a URL that is pre-authenticated, and must verify that the person who opens it is the person the request was made for | The link carries no access by itself. The console page checks the signed-in user matches. Slice 20 |
| 5 | ChatGPT, Codex and Cursor support URL elicitation | Verified support for URL mode is Claude Code and VS Code only. The rest are listed as unknown | The host matrix marks them unknown. Slice 20 |
| 6 | A schema can't express "one of these two inputs" | Revision 2026-07-28 allows any JSON Schema 2020-12 keyword in `inputSchema`, so `oneOf` is legal in the protocol. What each model provider accepts is a separate limit | Slice 11 uses the keyword where hosts accept it and a description where they don't |
| 7 | The play state should be per session | Revision 2026-07-28 removes protocol sessions and the `Mcp-Session-Id` header. State across calls uses a handle the server mints and the client passes as a tool argument | Slice 17 keys the play by a server-minted handle, not the session header. New slice 22 |
| 8 | The server lists UI tools only to hosts that draw them, and varies text by whether the host has a shell | In revision 2026-07-28 `tools/list` must not vary per connection | The tool list becomes one list. What differs per host moves into results. New slice 22 |
| 9 | Guides can be any size | Claude Code warns above 10,000 tokens of MCP output, limits it to 25,000 tokens, and saves text results over 50,000 characters to a file | Four guides are over 50,000 characters (`xSending`, `facebookFlows`, `facebookBrowser`, `facebookMarketplace`). Slice 18 sets the budget from these limits |
| 10 | Hook text can be any size | Claude Code caps each `additionalContext` string at 10,000 characters. Codex limits each hook's model-visible output to about 2,500 tokens | Slice 19's adapters cut to the harness's limit |
| 11 | Hook text is written as instructions | Claude Code's docs say to write `additionalContext` as factual statements, because imperative text can trigger prompt-injection defences | The router's `>>> PLAY MATCH` text and the hook answers are reworded. Slice 16 |
| 12 | Nothing installs hooks for a user, so they would need copying into user settings | Claude Code and Codex both load hooks from a plugin's `hooks/hooks.json`. Cursor loads plugin hooks too | Slice 19 ships a plugin per harness, not edits to user settings |

## MCP: the protocol

| Claim | Source | What it states |
|---|---|---|
| The current revision is 2026-07-28 | [Key changes](https://modelcontextprotocol.io/specification/2026-07-28/changelog) | Lists changes since 2025-11-25 |
| No handshake and no sessions | same | The `initialize` handshake and the `Mcp-Session-Id` header are removed. Each request carries its protocol version and client capabilities in `_meta` (`io.modelcontextprotocol/protocolVersion`, `io.modelcontextprotocol/clientCapabilities`) |
| List endpoints don't vary | same | "`tools/list`, `resources/list`, `prompts/list` no longer vary per-connection." State across calls uses "explicit, server-minted handles passed as ordinary tool arguments" |
| `server/discover` | same | Servers must implement it to advertise versions, capabilities and identity |
| Server-initiated requests are replaced | same | A server returns `InputRequiredResult` (`resultType: "input_required"`) whose `inputRequests` carry the request. The client answers with `inputResponses` on a retry. Every result carries a required `resultType` |
| Tool order | same | Servers should return tools in a deterministic order |
| Cache hints | same | `ttlMs` and `cacheScope` are required on list and read results |
| Schemas | same | `inputSchema` and `outputSchema` allow any JSON Schema 2020-12 keyword; `structuredContent` allows any JSON value |
| Removed and deprecated | same | `ping`, `logging/setLevel` and `notifications/elicitation/complete` are removed. Roots, Sampling and Logging are deprecated |
| Serving old and new clients | [Versioning and compatibility](https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning) | A server may serve both. A request with per-request `_meta` is served statelessly; an `initialize` request selects the legacy behaviour. A client on an old revision can't reach a server that speaks only the new one |
| `server/discover`'s shape | [Discovery, 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/server/discover) | The request carries only `_meta`. The result has `resultType`, `supportedVersions`, `capabilities`, `_meta["io.modelcontextprotocol/serverInfo"]`, an optional `instructions`, and the cache fields `ttlMs` and `cacheScope` |
| Per-request fields and errors | [Overview, 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/basic/index) | `protocolVersion` and `clientCapabilities` are required in every request's `_meta`, `clientInfo` and `logLevel` optional; a request missing a required field is `-32602` (400 on HTTP). `-32020` header mismatch, `-32021` missing client capability (`data.requiredCapabilities`), `-32022` unsupported version (`data.supported`, `data.requested`). Servers should put `serverInfo` in every result's `_meta`. An absent `resultType` is read as `complete` |
| Multi round-trip requests | [MRTR, 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/basic/patterns/mrtr) | `inputRequests` is a map keyed by server-chosen ids; the retry carries `inputResponses` under the same keys. `requestState` is an opaque string the client echoes; the server must treat it as attacker-controlled, protect its integrity when it matters, and should bind it to the principal, an expiry and the request. Only `tools/call`, `resources/read` and `prompts/get` may answer `input_required`, and never with a request the client did not declare |
| Streamable HTTP on the new revision | [Streamable HTTP, 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http) | Every POST carries `MCP-Protocol-Version`, `Mcp-Method` and, for `tools/call`, `resources/read` and `prompts/get`, `Mcp-Name` (base64 as `=?base64?…?=` when needed); a missing or mismatched one is 400 with `-32020`. An unsupported version is 400, an unknown method 404 with `-32601`, a notification 202. No session id is minted or echoed, and server-to-client requests are not sent on any stream |
| stdio on the new revision | [stdio, 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/stdio) | A dual-era client probes with `server/discover` and falls back to `initialize` on any error that is not a recognised modern one. Cancellation on stdio is `notifications/cancelled` |
| Tool annotations | [Schema reference, 2025-06-18](https://modelcontextprotocol.io/specification/2025-06-18/schema) | `title`, `readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`. All are hints, and clients should not decide tool use on annotations from untrusted servers |

**What log speaks today (read in the code):** the local server uses `@modelcontextprotocol/sdk` 1.32.1, whose latest revision is 2025-11-25. The hosted server lists 2025-11-25, 2025-06-18 and 2025-03-26 (`MCP_PROTOCOL_VERSIONS`, `python/controlService/settings.py`), reads capabilities at `initialize` and carries the UI flag in the session header for those. Since slice 22 both also serve 2026-07-28 statelessly, in log's own code beside the SDK (`src/mcp/stateless/`, `python/controlService/mcpRevision.py`); the pages above were re-read on 14 November 2026 for it.

## MCP: elicitation

Source: [Elicitation, 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/client/elicitation).

- **Two modes.** Form mode collects structured data through the client. URL mode sends the person to a URL "for sensitive interactions that must not pass through the MCP client".
- **Capability.** The client declares `elicitation: { form: {}, url: {} }`. An empty object means form only. A server must not send a mode the client didn't declare.
- **Secrets.** "Servers MUST NOT use form mode elicitation to request sensitive information such as passwords, API keys, access tokens, or payment credentials", and must use URL mode for them.
- **The URL.** The server must not put credentials or personal information in it, and must not provide a URL "which is pre-authenticated to access a protected resource".
- **The client.** It must not open the URL without consent, must show the full URL first, and must open it in a way that doesn't let the client or model see the page. The example given: on iOS, SFSafariViewController is good and WkWebView is not.
- **Who opens it.** "The MCP Server MUST verify the identity of the user who opens the URL before accepting information."
- **What "accept" means.** It means the person agreed to open the URL, not that they finished. The client retries the original request, and the server answers with the result or another `InputRequiredResult`.
- **Form schemas** are limited to flat objects with primitive properties.

**Which clients support URL mode.** [canimcp.dev](https://canimcp.dev/feature/elicitation.url), a third-party tracker, lists three of 42 clients as supported: Claude Code and Visual Studio Code (each checked by hand against the vendor's page) and Glama. The other 39, including Claude.ai, Cursor, ChatGPT, Codex, Goose and opencode, are "Unknown". Claude Code's own page says `elicitation/create` "is served only in interactive terminal sessions" ([Claude Code: MCP](https://code.claude.com/docs/en/mcp)).

## MCP Apps

| Claim | Source | What it states |
|---|---|---|
| How a client declares support | [Versioning and compatibility](https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning) | `extensions: { "io.modelcontextprotocol/ui": { mimeTypes: ["text/html;profile=mcp-app"] } }` in its capabilities. If one side doesn't support an extension, the other falls back to core behaviour or rejects the request |
| Which clients draw MCP Apps | [MCP Apps overview](https://modelcontextprotocol.io/extensions/apps/overview) | Claude, Claude Desktop, VS Code GitHub Copilot and Microsoft 365 Copilot are named in the excerpt read; the launch post also names Goose |
| The support matrix | [Extension support matrix](https://modelcontextprotocol.io/extensions/client-matrix) | Rows for Claude (web), Claude Desktop, Claude Code, VS Code GitHub Copilot, Microsoft 365 Copilot, Goose, Postman, MCPJam, ChatGPT, Cursor and others. Codex, Hermes, Grok, opencode and Antigravity are not listed. The cells are icons, which the fetch dropped, so the yes and no values were not re-read here |
| CSP fields | [McpUiResourceCsp](https://apps.extensions.modelcontextprotocol.io/api/interfaces/app.McpUiResourceCsp.html) | `connectDomains` (fetch, XHR, WebSocket; the example includes a `wss://` origin), `resourceDomains` (wildcard subdomains allowed), `frameDomains` (nested iframes; none when omitted), `baseUriDomains`. All default to nothing allowed. Every origin must be declared |

Not re-read: OpenAI's page on MCP Apps in ChatGPT redirected and was not fetched. `docs/harnesses/chatgpt.md` cites it from an earlier reading.

## Hooks, per harness

| Harness | Source | Where hooks load from | What can add context for the model | Limits |
|---|---|---|---|---|
| Claude Code | [Hooks reference](https://code.claude.com/docs/en/hooks.md) | `~/.claude/settings.json`, `.claude/settings.json`, `.claude/settings.local.json`, managed settings, a plugin's `hooks/hooks.json`, skill frontmatter | `hookSpecificOutput.additionalContext` on SessionStart, UserPromptSubmit, PreToolUse, PostToolUse and Stop. PreToolUse can deny with `permissionDecision` | Each `additionalContext` string is capped at 10,000 characters. MCP tools match as `mcp__<server>__<tool>`; a plugin's server as `mcp__plugin_<plugin>_<server>__<tool>` |
| Codex | [Hooks](https://learn.chatgpt.com/docs/hooks) | `~/.codex/hooks.json` or `[hooks]` in `~/.codex/config.toml`; the project's `.codex/` when trusted; a plugin's `hooks/hooks.json` | `hookSpecificOutput.additionalContext` on SessionStart, UserPromptSubmit, PreToolUse and PostToolUse. PreToolUse can deny | About 2,500 tokens per hook output by default. Non-managed hooks must be trusted before they run. MCP tools match as `mcp__<server>__<tool>` |
| Cursor | [Hooks](https://cursor.com/docs/agent/hooks) | `~/.cursor/hooks.json`, `<project>/.cursor/hooks.json`, enterprise and team locations, plugins | `additional_context` on `sessionStart`, `postToolUse` and `postToolUseFailure`. `beforeSubmitPrompt` returns only `continue` and `user_message`, so it can't add context. `beforeMCPExecution` can deny | |
| Hermes | [Build a Hermes plugin](https://hermes-agent.nousresearch.com/docs/developer-guide/plugins), [Hooks](https://hermes-agent.nousresearch.com/docs/user-guide/features/hooks) | A native plugin's `register(ctx)` with `ctx.register_hook` | `pre_llm_call` returns `{ "context": … }` or a string, appended to the turn's user message | A portable plugin can't register hooks. With `trust: "untrusted"`, every tool not marked `readOnlyHint: true` asks first, and fails closed where nobody can answer |
| opencode | [Plugins](https://opencode.ai/docs/plugins) | `.opencode/plugins/` in the project and `~/.config/opencode/plugins/` | Not stated on the pages read. The hook list is on a server page that was not fetched | |

Codex also reads the server's `instructions` field as server-wide guidance, configures servers in `config.toml` or with `codex mcp add`, and shares that configuration between its desktop app, CLI and IDE extension ([Codex: MCP](https://learn.chatgpt.com/docs/extend/mcp?surface=cli)). That page doesn't mention elicitation or MCP Apps.

## Hermes plugins and the catalog

| Claim | Source | What it states |
|---|---|---|
| Two formats | [Build a Hermes plugin](https://hermes-agent.nousresearch.com/docs/developer-guide/plugins) | Native: `plugin.yaml` and `__init__.py`, the only format that registers tools, hooks and commands. Portable: `plugin.json`, `skills/*/SKILL.md`, `mcp.json`; it doesn't import Python |
| Skill names | same | `<plugin>:<skill>` |
| Tool names | same | The model sees a portable plugin's tools as `mcp__<server>__<tool>`, within a 64-character cap |
| The catalog | [Plugin catalog README](https://github.com/NousResearch/hermes-agent/blob/main/plugin-catalog/README.md) | Each entry pins a full 40-character commit. A change of pin is a new PR. An entry can name a `subdir`. Entries are submitted by the repo's owner or a major contributor |

## XState

Source: [Actors](https://stately.ai/docs/actors), [Invoke](https://stately.ai/docs/invoke).

- An invoked actor takes `onDone` when it completes and `onError` when it throws. A rejected promise takes `onError` with the error on the event.
- A callback actor's rejections are not caught by `onError`.
- An actor can be started from a persisted snapshot: `createActor(logic, { snapshot })`, with `actor.getPersistedSnapshot()` to save it.

The repo uses `xstate` 5.33.3.

## Not verified

- Whether each host in the support matrix draws MCP Apps: the matrix's cells were not re-read, and no host was run.
- ChatGPT's bridge methods and CSP handling: the page was not fetched in this pass.
- opencode's hook list.
- Whether Hermes or Grok support either elicitation mode.
- Whether a real client on revision 2026-07-28 works with log's servers. They serve it since slice 22, tested against the wire shapes on the pages above, not against a client.
