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
| Called from | `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:160 app_store_parental_revocation`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script892.js:1 parse`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script1090.js:2 anonymous`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:158 2242` |
| rea | `ev_09cdf33ae7232660de218f3d5cf01b7960b31030e504f4db4bbe3cfefaa12dc0` |

Seen 5 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 397 ms | 7772 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 462 ms | 6529 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 463 ms | 5243 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 584 ms | 4841 ms | — |
| inspect | step 31: wait 60s | 1 | 200 | 611 ms | 241902 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder**, step 1: goto /channels/@me/<id>: 200, 397 ms

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
      "name": "Discord Staff",
      "rarity": 5,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/ba692509432a91ed75d9460662b05c44a5fefb565566fa7df7698597a75f03ee.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/badge-icons/5e74e9b61934fc1f67c65515d1f7e60d.png",
      "is_earnable": false,
      "owned": false,
      "hidden": false
    },
    {
      "badge_id": 20,
      "name": "Game Time",
      "description": "Play more hours of detectable PC games with Discord open to level up this badge.",
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
      "name": "Streaming",
      "description": "Stream more hours to other users to level up this badge.",
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
      "name": "Nitro",
      "description": "Subscribe to Nitro to unlock this badge.",
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
      "name": "Discord Partner",
      "rarity": 5,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/4c8defb95c334422c34032aa26a8b1703a1be6c3e10e0cec06e8364e85131d6f.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/badge-icons/3f9748e53446a137a052f3454e2de41e.png",
      "is_earnable": false,
      "owned": false,
      "hidden": false
    },
    {
      "badge_id": 3,
      "name": "Moderator Program Alumni",
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

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 5: click e40: 200, 462 ms

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
      "name": "Discord Staff",
      "rarity": 5,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/ba692509432a91ed75d9460662b05c44a5fefb565566fa7df7698597a75f03ee.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/badge-icons/5e74e9b61934fc1f67c65515d1f7e60d.png",
      "is_earnable": false,
      "owned": false,
      "hidden": false
    },
    {
      "badge_id": 20,
      "name": "Game Time",
      "description": "Play more hours of detectable PC games with Discord open to level up this badge.",
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
      "name": "Streaming",
      "description": "Stream more hours to other users to level up this badge.",
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
      "name": "Nitro",
      "description": "Subscribe to Nitro to unlock this badge.",
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
      "name": "Discord Partner",
      "rarity": 5,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/4c8defb95c334422c34032aa26a8b1703a1be6c3e10e0cec06e8364e85131d6f.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/badge-icons/3f9748e53446a137a052f3454e2de41e.png",
      "is_earnable": false,
      "owned": false,
      "hidden": false
    },
    {
      "badge_id": 3,
      "name": "Moderator Program Alumni",
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

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 9: goto /channels/@me: 200, 463 ms

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
      "name": "Discord Staff",
      "rarity": 5,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/ba692509432a91ed75d9460662b05c44a5fefb565566fa7df7698597a75f03ee.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/badge-icons/5e74e9b61934fc1f67c65515d1f7e60d.png",
      "is_earnable": false,
      "owned": false,
      "hidden": false
    },
    {
      "badge_id": 20,
      "name": "Game Time",
      "description": "Play more hours of detectable PC games with Discord open to level up this badge.",
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
      "name": "Streaming",
      "description": "Stream more hours to other users to level up this badge.",
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
      "name": "Nitro",
      "description": "Subscribe to Nitro to unlock this badge.",
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
      "name": "Discord Partner",
      "rarity": 5,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/4c8defb95c334422c34032aa26a8b1703a1be6c3e10e0cec06e8364e85131d6f.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/badge-icons/3f9748e53446a137a052f3454e2de41e.png",
      "is_earnable": false,
      "owned": false,
      "hidden": false
    },
    {
      "badge_id": 3,
      "name": "Moderator Program Alumni",
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
