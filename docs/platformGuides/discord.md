# Discord

log reads your Discord DMs, group chats and server channels, watches new messages as they come in, and sends messages for you. It talks to Discord directly through its own API client with the account's saved session. No browser opens for any of this.

Commands that read send nothing. `log discord send` is a dry run until you add `--live`.

## What you can do

**See your chats** (reads only)

- `log discord chats --account <a>`: your DMs and group DMs, with their ids and members.

**Read a chat or channel** (reads only)

- `log discord read --account <a> --channel <id or chat name> [--limit <n>]`: the latest messages, oldest first: who sent each, when and what.

**Watch messages live** (reads only)

- `log discord watch --account <a> [--channel <id or name>] [--seconds <s>]`: prints each message the moment Discord sends it.

**Send a message** (acts, dry run until `--live`)

- `log discord send --account <a> --channel <id or name> --text "…"`: one message to a DM, a group or a channel. A draft on several lines goes out one message per line; `--asOne` sends it as one. The message is checked first for hidden characters, odd spaces or pasted Claude HTML, and refused with `aiArtifacts` if any are there: retype it as plain text.

**Find old conversations** (reads only)

- `log search "<query>" --platform discord`: searches saved conversations by words and by meaning.
- `log search index --platform discord` reads every DM and group to save them. If Discord refuses part way (a rate limit or any other refusal), the read stops there, says which chat and what Discord answered, and keeps what it already read. Nothing more is read until you run it again.

## Signing in

1. Add the account: `log localAccount add --platform discord --account <a> --adsPower <profileId>`.
2. Open its browser with `log inspect start --account <a>`, sign in to Discord there, then stop the session with `log inspect do stop --live` so the session is saved.
3. `log discord session check --account <a>`: checks Discord still accepts the session. Sends nothing.

The full steps: [Adding an account](../accounts.md).

## Use cases

- [Reading a Discord group chat](../useCases/discord/groupChatRead.md): catch up on a group over the last few hours, sending nothing.
- [Replying with a meme](../useCases/discord/memeReply.md): answer a moment in a chat with a Memelord meme that fits it ([extensions](../extensions/README.md)).

## Full detail

- [Reference](../reference.md): every command, flag and MCP tool.
- Agent guide: [Discord](../guides/discord.md).
