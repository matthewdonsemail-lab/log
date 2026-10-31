# Connect your agent

`logMcp` is log's MCP server. It gives your agent every `log` command as a tool. The installer puts it on your PATH next to `log`.

## Claude Code

```bash
claude mcp add log -- logMcp
```

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

Your agent's first call is `getGuide({ topic: "logMcpInstructions" })`. It lists every use case and how to ask for it.

## Watch a long call

Calls that take a while write one line per step to `~/.logCli/mcp/<day>.log`. Follow along with:

```bash
tail -f ~/.logCli/mcp/$(date -u +%F).log
```

Next: [using log well](usingLog.md).
