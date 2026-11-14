# discordApiStorefrontPromotions

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/storefront/promotions` |
| Sends | — |
| Reads | `promotions` |
| Called from | `runs/inspect/20261114T184328_deepman2/script0.js:232 625075`, `runs/inspect/20261114T184328_deepman2/script0.js:124 559868`, `runs/inspect/20261114T184328_deepman2/script0.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_f6daff8038b4f477b27b852e31fc1f2f76f7dd725b1883891e74b824ed6f0ac3` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /login | 1 | 200 | 385 ms | 140825 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261109T194954_deepman2**, step 1: goto /login: 200, 385 ms

Sent:

```json
{
  "query": {
    "application_ids": "1096190356233670716"
  },
  "body": null
}
```

Answered:

```json
{
  "promotions": [
    {
      "id": "<id:1>",
      "application_id": "1096190356233670716",
      "display_name": "<name:1>",
      "reward_type": 1,
      "reward_status": 2,
      "reward_config": {
        "discount": null,
        "action": {
          "action_type": 4,
          "delivery_mode": 2,
          "sku_ids": [],
          "orbs_back": null
        }
      },
      "sku_ids": null,
      "applies_to_all_skus": false,
      "include_bundles": true,
      "starts_at": "2026-11-04T16:30:00+00:00",
      "ends_at": "2026-11-18T17:00:00+00:00",
      "redemption_ends_at": "2026-11-23T17:00:00+00:00",
      "progress": {
        "current": 0,
        "target": 4,
        "label": "items owned"
      },
      "tenant_metadata": {
        "social_layer": null,
        "collectibles": {
          "type": "COLLECT_AND_CLAIM",
          "subtype": "BASIC",
          "collection_id": "1561844530079076372",
          "shop_home": {
            "description": "Collect 4 items to unlock an exclusive Deadpool/Wolverine Avatar Decoration. [Terms apply]({help_center_url}).",
            "style": {
              "content_theme": "dark"
            }
          },
          "index_page": {
            "description": "Collect 4 items to unlock an exclusive Deadpool/Wolverine Avatar Decoration. [Terms apply]({help_center_url}).",
            "style": {
              "content_theme": "dark"
            }
          },
          "shared": {
            "progress_indicator": {
              "title": "Unlock an exclusive Deadpool/Wolverine Avatar Decoration",
              "description": "Collect 4 eligible items to unlock. Ends {promotion_end_date}.",
              "indicator_reward_states": {
                "earned": {
                  "title": "Your Avatar Decoration is ready.",
                  "description": "You've made Deadpool and Wolverine very proud. Claim your exclusive item by {claim_end_date}."
                },
                "consumed": {
                  "title": "Avatar Decoration claimed.",
                  "description": "Babypool is now yours. Good luck with potty training."
                }
              },
              "assets": {
                "background_url": "https://cdn.discordapp.com/media/v1/collectibles-shop/7596b6605d8eb4f4381fe655e97aa81c22fe9edaa5dee89da4ced75fd6737379",
                "reward_preview": {
                  "hidden_url": "https://cdn.discordapp.com/media/v1/collectibles-shop/dd133062c56896ad4e4109eccfa36d0eeb9054f263164d78cd3156cd94253e85",
                  "revealed_url": "https://cdn.discordapp.com/media/v1/collectibles-shop/878cdc7d24aab4ee4d8a0cd673097ec3b47f38fd57df586fec809db37e29d345"
                }
              },
              "style": {
                "content_theme": "dark",
                "progress_color": "#83EE53"
              }
            },
            "navigation": {
              "tab": {
                "title": "Deadpool / Wolverine",
                "icon": "TAG"
              }
            },
            "help_center": {
              "id": "<id:2>"
            }
          }
        }
      }
    }
  ]
}
```

<!-- facts:end -->

## What it does

The storefront's current promotions (Nitro and Shop offers), loaded by Discord's client around the page.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
