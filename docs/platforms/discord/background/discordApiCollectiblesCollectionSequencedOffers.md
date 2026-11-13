# discordApiCollectiblesCollectionSequencedOffers

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/collectibles-collection-sequenced-offers` |
| Sends | — |
| Reads | `collection_id`, `starts_at`, `ends_at`, `promotions` |
| Called from | `runs/inspect/20261113T141543_<name:1>/script1.js:232 625075`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 559868`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 961943`, `runs/inspect/20261113T141543_<name:1>/script1294.js:1 634654` |
| rea | `ev_a9fa69c7432fa1fcc41058ba491790444cfcec72f4c96150b3d2566a4e5def67` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /login | 2 | 200 | 385–9789 ms | 46271–1052573 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T141543_<name:1>**, step 1: goto /login: 200, 385 ms

Sent:

```json
null
```

Answered:

```json
{
  "collection_id": null,
  "starts_at": null,
  "ends_at": null,
  "promotions": []
}
```

<!-- facts:end -->

## What it does

Loads the timed shop offers (Discord collectibles: avatar decorations and profile effects) the client shows in the Shop: each collection with its start, end and promotions.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; sign-in, a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
