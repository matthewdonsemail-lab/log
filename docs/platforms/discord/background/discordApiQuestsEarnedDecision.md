# discordApiQuestsEarnedDecision

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/quests/earned-decision` |
| Sends | — |
| Reads | `quests`, `request_id`, `response_ttl_seconds`, `quests.1567679380166156430` |
| Called from | `runs/inspect/20261114T184328_deepman2/script0.js:232 625075`, `runs/inspect/20261114T184328_deepman2/script0.js:124 559868`, `runs/inspect/20261114T184328_deepman2/script0.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_f6daff8038b4f477b27b852e31fc1f2f76f7dd725b1883891e74b824ed6f0ac3` |

Seen 6 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 6: wait 45s | 1 | 200 | 200 ms | 24495 ms | — |
| inspect | step 1: goto /login | 3 | 200 | 218–317 ms | 35825–138066 ms | — |
| inspect | step 1: goto /channels/@me | 1 | 200 | 227 ms | 4402 ms | — |
| inspect | step 9: wait 45s | 1 | 200 | 254 ms | 16568 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261114T184328_deepman2**, step 9: wait 45s: 200, 254 ms

Sent:

```json
{
  "query": {
    "quest_ids": "1567679380166156430",
    "content": "<messageText>",
    "client_heartbeat_session_id": "06a269e7-4427-4c9d-8f4b-df5393cfa578"
  },
  "body": null
}
```

Answered:

```json
{
  "quests": {},
  "request_id": "34f670fc-d8ce-41d5-a036-260046621cbc",
  "response_ttl_seconds": 1800
}
```

**runs/inspect/20261113T231616_deepman2**, step 6: wait 45s: 200, 200 ms

Sent:

```json
{
  "query": {
    "quest_ids": "1567679380166156430",
    "content": "<messageText>",
    "client_heartbeat_session_id": "cffd82cb-9599-4f81-b608-3478c0ebc298"
  },
  "body": null
}
```

Answered:

```json
{
  "quests": {},
  "request_id": "f50f25fd-7ed2-4d04-ac57-785326eaf777",
  "response_ttl_seconds": 1800
}
```

**runs/inspect/20261109T194954_deepman2**, step 1: goto /login: 200, 218 ms

Sent:

```json
{
  "query": {
    "quest_ids": "1567679380166156430",
    "content": "<messageText>",
    "client_heartbeat_session_id": "d12804ee-4cfc-416f-936c-0ca8161a7e67"
  },
  "body": null
}
```

Answered:

```json
{
  "quests": {
    "1567679380166156430": {
      "id": "<id:1>",
      "config": {
        "id": "<id:1>",
        "config_version": 2,
        "starts_at": "2026-11-06T18:00:00+00:00",
        "expires_at": "2026-11-16T01:00:00+00:00",
        "features": [
          15
        ],
        "application": {
          "link": "https://www.roblox.com/games/130739873848552/Basketball-Zero?gsrbx=1&ad_name=QN1F2AFG",
          "id": "<id:2>",
          "name": "<name:1>"
        },
        "assets": {
          "hero": "quests/1567679380166156430/1567680260659748964.jpg",
          "hero_video": "quests/1567679380166156430/1567680322848694384_720.mp4",
          "quest_bar_hero_blurhash": "XQcKOoirBAWzaSZpYLgGdXs=",
          "quest_bar_hero": "quests/1567679380166156430/1567680260659748964.jpg",
          "quest_bar_hero_video": "quests/1567679380166156430/1567680322848694384_720.mp4",
          "game_tile": "PLACEHOLDER",
          "logotype": "PLACEHOLDER",
          "game_tile_light": "quests/1562915304299044884/1562916601886670980.png",
          "game_tile_dark": "quests/1562915304299044884/1562916601861243000.png",
          "logotype_light": "quests/1567679380166156430/1567680260676255856.png",
          "logotype_dark": "quests/1567679380166156430/1567680260676255856.png"
        },
        "colors": {
          "primary": "#4752C4",
          "secondary": "#000000"
        },
        "messages": {
          "quest_name": "Basketball Zero",
          "game_title": "Basketball Zero on Roblox",
          "game_publisher": "ROBLOX"
        },
        "task_config_v2": {
          "tasks": {
            "PLAY_ON_DESKTOP": {
              "type": "PLAY_ON_DESKTOP",
              "target": 900,
              "applications": [
                {
                  "id": "<id:2>"
                }
              ]
            }
          },
          "join_operator": "or"
        },
        "rewards_config": {
          "assignment_method": 1,
          "rewards": [
            {
              "type": 4,
              "sku_id": "1287881739531976815",
              "messages": {
                "name": "<name:2>",
                "name_with_article": "700 Orbs",
                "redemption_instructions_by_platform": {
                  "0": "PLACEHOLDER"
                }
              },
              "orb_quantity": 700,
              "premium_orb_quantity": 840
            }
          ],
          "rewards_expire_at": "2026-12-16T01:00:00+00:00",
          "platforms": [
            0
          ]
        },
        "share_policy": "shareable_everywhere",
        "cta_config": {
          "link": "https://www.roblox.com/games/130739873848552/Basketball-Zero?gsrbx=1&ad_name=QN1F2AFG",
          "button_label": "Play Now"
        }
      },
      "user_status": null,
      "targeted_content": [],
      "ad_context": null,
      "preview": false,
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLdmZuYmlxZWU0TXJqd1lxVVcrV0dEMUU5S2lrZ3h4V2NsM2FDQzdVWUVEMU9ZZE9xNjNCTkhlT1BFMG5sVHoxaHhaMEZxM0hxRjNXUTc1TE5qZnFwK01HejJtc3RvUllhZWF0WUM0NURsQ3FIZDYySmJ5dEEvSkhpN0JOczM1VTFDR1FkYmRjVjVXT3RCZUEyZEhBOXh0QT09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKaGFTY0xtOSttNEF2SzdaR1c4WkMwaTZuOVMvaVc3aDlJeERlUXhMZ0dYQU5aSmlMNmFQQUZrZlpOTDRWK0FRQlI1bU1MbHY1alZLT29uVGJyMlJuZFFQclErZ213Q3luc3Z4TUV2S0d6Q3NlZDR6OTZ4Wmh4SDVTU1BkZm1EQTJEeENpSDFoa1o0eUhWOHhLc0tiQkxPeDZuREJGNXVsZElxOUIzZVJwZnhDMmc3dWpLIn0="
    }
  },
  "request_id": "da8d2cc4-5adb-46d1-b8d9-15f5e7609b47",
  "response_ttl_seconds": 1800
}
```

<!-- facts:end -->

## What it does

Asks which Quest reward or promotion to show the account, loaded by Discord's client after READY.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
