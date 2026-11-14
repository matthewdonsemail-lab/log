# voyagerApiVoyagermessagingdashmessengermessages

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/voyager/api/voyagerMessagingDashMessengerMessages` |
| Sends | — |
| Reads | `value.renderContentUnions`, `value.entityUrn`, `value.backendConversationUrn`, `value.senderUrn`, `value.originToken`, `value.body`, `value.backendUrn`, `value.conversationUrn`, `value.deliveredAt` |
| Called from | — |
| rea | `ev_5d57b838d06acdca77ae04228159522c29f1aa15d8a970c70184e63d11b4c1ef` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| chrome | step 2: send a message, by hand | 2 | 200 | 500–534 ms | 300–6609 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/chrome/20261114T213510_<name:1>**, step 2: send a message, by hand: 200, 500 ms

Sent:

```json
{
  "query": {
    "action": "createMessage"
  },
  "body": {
    "{\"message\":{\"body\":{\"attributes\":[],\"text\":\"<messageText>\"},\"renderContentUnions\":[],\"conversationUrn\":\"urn:li:msg_conversation:(urn:li:fsd_profile:<memberId>,2-MmVlMjc3ZmItNmJjZi00Y2Y1LThjZWMtNjQ5MjE3OWFiZTE3XzEwMA": "=)\",\"originToken\":\"27c6c94c-ea49-4112-900a-6b3d66c820e2\"},\"mailboxUrn\":\"urn:li:fsd_profile:<memberId>\",\"trackingId\":\"'ÆÉLêIA\\u0012\\nk=fÈ â\",\"dedupeByClientGeneratedToken\":false}"
  }
}
```

Answered:

```json
{
  "value": {
    "renderContentUnions": [],
    "entityUrn": "<userId:1>",
    "backendConversationUrn": "urn:li:messagingThread:2-MmVlMjc3ZmItNmJjZi00Y2Y1LThjZWMtNjQ5MjE3OWFiZTE3XzEwMA==",
    "senderUrn": "urn:li:msg_messagingParticipant:urn:li:fsd_profile:<memberId>",
    "originToken": "(taken out)",
    "body": {
      "attributes": [],
      "text": "<messageText>"
    },
    "backendUrn": "urn:li:messagingMessage:2-MTc5NDY5MjExNTk4NGI2Mjg2Mi0xMDAmMmVlMjc3ZmItNmJjZi00Y2Y1LThjZWMtNjQ5MjE3OWFiZTE3XzEwMA==",
    "conversationUrn": "urn:li:msg_conversation:(urn:li:fsd_profile:<memberId>,2-MmVlMjc3ZmItNmJjZi00Y2Y1LThjZWMtNjQ5MjE3OWFiZTE3XzEwMA==)",
    "deliveredAt": 1794692116364
  }
}
```

<!-- facts:end -->

## What it does

Sends one message: `action=createMessage` with the message body text, its conversation, a fresh `originToken`, the mailbox and a tracking id. The answer is the message as stored, with its `entityUrn`, `body`, `conversationUrn`, `senderUrn` and `deliveredAt`. The by-hand recording sends two, each answered 200 in about half a second.

## What our machine does with it

`Messaging.send` in `python/linkedinApi/messaging.py` sends it as `createMessage` for each part of `log linkedin message`, right after that part's `typing`. `sent_message` reads the answer: the part counts as sent only when `value.entityUrn` is a `urn:li:msg_message` and `value.body.text` equals what was sent, and then its urn and `deliveredAt` are kept.

## What can go wrong

Only 200 is in our recording. `check` turns 429 or 999 into `rateLimited`, 401 or 403 into `sessionDead`, a deleted `li_at` into `sessionRevoked` and any other status from 300 up into `linkedinRefused`. An answer that doesn't name the message with that text is `messageUnconfirmed`: the parts after it aren't sent, the ones before it are reported, and nothing is retried (rule 94).
