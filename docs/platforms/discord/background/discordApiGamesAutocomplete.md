# discordApiGamesAutocomplete

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/games/autocomplete` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1.js:208 app_store_parental_revocation`, `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1036.js:1 parse`, `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1221.js:2 anonymous`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1245.js:2 anonymous` |
| rea | `ev_fe406e7b4878d94107f8f5e73e47b78bd67d20cfb340d788becfa43f53438919` |

Seen 3 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 27: type e2077 | 3 | 200 | 3–430 ms | 210–1158 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 27: type e2077: 200, 68 ms

Sent:

```json
{
  "query": {
    "q": "ji",
    "filter_group": "default"
  },
  "body": null
}
```

Answered:

```json
[
  {
    "id": "1554205071603146836",
    "name": "Huang Ye Ri Ji",
    "platform_availability": [
      "mobile"
    ]
  },
  {
    "id": "1124356315339305022",
    "name": "Jigsaw Puzzle Dreams",
    "icon": {
      "type": "hash",
      "value": "72f6b2dbab5a9e61a2e35f0f9ab7574c"
    },
    "platform_availability": [
      "desktop"
    ]
  },
  {
    "id": "1441993408372539484",
    "name": "Microsoft Jigsaw",
    "platform_availability": [
      "console",
      "desktop"
    ]
  },
  {
    "id": "1547028628418723940",
    "name": "Jigsawscapes",
    "icon": {
      "type": "url",
      "value": "https://images-ext-1.discordapp.net/external/DOMVirmLVYcsSZPXtDxKtbw11wlYlFinQGw6BS8eU6U/https/is1-ssl.mzstatic.com/image/thumb/Purple221/v4/11/b6/df/11b6df26-7c41-bec8-7235-aebc9720fcea/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/150x150bb.jpg"
    },
    "platform_availability": [
      "mobile"
    ]
  },
  {
    "id": "1547012957672579094",
    "name": "Jigsaw Puzzles: Puzzle Game",
    "icon": {
      "type": "url",
      "value": "https://images-ext-1.discordapp.net/external/1Ijt44zm0XFxoNPpdcR8zt3b4_j83ukvREBTtiE0yNs/https/is1-ssl.mzstatic.com/image/thumb/Purple211/v4/69/08/61/69086104-3ae5-22bb-64e7-341bfa5320eb/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/150x150bb.jpg"
    },
    "platform_availability": [
      "mobile"
    ]
  },
  {
    "id": "1549253457351802921",
    "name": "Magic Jigsaw Puzzles",
    "icon": {
      "type": "url",
      "value": "https://images-ext-1.discordapp.net/external/fBLYscCvS4j0XIsLHNecSq4nX8nkwmV7tEg66CI-pMo/https/is1-ssl.mzstatic.com/image/thumb/Purple211/v4/d3/27/6a/d3276a38-83e3-a191-5899-9f452cb697b8/AppIcon-1x_U007epad-0-1-0-0-0-85-220-0.png/150x150bb.jpg"
    },
    "platform_availability": [
      "mobile"
    ]
  },
  "… 4 more"
]
```

<!-- facts:end -->

## What it does

Fires as the Quick Switcher (Ctrl+K) is typed in (`q=<text>`); the people, DMs and channels come from what the client already holds, this only adds games.

## What our machine does with it

Our Ctrl+K and type steps fire it; finding a chat is decided by the Quick Switcher's `option` rows, not by this answer.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
