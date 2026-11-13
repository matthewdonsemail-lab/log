# discordApiChannelsMessages

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/channels/messages` |
| Sends | `mobile_network_type`, `content`, `nonce`, `tts`, `flags` |
| Reads | `type`, `content`, `mentions`, `mention_roles`, `attachments`, `embeds`, `timestamp`, `edited_timestamp`, `flags`, `components`, `id`, `channel_id` and 19 more |
| Called from | `runs/inspect/20261030T222341_<name:2>/script1.js:208 app_store_parental_revocation`, `runs/inspect/20261030T222341_<name:2>/script1036.js:1 parse`, `runs/inspect/20261030T222341_<name:2>/script1221.js:2 anonymous`, `runs/inspect/20261028T074137_<name:2>/script1245.js:2 anonymous` |
| rea | `ev_065e7ad37dcb5911d240f9de7d6e2882220c5a8d7c025d92b46a23de59cf297c` |

Seen 12 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 387 ms | 6734 ms | — |
| inspect | step 4: press Enter | 1 | 200 | 398 ms | 72 ms | — |
| inspect | step 8: click e221 | 1 | 200 | 510 ms | 1615 ms | — |
| inspect | step 10: click e1454 | 2 | 200 | 390–449 ms | 1735–2487 ms | — |
| inspect | step 12: press Enter | 1 | 200 | 894 ms | 59 ms | — |
| inspect | step 15: press PageUp | 1 | 200 | 489 ms | 373 ms | — |
| inspect | step 17: click e180 | 1 | 200 | 361 ms | 751 ms | — |
| inspect | step 18: click e3208 | 1 | 200 | 391 ms | 1248 ms | — |
| inspect | step 20: press Enter | 1 | 200 | 1777 ms | 56 ms | — |
| inspect | step 28: press Enter | 1 | 200 | 2590 ms | 16 ms | — |
| inspect | step 30: press Enter | 1 | 200 | 3140 ms | 50 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T065202_<name:2>**, step 1: goto /channels/@me/<id>: 200, 387 ms

Sent:

```json
{
  "query": {
    "limit": "10"
  },
  "body": null
}
```

Answered:

```json
[
  {
    "type": 0,
    "content": "<messageText>",
    "mentions": [],
    "mention_roles": [],
    "attachments": [],
    "embeds": [],
    "timestamp": "2026-10-28T06:45:09.830000+00:00",
    "edited_timestamp": null,
    "flags": 0,
    "components": [],
    "id": "<id:1>",
    "channel_id": "<channelId:1>",
    "author": {
      "id": "<id:2>",
      "username": "<name:1>",
      "avatar": "fb80bbc029b4e9d1df8999fddb550687",
      "discriminator": "0902",
      "public_flags": 0,
      "flags": 0,
      "bot": true,
      "banner": null,
      "accent_color": null,
      "global_name": null,
      "avatar_decoration_data": null,
      "collectibles": null,
      "display_name_styles": null,
      "banner_color": null,
      "clan": null,
      "primary_guild": null
    },
    "pinned": false,
    "mention_everyone": false,
    "tts": false
  },
  {
    "type": 0,
    "content": "<messageText>",
    "mentions": [],
    "mention_roles": [],
    "attachments": [],
    "embeds": [],
    "timestamp": "2026-10-28T06:44:26.390000+00:00",
    "edited_timestamp": null,
    "flags": 0,
    "components": [],
    "id": "<id:3>",
    "channel_id": "<channelId:1>",
    "author": {
      "id": "<id:4>",
      "username": "<name:2>",
      "avatar": "82e338d2355f93220637a3ec394ca3c4",
      "discriminator": "0",
      "public_flags": 0,
      "flags": 0,
      "banner": null,
      "accent_color": null,
      "global_name": null,
      "avatar_decoration_data": null,
      "collectibles": null,
      "display_name_styles": null,
      "banner_color": null,
      "clan": null,
      "primary_guild": null
    },
    "pinned": false,
    "mention_everyone": false,
    "tts": false,
    "reactions": [
      {
        "emoji": {
          "id": null,
          "name": "<name:3>"
        },
        "count": 1,
        "count_details": {
          "burst": 0,
          "normal": 1
        },
        "burst_colors": [],
        "me_burst": false,
        "burst_me": false,
        "me": false,
        "burst_count": 0
      }
    ]
  },
  {
    "type": 0,
    "content": "<messageText>",
    "mentions": [],
    "mention_roles": [],
    "attachments": [],
    "embeds": [],
    "timestamp": "2026-10-01T21:30:56.432000+00:00",
    "edited_timestamp": null,
    "flags": 0,
    "components": [],
    "id": "<id:5>",
    "channel_id": "<channelId:1>",
    "author": {
      "id": "<id:2>",
      "username": "<name:1>",
      "avatar": "fb80bbc029b4e9d1df8999fddb550687",
      "discriminator": "0902",
      "public_flags": 0,
      "flags": 0,
      "bot": true,
      "banner": null,
      "accent_color": null,
      "global_name": null,
      "avatar_decoration_data": null,
      "collectibles": null,
      "display_name_styles": null,
      "banner_color": null,
      "clan": null,
      "primary_guild": null
    },
    "pinned": false,
    "mention_everyone": false,
    "tts": false
  },
  {
    "type": 0,
    "content": "<messageText>",
    "mentions": [],
    "mention_roles": [],
    "attachments": [],
    "embeds": [],
    "timestamp": "2026-10-01T21:30:55.967000+00:00",
    "edited_timestamp": null,
    "flags": 0,
    "components": [],
    "id": "<id:6>",
    "channel_id": "<channelId:1>",
    "author": {
      "id": "<id:2>",
      "username": "<name:1>",
      "avatar": "fb80bbc029b4e9d1df8999fddb550687",
      "discriminator": "0902",
      "public_flags": 0,
      "flags": 0,
      "bot": true,
      "banner": null,
      "accent_color": null,
      "global_name": null,
      "avatar_decoration_data": null,
      "collectibles": null,
      "display_name_styles": null,
      "banner_color": null,
      "clan": null,
      "primary_guild": null
    },
    "pinned": false,
    "mention_everyone": false,
    "tts": false
  },
  {
    "type": 0,
    "content": "🔨 `0 todos`",
    "mentions": [],
    "mention_roles": [],
    "attachments": [],
    "embeds": [],
    "timestamp": "2026-10-01T21:30:44.153000+00:00",
    "edited_timestamp": "2026-10-01T21:30:50.489000+00:00",
    "flags": 0,
    "components": [],
    "id": "<id:7>",
    "channel_id": "<channelId:1>",
    "author": {
      "id": "<id:2>",
      "username": "<name:1>",
      "avatar": "fb80bbc029b4e9d1df8999fddb550687",
      "discriminator": "0902",
      "public_flags": 0,
      "flags": 0,
      "bot": true,
      "banner": null,
      "accent_color": null,
      "global_name": null,
      "avatar_decoration_data": null,
      "collectibles": null,
      "display_name_styles": null,
      "banner_color": null,
      "clan": null,
      "primary_guild": null
    },
    "pinned": false,
    "mention_everyone": false,
    "tts": false
  },
  {
    "type": 0,
    "content": "<messageText>",
    "mentions": [],
    "mention_roles": [],
    "attachments": [],
    "embeds": [],
    "timestamp": "2026-10-01T21:30:31.861000+00:00",
    "edited_timestamp": "2026-10-01T21:30:43.149000+00:00",
    "flags": 0,
    "components": [],
    "id": "<id:8>",
    "channel_id": "<channelId:1>",
    "author": {
      "id": "<id:2>",
      "username": "<name:1>",
      "avatar": "fb80bbc029b4e9d1df8999fddb550687",
      "discriminator": "0902",
      "public_flags": 0,
      "flags": 0,
      "bot": true,
      "banner": null,
      "accent_color": null,
      "global_name": null,
      "avatar_decoration_data": null,
      "collectibles": null,
      "display_name_styles": null,
      "banner_color": null,
      "clan": null,
      "primary_guild": null
    },
    "pinned": false,
    "mention_everyone": false,
    "tts": false
  },
  "… 4 more"
]
```

**runs/inspect/20261028T065202_<name:2>**, step 4: press Enter: 200, 398 ms

Sent:

```json
{
  "mobile_network_type": "unknown",
  "content": "<messageText>",
  "nonce": "<id:9>",
  "tts": false,
  "flags": 0
}
```

Answered:

```json
{
  "type": 0,
  "content": "<messageText>",
  "mentions": [],
  "mention_roles": [],
  "attachments": [],
  "embeds": [],
  "timestamp": "2026-10-28T06:55:07.361000+00:00",
  "edited_timestamp": null,
  "flags": 0,
  "components": [],
  "id": "<id:10>",
  "channel_id": "<channelId:1>",
  "author": {
    "id": "<id:4>",
    "username": "<name:2>",
    "avatar": "82e338d2355f93220637a3ec394ca3c4",
    "discriminator": "0",
    "public_flags": 0,
    "flags": 0,
    "banner": null,
    "accent_color": null,
    "global_name": null,
    "avatar_decoration_data": null,
    "collectibles": null,
    "display_name_styles": null,
    "banner_color": null,
    "clan": {
      "identity_guild_id": null,
      "identity_enabled": false,
      "tag": null,
      "badge": null
    },
    "primary_guild": {
      "identity_guild_id": null,
      "identity_enabled": false,
      "tag": null,
      "badge": null
    }
  },
  "pinned": false,
  "mention_everyone": false,
  "tts": false,
  "nonce": "<id:9>"
}
```

**runs/inspect/20261028T062914_<name:2>**, step 8: click e221: 200, 510 ms

Sent:

```json
{
  "query": {
    "limit": "10"
  },
  "body": null
}
```

Answered:

```json
[
  {
    "type": 0,
    "content": "<messageText>",
    "mentions": [],
    "mention_roles": [],
    "attachments": [],
    "embeds": [],
    "timestamp": "2026-07-21T16:05:29.569000+00:00",
    "edited_timestamp": null,
    "flags": 0,
    "components": [],
    "id": "<id:11>",
    "channel_id": "<channelId:2>",
    "author": {
      "id": "<id:4>",
      "username": "<name:2>",
      "avatar": "82e338d2355f93220637a3ec394ca3c4",
      "discriminator": "0",
      "public_flags": 0,
      "flags": 0,
      "banner": null,
      "accent_color": null,
      "global_name": null,
      "avatar_decoration_data": null,
      "collectibles": null,
      "display_name_styles": null,
      "banner_color": null,
      "clan": null,
      "primary_guild": null
    },
    "pinned": false,
    "mention_everyone": false,
    "tts": false,
    "reactions": [
      {
        "emoji": {
          "id": null,
          "name": "<name:4>"
        },
        "count": 2,
        "count_details": {
          "burst": 0,
          "normal": 2
        },
        "burst_colors": [],
        "me_burst": false,
        "burst_me": false,
        "me": false,
        "burst_count": 0
      },
      {
        "emoji": {
          "id": "<id:12>",
          "name": "<name:5>"
        },
        "count": 1,
        "count_details": {
          "burst": 1,
          "normal": 0
        },
        "burst_colors": [
          "#000000",
          "#000000",
          "#c00b0b",
          "#100000",
          "#b00a0a",
          "#800707",
          "… 4 more"
        ],
        "me_burst": false,
        "burst_me": false,
        "me": false,
        "burst_count": 1
      }
    ]
  }
]
```

<!-- facts:end -->

## What it does

Reads a channel's messages (`GET .../messages?before=<id>&limit=20`, newest first, for history paging) and sends one (`POST .../messages` with `content` and a `nonce`).

## What our machine does with it

History paging: the oldest id in each answer is the next `before`; fewer than 20 back is the start of the chat. A send is decided by the answer's `id` (rule 73). Sending is only with `--live` (rule 8).

## What can go wrong

403 `Missing Access` / 50001 means the account can't see the channel, 50013 missing permissions, 429 rate limited with `retry_after`. A failed send is never retried blindly: the gateway's `MESSAGE_CREATE` echo says whether it landed.
