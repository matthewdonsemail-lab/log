# VestaServerGraphQLRegisterProviderBeginRegisterMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `28946945608223566` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `fbid_based_auth_layer_vesta_begin_register.base64url_encoded_opaque_r2`, `fbid_based_auth_layer_vesta_begin_register.base64url_encoded_opaque_challenge`, `fbid_based_auth_layer_vesta_begin_register.base64url_encoded_opaque_r2_sig` |
| Called from | `VestaServerGraphQLRegisterProvider` |
| rea | `ev_2924f9b4596476d72ddd0d7eac49dd047b84ab0e69b53c1d37f2db0fb25414e6` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | pin: typed the account's Messenger PIN | 3 | 200 | 735 ms | 3953 ms | — |

<!-- facts:end -->

## What it does

The PIN registration's first exchange: it sends the client's blinded PIN material (`input`) and reads back the server's opaque reply and challenge, each signed (`opaque_r2`, `opaque_challenge`, `opaque_r2_sig`). The PIN itself never travels, only what is derived from it. It fired 4 s after the confirm `pin` began, 735 ms.

## What our machine does with it

It is the confirming request of the `messengerPinCreate` flow's last step (`flowFromRecording` picked it from the recording): once it answers 200 the PIN is being registered. log-cli sends nothing of its own here: the page derives it from the PIN `log inspect do pin` typed from Twenty (rule 67).

## What can go wrong

None seen: one call, 200 in 735 ms. An error (a wrong state, or too many attempts) would leave the PIN dialog up; the flow would fail its last step, and the run is read from its recording (rule 25) before anything is retried.
