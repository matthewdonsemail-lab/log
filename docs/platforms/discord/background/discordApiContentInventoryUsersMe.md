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
| Called from | `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:160 app_store_parental_revocation`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script892.js:1 parse`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script1090.js:2 anonymous`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:158 2242` |
| rea | `ev_88bdd6c5aae1b539b5feb9d0b6f560ae8e4c19d27151a1248184a15ffa83223a` |

Seen 4 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 640 ms | 11843 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 1160 ms | 12933 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 861 ms | 10108 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 2270 ms | 8798 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder**, step 1: goto /channels/@me/<id>: 200, 640 ms

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
        "id": "1849846687",
        "author_id": "1428510116080255090",
        "author_type": 1,
        "content_type": 6,
        "traits": "(4 items)",
        "extra": "(3 fields)",
        "original_id": "1563984923310690355",
        "participants": "(1 items)",
        "signature": "(3 fields)"
      },
      "rank": 1
    },
    {
      "content": {
        "id": "1561882806215254179",
        "author_id": "265578435571744769",
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
        "id": "1564678829379817493",
        "author_id": "265578435571744769",
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
        "id": "522896261",
        "author_id": "428660066716090378",
        "author_type": 1,
        "content_type": 6,
        "traits": "(4 items)",
        "extra": "(3 fields)",
        "original_id": "1564802577147764766",
        "participants": "(1 items)",
        "signature": "(3 fields)"
      },
      "rank": 4
    },
    {
      "content": {
        "id": "1561646183997243422",
        "author_id": "602021633494089728",
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
        "id": "1563739042514739332",
        "author_id": "197014787945791488",
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
        "id": "1561882806215254179",
        "author_id": "265578435571744769",
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
        "id": "1561646183997243422",
        "author_id": "602021633494089728",
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
        "id": "1563739042514739332",
        "author_id": "197014787945791488",
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
        "id": "1559420469814231071",
        "author_id": "602021633494089728",
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
        "id": "1563712838856343603",
        "author_id": "197014787945791488",
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
  "refresh_token": "(taken out)",
  "wait_ms_until_next_fetch": 891067
}
```

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 5: click e40: 200, 1160 ms

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
  "request_id": "e5ef0050625b4d9e874b0c7463a8c657",
  "entries": [
    {
      "content": {
        "id": "1849846687",
        "author_id": "1428510116080255090",
        "author_type": 1,
        "content_type": 6,
        "traits": "(4 items)",
        "extra": "(3 fields)",
        "original_id": "1563984923310690355",
        "participants": "(1 items)",
        "signature": "(3 fields)"
      },
      "rank": 1
    },
    {
      "content": {
        "id": "1561882806215254179",
        "author_id": "265578435571744769",
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
        "id": "1564678829379817493",
        "author_id": "265578435571744769",
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
        "id": "522896261",
        "author_id": "428660066716090378",
        "author_type": 1,
        "content_type": 6,
        "traits": "(4 items)",
        "extra": "(3 fields)",
        "original_id": "1564802577147764766",
        "participants": "(1 items)",
        "signature": "(3 fields)"
      },
      "rank": 4
    },
    {
      "content": {
        "id": "1561646183997243422",
        "author_id": "602021633494089728",
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
        "id": "1563739042514739332",
        "author_id": "197014787945791488",
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
        "id": "1561882806215254179",
        "author_id": "265578435571744769",
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
        "id": "1561646183997243422",
        "author_id": "602021633494089728",
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
        "id": "1563739042514739332",
        "author_id": "197014787945791488",
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
        "id": "1559420469814231071",
        "author_id": "602021633494089728",
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
        "id": "1563712838856343603",
        "author_id": "197014787945791488",
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
  "expired_at": "2026-10-28T06:37:11.648000+00:00",
  "refresh_stale_inbox_after_ms": 30000,
  "refresh_token": "(taken out)",
  "wait_ms_until_next_fetch": 318517
}
```

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 9: goto /channels/@me: 200, 861 ms

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
  "request_id": "cfa0152a23e34bf0876c8baa6ff6b152",
  "entries": [
    {
      "content": {
        "id": "1849846687",
        "author_id": "1428510116080255090",
        "author_type": 1,
        "content_type": 6,
        "traits": "(4 items)",
        "extra": "(3 fields)",
        "original_id": "1563984923310690355",
        "participants": "(1 items)",
        "signature": "(3 fields)"
      },
      "rank": 1
    },
    {
      "content": {
        "id": "1561882806215254179",
        "author_id": "265578435571744769",
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
        "id": "1564678829379817493",
        "author_id": "265578435571744769",
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
        "id": "522896261",
        "author_id": "428660066716090378",
        "author_type": 1,
        "content_type": 6,
        "traits": "(4 items)",
        "extra": "(3 fields)",
        "original_id": "1564802577147764766",
        "participants": "(1 items)",
        "signature": "(3 fields)"
      },
      "rank": 4
    },
    {
      "content": {
        "id": "1561646183997243422",
        "author_id": "602021633494089728",
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
        "id": "1563739042514739332",
        "author_id": "197014787945791488",
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
        "id": "1561882806215254179",
        "author_id": "265578435571744769",
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
        "id": "1561646183997243422",
        "author_id": "602021633494089728",
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
        "id": "1563739042514739332",
        "author_id": "197014787945791488",
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
        "id": "1559420469814231071",
        "author_id": "602021633494089728",
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
        "id": "1563712838856343603",
        "author_id": "197014787945791488",
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
  "expired_at": "2026-10-28T06:47:11.648000+00:00",
  "refresh_stale_inbox_after_ms": 30000,
  "refresh_token": "(taken out)",
  "wait_ms_until_next_fetch": 819630
}
```

<!-- facts:end -->

## What it does

Fetches the account's activity feed inventory (what friends played or listened to) for the Active Now panel.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
