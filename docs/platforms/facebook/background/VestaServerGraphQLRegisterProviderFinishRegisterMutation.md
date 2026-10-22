# VestaServerGraphQLRegisterProviderFinishRegisterMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `39510870261845795` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `fbid_based_auth_layer_vesta_finish_register.register_success`, `fbid_based_auth_layer_vesta_finish_register.viewer` |
| Called from | `VestaServerGraphQLRegisterProvider` |
| rea | `ev_0ab5183bd10aac3cce52a56ca59b5b4aaad0be331c0f278051ebc1a761677bbf` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | pin: typed the account's Messenger PIN | 3 | 200 | 809 ms | 6147 ms | — |

<!-- facts:end -->

## What it does

Completes the PIN registration: it sends the client's answer to Begin's challenge (`input`) and reads `register_success` and the `viewer`. It fired about 6 s after the confirm `pin` began, 809 ms, and the "Creating your PIN…" announcement cleared after it.

## What our machine does with it

`register_success` is the proof the PIN is set. The flow today confirms on Begin; Finish answering 200 and the inbox showing (Chats, All, Unread, Groups, no PIN dialog) are what the recording shows after it. Bethlehem passed both on 2026-10-22.

## What can go wrong

None seen: one call, 200 in 809 ms. If `register_success` were false, Messenger would ask again; the page state would still be `messengerPinCreate`, and the PIN in Twenty would be checked before another try.
