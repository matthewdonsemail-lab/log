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
| Called from | `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1.js:208 app_store_parental_revocation`, `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1036.js:1 parse`, `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1221.js:2 anonymous`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1245.js:2 anonymous` |
| rea | `ev_e990004e4a667cfe60975ac207aae3431a537ae2d0b6995a17ea941f94caf824` |

Seen 6 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 452 ms | 11810 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 456 ms | 12896 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 442 ms | 9543 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 407 ms | 8653 ms | — |
| inspect | step 1: goto /login | 1 | 200 | 386 ms | 18482 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 404 ms | 51730 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder**, step 2: snapshot: 200, 404 ms

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
    "id": "1511280910626980021",
    "user_id": "1434443116663930960",
    "discount_id": "1215366184820539392",
    "applied_at": null,
    "expires_at": "2026-11-02T19:32:04.567388+00:00",
    "discount": {
      "id": "1215366184820539392",
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

**runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder**, step 1: goto /login: 200, 386 ms

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
    "id": "1511280910626980021",
    "user_id": "1434443116663930960",
    "discount_id": "1215366184820539392",
    "applied_at": null,
    "expires_at": "2026-11-02T19:32:04.567388+00:00",
    "discount": {
      "id": "1215366184820539392",
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

**runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder**, step 1: goto /channels/@me/<id>: 200, 452 ms

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
    "id": "1511280910626980021",
    "user_id": "1434443116663930960",
    "discount_id": "1215366184820539392",
    "applied_at": null,
    "expires_at": "2026-11-02T19:32:04.567388+00:00",
    "discount": {
      "id": "1215366184820539392",
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
