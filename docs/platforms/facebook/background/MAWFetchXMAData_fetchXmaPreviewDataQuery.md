# MAWFetchXMAData_fetchXmaPreviewDataQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `9840669832713841` |
| Path | `/api/graphql/` |
| Sends | `url` |
| Reads | `xma_preview_data.is_receiver_fetch_supported`, `xma_preview_data.is_public`, `xma_preview_data.post_id`, `xma_preview_data.default_cta_title`, `xma_preview_data.header_title`, `xma_preview_data.subtitle_text`, `xma_preview_data.title_text`, `xma_preview_data.xma_content_type`, `xma_preview_data.favicon_url`, `xma_preview_data.header_image_url`, `xma_preview_data.preview_url`, `xma_preview_data.cta_data` |
| Called from | `MAWFetchXMAData` |
| rea | `ev_f0f6e18f0889c021b847ab8a110a0bbfdc63030825a55262beaf653c9b821d86` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 20: clickRole button "…" | 2 | 200 | 610–797 ms | 3282–4188 ms | — |

<!-- facts:end -->

## What it does

Messenger's link preview (`MAWFetchXMAData`): given a `url`, it returns the card Messenger would show for it (title, subtitle, image, whether it's public). It fires twice when the share sheet opens, to prepare the Messenger section's preview of the group's link. In run 20261020T153648 step 20 it fired 3.3 s and 4.2 s after the click, 610-797 ms, 200.

## What our machine does with it

No machine sends it on purpose and none reads it. It fires by itself when the share sheet opens: in the flow [`groupHeaderMenus`](../flows/groupHeaderMenus.md) the Share group step opens the sheet and Escape closes it, nothing is shared.

## What can go wrong

Only a 200 has been seen, in one run. If it failed, the Messenger section would show the link without its card; nothing is sent.
