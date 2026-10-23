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

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T100521_61594063207669**, pin: typed the account's Messenger PIN: 200, 809 ms

Sent:

```json
{
  "qpl_active_flow_ids": "521482085,521482858",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "VestaServerGraphQLRegisterProviderFinishRegisterMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "actor_id": "61594063207669",
      "client_mutation_id": "4",
      "base64url_encoded_enc_reg_payload": "gGkcxqXv5kAnGleduETjXTDXFyyBh1s53ozcV-4jukjCBcPGWp-wieVepLTDRYXTcQmBH4--oB6lB3ziZ3oPytwoQj5No8yd4Tio3j9gcuFTI3B3LW3EfHx5Q4kQFWELtXc8G_fbEDUITVM3TIGPGQ21_fiRs5_rYbrkOoYHsdQDpkkMFNRwqjKLXthCMjRci0W9TQB6PZ-xW410MpyD9NxcbQIzr1AkoGx8lkylRYKf2JhCYaF4-kxURVAc7mCAvfcN3NwrSebdJuXb4wZdT4GUqkH5Jdkmwl4d29KrZMUzABf3b3IUYuaoX3zb4zCB5RqidNa-3jy7IUN4C_l9eTkmAQrRBBXzTr7MxZNh_WR7XmAxvlMpFODYUAosTtYi6xoFnNCY54d2qFF-… (512 chars)",
      "fbid": "sp5MI2FeHD/hrI1wOQXbKg==",
      "product_use_case": "MSGR_ENC_BACKUP",
      "vesta_client_api_version": 6,
      "vesta_client_protocol_version": 1,
      "is_post_login_register": false
    }
  },
  "doc_id": "39510870261845795",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=521482085,521482858"
  ]
}
```

Answered:

```json
{
  "data": {
    "fbid_based_auth_layer_vesta_finish_register": {
      "register_success": true,
      "viewer": {
        "messenger_default_encrypted_backup": null
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792663633155,
      "time_at_flush_ms": 1792663633624
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Completes the PIN registration: it sends the client's answer to Begin's challenge (`input`) and reads `register_success` and the `viewer`. It fired about 6 s after the confirm `pin` began, 809 ms, and the "Creating your PIN…" announcement cleared after it.

## What our machine does with it

`register_success` is the proof the PIN is set. The flow today confirms on Begin; Finish answering 200 and the inbox showing (Chats, All, Unread, Groups, no PIN dialog) are what the recording shows after it. Bethlehem passed both on 2026-10-22.

## What can go wrong

None seen: one call, 200 in 809 ms. If `register_success` were false, Messenger would ask again; the page state would still be `messengerPinCreate`, and the PIN in Twenty would be checked before another try.
