# voyagerApiVoyagermessaginggraphqlGraphql

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/voyager/api/voyagerMessagingGraphQL/graphql` |
| Sends | — |
| Reads | `data._recipeType`, `data._type`, `data.messengerConversationsByCategoryQuery`, `data.messengerMessagesBySyncToken`, `data.messengerSeenReceiptsByConversation`, `data.messengerQuickRepliesByConversation` |
| Called from | — |
| rea | `ev_382acc38c115503959fc71a1465444794e4d45cf9575570dcf8b044697b44c40` |

Seen 27 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /in/<profile>/ | 2 | 200 | 92–685 ms | 3517–5826 ms | — |
| inspect | step 2: snapshot | 2 | 200 | 143–659 ms | 205930–206594 ms | — |
| inspect | step 4: goto /feed/ | 2 | 200 | 91–608 ms | 3858–4471 ms | — |
| inspect | step 5: goto /feed/ | 2 | 200 | 85–624 ms | 3405–4034 ms | — |
| inspect | step 6: goto /feed/ | 2 | 200 | 84–665 ms | 3330–4000 ms | — |
| inspect | step 12: goto /feed/ | 2 | 200 | 138–643 ms | 3866–4525 ms | — |
| inspect | step 25: goto /in/<profile>/ | 2 | 200 | 81–633 ms | 2758–3401 ms | — |
| chrome | step 1: the owner's own Chrome, recorded by hand (har4): the feed and messaging open | 7 | 200 | 127–580 ms | 23983–24497 ms | — |
| chrome | step 8: comment on a post, by hand | 6 | 200 | 122–297 ms | 7232–7704 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 200, 685 ms

Sent:

```json
{
  "query": {
    "queryId": "messengerConversations.05bbed349f58585b3270fc478e2fc81c",
    "variables": "(mailboxUrn:urn:li:fsd_profile:<memberId>)"
  },
  "body": null
}
```

Answered:

```json
"eyJkYXRhIjp7Il9yZWNpcGVUeXBlIjoiY29tLmxpbmtlZGluLmJjMTNlMWIxNDI2Y2MwM2UzNmVhYjUwM2QzNDJjYWJlIiwiX3R5cGUiOiJjb20ubGlua2VkaW4uYmMxM2UxYjE0MjZjYzAzZTM2ZWFiNTAzZDM0MmNhYmUiLCJtZXNzZW5nZXJDb252ZXJzYXRpb25zQnlTeW5jVG9rZW4iOnsiX3R5cGUiOiJjb20ubGlua2VkaW4ucmVzdGxpLmNvbW1vbi5Db2xsZWN0aW9uUmVzcG9uc2UiLCJtZXRhZGF0YSI6eyJuZXdTeW5jVG9rZW4iOiJ1SmlEcjdabzFMblE3N1pvTG5WeWJqcHNhVHBtWVdKeWFXTTZjSEp2WkMxc2IzSXhBQT09… (491684 chars)"
```

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 200, 685 ms

Sent:

```json
{
  "query": {
    "queryId": "messengerConversations.05bbed349f58585b3270fc478e2fc81c",
    "variables": "(mailboxUrn:urn:li:fsd_profile:<memberId>)"
  },
  "body": null
}
```

Answered:

```json
"eyJkYXRhIjp7Il9yZWNpcGVUeXBlIjoiY29tLmxpbmtlZGluLmJjMTNlMWIxNDI2Y2MwM2UzNmVhYjUwM2QzNDJjYWJlIiwiX3R5cGUiOiJjb20ubGlua2VkaW4uYmMxM2UxYjE0MjZjYzAzZTM2ZWFiNTAzZDM0MmNhYmUiLCJtZXNzZW5nZXJDb252ZXJzYXRpb25zQnlTeW5jVG9rZW4iOnsiX3R5cGUiOiJjb20ubGlua2VkaW4ucmVzdGxpLmNvbW1vbi5Db2xsZWN0aW9uUmVzcG9uc2UiLCJtZXRhZGF0YSI6eyJuZXdTeW5jVG9rZW4iOiJ1SmlEcjdabzFMblE3N1pvTG5WeWJqcHNhVHBtWVdKeWFXTTZjSEp2WkMxc2IzSXhBQT09… (491684 chars)"
```

**runs/inspect/20261107T161246_<name:1>**, step 2: snapshot: 200, 659 ms

Sent:

```json
{
  "query": {
    "queryId": "messengerConversations.05bbed349f58585b3270fc478e2fc81c",
    "variables": "(mailboxUrn:urn:li:fsd_profile:<memberId>)"
  },
  "body": null
}
```

Answered:

```json
"eyJkYXRhIjp7Il9yZWNpcGVUeXBlIjoiY29tLmxpbmtlZGluLmJjMTNlMWIxNDI2Y2MwM2UzNmVhYjUwM2QzNDJjYWJlIiwiX3R5cGUiOiJjb20ubGlua2VkaW4uYmMxM2UxYjE0MjZjYzAzZTM2ZWFiNTAzZDM0MmNhYmUiLCJtZXNzZW5nZXJDb252ZXJzYXRpb25zQnlTeW5jVG9rZW4iOnsiX3R5cGUiOiJjb20ubGlua2VkaW4ucmVzdGxpLmNvbW1vbi5Db2xsZWN0aW9uUmVzcG9uc2UiLCJtZXRhZGF0YSI6eyJuZXdTeW5jVG9rZW4iOiJ1SmlEcjdab3hwWGY3TFpvTG5WeWJqcHNhVHBtWVdKeWFXTTZjSEp2WkMxc2IzSXhBQT09… (491684 chars)"
```

<!-- facts:end -->

## What it does

LinkedIn's messaging GraphQL. On every profile and feed page load in our inspect runs the web client fired it twice; the recorded samples are `messengerConversations`, keyed by the account's own mailbox, which lists the account's conversations for the messaging panel. The recording kept the answers as an encoded string, which is why no fields are listed as read.

## What our machine does with it

Our engine sends this call. `log linkedin inbox` and `messages` (`Messaging`, `python/linkedinApi/messaging.py`) first read `/voyager/api/me` for the account's mailbox, then send `messengerConversations` for the primary inbox, 20 at a time, and `messengerMessages` for one conversation's thread, each with its own recorded query id, as GET requests with the browser's headers through the account's governor. It reads each answer's `elements` into conversations and messages.

## What can go wrong

Every browser call answered 200 in about 80 to 690 ms. In the engine, a 429 or 999 stops the run as `rateLimited`, 401 or 403 as `sessionDead`, an answer that deletes the session cookie as `sessionRevoked`, any other status from 300 up or a GraphQL `errors` list as `linkedinRefused`, and an answer with no `elements` as `templateStale` (the query changed and must be recorded again). Nothing is retried. rea has not read this call yet.
