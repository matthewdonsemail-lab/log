# realtimeRealtimefrontendsubscriptions

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/realtime/realtimeFrontendSubscriptions` |
| Sends | — |
| Reads | `results.(clientConnectionId:e1e556da-5340-4943-8018-b99c7704e5fb,topic:urn%3Ali-realtime%3ApresenceStatusTopic%3Aurn%3Ali%3Afsd_profile%3A<memberId>)`, `results.(clientConnectionId:e1e556da-5340-4943-8018-b99c7704e5fb,topic:urn%3Ali-realtime%3ApresenceStatusTopic%3Aurn%3Ali%3Afsd_profile%3A<memberId>)`, `results.(clientConnectionId:e1e556da-5340-4943-8018-b99c7704e5fb,topic:urn%3Ali-realtime%3ApresenceStatusTopic%3Aurn%3Ali%3Afsd_profile%3A<memberId>)`, `results.(clientConnectionId:e1e556da-5340-4943-8018-b99c7704e5fb,topic:urn%3Ali-realtime%3ApresenceStatusTopic%3Aurn%3Ali%3Afsd_profile%3A<memberId>)`, `results.(clientConnectionId:e1e556da-5340-4943-8018-b99c7704e5fb,topic:urn%3Ali-realtime%3ApresenceStatusTopic%3Aurn%3Ali%3Afsd_profile%3A<memberId>)`, `results.(clientConnectionId:e1e556da-5340-4943-8018-b99c7704e5fb,topic:urn%3Ali-realtime%3ApresenceStatusTopic%3Aurn%3Ali%3Afsd_profile%3A<memberId>)`, `results.(clientConnectionId:e1e556da-5340-4943-8018-b99c7704e5fb,topic:urn%3Ali-realtime%3ApresenceStatusTopic%3Aurn%3Ali%3Afsd_profile%3A<memberId>)`, `errors.(clientConnectionId:e1e556da-5340-4943-8018-b99c7704e5fb,topic:urn%3Ali-realtime%3ApresenceStatusTopic%3Aurn%3Ali%3Afsd_profile%3A<memberId>)`, `errors`, `results.(clientConnectionId:e1e556da-5340-4943-8018-b99c7704e5fb,topic:urn%3Ali-realtime%3ApresenceStatusTopic%3Aurn%3Ali%3Afsd_profile%3A<memberId>)` |
| Called from | `runs/inspect/20261107T170649_<name:1>/script31.js:9748 F`, `runs/inspect/20261107T170649_<name:1>/script10.js:16 hM` |
| rea | `ev_f75930edf809c3098e1d807ab13e028f85966a789879431ed2654432f742733b` |

Seen 9 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| chrome | step 1: the owner's own Chrome, recorded by hand (har4): the feed and messaging open | 1 | 200 | 87 ms | 25181 ms | — |
| chrome | step 2: send a message, by hand | 1 | 200 | 63 ms | 8305 ms | — |
| chrome | step 8: comment on a post, by hand | 7 | 200 | 75–105 ms | 9476–9477 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/chrome/20261114T213510_<name:1>**, step 1: the owner's own Chrome, recorded by hand (har4): the feed and messaging open: 200, 87 ms

Sent:

```json
{
  "query": {
    "ids": "List((clientConnectionId:e1e556da-5340-4943-8018-b99c7704e5fb,topic:urn:li-realtime:presenceStatusTopic:urn:li:fsd_profile:<memberId>),(clientConnectionId:e1e556da-5340-4943-8018-b99c7704e5fb,topic:urn:li-realtime:presenceStatusTopic:urn:li:fsd_profile:<memberId>),(clientConnectionId:e1e556da-5340-4943-8018-b99c7704e5fb,topic:urn:li-realtim… (1277 chars)"
  },
  "body": "{\"entities\":{\"(clientConnectionId:e1e556da-5340-4943-8018-b99c7704e5fb,topic:urn%3Ali-realtime%3ApresenceStatusTopic%3Aurn%3Ali%3Afsd_profile%3A<memberId>)\":{},\"(clientConnectionId:e1e556da-5340-4943-8018-b99c7704e5fb,topic:urn%3Ali-realtime%3ApresenceStatusTopic%3Aurn%3Ali%3Afsd_profile%3A<memberId>)\":{},\"(clientConnectionId:e1e556da-5340-… (1422 chars)"
}
```

Answered:

```json
{
  "results": {
    "(clientConnectionId:e1e556da-5340-4943-8018-b99c7704e5fb,topic:urn%3Ali-realtime%3ApresenceStatusTopic%3Aurn%3Ali%3Afsd_profile%3A<memberId>)": {
      "status": 200
    },
    "(clientConnectionId:e1e556da-5340-4943-8018-b99c7704e5fb,topic:urn%3Ali-realtime%3ApresenceStatusTopic%3Aurn%3Ali%3Afsd_profile%3A<memberId>)": {
      "status": 200
    },
    "(clientConnectionId:e1e556da-5340-4943-8018-b99c7704e5fb,topic:urn%3Ali-realtime%3ApresenceStatusTopic%3Aurn%3Ali%3Afsd_profile%3A<memberId>)": {
      "status": 200
    },
    "(clientConnectionId:e1e556da-5340-4943-8018-b99c7704e5fb,topic:urn%3Ali-realtime%3ApresenceStatusTopic%3Aurn%3Ali%3Afsd_profile%3A<memberId>)": {
      "status": 200
    },
    "(clientConnectionId:e1e556da-5340-4943-8018-b99c7704e5fb,topic:urn%3Ali-realtime%3ApresenceStatusTopic%3Aurn%3Ali%3Afsd_profile%3A<memberId>)": {
      "status": 200
    },
    "(clientConnectionId:e1e556da-5340-4943-8018-b99c7704e5fb,topic:urn%3Ali-realtime%3ApresenceStatusTopic%3Aurn%3Ali%3Afsd_profile%3A<memberId>)": {
      "status": 200
    },
    "(clientConnectionId:e1e556da-5340-4943-8018-b99c7704e5fb,topic:urn%3Ali-realtime%3ApresenceStatusTopic%3Aurn%3Ali%3Afsd_profile%3A<memberId>)": {
      "status": 200
    }
  },
  "errors": {
    "(clientConnectionId:e1e556da-5340-4943-8018-b99c7704e5fb,topic:urn%3Ali-realtime%3ApresenceStatusTopic%3Aurn%3Ali%3Afsd_profile%3A<memberId>)": {
      "message": "<messageText>",
      "status": 403
    }
  }
}
```

**runs/chrome/20261114T213510_<name:1>**, step 2: send a message, by hand: 200, 63 ms

Sent:

```json
{
  "query": {
    "ids": "List((clientConnectionId:e1e556da-5340-4943-8018-b99c7704e5fb,topic:urn:li-realtime:presenceStatusTopic:urn:li:fsd_profile:<memberId>))"
  },
  "body": "{\"entities\":{\"(clientConnectionId:e1e556da-5340-4943-8018-b99c7704e5fb,topic:urn%3Ali-realtime%3ApresenceStatusTopic%3Aurn%3Ali%3Afsd_profile%3A<memberId>)\":{}}}"
}
```

Answered:

```json
{
  "results": {
    "(clientConnectionId:e1e556da-5340-4943-8018-b99c7704e5fb,topic:urn%3Ali-realtime%3ApresenceStatusTopic%3Aurn%3Ali%3Afsd_profile%3A<memberId>)": {
      "status": 200
    }
  },
  "errors": {}
}
```

**runs/chrome/20261114T213510_<name:1>**, step 8: comment on a post, by hand: 200, 75 ms

Sent:

```json
{
  "query": {
    "ids": "List((clientConnectionId:e1e556da-5340-4943-8018-b99c7704e5fb,topic:urn:li-realtime:presenceStatusTopic:urn:li:fsd_profile:<memberId>))"
  },
  "body": "{\"entities\":{\"(clientConnectionId:e1e556da-5340-4943-8018-b99c7704e5fb,topic:urn%3Ali-realtime%3ApresenceStatusTopic%3Aurn%3Ali%3Afsd_profile%3A<memberId>)\":{}}}"
}
```

Answered:

```json
{
  "results": {
    "(clientConnectionId:e1e556da-5340-4943-8018-b99c7704e5fb,topic:urn%3Ali-realtime%3ApresenceStatusTopic%3Aurn%3Ali%3Afsd_profile%3A<memberId>)": {
      "status": 200
    }
  },
  "errors": {}
}
```

<!-- facts:end -->

## What it does

Subscribes the page's realtime connection to presence-status topics, one per profile, keyed by the client connection id and the topic. The answer has a `results` map with a status for each topic and an `errors` map; one recorded answer refused a topic with 403 while the others got 200. The by-hand recording sends it nine times: when messaging opens, while a message is sent and seven times in a row during the comment step, each in 63 to 105 ms.

## What our machine does with it

Our engine never sends it and holds no realtime connection: it reads conversations and threads by asking for them (`python/linkedinApi/messaging.py`), and `send` confirms each part from the `createMessage` answer, not from a realtime event.

## What can go wrong

The call itself got 200 every time we recorded it; a topic can still fail inside the answer, as the 403 in `errors` shows. Our engine doesn't send it, so none of this reaches our runs.
