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
| Called from | `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script0.js:160 app_store_parental_revocation`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1059.js:1 parse`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1245.js:2 anonymous`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script0.js:158 2242` |
| rea | `ev_2070dc40e13af93274e72f1888affeb563d50467d7eb14b18189f1443a1c0d33` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: click e40 | 1 | 200 | 352 ms | 5395 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 5: click e40: 200, 352 ms

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
