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
| Called from | `runs/inspect/20261103T180010_mattinferencesaver/script120.js:59 anonymous` |
| rea | `ev_0a57ebc56fb777bb1746dc7dd547957fa8c816b670a11954dd078f19a4f83801` |

Seen 3 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 2: snapshot | 1 | 200 | 443 ms | 18333 ms | — |
| inspect | step 3: goto /direct/inbox/ | 1 | 200 | 234 ms | 2036 ms | — |
| inspect | step 5: goto /direct/t/<id>/ | 1 | 200 | 259 ms | 1387 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

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

**runs/inspect/20261103T180010_mattinferencesaver**, step 5: goto /direct/t/<id>/: 200, 259 ms

Sent:

```json
{}
```

Answered:

```json
{
  "fbAccount": {
    "obfuscated_account_id": "FXACINFRAOBIDAdP9o-v2QswRXqOqqsXkMpw4gn9lvWnMVYSSH5d_niSjr6lWOXlSktaL7WxKysJ_qlTpswqW5tw",
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

<!-- toWrite --> What this request is for on Facebook's side, from its definition and the step it fires in.

## What our machine does with it

<!-- toWrite --> Which state of `marketplace/connect` or `marketplace/publish` waits for it, reads it, or ignores it, and why.

## What can go wrong

<!-- toWrite --> The errors and statuses it can return, what each means for the run, and the end or retry our machine takes.
