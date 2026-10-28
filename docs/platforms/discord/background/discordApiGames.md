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
| Called from | `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:160 app_store_parental_revocation`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script892.js:1 parse`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script1090.js:2 anonymous`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:158 2242` |
| rea | `ev_701a3070e0609dd573d8757a1b8cb2d928f618bb0b619486734aa69634b43c2b` |

Seen 5 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: click e40 | 1 | 200 | 358 ms | 13047 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 366 ms | 10199 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 318 ms | 8803 ms | — |
| inspect | step 27: type e2077 | 2 | 200 | 325–385 ms | 390–543 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

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

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 9: goto /channels/@me: 200, 366 ms

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
        "id": "9N201KQXS5BM"
      },
      {
        "distributor": "playstation",
        "id": "PPSA37414_00"
      },
      {
        "distributor": "playstation",
        "id": "PPSA37413_00"
      },
      {
        "distributor": "playstation",
        "id": "PPSA07952_00"
      },
      {
        "distributor": "playstation",
        "id": "PPSA37417_00"
      },
      {
        "distributor": "playstation",
        "id": "PPSA07953_00"
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

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 25: goto /channels/@me: 200, 318 ms

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
        "distributor": "playstation",
        "id": "PPSA37417_00"
      },
      {
        "distributor": "igdb",
        "id": "403310"
      },
      {
        "distributor": "playstation",
        "id": "PPSA01649_00"
      },
      {
        "distributor": "steam",
        "id": "1938090"
      },
      {
        "distributor": "playstation",
        "id": "PPSA07953_00"
      },
      {
        "distributor": "playstation",
        "id": "PPSA07952_00"
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
