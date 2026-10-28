# discordApiChannelsMessagesAck

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/channels/messages/ack` |
| Sends | `version`, `read_state_type`, `last_viewed` |
| Reads | `token` |
| Called from | `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:160 app_store_parental_revocation`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script892.js:1 parse`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script1090.js:2 anonymous`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:158 2242` |
| rea | `ev_3359ac466a9af904983e8e2303cd1cc42e98a16a2d3956963ed7b1b61fe824ec` |

Seen 15 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 2 | 204 | 338–402 ms | 16667–16770 ms | — |
| inspect | step 4: press Enter | 1 | 200 | 285 ms | 7266 ms | — |
| inspect | step 5: click e40 | 2 | 204 | 313–349 ms | 15288–15389 ms | — |
| inspect | step 8: click e221 | 1 | 200 | 343 ms | 4838 ms | — |
| inspect | step 9: goto /channels/@me | 2 | 204 | 329–331 ms | 14445–14547 ms | — |
| inspect | step 17: click e180 | 1 | 200 | 315 ms | 3905 ms | — |
| inspect | step 20: press Enter | 1 | 200 | 312 ms | 7670 ms | — |
| inspect | step 21: wait 20s | 1 | 200 | 290 ms | 978 ms | — |
| inspect | step 25: goto /channels/@me | 2 | 204 | 324–370 ms | 14201–14303 ms | — |
| inspect | step 28: press Enter | 1 | 200 | 350 ms | 3015 ms | — |
| inspect | step 31: wait 60s | 1 | 200 | 301 ms | 39716 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder**, step 1: goto /channels/@me/<id>: 204, 402 ms

Sent:

```json
{
  "version": 2,
  "read_state_type": 0
}
```

Answered:

```json
null
```

**runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder**, step 4: press Enter: 200, 285 ms

Sent:

```json
{
  "last_viewed": 4319
}
```

Answered:

```json
{
  "token": null
}
```

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 5: click e40: 204, 349 ms

Sent:

```json
{
  "version": 2,
  "read_state_type": 0
}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

Marks a channel read up to a message (`POST .../messages/<id>/ack`), so the unread badge clears on every device.

## What our machine does with it

Recorded, not sent by us on purpose: opening a chat in the account's browser acks it, so a watch that opens chats marks them read.

## What can go wrong

204 is the normal answer; a failure only leaves the badge unread.
