# Reddit

log keeps a Reddit account's session and checks that Reddit still accepts it. It talks to Reddit directly through its own API client with the saved session. When you need the website itself, log opens the account's own browser, with no proxy.

Reddit is the newest platform in log, so there is only a little here so far.

## What you can do

**Check the account** (reads only)

- `log reddit session check --account <a>`: checks Reddit still accepts the saved session. Sends nothing.

**Work in the account's own browser**

- `log inspect start --account <a>`: opens the account's browser on Reddit and keeps it open.
- `log inspect do <step>`: one step at a time (go to a page, take a snapshot, go back). Clicking and typing only happen with `--live`.
- `log flow run <name> --account <a>`: runs a recorded set of steps again. A dry run until `--live`.

## Signing in

1. Add the account: `log localAccount add --platform reddit --account <a> --adsPower <profileId>`.
2. Open its browser with `log inspect start --account <a>`, sign in to Reddit there, then stop the session with `log inspect do stop --live` so the session is saved.
3. `log reddit session check --account <a>`: checks Reddit accepts it.

The full steps: [Adding an account](../accounts.md).

## Use cases

None yet. See [all use cases](../useCases/README.md).

## Full detail

- [Reference](../reference.md): every command, flag and MCP tool.
- Agent guide: [Reddit](../guides/reddit.md).
