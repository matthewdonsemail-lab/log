# discordApiUsersMeGiftIntentDismissals

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/users/@me/gift-intent-dismissals` |
| Sends | — |
| Reads | `dismissals` |
| Called from | `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1.js:208 app_store_parental_revocation`, `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1036.js:1 parse`, `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1221.js:2 anonymous`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1245.js:2 anonymous` |
| rea | `ev_f1900320004494e789cdd0aea1eb81900d94d3fca6915fc52e0c0b182836bdb6` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 2: snapshot | 1 | 200 | 359 ms | 47909 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder**, step 2: snapshot: 200, 359 ms

Sent:

```json
null
```

Answered:

```json
{
  "dismissals": [
    {
      "target_id": "428660066716090378",
      "dismissed_at_ms": "1793190561785",
      "intent_type": 1
    },
    {
      "target_id": "1327503062356590636",
      "dismissed_at_ms": "1793191738196",
      "intent_type": 1
    }
  ]
}
```

<!-- facts:end -->

## What it does

Reads which gift prompts the account has dismissed (`dismissals`), so Discord's client doesn't show them again.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a read, a watch or a send never depends on it.

## What can go wrong

A failure here only means the client may show a gift prompt again; the run carries on.
