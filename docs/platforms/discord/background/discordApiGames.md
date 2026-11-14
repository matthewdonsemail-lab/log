# discordApiGames

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/games` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261114T184328_deepman2/script0.js:232 625075`, `runs/inspect/20261114T184328_deepman2/script0.js:124 559868`, `runs/inspect/20261114T184328_deepman2/script0.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_f6daff8038b4f477b27b852e31fc1f2f76f7dd725b1883891e74b824ed6f0ac3` |

Seen 14 time(s) in 10 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: click e40 | 1 | 200 | 358 ms | 13047 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 366 ms | 10199 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 318 ms | 8803 ms | — |
| inspect | step 27: type e2077 | 2 | 200 | 325–385 ms | 390–543 ms | — |
| inspect | step 1: goto /login | 5 | 200 | 149–570 ms | 18655–1051883 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 1088 ms | 50864 ms | — |
| inspect | step 6: wait 45s | 1 | 200 | 240 ms | 24525 ms | — |
| inspect | step 1: goto /channels/@me | 1 | 200 | 156 ms | 4433 ms | — |
| inspect | step 9: wait 45s | 1 | 200 | 204 ms | 16605 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261114T184328_deepman2**, step 9: wait 45s: 200, 204 ms

Sent:

```json
{
  "query": {
    "game_ids": "363445589247131668"
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
      "Roblox"
    ],
    "description": "Roblox is a massively multiplayer online platform marketed toward creators and players of all ages. It allows users to create their own virtual games using a variety of objects, which they and others can enter and socialize in. Games created on Roblox can be scripted using a sandboxed scripting language based on Lua 5.1 to affect events that occur in-game and create different scenarios.",
    "icon_hash": "f2b60e350a2097289b3b0b877495e55f",
    "executables": [
      {
        "os": "darwin",
        "name": "<name:2>",
        "is_launcher": false
      },
      {
        "os": "win32",
        "name": "<name:3>",
        "is_launcher": false
      },
      {
        "os": "win32",
        "name": "<name:4>",
        "is_launcher": false
      }
    ],
    "third_party_skus": [
      {
        "distributor": "playstation",
        "id": "<id:2>"
      },
      {
        "distributor": "igdb",
        "id": "<id:3>"
      },
      {
        "distributor": "google_play",
        "id": "<id:4>"
      },
      {
        "distributor": "apple_app_store",
        "id": "<id:5>"
      },
      {
        "distributor": "playstation",
        "id": "<id:6>"
      },
      {
        "distributor": "sensortower",
        "id": "<id:7>"
      },
      "… 8 more"
    ],
    "overlay": false,
    "overlay_warn": false,
    "overlay_compatibility_hook": false,
    "overlay_methods": 1,
    "hook": true,
    "themes": [
      "Action",
      "Kids",
      "Open world",
      "Sandbox"
    ],
    "linked_applications": [],
    "media": {
      "cover_url": "https://images-ext-1.discordapp.net/external/EVCrLFOO8DAfZk2h_a8olO3_8P3lpgbqjXCwpQpcKXM/https/images.igdb.com/igdb/image/upload/t_cover_big/cociyw.jpg",
      "artwork_hashes": [
        "e970e33dd647f87dc87f4dc4b28f4627"
      ],
      "icon": {
        "type": "hash",
        "value": "f2b60e350a2097289b3b0b877495e55f"
      },
      "banner": {
        "type": "hash",
        "value": "e970e33dd647f87dc87f4dc4b28f4627"
      },
      "cover": {
        "type": "url",
        "value": "https://images-ext-1.discordapp.net/external/EVCrLFOO8DAfZk2h_a8olO3_8P3lpgbqjXCwpQpcKXM/https/images.igdb.com/igdb/image/upload/t_cover_big/cociyw.jpg"
      },
      "artwork": [
        {
          "type": "hash",
          "value": "e970e33dd647f87dc87f4dc4b28f4627"
        }
      ]
    },
    "first_release_date": "2006-09-01T00:00:00+00:00",
    "genres": [
      8,
      28,
      5
    ],
    "platforms": [
      0,
      1,
      2,
      3,
      4,
      7
    ],
    "platform_availability": [
      "console",
      "desktop",
      "mobile"
    ],
    "banner_hash": "e970e33dd647f87dc87f4dc4b28f4627",
    "screenshot_urls": [
      "https://images-ext-1.discordapp.net/external/7QP_AtcqrL5Zo2XH9QYXKZSutpDYrUfzZO18W0Mocog/https/images.igdb.com/igdb/image/upload/t_1080p/sc12f2b.jpg",
      "https://images-ext-1.discordapp.net/external/AD3oaKWVNWd4hlW6WrvXQFlUL2WeNZet83LVIIyCyRI/https/images.igdb.com/igdb/image/upload/t_1080p/scyxw8.jpg",
      "https://images-ext-1.discordapp.net/external/M_9mwgc0vC1DwAh1u1WeUH6up0LZvP8cXxDzlb5Fi9M/https/images.igdb.com/igdb/image/upload/t_1080p/sc12f2c.jpg",
      "https://images-ext-1.discordapp.net/external/M_eG7QR4WRVXdAeAisDa0UACvoCKl7RAKbhDsMpI2E8/https/images.igdb.com/igdb/image/upload/t_1080p/scyxwd.jpg",
      "https://images-ext-1.discordapp.net/external/PCOKTAfXaBeqTHASK3iMTLinivFNE2OzkE-gd_iY6Z0/https/images.igdb.com/igdb/image/upload/t_1080p/scyxw9.jpg",
      "https://images-ext-1.discordapp.net/external/_eC04hC8OYO-E2bD5jWF47rwXx7aFpfxs_Gto94Bsv0/https/images.igdb.com/igdb/image/upload/t_1080p/scyxwc.jpg",
      "… 11 more"
    ],
    "websites": [
      {
        "url": "https://www.roblox.com",
        "category": 22
      },
      {
        "url": "https://play.google.com/store/apps/details?id=<id:4>",
        "category": 12
      },
      {
        "url": "https://www.facebook.com/Roblox",
        "category": 4
      },
      {
        "url": "https://www.instagram.com/roblox",
        "category": 8
      },
      {
        "url": "https://apps.apple.com/us/app/roblox/id431946152?platform=ipad",
        "category": 11
      },
      {
        "url": "https://apps.apple.com/us/app/roblox/id431946152",
        "category": 10
      },
      "… 7 more"
    ],
    "companies": [
      {
        "name": "<name:5>",
        "roles": [
          1,
          2
        ]
      }
    ],
    "reviews": {
      "opencritic": {
        "top_critic_rating_count": 1
      },
      "app_store": {
        "rating": 4.5,
        "rating_count": 20605694,
        "global_rating_count": 48021663
      },
      "google_play": {
        "rating": 4.199999809265137,
        "rating_count": 53708611
      }
    },
    "opencritic_url": "https://opencritic.com/game/1927/roblox",
    "l30_rank": 1,
    "community_guild_ids": [
      "1376018788041887795",
      "1358536829636448418",
      "1254502244926361620",
      "1328110081136398427",
      "871820516825116723",
      "150074202727251969",
      "… 34 more"
    ],
    "game_flags": 0,
    "content_classification": {
      "agency_ratings": {
        "esrb": {
          "rating": 3,
          "descriptors": []
        },
        "pegi": {
          "rating": 3,
          "descriptors": []
        },
        "apple": {
          "rating": 4,
          "descriptors": [
            32,
            33,
            2,
            3,
            34,
            7,
            "… 4 more"
          ]
        }
      }
    }
  }
]
```

