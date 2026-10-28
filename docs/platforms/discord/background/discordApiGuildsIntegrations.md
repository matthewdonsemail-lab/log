# discordApiGuildsIntegrations

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/guilds/integrations` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:160 app_store_parental_revocation`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script892.js:1 parse`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script1090.js:2 anonymous`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:158 2242` |
| rea | `ev_b153c9e5e1c579ee037348a23c67fc9c3aa737860390d2abecb3a19af8318eeb` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 8: click e221 | 1 | 200 | 449 ms | 2710 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 8: click e221: 200, 449 ms

Sent:

```json
{
  "query": {
    "include_applications": "true",
    "include_role_connections_metadata": "true"
  },
  "body": null
}
```

Answered:

```json
[
  {
    "type": "discord",
    "name": "StickyBot",
    "account": "(2 fields)",
    "enabled": true,
    "id": "1484870820173053952",
    "application": "(13 fields)",
    "scopes": "(2 items)",
    "user": "(15 fields)"
  },
  {
    "type": "discord",
    "name": "Wick",
    "account": "(2 fields)",
    "enabled": true,
    "id": "1484870673498378434",
    "application": "(14 fields)",
    "scopes": "(2 items)",
    "user": "(15 fields)"
  },
  {
    "type": "discord",
    "name": "Xenon",
    "account": "(2 fields)",
    "enabled": true,
    "id": "1443267935757013134",
    "application": "(15 fields)",
    "scopes": "(2 items)",
    "user": "(15 fields)"
  },
  {
    "type": "discord",
    "name": "InferenceSaver CRM Bot",
    "account": "(2 fields)",
    "enabled": true,
    "id": "1532452148074512594",
    "application": "(13 fields)",
    "scopes": "(2 items)",
    "user": "(15 fields)"
  },
  {
    "type": "discord",
    "name": "Ticket Tool",
    "account": "(2 fields)",
    "enabled": true,
    "id": "1484870611749699604",
    "application": "(15 fields)",
    "scopes": "(2 items)",
    "user": "(15 fields)"
  },
  {
    "type": "discord",
    "name": "YAGPDB.xyz",
    "account": "(2 fields)",
    "enabled": true,
    "id": "1444096397065326622",
    "application": "(13 fields)",
    "scopes": "(2 items)",
    "user": "(15 fields)"
  },
  "… 3 more"
]
```

<!-- facts:end -->

## What it does

Lists a server's integrations (bots, apps) when a server is opened.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
