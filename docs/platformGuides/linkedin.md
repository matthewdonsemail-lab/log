# LinkedIn

log saves a LinkedIn account's session, checks that LinkedIn still accepts it, and posts and deletes the account's own posts. It talks to LinkedIn directly through its own API client with the saved session. When you need the website itself, log opens the account's own browser, with no proxy.

LinkedIn is new in log: signing in, checking the session, posting (text, an image, mentions), deleting a post and inviting people LinkedIn suggests are what it does so far. Comments aren't built.

## What you can do

**Add or refresh an account**

- `log linkedin cookies save --account <publicId>`: saves the account's session. `<publicId>` is the part after `linkedin.com/in/` in the profile's address.

**Check the account** (reads only)

- `log linkedin session check --account <a>`: checks LinkedIn still accepts the saved session. Sends nothing.

**Post and delete** (a dry run unless `--live --approvedBy <who>`; 10 writes a day per account)

- `log linkedin post --account <a> --text "<post>" [--image <path>]`: posts as the account, the way LinkedIn's own composer does. `@[Name]` in the text mentions a person or page found by LinkedIn's own mention search; when the name matches more than one, write `@[Name|entityID]` with the id the refusal lists. The dry run shows the post and its mentions without posting. The image must be in `~/.logCli` or your outbox.
- `log linkedin delete --account <a> --activity <id|url>`: deletes one of the account's own posts.

**Grow the network**

- `log linkedin suggestions --account <a>`: lists the people LinkedIn suggests on My Network. Reads only.
- `log linkedin connect --account <a> --profile <publicId|url>`: sends one invitation, without a note, to someone from that list, the way their own Connect button does. A dry run unless `--live --approvedBy <who>`. One a run, at least 15 minutes apart, at most 5 a day: LinkedIn refused every connect sent seconds after another and then ended the session. Connecting from a profile page isn't built yet.
- `log linkedin like --account <a> --post <activityId|url>`: likes one post, the request the feed's Like button sends. A dry run unless `--live --approvedBy <who>`. It counts only when LinkedIn's answer commits the reaction.
- `log linkedin inbox --account <a>`: lists the 20 newest conversations, with who is in each, the unread count and the last message. Reads only, and marks nothing seen.
- `log linkedin messages --account <a> --with <name|profileId>` (or `--conversation <urn>`): reads one conversation in full. Reads only.

**Work in the account's own browser**

- `log inspect start --account <a>`: opens the account's browser on LinkedIn and keeps it open.
- `log inspect do <step>`: one step at a time. Clicking and typing only happen with `--live`.

## Signing in

1. Sign in to linkedin.com in Chrome, open DevTools, Network, reload, right-click any `www.linkedin.com` request and pick Copy, Copy as cURL. Leave the device toolbar off: a phone copy is refused.
2. `log linkedin cookies save --account <publicId>` in a terminal: answer yes and log reads the copy from your clipboard (`--har <file>` takes a recording instead). The session and the browser's headers are checked with LinkedIn before they are saved, and never printed.
3. `log linkedin session check --account <publicId>`: checks LinkedIn accepts them.

The full steps: [Adding an account](../accounts.md).

## Use cases

None yet. See [all use cases](../useCases/README.md).

## Full detail

- [Reference](../reference.md): every command, flag and MCP tool.
- Agent guide: [LinkedIn](../guides/linkedin.md).
