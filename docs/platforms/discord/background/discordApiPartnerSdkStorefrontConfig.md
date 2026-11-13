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
| Called from | `runs/inspect/20261113T044840_<name:1>/script0.js:232 625075`, `runs/inspect/20261113T044840_<name:1>/script0.js:124 559868`, `runs/inspect/20261113T044840_<name:1>/script0.js:124 961943`, `runs/inspect/20261113T044840_<name:1>/script1294.js:1 634654` |
| rea | `ev_4f3198c889cf99da0e572ad0ff76c19231f2cfcf34c8ebc9b4512c8fc7c181cb` |

Seen 7 time(s) in 5 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 294 ms | 11834 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 362 ms | 12918 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 435 ms | 9556 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 380 ms | 8664 ms | — |
| inspect | step 1: goto /login | 2 | 200 | 631–9771 ms | 18501–46273 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 448 ms | 51752 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T044840_<name:1>**, step 1: goto /login: 200, 9771 ms

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
      "guild_id": "<guildId:1>",
      "application_id": "1346069614634864772",
      "game_id": "<id:1>",
      "collectibles_shop_navigation_enabled": true,
      "excluded_platforms": [
        "playstation"
      ],
      "disable_mobile_account_linking": false,
      "promotion_end_datetime": "2026-09-18T18:00:00+00:00"
    },
    {
      "guild_id": "<guildId:2>",
      "application_id": "1288512934112264234",
      "game_id": "<id:2>",
      "collectibles_shop_navigation_enabled": true,
      "excluded_platforms": [
        "playstation",
        "xbox"
      ],
      "disable_mobile_account_linking": true,
      "promotion_end_datetime": "2026-09-04T18:00:00+00:00"
    },
    {
      "guild_id": "<guildId:3>",
      "application_id": "614380482620293151",
      "game_id": "<id:3>",
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
      "promotion_end_datetime": "2026-09-01T00:00:00+00:00"
    }
  ],
  "announcement_modal_config": {
    "version": 0,
    "application_id": 0
  }
}
```

**runs/inspect/20261030T222341_<name:1>**, step 2: snapshot: 200, 448 ms

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
      "guild_id": "<guildId:1>",
      "application_id": "1346069614634864772",
      "game_id": "<id:1>",
      "collectibles_shop_navigation_enabled": true,
      "excluded_platforms": [
        "playstation"
      ],
      "disable_mobile_account_linking": false,
      "promotion_end_datetime": "2026-09-18T18:00:00+00:00",
      "allow_orbs_spending": false
    },
    {
      "guild_id": "<guildId:2>",
      "application_id": "1288512934112264234",
      "game_id": "<id:2>",
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
      "guild_id": "<guildId:3>",
      "application_id": "614380482620293151",
      "game_id": "<id:3>",
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

**runs/inspect/20261028T065202_<name:1>**, step 1: goto /channels/@me/<id>: 200, 294 ms

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
      "guild_id": "<guildId:1>",
      "application_id": "1346069614634864772",
      "game_id": "<id:1>",
      "collectibles_shop_navigation_enabled": true,
      "excluded_platforms": [
        "playstation"
      ],
      "disable_mobile_account_linking": false,
      "promotion_end_datetime": "2026-09-18T18:00:00+00:00",
      "allow_orbs_spending": false
    },
    {
      "guild_id": "<guildId:2>",
      "application_id": "1288512934112264234",
      "game_id": "<id:2>",
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
      "guild_id": "<guildId:3>",
      "application_id": "614380482620293151",
      "game_id": "<id:3>",
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
