# Reading a Facebook group's posts

`log facebook read group` reads the posts (and, if you ask, the comments) of a Facebook group an account has joined. It runs in the account's already-open browser, scrolls the group, and reads the posts from Facebook's own responses rather than from the screen. This page explains how a read works, step by step. For how reads fit into automatic group listening, see [Listening to Facebook groups](groupListening.md), which wins where the two differ.

log already joins groups and answers their entry questions (`src/facebook/group/join`, `src/facebook/group/answer`) and keeps each group in Twenty as an `agencyGroup`. This adds reading the posts.

## Where the approach comes from

An earlier Facebook client of ours built group listening first and got the approach right, so log keeps it:

| Earlier client | What it does | In log |
|---|---|---|
| `domain_extraction/response_capture.py` | Reads the page's own responses while it scrolls; never calls Facebook's GraphQL itself. | Every step already records every response in its own HAR, so posts are read from that recording. There is no second listener. |
| `domain_extraction/post_extractor.py` | Takes posts out of the page's embedded Relay JSON, keeping only those with a `post_id`, the expected group and a `creation_time`. | The same rules, in TypeScript, on the step's HAR and the first page's HTML, tested on a recorded run. |
| `domain_records/normalization.py` | Rejects a post with no id or the wrong group; never fills in made-up values. | The same. |
| `domain_posts/listen.py`, `domain_cursors/*` | One cursor per group, so each read yields only new posts; posts are saved before the cursor moves. | The same, with the cursor on the `agencyGroup` in Twenty. |
| `scripts/listen_group.py`, `listen_continuous.py` | Scroll one group, poll several. | A flow from a recording, run as an XState machine in the account's open browser. |

What changes is how it runs: in the account's browser through the driver, in the browser kept open for the day, with every step recorded and read with rea, and every command available as a CLI command, an MCP tool and through the agent hooks.

## What Facebook sends

**One query is the whole feed:** [`GroupsCometFeedRegularStoriesPaginationQuery`](platforms/facebook/groups/GroupsCometFeedRegularStoriesPaginationQuery.md).

- It fires on load and on every scroll, with `count: 3`, `CHRONOLOGICAL`, `DISCUSSION`, the group's `id` and a `cursor`.
- Its answer is streamed in 4-10 JSON chunks. For each post it holds the `post_id`, the group's id, `creation_time`, the author (`actors`), the text (`message.text`), the permalink, the `feedback` id, and the next `end_cursor` / `has_next_page`.
- The first posts come embedded in the group page's HTML (about 2 MB), which the recording keeps whole (`MAX_DOCUMENT_BODY`).

## Reading posts from the recording

Code: `src/facebook/group/read` (`postsFromFeedResponse`, `feedResponses`, `newPosts`, `postsFromGroupPage`).

- It reads the streamed chunks: the first unit under `group_feed.edges`, each `$stream` chunk's `node`, and the deferred `page_info`.
- A post is kept only with its `post_id`, its group (`target_group.id`, this group only) and `creation_time`. Every rejection is counted.
- The page's HTML carries the same chunk shapes, with the feed under `data.group` instead of `data.node`. It starts with a "New posts" header unit, which is skipped and counted (`skipped`), not rejected.
- **"Already read" goes by post id, not time.** The cursor keeps the ids the latest reads saw (`seenIds`, at most 500). A post is new when its id isn't there, whatever its time. The read stops scrolling once the feed has shown 3 seen posts (`seenBy`, `reachedCursor`, `STOP_AFTER_SEEN`).

On a recorded run (load, a snapshot, three scrolls) this gave 13 posts, 1 from the HTML and 12 over 4 feed pages, none rejected, newest first. A second read with the cursor kept 0.

## Reading comments

Code: `src/facebook/group/read` (`commentsFromResponse`, `commentsFromPostPage`, `commentResponses`, `COMMENT_QUERIES`).

A post's comments come from its own page and three requests:

1. **The post's page** (`/groups/<id>/permalink/<post>/`), with the first comments in its HTML. Opening the post in a dialog fires `CometSinglePostDialogContentQuery`.
2. **Switching the sort to Newest** fires `CommentListComponentsRootQuery` with `commentsIntentToken: REVERSE_CHRONOLOGICAL_UNFILTERED_INTENT_V1`. The page shows "Most relevant" first, which hides some comments; Newest shows every comment except potential spam ("All comments" adds those).
3. **Scrolling the dialog** fires `CommentsListComponentsPaginationQuery` with `commentsAfterCursor`.

