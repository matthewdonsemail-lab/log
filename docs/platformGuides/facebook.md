# Facebook

log runs Facebook accounts for Marketplace listings and local groups: it posts and checks listings, joins and reads groups, and keeps each account warmed up. Most of it happens in the account's own browser (AdsPower or Camoufox), opened once for the day with a proxy in the account's home country. Reading a group's posts goes through Facebook's own API directly first, with no browser.

Commands that read send nothing. Anything that acts is a dry run until you add `--live`.

## What you can do

**Marketplace listings**

- `log facebook listing create --account <a> --file <listing.json>`: makes a listing from a file. `log facebook listing lint --file <listing.json>` checks the file first.
- `log facebook publish --listing <id>`: posts one listing. A dry run fills everything in and never clicks Publish; `--live` posts it.
- `log facebook campaign fill|run --campaign <id>`: puts one ad on several accounts in one place, then posts them.
- `log facebook listings` and `log facebook listing <id>`: list and show your listings (reads only).
- `log facebook listing remove <id>`: takes a listing down (dry run until `--live`).

**Keep an eye on accounts and listings** (reads only)

- `log facebook check --account <a>`: may the account still sell, each listing's state and clicks, and its seller inbox.
- `log facebook scan --account <a>`: reads Marketplace > Selling and updates your listings.
- `log facebook conversations` and `log facebook conversation show <id>`: buyers' conversations, newest first. `conversation lead <id> <status>` marks how far each one got.

**Groups**

- `log facebook join group --account <a> --group <g>`: joins a group. It reads the join questions first; `--live` presses Join.
- `log facebook read group --account <a> --group <g>`: a group's new posts and their comments (reads only).
- `log facebook read members --account <a> --group <g> --count <n>`: a group's newest members, saved to a file (reads only).
- `log facebook poll <group> <account> [30m]`: reads a group again every few minutes for a while (reads only).

**The account's day**

- `log facebook host start --account <a>`: opens the account's one browser for its day and runs it: sign-in, profile, location, warm-up, then watching.
- `log facebook warmup reel|feed|stages --account <a>`: browses Reels, the feed or Marketplace like a person would. Likes need `--likes`.
- `log facebook profile setup --account <a>`: sets the profile picture and cover photo (dry run until `--live`).

## Signing in

1. `log proxy assign --account <a>`, then `log proxy check --account <a>`: give the account a proxy in its home city and check it.
2. `log facebook preflight --account <a>`: says what would stop the account before any browser opens.
3. `log facebook connect --account <a>`: signs the account in through its proxy and saves its session.

There is no separate session check: `log facebook check --account <a>` shows whether the account is signed in and may still sell. The full steps: [Adding an account](../accounts.md).

## Use cases

- [From accounts to live Marketplace listings](../useCases/facebook/marketplaceListings.md)
- [Listening to local Facebook groups](../useCases/facebook/groups.md)

## Full detail

- [Reference](../reference.md): every command, flag and MCP tool.
- Agent guides: [Marketplace](../guides/facebookMarketplace.md), [groups](../guides/facebookGroups.md), [the account's browser](../guides/facebookBrowser.md), [flows and warm-up](../guides/facebookFlows.md), [accounts and proxies](../guides/accountsAndProxies.md).
