# CometUnifiedShareSheetDialogQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

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

Seen 3 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | page has 62 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T234 | 1 | 200 | 951 ms | 91187 ms | — |
| inspect | page has 63 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T232 | 2 | 200 | 547–667 ms | 12219–46674 ms | — |

<!-- facts:end -->

## What it does

<!-- toWrite --> What this request is for on Facebook's side, from its definition and the step it fires in.

## What our machine does with it

<!-- toWrite --> Which state of `marketplace/connect` or `marketplace/publish` waits for it, reads it, or ignores it, and why.

## What can go wrong

<!-- toWrite --> The errors and statuses it can return, what each means for the run, and the end or retry our machine takes.
