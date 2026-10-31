# usePasskeyAuthOptionsQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28164582826546778` |
| Path | `/api/graphql/` |
| Sends | `encryptedContext` |
| Reads | `two_step_verification_passkey_creation_device_name` |
| Called from | `usePasskeyAuthOptions` |
| rea | `ev_36dd7d82149fc4f79b98eda1ddff928058595e66ba6327a9848431797fb93f6c` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | signIn: password typed; submitting with Enter | 1 | 200 | 394 ms | 8280 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261024T222706_61593981307720**, signIn: password typed; submitting with Enter: 200, 394 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "usePasskeyAuthOptionsQuery",
  "server_timestamps": "true",
  "variables": {
    "encryptedContext": "AWTUEHDUcB9PBQd5kdy9OgqSr7d1xncXAqTkIoIW4y_pYnHoLJDSCrIj-tyG_APliv1g1WN7hU2K4irzi4h-W4KX5Uout76RvX6aEdoxMG4ex_zi3zDRt5AYBqYVKeIBYCuBzhpIaaWYKr3-WzCBl40ltprT1ZBTesRIkkp-uBaZzFr-Z5pqT9qmuwG3t_M6VFRPNdB0Gam75M2WCJ-Ja-Lod899r2eO6nP_k9Vtsi0zUNT-N8mT6Dbk6ER93490GH2mJ-PCAvp-FafB1YCuFhi-7Fq0_HCKU_CJmtE53SugBLtra5RDGRUL3Cp8Z63r4FVKlk6pkrMpyGveHj9dfzXEbA0j_b6oPNB5WlKBowNbwBiEhgF9WHbrnJIPfqiEcHMS4vlvoXlwfyrW… (802 chars)"
  },
  "doc_id": "28164582826546778"
}
```

Answered:

```json
{
  "data": {
    "xfb_two_step_verification_authentication_passkey_options": {
      "challenge": "JivuQHp22tZ3Xsz5psEKXSFnU85h9AHUfYR/5sXnvOA=:1792880907:AagIjzVIbgFktuvZYwvPLTtkLQAQsaeZxxfJ20gO2TZ-ujRu",
      "user_verification": "preferred",
      "rp": {
        "id": "accounts.meta.com",
        "name": "Meta"
      },
      "allow_credentials": [
        {
          "id": "7kr7tROKoYvzclVfYNWOFw",
          "transports": [],
          "type": "public-key"
        }
      ]
    },
    "two_step_verification_passkey_creation_device_name": null
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792880907648,
      "time_at_flush_ms": 1792880907702
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

When a two-step prompt defaults to a passkey, queries the WebAuthn options for the account's registered passkey.

## What our machine does with it

log-cli has no authenticator device, so the presence of this call marks the passkey prompt (`twoStepPasskey`); the resolver takes "Try another way" to reach the method picker and uses TOTP instead.

## What can go wrong

Nothing for us to satisfy; it only signals that the account's default second factor is a passkey, not the app code we hold.
