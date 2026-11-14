# discordApiCollectiblesShop

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/collectibles-shop` |
| Sends | — |
| Reads | `shop_blocks`, `categories` |
| Called from | `runs/inspect/20261113T231616_deepman2/script3.js:232 625075`, `runs/inspect/20261113T231616_deepman2/script3.js:124 559868`, `runs/inspect/20261113T231616_deepman2/script3.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_ff9ebb76b37bb55ad865cfd6cf0bccb9049bd454686f42ad23ca10e44e0f1929` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /login | 1 | 200 | 366 ms | 140846 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261109T194954_deepman2**, step 1: goto /login: 200, 366 ms

Sent:

```json
{
  "query": {
    "tab": "home",
    "include_bundles": "true",
    "include_dynamic_blocks": "true",
    "variants_return_style": "2",
    "skip_num_categories": "0"
  },
  "body": null
}
```

Answered:

```json
{
  "shop_blocks": [
    {
      "type": 0,
      "category_sku_id": "1561844530079076372",
      "name": "<name:1>",
      "category_store_listing_id": "1561844530079076372",
      "unpublished_at": null,
      "summary": " ",
      "ranked_sku_ids": "(7 items)",
      "hero_banner_url": "https://cdn.discordapp.com/media/v1/collectibles-shop/d63405075797f3e1f084e70b88953a224d6aa6af3ea73575e53efc188ea1efd8",
      "hero_banner_animated_url": "https://cdn.discordapp.com/media/v1/collectibles-shop/29c4e43d614a20c9e1d6d72277dfcc0f3cbc9c10ced8d786457183a337296a74",
      "hero_logo_url": "https://cdn.discordapp.com/media/v1/collectibles-shop/750892abe34672461d1a61bebc6d7f1dc363c7db2a94c8f551a2bd1a0096efeb",
      "mobile_hero_url": "https://cdn.discordapp.com/media/v1/collectibles-shop/aff01e8d059e104414c48089773ef7d35e96a320d0eca4160f884409a290ce33",
      "banner_display_config": "(4 fields)",
      "logo_display_config": "(4 fields)"
    },
    {
      "type": 1,
      "subblocks": "(2 items)"
    },
    {
      "type": 4,
      "name": "<name:2>",
      "ranked_sku_ids": "(7 items)",
      "category_sku_id": "1436367669111554119",
      "show_button": true,
      "button_text": "Shop All Call of Duty: Black Ops 7"
    },
    {
      "type": 2,
      "ranked_sku_ids": "(7 items)",
      "sorted_sku_ids": "(2 fields)"
    }
  ],
  "categories": [
    {
      "sku_id": "1561844530079076372",
      "name": "<name:1>",
      "summary": " ",
      "store_listing_id": "1561844530079076372",
      "styles": "(3 fields)",
      "hero_ranking": "(7 items)",
      "products": "(7 items)",
      "hero_banner_url": "https://cdn.discordapp.com/media/v1/collectibles-shop/d63405075797f3e1f084e70b88953a224d6aa6af3ea73575e53efc188ea1efd8",
      "hero_banner_animated_url": "https://cdn.discordapp.com/media/v1/collectibles-shop/29c4e43d614a20c9e1d6d72277dfcc0f3cbc9c10ced8d786457183a337296a74",
      "hero_logo_url": "https://cdn.discordapp.com/media/v1/collectibles-shop/750892abe34672461d1a61bebc6d7f1dc363c7db2a94c8f551a2bd1a0096efeb",
      "catalog_banner_url": "https://cdn.discordapp.com/media/v1/collectibles-shop/da83e9d917153cc481a4f38d2709b4e6ef3db8b9a2f8267868fb4224e794c5a4",
      "catalog_banner_animated_url": "https://cdn.discordapp.com/media/v1/collectibles-shop/3cb55d712a427fe84648fc4b6c7592dc9d0aaa11c3728725d965fa56c1eab5c6",
      "featured_block_url": "https://cdn.discordapp.com/media/v1/collectibles-shop/05027edd97dd1f4b73b66720f22dbfe2c1ea803d21e7c0e5732a0f7bd015f485",
      "logo_url": "https://cdn.discordapp.com/media/v1/collectibles-shop/750892abe34672461d1a61bebc6d7f1dc363c7db2a94c8f551a2bd1a0096efeb",
      "pdp_bg_url": "https://cdn.discordapp.com/media/v1/collectibles-shop/42962fbd16721a3330f3dd51e662b9eb53cea34b9610dd18beec114a61046d86",
      "mobile_hero_url": "https://cdn.discordapp.com/media/v1/collectibles-shop/aff01e8d059e104414c48089773ef7d35e96a320d0eca4160f884409a290ce33",
      "mobile_banner_url": "https://cdn.discordapp.com/media/v1/collectibles-shop/46f9296bab68efece768cdb398f69ff2c448e31a95d105ab454e401b2e65238a",
      "mobile_bg_url": "https://cdn.discordapp.com/media/v1/collectibles-shop/91704abc4a6ca391e9e8029b013905c7f7a388be4a47b6bab0a18e847746c1c6",
      "hero_banner_display_config": "(4 fields)",
      "hero_logo_display_config": "(4 fields)"
    },
    {
      "sku_id": "1436367669111554119",
      "name": "<name:2>",
      "summary": " ",
      "store_listing_id": "1436367669111554119",
      "unpublished_at": "2026-11-14T07:59:59+00:00",
      "styles": "(3 fields)",
      "hero_ranking": "(7 items)",
      "products": "(7 items)",
      "hero_banner_url": "https://cdn.discordapp.com/assets/content/a5e0c5670339be4d8354b8c9ba92c7f90b6659f2afe4acc9a87a111f95f59380",
      "hero_banner_animated_url": "https://cdn.discordapp.com/assets/content/1cf8c2ae80947f41247c98fccf56072c7d4f4259d4050c1f0bcd2e24411a9509",
      "hero_logo_url": "https://cdn.discordapp.com/assets/content/f6c12eac86b81185281a0c0bcd759c8ef357f8bc664decf6845fc3f1c5c0a487",
      "catalog_banner_url": "https://cdn.discordapp.com/assets/content/66f6b8a8522fd0987a879afa8d09d6987e148264ed6158b665cb26ec2bc6df1e",
      "catalog_banner_animated_url": "https://cdn.discordapp.com/assets/content/88759a77371c656a10b3ec6e631af413377115cdf241a5cf5ab97155e8194948",
      "featured_block_url": "https://cdn.discordapp.com/assets/content/3beea1bbce3fd90f0020cb001b22f89b64e1f059d149e7c958e088e8d5603f94",
      "logo_url": "https://cdn.discordapp.com/assets/content/f6c12eac86b81185281a0c0bcd759c8ef357f8bc664decf6845fc3f1c5c0a487",
      "pdp_bg_url": "https://cdn.discordapp.com/assets/content/aa10be5f1ee5cffe1c6f405c4786427d02bb029d910462514bbdc1f66c198235",
      "mobile_hero_url": "https://cdn.discordapp.com/assets/content/7ed0022905f68f7e870d93824ce47f4e831a55b5157a60abdfde79e9db9540f1",
      "mobile_banner_url": "https://cdn.discordapp.com/assets/content/59aad8fc9488d802c1ba999df7f9d91f0333d958179d040a0d955183fe65a493",
      "mobile_bg_url": "https://cdn.discordapp.com/assets/content/4c3194aa86c0c15de9533cae169720d2c9548900737b39ffc612561d3ad82728",
      "hero_banner_display_config": "(4 fields)"
    }
  ]
}
```

<!-- facts:end -->

## What it does

The Shop page's catalogue of avatar decorations and profile effects, loaded by Discord's client around the page.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
