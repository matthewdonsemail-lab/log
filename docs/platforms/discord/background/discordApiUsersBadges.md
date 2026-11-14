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
| Called from | `runs/inspect/20261113T231616_deepman2/script3.js:232 625075`, `runs/inspect/20261113T231616_deepman2/script3.js:124 559868`, `runs/inspect/20261113T231616_deepman2/script3.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_0bff963a6b191a0f25dfbddbe0add12fbf407a3b07b1a7dace5cf7bd7ca153fb` |

Seen 15 time(s) in 12 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 397 ms | 7772 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 462 ms | 6529 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 463 ms | 5243 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 584 ms | 4841 ms | — |
| inspect | step 31: wait 60s | 1 | 200 | 611 ms | 241902 ms | — |
| inspect | step 1: goto /login | 7 | 200 | 261–530 ms | 11383–1045715 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 691 ms | 48674 ms | — |
| inspect | step 6: wait 45s | 1 | 200 | 321 ms | 22343 ms | — |
| inspect | step 1: goto /channels/@me | 1 | 200 | 212 ms | 2248 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T231616_deepman2**, step 6: wait 45s: 200, 321 ms

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
      "name": "<name:2>",
      "description": "Play more hours of detectable PC games with Discord open to level up this badge.",
      "leveling_instructions": "Unlock more levels by playing more hours of games.",
      "info_label": "1 hour of games played",
      "rarity": 1,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/b75fcc4dd1c65dfd4169a203e21023453fd6fe853c9b5c1fd839781fda98e80d.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/assets/content/c2844b37da74241525c1001c2ae5dd2719beb0095af8f88dcb35a37ceb0e1892.png",
      "complex_icon_static_url": "https://cdn.discordapp.com/assets/content/1f9d42f34184814a137e40b0de83e2cac0ae44d83531777b9369d2e2a6ddfeb3.svg",
      "is_earnable": true,
      "owned": true,
      "hidden": false,
      "obtained_at": "2026-07-29T20:14:50.650279+00:00",
      "current_tier": "casual",
      "next_tier": "recreational",
      "tier_obtained_at": {
        "casual": "2026-07-29T20:14:50.650273+00:00"
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
      "name": "<name:3>",
      "description": "Stream more hours to other users to level up this badge.",
      "leveling_instructions": "Unlock more levels by streaming more hours.",
      "info_label": "24 hours streamed to others",
      "rarity": 1,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/4e847b4dca20fbf1c56d3a47cac3c9204f02113c9d5a270ebebdf12909c75848.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/assets/content/443707ffced738635bb0ee5c054544c67ec9dfab63b03e661bc1295d5399cac7.png",
      "complex_icon_static_url": "https://cdn.discordapp.com/assets/content/21b8d249afdf07418623f679c4899f08f8b400b36dee8c0640ce876b0027f81e.svg",
      "is_earnable": true,
      "owned": true,
      "hidden": false,
      "obtained_at": "2026-07-28T05:26:57.125527+00:00",
      "current_tier": "breakout",
      "next_tier": "standout",
      "tier_obtained_at": {
        "newcomer": "2026-07-28T05:26:57.125519+00:00",
        "breakout": "2026-07-28T05:26:57.125519+00:00",
        "fledgling": "2026-07-28T05:26:57.125519+00:00"
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
      "badge_id": 18,
      "name": "<name:4>",
      "description": "Keep an active Discord account to level up this badge. Time will do the rest.",
      "leveling_instructions": "Unlock more levels by keeping your account active.",
      "info_label": "8 years, 7 months",
      "rarity": 2,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/5dc6789b3102d1d63b3a4e257bc0067555702116f392d54cd3f83c0c137e6e11.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/assets/content/53b3a2b4307df9dfc05a4c9da977baa4a6fd822f5a3d24843f949d1c93398322.png",
      "complex_icon_static_url": "https://cdn.discordapp.com/assets/content/528f91735db7fd50ed9c95b65044f911663d8941379314d01c27b8fb230fb126.svg",
      "is_earnable": true,
      "owned": true,
      "hidden": false,
      "obtained_at": "2019-03-28T21:02:04.024000+00:00",
      "current_tier": "eight_years",
      "next_tier": "nine_years",
      "tier_obtained_at": {
        "one_year": "2019-03-28T21:02:04.024000+00:00",
        "two_years": "2020-03-28T21:02:04.024000+00:00",
        "three_years": "2021-03-28T21:02:04.024000+00:00",
        "four_years": "2022-03-28T21:02:04.024000+00:00",
        "five_years": "2023-03-28T21:02:04.024000+00:00",
        "six_years": "2024-03-28T21:02:04.024000+00:00",
        "seven_years": "2025-03-28T21:02:04.024000+00:00",
        "eight_years": "2026-03-28T21:02:04.024000+00:00"
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
      "name": "<name:5>",
      "description": "Subscribe to Nitro to unlock this badge.",
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
      "name": "<name:6>",
      "rarity": 5,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/4c8defb95c334422c34032aa26a8b1703a1be6c3e10e0cec06e8364e85131d6f.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/badge-icons/3f9748e53446a137a052f3454e2de41e.png",
      "is_earnable": false,
      "owned": false,
      "hidden": false
    },
    "… 17 more"
  ]
}
```

**runs/inspect/20261111T233723_deepman2**, step 1: goto /login: 200, 261 ms

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
      "name": "<name:2>",
      "description": "Play more hours of detectable PC games with Discord open to level up this badge.",
      "leveling_instructions": "Unlock more levels by playing more hours of games.",
      "info_label": "1 hour of games played",
      "rarity": 1,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/b75fcc4dd1c65dfd4169a203e21023453fd6fe853c9b5c1fd839781fda98e80d.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/assets/content/c2844b37da74241525c1001c2ae5dd2719beb0095af8f88dcb35a37ceb0e1892.png",
      "complex_icon_static_url": "https://cdn.discordapp.com/assets/content/1f9d42f34184814a137e40b0de83e2cac0ae44d83531777b9369d2e2a6ddfeb3.svg",
      "is_earnable": true,
      "owned": true,
      "hidden": false,
      "obtained_at": "2026-07-29T20:14:50.650279+00:00",
      "current_tier": "casual",
      "next_tier": "recreational",
      "tier_obtained_at": {
        "casual": "2026-07-29T20:14:50.650273+00:00"
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
      "name": "<name:3>",
      "description": "Stream more hours to other users to level up this badge.",
      "leveling_instructions": "Unlock more levels by streaming more hours.",
      "info_label": "24 hours streamed to others",
      "rarity": 1,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/4e847b4dca20fbf1c56d3a47cac3c9204f02113c9d5a270ebebdf12909c75848.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/assets/content/443707ffced738635bb0ee5c054544c67ec9dfab63b03e661bc1295d5399cac7.png",
      "complex_icon_static_url": "https://cdn.discordapp.com/assets/content/21b8d249afdf07418623f679c4899f08f8b400b36dee8c0640ce876b0027f81e.svg",
      "is_earnable": true,
      "owned": true,
      "hidden": false,
      "obtained_at": "2026-07-28T05:26:57.125527+00:00",
      "current_tier": "breakout",
      "next_tier": "standout",
      "tier_obtained_at": {
        "newcomer": "2026-07-28T05:26:57.125519+00:00",
        "breakout": "2026-07-28T05:26:57.125519+00:00",
        "fledgling": "2026-07-28T05:26:57.125519+00:00"
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
      "badge_id": 18,
      "name": "<name:4>",
      "description": "Keep an active Discord account to level up this badge. Time will do the rest.",
      "leveling_instructions": "Unlock more levels by keeping your account active.",
      "info_label": "8 years, 7 months",
      "rarity": 2,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/5dc6789b3102d1d63b3a4e257bc0067555702116f392d54cd3f83c0c137e6e11.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/assets/content/53b3a2b4307df9dfc05a4c9da977baa4a6fd822f5a3d24843f949d1c93398322.png",
      "complex_icon_static_url": "https://cdn.discordapp.com/assets/content/528f91735db7fd50ed9c95b65044f911663d8941379314d01c27b8fb230fb126.svg",
      "is_earnable": true,
      "owned": true,
      "hidden": false,
      "obtained_at": "2019-03-28T21:02:04.024000+00:00",
      "current_tier": "eight_years",
      "next_tier": "nine_years",
      "tier_obtained_at": {
        "one_year": "2019-03-28T21:02:04.024000+00:00",
        "two_years": "2020-03-28T21:02:04.024000+00:00",
        "three_years": "2021-03-28T21:02:04.024000+00:00",
        "four_years": "2022-03-28T21:02:04.024000+00:00",
        "five_years": "2023-03-28T21:02:04.024000+00:00",
        "six_years": "2024-03-28T21:02:04.024000+00:00",
        "seven_years": "2025-03-28T21:02:04.024000+00:00",
        "eight_years": "2026-03-28T21:02:04.024000+00:00"
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
      "name": "<name:5>",
      "description": "Subscribe to Nitro to unlock this badge.",
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
      "name": "<name:6>",
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

**runs/inspect/20261109T192314_deepman2**, step 1: goto /channels/@me: 200, 212 ms

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
      "name": "<name:2>",
      "description": "Play more hours of detectable PC games with Discord open to level up this badge.",
      "leveling_instructions": "Unlock more levels by playing more hours of games.",
      "info_label": "1 hour of games played",
      "rarity": 1,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/b75fcc4dd1c65dfd4169a203e21023453fd6fe853c9b5c1fd839781fda98e80d.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/assets/content/c2844b37da74241525c1001c2ae5dd2719beb0095af8f88dcb35a37ceb0e1892.png",
      "complex_icon_static_url": "https://cdn.discordapp.com/assets/content/1f9d42f34184814a137e40b0de83e2cac0ae44d83531777b9369d2e2a6ddfeb3.svg",
      "is_earnable": true,
      "owned": true,
      "hidden": false,
      "obtained_at": "2026-07-29T20:14:50.650279+00:00",
      "current_tier": "casual",
      "next_tier": "recreational",
      "tier_obtained_at": {
        "casual": "2026-07-29T20:14:50.650273+00:00"
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
      "name": "<name:3>",
      "description": "Stream more hours to other users to level up this badge.",
      "leveling_instructions": "Unlock more levels by streaming more hours.",
      "info_label": "24 hours streamed to others",
      "rarity": 1,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/4e847b4dca20fbf1c56d3a47cac3c9204f02113c9d5a270ebebdf12909c75848.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/assets/content/443707ffced738635bb0ee5c054544c67ec9dfab63b03e661bc1295d5399cac7.png",
      "complex_icon_static_url": "https://cdn.discordapp.com/assets/content/21b8d249afdf07418623f679c4899f08f8b400b36dee8c0640ce876b0027f81e.svg",
      "is_earnable": true,
      "owned": true,
      "hidden": false,
      "obtained_at": "2026-07-28T05:26:57.125527+00:00",
      "current_tier": "breakout",
      "next_tier": "standout",
      "tier_obtained_at": {
        "newcomer": "2026-07-28T05:26:57.125519+00:00",
        "breakout": "2026-07-28T05:26:57.125519+00:00",
        "fledgling": "2026-07-28T05:26:57.125519+00:00"
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
      "badge_id": 18,
      "name": "<name:4>",
      "description": "Keep an active Discord account to level up this badge. Time will do the rest.",
      "leveling_instructions": "Unlock more levels by keeping your account active.",
      "info_label": "8 years, 7 months",
      "rarity": 2,
      "simple_icon_url": "https://cdn.discordapp.com/assets/content/5dc6789b3102d1d63b3a4e257bc0067555702116f392d54cd3f83c0c137e6e11.svg",
      "simple_icon_raster_url": "https://cdn.discordapp.com/assets/content/53b3a2b4307df9dfc05a4c9da977baa4a6fd822f5a3d24843f949d1c93398322.png",
      "complex_icon_static_url": "https://cdn.discordapp.com/assets/content/528f91735db7fd50ed9c95b65044f911663d8941379314d01c27b8fb230fb126.svg",
      "is_earnable": true,
      "owned": true,
      "hidden": false,
      "obtained_at": "2019-03-28T21:02:04.024000+00:00",
      "current_tier": "eight_years",
      "next_tier": "nine_years",
      "tier_obtained_at": {
        "one_year": "2019-03-28T21:02:04.024000+00:00",
        "two_years": "2020-03-28T21:02:04.024000+00:00",
        "three_years": "2021-03-28T21:02:04.024000+00:00",
        "four_years": "2022-03-28T21:02:04.024000+00:00",
        "five_years": "2023-03-28T21:02:04.024000+00:00",
        "six_years": "2024-03-28T21:02:04.024000+00:00",
        "seven_years": "2025-03-28T21:02:04.024000+00:00",
        "eight_years": "2026-03-28T21:02:04.024000+00:00"
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
      "name": "<name:5>",
      "description": "Subscribe to Nitro to unlock this badge.",
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
      "name": "<name:6>",
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

<!-- facts:end -->

## What it does

Reads a user's profile badges to draw on their profile.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
