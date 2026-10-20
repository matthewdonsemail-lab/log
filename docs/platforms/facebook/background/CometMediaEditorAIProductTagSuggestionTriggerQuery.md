# CometMediaEditorAIProductTagSuggestionTriggerQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `9721737794576988` |
| Path | `/api/graphql/` |
| Sends | `actorID` |
| Reads | `page.has_taggable_products`, `page.has_shared_catalog_segments`, `additional_profile_shop_info` |
| Called from | `CometMediaEditorAIProductTagSuggestionTrigger.react` |
| rea | `ev_e36bcd72b1107647131ff1b657ae5809ddc2fa322938d2bbc121b346234b91b4` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | upload: garbageRoom.jpg handed to the file chooser | 1 | 200 | 1573 ms | 52 ms | — |

<!-- facts:end -->

## What it does

Asks whether the account has products to tag in a photo (`page.has_taggable_products`, `additional_profile_shop_info`), sent as soon as a photo is handed to the composer: it fired 52 ms after the upload step began on run 20261020T162343 (1573 ms).

## What our machine does with it

Not used by our machines; the photo post goes on without it. Recorded because every photo post sends it.

## What can go wrong

None seen.
