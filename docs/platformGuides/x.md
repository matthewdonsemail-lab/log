# X

log reads your X inbox, your followers and your conversations, and sends replies, posts, likes and DMs for you. It talks to X directly through its own API client with your account's saved session. No browser opens and no proxy is used.

Commands that read send nothing. Commands that act are a dry run until you add `--live`, and a live send also needs `--approvedBy <who>`.

## What you can do

**Read your inbox** (reads only)

- `log twitter dms --account <a>`: your direct messages, the old inbox and the encrypted X Chat inbox together.
- `log twitter dms --account <a> --waiting`: who is waiting on a reply, and who opened your message without answering.
- `log twitter dms --account <a> --with <handle>`: one person's whole conversation.
- `log twitter chat watch --account <a>`: new messages as they arrive.

**Reply and post** (acts, dry run until `--live`)

- `log twitter reply --account <a> --tweet <postUrl> --text "…"`: reply to one post.
- `log twitter quote --account <a> --tweet <postUrl> --text "…"`: quote one post.
- `log twitter post --account <a> --text "…" [--media <file>]`: a new post, with a video, a gif or up to 4 images.
- `log twitter like` and `log twitter repost --account <a> --tweet <postUrl>`: like or repost one post.

**DM and follow** (acts, dry run until `--live`)

- `log twitter follow --account <a> --userId <id>`: follow one person.
- `log twitter dm --account <a> --userId <id> --text "…"`: send one DM. A draft on several lines goes out one message per line.

**Send to many people, slowly** (acts, dry run until `--live`)

- `log twitter queue build`, then `show`, `check`, `approve`, `plan` and `run`: a list of replies, quotes or DMs, approved first, then sent one at a time at random moments inside a time window.
- `log twitter queue check` on a DM queue drops anyone you have already talked to.

**Followers** (reads only)

- `log twitter followers --account <a>`: your own followers, newest first.
- `log twitter follows --account <a> --handles <a,b>`: whether each handle follows you, and whether you follow them.

**Write in your own voice and find old conversations** (reads only)

- `log voice --to <handle> --text "…"`: checks a draft sounds like you before it is sent.
- `log search "<query>"`: searches every saved conversation by words and by meaning.

## Signing in

1. `log twitter cookies save --account <handle>`: paste the session cookies from a browser signed in to x.com. They are asked for in a hidden prompt and checked with X before they are saved.
2. `log twitter chat pin --account <a>`: save your X Chat PIN so encrypted DMs can be read.
3. `log twitter session check --account <a>`: checks X still accepts the session. Sends nothing.

The full steps: [Adding an account](../accounts.md).

## Use cases

- [All X use cases, and the parts they share](../useCases/twitter/README.md)
- [Reading the DM inbox](../useCases/twitter/dmInbox.md)
- [Checking who really follows you](../useCases/twitter/followers.md)
- [Following up in your own voice](../useCases/twitter/followUps.md)
- [Answering the people who engaged with your posts](../useCases/twitter/engagementReplies.md)
- [DMing the people who liked or reposted your post](../useCases/twitter/engagerDms.md)
- [Replying to everyone posting about one topic](../useCases/twitter/topicReplies.md)
- [Recruiting with a reply queue](../useCases/twitter/recruiting.md)
- [Finding who needs something from you](../useCases/twitter/whoNeedsYou.md)
- [Network maxing](../useCases/twitter/networkMaxing.md)
- [Affiliate marketing through your DMs](../useCases/twitter/affiliateMarketing.md)

## Full detail

- [Reference](../reference.md): every command, flag and MCP tool.
- Agent guides: [the account](../guides/xAccount.md), [the inbox](../guides/xInbox.md), [sending](../guides/xSending.md).
