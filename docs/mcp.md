# Use log from your AI agent (MCP)

`logMcp` is log's MCP server. It gives your agent every `log` command as a tool, with the same flags and the same safety: anything that acts on a platform is its own `…Live` tool and needs `confirmLive: true`. The install puts `logMcp` on your PATH next to `log`.

The first call an agent makes is `getGuide({ topic: "logMcpInstructions" })`. It lists every use case and how to ask for it, and each tool's description names the guide to load before using it.

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

Any client that runs a stdio server takes the same entry: the command is `logMcp`, with no arguments. The server reads your settings from `~/.logCli/.env`, as `log` does.

## Over HTTP (a client that can't start a process)

`logMcp --http` serves the same tools at `http://127.0.0.1:7337/mcp`. `--host` and `--port` change where it listens.

```bash
logMcp --http --port 7337
```

On anything other than loopback it refuses to start without a sign-in: set `LOG_MCP_TOKEN` in `~/.logCli/.env`, and clients send it as `Authorization: Bearer <token>`.

```bash
claude mcp add --transport http log http://127.0.0.1:7337/mcp
```

## Watching a long call

Every call that runs over time writes one line per stage to `~/.logCli/mcp/<day>.log`, so you can follow it live:

```bash
tail -f ~/.logCli/mcp/$(date -u +%F).log
```

## From a checkout

Opened in a clone of this repo, Claude Code and Codex pick up `.mcp.json`, which runs `bun bin/logMcp.ts` from the checkout. Nothing to add.
