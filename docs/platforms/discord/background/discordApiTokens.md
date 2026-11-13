# discordApiTokens

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/tokens` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261030T222341_<name:1>/script1.js:208 app_store_parental_revocation`, `runs/inspect/20261030T222341_<name:1>/script1036.js:1 parse`, `runs/inspect/20261030T222341_<name:1>/script1221.js:2 anonymous`, `runs/inspect/20261028T074137_<name:1>/script1245.js:2 anonymous` |
| rea | `ev_065e7ad37dcb5911d240f9de7d6e2882220c5a8d7c025d92b46a23de59cf297c` |

Seen 4 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: click e40 | 1 | 200 | 361 ms | 13047 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 362 ms | 10197 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 354 ms | 8802 ms | — |
| inspect | step 1: goto /login | 1 | 200 | 350 ms | 18653 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T074137_<name:1>**, step 1: goto /login: 200, 350 ms

Sent:

```json
{
  "query": {
    "application_ids": "<id:1>"
  },
  "body": null
}
```

Answered:

```json
[]
```

**runs/inspect/20261028T062914_<name:1>**, step 5: click e40: 200, 361 ms

Sent:

```json
{
  "query": {
    "application_ids": "<id:1>"
  },
  "body": null
}
```

Answered:

```json
[]
```

**runs/inspect/20261028T062914_<name:1>**, step 9: goto /channels/@me: 200, 362 ms

Sent:

```json
{
  "query": {
    "application_ids": "<id:1>"
  },
  "body": null
}
```

Answered:

```json
[]
```

<!-- facts:end -->

## What it does

Registers the browser's push or session token after sign-in.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
