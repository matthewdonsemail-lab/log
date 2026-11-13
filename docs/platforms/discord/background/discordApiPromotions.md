# discordApiPromotions

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/promotions` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261113T141543_<name:1>/script1.js:232 625075`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 559868`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 961943`, `runs/inspect/20261113T141543_<name:1>/script1294.js:1 634654` |
| rea | `ev_a9fa69c7432fa1fcc41058ba491790444cfcec72f4c96150b3d2566a4e5def67` |

Seen 8 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 372 ms | 11822 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 631 ms | 6802 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 438 ms | 9552 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 382 ms | 8662 ms | — |
| inspect | step 1: goto /login | 3 | 200 | 408–2629 ms | 11677–1045990 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 535 ms | 48899 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T141543_<name:1>**, step 1: goto /login: 200, 460 ms

Sent:

```json
{
  "query": {
    "locale": "en-US",
    "platform": "0"
  },
  "body": null
}
```

Answered:

```json
[
  {
    "id": "<id:1>",
    "marketing_components": [
      {
        "id": "<id:2>",
        "promotion_id": "1554628839802667048",
        "premium_offer_type": 0,
        "premium_type": null,
        "premium_source": null,
        "premium_subscription_type": null,
        "component_type": 26,
        "theme": 0,
        "experiment_id": null,
        "experiment_variation_id": null,
        "ready": true,
        "properties": "+gGXAwqUAwpjaHR0cHM6Ly9jZG4uZGlzY29yZGFwcC5jb20vcHJvbW90aW9ucy9wcmVtaXVtLW1hcmtldGluZy8xNTYyNTIwNzkzNjkzMjkwNTg4LzE1NjI1MjEyMjk2MTU2OTgxMTEucG5nEmNodHRwczovL2Nkbi5kaXNjb3JkYXBwLmNvbS9wcm9tb3Rpb25zL3ByZW1pdW0tbWFya2V0aW5nLzE1NjI1MjA3OTM2OTMyOTA1ODgvMTU2MjUyMTIxOTc1MDk2MTE5Mi5wbmcaY2h0dHBzOi8vY2RuLmRpc2NvcmRhcHAuY29tL3Byb21vdGlvbnMvcHJlbWl1bS1tYXJrZXRpbmcvMTU2MjUyMDc5MzY5MzI5MDU4OC8xNTYyNTIxMjM1MTYw… (548 chars)",
        "start_date": null,
        "end_date": null
      },
      {
        "id": "<id:3>",
        "promotion_id": "1554628839802667048",
        "premium_offer_type": 0,
        "premium_type": null,
        "premium_source": null,
        "premium_subscription_type": null,
        "component_type": 23,
        "theme": 0,
        "experiment_id": null,
        "experiment_variation_id": null,
        "ready": true,
        "properties": "4gGXAwqUAwpjaHR0cHM6Ly9jZG4uZGlzY29yZGFwcC5jb20vcHJvbW90aW9ucy9wcmVtaXVtLW1hcmtldGluZy8xNTYyMjEyODk0NzgxNzM0OTcyLzE1NjI1MjA2NjIzNjU1NjkwNTUucG5nEmNodHRwczovL2Nkbi5kaXNjb3JkYXBwLmNvbS9wcm9tb3Rpb25zL3ByZW1pdW0tbWFya2V0aW5nLzE1NjIyMTI4OTQ3ODE3MzQ5NzIvMTU2MjUyMDY1MDI2NTAxMDI3Ny5wbmcaY2h0dHBzOi8vY2RuLmRpc2NvcmRhcHAuY29tL3Byb21vdGlvbnMvcHJlbWl1bS1tYXJrZXRpbmcvMTU2MjIxMjg5NDc4MTczNDk3Mi8xNTYyNTIwNjY3MTM4… (548 chars)",
        "start_date": null,
        "end_date": null
      },
      {
        "id": "<id:4>",
        "promotion_id": "1554628839802667048",
        "premium_offer_type": 0,
        "premium_type": null,
        "premium_source": null,
        "premium_subscription_type": null,
        "component_type": 24,
        "theme": 0,
        "experiment_id": null,
        "experiment_variation_id": null,
        "ready": true,
        "properties": "6gGXAwqUAwpjaHR0cHM6Ly9jZG4uZGlzY29yZGFwcC5jb20vcHJvbW90aW9ucy9wcmVtaXVtLW1hcmtldGluZy8xNTYyNTIwODI4ODU0MTQwOTc4LzE1NjI1MjEzNjI2MjU1OTc0NjAucG5nEmNodHRwczovL2Nkbi5kaXNjb3JkYXBwLmNvbS9wcm9tb3Rpb25zL3ByZW1pdW0tbWFya2V0aW5nLzE1NjI1MjA4Mjg4NTQxNDA5NzgvMTU2MjUyMTM1Mjg2OTc3MzQxMi5wbmcaY2h0dHBzOi8vY2RuLmRpc2NvcmRhcHAuY29tL3Byb21vdGlvbnMvcHJlbWl1bS1tYXJrZXRpbmcvMTU2MjUyMDgyODg1NDE0MDk3OC8xNTYyNTIxMzY3MzI3… (548 chars)",
        "start_date": null,
        "end_date": null
      },
      {
        "id": "<id:5>",
        "promotion_id": "1554628839802667048",
        "premium_offer_type": 0,
        "premium_type": null,
        "premium_source": null,
        "premium_subscription_type": null,
        "component_type": 25,
        "theme": 0,
        "experiment_id": null,
        "experiment_variation_id": null,
        "ready": true,
        "properties": "8gGXAwqUAwpjaHR0cHM6Ly9jZG4uZGlzY29yZGFwcC5jb20vcHJvbW90aW9ucy9wcmVtaXVtLW1hcmtldGluZy8xNTYyNTIwNzYyNTI5ODgyMTUyLzE1NjI1MjEwOTgxNjYyMDY0NjQucG5nEmNodHRwczovL2Nkbi5kaXNjb3JkYXBwLmNvbS9wcm9tb3Rpb25zL3ByZW1pdW0tbWFya2V0aW5nLzE1NjI1MjA3NjI1Mjk4ODIxNTIvMTU2MjUyMTA5MjMxNTE1NjYwMC5wbmcaY2h0dHBzOi8vY2RuLmRpc2NvcmRhcHAuY29tL3Byb21vdGlvbnMvcHJlbWl1bS1tYXJrZXRpbmcvMTU2MjUyMDc2MjUyOTg4MjE1Mi8xNTYyNTIxMTAyNjAz… (548 chars)",
        "start_date": null,
        "end_date": null
      }
    ],
    "start_date": "2026-10-21T20:54:15.400000+00:00",
    "end_date": "2027-08-07T04:59:00+00:00",
    "outbound_redemption_end_date": "2027-08-07T04:59:00+00:00",
    "outbound_title": "Nitro Blueprint Weapon",
    "outbound_redemption_modal_body": "Nitro Blueprint Weapon",
    "outbound_terms_and_conditions": "Nitro Blueprint Weapon",
    "outbound_redemption_page_link": "https://www.callofduty.com/redeem",
    "flags": 13,
    "country_list_mode": "blocklist",
    "partner_id": "call_of_duty",
    "promotion_type": 4,
    "priority": null
  },
  {
    "id": "<id:6>",
    "marketing_components": [],
    "start_date": "2026-09-11T05:00:00+00:00",
    "end_date": "2028-09-11T05:00:00+00:00",
    "outbound_title": "YouTube",
    "outbound_redemption_modal_body": "YouTube",
    "outbound_terms_and_conditions": "YouTube",
    "outbound_redemption_page_link": "https://www.youtube.com/redeem",
    "flags": 15,
    "allowed_countries": [
      "JP",
      "BE",
      "UA",
      "FI",
      "DK",
      "FR",
      "… 27 more"
    ],
    "country_list_mode": "allowlist",
    "partner_id": "youtube",
    "promotion_type": 4,
    "priority": null
  }
]
```

