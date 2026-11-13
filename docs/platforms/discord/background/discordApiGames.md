# discordApiGames

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/games` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261113T141543_<name:8>/script1.js:232 625075`, `runs/inspect/20261113T141543_<name:8>/script1.js:124 559868`, `runs/inspect/20261113T141543_<name:8>/script1.js:124 961943`, `runs/inspect/20261113T141543_<name:8>/script1294.js:1 634654` |
| rea | `ev_a9fa69c7432fa1fcc41058ba491790444cfcec72f4c96150b3d2566a4e5def67` |

Seen 8 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: click e40 | 1 | 200 | 358 ms | 13047 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 366 ms | 10199 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 318 ms | 8803 ms | — |
| inspect | step 27: type e2077 | 2 | 200 | 325–385 ms | 390–543 ms | — |
| inspect | step 1: goto /login | 2 | 200 | 418–570 ms | 18655–1051883 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 1088 ms | 50864 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T141543_<name:8>**, step 1: goto /login: 200, 570 ms

Sent:

```json
{
  "query": {
    "game_ids": "1539812812854132867"
  },
  "body": null
}
```

Answered:

```json
[
  {
    "id": "<id:1>",
    "name": "<name:1>",
    "aliases": [
      "Epic Games Launcher"
    ],
    "description": "Fortnite is a free-to-play online game where you and your friends can create, play and battle. Be the last player standing in Battle Royale and Zero Build, experience a concert or live event, or discover over a million creator-made games, including racing, parkour, zombie survival and more.",
    "icon_hash": "c1864b38910c209afd5bf6423b672022",
    "executables": [
      "(3 fields)",
      "(3 fields)",
      "(3 fields)"
    ],
    "third_party_skus": [
      "(2 fields)",
      "(2 fields)",
      "(2 fields)",
      "(2 fields)",
      "(2 fields)",
      "(2 fields)",
      "… 18 more"
    ],
    "overlay": true,
    "overlay_warn": false,
    "overlay_compatibility_hook": true,
    "overlay_methods": 0,
    "hook": true,
    "themes": [
      "Action",
      "Open world",
      "Sandbox",
      "Survival"
    ],
    "linked_applications": [
      "(2 fields)"
    ],
    "media": {
      "cover_url": "https://images-ext-1.discordapp.net/external/NEKOQRfG-ycjcZsTBZWtV3pPSP_ryyGiJEIHva2pRYc/https/images.igdb.com/igdb/image/upload/t_cover_big/cocxbi.jpg",
      "artwork_hashes": "(1 items)",
      "icon": "(2 fields)",
      "banner": "(2 fields)",
      "cover": "(2 fields)",
      "artwork": "(1 items)"
    },
    "first_release_date": "2020-06-29T00:00:00+00:00",
    "genres": [
      28,
      23
    ],
    "platforms": [
      0,
      1,
      2,
      3,
      4,
      5,
      "… 1 more"
    ],
    "platform_availability": [
      "console",
      "desktop",
      "mobile"
    ],
    "banner_hash": "b82e4ce1bb3835f5adfd9a1e766844ae",
    "screenshot_urls": [
      "https://images-ext-1.discordapp.net/external/-3AuKABBsB3Bpa-oMkTW_zOQ66kIv8aZtorxu208u4c/https/images.igdb.com/igdb/image/upload/t_1080p/scvtmt.jpg",
      "https://images-ext-1.discordapp.net/external/1J1l64i8vNCvJe-_FQTU91kd2GV9Nn4sNu_Bc5rjjnM/https/images.igdb.com/igdb/image/upload/t_1080p/sc105br.jpg",
      "https://images-ext-1.discordapp.net/external/1rWFlzxH7A2FYz6bTrNq3XqTNdGSMcb5k6C6A3Wqcuk/https/images.igdb.com/igdb/image/upload/t_1080p/scvtmw.jpg",
      "https://images-ext-1.discordapp.net/external/4yhRVnSuBZ8KvUhmIPwdmRWcbaE3WYBfrPTwqeKReHs/https/images.igdb.com/igdb/image/upload/t_1080p/sc105bp.jpg",
      "https://images-ext-1.discordapp.net/external/6Da0FGoIn2h7-ZMhvcwLfuNLC34s-DnozpOs2QbF0nw/https/images.igdb.com/igdb/image/upload/t_1080p/sc105bo.jpg",
      "https://images-ext-1.discordapp.net/external/BpirDw5XC3MM0JSkAG4VXvTgqsuw-96Qgo8GAfF4WmY/https/images.igdb.com/igdb/image/upload/t_1080p/scvtmv.jpg",
      "… 14 more"
    ],
    "trailers": [
      "(6 fields)"
    ],
    "websites": [
      "(2 fields)",
      "(2 fields)",
      "(2 fields)",
      "(2 fields)",
      "(2 fields)",
      "(2 fields)",
      "… 8 more"
    ],
    "companies": [
      "(2 fields)"
    ],
    "reviews": {
      "opencritic": "(3 fields)",
      "app_store": "(3 fields)",
      "google_play": "(2 fields)"
    },
    "opencritic_url": "https://opencritic.com/game/6228/fortnite-battle-royale",
    "l30_rank": 2,
    "community_guild_ids": [
      "322850917248663552",
      "1175919536839610512",
      "483995605593489419",
      "625801565558800385",
      "1143532130475970695",
      "605881657286983736",
      "… 34 more"
    ],
    "game_flags": 0,
    "content_classification": {
      "agency_ratings": "(3 fields)"
    }
  },
  {
    "id": "<id:2>",
    "name": "<name:2>",
    "aliases": [],
    "description": "The Call of Duty® experience supports Modern Warfare® 4, Black Ops 7 and Call of Duty®: Warzone™.\n\nCall of Duty®: Modern Warfare® 4 brings players Warfare Without Limits.\n\nIn Call of Duty®: Black Ops 7, Treyarch and Raven Software are bringing players the biggest Black Ops ever.\n\nCall of Duty®: Warzone™ is the massive free-to-play combat arena, featuring Battle Royale, Resurgence, and now introduc… (495 chars)",
    "icon_hash": "532b24566a2cdde9646052b7e4d43bc0",
    "executables": [
      "(3 fields)"
    ],
    "third_party_skus": [
      "(2 fields)",
      "(2 fields)",
      "(2 fields)",
      "(2 fields)",
      "(2 fields)",
      "(2 fields)",
      "… 16 more"
    ],
    "overlay": false,
    "overlay_warn": false,
    "overlay_compatibility_hook": false,
    "overlay_methods": 0,
    "hook": false,
    "themes": [
      "Action",
      "Warfare"
    ],
    "linked_applications": [],
    "media": {
      "cover_hash": "7f8275b121cbd881753bad14969257ea",
      "artwork_urls": "(7 items)",
      "icon": "(2 fields)",
      "cover": "(2 fields)",
      "artwork": "(7 items)"
    },
    "first_release_date": "2026-10-23T00:00:00+00:00",
    "genres": [
      23
    ],
    "platforms": [
      0,
      1,
      2
    ],
    "platform_availability": [
      "console",
      "desktop"
    ],
    "cover_image_hash": "7f8275b121cbd881753bad14969257ea",
    "screenshot_urls": [
      "https://images-ext-1.discordapp.net/external/6Quwi0Vk-EV5zssqunflZIuabJAs-KNTuolax9DdBhk/https/images.igdb.com/igdb/image/upload/t_1080p/sc13i3n.jpg",
      "https://images-ext-1.discordapp.net/external/CXHgMq1VDGEJO2XQgpgFhUAeG8Y6Q2VBQI6MNiKFhgI/https/images.igdb.com/igdb/image/upload/t_1080p/sc13i3o.jpg",
      "https://images-ext-1.discordapp.net/external/H9T04tXpFFGAeG4KG7pWBPLVp-mLE0DiY5KHuiN3r7s/https/images.igdb.com/igdb/image/upload/t_1080p/sc13i3t.jpg",
      "https://images-ext-1.discordapp.net/external/J_MCgkZNLbf-bO3ik_xbt1PWjGhwJyMcpObrVZsX7OU/https/images.igdb.com/igdb/image/upload/t_1080p/sc13i3p.jpg",
      "https://images-ext-1.discordapp.net/external/Y6nVJwzC9CsDcdhTB4Flm1GaYCpnqXceGyaZb0Z4GKU/https/images.igdb.com/igdb/image/upload/t_1080p/sc13i3q.jpg",
      "https://images-ext-1.discordapp.net/external/fBmf9za3_WS0uvvjQ_xFAQRBh9jxXi6GGRnasXOqDgw/https/images.igdb.com/igdb/image/upload/t_1080p/sc13i3s.jpg",
      "… 1 more"
    ],
    "websites": [
      "(2 fields)",
      "(2 fields)",
      "(2 fields)",
      "(2 fields)",
      "(2 fields)",
      "(2 fields)",
      "… 1 more"
    ],
    "companies": [
      "(2 fields)",
      "(2 fields)"
    ],
    "steam_release_status": 3,
    "reviews": {
      "steam": "(6 fields)"
    },
    "l30_rank": 7,
    "community_guild_ids": [
      "1296834348271800452"
    ],
    "game_flags": 0,
    "content_classification": {
      "agency_ratings": "(2 fields)"
    }
  }
]
```

