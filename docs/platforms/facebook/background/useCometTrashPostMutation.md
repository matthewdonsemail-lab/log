# useCometTrashPostMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `26146132388368957` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `move_to_trash_story.trashed_story_id`, `move_to_trash_story.success` |
| Called from | `useCometTrashPostMutation` |
| rea | `ev_b1bf15ec42a06bc60c28bac670233657b1ae315021240ab2896823b836a9577d` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 17: clickRole button "…" | 1 | 200 | 848 ms | 1064 ms | — |

<!-- facts:end -->

## What it does

Moves a post to the account's bin (`move_to_trash_story.trashed_story_id`, `success`); Facebook deletes what is in the bin after 30 days. It fired on run 20261020T162343 when "Move" confirmed "Move to your bin?" for the photo post (848 ms), after the post's menu (`CometFeedStoryMenuQuery`) and "Move to bin".

## What our machine does with it

The `deletePost` flow waits for it after "Move" (`expect`). The flow names the post's menu by the account's own name (`Actions for this post by {profileName}`, filled from Twenty), and acts on the newest post on the account's own profile. A write on Facebook: `--live` only (rule 8).

## What can go wrong

None seen. If it failed the post would stay on the profile and the step would fail on its `expect`; `success: false` would mean the same.
