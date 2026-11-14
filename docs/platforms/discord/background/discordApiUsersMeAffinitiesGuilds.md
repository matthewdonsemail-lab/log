# discordApiUsersMeAffinitiesGuilds

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/users/@me/affinities/guilds` |
| Sends | — |
| Reads | `guild_affinities` |
| Called from | `runs/inspect/20261114T184328_deepman2/script0.js:232 625075`, `runs/inspect/20261114T184328_deepman2/script0.js:124 559868`, `runs/inspect/20261114T184328_deepman2/script0.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_f6daff8038b4f477b27b852e31fc1f2f76f7dd725b1883891e74b824ed6f0ac3` |

Seen 10 time(s) in 10 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: click e40 | 1 | 200 | 352 ms | 5395 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 640 ms | 47867 ms | — |
| inspect | step 1: goto /login | 6 | 200 | 161–514 ms | 25496–1044582 ms | — |
| inspect | step 6: wait 45s | 1 | 200 | 171 ms | 22084 ms | — |
| inspect | step 9: wait 45s | 1 | 200 | 407 ms | 12821 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261114T184328_deepman2**, step 9: wait 45s: 200, 407 ms

Sent:

```json
null
```

Answered:

```json
{
  "guild_affinities": [
    {
      "guild_id": "1483217544214085663",
      "affinity": 38.35481877669739
    },
    {
      "guild_id": "1290725749543927941",
      "affinity": 31.447502316543655
    },
    {
      "guild_id": "1019350475847499849",
      "affinity": 26.389629900834567
    },
    {
      "guild_id": "1272308870919880735",
      "affinity": 8.28964492710318
    },
    {
      "guild_id": "1442518050527248436",
      "affinity": 6.778734512637333
    },
    {
      "guild_id": "1490078307754967311",
      "affinity": 6.126599483982498
    },
    "… 11 more"
  ]
}
```

**runs/inspect/20261113T231616_deepman2**, step 6: wait 45s: 200, 171 ms

Sent:

```json
null
```

Answered:

```json
{
  "guild_affinities": [
    {
      "guild_id": "1483217544214085663",
      "affinity": 38.50195729277904
    },
    {
      "guild_id": "1290725749543927941",
      "affinity": 31.807588713147823
    },
    {
      "guild_id": "1019350475847499849",
      "affinity": 26.49876478016221
    },
    {
      "guild_id": "1272308870919880735",
      "affinity": 8.319992727926854
    },
    {
      "guild_id": "1442518050527248436",
      "affinity": 6.792019963129855
    },
    {
      "guild_id": "1456806362351669492",
      "affinity": 4.138054338109923
    },
    "… 11 more"
  ]
}
```

**runs/inspect/20261111T233723_deepman2**, step 1: goto /login: 200, 161 ms

Sent:

```json
null
```

Answered:

```json
{
  "guild_affinities": [
    {
      "guild_id": "1483217544214085663",
      "affinity": 38.826297857455955
    },
    {
      "guild_id": "1290725749543927941",
      "affinity": 31.587999377369414
    },
    {
      "guild_id": "1019350475847499849",
      "affinity": 26.739905254328974
    },
    {
      "guild_id": "1272308870919880735",
      "affinity": 8.387254949106504
    },
    {
      "guild_id": "1442518050527248436",
      "affinity": 6.820714980531783
    },
    {
      "guild_id": "1456806362351669492",
      "affinity": 4.172930515699126
    },
    "… 10 more"
  ]
}
```

<!-- facts:end -->

## What it does

Lists the servers the account uses most, to rank them in the client.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
