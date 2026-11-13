# Connect your agent

`logMcp` is log's MCP server. It gives your agent every `log` command as a tool. The installer puts it on your PATH next to `log`.

## Claude Code

```bash
claude mcp add log -- logMcp
```

You add it once. `logMcp` reloads its own code whenever log changes, so you never restart Claude Code for new code (rule 167):
- It waits until no call or job is running, swaps the server underneath, and tells Claude Code the tools changed.
- A tool added since the session started is always reachable through `logCall`.
- `LOG_MCP_RELOAD=off` turns this off.

## Codex

```bash
codex mcp add log -- logMcp
```

## Cursor

In `~/.cursor/mcp.json` (or `.cursor/mcp.json` in a project):

```json
{
  "mcpServers": {
    "log": { "command": "logMcp" }
  }
}
```

## Antigravity (App, CLI, IDE)

In `.agents/mcp_config.json` (workspace-level) or `~/.gemini/config/mcp_config.json` (global):

```json
{
  "mcpServers": {
    "log": {
      "command": "bun",
      "args": ["bin/logMcp.ts"],
      "timeoutSeconds": 300
    }
  }
}
```

Or if `logMcp` is installed on your `PATH`:

```json
{
  "mcpServers": {
    "log": {
      "command": "logMcp"
    }
  }
}
```

In Antigravity IDE or App, you can also open the agent panel's top-right menu (**...**) > **MCP Servers** > **Manage MCP Servers** > **View raw config** to edit `mcp_config.json` directly.

## Any other MCP client

Run `logMcp` as a stdio server, with no arguments. It reads your settings from `~/.logCli/.env`, like `log` does.

## Over HTTP

For a client that can't start a process, serve the tools over HTTP:

```bash
logMcp --http --port 7337
claude mcp add --transport http log http://127.0.0.1:7337/mcp
```

`--host` and `--port` change where it listens. Off your own machine (not `127.0.0.1`) it won't start without a token: set `LOG_MCP_TOKEN` in `~/.logCli/.env`, and clients send `Authorization: Bearer <token>`.

## First call

Your agent's first call is `getGuide({ topic: "logMcpInstructions" })`. It lists every use case and how to ask for it. `getGuide({ useCase: "<platform>/<page>" })` reads one [use case](useCases/README.md). Every tool's description names its guide, the use cases that call it and the AGENTS.md rules it falls under; AGENTS.md itself is the resource `log://agents` ([MCP server](specs/mcpServer.md)).

## Find and run any command

Three tools reach every command, so your agent doesn't have to know which tool to call:

- `logSearch { "query": "send a dm on x" }` finds the commands for a job, in plain words.
- `logGet { "id": "twitter.dm" }` gives the command's inputs and a call that works.
- `logCall { "id": "twitter.dm", "inputs": { … } }` runs it, through the same checks as the command's own tool.

A command that acts on a platform needs `live: true` and `confirmLive: true`. More: [the catalog guide](guides/logCatalog.md).

## Watch a long call

Calls that take a while write one line per step to `~/.logCli/mcp/<day>.log`. Follow along with:

```bash
tail -f ~/.logCli/mcp/$(date -u +%F).log
```

## The live browser in the chat

When an account's browser needs a person (a sign-in page), the agent calls
`browserView { account }`. What the person sees depends on where the runtime
is.

**On the person's own machine** (log runs where they are), the browser window
is already on their screen, so nothing is streamed. `browserView` says "the
<platform> sign-in is open in the browser window on this machine. Finish
there, then continue", in text for every client and in the inline view as a
card with a Done button. The view-only frame and input tools refuse with
`browserViewLocal`.

**From a remote runtime** (a VPS or Boat instance reached through the hosted
side), a host that supports MCP Apps (the `io.modelcontextprotocol/ui`
extension: Claude on the web and Desktop, ChatGPT, Cursor, VS Code, Goose,
MCPJam) renders `ui://log/browserView` inline: the account's live page, its
address and state, and a Done button. The person clicks and types in it
without leaving the chat.

**How log decides.** `LOG_BROWSER_VIEW_LOCATION` (`local` or `remote`) is
settled once per process by whatever serves the call (`settleLocation` in
`src/mcp/apps/browserView/client.ts`), unless it is already set:

