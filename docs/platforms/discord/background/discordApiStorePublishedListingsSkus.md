# discordApiStorePublishedListingsSkus

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/store/published-listings/skus` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261030T222341_<name:7>/script1.js:208 app_store_parental_revocation`, `runs/inspect/20261030T222341_<name:7>/script1036.js:1 parse`, `runs/inspect/20261030T222341_<name:7>/script1221.js:2 anonymous`, `runs/inspect/20261028T074137_<name:7>/script1245.js:2 anonymous` |
| rea | `ev_065e7ad37dcb5911d240f9de7d6e2882220c5a8d7c025d92b46a23de59cf297c` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 8: click e221 | 1 | 200 | 399 ms | 2744 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T062914_<name:7>**, step 8: click e221: 200, 399 ms

Sent:

```json
{
  "query": {
    "country_code": "<country>",
    "application_id": "1340102344645283891",
    "guild_id": "<guildId:1>"
  },
  "body": null
}
```

Answered:

```json
[
  {
    "id": "<id:1>",
    "summary": "Flex Badge Pack",
    "sku": {
      "id": "<id:2>",
      "type": 2,
      "product_line": 13,
      "dependent_sku_id": "<id:3>",
      "application_id": "1340102344645283891",
      "manifest_labels": null,
      "access_type": 1,
      "name": "<name:1>",
      "features": "(0 items)",
      "release_date": null,
      "premium": false,
      "slug": "flex-badge-pack",
      "flags": 0,
      "show_age_gate": false,
      "tenant_metadata": "(1 fields)",
      "powerup_metadata": "(6 fields)",
      "selected_options": "(1 items)",
      "product_id": "<id:1>",
      "created_at": "2025-08-05T20:53:39.133830+00:00",
      "updated_at": "2025-10-10T14:55:25.560337+00:00"
    },
    "description": "Flex Badge Pack",
    "published": true,
    "benefits": [],
    "powerup_metadata": {
      "category_type": "perk",
      "static_image_url": "https://cdn.discordapp.com/assets/content/4e745042a2d8bfd0006d1040fc5a266bfb31ec9bbda28bd1651c2a48fb627642.png",
      "animated_image_url": "https://cdn.discordapp.com/assets/content/20ed9f49e889cf2f2730613ab1a0724d12e8f4b84292c821b792768f0aba0ddc.png",
      "store_removal_date": null,
      "deactivation_cooldown_period_days": null
    }
  },
  {
    "id": "<id:4>",
    "summary": "Level 1",
    "sku": {
      "id": "<id:5>",
      "type": 2,
      "product_line": 13,
      "dependent_sku_id": null,
      "application_id": "1340102344645283891",
      "manifest_labels": null,
      "access_type": 1,
      "name": "<name:2>",
      "features": "(0 items)",
      "release_date": null,
      "premium": false,
      "slug": "level-1",
      "flags": 0,
      "show_age_gate": false,
      "tenant_metadata": "(1 fields)",
      "powerup_metadata": "(5 fields)",
      "selected_options": "(1 items)",
      "product_id": "<id:4>",
      "created_at": "2025-08-05T20:53:39.133830+00:00",
      "updated_at": "2025-10-10T14:55:25.092816+00:00"
    },
    "description": "Level 1",
    "published": true,
    "benefits": [],
    "powerup_metadata": {
      "category_type": "level",
      "static_image_url": "https://cdn.discordapp.com/assets/content/74bebcffe052733570281d5a346ed2c59047b9af7a9638c9a63359533d464261.svg",
      "animated_image_url": null,
      "store_removal_date": null,
      "deactivation_cooldown_period_days": null
    }
  },
  {
    "id": "<id:6>",
    "summary": "Level 2",
    "sku": {
      "id": "<id:7>",
      "type": 2,
      "product_line": 13,
      "dependent_sku_id": "<id:5>",
      "application_id": "1340102344645283891",
      "manifest_labels": null,
      "access_type": 1,
      "name": "<name:3>",
      "features": "(0 items)",
      "release_date": null,
      "premium": false,
      "slug": "level-2",
      "flags": 0,
      "show_age_gate": false,
      "tenant_metadata": "(1 fields)",
      "powerup_metadata": "(5 fields)",
      "selected_options": "(1 items)",
      "product_id": "<id:6>",
      "created_at": "2025-08-05T20:53:39.133830+00:00",
      "updated_at": "2025-10-10T14:55:25.190756+00:00"
    },
    "description": "Level 2",
    "published": true,
    "benefits": [],
    "powerup_metadata": {
      "category_type": "level",
      "static_image_url": "https://cdn.discordapp.com/assets/content/74bebcffe052733570281d5a346ed2c59047b9af7a9638c9a63359533d464261.svg",
      "animated_image_url": null,
      "store_removal_date": null,
      "deactivation_cooldown_period_days": null
    }
  },
  {
    "id": "<id:8>",
    "summary": "Level 3",
    "sku": {
      "id": "<id:9>",
      "type": 2,
      "product_line": 13,
      "dependent_sku_id": "<id:7>",
      "application_id": "1340102344645283891",
      "manifest_labels": null,
      "access_type": 1,
      "name": "<name:4>",
      "features": "(0 items)",
      "release_date": null,
      "premium": false,
      "slug": "level-3",
      "flags": 0,
      "show_age_gate": false,
      "tenant_metadata": "(1 fields)",
      "powerup_metadata": "(5 fields)",
      "selected_options": "(1 items)",
      "product_id": "<id:8>",
      "created_at": "2025-08-05T20:53:39.133830+00:00",
      "updated_at": "2025-10-10T14:55:25.234215+00:00"
    },
    "description": "Level 3",
    "published": true,
    "benefits": [],
    "powerup_metadata": {
      "category_type": "level",
      "static_image_url": "https://cdn.discordapp.com/assets/content/74bebcffe052733570281d5a346ed2c59047b9af7a9638c9a63359533d464261.svg",
      "animated_image_url": null,
      "store_removal_date": null,
      "deactivation_cooldown_period_days": null
    }
  },
  {
    "id": "<id:10>",
    "summary": "Server Tag",
    "sku": {
      "id": "<id:3>",
      "type": 2,
      "product_line": 13,
      "dependent_sku_id": null,
      "application_id": "1340102344645283891",
      "manifest_labels": null,
      "access_type": 1,
      "name": "<name:5>",
      "features": "(0 items)",
      "release_date": null,
      "premium": false,
      "slug": "server-tag",
      "flags": 0,
      "show_age_gate": false,
      "tenant_metadata": "(1 fields)",
      "powerup_metadata": "(6 fields)",
      "selected_options": "(1 items)",
      "product_id": "<id:10>",
      "created_at": "2025-08-05T20:53:39.133830+00:00",
      "updated_at": "2025-10-10T14:55:25.332909+00:00"
    },
    "description": "<messageText>",
    "published": true,
    "benefits": [],
    "powerup_metadata": {
      "category_type": "perk",
      "static_image_url": "https://cdn.discordapp.com/assets/content/478ce7fb9a64e4d6c4792c82d93f724c2aa0444ac2dfc3e2dfdf43dd11a39c79.png",
      "animated_image_url": "https://cdn.discordapp.com/assets/content/f15f451050f67dd0fbb25bab5166d0ec9f1c9aa24a14a7f6652041de8c628163.png",
      "store_removal_date": null,
      "deactivation_cooldown_period_days": null
    }
  },
  {
    "id": "<id:11>",
    "summary": "Enhanced Role Styles",
    "sku": {
      "id": "<id:12>",
      "type": 2,
      "product_line": 13,
      "dependent_sku_id": null,
      "application_id": "1340102344645283891",
      "manifest_labels": null,
      "access_type": 1,
      "name": "<name:6>",
      "features": "(0 items)",
      "release_date": null,
      "premium": false,
      "slug": "enhanced-role-styles",
      "flags": 0,
      "show_age_gate": false,
      "tenant_metadata": "(1 fields)",
      "powerup_metadata": "(6 fields)",
      "selected_options": "(1 items)",
      "product_id": "<id:11>",
      "created_at": "2025-08-05T20:53:39.133830+00:00",
      "updated_at": "2025-10-10T14:55:25.371791+00:00"
    },
    "description": "<messageText>",
    "published": true,
    "benefits": [],
    "powerup_metadata": {
      "category_type": "perk",
      "static_image_url": "https://cdn.discordapp.com/assets/content/93c84331a5f11ba05946bce6fb4f85594d98cb52c8452e9b6869291da41cf62c.png",
      "animated_image_url": "https://cdn.discordapp.com/assets/content/07ad706367af930589109e947258105fd0b8e1b97d1fccc4cbf1ec9905ffb4f1.png",
      "store_removal_date": null,
      "deactivation_cooldown_period_days": null
    }
  },
  "… 3 more"
]
```

<!-- facts:end -->

## What it does

Reads store listings (SKUs) for things a server or app sells.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
