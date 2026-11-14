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
| Called from | `runs/inspect/20261113T231616_deepman2/script3.js:232 625075`, `runs/inspect/20261113T231616_deepman2/script3.js:124 559868`, `runs/inspect/20261113T231616_deepman2/script3.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_a0da06fe3cf3d556f23b404bd4600cccf9a423e2ea3662cd4232ca302fbdf0b8` |

Seen 14 time(s) in 12 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 372 ms | 11822 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 631 ms | 6802 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 438 ms | 9552 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 382 ms | 8662 ms | — |
| inspect | step 1: goto /login | 7 | 200 | 215–2629 ms | 11677–1045990 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 535 ms | 48899 ms | — |
| inspect | step 6: wait 45s | 1 | 200 | 343 ms | 22395 ms | — |
| inspect | step 1: goto /channels/@me | 1 | 200 | 237 ms | 2245 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T231616_deepman2**, step 6: wait 45s: 200, 343 ms

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
      "(14 fields)"
    ],
    "start_date": "2026-11-04T16:30:00+00:00",
    "end_date": "2026-11-18T17:00:00+00:00",
    "flags": 1537,
    "country_list_mode": "blocklist",
    "promotion_type": 5,
    "metadata": {
      "premium_promotion": "(2 fields)"
    },
    "priority": 75
  },
  {
    "id": "<id:2>",
    "marketing_components": [],
    "start_date": "2026-11-01T07:00:00+00:00",
    "end_date": "2026-12-01T07:00:00+00:00",
    "outbound_title": "SteelSeries",
    "outbound_redemption_page_link": "https://steelseries.com",
    "flags": 65,
    "allowed_countries": [
      "AT",
      "AU",
      "IE",
      "PL",
      "RO",
      "PT",
      "… 30 more"
    ],
    "country_list_mode": "allowlist",
    "partner_id": "steelseries",
    "promotion_type": 7,
    "priority": null
  },
  {
    "id": "<id:3>",
    "marketing_components": [],
    "start_date": "2026-11-01T07:00:00+00:00",
    "end_date": "2026-12-01T07:00:00+00:00",
    "outbound_title": "Logitech G",
    "outbound_redemption_page_link": "https://www.logitechg.com",
    "flags": 65,
    "allowed_countries": [
      "AT",
      "IE",
      "PL",
      "RO",
      "PT",
      "MX",
      "… 26 more"
    ],
    "country_list_mode": "allowlist",
    "partner_id": "logitech",
    "promotion_type": 7,
    "priority": null
  },
  {
    "id": "<id:4>",
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
    "id": "<id:5>",
    "marketing_components": [],
    "start_date": "2026-09-11T05:00:00+00:00",
    "end_date": "2028-09-11T05:00:00+00:00",
    "outbound_title": "YouTube",
    "outbound_redemption_modal_body": "YouTube",
    "outbound_terms_and_conditions": "YouTube",
    "outbound_redemption_page_link": "https://www.youtube.com/redeem",
    "flags": 15,
    "allowed_countries": [
      "TW",
      "AU",
      "AR",
      "AT",
      "TR",
      "PH",
      "… 27 more"
    ],
    "country_list_mode": "allowlist",
    "partner_id": "youtube",
    "promotion_type": 4,
    "priority": null
  },
  {
    "id": "<id:6>",
    "marketing_components": [],
    "start_date": "2026-04-01T07:00:00+00:00",
    "end_date": "2029-04-01T07:00:00+00:00",
    "outbound_redemption_end_date": "2029-04-01T07:00:00+00:00",
    "outbound_title": "Logitech 5%",
    "outbound_redemption_modal_body": "New Logitech promo",
    "outbound_terms_and_conditions": "T&C",
    "outbound_redemption_page_link": "https://www.logitechg.com/",
    "flags": 77,
    "allowed_countries": [
      "AT",
      "IE",
      "PL",
      "RO",
      "PT",
      "IT",
      "… 26 more"
    ],
    "country_list_mode": "allowlist",
    "partner_id": "logitech",
    "promotion_type": 4,
    "priority": null
  },
  "… 1 more"
]
```

**runs/inspect/20261111T233723_deepman2**, step 1: goto /login: 200, 254 ms

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
      "(14 fields)"
    ],
    "start_date": "2026-11-04T16:30:00+00:00",
    "end_date": "2026-11-18T17:00:00+00:00",
    "flags": 1537,
    "country_list_mode": "blocklist",
    "promotion_type": 5,
    "metadata": {
      "premium_promotion": "(2 fields)"
    },
    "priority": 75
  },
  {
    "id": "<id:2>",
    "marketing_components": [],
    "start_date": "2026-11-01T07:00:00+00:00",
    "end_date": "2026-12-01T07:00:00+00:00",
    "outbound_title": "SteelSeries",
    "outbound_redemption_page_link": "https://steelseries.com",
    "flags": 65,
    "allowed_countries": [
      "HK",
      "RO",
      "LU",
      "LT",
      "JP",
      "HU",
      "… 30 more"
    ],
    "country_list_mode": "allowlist",
    "partner_id": "steelseries",
    "promotion_type": 7,
    "priority": null
  },
  {
    "id": "<id:3>",
    "marketing_components": [],
    "start_date": "2026-11-01T07:00:00+00:00",
    "end_date": "2026-12-01T07:00:00+00:00",
    "outbound_title": "Logitech G",
    "outbound_redemption_page_link": "https://www.logitechg.com",
    "flags": 65,
    "allowed_countries": [
      "RO",
      "LU",
      "LT",
      "LV",
      "HU",
      "JP",
      "… 26 more"
    ],
    "country_list_mode": "allowlist",
    "partner_id": "logitech",
    "promotion_type": 7,
    "priority": null
  },
  {
    "id": "<id:4>",
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
    "id": "<id:5>",
    "marketing_components": [],
    "start_date": "2026-09-11T05:00:00+00:00",
    "end_date": "2028-09-11T05:00:00+00:00",
    "outbound_title": "YouTube",
    "outbound_redemption_modal_body": "YouTube",
    "outbound_terms_and_conditions": "YouTube",
    "outbound_redemption_page_link": "https://www.youtube.com/redeem",
    "flags": 15,
    "allowed_countries": [
      "HK",
      "TR",
      "TW",
      "TH",
      "JP",
      "VN",
      "… 27 more"
    ],
    "country_list_mode": "allowlist",
    "partner_id": "youtube",
    "promotion_type": 4,
    "priority": null
  },
  {
    "id": "<id:6>",
    "marketing_components": [],
    "start_date": "2026-04-01T07:00:00+00:00",
    "end_date": "2029-04-01T07:00:00+00:00",
    "outbound_redemption_end_date": "2029-04-01T07:00:00+00:00",
    "outbound_title": "Logitech 5%",
    "outbound_redemption_modal_body": "New Logitech promo",
    "outbound_terms_and_conditions": "T&C",
    "outbound_redemption_page_link": "https://www.logitechg.com/",
    "flags": 77,
    "allowed_countries": [
      "RO",
      "LU",
      "LT",
      "JP",
      "HU",
      "LV",
      "… 26 more"
    ],
    "country_list_mode": "allowlist",
    "partner_id": "logitech",
    "promotion_type": 4,
    "priority": null
  },
  "… 1 more"
]
```

