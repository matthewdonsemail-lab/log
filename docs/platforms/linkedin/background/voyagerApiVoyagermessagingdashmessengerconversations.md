# voyagerApiVoyagermessagingdashmessengerconversations

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/voyager/api/voyagerMessagingDashMessengerConversations` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_83fc7a1b641bb587dc255ed3d2b052a70a23cdef60ce130bcbe2e59e9c18e117` |

Seen 3 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| chrome | step 1: the owner's own Chrome, recorded by hand (har4): the feed and messaging open | 2 | 202 | 66–96 ms | 28312–33313 ms | — |
| chrome | step 2: send a message, by hand | 1 | 202 | 67 ms | 2319 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/chrome/20261114T213510_<name:1>**, step 1: the owner's own Chrome, recorded by hand (har4): the feed and messaging open: 202, 96 ms

Sent:

```json
{
  "query": {
    "action": "typing"
  },
  "body": {
    "{\"conversationUrn\":\"urn:li:msg_conversation:(urn:li:fsd_profile:<memberId>,2-MmVlMjc3ZmItNmJjZi00Y2Y1LThjZWMtNjQ5MjE3OWFiZTE3XzEwMA": "=)\"}"
  }
}
```

Answered:

```json
null
```

**runs/chrome/20261114T213510_<name:1>**, step 2: send a message, by hand: 202, 67 ms

Sent:

```json
{
  "query": {
    "action": "typing"
  },
  "body": {
    "{\"conversationUrn\":\"urn:li:msg_conversation:(urn:li:fsd_profile:<memberId>,2-MmVlMjc3ZmItNmJjZi00Y2Y1LThjZWMtNjQ5MjE3OWFiZTE3XzEwMA": "=)\"}"
  }
}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

Tells the other side that the account is typing in a conversation: `action=typing` with the `conversationUrn`. The by-hand recording sends it while messaging is open and 2.3 s into sending a message, answered 202 with no body in 66 to 96 ms.

## What our machine does with it

`Messaging.send` in `python/linkedinApi/messaging.py` sends it as `typing` before each part of `log linkedin message`, after reading the thread, then waits a while that grows with the part's length before `createMessage`. The answer has no body and isn't read; only its status matters.

## What can go wrong

Only 202 is in our recording. `check` lets any status under 300 through, so the 202 goes on; 429 or 999 stops the send with `rateLimited`, 401 or 403 with `sessionDead`, a deleted `li_at` with `sessionRevoked` and any other status from 300 up with `linkedinRefused`, before the part is sent. Nothing is retried.
