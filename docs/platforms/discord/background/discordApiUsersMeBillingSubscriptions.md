# discordApiUsersMeBillingSubscriptions

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/users/@me/billing/subscriptions` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261114T184328_deepman2/script0.js:232 625075`, `runs/inspect/20261114T184328_deepman2/script0.js:124 559868`, `runs/inspect/20261114T184328_deepman2/script0.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_f6daff8038b4f477b27b852e31fc1f2f76f7dd725b1883891e74b824ed6f0ac3` |

Seen 10 time(s) in 8 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 8: click e221 | 2 | 200 | 415–763 ms | 1822–1824 ms | — |
| inspect | step 6: wait 45s | 1 | 200 | 240 ms | 25500 ms | — |
| inspect | step 1: goto /login | 5 | 200 | 170–225 ms | 28852–140824 ms | — |
| inspect | step 1: goto /channels/@me | 1 | 200 | 221 ms | 4499 ms | — |
| inspect | step 9: wait 45s | 1 | 200 | 229 ms | 16555 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261114T184328_deepman2**, step 9: wait 45s: 200, 229 ms

Sent:

```json
{
  "query": {
    "include_inactive": "true",
    "limit": "2",
    "exclude_unpaid_statuses": "true",
    "subscription_type": "1"
  },
  "body": null
}
```

Answered:

```json
[
  {
    "id": "<id:1>",
    "type": 1,
    "created_at": "2021-01-09T18:23:59.532219+00:00",
    "canceled_at": null,
    "current_period_start": "2021-02-09T18:23:59.532140+00:00",
    "current_period_end": "2021-03-09T18:23:59.532140+00:00",
    "status": 4,
    "payment_source_id": null,
    "payment_gateway": null,
    "payment_gateway_plan_id": "premium_month_tier_2",
    "payment_gateway_subscription_id": null,
    "items": [
      {
        "id": "<id:2>",
        "plan_id": "511651880837840896",
        "quantity": 1
      }
    ],
    "currency": "usd",
    "country_code": null,
    "user_id": "<userId:1>",
    "pause_ends_at": null,
    "pause_reason": null,
    "use_storekit_resubscribe": false,
    "price": null
  },
  {
    "id": "<id:3>",
    "type": 1,
    "created_at": "2020-11-30T17:17:53.954240+00:00",
    "canceled_at": null,
    "current_period_start": "2020-12-30T17:17:53.954122+00:00",
    "current_period_end": "2021-01-30T17:17:53.954122+00:00",
    "status": 4,
    "payment_source_id": null,
    "payment_gateway": null,
    "payment_gateway_plan_id": "premium_month_tier_2",
    "payment_gateway_subscription_id": null,
    "items": [
      {
        "id": "<id:4>",
        "plan_id": "511651880837840896",
        "quantity": 1
      }
    ],
    "currency": "usd",
    "country_code": null,
    "user_id": "<userId:1>",
    "pause_ends_at": null,
    "pause_reason": null,
    "use_storekit_resubscribe": false,
    "price": null
  }
]
```

**runs/inspect/20261113T231616_deepman2**, step 6: wait 45s: 200, 240 ms

Sent:

```json
{
  "query": {
    "include_inactive": "true",
    "limit": "2",
    "exclude_unpaid_statuses": "true",
    "subscription_type": "1"
  },
  "body": null
}
```

Answered:

```json
[
  {
    "id": "<id:1>",
    "type": 1,
    "created_at": "2021-01-09T18:23:59.532219+00:00",
    "canceled_at": null,
    "current_period_start": "2021-02-09T18:23:59.532140+00:00",
    "current_period_end": "2021-03-09T18:23:59.532140+00:00",
    "status": 4,
    "payment_source_id": null,
    "payment_gateway": null,
    "payment_gateway_plan_id": "premium_month_tier_2",
    "payment_gateway_subscription_id": null,
    "items": [
      {
        "id": "<id:2>",
        "plan_id": "511651880837840896",
        "quantity": 1
      }
    ],
    "currency": "usd",
    "country_code": null,
    "user_id": "<userId:1>",
    "pause_ends_at": null,
    "pause_reason": null,
    "use_storekit_resubscribe": false,
    "price": null
  },
  {
    "id": "<id:3>",
    "type": 1,
    "created_at": "2020-11-30T17:17:53.954240+00:00",
    "canceled_at": null,
    "current_period_start": "2020-12-30T17:17:53.954122+00:00",
    "current_period_end": "2021-01-30T17:17:53.954122+00:00",
    "status": 4,
    "payment_source_id": null,
    "payment_gateway": null,
    "payment_gateway_plan_id": "premium_month_tier_2",
    "payment_gateway_subscription_id": null,
    "items": [
      {
        "id": "<id:4>",
        "plan_id": "511651880837840896",
        "quantity": 1
      }
    ],
    "currency": "usd",
    "country_code": null,
    "user_id": "<userId:1>",
    "pause_ends_at": null,
    "pause_reason": null,
    "use_storekit_resubscribe": false,
    "price": null
  }
]
```

**runs/inspect/20261111T233723_deepman2**, step 1: goto /login: 200, 222 ms

Sent:

```json
{
  "query": {
    "include_inactive": "true",
    "limit": "2",
    "exclude_unpaid_statuses": "true",
    "subscription_type": "1"
  },
  "body": null
}
```

Answered:

```json
[
  {
    "id": "<id:1>",
    "type": 1,
    "created_at": "2021-01-09T18:23:59.532219+00:00",
    "canceled_at": null,
    "current_period_start": "2021-02-09T18:23:59.532140+00:00",
    "current_period_end": "2021-03-09T18:23:59.532140+00:00",
    "status": 4,
    "payment_source_id": null,
    "payment_gateway": null,
    "payment_gateway_plan_id": "premium_month_tier_2",
    "payment_gateway_subscription_id": null,
    "items": [
      {
        "id": "<id:2>",
        "plan_id": "511651880837840896",
        "quantity": 1
      }
    ],
    "currency": "usd",
    "country_code": null,
    "user_id": "<userId:1>",
    "pause_ends_at": null,
    "pause_reason": null,
    "use_storekit_resubscribe": false,
    "price": null
  },
  {
    "id": "<id:3>",
    "type": 1,
    "created_at": "2020-11-30T17:17:53.954240+00:00",
    "canceled_at": null,
    "current_period_start": "2020-12-30T17:17:53.954122+00:00",
    "current_period_end": "2021-01-30T17:17:53.954122+00:00",
    "status": 4,
    "payment_source_id": null,
    "payment_gateway": null,
    "payment_gateway_plan_id": "premium_month_tier_2",
    "payment_gateway_subscription_id": null,
    "items": [
      {
        "id": "<id:4>",
        "plan_id": "511651880837840896",
        "quantity": 1
      }
    ],
    "currency": "usd",
    "country_code": null,
    "user_id": "<userId:1>",
    "pause_ends_at": null,
    "pause_reason": null,
    "use_storekit_resubscribe": false,
    "price": null
  }
]
```

<!-- facts:end -->

## What it does

Lists the account's subscriptions (Nitro, server subscriptions).

## What our machine does with it

Never used; nothing is bought (rule 41).

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
