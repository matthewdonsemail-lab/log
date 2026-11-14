# voyagerApiVoyagerorganizationdashpagemailbox

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/voyager/api/voyagerOrganizationDashPageMailbox` |
| Sends | — |
| Reads | `data.entityUrn`, `data.paging`, `data.*elements`, `data.$type`, `included` |
| Called from | `runs/inspect/20261107T170649_<name:1>/script60.js:1110 anonymous`, `runs/inspect/20261107T170649_<name:1>/script60.js:1076 anonymous` |
| rea | `ev_41c8cfd9c647f8db687f9317d81557c47a1c59294c7ec06c83685220b8f86c69` |

Seen 7 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /in/<profile>/ | 1 | 200 | 78 ms | 3514 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 86 ms | 205927 ms | — |
| inspect | step 4: goto /feed/ | 1 | 200 | 87 ms | 3854 ms | — |
| inspect | step 5: goto /feed/ | 1 | 200 | 94 ms | 3401 ms | — |
| inspect | step 6: goto /feed/ | 1 | 200 | 251 ms | 3326 ms | — |
| inspect | step 12: goto /feed/ | 1 | 200 | 100 ms | 3861 ms | — |
| inspect | step 25: goto /in/<profile>/ | 1 | 200 | 87 ms | 2755 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 200, 78 ms

Sent:

```json
{
  "query": {
    "count": "3",
    "q": "admin"
  },
  "body": null
}
```

Answered:

```json
{
  "data": {
    "entityUrn": "<userId:1>",
    "paging": {
      "count": 3,
      "start": 0,
      "total": 2,
      "links": []
    },
    "*elements": [
      "urn:li:fsd_pageMailbox:84222288",
      "urn:li:fsd_pageMailbox:115435539"
    ],
    "$type": "com.linkedin.restli.common.CollectionResponse"
  },
  "included": [
    {
      "entityUrn": "<userId:2>",
      "averageResponseTimeText": null,
      "messagingEnabled": true,
      "ownerOrganizationUnion": {
        "company": "urn:li:fsd_company:143943533"
      },
      "allConversationTopicsUrns": [
        "urn:li:fsd_pageMailboxConversationTopic:1",
        "urn:li:fsd_pageMailboxConversationTopic:2",
        "urn:li:fsd_pageMailboxConversationTopic:3",
        "urn:li:fsd_pageMailboxConversationTopic:6",
        "urn:li:fsd_pageMailboxConversationTopic:7"
      ],
      "selectedConversationTopicsUrns": [
        "urn:li:fsd_pageMailboxConversationTopic:1",
        "urn:li:fsd_pageMailboxConversationTopic:2",
        "urn:li:fsd_pageMailboxConversationTopic:3",
        "urn:li:fsd_pageMailboxConversationTopic:6",
        "urn:li:fsd_pageMailboxConversationTopic:7"
      ],
      "$type": "com.linkedin.voyager.dash.organization.PageMailbox"
    },
    {
      "entityUrn": "<userId:3>",
      "averageResponseTimeText": null,
      "messagingEnabled": true,
      "ownerOrganizationUnion": {
        "company": "urn:li:fsd_company:112618992"
      },
      "allConversationTopicsUrns": [
        "urn:li:fsd_pageMailboxConversationTopic:1",
        "urn:li:fsd_pageMailboxConversationTopic:2",
        "urn:li:fsd_pageMailboxConversationTopic:3",
        "urn:li:fsd_pageMailboxConversationTopic:6",
        "urn:li:fsd_pageMailboxConversationTopic:7"
      ],
      "selectedConversationTopicsUrns": [
        "urn:li:fsd_pageMailboxConversationTopic:1",
        "urn:li:fsd_pageMailboxConversationTopic:2",
        "urn:li:fsd_pageMailboxConversationTopic:3",
        "urn:li:fsd_pageMailboxConversationTopic:6",
        "urn:li:fsd_pageMailboxConversationTopic:7"
      ],
      "$type": "com.linkedin.voyager.dash.organization.PageMailbox"
    }
  ]
}
```

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 200, 78 ms

Sent:

```json
{
  "query": {
    "count": "3",
    "q": "admin"
  },
  "body": null
}
```

Answered:

```json
{
  "data": {
    "entityUrn": "<userId:1>",
    "paging": {
      "count": 3,
      "start": 0,
      "total": 2,
      "links": []
    },
    "*elements": [
      "urn:li:fsd_pageMailbox:84222288",
      "urn:li:fsd_pageMailbox:115435539"
    ],
    "$type": "com.linkedin.restli.common.CollectionResponse"
  },
  "included": [
    {
      "entityUrn": "<userId:2>",
      "averageResponseTimeText": null,
      "messagingEnabled": true,
      "ownerOrganizationUnion": {
        "company": "urn:li:fsd_company:143943533"
      },
      "allConversationTopicsUrns": [
        "urn:li:fsd_pageMailboxConversationTopic:1",
        "urn:li:fsd_pageMailboxConversationTopic:2",
        "urn:li:fsd_pageMailboxConversationTopic:3",
        "urn:li:fsd_pageMailboxConversationTopic:6",
        "urn:li:fsd_pageMailboxConversationTopic:7"
      ],
      "selectedConversationTopicsUrns": [
        "urn:li:fsd_pageMailboxConversationTopic:1",
        "urn:li:fsd_pageMailboxConversationTopic:2",
        "urn:li:fsd_pageMailboxConversationTopic:3",
        "urn:li:fsd_pageMailboxConversationTopic:6",
        "urn:li:fsd_pageMailboxConversationTopic:7"
      ],
      "$type": "com.linkedin.voyager.dash.organization.PageMailbox"
    },
    {
      "entityUrn": "<userId:3>",
      "averageResponseTimeText": null,
      "messagingEnabled": true,
      "ownerOrganizationUnion": {
        "company": "urn:li:fsd_company:112618992"
      },
      "allConversationTopicsUrns": [
        "urn:li:fsd_pageMailboxConversationTopic:1",
        "urn:li:fsd_pageMailboxConversationTopic:2",
        "urn:li:fsd_pageMailboxConversationTopic:3",
        "urn:li:fsd_pageMailboxConversationTopic:6",
        "urn:li:fsd_pageMailboxConversationTopic:7"
      ],
      "selectedConversationTopicsUrns": [
        "urn:li:fsd_pageMailboxConversationTopic:1",
        "urn:li:fsd_pageMailboxConversationTopic:2",
        "urn:li:fsd_pageMailboxConversationTopic:3",
        "urn:li:fsd_pageMailboxConversationTopic:6",
        "urn:li:fsd_pageMailboxConversationTopic:7"
      ],
      "$type": "com.linkedin.voyager.dash.organization.PageMailbox"
    }
  ]
}
```

**runs/inspect/20261107T161246_<name:1>**, step 2: snapshot: 200, 86 ms

Sent:

```json
{
  "query": {
    "count": "3",
    "q": "admin"
  },
  "body": null
}
```

Answered:

```json
{
  "data": {
    "entityUrn": "<userId:1>",
    "paging": {
      "count": 3,
      "start": 0,
      "total": 2,
      "links": []
    },
    "*elements": [
      "urn:li:fsd_pageMailbox:84222288",
      "urn:li:fsd_pageMailbox:115435539"
    ],
    "$type": "com.linkedin.restli.common.CollectionResponse"
  },
  "included": [
    {
      "entityUrn": "<userId:2>",
      "averageResponseTimeText": null,
      "messagingEnabled": true,
      "ownerOrganizationUnion": {
        "company": "urn:li:fsd_company:143943533"
      },
      "allConversationTopicsUrns": [
        "urn:li:fsd_pageMailboxConversationTopic:1",
        "urn:li:fsd_pageMailboxConversationTopic:2",
        "urn:li:fsd_pageMailboxConversationTopic:3",
        "urn:li:fsd_pageMailboxConversationTopic:6",
        "urn:li:fsd_pageMailboxConversationTopic:7"
      ],
      "selectedConversationTopicsUrns": [
        "urn:li:fsd_pageMailboxConversationTopic:1",
        "urn:li:fsd_pageMailboxConversationTopic:2",
        "urn:li:fsd_pageMailboxConversationTopic:3",
        "urn:li:fsd_pageMailboxConversationTopic:6",
        "urn:li:fsd_pageMailboxConversationTopic:7"
      ],
      "$type": "com.linkedin.voyager.dash.organization.PageMailbox"
    },
    {
      "entityUrn": "<userId:3>",
      "averageResponseTimeText": null,
      "messagingEnabled": true,
      "ownerOrganizationUnion": {
        "company": "urn:li:fsd_company:112618992"
      },
      "allConversationTopicsUrns": [
        "urn:li:fsd_pageMailboxConversationTopic:1",
        "urn:li:fsd_pageMailboxConversationTopic:2",
        "urn:li:fsd_pageMailboxConversationTopic:3",
        "urn:li:fsd_pageMailboxConversationTopic:6",
        "urn:li:fsd_pageMailboxConversationTopic:7"
      ],
      "selectedConversationTopicsUrns": [
        "urn:li:fsd_pageMailboxConversationTopic:1",
        "urn:li:fsd_pageMailboxConversationTopic:2",
        "urn:li:fsd_pageMailboxConversationTopic:3",
        "urn:li:fsd_pageMailboxConversationTopic:6",
        "urn:li:fsd_pageMailboxConversationTopic:7"
      ],
      "$type": "com.linkedin.voyager.dash.organization.PageMailbox"
    }
  ]
}
```

<!-- facts:end -->

## What it does

LinkedIn's web client lists the company page mailboxes the account administers (`q=admin`, three at a time): for each page, whether messaging is on and which conversation topics it accepts. It fires on every profile and feed page load in our inspect runs, so the messaging panel can offer the pages' inboxes beside the account's own.

## What our machine does with it

Background traffic: nothing in log's LinkedIn direct-API engine (`python/linkedinApi/`, openLinkedinApi over curl_cffi as Chrome, through the account's governor) sends this call, waits on it or reads its answer. `log linkedin inbox` reads only the account's own mailbox (`python/linkedinApi/messaging.py`), never a page's.

## What can go wrong

Every call answered 200 in about 80 to 250 ms. A failure would only hide the page inboxes in the browser; it never affects a log run, because log never sends it.