- the stdio MCP (`logMcp`, started by the host app on this machine) is `local`;
- the HTTP MCP is `local` only when it listens on loopback with no token and
  no OAuth (`httpLocation`), and `remote` otherwise;
- the hosted bridge (`log runtime connect`) is `remote`.

Plain CLI runs default to `local`. Set the variable to override it, for
example for an HTTP MCP on loopback behind a tunnel.

| Tool | Who sees it | Input | Answer |
| --- | --- | --- | --- |
| `browserView` | the model and the view | `account` | text for the model; `structuredContent.json` is the view: `phase`, `needsHuman`, `pageState`, `generation`, `revision`, `address`, `width`, `height`, `canInteract`, `location`, `streamKind` (`voxl`, `frames` or `none`) and, from a remote runtime, the voxl `stream` descriptor (`url`, `page`, `window`) |
| `browserViewFrame` | the view only | `account`, `generation`, `withState` | the fallback picture: the latest JPEG (base64) and its revision, plus the view when asked |
| `browserViewInput` | the view only | `account`, `generation`, `revision`, `event` (`click` x/y in page pixels, `text`, `key`, `scroll`) | the new view, or a refusal: `browserStateChanged`, `browserInputStopped`, `browserBusy`, `browserGenerationChanged`, `browserInputInvalid` |
| `browserViewDone` | the view only | `account` | the page read again and `done` (no sign-in or stop left); the view polls it for state |

The three view-only tools carry `_meta.ui.visibility: ["app"]` and are listed
only to a client that advertises the extension; a direct client without it is
refused with `browserViewAppOnly`. The hosted bridge calls `runToolCall`
without an MCP session, so through it the hosted side is the one that must keep
these tools away from the model.

**Picture: voxl first.** voxl is the stream. `browserView` from a remote
runtime carries the stream descriptor that `streamSurface` reports (the
`LOG_VOXL_URL` of a `--read-only` voxl on the browser's display, and the page
and window geometry from the fullscreened Chromium window). The view opens
voxl's WebSocket itself (`connectVoxl` in
`src/mcp/apps/browserView/widget/voxl.ts`), decodes its H.264 stripes with
WebCodecs onto a canvas and maps a click on the canvas to the page by taking
off the window's origin. It does not nest voxl's own page, because hosts block
nested iframes by default (ChatGPT says so in its docs), so no `frameDomains`
are declared. voxl must allow the host's view origin with `--allowed-origins`.
The descriptor's URL carries voxl's password, which on a `--read-only` voxl
lets a viewer watch and nothing else; it is in the tool's structured answer,
so treat it as visible to the model and give each runtime its own.

**Fallback: screenshots.** When voxl cannot run (a Camoufox account, which has
no CDP; no `LOG_VOXL_URL`; one that is not https, or http on loopback; or a
socket that fails or a browser without WebCodecs), the view pulls JPEG frames
through `browserViewFrame`, about 2 a second, and its badge says
"Screenshots (fallback)".

**Input, always the gated path.** Clicks and keys never go through voxl.
`browserViewInput` posts to the same viewer `/input` as the console (see
[the live browser viewer](browsers.md#the-live-browser-viewer)), so input
reaches the page only while it still asks for sign-in and the revision still
matches, and each one is a recorded step. When the person presses Done, the
view reads the page again, puts a line in the model's context
(`ui/update-model-context`) and sends it as the person's message
(`ui/message`), so the agent calls `browserView` and carries on.

The view asks the host for fullscreen when a remote page needs sign-in and the
host offers it, and shows fullscreen and picture-in-picture buttons when the
host lists them (`ui/request-display-mode`); otherwise it stays inline.

**CSP.** `ui://log/browserView` is one HTML page with its script, styles and
fonts inline. Its `_meta.ui.csp` declares no `resourceDomains` and no
`frameDomains`; `connectDomains` is the `LOG_VOXL_URL` origin and its `wss:`
twin when it is https (or loopback `http:` and `ws:` for a host on the same
machine), and empty otherwise.

**Hosts without MCP Apps** (Claude Code, Codex) get the same text: on the
person's machine, finish in the window there; from a remote runtime, open the
view in an MCP Apps host, or the local console on the runtime's machine.

Next: [using log well](usingLog.md).
