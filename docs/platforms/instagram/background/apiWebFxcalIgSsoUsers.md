# apiWebFxcalIgSsoUsers

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/api/web/fxcal/ig_sso_users` |
| Sends | — |
| Reads | `fbAccount.obfuscated_account_id`, `fbAccount.profile_pic_url`, `fbAccount.display_name`, `fbAccount.sso_login_available`, `fbAccount.is_sso_enabled`, `status` |
| Called from | `runs/inspect/20261103T185330_mattinferencesaver/script4.js:1203 anonymous` |
| rea | `ev_0a57ebc56fb777bb1746dc7dd547957fa8c816b670a11954dd078f19a4f83801` |

Seen 4 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 2: snapshot | 1 | 200 | 443 ms | 18333 ms | — |
| inspect | step 3: goto /direct/inbox/ | 1 | 200 | 234 ms | 2036 ms | — |
| inspect | step 5: goto /direct/t/<id>/ | 1 | 200 | 259 ms | 1387 ms | — |
| inspect | step 1: goto /direct/t/<id>/ | 1 | 200 | 315 ms | 2621 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T185330_mattinferencesaver**, step 1: goto /direct/t/<id>/: 200, 315 ms

Sent:

```json
{}
```

Answered:

```json
{
  "fbAccount": {
    "obfuscated_account_id": "FXACINFRAOBIDAdPnCFFerYPpMjpTCHkezBh1llh9tQ2rvaigych0s7npaC0lfAXSpay7NVjV3-qKye0_whLbjoA",
    "profile_pic_url": "https://scontent.fdad3-6.fna.fbcdn.net/v/t39.30808-1/448509310_2854775338016712_8352622713117055087_n.jpg (482 chars)",
    "display_name": "Matthew Don",
    "sso_login_available": false,
    "is_sso_enabled": true
  },
  "status": "ok"
}
```

**runs/inspect/20261103T180010_mattinferencesaver**, step 2: snapshot: 200, 443 ms

Sent:

```json
{}
```

Answered:

```json
{
  "fbAccount": {
    "obfuscated_account_id": "FXACINFRAOBIDAdMn1FnsdobQ0lyz9srQCOqQNZYz92CJ7olTKitlJ0w4pslzUMPUOhNpiCkkn62Xz9st4ZAKxxk",
    "profile_pic_url": "https://scontent.fdad3-6.fna.fbcdn.net/v/t39.30808-1/448509310_2854775338016712_8352622713117055087_n.jpg (482 chars)",
    "display_name": "Matthew Don",
    "sso_login_available": false,
    "is_sso_enabled": true
  },
  "status": "ok"
}
```

**runs/inspect/20261103T180010_mattinferencesaver**, step 3: goto /direct/inbox/: 200, 234 ms

Sent:

```json
{}
```

Answered:

```json
{
  "fbAccount": {
    "obfuscated_account_id": "FXACINFRAOBIDAdPLNv-ggjo_OVpxvbVpQOthXbZElY0SSgjzzqT3472L7z8hxqEhXngYCe7ZATbRu_ImAQXyn8Y",
    "profile_pic_url": "https://scontent.fdad3-6.fna.fbcdn.net/v/t39.30808-1/448509310_2854775338016712_8352622713117055087_n.jpg (482 chars)",
    "display_name": "Matthew Don",
    "sso_login_available": false,
    "is_sso_enabled": true
  },
  "status": "ok"
}
```

<!-- facts:end -->

## What it does

Asks which linked Accounts Center account can sign in to Instagram with single sign-on, sending an empty body. It fired 4 times in 2 runs on `snapshot`, `goto /direct/inbox/` and `goto /direct/t/<id>/` steps (234-443 ms, status 200) and answered `fbAccount` with `display_name`, `sso_login_available: false`, `is_sso_enabled: true` and `status: ok`.

## What our machine does with it

Nothing: no machine waits on it, and the engine never calls it. `sso_login_available: false` just means the page offers no one-tap login for this already signed-in session, which our cookie-based sign-in does not use.

## What can go wrong

Every call answered 200 with `status: ok`. If `status` were anything else the page would not show its sign-in offer; our runs do not decide on it.
