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

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T100521_61594063207669**, step 6: pin: 200, 1540 ms

Sent:

```json
{
  "qpl_active_flow_ids": "521482085,521482858",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "VestaServerGraphQLRegisterProviderInitQuery",
  "server_timestamps": "true",
  "variables": {
    "request": {
      "fbid": "sp5MI2FeHD/hrI1wOQXbKg==",
      "product_use_case": "MSGR_ENC_BACKUP",
      "vesta_client_api_version": 6
    }
  },
  "doc_id": "28155079630814325",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=521482085,521482858"
  ]
}
```

Answered:

```json
{
  "data": {
    "fbid_based_auth_layer_vesta_register_init": {
      "base64url_encoded_island_rsa_pub": "MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEApTHn1MdJfgrd9PJ7hfb0zj3ZKdt7xO4VHSrjMds8tzXvap7nv5au_JFFRxuWnzgoiJye3kKEOl-xwFcNEgci-Cb7BBypJpI_ZrroHBl29s-H6wU7ScVhAyMAJQKotFPppvx5A2Ih6qeU0PlloC9PNte8vrAU0txNsuz0Edb2Bc5WlA7VgMlXsITw3XGBR6pHxuOYGOlrezz-kU-yWr_PHPPg9T_Gk5eihxMCngyYIL5qkq_RmnlKgdkHjwv_tEZ_gYvSoXcwRajSrhi71B6k4FLwpvqcsk3B4DKGrpHExIbcRojOF4WKs4LndYvx--NdUDpDVnQXrX8Fuy6anQFJaJSknsuQQNrAiHS5… (563 chars)",
      "base64url_encoded_island_rsa_pub_signature": "z4l-CjfwiLwrzFbfJWu9CGhmyVdS-eASDpCGGESrtxosYZAp_95XK_JzDKUX_VdpLemEoaKzeSOFRmFoHw1KK9_OgPx1FI3n9i1E_-egwafVRcXVRlF1B0zK5PWwJSPcZKT7_4IsvOFpRYzPoPq4ZIooVscpfRLjn5NGkwRf0BMOkQUvIvjyZ_JBaf--_XeGlnWyX8jyB8mpOP8aBMaOB9t3JZ-H-TglL5grGxsHLDtbbbbqiunyL0N493FBkTs9j_Gr7j2cvuwtmbKYUOeFqjRR50loySqRBuROAZ_ijZKnoOTwSmg5LzuQoiRT65wITdnWwKbcDXP8fTOR8VgE-_bunTGVtHNWwMS559ELJRgPodSWp1rhuGjEguFH59Icu3FGUaDZF1uLoWgS… (512 chars)",
      "base64url_encoded_opaque_pub": "-gsEX7wsLAO-VxdcXz-xbyfe5ldEFEG6u9mdaNi_jl4",
      "base64url_encoded_opaque_pub_signature": "lkX1UlOghdALT2p49DdZ_Z2QqaAjyUx2aBF5ATtDwl3s2dCXAmwRG9Fise6W_aUa-3RgsYwYRKYec0WWN4ISaHUwm63dD1erNRwAPy1Okwh54NpHs7yZWv56eQdBH4wxp4yjfa5_jOSHAQGYioBOrjxuSMsEiFueM2UBFfWfCGI9y8mGSz5C_F2MA1MF5XOQa0Fdpj6Wyx5kfGjGBcp1cpYAcNf3isW7WVZr43vUgbjY9QIQO8ScWRfBgLsJUSxWaK5HXhDDfTIxfmGvs3nGHizMGvXG4e0To8Hi-mqgN7a97CGpijjTcsDC-30puHYkn1X7VzGnvW_6BlxvJPXeiplt894wGsTJ1pD_U_UbcOKZUl1pREVaJzio3c-3sDtyileGHBLmp-ANSn1L… (512 chars)",
      "base64url_encoded_island_ed25519_pub": "Z_W3kQ8_8NBDDQ-Yh0m2yuH0uGvuaKb-6gaEDYtTbEQ",
      "base64url_encoded_island_ed25519_pub_signature": "qqmeCe-NfHhnB99im4Gmw37EiXnqGeaEnn-9exIR1WWnhbZq7PLT8NdNcfqnkWkSMjLuxJCtD0mLrYlh-pvOqxmobMmK7uwNByWyZx9KhtyemBxfeBlutljV9ra4Re86-cCYkmw-DPyajTalzJYM7c6Y-E4VRr8ON3SnfcV6zQCqdSkfmPRlonnuKZDVvMqB6PP0S2SuAyXLsgVZoDF5AGCI8Rz1k3hfcxWrdW7vr6S6LIxiDCiguzyCOIuy-rFv4TJMClUol6J3IvKr8Q01xWijbeqjP_s7IvWEetjgB0DAfL2wPEp17GZfIFtDJ0JrmNLelOydXB80ajdU78Ooej5Zu6PXL4kedWyvUlJsNQ2IniGGzFYPUtKefLyKf_8dM-yzpawpVfrb4pv4… (512 chars)",
      "is_registered": false,
      "attempts_remaining": null
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792663627996,
      "time_at_flush_ms": 1792663628100
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

The first request of Messenger's PIN registration (`VestaServerGraphQLRegisterProvider`, Facebook's "Vesta" store that keeps the encrypted chats' backup behind the PIN). It asks for the server's public keys and their signatures (`island_rsa_pub`, `opaque_pub`, `island_ed25519_pub`), whether the account is already registered (`is_registered`) and how many tries are left (`attempts_remaining`). In Bethlehem's recording it fired 2.1 s into step 6, the second `pin`, as soon as the confirmed PIN matched.

## What our machine does with it

It opens the `messengerPinCreate` flow's last step: after the confirm `pin`, registration starts here, then Begin and Finish follow. Nothing waits on it alone: the flow's confirming request is the Begin mutation that follows. `is_registered` and `attempts_remaining` are what the "Enter your PIN" screen (not recorded yet) is to read.

## What can go wrong

None seen: one call, 200 in 1540 ms. If it failed, the PIN wouldn't register and the dialog would stay; the flow's last step would miss its confirming request, and the page state is still `messengerPinCreate`.
