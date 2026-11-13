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
| Called from | `runs/inspect/20261030T222341_<name:7>/script1.js:208 app_store_parental_revocation`, `runs/inspect/20261030T222341_<name:7>/script1036.js:1 parse`, `runs/inspect/20261030T222341_<name:7>/script1221.js:2 anonymous`, `runs/inspect/20261028T074137_<name:7>/script1245.js:2 anonymous` |
| rea | `ev_065e7ad37dcb5911d240f9de7d6e2882220c5a8d7c025d92b46a23de59cf297c` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 8: click e221 | 1 | 200 | 449 ms | 2710 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T062914_<name:7>**, step 8: click e221: 200, 449 ms

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
    "name": "<name:1>",
    "account": "(2 fields)",
    "enabled": true,
    "id": "<id:1>",
    "application": "(13 fields)",
    "scopes": "(2 items)",
    "user": "(15 fields)"
  },
  {
    "type": "discord",
    "name": "<name:2>",
    "account": "(2 fields)",
    "enabled": true,
    "id": "<id:2>",
    "application": "(14 fields)",
    "scopes": "(2 items)",
    "user": "(15 fields)"
  },
  {
    "type": "discord",
    "name": "<name:3>",
    "account": "(2 fields)",
    "enabled": true,
    "id": "<id:3>",
    "application": "(15 fields)",
    "scopes": "(2 items)",
    "user": "(15 fields)"
  },
  {
    "type": "discord",
    "name": "<name:4>",
    "account": "(2 fields)",
    "enabled": true,
    "id": "<id:4>",
    "application": "(13 fields)",
    "scopes": "(2 items)",
    "user": "(15 fields)"
  },
  {
    "type": "discord",
    "name": "<name:5>",
    "account": "(2 fields)",
    "enabled": true,
    "id": "<id:5>",
    "application": "(15 fields)",
    "scopes": "(2 items)",
    "user": "(15 fields)"
  },
  {
    "type": "discord",
    "name": "<name:6>",
    "account": "(2 fields)",
    "enabled": true,
    "id": "<id:6>",
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