**runs/inspect/20261030T222341_<name:8>**, step 2: snapshot: 200, 1088 ms

Sent:

```json
{
  "query": {
    "game_ids": "542075586886107149"
  },
  "body": null
}
```

Answered:

```json
[
  {
    "id": "<id:3>",
    "name": "<name:3>",
    "aliases": "(0 items)",
    "description": "AION 2 is the only MMORPG built around a world where the sky is the battlefield. Choose your faction, ascend as a Daeva, and fight a faction war across a world 36 times larger than the original. PC only, on Unreal Engine 5.",
    "icon_hash": "5146eac718876015ae5d3eeadbaad9d7",
    "executables": "(0 items)",
    "third_party_skus": "(4 items)",
    "overlay": false,
    "overlay_warn": false,
    "overlay_compatibility_hook": false,
    "overlay_methods": 0,
    "hook": true,
    "themes": "(2 items)",
    "linked_applications": "(1 items)",
    "media": "(6 fields)",
    "first_release_date": "2025-11-18T00:00:00+00:00",
    "genres": "(5 items)",
    "platforms": "(1 items)",
    "platform_availability": "(2 items)",
    "cover_image_hash": "06794d884aafbc11a17fd770620030f9",
    "banner_hash": "899b1d4806aac5d7732049bf568dc4f4",
    "screenshot_hashes": "(4 items)",
    "screenshot_urls": "(4 items)",
    "trailers": "(1 items)",
    "websites": "(7 items)",
    "companies": "(1 items)",
    "steam_release_status": 3,
    "reviews": "(1 fields)",
    "l30_rank": 22,
    "community_guild_ids": "(7 items)",
    "game_flags": 0,
    "content_classification": "(1 fields)"
  },
  {
    "id": "<id:2>",
    "name": "<name:2>",
    "aliases": "(0 items)",
    "description": "The Call of Duty® experience supports Modern Warfare® 4, Black Ops 7 and Call of Duty®: Warzone™.\n\nCall of Duty®: Modern Warfare® 4 brings players Warfare Without Limits.\n\nIn Call of Duty®: Black Ops 7, Treyarch and Raven Software are bringing players the biggest Black Ops ever.\n\nCall of Duty®: Warzone™ is the massive free-to-play combat arena, featuring Battle Royale, Resurgence, and now introduc… (495 chars)",
    "icon_hash": "532b24566a2cdde9646052b7e4d43bc0",
    "executables": "(1 items)",
    "third_party_skus": "(7 items)",
    "overlay": false,
    "overlay_warn": false,
    "overlay_compatibility_hook": false,
    "overlay_methods": 0,
    "hook": false,
    "themes": "(2 items)",
    "linked_applications": "(0 items)",
    "media": "(5 fields)",
    "first_release_date": "2026-10-23T00:00:00+00:00",
    "genres": "(1 items)",
    "platforms": "(3 items)",
    "platform_availability": "(2 items)",
    "cover_image_hash": "7f8275b121cbd881753bad14969257ea",
    "screenshot_urls": "(7 items)",
    "websites": "(7 items)",
    "companies": "(2 items)",
    "steam_release_status": 3,
    "reviews": "(1 fields)",
    "l30_rank": 7,
    "game_flags": 0,
    "content_classification": "(1 fields)"
  },
  {
    "id": "<id:4>",
    "name": "<name:4>",
    "aliases": "(1 items)",
    "description": "Conquer with character in Apex Legends, a free-to-play Hero shooter where legendary characters with powerful abilities team up to battle for fame & fortune on the fringes of the Frontier.\n\nMaster an ever-growing roster of diverse Legends, deep tactical squad play and bold new innovations that go beyond the Battle Royale experience—all within a rugged world where anything goes. Welcome to the next … (426 chars)",
    "icon_hash": "91fac0600c5b6527c1aea95a93c6a8e0",
    "executables": "(4 items)",
    "third_party_skus": "(7 items)",
    "overlay": false,
    "overlay_warn": false,
    "overlay_compatibility_hook": false,
    "overlay_methods": 0,
    "hook": true,
    "themes": "(2 items)",
    "linked_applications": "(0 items)",
    "media": "(5 fields)",
    "first_release_date": "2019-02-04T00:00:00+00:00",
    "genres": "(2 items)",
    "platforms": "(4 items)",
    "platform_availability": "(2 items)",
    "screenshot_urls": "(6 items)",
    "trailers": "(1 items)",
    "websites": "(7 items)",
    "companies": "(2 items)",
    "steam_release_status": 3,
    "reviews": "(2 fields)",
    "opencritic_url": "https://opencritic.com/game/7267/apex-legends",
    "l30_rank": 13,
    "community_guild_ids": "(7 items)",
    "game_flags": 0,
    "content_classification": "(1 fields)"
  }
]
```

