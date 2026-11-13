# discordApiUsersBadges

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/users/badges` |
| Sends | — |
| Reads | `badges` |
| Called from | `runs/inspect/20261113T044840_<name:1>/script0.js:232 625075`, `runs/inspect/20261113T044840_<name:1>/script0.js:124 559868`, `runs/inspect/20261113T044840_<name:1>/script0.js:124 961943`, `runs/inspect/20261113T044840_<name:1>/script1294.js:1 634654` |
| rea | `ev_52a6ccf0e7060826b70943adeeae519fa1d5149750e62a9947fb4cb95579f428` |

Seen 8 time(s) in 5 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 397 ms | 7772 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 462 ms | 6529 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 463 ms | 5243 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 584 ms | 4841 ms | — |
| inspect | step 31: wait 60s | 1 | 200 | 611 ms | 241902 ms | — |
| inspect | step 1: goto /login | 2 | 200 | 413–530 ms | 11383–39337 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 691 ms | 48674 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T044840_<name:1>**, step 1: goto /login: 200, 413 ms

Sent:

```json
null
```

Answered:

```json
{
  "badges": [
    {
      "badge_id": 22,
      "name": "<name:1>",
      "rarity": 5,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/ba692509432a91ed75d9460662b05c44a5fefb565566fa7df7698597a75f03ee.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/badge-icons/5e74e9b61934fc1f67c65515d1f7e60d.png",
      "is_earnable": false,
      "owned": false,
      "hidden": false
    },
    {
      "badge_id": 18,
      "name": "<name:2>",
      "description": "<messageText>",
      "leveling_instructions": "Unlock more levels by keeping your account active.",
      "info_label": "1 year",
      "rarity": 1,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/465f6cc202c60d0e250f986fa035ed461e275adddbf875106089527a2c16ef2c.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/assets/content/8da9339b9d405f0194947e607c839b1bd43436211e5bf07fe7f4ce005578e9e4.png",
      "complex_icon_static_url": "https://cdn.discordapp.com/assets/content/a020845b216d1b7ab5d32a0b65c7f706a87342546d5283b4fb7f7661e6adb5f8.svg",
      "is_earnable": true,
      "owned": true,
      "hidden": false,
      "obtained_at": "2026-11-02T07:24:49.677000+00:00",
      "current_tier": "one_year",
      "next_tier": "two_years",
      "tier_obtained_at": {
        "one_year": "2026-11-02T07:24:49.677000+00:00"
      },
      "tiers": [
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "… 4 more"
      ],
      "progress": [
        "(7 fields)"
      ]
    },
    {
      "badge_id": 21,
      "name": "<name:3>",
      "description": "<messageText>",
      "leveling_instructions": "Unlock more levels by playing more games.",
      "info_label": "3 games played",
      "rarity": 1,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/ed18d5976c01a4ea19f5a13af08f0547582405cbe48b098b0822e352b8e0a822.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/assets/content/cbd75cae9bca1c49b35eb0d9c189af4c8604b4f69a1de17ae550db9f03cbd371.png",
      "complex_icon_static_url": "https://cdn.discordapp.com/assets/content/796135a2c54b35bc73ba0928b8fb6a9e94be5c97573800ce0a20830b451650b9.svg",
      "is_earnable": true,
      "owned": true,
      "hidden": false,
      "obtained_at": "2026-10-28T14:18:57.525616+00:00",
      "current_tier": "sampler",
      "next_tier": "dabbler",
      "tier_obtained_at": {
        "sampler": "2026-10-28T14:18:57.525606+00:00"
      },
      "tiers": [
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "… 4 more"
      ],
      "progress": [
        "(7 fields)"
      ]
    },
    {
      "badge_id": 20,
      "name": "<name:4>",
      "description": "<messageText>",
      "leveling_instructions": "Unlock more levels by playing more hours of games.",
      "info_label": "37 hours of games played",
      "rarity": 1,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/e0c82f41bcad94a2a52713800fbef7687d0d2c6a6066b09d5e5876156d086e1a.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/assets/content/d6ab0696aae97fca8e6b2b88d4117f09f9ea895d4f0cebee770564369ff06873.png",
      "complex_icon_static_url": "https://cdn.discordapp.com/assets/content/c12fc54ecf68afdeba97999f5378f93f10e476fb1c87e90a881ec5667e1ff9d1.svg",
      "is_earnable": true,
      "owned": true,
      "hidden": false,
      "obtained_at": "2026-09-26T15:44:58.490622+00:00",
      "current_tier": "dedicated",
      "next_tier": "committed",
      "tier_obtained_at": {
        "recreational": "2026-10-08T18:00:03.160653+00:00",
        "dedicated": "2026-10-26T16:26:08.509962+00:00",
        "casual": "2026-09-26T15:44:58.490612+00:00"
      },
      "tiers": [
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "… 4 more"
      ],
      "progress": [
        "(7 fields)"
      ]
    },
    {
      "badge_id": 19,
      "name": "<name:5>",
      "description": "<messageText>",
      "leveling_instructions": "Unlock more levels by streaming more hours.",
      "info_label": "987 hours streamed to others",
      "rarity": 2,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/06b6206db966635cf626651bdb94eacce5a23ab05dc7f600f7d31aa482b2058c.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/assets/content/20e0b4ff7fc63681efe95082a69f9bfe7259f1485fa6fa6cebaf709336f42b90.png",
      "complex_icon_static_url": "https://cdn.discordapp.com/assets/content/54f39ff20bdd89d59288e41909344ef6d7d71f7d45d0b84e91acee34b6e973f3.svg",
      "is_earnable": true,
      "owned": true,
      "hidden": false,
      "obtained_at": "2026-07-29T21:31:11.773738+00:00",
      "current_tier": "star",
      "next_tier": "sensation",
      "tier_obtained_at": {
        "breakout": "2026-07-29T21:31:11.773730+00:00",
        "trendsetter": "2026-07-29T21:31:11.773730+00:00",
        "newcomer": "2026-07-29T21:31:11.773730+00:00",
        "headliner": "2026-07-29T21:31:11.773730+00:00",
        "star": "2026-07-29T21:31:11.773730+00:00",
        "standout": "2026-07-29T21:31:11.773730+00:00",
        "fledgling": "2026-07-29T21:31:11.773730+00:00"
      },
      "tiers": [
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "… 4 more"
      ],
      "progress": [
        "(7 fields)"
      ]
    },
    {
      "badge_id": 1,
      "name": "<name:6>",
      "description": "<messageText>",
      "leveling_instructions": "Unlock more levels the longer you have Nitro.",
      "rarity": 1,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/f61ddf640d11d9bdfaf9de265eb862edf28986b659e545f293b54adf229433af.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/assets/content/835f1fbfc62861a12021328aeb953e68b205383e57c477a754eecef9237fbaa6.png",
      "complex_icon_static_url": "https://cdn.discordapp.com/assets/content/a6c7aa95118d579d8a26d16b79cf5761a6fa95d3f4ec24c12907e32223e26a20.svg",
      "is_earnable": true,
      "owned": false,
      "hidden": false,
      "next_tier": "starter",
      "tier_obtained_at": {},
      "tiers": [
        "(8 fields)",
        "(10 fields)",
        "(10 fields)",
        "(10 fields)",
        "(10 fields)",
        "(10 fields)",
        "… 3 more"
      ]
    },
    "… 17 more"
  ]
}
```

**runs/inspect/20261030T222341_<name:1>**, step 2: snapshot: 200, 691 ms

Sent:

```json
null
```

Answered:

```json
{
  "badges": [
    {
      "badge_id": 22,
      "name": "<name:1>",
      "rarity": 5,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/ba692509432a91ed75d9460662b05c44a5fefb565566fa7df7698597a75f03ee.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/badge-icons/5e74e9b61934fc1f67c65515d1f7e60d.png",
      "is_earnable": false,
      "owned": false,
      "hidden": false
    },
    {
      "badge_id": 21,
      "name": "<name:3>",
      "description": "<messageText>",
      "leveling_instructions": "Unlock more levels by playing more games.",
      "info_label": "2 games played",
      "rarity": 1,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/ed18d5976c01a4ea19f5a13af08f0547582405cbe48b098b0822e352b8e0a822.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/assets/content/cbd75cae9bca1c49b35eb0d9c189af4c8604b4f69a1de17ae550db9f03cbd371.png",
      "complex_icon_static_url": "https://cdn.discordapp.com/assets/content/796135a2c54b35bc73ba0928b8fb6a9e94be5c97573800ce0a20830b451650b9.svg",
      "is_earnable": true,
      "owned": true,
      "hidden": false,
      "obtained_at": "2026-10-28T14:18:57.525616+00:00",
      "current_tier": "sampler",
      "next_tier": "dabbler",
      "tier_obtained_at": {
        "sampler": "2026-10-28T14:18:57.525606+00:00"
      },
      "tiers": [
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "… 4 more"
      ],
      "progress": [
        "(7 fields)"
      ]
    },
    {
      "badge_id": 20,
      "name": "<name:4>",
      "description": "<messageText>",
      "leveling_instructions": "Unlock more levels by playing more hours of games.",
      "info_label": "25 hours of games played",
      "rarity": 1,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/e0c82f41bcad94a2a52713800fbef7687d0d2c6a6066b09d5e5876156d086e1a.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/assets/content/d6ab0696aae97fca8e6b2b88d4117f09f9ea895d4f0cebee770564369ff06873.png",
      "complex_icon_static_url": "https://cdn.discordapp.com/assets/content/c12fc54ecf68afdeba97999f5378f93f10e476fb1c87e90a881ec5667e1ff9d1.svg",
      "is_earnable": true,
      "owned": true,
      "hidden": false,
      "obtained_at": "2026-09-26T15:44:58.490622+00:00",
      "current_tier": "dedicated",
      "next_tier": "committed",
      "tier_obtained_at": {
        "recreational": "2026-10-08T18:00:03.160653+00:00",
        "dedicated": "2026-10-26T16:26:08.509962+00:00",
        "casual": "2026-09-26T15:44:58.490612+00:00"
      },
      "tiers": [
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "… 4 more"
      ],
      "progress": [
        "(7 fields)"
      ]
    },
    {
      "badge_id": 19,
      "name": "<name:5>",
      "description": "<messageText>",
      "leveling_instructions": "Unlock more levels by streaming more hours.",
      "info_label": "970 hours streamed to others",
      "rarity": 2,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/06b6206db966635cf626651bdb94eacce5a23ab05dc7f600f7d31aa482b2058c.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/assets/content/20e0b4ff7fc63681efe95082a69f9bfe7259f1485fa6fa6cebaf709336f42b90.png",
      "complex_icon_static_url": "https://cdn.discordapp.com/assets/content/54f39ff20bdd89d59288e41909344ef6d7d71f7d45d0b84e91acee34b6e973f3.svg",
      "is_earnable": true,
      "owned": true,
      "hidden": false,
      "obtained_at": "2026-07-29T21:31:11.773738+00:00",
      "current_tier": "star",
      "next_tier": "sensation",
      "tier_obtained_at": {
        "breakout": "2026-07-29T21:31:11.773730+00:00",
        "trendsetter": "2026-07-29T21:31:11.773730+00:00",
        "newcomer": "2026-07-29T21:31:11.773730+00:00",
        "headliner": "2026-07-29T21:31:11.773730+00:00",
        "star": "2026-07-29T21:31:11.773730+00:00",
        "standout": "2026-07-29T21:31:11.773730+00:00",
        "fledgling": "2026-07-29T21:31:11.773730+00:00"
      },
      "tiers": [
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "… 4 more"
      ],
      "progress": [
        "(7 fields)"
      ]
    },
    {
      "badge_id": 1,
      "name": "<name:6>",
      "description": "<messageText>",
      "leveling_instructions": "Unlock more levels the longer you have Nitro.",
      "rarity": 1,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/f61ddf640d11d9bdfaf9de265eb862edf28986b659e545f293b54adf229433af.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/assets/content/835f1fbfc62861a12021328aeb953e68b205383e57c477a754eecef9237fbaa6.png",
      "complex_icon_static_url": "https://cdn.discordapp.com/assets/content/a6c7aa95118d579d8a26d16b79cf5761a6fa95d3f4ec24c12907e32223e26a20.svg",
      "is_earnable": true,
      "owned": false,
      "hidden": false,
      "next_tier": "starter",
      "tier_obtained_at": {},
      "tiers": [
        "(8 fields)",
        "(10 fields)",
        "(10 fields)",
        "(10 fields)",
        "(10 fields)",
        "(10 fields)",
        "… 3 more"
      ]
    },
    {
      "badge_id": 2,
      "name": "<name:7>",
      "rarity": 5,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/4c8defb95c334422c34032aa26a8b1703a1be6c3e10e0cec06e8364e85131d6f.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/badge-icons/3f9748e53446a137a052f3454e2de41e.png",
      "is_earnable": false,
      "owned": false,
      "hidden": false
    },
    "… 16 more"
  ]
}
```

**runs/inspect/20261028T065202_<name:1>**, step 1: goto /channels/@me/<id>: 200, 397 ms

Sent:

```json
null
```

Answered:

```json
{
  "badges": [
    {
      "badge_id": 22,
      "name": "<name:1>",
      "rarity": 5,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/ba692509432a91ed75d9460662b05c44a5fefb565566fa7df7698597a75f03ee.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/badge-icons/5e74e9b61934fc1f67c65515d1f7e60d.png",
      "is_earnable": false,
      "owned": false,
      "hidden": false
    },
    {
      "badge_id": 20,
      "name": "<name:4>",
      "description": "<messageText>",
      "leveling_instructions": "Unlock more levels by playing more hours of games.",
      "info_label": "20 hours of games played",
      "rarity": 1,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/e0c82f41bcad94a2a52713800fbef7687d0d2c6a6066b09d5e5876156d086e1a.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/assets/content/d6ab0696aae97fca8e6b2b88d4117f09f9ea895d4f0cebee770564369ff06873.png",
      "complex_icon_static_url": "https://cdn.discordapp.com/assets/content/c12fc54ecf68afdeba97999f5378f93f10e476fb1c87e90a881ec5667e1ff9d1.svg",
      "is_earnable": true,
      "owned": true,
      "hidden": false,
      "obtained_at": "2026-09-26T15:44:58.490622+00:00",
      "current_tier": "dedicated",
      "next_tier": "committed",
      "tier_obtained_at": {
        "recreational": "2026-10-08T18:00:03.160653+00:00",
        "dedicated": "2026-10-26T16:26:08.509962+00:00",
        "casual": "2026-09-26T15:44:58.490612+00:00"
      },
      "tiers": [
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "… 4 more"
      ],
      "progress": [
        "(7 fields)"
      ]
    },
    {
      "badge_id": 19,
      "name": "<name:5>",
      "description": "<messageText>",
      "leveling_instructions": "Unlock more levels by streaming more hours.",
      "info_label": "969 hours streamed to others",
      "rarity": 2,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/06b6206db966635cf626651bdb94eacce5a23ab05dc7f600f7d31aa482b2058c.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/assets/content/20e0b4ff7fc63681efe95082a69f9bfe7259f1485fa6fa6cebaf709336f42b90.png",
      "complex_icon_static_url": "https://cdn.discordapp.com/assets/content/7c0453de56ed3c649d6c1a7e44e8449a5adffe500559718256842b1784f52e8c.svg",
      "is_earnable": true,
      "owned": true,
      "hidden": false,
      "obtained_at": "2026-07-29T21:31:11.773738+00:00",
      "current_tier": "star",
      "next_tier": "sensation",
      "tier_obtained_at": {
        "breakout": "2026-07-29T21:31:11.773730+00:00",
        "trendsetter": "2026-07-29T21:31:11.773730+00:00",
        "newcomer": "2026-07-29T21:31:11.773730+00:00",
        "headliner": "2026-07-29T21:31:11.773730+00:00",
        "star": "2026-07-29T21:31:11.773730+00:00",
        "standout": "2026-07-29T21:31:11.773730+00:00",
        "fledgling": "2026-07-29T21:31:11.773730+00:00"
      },
      "tiers": [
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "(9 fields)",
        "… 4 more"
      ],
      "progress": [
        "(7 fields)"
      ]
    },
    {
      "badge_id": 1,
      "name": "<name:6>",
      "description": "<messageText>",
      "leveling_instructions": "Unlock more levels the longer you have Nitro.",
      "rarity": 1,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/f61ddf640d11d9bdfaf9de265eb862edf28986b659e545f293b54adf229433af.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/assets/content/835f1fbfc62861a12021328aeb953e68b205383e57c477a754eecef9237fbaa6.png",
      "complex_icon_static_url": "https://cdn.discordapp.com/assets/content/efca20130099acbc7778cd822b6f44aa7dd4be3cc6c6f7c59431732feb93db92.svg",
      "is_earnable": true,
      "owned": false,
      "hidden": false,
      "next_tier": "starter",
      "tier_obtained_at": {},
      "tiers": [
        "(8 fields)",
        "(10 fields)",
        "(10 fields)",
        "(10 fields)",
        "(10 fields)",
        "(10 fields)",
        "… 3 more"
      ]
    },
    {
      "badge_id": 2,
      "name": "<name:7>",
      "rarity": 5,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/4c8defb95c334422c34032aa26a8b1703a1be6c3e10e0cec06e8364e85131d6f.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/badge-icons/3f9748e53446a137a052f3454e2de41e.png",
      "is_earnable": false,
      "owned": false,
      "hidden": false
    },
    {
      "badge_id": 3,
      "name": "<name:8>",
      "rarity": 5,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/40378bb73aae6b093f7a751fb3d6d5d85886036635c276ffad940818aa7b58ce.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/badge-icons/fee1624003e2fee35cb398e125dc479b.png",
      "is_earnable": false,
      "owned": false,
      "hidden": false
    },
    "… 16 more"
  ]
}
```

<!-- facts:end -->

## What it does

Reads a user's profile badges to draw on their profile.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