A comment is kept only with its `legacy_fbid`, its post (its relay id decodes to `comment:<postId>_<commentId>`), its group (`group_comment_info.group.id`, this group only) and `created_time`. A reply's parent is `comment_direct_parent`. A reply's parent stub (`parent_object_ent`, with no `legacy_fbid`) is never counted as a comment.

Example: a post Facebook said had 16 comments showed 10 in its HTML (Most relevant), 10 on Newest and 5 more on scrolling, giving 15 distinct comments, none rejected. Switching the sort is a click, so it needs `--live`. Nothing is typed, reacted to or sent.

## How a read runs

`groupReadMachine` (`src/facebook/group/read/machine.ts`) is an XState machine. Its only side effect is a step in the account's open browser.

1. **Opening:** go to the group and take the first posts from its HTML. If the group was given by name, its numeric id is found too (`groupIdFromStep`).
2. **Scrolling:** `scroll 2 700`, as recorded, until the last read's posts show (`reachedCursor`), the feed ends (`has_next_page: false`) or `--scrolls` runs out. If the scrolls run out first, the output says so (`gap`).
3. **Settled:** `newPosts` gives the new posts and the cursor after them. Comments are read only for posts whose comment count grew since they were last read (`commentTargets`), at most `--commentPosts`. Each post's count comes from `comment_rendering_instance.comments.total_count`.
4. **For each of those posts:** go to its page. With `--live`, switch "Most relevant" to "Newest". Then scroll its dialog ("<author>'s post") while Facebook says there are more, at most 4 scrolls.

A checkpoint or login page stops the read. A failed step on one post only ends that post's comments; they aren't marked read, so the next read opens the post again.

The recorded flows `groupPostComments` and `groupPostDialog` stay as they are. The read machine sends the same steps itself, so it can choose between them based on what each step's recording held.

## The command

```
log facebook read group --account <a> --group <url|id> [--scrolls <n>] [--commentPosts <n>] [--live] [--bypass] [--json]
```

- `--show` prints what Twenty holds instead of reading (`src/cli/read`).
- It refuses without the account's open browser (`groupBrowserNotOpen`) and outside its active hours.
- MCP tools: `readGroup` and `readGroupLive`. It's a long run, so watch its live log.

## What is stored in Twenty

- **On `agencyGroup`:** `readCursor` (`{ lastPostId, watermark, idsAtWatermark }`, plus `seenIds`), `lastReadAt` and `lastReadReason`. This is all a read writes now.
- **`agencyGroupPost`** and **`agencyGroupComment`** were added for posts and comments (author, text, permalink, feedback id, times, counts, reply depth). They still exist, but nothing writes to them any more: posts now go to the group-listening service instead (see [Listening to Facebook groups](groupListening.md)).

The client lives in `src/facebook/group/read/client.ts` (`readStateOf` before a read). After any field change, regenerate the Twenty client with `bun run twenty:client`.

## The earlier worker

Before reads moved into the open browser, the group-listening worker (`python/openMagpie/facebookWorker.py`, run as `log facebook poll --request`) answered straight from Twenty with no browser. Its error codes are still worth knowing:

- `groupNoAccount`: no account is in the group.
- `groupNotReadYet`: no host has read the group yet.
- `groupReadStale`: the group hasn't been read for 3 hours (is its host running?).

The current worker reads in the open browser; its input and output are described in [Listening to Facebook groups](groupListening.md).

## Tests

- `src/facebook/group/read/readMachine.test.ts`: a first read, reaching the cursor, a gap, a checkpoint, `--live` with a failed post, the comment targets, and reading twice (the second adds nothing, and a stopped read leaves the cursor alone).
- `src/cli/read/read.test.ts`: the command end to end, using recorded step folders.

## Still to do

- A full live run end to end, read with rea before anything is changed.
- Running the group-listening service against this worker where log runs.
- A host running live with its groups.

The rules behind this are in AGENTS.md.
