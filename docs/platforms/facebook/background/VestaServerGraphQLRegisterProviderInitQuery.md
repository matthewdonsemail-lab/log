# VestaServerGraphQLRegisterProviderInitQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28155079630814325` |
| Path | `/api/graphql/` |
| Sends | `request` |
| Reads | `fbid_based_auth_layer_vesta_register_init.base64url_encoded_island_rsa_pub`, `fbid_based_auth_layer_vesta_register_init.base64url_encoded_island_rsa_pub_signature`, `fbid_based_auth_layer_vesta_register_init.base64url_encoded_opaque_pub`, `fbid_based_auth_layer_vesta_register_init.base64url_encoded_opaque_pub_signature`, `fbid_based_auth_layer_vesta_register_init.base64url_encoded_island_ed25519_pub`, `fbid_based_auth_layer_vesta_register_init.base64url_encoded_island_ed25519_pub_signature`, `fbid_based_auth_layer_vesta_register_init.is_registered`, `fbid_based_auth_layer_vesta_register_init.attempts_remaining` |
| Called from | `VestaServerGraphQLRegisterProvider` |
| rea | `ev_f8d7dbbc5caa47e5c59be1766812ea2ff24bdda79e0e3f8b75a43428469f543a` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 6: pin | 3 | 200 | 1540 ms | 2139 ms | — |

<!-- facts:end -->

## What it does

The first request of Messenger's PIN registration (`VestaServerGraphQLRegisterProvider`, Facebook's "Vesta" store that keeps the encrypted chats' backup behind the PIN). It asks for the server's public keys and their signatures (`island_rsa_pub`, `opaque_pub`, `island_ed25519_pub`), whether the account is already registered (`is_registered`) and how many tries are left (`attempts_remaining`). In Bethlehem's recording it fired 2.1 s into step 6, the second `pin`, as soon as the confirmed PIN matched.

## What our machine does with it

It opens the `messengerPinCreate` flow's last step: after the confirm `pin`, registration starts here, then Begin and Finish follow. Nothing waits on it alone: the flow's confirming request is the Begin mutation that follows. `is_registered` and `attempts_remaining` are what the "Enter your PIN" screen (not recorded yet) is to read.

## What can go wrong

None seen: one call, 200 in 1540 ms. If it failed, the PIN wouldn't register and the dialog would stay; the flow's last step would miss its confirming request, and the page state is still `messengerPinCreate`.