**runs/inspect/20261113T231616_deepman2**, step 6: wait 45s: 200, 240 ms

Sent:

```json
{
  "query": {
    "game_ids": "363445589247131668"
  },
  "body": null
}
```

Answered:

```json
[
  {
    "id": "<id:8>",
    "name": "<name:6>",
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
  },
  {
    "id": "<id:1>",
    "name": "<name:1>",
    "aliases": [
      "Roblox"
    ],
    "description": "Roblox is a massively multiplayer online platform marketed toward creators and players of all ages. It allows users to create their own virtual games using a variety of objects, which they and others can enter and socialize in. Games created on Roblox can be scripted using a sandboxed scripting language based on Lua 5.1 to affect events that occur in-game and create different scenarios.",
    "icon_hash": "f2b60e350a2097289b3b0b877495e55f",
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
      "… 8 more"
    ],
    "overlay": false,
    "overlay_warn": false,
    "overlay_compatibility_hook": false,
    "overlay_methods": 1,
    "hook": true,
    "themes": [
      "Action",
      "Kids",
      "Open world",
      "Sandbox"
    ],
    "linked_applications": [],
    "media": {
      "cover_url": "https://images-ext-1.discordapp.net/external/EVCrLFOO8DAfZk2h_a8olO3_8P3lpgbqjXCwpQpcKXM/https/images.igdb.com/igdb/image/upload/t_cover_big/cociyw.jpg",
      "artwork_hashes": "(1 items)",
      "icon": "(2 fields)",
      "banner": "(2 fields)",
      "cover": "(2 fields)",
      "artwork": "(1 items)"
    },
    "first_release_date": "2006-09-01T00:00:00+00:00",
    "genres": [
      8,
      28,
      5
    ],
    "platforms": [
      0,
      1,
      2,
      3,
      4,
      7
    ],
    "platform_availability": [
      "console",
      "desktop",
      "mobile"
    ],
    "banner_hash": "e970e33dd647f87dc87f4dc4b28f4627",
    "screenshot_urls": [
      "https://images-ext-1.discordapp.net/external/7QP_AtcqrL5Zo2XH9QYXKZSutpDYrUfzZO18W0Mocog/https/images.igdb.com/igdb/image/upload/t_1080p/sc12f2b.jpg",
      "https://images-ext-1.discordapp.net/external/AD3oaKWVNWd4hlW6WrvXQFlUL2WeNZet83LVIIyCyRI/https/images.igdb.com/igdb/image/upload/t_1080p/scyxw8.jpg",
      "https://images-ext-1.discordapp.net/external/M_9mwgc0vC1DwAh1u1WeUH6up0LZvP8cXxDzlb5Fi9M/https/images.igdb.com/igdb/image/upload/t_1080p/sc12f2c.jpg",
      "https://images-ext-1.discordapp.net/external/M_eG7QR4WRVXdAeAisDa0UACvoCKl7RAKbhDsMpI2E8/https/images.igdb.com/igdb/image/upload/t_1080p/scyxwd.jpg",
      "https://images-ext-1.discordapp.net/external/PCOKTAfXaBeqTHASK3iMTLinivFNE2OzkE-gd_iY6Z0/https/images.igdb.com/igdb/image/upload/t_1080p/scyxw9.jpg",
      "https://images-ext-1.discordapp.net/external/_eC04hC8OYO-E2bD5jWF47rwXx7aFpfxs_Gto94Bsv0/https/images.igdb.com/igdb/image/upload/t_1080p/scyxwc.jpg",
      "… 11 more"
    ],
    "websites": [
      "(2 fields)",
      "(2 fields)",
      "(2 fields)",
      "(2 fields)",
      "(2 fields)",
      "(2 fields)",
      "… 7 more"
    ],
    "companies": [
      "(2 fields)"
    ],
    "reviews": {
      "opencritic": "(1 fields)",
      "app_store": "(3 fields)",
      "google_play": "(2 fields)"
    },
    "opencritic_url": "https://opencritic.com/game/1927/roblox",
    "l30_rank": 1,
    "community_guild_ids": [
      "1376018788041887795",
      "1358536829636448418",
      "1254502244926361620",
      "1328110081136398427",
      "871820516825116723",
      "150074202727251969",
      "… 34 more"
    ],
    "game_flags": 0,
    "content_classification": {
      "agency_ratings": "(3 fields)"
    }
  }
]
```

