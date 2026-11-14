# discordApiCollectiblesCollectionSequencedOffers

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/collectibles-collection-sequenced-offers` |
| Sends | — |
| Reads | `collection_id`, `starts_at`, `ends_at`, `promotions` |
| Called from | `runs/inspect/20261114T184328_deepman2/script0.js:232 625075`, `runs/inspect/20261114T184328_deepman2/script0.js:124 559868`, `runs/inspect/20261114T184328_deepman2/script0.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_f6daff8038b4f477b27b852e31fc1f2f76f7dd725b1883891e74b824ed6f0ac3` |

Seen 4 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /login | 2 | 200 | 385–9789 ms | 46271–1052573 ms | — |
| inspect | step 6: wait 45s | 1 | 200 | 175 ms | 25494 ms | — |
| inspect | step 9: wait 45s | 1 | 200 | 319 ms | 16549 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261114T184328_deepman2**, step 9: wait 45s: 200, 319 ms

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

**runs/inspect/20261113T231616_deepman2**, step 6: wait 45s: 200, 175 ms

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
