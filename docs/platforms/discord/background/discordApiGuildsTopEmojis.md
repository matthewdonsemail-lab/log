# discordApiGuildsTopEmojis

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/guilds/top-emojis` |
| Sends | — |
| Reads | `items` |
| Called from | `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:160 app_store_parental_revocation`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script892.js:1 parse`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script1090.js:2 anonymous`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:158 2242` |
| rea | `ev_c5fa6e99ad01872c47cbe77fdbf0b8833ea0916400ca301a306c4f165c50a9d0` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 20: press Enter | 1 | 200 | 390 ms | 10496 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 20: press Enter: 200, 390 ms

Sent:

```json
null
```

Answered:

```json
{
  "items": [
    {
      "emoji_id": "1381468224176128050",
      "emoji_rank": 1
    },
    {
      "emoji_id": "1381494721616150649",
      "emoji_rank": 2
    },
    {
      "emoji_id": "1381468226667544647",
      "emoji_rank": 3
    },
    {
      "emoji_id": "1381494715194671114",
      "emoji_rank": 4
    },
    {
      "emoji_id": "1381468347484344511",
      "emoji_rank": 5
    }
  ]
}
```

<!-- facts:end -->

## What it does

Fetches the emojis most used in a server, for the emoji picker, after a message is sent there.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
