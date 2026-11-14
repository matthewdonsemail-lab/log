# voyagerApiVoyagermessagingdashmessengermessagedeliveryacknowledgements

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/voyager/api/voyagerMessagingDashMessengerMessageDeliveryAcknowledgements` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_33af57bedbe0353f5f89a855c5c5a1d699035eebff5c7e0730051b015cde2cca` |

Seen 6 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| chrome | step 1: the owner's own Chrome, recorded by hand (har4): the feed and messaging open | 2 | 204 | 59–125 ms | 24317–24486 ms | — |
| chrome | step 2: send a message, by hand | 2 | 204 | 60–88 ms | 992–7344 ms | — |
| chrome | step 8: comment on a post, by hand | 2 | 204 | 70–83 ms | 7657–7693 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/chrome/20261114T213510_<name:1>**, step 1: the owner's own Chrome, recorded by hand (har4): the feed and messaging open: 204, 125 ms

Sent:

```json
{
  "query": {
    "action": "sendDeliveryAcknowledgement"
  },
  "body": {
    "{\"messageUrns\":[\"urn:li:msg_message:(urn:li:fsd_profile:<memberId>,2-MTc5NDMxNTg5Mjc1MWIyNjcyNy0xMDAmMmVlMjc3ZmItNmJjZi00Y2Y1LThjZWMtNjQ5MjE3OWFiZTE3XzEwMA": "=)\",\"urn:li:msg_message:(urn:li:fsd_profile:<memberId>,2-MTc5NDQ5NjMyMzgyMGI2ODM4OC0xMDAmMmVlMjc3ZmItNmJjZi00Y2Y1LThjZWMtNjQ5MjE3OWFiZTE3XzEwMA==)\"],\"clientId\":\"voyager-web\",\"deliveryMechanism\":\"SYNC\",\"clientConsumedAt\":1794692134558}"
  }
}
```

Answered:

```json
null
```

**runs/chrome/20261114T213510_<name:1>**, step 2: send a message, by hand: 204, 88 ms

Sent:

```json
{
  "query": {
    "action": "sendDeliveryAcknowledgement"
  },
  "body": {
    "{\"messageUrns\":[\"urn:li:msg_message:(urn:li:fsd_profile:<memberId>,2-MTc5NDY5MjExNTk4NGI2Mjg2Mi0xMDAmMmVlMjc3ZmItNmJjZi00Y2Y1LThjZWMtNjQ5MjE3OWFiZTE3XzEwMA": "=)\"],\"clientId\":\"voyager-web\",\"deliveryMechanism\":\"REALTIME\",\"clientConsumedAt\":1794692145039}"
  }
}
```

Answered:

```json
null
```

**runs/chrome/20261114T213510_<name:1>**, step 8: comment on a post, by hand: 204, 70 ms

Sent:

```json
{
  "query": {
    "action": "sendDeliveryAcknowledgement"
  },
  "body": {
    "{\"messageUrns\":[\"urn:li:msg_message:(urn:li:fsd_profile:<memberId>,2-MTc5NDQ5NjMyMzgyMGI2ODM4OC0xMDAmMmVlMjc3ZmItNmJjZi00Y2Y1LThjZWMtNjQ5MjE3OWFiZTE3XzEwMA": "=)\",\"urn:li:msg_message:(urn:li:fsd_profile:<memberId>,2-MTc5NDY5MjExNTk4NGI2Mjg2Mi0xMDAmMmVlMjc3ZmItNmJjZi00Y2Y1LThjZWMtNjQ5MjE3OWFiZTE3XzEwMA==)\",\"urn:li:msg_message:(urn:li:fsd_profile:<memberId>,2-MTc5NDY5MjEyMjI5OGI4NjY4OS0xMDAmMmVlMjc3ZmItNmJjZi00Y2Y1LThjZWMtNjQ5MjE3OWFiZTE3XzEwMA==)\"],\"clientId\":\"voyager-web\",\"deliveryMechanism\":\"SYN… (436 chars)"
  }
}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

Acknowledges that messages reached the client: `action=sendDeliveryAcknowledgement` with the `messageUrns`, `clientId` `voyager-web`, `deliveryMechanism` `REALTIME` and `clientConsumedAt`. The by-hand recording sends it six times, when messaging opens, around a message being sent and during the comment step, each answered 204 in 59 to 125 ms.

## What our machine does with it

Our engine never sends it: nothing in `python/linkedinApi` calls this path, so messages our engine reads or sends are never acknowledged as delivered to a client the way the browser does.

## What can go wrong

Only 204 is in our recording, so its other statuses aren't shown. Our engine doesn't send it, so none can reach our runs.
