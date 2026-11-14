# discordApiUsersMeGiftIntentDismissals

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/users/@me/gift-intent-dismissals` |
| Sends | — |
| Reads | `dismissals` |
| Called from | `runs/inspect/20261114T184328_deepman2/script0.js:232 625075`, `runs/inspect/20261114T184328_deepman2/script0.js:124 559868`, `runs/inspect/20261114T184328_deepman2/script0.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_f6daff8038b4f477b27b852e31fc1f2f76f7dd725b1883891e74b824ed6f0ac3` |

Seen 7 time(s) in 7 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 2: snapshot | 1 | 200 | 359 ms | 47909 ms | — |
| inspect | step 1: goto /login | 6 | 200 | 161–12423 ms | 26642–1049193 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261111T233723_deepman2**, step 1: goto /login: 200, 177 ms

Sent:

```json
null
```

Answered:

```json
{
  "dismissals": [
    {
      "target_id": "<userId:1>",
      "dismissed_at_ms": "1794410814504",
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
