# discordApiUsersMeBillingUserOffer

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/users/@me/billing/user-offer` |
| Sends | `allow_triggers` |
| Reads | `user_trial_offer`, `user_discount_offer.id`, `user_discount_offer.user_id`, `user_discount_offer.discount_id`, `user_discount_offer.applied_at`, `user_discount_offer.expires_at`, `user_discount_offer.discount`, `user_discount` |
| Called from | `runs/inspect/20261113T141543_<name:1>/script1.js:232 625075`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 559868`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 961943`, `runs/inspect/20261113T141543_<name:1>/script1294.js:1 634654` |
| rea | `ev_a9fa69c7432fa1fcc41058ba491790444cfcec72f4c96150b3d2566a4e5def67` |

Seen 8 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 452 ms | 11810 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 456 ms | 12896 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 442 ms | 9543 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 407 ms | 8653 ms | — |
| inspect | step 1: goto /login | 3 | 200, 204 | 386–410 ms | 18482–1052568 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 404 ms | 51730 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T141543_<name:1>**, step 1: goto /login: 204, 410 ms

Sent:

```json
{
  "allow_triggers": true
}
```

Answered:

```json
null
```

**runs/inspect/20261030T222341_<name:1>**, step 2: snapshot: 200, 404 ms

Sent:

```json
{
  "allow_triggers": true
}
```

Answered:

```json
{
  "user_trial_offer": null,
  "user_discount_offer": {
    "id": "<id:1>",
    "user_id": "<userId:1>",
    "discount_id": "1215366184820539392",
    "applied_at": null,
    "expires_at": "2026-11-02T19:32:04.567388+00:00",
    "discount": {
      "id": "<id:2>",
      "amount": 40,
      "starts_at": null,
      "ends_at": null,
      "status": 2,
      "created_at": "2024-03-08T00:31:36.995388+00:00",
      "sku_ids": null,
      "sku_group_ids": null,
      "plan_ids": [
        "511651880837840896"
      ],
      "user_usage_limit_interval": 3,
      "user_usage_limit_interval_count": 1,
      "user_usage_limit": 1
    }
  },
  "user_discount": null
}
```

**runs/inspect/20261028T065202_<name:1>**, step 1: goto /channels/@me/<id>: 200, 452 ms

Sent:

```json
{
  "allow_triggers": true
}
```

Answered:

```json
{
  "user_trial_offer": null,
  "user_discount_offer": {
    "id": "<id:1>",
    "user_id": "<userId:1>",
    "discount_id": "1215366184820539392",
    "applied_at": null,
    "expires_at": "2026-11-02T19:32:04.567388+00:00",
    "discount": {
      "id": "<id:2>",
      "amount": 40,
      "starts_at": null,
      "ends_at": null,
      "status": 2,
      "created_at": "2024-03-08T00:31:36.995388+00:00",
      "sku_ids": null,
      "sku_group_ids": null,
      "plan_ids": [
        "511651880837840896"
      ],
      "user_usage_limit_interval": 3,
      "user_usage_limit_interval_count": 1,
      "user_usage_limit": 1
    }
  },
  "user_discount": null
}
```

<!-- facts:end -->

## What it does

Asks which Nitro offer the account may be shown.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
