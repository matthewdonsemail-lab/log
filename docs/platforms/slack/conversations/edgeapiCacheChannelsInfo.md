# edgeapiCacheChannelsInfo

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | conversations |
| Kind | endpoint |
| doc_id | — |
| Path | `edgeapi.slack.com/cache/channels/info` |
| Sends | — |
| Reads | `failed_ids`, `results`, `ok`, `member_channels` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script38.js:771 anonymous` |
| rea | `ev_c768a8dd3a32ade2e987e251d0627a66b7d798dc007c87a92e41828826c7a8e2` |

Seen 4 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 2 | 200 | 80–508 ms | 7666–9181 ms | — |
| inspect | step 14: press Enter | 1 | 200 | 373 ms | 96310 ms | — |
| inspect | step 16: press Control+a | 1 | 200 | 109 ms | 15098 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 508 ms

Sent:

```json
{
  "query": {
    "_x_app_name": "client",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": "{\"token\":\"xoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\",\"check_membership\":true,\"updated_ids\":{\"D0C4VCJA6NP\":1790614723826}}"
}
```

Answered:

```json
{
  "failed_ids": [
    "D0C4VCJA6NP"
  ],
  "results": [],
  "ok": true
}
```

**runs/inspect/20261103T065639_mattSlack**, step 14: press Enter: 200, 373 ms

Sent:

```json
{
  "query": {
    "_x_app_name": "client",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": "{\"token\":\"xoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\",\"check_membership\":true,\"updated_ids\":{\"C0CDBB09HT5\":0}}"
}
```

Answered:

```json
{
  "results": [
    {
      "id": "C0CDBB09HT5",
      "enterprise_id": "",
      "context_team_id": "T0C4VCD06MR",
      "internal_team_ids": [],
      "pending_connected_team_ids": [],
      "pending_shared": [],
      "shared_team_ids": [
        "T0A9H4FM18V"
      ],
      "connected_limited_team_ids": [],
      "connected_team_ids": [
        "T0A9H4FM18V",
        "T0C4VCD06MR"
      ],
      "conversation_host_id": "T0A9H4FM18V",
      "creator": "USLACKBOT",
      "name": "Untitled",
      "name_normalized": "FC:F0CDBB09HT5:Untitled",
      "previous_names": [],
      "created": 1793354470,
      "unlinked": 0,
      "updated": 1793354473218,
      "is_archived": false,
      "is_channel": true,
      "is_frozen": false,
      "is_general": false,
      "is_group": false,
      "is_im": false,
      "is_moved": 0,
      "is_mpim": false,
      "is_org_default": false,
      "is_org_mandatory": false,
      "is_record_channel": false,
      "is_file": true,
      "is_shared": true,
      "is_ext_shared": true,
      "is_org_shared": false,
      "is_pending_ext_shared": false,
      "is_private": true,
      "is_global_shared": false,
      "parent_conversation": "",
      "purpose": {
        "creator": "",
        "last_set": 0,
        "value": ""
      },
      "topic": {
        "creator": "",
        "last_set": 0,
        "value": ""
      },
      "properties": {
        "canvas": null,
        "posting_restricted_to": null,
        "threads_restricted_to": null,
        "at_channel_restricted": false,
        "at_here_restricted": false,
        "tabs": [],
        "record_channel": null,
        "tabz": [],
        "channel_workflows": [],
        "huddles_restricted": false,
        "sharing_disabled": false,
        "meeting_notes": null,
        "use_case": "",
        "crm": null,
        "workflow": null,
        "default_tab_id": "",
        "auto_open_tab_id": "",
        "who_can_manage_tabs": "",
        "huddles": null,
        "agent_listener": "",
        "default_agent": "",
        "show_expanded_composer": false,
        "membership_limit": 0,
        "channel_knowledge_agent": null,
        "has_slack_connect_invite_created": false,
        "exclude_from_slack_ai": false,
        "is_channel_agent_enabled": false,
        "who_can_manage_channel_agent": "",
        "restrict_guests": false,
        "restrict_message_and_file_sharing": false,
        "agent_session": null,
        "code_channel": null,
        "has_custom_mpdm_name": false,
        "agent_commands": null,
        "channel_visitor_ids": []
      },
      "frozen_reason": "",
      "is_ext_ws_shared": false,
      "use_case": "",
      "channel_agent_status": ""
    }
  ],
  "member_channels": [
    "C0CDBB09HT5",
    "C0CDBB09HT5"
  ],
  "ok": true
}
```

**runs/inspect/20261103T065639_mattSlack**, step 16: press Control+a: 200, 109 ms

Sent:

```json
{
  "query": {
    "_x_app_name": "client",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": "{\"token\":\"xoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\",\"check_membership\":true,\"updated_ids\":{\"C0CDBB09HT5\":1793354473218}}"
}
```

Answered:

```json
{
  "results": [],
  "member_channels": [
    "C0CDBB09HT5",
    "C0CDBB09HT5"
  ],
  "ok": true
}
```

<!-- facts:end -->

## What it does

Asks Slack's edge cache for channel records by id (`results`, `failed_ids`, `member_channels`): it fired four times, in step 4 (80 to 508 ms, 7.7 to 9.2 s in), step 14 (373 ms) and step 16 (109 ms), all 200.

## What our machine does with it

Nothing: no log-cli code calls it (not in python/slackApi, src/ or the engine's own paths), so no action waits on it or reads it; it was only seen in the inspect recording of Slack's own web client. The vendored gabrielSlack has an edge API path (`core/metadata.py`) but the engine never asks for channel info through it.

## What can go wrong

Ids it cannot serve come back in `failed_ids` or with `ok: false`; the recording shows 200 with no errors. The vendored hydrator notes 1:1 DMs are not served by the edge API and are resolved with `conversations.info`, so an empty answer for a DM id is expected.
