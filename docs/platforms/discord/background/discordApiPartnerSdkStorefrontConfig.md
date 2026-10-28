# discordApiPartnerSdkStorefrontConfig

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/partner-sdk/storefront-config` |
| Sends | — |
| Reads | `promotional_sku_ids`, `promotion_end_datetime`, `storefronts`, `announcement_modal_config.version`, `announcement_modal_config.application_id` |
| Called from | `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:160 app_store_parental_revocation`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script892.js:1 parse`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script1090.js:2 anonymous`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:158 2242` |
| rea | `ev_7f22bb20e4d2a13458e209769799ebdb85d909c79dfab164e9bfbdfda9b7c3ab` |

Seen 4 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 294 ms | 11834 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 362 ms | 12918 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 435 ms | 9556 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 380 ms | 8664 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder**, step 1: goto /channels/@me/<id>: 200, 294 ms

Sent:

```json
null
```

Answered:

```json
{
  "promotional_sku_ids": [],
  "promotion_end_datetime": null,
  "storefronts": [
    {
      "guild_id": "1193841000108531764",
      "application_id": "1346069614634864772",
      "game_id": "1314395942253756416",
      "collectibles_shop_navigation_enabled": true,
      "excluded_platforms": [
        "playstation"
      ],
      "disable_mobile_account_linking": false,
      "promotion_end_datetime": "2026-09-18T18:00:00+00:00",
      "allow_orbs_spending": false
    },
    {
      "guild_id": "560127830160048128",
      "application_id": "1288512934112264234",
      "game_id": "1402418594532298837",
      "collectibles_shop_navigation_enabled": true,
      "excluded_platforms": [
        "playstation",
        "xbox"
      ],
      "disable_mobile_account_linking": true,
      "promotion_end_datetime": "2026-09-04T18:00:00+00:00",
      "allow_orbs_spending": false
    },
    {
      "guild_id": "187363008610041857",
      "application_id": "614380482620293151",
      "game_id": "1402418571715543120",
      "collectibles_shop_navigation_enabled": true,
      "excluded_platforms": [
        "amazon kids+",
        "apple arcade",
        "netflix",
        "playstation",
        "switch",
        "xbox"
      ],
      "disable_mobile_account_linking": false,
      "promotion_end_datetime": "2026-09-01T00:00:00+00:00",
      "allow_orbs_spending": false
    }
  ],
  "announcement_modal_config": {
    "version": 0,
    "application_id": 0
  }
}
```

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 5: click e40: 200, 362 ms

Sent:

```json
null
```

Answered:

```json
{
  "promotional_sku_ids": [],
  "promotion_end_datetime": null,
  "storefronts": [
    {
      "guild_id": "1193841000108531764",
      "application_id": "1346069614634864772",
      "game_id": "1314395942253756416",
      "collectibles_shop_navigation_enabled": true,
      "excluded_platforms": [
        "playstation"
      ],
      "disable_mobile_account_linking": false,
      "promotion_end_datetime": "2026-09-18T18:00:00+00:00",
      "allow_orbs_spending": false
    },
    {
      "guild_id": "560127830160048128",
      "application_id": "1288512934112264234",
      "game_id": "1402418594532298837",
      "collectibles_shop_navigation_enabled": true,
      "excluded_platforms": [
        "playstation",
        "xbox"
      ],
      "disable_mobile_account_linking": true,
      "promotion_end_datetime": "2026-09-04T18:00:00+00:00",
      "allow_orbs_spending": false
    },
    {
      "guild_id": "187363008610041857",
      "application_id": "614380482620293151",
      "game_id": "1402418571715543120",
      "collectibles_shop_navigation_enabled": true,
      "excluded_platforms": [
        "amazon kids+",
        "apple arcade",
        "netflix",
        "playstation",
        "switch",
        "xbox"
      ],
      "disable_mobile_account_linking": false,
      "promotion_end_datetime": "2026-09-01T00:00:00+00:00",
      "allow_orbs_spending": false
    }
  ],
  "announcement_modal_config": {
    "version": 0,
    "application_id": 0
  }
}
```

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 9: goto /channels/@me: 200, 435 ms

Sent:

```json
null
```

Answered:

```json
{
  "promotional_sku_ids": [],
  "promotion_end_datetime": null,
  "storefronts": [
    {
      "guild_id": "1193841000108531764",
      "application_id": "1346069614634864772",
      "game_id": "1314395942253756416",
      "collectibles_shop_navigation_enabled": true,
      "excluded_platforms": [
        "playstation"
      ],
      "disable_mobile_account_linking": false,
      "promotion_end_datetime": "2026-09-18T18:00:00+00:00",
      "allow_orbs_spending": false
    },
    {
      "guild_id": "560127830160048128",
      "application_id": "1288512934112264234",
      "game_id": "1402418594532298837",
      "collectibles_shop_navigation_enabled": true,
      "excluded_platforms": [
        "playstation",
        "xbox"
      ],
      "disable_mobile_account_linking": true,
      "promotion_end_datetime": "2026-09-04T18:00:00+00:00",
      "allow_orbs_spending": false
    },
    {
      "guild_id": "187363008610041857",
      "application_id": "614380482620293151",
      "game_id": "1402418571715543120",
      "collectibles_shop_navigation_enabled": true,
      "excluded_platforms": [
        "amazon kids+",
        "apple arcade",
        "netflix",
        "playstation",
        "switch",
        "xbox"
      ],
      "disable_mobile_account_linking": false,
      "promotion_end_datetime": "2026-09-01T00:00:00+00:00",
      "allow_orbs_spending": false
    }
  ],
  "announcement_modal_config": {
    "version": 0,
    "application_id": 0
  }
}
```

<!-- facts:end -->

## What it does

Reads the storefront setup for Discord's partner SDK (games selling inside Discord).

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
