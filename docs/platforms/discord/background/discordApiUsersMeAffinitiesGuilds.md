# discordApiUsersMeAffinitiesGuilds

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/users/@me/affinities/guilds` |
| Sends | — |
| Reads | `guild_affinities` |
| Called from | `runs/inspect/20261113T141543_<name:1>/script1.js:232 625075`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 559868`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 961943`, `runs/inspect/20261113T141543_<name:1>/script1294.js:1 634654` |
| rea | `ev_a9fa69c7432fa1fcc41058ba491790444cfcec72f4c96150b3d2566a4e5def67` |

Seen 4 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: click e40 | 1 | 200 | 352 ms | 5395 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 640 ms | 47867 ms | — |
| inspect | step 1: goto /login | 2 | 200 | 372–514 ms | 34800–1044582 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T141543_<name:1>**, step 1: goto /login: 200, 372 ms

Sent:

```json
null
```

Answered:

```json
{
  "guild_affinities": [
    {
      "guild_id": "1053877538025386074",
      "affinity": 1591.904500638148
    },
    {
      "guild_id": "1290725749543927941",
      "affinity": 1330.5832112007427
    },
    {
      "guild_id": "1442518050527248436",
      "affinity": 310.23882320410013
    },
    {
      "guild_id": "1458911680376606957",
      "affinity": 269.1522123575936
    },
    {
      "guild_id": "1130383047699738754",
      "affinity": 244.86491119850427
    },
    {
      "guild_id": "1019350475847499849",
      "affinity": 203.59212506331508
    },
    "… 65 more"
  ]
}
```

**runs/inspect/20261030T222341_<name:1>**, step 2: snapshot: 200, 640 ms

Sent:

```json
null
```

Answered:

```json
{
  "guild_affinities": [
    {
      "guild_id": "1053877538025386074",
      "affinity": 1635.3694287875048
    },
    {
      "guild_id": "1290725749543927941",
      "affinity": 1313.1123110344417
    },
    {
      "guild_id": "1442518050527248436",
      "affinity": 431.20519581788784
    },
    {
      "guild_id": "1130383047699738754",
      "affinity": 247.01759045031068
    },
    {
      "guild_id": "1019350475847499849",
      "affinity": 223.8806022930477
    },
    {
      "guild_id": "1529710922749181963",
      "affinity": 208.34762746343887
    },
    "… 67 more"
  ]
}
```

**runs/inspect/20261028T062914_<name:1>**, step 5: click e40: 200, 352 ms

Sent:

```json
null
```

Answered:

```json
{
  "guild_affinities": [
    {
      "guild_id": "1053877538025386074",
      "affinity": 1646.2934671355592
    },
    {
      "guild_id": "1290725749543927941",
      "affinity": 1319.293853734509
    },
    {
      "guild_id": "1442518050527248436",
      "affinity": 433.8327795401903
    },
    {
      "guild_id": "1130383047699738754",
      "affinity": 247.87436595899314
    },
    {
      "guild_id": "1019350475847499849",
      "affinity": 227.40028227161596
    },
    {
      "guild_id": "1529710922749181963",
      "affinity": 215.55699466751432
    },
    "… 68 more"
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
