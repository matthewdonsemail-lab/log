# usersStateMachine

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | boot |
| Kind | query |
| doc_id | — |
| Path | `/api/users.stateMachine` |
| Sends | `------WebKitFormBoundarymsx7880oTfIYc9gW
Content-Disposition: form-data; name` |
| Reads | `ok`, `machines` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script29.js:146 XiUd`, `runs/inspect/20261103T065639_mattSlack/script3.js:2954 XiUd`, `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous` |
| rea | `ev_e1063020a3dbf78451ebdfca64ab4e699ceebc1b556f62d91d9b8c7b1c97e6ab` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 899 ms | 6675 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 899 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689064.484",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "slack_route": "T0C4VCD06MR",
    "_x_version_ts": "1793684253",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundarymsx7880oTfIYc9gW\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundarymsx7880oTfIYc9gW\r\nContent-Disposition: form-data; name=\"machines\"\r\n\r\n[{\"machine_name\":\"INPRODUCT_TEAM_CREATION_FLOW\"},{\"machine_name\":\"SEGMENTATION_IN_TEAM_CREATION_FLOW\"},{\"machine_name\":\"SC_TRIAL_TEAM_ONBOARDING\"},{\"machine_name\":\"SC_TRIAL_TEAM_ON… (1002 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "machines": [
    {
      "machine_name": "INPRODUCT_TEAM_CREATION_FLOW",
      "state": "ELIGIBLE",
      "metadata": "{}",
      "is_state_terminal": false
    },
    {
      "machine_name": "SEGMENTATION_IN_TEAM_CREATION_FLOW",
      "state": "ELIGIBLE",
      "metadata": "{\"SHOW_CHANNEL_EDIT_ICON\":true}",
      "is_state_terminal": false
    },
    {
      "machine_name": "SC_TRIAL_TEAM_ONBOARDING",
      "state": "COMPLETE",
      "metadata": "{\"sc_channel_id\":\"C0C5VUS8GC8\",\"inviting_team_domain\":\"rheosgroup\",\"has_sent_first_message\":true,\"message_banner_skipped_at\":1790671577,\"welcome_modal_completed_at\":1790671576,\"message_banner_skipped_reason\":\"has_sent_message\",\"channel_invite_coachmark_completed_at\":1790708270,\"workspace_invite_coachmark_completed_at\":1790796175}",
      "is_state_terminal": true
    },
    {
      "machine_name": "SC_TRIAL_TEAM_ONBOARDING_CHANNEL_REVEAL",
      "state": "REVEALED",
      "metadata": "",
      "is_state_terminal": true
    },
    {
      "machine_name": "SC_TRIAL_TEAM_ONBOARDING_WELCOME",
      "state": "COMPLETE",
      "metadata": "",
      "is_state_terminal": true
    },
    {
      "machine_name": "UPDATED_SEGMENTATION_QUESTIONS",
      "state": "ELIGIBLE",
      "metadata": "{}",
      "is_state_terminal": false
    }
  ]
}
```

<!-- facts:end -->

## What it does

Reads the account's onboarding and tooltip state machines (`machines`): fired 6.7 s into step 4 (`goto /client`), 899 ms, 200.

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`) works through `GabrielCore` on curl_cffi, which signs in with the `d` cookie and calls only the web API methods it needs, so this is Slack's own web client boot traffic that `log inspect` recorded.

## What can go wrong

Like every Slack web API answer it carries `ok`; with `ok: false` the `error` field says why (for example `not_authed`, `invalid_auth`, `ratelimited`). The recorded answer was 200 without error.
