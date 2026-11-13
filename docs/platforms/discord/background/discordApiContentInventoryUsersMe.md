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
| Called from | `runs/inspect/20261113T044840_<name:1>/script0.js:232 625075`, `runs/inspect/20261113T044840_<name:1>/script0.js:124 559868`, `runs/inspect/20261113T044840_<name:1>/script0.js:124 961943`, `runs/inspect/20261113T044840_<name:1>/script1294.js:1 634654` |
| rea | `ev_bac57c729da9f245ab1ae9efd0a5800e5f1b073719ad0ea13e5686429435ebaa` |

Seen 7 time(s) in 5 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 640 ms | 11843 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 1160 ms | 12933 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 861 ms | 10108 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 2270 ms | 8798 ms | — |
| inspect | step 1: goto /login | 2 | 200 | 1472–9445 ms | 18512–46597 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 902 ms | 51784 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T044840_<name:1>**, step 1: goto /login: 200, 9445 ms

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
  "request_id": "25c678eb71fa48dc8268da4b9fe9ae71",
  "entries": [
    {
      "content": {
        "id": "<id:1>",
        "author_id": "<userId:1>",
        "author_type": 1,
        "content_type": 6,
        "traits": "(4 items)",
        "extra": "(3 fields)",
        "original_id": "<id:1>",
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
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-11-01T11:01:03.732000+00:00",
        "started_at": "2026-11-01T10:27:52.732000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 2
    },
    {
      "content": {
        "id": "<id:3>",
        "author_id": "<userId:3>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-30T22:14:25.545000+00:00",
        "started_at": "2026-10-30T21:46:03.545000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 3
    },
    {
      "content": {
        "id": "<id:4>",
        "author_id": "<userId:4>",
        "author_type": 1,
        "content_type": 6,
        "traits": "(4 items)",
        "extra": "(3 fields)",
        "original_id": "<id:2>",
        "participants": "(1 items)",
        "signature": "(3 fields)"
      },
      "rank": 6
    },
    {
      "content": {
        "id": "<id:5>",
        "author_id": "<userId:5>",
        "author_type": 1,
        "content_type": 6,
        "traits": "(4 items)",
        "extra": "(3 fields)",
        "original_id": "<id:3>",
        "participants": "(1 items)",
        "signature": "(3 fields)"
      },
      "rank": 7
    },
    {
      "content": {
        "id": "<id:6>",
        "author_id": "<userId:6>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-31T19:51:07.871000+00:00",
        "started_at": "2026-10-31T19:50:32.871000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 9
    },
    "… 20 more"
  ],
  "unranked_game_entries": [
    {
      "content": {
        "id": "<id:2>",
        "author_id": "<userId:2>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-11-01T11:01:03.732000+00:00",
        "started_at": "2026-11-01T10:27:52.732000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 2
    },
    {
      "content": {
        "id": "<id:3>",
        "author_id": "<userId:3>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-30T22:14:25.545000+00:00",
        "started_at": "2026-10-30T21:46:03.545000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 3
    },
    {
      "content": {
        "id": "<id:6>",
        "author_id": "<userId:6>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-31T19:51:07.871000+00:00",
        "started_at": "2026-10-31T19:50:32.871000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 9
    },
    {
      "content": {
        "id": "<id:7>",
        "author_id": "<userId:7>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-29T16:20:14.728000+00:00",
        "started_at": "2026-10-29T16:02:07.728000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 10
    },
    {
      "content": {
        "id": "<id:8>",
        "author_id": "<userId:6>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-28T19:31:21.274000+00:00",
        "started_at": "2026-10-28T17:00:35.274000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 11
    },
    {
      "content": {
        "id": "<id:9>",
        "author_id": "<userId:6>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-28T19:20:54.121000+00:00",
        "started_at": "2026-10-28T19:04:41.121000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 12
    },
    "… 15 more"
  ],
  "entries_hash": 0,
  "expired_at": "2026-11-13T04:57:11.648000+00:00",
  "refresh_stale_inbox_after_ms": 30000,
  "refresh_token": "<token>",
  "wait_ms_until_next_fetch": 450154
}
```

**runs/inspect/20261030T222341_<name:1>**, step 2: snapshot: 200, 902 ms

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
  "request_id": "575a89faed7f4ea3aa30295cf6766b89",
  "entries": [
    {
      "content": {
        "id": "<id:3>",
        "author_id": "<userId:3>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-30T22:14:25.545000+00:00",
        "started_at": "2026-10-30T21:46:03.545000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 1
    },
    {
      "content": {
        "id": "<id:10>",
        "author_id": "<userId:8>",
        "author_type": 1,
        "content_type": 6,
        "traits": "(4 items)",
        "extra": "(3 fields)",
        "original_id": "<id:4>",
        "participants": "(1 items)",
        "signature": "(3 fields)"
      },
      "rank": 2
    },
    {
      "content": {
        "id": "<id:11>",
        "author_id": "<userId:9>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-19T23:24:39.381000+00:00",
        "started_at": "2026-10-19T22:36:50.381000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 3
    },
    {
      "content": {
        "id": "<id:12>",
        "author_id": "<userId:9>",
        "author_type": 1,
        "content_type": 8,
        "traits": "(2 items)",
        "extra": "(3 fields)",
        "participants": "(1 items)",
        "signature": "(3 fields)"
      },
      "rank": 4
    },
    {
      "content": {
        "id": "<id:13>",
        "author_id": "<userId:10>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-18T19:59:48.439000+00:00",
        "started_at": "2026-10-18T18:41:40.439000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 5
    },
    {
      "content": {
        "id": "<id:14>",
        "author_id": "<userId:11>",
        "author_type": 1,
        "content_type": 6,
        "traits": "(4 items)",
        "extra": "(3 fields)",
        "original_id": "<id:5>",
        "participants": "(1 items)",
        "signature": "(3 fields)"
      },
      "rank": 6
    },
    "… 4 more"
  ],
  "unranked_game_entries": [
    {
      "content": {
        "id": "<id:3>",
        "author_id": "<userId:3>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-30T22:14:25.545000+00:00",
        "started_at": "2026-10-30T21:46:03.545000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 1
    },
    {
      "content": {
        "id": "<id:11>",
        "author_id": "<userId:9>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-19T23:24:39.381000+00:00",
        "started_at": "2026-10-19T22:36:50.381000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 3
    },
    {
      "content": {
        "id": "<id:13>",
        "author_id": "<userId:10>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-18T19:59:48.439000+00:00",
        "started_at": "2026-10-18T18:41:40.439000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 5
    },
    {
      "content": {
        "id": "<id:15>",
        "author_id": "<userId:12>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(3 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-19T07:44:24.248000+00:00",
        "started_at": "2026-10-19T06:06:21.248000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 7
    },
    {
      "content": {
        "id": "<id:16>",
        "author_id": "<userId:12>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-13T04:20:12.635000+00:00",
        "started_at": "2026-10-13T04:15:37.635000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 9
    },
    {
      "content": {
        "id": "<id:17>",
        "author_id": "<userId:3>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(3 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-30T21:46:03.205000+00:00",
        "started_at": "2026-10-30T21:45:45.205000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 11
    }
  ],
  "entries_hash": 0,
  "expired_at": "2026-10-30T22:37:11.648000+00:00",
  "refresh_stale_inbox_after_ms": 30000,
  "refresh_token": "<token>",
  "wait_ms_until_next_fetch": 690169
}
```

**runs/inspect/20261028T065202_<name:1>**, step 1: goto /channels/@me/<id>: 200, 640 ms

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
  "request_id": "6c53894605f44525b08fe3c4dba2bf96",
  "entries": [
    {
      "content": {
        "id": "<id:18>",
        "author_id": "<userId:8>",
        "author_type": 1,
        "content_type": 6,
        "traits": "(4 items)",
        "extra": "(3 fields)",
        "original_id": "<id:6>",
        "participants": "(1 items)",
        "signature": "(3 fields)"
      },
      "rank": 1
    },
    {
      "content": {
        "id": "<id:11>",
        "author_id": "<userId:9>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-19T23:24:39.381000+00:00",
        "started_at": "2026-10-19T22:36:50.381000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 2
    },
    {
      "content": {
        "id": "<id:19>",
        "author_id": "<userId:9>",
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
        "id": "<id:20>",
        "author_id": "<userId:11>",
        "author_type": 1,
        "content_type": 6,
        "traits": "(4 items)",
        "extra": "(3 fields)",
        "original_id": "<id:7>",
        "participants": "(1 items)",
        "signature": "(3 fields)"
      },
      "rank": 4
    },
    {
      "content": {
        "id": "<id:15>",
        "author_id": "<userId:12>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(3 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-19T07:44:24.248000+00:00",
        "started_at": "2026-10-19T06:06:21.248000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 5
    },
    {
      "content": {
        "id": "<id:21>",
        "author_id": "<userId:3>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-25T02:20:40.602000+00:00",
        "started_at": "2026-10-25T00:36:34.602000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 6
    },
    "… 3 more"
  ],
  "unranked_game_entries": [
    {
      "content": {
        "id": "<id:11>",
        "author_id": "<userId:9>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-19T23:24:39.381000+00:00",
        "started_at": "2026-10-19T22:36:50.381000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 2
    },
    {
      "content": {
        "id": "<id:15>",
        "author_id": "<userId:12>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(3 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-19T07:44:24.248000+00:00",
        "started_at": "2026-10-19T06:06:21.248000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 5
    },
    {
      "content": {
        "id": "<id:21>",
        "author_id": "<userId:3>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-25T02:20:40.602000+00:00",
        "started_at": "2026-10-25T00:36:34.602000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 6
    },
    {
      "content": {
        "id": "<id:16>",
        "author_id": "<userId:12>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(2 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-13T04:20:12.635000+00:00",
        "started_at": "2026-10-13T04:15:37.635000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 8
    },
    {
      "content": {
        "id": "<id:22>",
        "author_id": "<userId:3>",
        "author_type": 1,
        "content_type": 1,
        "traits": "(3 items)",
        "extra": "(4 fields)",
        "participants": "(1 items)",
        "ended_at": "2026-10-25T00:36:33.163000+00:00",
        "started_at": "2026-10-25T00:35:39.163000+00:00",
        "signature": "(3 fields)"
      },
      "rank": 10
    }
  ],
  "entries_hash": 0,
  "expired_at": "2026-10-28T07:07:11.648000+00:00",
  "refresh_stale_inbox_after_ms": 30000,
  "refresh_token": "<token>",
  "wait_ms_until_next_fetch": 891067
}
```

<!-- facts:end -->

## What it does

Fetches the account's activity feed inventory (what friends played or listened to) for the Active Now panel.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
