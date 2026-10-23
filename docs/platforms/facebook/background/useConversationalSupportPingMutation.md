# useConversationalSupportPingMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `26960647576878710` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `xfb_comet_ai_hts_chat_ping.accepted` |
| Called from | `useConversationalSupportPing.react` |
| rea | `ev_fdf83fcc433c266ea5bcb764c902c5ab5428c2c2a03809ea8bee57b316983332` |

Seen 4 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: clickRole button "…" | 1 | 200 | 877 ms | 10855 ms | — |
| inspect | step 6: clickRole button "…" | 1 | 200 | 765 ms | 1231 ms | — |
| inspect | clickRole failed: RuntimeError: the element kept moving under the cursor: the point is on  | 2 | 200 | 625–875 ms | 1057–6059 ms | — |

<!-- facts:end -->

## What it does

A keep-alive the open support chat sends every few seconds (`xfb_comet_ai_hts_chat_ping.accepted`); it fired three times on run 20261020T161400 while the chat was open.

## What our machine does with it

Not used by our machines.

## What can go wrong

None seen.
