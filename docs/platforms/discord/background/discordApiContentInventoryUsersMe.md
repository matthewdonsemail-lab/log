# discordApiContentInventoryUsersMe

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/content-inventory/users/@me` |
| Sends | — |
| Reads | `request_id`, `entries`, `unranked_game_entries`, `entries_hash`, `expired_at`, `refresh_stale_inbox_after_ms`, `refresh_token`, `wait_ms_until_next_fetch` |
| Called from | `runs/inspect/20261113T231616_deepman2/script3.js:232 625075`, `runs/inspect/20261113T231616_deepman2/script3.js:124 559868`, `runs/inspect/20261113T231616_deepman2/script3.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_2b0466ea88b7ef0bc0ed6456686c904546961271e783fc66ebff04bc83e43d63` |

Seen 14 time(s) in 12 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 640 ms | 11843 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 1160 ms | 12933 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 861 ms | 10108 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 2270 ms | 8798 ms | — |
| inspect | step 1: goto /login | 7 | 200 | 551–9445 ms | 18512–1052610 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 902 ms | 51784 ms | — |
| inspect | step 6: wait 45s | 1 | 200 | 1053 ms | 25504 ms | — |
| inspect | step 1: goto /channels/@me | 1 | 200 | 538 ms | 4503 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T231616_deepman2**, step 6: wait 45s: 200, 1053 ms

Sent:

```json
{
  "query": {
    "for_game_profile": "false",
    "feature": "inbox"
  },
  "body": null
}
```

Answered:

```json
{
  "request_id": "afad2a0a7d06461b94e57973662bacf9",
  "entries": [
    {
      "content": {
        "id": "<id:1>",
        "author_id": "<userId:1>",
        "author_type": 1,
        "content_type": 6,
        "traits": "(4 items)",
        "extra": "(3 fields)",
        "original_id": "1569813070342135889",
        "participants": "(1 items)",
        "signature": "(3 fields)"
      },
      "rank": 1
    },
    {
      "content": {
        "id": "<id:2>",
        "author_id": "<userId:2>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(3 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-31T12:24:10.220000+00:00",
        "started_at": "2026-10-31T11:05:39.220000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 2
    },
    {
      "content": {
        "id": "<id:3>",
        "author_id": "<userId:3>",
        "author_type": 1,
        "content_type": 8,
        "traits": "(2 items)",
        "extra": "(3 fields)",
        "participants": "(1 items)",
        "signature": "(3 fields)"
      },
      "rank": 3
    },
    {
      "content": {
        "id": "<id:4>",
        "author_id": "<userId:4>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-11-08T08:30:20.580000+00:00",
        "started_at": "2026-11-08T06:54:05.580000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 4
    },
    {
      "content": {
        "id": "<id:5>",
        "author_id": "<userId:2>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(4 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-31T14:22:01.943000+00:00",
        "started_at": "2026-10-31T12:35:07.943000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 5
    },
    {
      "content": {
        "id": "<id:6>",
        "author_id": "<userId:3>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-11-07T07:42:08.031000+00:00",
        "started_at": "2026-11-07T06:19:09.031000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 6
    },
    "… 4 more"
  ],
  "unranked_game_entries": [
    {
      "content": {
        "id": "<id:2>",
        "author_id": "<userId:2>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(3 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-31T12:24:10.220000+00:00",
        "started_at": "2026-10-31T11:05:39.220000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 2
    },
    {
      "content": {
        "id": "<id:4>",
        "author_id": "<userId:4>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-11-08T08:30:20.580000+00:00",
        "started_at": "2026-11-08T06:54:05.580000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 4
    },
    {
      "content": {
        "id": "<id:5>",
        "author_id": "<userId:2>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(4 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-31T14:22:01.943000+00:00",
        "started_at": "2026-10-31T12:35:07.943000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 5
    },
    {
      "content": {
        "id": "<id:6>",
        "author_id": "<userId:3>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-11-07T07:42:08.031000+00:00",
        "started_at": "2026-11-07T06:19:09.031000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 6
    },
    {
      "content": {
        "id": "<id:7>",
        "author_id": "<userId:3>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(3 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-11-07T09:18:01.832000+00:00",
        "started_at": "2026-11-07T07:51:18.832000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 7
    },
    {
      "content": {
        "id": "<id:8>",
        "author_id": "<userId:2>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-11-11T11:00:13.618000+00:00",
        "started_at": "2026-11-11T10:43:27.618000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 8
    },
    "… 2 more"
  ],
  "entries_hash": 0,
  "expired_at": "2026-11-13T23:31:58.863000+00:00",
  "refresh_stale_inbox_after_ms": 30000,
  "refresh_token": "<token>",
  "wait_ms_until_next_fetch": 824349
}
```

**runs/inspect/20261111T233723_deepman2**, step 1: goto /login: 200, 873 ms

Sent:

```json
{
  "query": {
    "for_game_profile": "false",
    "feature": "inbox"
  },
  "body": null
}
```

Answered:

```json
{
  "request_id": "04e7fb546c2041019944537f5187ff30",
  "entries": [
    {
      "content": {
        "id": "<id:9>",
        "author_id": "<userId:1>",
        "author_type": 1,
        "content_type": 6,
        "traits": "(4 items)",
        "extra": "(3 fields)",
        "original_id": "1569813070342135889",
        "participants": "(1 items)",
        "signature": "(3 fields)"
      },
      "rank": 1
    },
    {
      "content": {
        "id": "<id:10>",
        "author_id": "<userId:3>",
        "author_type": 1,
        "content_type": 8,
        "traits": "(2 items)",
        "extra": "(3 fields)",
        "participants": "(1 items)",
        "signature": "(3 fields)"
      },
      "rank": 2
    },
    {
      "content": {
        "id": "<id:4>",
        "author_id": "<userId:4>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-11-08T08:30:20.580000+00:00",
        "started_at": "2026-11-08T06:54:05.580000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 3
    },
    {
      "content": {
        "id": "<id:2>",
        "author_id": "<userId:2>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(3 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-31T12:24:10.220000+00:00",
        "started_at": "2026-10-31T11:05:39.220000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 4
    },
    {
      "content": {
        "id": "<id:5>",
        "author_id": "<userId:2>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(4 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-31T14:22:01.943000+00:00",
        "started_at": "2026-10-31T12:35:07.943000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 5
    },
    {
      "content": {
        "id": "<id:6>",
        "author_id": "<userId:3>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-11-07T07:42:08.031000+00:00",
        "started_at": "2026-11-07T06:19:09.031000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 6
    },
    "… 3 more"
  ],
  "unranked_game_entries": [
    {
      "content": {
        "id": "<id:4>",
        "author_id": "<userId:4>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-11-08T08:30:20.580000+00:00",
        "started_at": "2026-11-08T06:54:05.580000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 3
    },
    {
      "content": {
        "id": "<id:2>",
        "author_id": "<userId:2>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(3 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-31T12:24:10.220000+00:00",
        "started_at": "2026-10-31T11:05:39.220000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 4
    },
    {
      "content": {
        "id": "<id:5>",
        "author_id": "<userId:2>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(4 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-31T14:22:01.943000+00:00",
        "started_at": "2026-10-31T12:35:07.943000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 5
    },
    {
      "content": {
        "id": "<id:6>",
        "author_id": "<userId:3>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-11-07T07:42:08.031000+00:00",
        "started_at": "2026-11-07T06:19:09.031000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 6
    },
    {
      "content": {
        "id": "<id:7>",
        "author_id": "<userId:3>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(3 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-11-07T09:18:01.832000+00:00",
        "started_at": "2026-11-07T07:51:18.832000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 7
    },
    {
      "content": {
        "id": "<id:8>",
        "author_id": "<userId:2>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-11-11T11:00:13.618000+00:00",
        "started_at": "2026-11-11T10:43:27.618000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 9
    },
    "… 1 more"
  ],
  "entries_hash": 0,
  "expired_at": "2026-11-11T23:51:58.863000+00:00",
  "refresh_stale_inbox_after_ms": 30000,
  "refresh_token": "<token>",
  "wait_ms_until_next_fetch": 861778
}
```

**runs/inspect/20261109T192314_deepman2**, step 1: goto /channels/@me: 200, 538 ms

Sent:

```json
{
  "query": {
    "for_game_profile": "false",
    "feature": "inbox"
  },
  "body": null
}
```

Answered:

```json
{
  "request_id": "34dbee6261c14ea5a7639920aa5ed652",
  "entries": [
    {
      "content": {
        "id": "<id:5>",
        "author_id": "<userId:2>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(4 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-31T14:22:01.943000+00:00",
        "started_at": "2026-10-31T12:35:07.943000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 1
    },
    {
      "content": {
        "id": "<id:2>",
        "author_id": "<userId:2>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(3 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-31T12:24:10.220000+00:00",
        "started_at": "2026-10-31T11:05:39.220000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 2
    },
    {
      "content": {
        "id": "<id:11>",
        "author_id": "<userId:2>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(1 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-11-09T10:08:41.129000+00:00",
        "started_at": "2026-11-09T09:59:00.129000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 5
    },
    {
      "content": {
        "id": "<id:12>",
        "author_id": "<userId:3>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-12T22:12:57.333000+00:00",
        "started_at": "2026-10-12T21:05:51.333000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 8
    },
    {
      "content": {
        "id": "<id:6>",
        "author_id": "<userId:3>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-11-07T07:42:08.031000+00:00",
        "started_at": "2026-11-07T06:19:09.031000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 9
    },
    {
      "content": {
        "id": "<id:7>",
        "author_id": "<userId:3>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(3 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-11-07T09:18:01.832000+00:00",
        "started_at": "2026-11-07T07:51:18.832000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 10
    },
    "… 1 more"
  ],
  "unranked_game_entries": [
    {
      "content": {
        "id": "<id:5>",
        "author_id": "<userId:2>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(4 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-31T14:22:01.943000+00:00",
        "started_at": "2026-10-31T12:35:07.943000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 1
    },
    {
      "content": {
        "id": "<id:2>",
        "author_id": "<userId:2>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(3 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-31T12:24:10.220000+00:00",
        "started_at": "2026-10-31T11:05:39.220000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 2
    },
    {
      "content": {
        "id": "<id:11>",
        "author_id": "<userId:2>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(1 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-11-09T10:08:41.129000+00:00",
        "started_at": "2026-11-09T09:59:00.129000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 5
    },
    {
      "content": {
        "id": "<id:12>",
        "author_id": "<userId:3>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-12T22:12:57.333000+00:00",
        "started_at": "2026-10-12T21:05:51.333000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 8
    },
    {
      "content": {
        "id": "<id:6>",
        "author_id": "<userId:3>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-11-07T07:42:08.031000+00:00",
        "started_at": "2026-11-07T06:19:09.031000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 9
    },
    {
      "content": {
        "id": "<id:7>",
        "author_id": "<userId:3>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(3 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-11-07T09:18:01.832000+00:00",
        "started_at": "2026-11-07T07:51:18.832000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 10
    }
  ],
  "entries_hash": 0,
  "expired_at": "2026-11-09T19:31:58.863000+00:00",
  "refresh_stale_inbox_after_ms": 30000,
  "refresh_token": "<token>",
  "wait_ms_until_next_fetch": 536339
}
```

<!-- facts:end -->

## What it does

Fetches the account's activity feed inventory (what friends played or listened to) for the Active Now panel.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