**runs/inspect/20261030T222341_<name:1>**, step 2: snapshot: 200, 535 ms

Sent:

```json
{
  "query": {
    "locale": "en-US",
    "platform": "0"
  },
  "body": null
}
```

Answered:

```json
[
  {
    "id": "<id:1>",
    "marketing_components": [
      "(14 fields)",
      "(14 fields)",
      "(14 fields)",
      "(14 fields)"
    ],
    "start_date": "2026-10-21T20:54:15.400000+00:00",
    "end_date": "2027-08-07T04:59:00+00:00",
    "outbound_redemption_end_date": "2027-08-07T04:59:00+00:00",
    "outbound_title": "Nitro Blueprint Weapon",
    "outbound_redemption_modal_body": "Nitro Blueprint Weapon",
    "outbound_terms_and_conditions": "Nitro Blueprint Weapon",
    "outbound_redemption_page_link": "https://www.callofduty.com/redeem",
    "flags": 13,
    "country_list_mode": "blocklist",
    "partner_id": "call_of_duty",
    "promotion_type": 4,
    "priority": null
  },
  {
    "id": "<id:7>",
    "marketing_components": [
      "(14 fields)",
      "(14 fields)",
      "(14 fields)",
      "(14 fields)",
      "(14 fields)",
      "(14 fields)"
    ],
    "start_date": "2026-09-23T17:00:00+00:00",
    "end_date": "2026-11-02T21:00:00+00:00",
    "flags": 513,
    "country_list_mode": "blocklist",
    "promotion_type": 6,
    "metadata": {
      "premium_promotion": "(2 fields)"
    },
    "priority": null
  },
  {
    "id": "<id:6>",
    "marketing_components": [],
    "start_date": "2026-09-11T05:00:00+00:00",
    "end_date": "2028-09-11T05:00:00+00:00",
    "outbound_title": "YouTube",
    "outbound_redemption_modal_body": "YouTube",
    "outbound_terms_and_conditions": "YouTube",
    "outbound_redemption_page_link": "https://www.youtube.com/redeem",
    "flags": 15,
    "allowed_countries": [
      "DK",
      "FI",
      "DE",
      "FR",
      "PH",
      "NL",
      "… 27 more"
    ],
    "country_list_mode": "allowlist",
    "partner_id": "youtube",
    "promotion_type": 4,
    "priority": null
  }
]
```

