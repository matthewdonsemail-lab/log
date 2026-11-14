# litmsApiMetadata

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/litms/api/metadata` |
| Sends | — |
| Reads | `emails.sha1`, `emails.sha256`, `client.deviceType`, `client.browserLanguage`, `client.assignedControlGroup`, `client.assignedLtsNgwTreatment`, `client.isUserLoggedIn`, `client.countryCode`, `client.isInternalRequest`, `id.dmp`, `compliance.isCCPAOptIn`, `compliance.isLinkedInEmployee` and 11 more |
| Called from | `runs/inspect/20261107T170649_<name:1>/script37.js:1709 statement`, `runs/inspect/20261107T170649_<name:1>/script60.js:1992 statement`, `runs/chrome/20261114T213510_<name:1>/script1.js:1000 statement`, `runs/chrome/20261114T213510_<name:1>/script46.js:1106 statement` |
| rea | `ev_766af98e3a50ffaf4e1b39b21de7a4d3d663e2db9759eebd4ca09ec0675adebd` |

Seen 9 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 6: click e2157 | 1 | 200 | 103 ms | 658 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 99 ms | 208361 ms | — |
| inspect | step 4: goto /feed/ | 1 | 200 | 209 ms | 2338 ms | — |
| inspect | step 5: goto /feed/ | 1 | 200 | 155 ms | 2293 ms | — |
| inspect | POST 0 /flagship-web/rsc-action/actions/pagination (759 ms) | 1 | 200 | 118 ms | 65 ms | — |
| inspect | step 6: goto /feed/ | 1 | 200 | 178 ms | 2236 ms | — |
| inspect | step 12: goto /feed/ | 1 | 200 | 162 ms | 3351 ms | — |
| inspect | clearSession: linkedin cookies cleared on 1 domain(s): .linkedin.com | 1 | 200 | 65 ms | 4220 ms | — |
| chrome | step 2: send a message, by hand | 1 | 200 | 112 ms | 10098 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T170649_<name:1>**, step 6: click e2157: 200, 103 ms

Sent:

```json
null
```

Answered:

```json
{
  "emails": {
    "sha1": [
      "39461459804f2a8e07f270879d3b95cbeb36201a"
    ],
    "sha256": [
      "0ee84e175e34483ea0f37b20858e7fd489a8baac9005e9fc01217180f9f55525"
    ]
  },
  "client": {
    "deviceType": "Personal computer",
    "browserLanguage": "en-US",
    "assignedControlGroup": "qualtrics",
    "assignedLtsNgwTreatment": "control",
    "isUserLoggedIn": true,
    "countryCode": "ca",
    "isInternalRequest": false
  },
  "id": {
    "dmp": "AYf3vVqlT0zNRHj4zl4kk69TbtSk&v=2"
  },
  "compliance": {
    "isCCPAOptIn": true,
    "isLinkedInEmployee": false,
    "isResearchInvitationsOptIn": true,
    "isGDPRCountryResident": false,
    "isFunctionalOptIn": true,
    "isGeoOptIn": true,
    "isGDPROptIn": true,
    "isAdvertisingOptIn": true,
    "isAnalyticsAndResearchOptIn": true
  },
  "primaryEmail": {
    "sha1": "39461459804f2a8e07f270879d3b95cbeb36201a",
    "sha256": "0ee84e175e34483ea0f37b20858e7fd489a8baac9005e9fc01217180f9f55525"
  },
  "preference": {
    "language": "en-us"
  }
}
```

**runs/inspect/20261107T161246_<name:1>**, step 2: snapshot: 200, 99 ms

Sent:

```json
null
```

Answered:

```json
{
  "emails": {
    "sha1": [
      "39461459804f2a8e07f270879d3b95cbeb36201a"
    ],
    "sha256": [
      "0ee84e175e34483ea0f37b20858e7fd489a8baac9005e9fc01217180f9f55525"
    ]
  },
  "client": {
    "deviceType": "Personal computer",
    "browserLanguage": "en-US",
    "assignedControlGroup": "qualtrics",
    "assignedLtsNgwTreatment": "control",
    "isUserLoggedIn": true,
    "countryCode": "ca",
    "isInternalRequest": false
  },
  "id": {
    "dmp": "AYf3vVqlT0zNRHj4zl4kk69TbtSk&v=2"
  },
  "compliance": {
    "isCCPAOptIn": true,
    "isLinkedInEmployee": false,
    "isResearchInvitationsOptIn": true,
    "isGDPRCountryResident": false,
    "isFunctionalOptIn": true,
    "isGeoOptIn": true,
    "isGDPROptIn": true,
    "isAdvertisingOptIn": true,
    "isAnalyticsAndResearchOptIn": true
  },
  "primaryEmail": {
    "sha1": "39461459804f2a8e07f270879d3b95cbeb36201a",
    "sha256": "0ee84e175e34483ea0f37b20858e7fd489a8baac9005e9fc01217180f9f55525"
  },
  "preference": {
    "language": "en-us"
  }
}
```

**runs/inspect/20261107T161246_<name:1>**, step 4: goto /feed/: 200, 209 ms

Sent:

```json
null
```

Answered:

```json
{
  "emails": {
    "sha1": [
      "39461459804f2a8e07f270879d3b95cbeb36201a"
    ],
    "sha256": [
      "0ee84e175e34483ea0f37b20858e7fd489a8baac9005e9fc01217180f9f55525"
    ]
  },
  "client": {
    "deviceType": "Personal computer",
    "browserLanguage": "en-US",
    "assignedControlGroup": "qualtrics",
    "assignedLtsNgwTreatment": "control",
    "isUserLoggedIn": true,
    "countryCode": "ca",
    "isInternalRequest": false
  },
  "id": {
    "dmp": "AYf3vVqlT0zNRHj4zl4kk69TbtSk&v=2"
  },
  "compliance": {
    "isCCPAOptIn": true,
    "isLinkedInEmployee": false,
    "isResearchInvitationsOptIn": true,
    "isGDPRCountryResident": false,
    "isFunctionalOptIn": true,
    "isGeoOptIn": true,
    "isGDPROptIn": true,
    "isAdvertisingOptIn": true,
    "isAnalyticsAndResearchOptIn": true
  },
  "primaryEmail": {
    "sha1": "39461459804f2a8e07f270879d3b95cbeb36201a",
    "sha256": "0ee84e175e34483ea0f37b20858e7fd489a8baac9005e9fc01217180f9f55525"
  },
  "preference": {
    "language": "en-us"
  }
}
```

<!-- facts:end -->

## What it does

The web client's tag manager (LiTMS) asks who is looking before it decides which tags to load: the answer carries the signed-in account's email as SHA-1 and SHA-256 hashes, the client's device type, browser language, country and test groups, a DMP id, the account's consent flags (CCPA, GDPR, advertising, analytics, functional, geo) and its preferred language. It sends nothing of its own and fires on every feed load and some clicks in our inspect steps, in 65 to 209 ms.

## What our machine does with it

Nothing: log's LinkedIn direct-API engine (`python/linkedinApi`, openLinkedinApi over curl_cffi as Chrome, through the account's governor) never sends it and reads nothing from it. It is background browser traffic, seen only in `log inspect` recordings of the account's browser.

## What can go wrong

Every answer in our runs is 200. A failure here only changes which tags the browser page loads; it never reaches a direct-API run, which doesn't make this call.