**runs/inspect/20261109T192314_deepman2**, step 1: goto /channels/@me: 200, 237 ms

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
      "(14 fields)"
    ],
    "start_date": "2026-11-04T16:30:00+00:00",
    "end_date": "2026-11-18T17:00:00+00:00",
    "flags": 1537,
    "country_list_mode": "blocklist",
    "promotion_type": 5,
    "metadata": {
      "premium_promotion": "(2 fields)"
    },
    "priority": 75
  },
  {
    "id": "<id:2>",
    "marketing_components": [],
    "start_date": "2026-11-01T07:00:00+00:00",
    "end_date": "2026-12-01T07:00:00+00:00",
    "outbound_title": "SteelSeries",
    "outbound_redemption_page_link": "https://steelseries.com",
    "flags": 65,
    "allowed_countries": [
      "JP",
      "FR",
      "BG",
      "BE",
      "FI",
      "DK",
      "… 30 more"
    ],
    "country_list_mode": "allowlist",
    "partner_id": "steelseries",
    "promotion_type": 7,
    "priority": null
  },
  {
    "id": "<id:3>",
    "marketing_components": [],
    "start_date": "2026-11-01T07:00:00+00:00",
    "end_date": "2026-12-01T07:00:00+00:00",
    "outbound_title": "Logitech G",
    "outbound_redemption_page_link": "https://www.logitechg.com",
    "flags": 65,
    "allowed_countries": [
      "JP",
      "FR",
      "BG",
      "BE",
      "FI",
      "DK",
      "… 26 more"
    ],
    "country_list_mode": "allowlist",
    "partner_id": "logitech",
    "promotion_type": 7,
    "priority": null
  },
  {
    "id": "<id:4>",
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
    "id": "<id:5>",
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
      "FR",
      "BE",
      "UA",
      "MX",
      "FI",
      "… 27 more"
    ],
    "country_list_mode": "allowlist",
    "partner_id": "youtube",
    "promotion_type": 4,
    "priority": null
  },
  {
    "id": "<id:6>",
    "marketing_components": [],
    "start_date": "2026-04-01T07:00:00+00:00",
    "end_date": "2029-04-01T07:00:00+00:00",
    "outbound_redemption_end_date": "2029-04-01T07:00:00+00:00",
    "outbound_title": "Logitech 5%",
    "outbound_redemption_modal_body": "New Logitech promo",
    "outbound_terms_and_conditions": "T&C",
    "outbound_redemption_page_link": "https://www.logitechg.com/",
    "flags": 77,
    "allowed_countries": [
      "JP",
      "FR",
      "BG",
      "BE",
      "MX",
      "FI",
      "… 26 more"
    ],
    "country_list_mode": "allowlist",
    "partner_id": "logitech",
    "promotion_type": 4,
    "priority": null
  },
  "… 1 more"
]
```

<!-- facts:end -->

## What it does

Lists the promotions the account may be shown.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
