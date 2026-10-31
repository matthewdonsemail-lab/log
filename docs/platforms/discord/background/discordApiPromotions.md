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
| Called from | `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1.js:208 app_store_parental_revocation`, `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1036.js:1 parse`, `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1221.js:2 anonymous`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1245.js:2 anonymous` |
| rea | `ev_16a96b33771007173e65ccc52dee395b3f36dbd19123270484281f1912ba77b0` |

Seen 6 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 372 ms | 11822 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 631 ms | 6802 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 438 ms | 9552 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 382 ms | 8662 ms | — |
| inspect | step 1: goto /login | 1 | 200 | 408 ms | 11677 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 535 ms | 48899 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder**, step 2: snapshot: 200, 535 ms

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
    "id": "1554628839802667048",
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
    "id": "1550247125034598460",
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
    "id": "1548052773751361596",
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

**runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder**, step 1: goto /login: 200, 408 ms

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
    "id": "1554628839802667048",
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
    "id": "1550247125034598460",
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
    "id": "1548052773751361596",
    "marketing_components": [],
    "start_date": "2026-09-11T05:00:00+00:00",
    "end_date": "2028-09-11T05:00:00+00:00",
    "outbound_title": "YouTube",
    "outbound_redemption_modal_body": "YouTube",
    "outbound_terms_and_conditions": "YouTube",
    "outbound_redemption_page_link": "https://www.youtube.com/redeem",
    "flags": 15,
    "allowed_countries": [
      "AT",
      "UA",
      "HK",
      "JP",
      "NL",
      "NO",
      "… 27 more"
    ],
    "country_list_mode": "allowlist",
    "partner_id": "youtube",
    "promotion_type": 4,
    "priority": null
  }
]
```

**runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder**, step 1: goto /channels/@me/<id>: 200, 372 ms

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
    "id": "1554628839802667048",
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
    "id": "1550247125034598460",
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
    "id": "1548052773751361596",
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
