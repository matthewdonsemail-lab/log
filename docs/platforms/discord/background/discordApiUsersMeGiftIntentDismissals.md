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
| Called from | `runs/inspect/20261113T044840_<name:1>/script0.js:232 625075`, `runs/inspect/20261113T044840_<name:1>/script0.js:124 559868`, `runs/inspect/20261113T044840_<name:1>/script0.js:124 961943`, `runs/inspect/20261113T044840_<name:1>/script1294.js:1 634654` |
| rea | `ev_9d4c94b29c27aae16d82744300bef5d645915e440bc49c5ad0a0f7e88f6933a5` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 2: snapshot | 1 | 200 | 359 ms | 47909 ms | — |
| inspect | step 1: goto /login | 1 | 200 | 12423 ms | 43617 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T044840_<name:1>**, step 1: goto /login: 200, 12423 ms

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
      "dismissed_at_ms": "1793191738196",
      "intent_type": 1
    },
    {
      "target_id": "<userId:2>",
      "dismissed_at_ms": "1793633334631",
      "intent_type": 1
    },
    {
      "target_id": "<userId:3>",
      "dismissed_at_ms": "1793656507801",
      "intent_type": 1
    },
    {
      "target_id": "<userId:4>",
      "dismissed_at_ms": "1794403333406",
      "intent_type": 1
    },
    {
      "target_id": "<userId:5>",
      "dismissed_at_ms": "1794426018630",
      "intent_type": 1
    }
  ]
}
```

**runs/inspect/20261030T222341_<name:1>**, step 2: snapshot: 200, 359 ms

Sent:

```json
null
```

Answered:

```json
{
  "dismissals": [
    {
      "target_id": "<userId:5>",
      "dismissed_at_ms": "1793190561785",
      "intent_type": 1
    },
    {
      "target_id": "<userId:1>",
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
