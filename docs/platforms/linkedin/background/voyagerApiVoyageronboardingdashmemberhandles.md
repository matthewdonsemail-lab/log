# voyagerApiVoyageronboardingdashmemberhandles

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/voyager/api/voyagerOnboardingDashMemberHandles` |
| Sends | — |
| Reads | `data.entityUrn`, `data.paging`, `data.*elements`, `data.$type`, `included` |
| Called from | `runs/chrome/20261114T213510_<name:1>/script12.js:1255 model`, `runs/chrome/20261114T213510_<name:1>/script0.js:45 anonymous`, `runs/chrome/20261114T213510_<name:1>/script45.js:79 anonymous` |
| rea | `ev_be0451836bb4ed6363c51bf1be5836f6db0293bdd366fba3282caf61b3256fcc` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| chrome | step 1: the owner's own Chrome, recorded by hand (har4): the feed and messaging open | 1 | 200 | 108 ms | 23992 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/chrome/20261114T213510_<name:1>**, step 1: the owner's own Chrome, recorded by hand (har4): the feed and messaging open: 200, 108 ms

Sent:

```json
{
  "query": {
    "primary": "true",
    "q": "criteria",
    "type": "EMAIL"
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
      "count": 5,
      "start": 0,
      "links": []
    },
    "*elements": [
      "urn:li:fsd_memberHandle:(8820271263,EMAIL)"
    ],
    "$type": "com.linkedin.restli.common.CollectionResponse"
  },
  "included": [
    {
      "handleDetailUnion": {
        "emailAddress": {
          "emailAddress": "<email>",
          "confirmed": true,
          "$type": "com.linkedin.voyager.dash.common.handles.EmailAddress"
        }
      },
      "entityUrn": "<userId:2>",
      "state": "CONFIRMED",
      "profileUrn": "<userId:3>",
      "primary": true,
      "$type": "com.linkedin.voyager.dash.onboarding.handles.MemberHandle"
    }
  ]
}
```

<!-- facts:end -->

## What it does

Reads the signed-in member's primary email handle (`q=criteria`, `type=EMAIL`, `primary=true`): a collection of member handles, each with its address and whether it is confirmed, in `included`. The by-hand recording fetches it once when the feed and messaging open, about 24 s in, in 108 ms.

## What our machine does with it

Our engine never sends it: nothing in `python/linkedinApi` or openLinkedinApi calls this path, so no engine action waits for it or reads it.

## What can go wrong

Only 200 is in our recording, so its other statuses aren't shown, and since our engine doesn't send it, none can reach our runs.