**runs/inspect/20261028T065202_<name:1>**, step 1: goto /channels/@me/<id>: 200, 372 ms

Sent:

```json
{
  "query": {
    "locale": "en-US",
    "platform": "0"
  },
  "body": null
}
```

Answered:

```json
[
  {
    "id": "<id:1>",
    "marketing_components": [
      "(14 fields)",
      "(14 fields)",
      "(14 fields)",
      "(14 fields)"
    ],
    "start_date": "2026-10-21T20:54:15.400000+00:00",
    "end_date": "2027-08-07T04:59:00+00:00",
    "outbound_redemption_end_date": "2027-08-07T04:59:00+00:00",
    "outbound_title": "Nitro Blueprint Weapon",
    "outbound_redemption_modal_body": "Nitro Blueprint Weapon",
    "outbound_terms_and_conditions": "Nitro Blueprint Weapon",
    "outbound_redemption_page_link": "https://www.callofduty.com/redeem",
    "flags": 13,
    "country_list_mode": "blocklist",
    "partner_id": "call_of_duty",
    "promotion_type": 4,
    "priority": null
  },
  {
    "id": "<id:7>",
    "marketing_components": [
      "(14 fields)",
      "(14 fields)",
      "(14 fields)",
      "(14 fields)",
      "(14 fields)",
      "(14 fields)"
    ],
    "start_date": "2026-09-23T17:00:00+00:00",
    "end_date": "2026-11-02T21:00:00+00:00",
    "flags": 513,
    "country_list_mode": "blocklist",
    "promotion_type": 6,
    "metadata": {
      "premium_promotion": "(2 fields)"
    },
    "priority": null
  },
  {
    "id": "<id:6>",
    "marketing_components": [],
    "start_date": "2026-09-11T05:00:00+00:00",
    "end_date": "2028-09-11T05:00:00+00:00",
    "outbound_title": "YouTube",
    "outbound_redemption_modal_body": "YouTube",
    "outbound_terms_and_conditions": "YouTube",
    "outbound_redemption_page_link": "https://www.youtube.com/redeem",
    "flags": 15,
    "allowed_countries": [
      "ID",
      "SA",
      "IT",
      "SG",
      "MX",
      "SE",
      "… 27 more"
    ],
    "country_list_mode": "allowlist",
    "partner_id": "youtube",
    "promotion_type": 4,
    "priority": null
  }
]
```

<!-- facts:end -->

## What it does

Lists the promotions the account may be shown.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
