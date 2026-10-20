# Reading a Facebook group's posts (issue #27)

Status: **planned**. This file is the plan, kept up to date as each step is built. Issue: [#27](https://github.com/matthewdonsemail-lab/log-cli/issues/27), part of the epic [#22](https://github.com/matthewdonsemail-lab/log-cli/issues/22).

log-cli already joins a group and answers its questions (`src/group/join`, `src/group/answer`, rule 45), and keeps each group in Twenty as an `agencyGroup`. This adds reading the posts of a group an account is in.

## What it ports, and how

facebook-camofox-client built group listening first (pinned links in #27). It got the approach right, and we keep it:

| facebook-camofox-client | What it does | In log-cli |
|---|---|---|
| `domain_extraction/response_capture.py` | Reads the page's own responses while it scrolls, never calls Facebook's GraphQL itself | Every step already records every response in its own HAR (rule 22); the posts are read from that recording, so there is no second listener |
| `domain_extraction/post_extractor.py` | Posts out of the page's embedded Relay JSON, kept only with a `post_id`, the expected group and a `creation_time` | The same rules, in TypeScript, on the step's HAR and the first page's HTML, tested on a recorded run |
| `domain_records/normalization.py` | A post with no id or the wrong group is rejected, never filled in with made-up values | The same |
| `domain_posts/listen.py`, `domain_cursors/*` | A cursor per group (last post id and a time watermark): each read yields only new posts; posts are saved before the cursor moves | The same, the cursor on the `agencyGroup` in Twenty |
| `scripts/listen_group.py`, `listen_continuous.py` | Scroll a group, poll several | A flow from a recording, run as an XState machine in the account's open browser |

What changes is how it runs: on the account's browser through the driver, AdsPower first (rule 59), in the browser kept open for the day (rule 35), every step recorded and read with rea (rules 22, 25, 29), and every command a CLI command, an MCP tool and hooked (rules 55, 56).

## Steps

1. **Record a group read.** `log inspect start --account <a member> --detach`, then `goto` the group, `snapshot`, and several `scroll` steps with a `snapshot` after each. It only reads; nothing needs `--live`. Each step keeps its HAR and rea's reading of it.
2. **Document what Facebook sends** (`log capture --docs`, rules 27, 48): the first page of the discussion feed (`CometGroupDiscussionRootSuccessQuery`, already seen loading about 1.9 s after the group opens, by `groupID`), the query that loads more posts on scroll (not recorded yet), and the fields each post comes in. rea reads the request and its response: where the post id, the group, the time, the author and the text are.
3. **Read the posts from the recording.** `src/group/read`, with the role files (rule 2): the extractor (the facebook-camofox-client rules above), tested on that recording kept as a fixture. A post that fails a rule is counted and dropped, never patched.
4. **Twenty.** Fields added only (rule 13): on `agencyGroup`, the read cursor (last post id, the watermark, when last read). The posts themselves go to Twenty too: which object is matt's call (below).
5. **The flow and its machine.** The recorded steps become a flow (`log flow fromInspect`, rule 31) and the read an XState machine (rule 6): open the group, scroll until the cursor or the page limit, read the posts out of each step, save them, then move the cursor.
6. **The command.** A read in the account's open browser, `platform: "facebook"` (rule 60), an MCP tool, hooked, in the generated README. It clicks nothing on Facebook, so it needs no `--live`.
7. **Tests and gates.** The extractor on the recorded fixture, the machine with scripted steps, the cursor only ever moving forward; every lefthook gate.

## For matt to decide

- **Where the posts live in Twenty:** a Facebook group post object, or one posts object across platforms (with #25, #26: log's `posts` covered every platform).
- **The command's name:** `log read group --account <a> --group <url|id>` would sit beside `log join group`; how a second platform is named is #20.
- **How much a read covers:** its newest posts only, or also each post's comments.

## Depends on

- [#21](https://github.com/matthewdonsemail-lab/log-cli/pull/21): `Command.platform`, which every new command declares. This branch is built on it.
