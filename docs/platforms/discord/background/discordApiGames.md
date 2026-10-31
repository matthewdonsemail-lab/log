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
| Called from | `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1.js:208 app_store_parental_revocation`, `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1036.js:1 parse`, `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1221.js:2 anonymous`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1245.js:2 anonymous` |
| rea | `ev_6aa5286f991ad79923fc015425a4f7a7c804c4f4533a7191990656362364f121` |

Seen 7 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: click e40 | 1 | 200 | 358 ms | 13047 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 366 ms | 10199 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 318 ms | 8803 ms | — |
| inspect | step 27: type e2077 | 2 | 200 | 325–385 ms | 390–543 ms | — |
| inspect | step 1: goto /login | 1 | 200 | 418 ms | 18655 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 1088 ms | 50864 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder**, step 2: snapshot: 200, 1088 ms

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
    "id": "1445982809792708628",
    "name": "AION 2",
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
    "id": "1539812812854132867",
    "name": "Call of Duty",
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
    "id": "542075586886107149",
    "name": "Apex Legends",
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

**runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder**, step 1: goto /login: 200, 418 ms

Sent:

```json
{
  "query": {
    "game_ids": "1432419613165228174"
  },
  "body": null
}
```

Answered:

```json
[
  {
    "id": "1539812812854132867",
    "name": "Call of Duty",
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
    "game_flags": 0,
    "content_classification": {
      "agency_ratings": "(2 fields)"
    }
  },
  {
    "id": "1432419613165228174",
    "name": "ARC Raiders",
    "aliases": [],
    "description": "ARC Raiders is a multiplayer extraction adventure, set in a lethal future earth, ravaged by a mysterious mechanized threat known as ARC.",
    "icon_hash": "7ce8aa26a0dd472740eebeb9c25e6577",
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
      "… 4 more"
    ],
    "overlay": true,
    "overlay_warn": false,
    "overlay_compatibility_hook": false,
    "overlay_methods": 0,
    "hook": false,
    "themes": [
      "Action",
      "Science fiction"
    ],
    "linked_applications": [
      "(2 fields)"
    ],
    "media": {
      "cover_url": "https://images-ext-1.discordapp.net/external/VhN78B3eWKBk9I6Sc7AfuqPw3RXp34hvQmYwHojgd5c/https/images.igdb.com/igdb/image/upload/t_cover_big/co9rk1.jpg",
      "artwork_urls": "(5 items)",
      "icon": "(2 fields)",
      "cover": "(2 fields)",
      "artwork": "(5 items)"
    },
    "first_release_date": "2025-10-30T00:00:00+00:00",
    "genres": [
      8,
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
    "screenshot_urls": [
      "https://images-ext-1.discordapp.net/external/-2H_dHkUv4miagoU8Yb2V8Y1EsyYTduxLFF8wmORqTY/https/images.igdb.com/igdb/image/upload/t_1080p/sc11kkg.jpg",
      "https://images-ext-1.discordapp.net/external/0FeHzf4pQlwUuP8ASQnP2UK9BA6uTUTshGMQwB4wgDU/https/images.igdb.com/igdb/image/upload/t_1080p/scii62.jpg",
      "https://images-ext-1.discordapp.net/external/0M3bWzOoOevvAcD4JzUQXtddfCWbwhiHsfx88I3CP3I/https/images.igdb.com/igdb/image/upload/t_1080p/sc11kkk.jpg",
      "https://images-ext-1.discordapp.net/external/9uD-nF2qjyxMgchgg3QR3O4PXB4lC--Es9Suf__TZXE/https/images.igdb.com/igdb/image/upload/t_1080p/sc11kkj.jpg",
      "https://images-ext-1.discordapp.net/external/AmzovMyaGaYQke8DgByMwHQb-IGD8CoVk19DhHAGeO4/https/images.igdb.com/igdb/image/upload/t_1080p/sc11kkc.jpg",
      "https://images-ext-1.discordapp.net/external/Bw-Ja2K0wdf1Yivko1G_f0NSroLKzzsDgsrenNCbJBM/https/images.igdb.com/igdb/image/upload/t_1080p/sc11kke.jpg",
      "… 8 more"
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
      "… 5 more"
    ],
    "companies": [
      "(2 fields)",
      "(2 fields)"
    ],
    "steam_release_status": 3,
    "reviews": {
      "steam": "(6 fields)",
      "opencritic": "(3 fields)"
    },
    "opencritic_url": "https://opencritic.com/game/19023/arc-raiders",
    "l30_rank": 17,
    "community_guild_ids": [
      "1107589599045361695",
      "927355923314380901",
      "1002892569824464906",
      "1367740450194063402",
      "1095091795022590034",
      "1173725697248862371",
      "… 29 more"
    ],
    "game_flags": 0,
    "content_classification": {
      "agency_ratings": "(2 fields)"
    }
  }
]
```

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 5: click e40: 200, 358 ms

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
    "id": "1539812812854132867",
    "name": "Call of Duty",
    "aliases": [],
    "description": "The Call of Duty® experience supports Modern Warfare® 4, Black Ops 7 and Call of Duty®: Warzone™.\n\nCall of Duty®: Modern Warfare® 4 brings players Warfare Without Limits.\n\nIn Call of Duty®: Black Ops 7, Treyarch and Raven Software are bringing players the biggest Black Ops ever.\n\nCall of Duty®: Warzone™ is the massive free-to-play combat arena, featuring Battle Royale, Resurgence, and now introduc… (495 chars)",
    "icon_hash": "532b24566a2cdde9646052b7e4d43bc0",
    "executables": [
      {
        "os": "win32",
        "name": "cod.exe",
        "is_launcher": false
      }
    ],
    "third_party_skus": [
      {
        "distributor": "xbox_game_pass",
        "id": "9N8KMNW6942X"
      },
      {
        "distributor": "steam",
        "id": "1938090"
      },
      {
        "distributor": "playstation",
        "id": "PPSA07952_00"
      },
      {
        "distributor": "playstation",
        "id": "PPSA37415_00"
      },
      {
        "distributor": "xbox_game_pass",
        "id": "9NNFG8BQRCXL"
      },
      {
        "distributor": "xbox_title",
        "id": "1680003655"
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
        "name": "Activision",
        "roles": [
          1
        ]
      },
      {
        "name": "Infinity Ward",
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