**runs/inspect/20261109T194954_deepman2**, step 1: goto /login: 200, 149 ms

Sent:

```json
{
  "query": {
    "game_ids": "363445589247131668"
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
      "Roblox"
    ],
    "description": "Roblox is a massively multiplayer online platform marketed toward creators and players of all ages. It allows users to create their own virtual games using a variety of objects, which they and others can enter and socialize in. Games created on Roblox can be scripted using a sandboxed scripting language based on Lua 5.1 to affect events that occur in-game and create different scenarios.",
    "icon_hash": "f2b60e350a2097289b3b0b877495e55f",
    "executables": [
      {
        "os": "win32",
        "name": "<name:4>",
        "is_launcher": false
      },
      {
        "os": "win32",
        "name": "<name:3>",
        "is_launcher": false
      },
      {
        "os": "darwin",
        "name": "<name:2>",
        "is_launcher": false
      }
    ],
    "third_party_skus": [
      {
        "distributor": "xbox",
        "id": "<id:9>"
      },
      {
        "distributor": "opencritic",
        "id": "<id:10>"
      },
      {
        "distributor": "sensortower",
        "id": "<id:7>"
      },
      {
        "distributor": "xbox_title",
        "id": "<id:11>"
      },
      {
        "distributor": "gdco",
        "id": "<id:12>"
      },
      {
        "distributor": "playstation",
        "id": "<id:2>"
      },
      "… 8 more"
    ],
    "overlay": false,
    "overlay_warn": false,
    "overlay_compatibility_hook": false,
    "overlay_methods": 1,
    "hook": true,
    "themes": [
      "Action",
      "Kids",
      "Open world",
      "Sandbox"
    ],
    "linked_applications": [],
    "media": {
      "cover_url": "https://images-ext-1.discordapp.net/external/EVCrLFOO8DAfZk2h_a8olO3_8P3lpgbqjXCwpQpcKXM/https/images.igdb.com/igdb/image/upload/t_cover_big/cociyw.jpg",
      "artwork_hashes": [
        "e970e33dd647f87dc87f4dc4b28f4627"
      ],
      "icon": {
        "type": "hash",
        "value": "f2b60e350a2097289b3b0b877495e55f"
      },
      "banner": {
        "type": "hash",
        "value": "e970e33dd647f87dc87f4dc4b28f4627"
      },
      "cover": {
        "type": "url",
        "value": "https://images-ext-1.discordapp.net/external/EVCrLFOO8DAfZk2h_a8olO3_8P3lpgbqjXCwpQpcKXM/https/images.igdb.com/igdb/image/upload/t_cover_big/cociyw.jpg"
      },
      "artwork": [
        {
          "type": "hash",
          "value": "e970e33dd647f87dc87f4dc4b28f4627"
        }
      ]
    },
    "first_release_date": "2006-09-01T00:00:00+00:00",
    "genres": [
      8,
      28,
      5
    ],
    "platforms": [
      0,
      1,
      2,
      3,
      4,
      7
    ],
    "platform_availability": [
      "console",
      "desktop",
      "mobile"
    ],
    "banner_hash": "e970e33dd647f87dc87f4dc4b28f4627",
    "screenshot_urls": [
      "https://images-ext-1.discordapp.net/external/7QP_AtcqrL5Zo2XH9QYXKZSutpDYrUfzZO18W0Mocog/https/images.igdb.com/igdb/image/upload/t_1080p/sc12f2b.jpg",
      "https://images-ext-1.discordapp.net/external/AD3oaKWVNWd4hlW6WrvXQFlUL2WeNZet83LVIIyCyRI/https/images.igdb.com/igdb/image/upload/t_1080p/scyxw8.jpg",
      "https://images-ext-1.discordapp.net/external/M_9mwgc0vC1DwAh1u1WeUH6up0LZvP8cXxDzlb5Fi9M/https/images.igdb.com/igdb/image/upload/t_1080p/sc12f2c.jpg",
      "https://images-ext-1.discordapp.net/external/M_eG7QR4WRVXdAeAisDa0UACvoCKl7RAKbhDsMpI2E8/https/images.igdb.com/igdb/image/upload/t_1080p/scyxwd.jpg",
      "https://images-ext-1.discordapp.net/external/PCOKTAfXaBeqTHASK3iMTLinivFNE2OzkE-gd_iY6Z0/https/images.igdb.com/igdb/image/upload/t_1080p/scyxw9.jpg",
      "https://images-ext-1.discordapp.net/external/_eC04hC8OYO-E2bD5jWF47rwXx7aFpfxs_Gto94Bsv0/https/images.igdb.com/igdb/image/upload/t_1080p/scyxwc.jpg",
      "… 11 more"
    ],
    "websites": [
      {
        "url": "https://www.roblox.com",
        "category": 22
      },
      {
        "url": "https://play.google.com/store/apps/details?id=<id:4>",
        "category": 12
      },
      {
        "url": "https://www.facebook.com/Roblox",
        "category": 4
      },
      {
        "url": "https://www.instagram.com/roblox",
        "category": 8
      },
      {
        "url": "https://apps.apple.com/us/app/roblox/id431946152?platform=ipad",
        "category": 11
      },
      {
        "url": "https://apps.apple.com/us/app/roblox/id431946152",
        "category": 10
      },
      "… 7 more"
    ],
    "companies": [
      {
        "name": "<name:5>",
        "roles": [
          1,
          2
        ]
      }
    ],
    "reviews": {
      "opencritic": {
        "top_critic_rating_count": 1
      },
      "app_store": {
        "rating": 4.5,
        "rating_count": 20558162,
        "global_rating_count": 47888769
      },
      "google_play": {
        "rating": 4.199999809265137,
        "rating_count": 53538547
      }
    },
    "opencritic_url": "https://opencritic.com/game/1927/roblox",
    "l30_rank": 1,
    "community_guild_ids": [
      "1376018788041887795",
      "1358536829636448418",
      "1254502244926361620",
      "871820516825116723",
      "1328110081136398427",
      "150074202727251969",
      "… 34 more"
    ],
    "game_flags": 0,
    "content_classification": {
      "agency_ratings": {
        "esrb": {
          "rating": 3,
          "descriptors": []
        },
        "pegi": {
          "rating": 3,
          "descriptors": []
        },
        "apple": {
          "rating": 4,
          "descriptors": [
            32,
            33,
            2,
            3,
            34,
            7,
            "… 4 more"
          ]
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
