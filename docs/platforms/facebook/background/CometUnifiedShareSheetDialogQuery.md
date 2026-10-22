# CometUnifiedShareSheetDialogQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `29088025014115370` |
| Path | `/api/graphql/` |
| Sends | `feedLocation`, `hasParentStory`, `isComposerDisabled`, `isLinkSharingEnabled`, `isShareToFeedDisabled`, `privacySelectorRenderLocation`, `privacyWriteID`, `qe_optional_share_to_page`, `scale`, `shareableParams`, `storyParams` |
| Reads | `link_preview.story`, `...UnifiedShareSheetSharingOptionsSection_share` |
| Called from | `CometUnifiedShareSheetDialog.react` |
| rea | `ev_7035e27a70b6da58b992c6e61088868e0fe0ad453f923f702505c93025db22f8` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 20: clickRole button "…" | 1 | 200 | 1864 ms | 1291 ms | — |

<!-- facts:end -->

## What it does

Loads Facebook's share dialog for a story: its link preview (`link_preview.story`) and the sharing options (`UnifiedShareSheetSharingOptionsSection_share`), with the privacy and composer settings it sends. In our runs it fired during `log inspect` snapshot steps on 2026-10-19, 12-91 s after the step started, never right after a click of ours.

## What our machine does with it

Nothing. None of our machines opens a share dialog: `reelOrderer.ts` says this repo has no save, follow or share, and no code refers to this request. No state waits for it or reads it.

## What can go wrong

None seen: three calls, all 200 in 547-951 ms. If it failed, only the share dialog would be empty; a snapshot step records the page either way.
