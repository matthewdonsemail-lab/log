# Using log well

## How we use it

We run log from Claude Code, through the MCP tools. We tell the agent what we want in plain words, and it follows the matching [use case](useCases/README.md) page step by step. You can type the same commands yourself in a terminal.

## Start from a use case

Pick the [use case](useCases/README.md) closest to what you want and tell your agent:

> go on docs/useCases/twitter/dmInbox.md

Each page says which tool runs each step and what shows it worked, so your agent doesn't improvise.

## Nothing acts until you say so

Anything that posts, sends, likes or follows is a dry run by default. It shows what it would do and sends nothing.

```bash
log discord send --account yourname --channel "Weekend plans" --text "hello"          # dry run
log discord send --account yourname --channel "Weekend plans" --text "hello" --live --approvedBy you
```

Over MCP, the acting version is its own tool ending in `Live` (for example `discordSendLive`), and it needs `confirmLive: true`. Reading is always safe.

## Each account paces itself

Every account keeps its own:

- **daily limits** on how much it writes
- **pacing** between actions, so nothing goes out back to back
- **waking hours** in its home timezone, outside which it won't run

If an account is refused, the message names an error code. `log errors` says what it means and what to do.

## Scripts

Add `--json` to get machine-readable output. A command with `--json` never prompts.

```bash
log localAccount list --json
```

Every command and flag is in the [reference](reference.md).