**runs/inspect/20261028T062914_<name:8>**, step 5: click e40: 200, 358 ms

Sent:

```json
{
  "query": {
    "game_ids": "1539812812854132867"
  },
  "body": null
}
```

Answered:

```json
[
  {
    "id": "<id:2>",
    "name": "<name:2>",
    "aliases": [],
    "description": "The Call of Duty® experience supports Modern Warfare® 4, Black Ops 7 and Call of Duty®: Warzone™.\n\nCall of Duty®: Modern Warfare® 4 brings players Warfare Without Limits.\n\nIn Call of Duty®: Black Ops 7, Treyarch and Raven Software are bringing players the biggest Black Ops ever.\n\nCall of Duty®: Warzone™ is the massive free-to-play combat arena, featuring Battle Royale, Resurgence, and now introduc… (495 chars)",
    "icon_hash": "532b24566a2cdde9646052b7e4d43bc0",
    "executables": [
      {
        "os": "win32",
        "name": "<name:5>",
        "is_launcher": false
      }
    ],
    "third_party_skus": [
      {
        "distributor": "xbox_game_pass",
        "id": "<id:5>"
      },
      {
        "distributor": "steam",
        "id": "<id:6>"
      },
      {
        "distributor": "playstation",
        "id": "<id:7>"
      },
      {
        "distributor": "playstation",
        "id": "<id:8>"
      },
      {
        "distributor": "xbox_game_pass",
        "id": "<id:9>"
      },
      {
        "distributor": "xbox_title",
        "id": "<id:10>"
      },
      "… 16 more"
    ],
    "overlay": false,
    "overlay_warn": false,
    "overlay_compatibility_hook": false,
    "overlay_methods": 0,
    "hook": false,
    "themes": [
      "Action",
      "Warfare"
    ],
    "linked_applications": [],
    "media": {
      "cover_hash": "7f8275b121cbd881753bad14969257ea",
      "artwork_urls": [
        "https://images-ext-1.discordapp.net/external/5UjV7Madww5K5njtAiKVe2B8gqg-RiR2zIblgXnnLqs/https/images.igdb.com/igdb/image/upload/t_1080p/ar604q.jpg",
        "https://images-ext-1.discordapp.net/external/6KCWk5qfuU9xA7hUyQflx0VuZiavZiZH36VTzWPVCoI/https/images.igdb.com/igdb/image/upload/t_1080p/ar604r.jpg",
        "https://images-ext-1.discordapp.net/external/ECekovq2erBXHWpFIMp6Ypwd2TD4BgFIEdv4ZdUsQWQ/https/images.igdb.com/igdb/image/upload/t_1080p/ar604p.jpg",
        "https://images-ext-1.discordapp.net/external/N2d29aE527Ov2lHiyChlbvZ_6bRCp65zArOgMKmEmT0/https/images.igdb.com/igdb/image/upload/t_1080p/ar604u.jpg",
        "https://images-ext-1.discordapp.net/external/QFspQz8vHVkUrBUxNAJWlCPZZL_s1AIarccPpG4nxNQ/https/images.igdb.com/igdb/image/upload/t_1080p/ar604o.jpg",
        "https://images-ext-1.discordapp.net/external/X7wKUScPDDeW_cYz1ongu0GMeL_6i46AYSUR_S-PrLA/https/images.igdb.com/igdb/image/upload/t_1080p/ar604s.jpg",
        "… 2 more"
      ],
      "icon": {
        "type": "hash",
        "value": "532b24566a2cdde9646052b7e4d43bc0"
      },
      "cover": {
        "type": "hash",
        "value": "7f8275b121cbd881753bad14969257ea"
      },
      "artwork": [
        {
          "type": "url",
          "value": "https://images-ext-1.discordapp.net/external/5UjV7Madww5K5njtAiKVe2B8gqg-RiR2zIblgXnnLqs/https/images.igdb.com/igdb/image/upload/t_1080p/ar604q.jpg"
        },
        {
          "type": "url",
          "value": "https://images-ext-1.discordapp.net/external/6KCWk5qfuU9xA7hUyQflx0VuZiavZiZH36VTzWPVCoI/https/images.igdb.com/igdb/image/upload/t_1080p/ar604r.jpg"
        },
        {
          "type": "url",
          "value": "https://images-ext-1.discordapp.net/external/ECekovq2erBXHWpFIMp6Ypwd2TD4BgFIEdv4ZdUsQWQ/https/images.igdb.com/igdb/image/upload/t_1080p/ar604p.jpg"
        },
        {
          "type": "url",
          "value": "https://images-ext-1.discordapp.net/external/N2d29aE527Ov2lHiyChlbvZ_6bRCp65zArOgMKmEmT0/https/images.igdb.com/igdb/image/upload/t_1080p/ar604u.jpg"
        },
        {
          "type": "url",
          "value": "https://images-ext-1.discordapp.net/external/QFspQz8vHVkUrBUxNAJWlCPZZL_s1AIarccPpG4nxNQ/https/images.igdb.com/igdb/image/upload/t_1080p/ar604o.jpg"
        },
        {
          "type": "url",
          "value": "https://images-ext-1.discordapp.net/external/X7wKUScPDDeW_cYz1ongu0GMeL_6i46AYSUR_S-PrLA/https/images.igdb.com/igdb/image/upload/t_1080p/ar604s.jpg"
        },
        "… 2 more"
      ]
    },
    "first_release_date": "2026-10-23T00:00:00+00:00",
    "genres": [
      23
    ],
    "platforms": [
      0,
      1,
      2
    ],
    "platform_availability": [
      "console",
      "desktop"
    ],
    "cover_image_hash": "7f8275b121cbd881753bad14969257ea",
    "screenshot_urls": [
      "https://images-ext-1.discordapp.net/external/6Quwi0Vk-EV5zssqunflZIuabJAs-KNTuolax9DdBhk/https/images.igdb.com/igdb/image/upload/t_1080p/sc13i3n.jpg",
      "https://images-ext-1.discordapp.net/external/CXHgMq1VDGEJO2XQgpgFhUAeG8Y6Q2VBQI6MNiKFhgI/https/images.igdb.com/igdb/image/upload/t_1080p/sc13i3o.jpg",
      "https://images-ext-1.discordapp.net/external/H9T04tXpFFGAeG4KG7pWBPLVp-mLE0DiY5KHuiN3r7s/https/images.igdb.com/igdb/image/upload/t_1080p/sc13i3t.jpg",
      "https://images-ext-1.discordapp.net/external/J_MCgkZNLbf-bO3ik_xbt1PWjGhwJyMcpObrVZsX7OU/https/images.igdb.com/igdb/image/upload/t_1080p/sc13i3p.jpg",
      "https://images-ext-1.discordapp.net/external/Y6nVJwzC9CsDcdhTB4Flm1GaYCpnqXceGyaZb0Z4GKU/https/images.igdb.com/igdb/image/upload/t_1080p/sc13i3q.jpg",
      "https://images-ext-1.discordapp.net/external/fBmf9za3_WS0uvvjQ_xFAQRBh9jxXi6GGRnasXOqDgw/https/images.igdb.com/igdb/image/upload/t_1080p/sc13i3s.jpg",
      "… 1 more"
    ],
    "websites": [
      {
        "url": "https://discord.gg/callofdutyofficial",
        "category": 18
      },
      {
        "url": "https://www.facebook.com/CallofDuty",
        "category": 4
      },
      {
        "url": "https://www.instagram.com/callofduty/",
        "category": 8
      },
      {
        "url": "https://www.callofduty.com/",
        "category": 1
      },
      {
        "url": "https://www.youtube.com/@CallofDuty",
        "category": 9
      },
      {
        "url": "https://x.com/CallofDuty",
        "category": 5
      },
      "… 1 more"
    ],
    "companies": [
      {
        "name": "<name:6>",
        "roles": [
          1
        ]
      },
      {
        "name": "<name:7>",
        "roles": [
          2
        ]
      }
    ],
    "steam_release_status": 3,
    "reviews": {
      "steam": {
        "rating": 91,
        "rating_count": 22376,
        "recent_rating": 67,
        "recent_rating_count": 11915,
        "localized_rating": 59,
        "localized_rating_count": 382305
      }
    },
    "l30_rank": 7,
    "game_flags": 0,
    "content_classification": {
      "agency_ratings": {
        "esrb": {
          "rating": 4,
          "descriptors": []
        },
        "pegi": {
          "rating": 5,
          "descriptors": []
        }
      }
    }
  }
]
```

<!-- facts:end -->

## What it does

Looks up game details by id for activities and rich presence.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
