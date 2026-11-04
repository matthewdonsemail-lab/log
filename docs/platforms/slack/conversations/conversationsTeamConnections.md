# conversationsTeamConnections

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | conversations |
| Kind | query |
| doc_id | — |
| Path | `/api/conversations.teamConnections` |
| Sends | `------WebKitFormBoundary8s98VdfmW6mZiNVc
Content-Disposition: form-data; name` |
| Reads | `ok`, `channel.id`, `channel.conversation_host_id`, `channel.connected_team_ids`, `channel.connected_limited_team_ids`, `channel.is_sponsored`, `connections`, `pending_connections`, `previous_connections` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script29.js:146 Rhjh`, `runs/inspect/20261103T065639_mattSlack/script3.js:2954 Rhjh`, `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous` |
| rea | `ev_bf332ce057b02c915546a8471d8ceda0774db452c4bd0813ce0701c6ad3faa7f` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU | 1 | 200 | 293 ms | 7000 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU: 200, 293 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689122.083",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_csid": "aVvVPXA0sak",
    "slack_route": "T0C4VCD06MR",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundary8s98VdfmW6mZiNVc\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundary8s98VdfmW6mZiNVc\r\nContent-Disposition: form-data; name=\"channel\"\r\n\r\nD0C8VAE7REU\r\n------WebKitFormBoundary8s98VdfmW6mZiNVc\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nfetchAndUpsertSharedChannelTeamConnections\r\n------WebKitFormBoundary8s98Vd… (717 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "channel": {
    "id": "D0C8VAE7REU",
    "conversation_host_id": "T0C4VCD06MR",
    "connected_team_ids": [
      "T0C4VCD06MR",
      "T0A9H4FM18V"
    ],
    "connected_limited_team_ids": [],
    "is_sponsored": false
  },
  "connections": [
    {
      "team": {
        "id": "T0C4VCD06MR",
        "name": "Matthew's Team",
        "icon": {
          "image_default": true,
          "image_34": "https://a.slack-edge.com/80588/img/avatars-teams/ava_0016-34.png",
          "image_44": "https://a.slack-edge.com/80588/img/avatars-teams/ava_0016-44.png",
          "image_68": "https://a.slack-edge.com/80588/img/avatars-teams/ava_0016-68.png",
          "image_88": "https://a.slack-edge.com/80588/img/avatars-teams/ava_0016-88.png",
          "image_102": "https://a.slack-edge.com/80588/img/avatars-teams/ava_0016-102.png",
          "image_230": "https://a.slack-edge.com/80588/img/avatars-teams/ava_0016-230.png",
          "image_132": "https://a.slack-edge.com/80588/img/avatars-teams/ava_0016-132.png"
        },
        "avatar_base_url": "https://ca.slack-edge.com/",
        "is_verified": false,
        "domain": "matthewsteam-op91876",
        "date_created": 1790614676,
        "requires_sponsorship": true
      },
      "is_private": true,
      "allows_flag_content": false,
      "is_disconnect_in_progress": false
    },
    {
      "team": {
        "id": "T0A9H4FM18V",
        "name": "Rheos",
        "icon": {
          "image_default": false,
          "image_34": "https://avatars.slack-edge.com/2026-03-26/10790014070324_8195aace320335883a0d_34.png",
          "image_44": "https://avatars.slack-edge.com/2026-03-26/10790014070324_8195aace320335883a0d_44.png",
          "image_68": "https://avatars.slack-edge.com/2026-03-26/10790014070324_8195aace320335883a0d_68.png",
          "image_88": "https://avatars.slack-edge.com/2026-03-26/10790014070324_8195aace320335883a0d_88.png",
          "image_102": "https://avatars.slack-edge.com/2026-03-26/10790014070324_8195aace320335883a0d_102.png",
          "image_230": "https://avatars.slack-edge.com/2026-03-26/10790014070324_8195aace320335883a0d_230.png",
          "image_132": "https://avatars.slack-edge.com/2026-03-26/10790014070324_8195aace320335883a0d_132.png"
        },
        "avatar_base_url": "https://ca.slack-edge.com/",
        "is_verified": false,
        "domain": "rheosgroup",
        "date_created": 1768831576,
        "requires_sponsorship": false
      },
      "is_private": true,
      "allows_flag_content": false,
      "is_disconnect_in_progress": false
    }
  ],
  "pending_connections": [],
  "previous_connections": []
}
```

<!-- facts:end -->

## What it does

Asks which other teams a channel is connected to (`channel.connected_team_ids`, `connections`, `pending_connections`, `previous_connections`) for the opened DM: it fired 7.0 s into step 6 (goto the DM D0C8VAE7REU), 293 ms, 200.

## What our machine does with it

Nothing: no log-cli code calls it (not in python/slackApi, src/ or the engine's own paths), so no action waits on it or reads it; it was only seen in the inspect recording of Slack's own web client. It only matters for Slack Connect channels; log-cli's chats are DMs and group DMs.

## What can go wrong

Slack answers `{ok: false, error: ...}` (usually still HTTP 200) when it refuses; the recording shows only `200` with no errors here. A refusal would only hide the connection badges in the web client.
