# Slack

log reads your Slack DMs and group DMs in every workspace your session is signed in to, watches new messages as they come in, and sends messages for you. It talks to Slack directly through the vendored gabriel-slack client with the account's saved session, the browser's `d` cookie. No browser opens for any of this.

Commands that read send nothing. `log slack send` is a dry run until you add `--live`.

## What you can do

**See your workspaces** (reads only)

- `log slack workspaces --account <a>`: every workspace the session is signed in to.

**See your chats** (reads only)

- `log slack chats --account <a> [--workspace <domain>]`: your DMs and group DMs, with their ids and who they're with.

**Read a chat** (reads only)

- `log slack read --account <a> --chat <id or who it is with> [--workspace <domain>] [--limit <n>]`: the latest messages, oldest first: who sent each, when and what.

**Watch messages live** (reads only)

- `log slack watch --account <a> [--workspace <domain>] [--chat <id or who>]`: prints each message the moment Slack's websocket sends it. The inbox hook runs it for every signed-in account, so new DMs and mentions reach the agent as they land.

**Send a message** (acts, dry run until `--live`)

- `log slack send --account <a> --chat <id or who> --text "…"`: one message to a DM or group. A draft on several lines goes out one message per line. A rate limit or any other refusal stops it, with nothing retried.

## Signing in

1. In a terminal, `log slack cookies save --account <a>` asks for the `d` cookie (`xoxd-…`) from a browser signed in to app.slack.com, masked, and saves it to the local account. It's never printed.
2. `log slack session check --account <a>`: checks Slack still accepts the session and lists its workspaces. Sends nothing.

The full steps: [Adding an account](../accounts.md).

## Use cases

- [Reading and answering a Slack DM](../useCases/slack/dmReply.md): find the chat by who it's with, read it, draft in your voice, gate it and send.

## Full detail

- [How Slack is built](../platforms/slack/README.md): the client, what log calls and what Slack's own web client calls.
- [Reference](../reference.md): every command, flag and MCP tool.
- Agent guide: [Slack](../guides/slack.md).
