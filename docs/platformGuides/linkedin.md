# LinkedIn

log saves a LinkedIn account's session and checks that LinkedIn still accepts it. It talks to LinkedIn directly through its own API client with the saved session. When you need the website itself, log opens the account's own browser, with no proxy.

LinkedIn is new in log: signing in and checking the session are what it does so far.

## What you can do

**Add or refresh an account**

- `log linkedin cookies save --account <publicId>`: saves the account's session. `<publicId>` is the part after `linkedin.com/in/` in the profile's address.

**Check the account** (reads only)

- `log linkedin session check --account <a>`: checks LinkedIn still accepts the saved session. Sends nothing.

**Work in the account's own browser**

- `log inspect start --account <a>`: opens the account's browser on LinkedIn and keeps it open.
- `log inspect do <step>`: one step at a time. Clicking and typing only happen with `--live`.

## Signing in

1. Sign in to linkedin.com in any browser and copy the `li_at` and `JSESSIONID` cookies.
2. `log linkedin cookies save --account <publicId>`: paste them into the hidden prompt. They are checked with LinkedIn before they are saved, and never printed.
3. `log linkedin session check --account <publicId>`: checks LinkedIn accepts them.

The full steps: [Adding an account](../accounts.md).

## Use cases

None yet. See [all use cases](../useCases/README.md).

## Full detail

- [Reference](../reference.md): every command, flag and MCP tool.
- Agent guide: [LinkedIn](../guides/linkedin.md).
