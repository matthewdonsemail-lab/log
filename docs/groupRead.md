# Reading a Facebook group's posts (issue #27)

Status: **steps 1-3 done** (3: the feed query and the first posts in the page's HTML) (recorded and documented, 2026-10-20). This file is the plan, kept up to date as each step is built. Issue: [#27](https://github.com/matthewdonsemail-lab/log-cli/issues/27), part of the epic [#22](https://github.com/matthewdonsemail-lab/log-cli/issues/22).

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

1. **Record a group read.** Done: `log inspect` (through the `log` MCP) on Bethlehem in "Recommendations of Bethlehem, PA and Greater Lehigh Valley Region" (4191018610937243), run `20261020T134155`: open the group, snapshot, three scrolls, every step's HAR read by rea. Read-only, no `--live`.
2. **Document what Facebook sends.** Done (`log capture --docs`): [`GroupsCometFeedRegularStoriesPaginationQuery`](platforms/facebook/groups/GroupsCometFeedRegularStoriesPaginationQuery.md), `doc_id 28956948070566246`. One query is the whole feed: on load and on scroll, `count: 3`, `CHRONOLOGICAL`, `DISCUSSION`, the group's `id` and a `cursor` whose position moves 2, 5, 8. Its answer is streamed (4-10 JSON chunks) and holds, per post: `post_id`, the group's id, `creation_time`, the author (`actors`), the text (`message.text`), the permalink, the `feedback` id, and the next `end_cursor` / `has_next_page`. The first 2 posts come embedded in the group page's HTML (2.3 MB), which the HAR now keeps whole (`MAX_DOCUMENT_BODY`).
3. **Read the posts from the recording.** Done for the feed query: `src/group/read` (`postsFromFeedResponse`, `feedResponses`, `newPosts`). It reads the streamed chunks (the first unit under `group_feed.edges`, each `$stream` chunk's `node`, the deferred `page_info`), keeps a post only with its `post_id`, its group (`target_group.id`, this group only) and `creation_time`, and counts every rejection; the cursor keeps only posts newer than the last read. On run `20261020T134155`: 9 posts over 3 pages, none rejected, each with its author, permalink and feedback id (text on 6: the rest are photo or shared posts). The page's own first posts are read from its HTML (`postsFromGroupPage`), recorded whole since `MAX_DOCUMENT_BODY`: its JSON script blocks carry the same chunk shapes, the feed under `data.group` instead of `data.node`, and the page starts with a "New posts" `GroupsSectionHeaderUnit`, which is skipped and counted (`skipped`), not rejected. Posts can share a second, so the cursor keeps every id at its watermark (`idsAtWatermark`). On run `20261020T143506` (load, a snapshot, three scrolls): 13 posts, 1 from the HTML and 12 over 4 feed pages, none rejected, newest first throughout; a second read with the cursor keeps 0.
3b. **Read the comments.** Done: `src/group/read` (`commentsFromResponse`, `commentsFromPostPage`, `commentResponses`, `COMMENT_QUERIES`), recorded live on run `20261020T151100` (matt: "I need to see the comments as well"). A post's comments come from three requests and the post's own page: opening the post (`CometSinglePostDialogContentQuery`), its page by link (`/groups/<id>/permalink/<post>/`, the first comments in its HTML), the sort switched to Newest (`CommentListComponentsRootQuery`, `commentsIntentToken: REVERSE_CHRONOLOGICAL_UNFILTERED_INTENT_V1`) and the dialog scrolled (`CommentsListComponentsPaginationQuery`, with `commentsAfterCursor`). The page shows "Most relevant" first, which hides some: Newest shows every comment but potential spam ("All comments" adds that). A comment is kept only with its `legacy_fbid`, its post (its relay id decodes to `comment:<postId>_<commentId>`), its group (`group_comment_info.group.id`, this group only) and `created_time`; a reply's parent is `comment_direct_parent`, and a reply's parent stub (`parent_object_ent`, no `legacy_fbid`) is never a comment. On the run: the post "Looking for someone to shovel snow…" has 16 comments by Facebook's count; 10 in its HTML (Most relevant), 10 on Newest and 5 more on scrolling, 15 distinct, none rejected, each with its author (one anonymous), link and time. Clicking the sort is a click (`--live`, matt asked); nothing was typed, reacted to or sent.
4. **Twenty.** Fields added only (rule 13): on `agencyGroup`, the read cursor (last post id, the watermark, when last read). The posts themselves go to Twenty too: which object is matt's call (below).
5. **The flow and its machine.** The recorded steps become a flow (`log flow fromInspect`, rule 31) and the read an XState machine (rule 6): open the group, scroll until the cursor or the page limit, read the posts out of each step, save them, then move the cursor.
6. **The command.** A read in the account's open browser, `platform: "facebook"` (rule 60), an MCP tool, hooked, in the generated README. It clicks nothing on Facebook, so it needs no `--live`.
7. **Tests and gates.** The extractor on the recorded fixture, the machine with scripted steps, the cursor only ever moving forward; every lefthook gate.

## For matt to decide

- **Where the posts live in Twenty:** a Facebook group post object, or one posts object across platforms (with #25, #26: log's `posts` covered every platform).
- **The command's name:** `log read group --account <a> --group <url|id>` would sit beside `log join group`; how a second platform is named is #20.
- **How much a read covers:** comments too (matt, 2026-10-20). Which posts' comments are read on each pass (every new post, or posts whose comment count grew) is the machine's to settle from the recording.

## Depends on

- [#21](https://github.com/matthewdonsemail-lab/log-cli/pull/21): `Command.platform`, which every new command declares. This branch is built on it.
