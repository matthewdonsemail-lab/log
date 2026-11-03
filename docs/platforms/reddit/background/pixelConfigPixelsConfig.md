# pixelConfigPixelsConfig

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `pixel-config.reddit.com/pixels/config` |
| Sends | — |
| Reads | `pixelEventConfigs`, `aam.email`, `aam.phone_number`, `esc.page_metadata` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script15.js:1 nu` |
| rea | `ev_d2728c276e2bd0500e61b6f3b0f50180a5cc5e72fc8e3506145a9c5228c7c883` |

Seen 3 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /get-started | 1 | 200 | 3 ms | 3943 ms | — |
| inspect | step 3: click e536 | 2 | 200 | 2–14 ms | 3769–32041 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 1: goto /get-started: 200, 3 ms

Sent:

```json
null
```

Answered:

```json
{
  "pixelEventConfigs": [
    {
      "id": 63614,
      "trackingType": "AddToCart",
      "triggers": [
        {
          "id": 87514,
          "triggerType": "URL",
          "triggerSelectorType": "URL_EXACT",
          "triggerSelectorValue": "https://reg.salesforce.com/flow/plus/df26/reg/page/success"
        }
      ]
    },
    {
      "id": 58803,
      "trackingType": "Custom",
      "triggers": [
        {
          "id": 81075,
          "triggerType": "URL",
          "triggerSelectorType": "URL_CONTAINS",
          "triggerSelectorValue": "[\"free-crm\"]"
        }
      ],
      "eventConfigName": "Free CRM "
    },
    {
      "id": 42490,
      "trackingType": "Custom",
      "triggers": [
        {
          "id": 59010,
          "triggerType": "URL",
          "triggerSelectorType": "URL_EXACT",
          "triggerSelectorValue": "https://www.salesforce.com/company/contact-us/"
        }
      ],
      "eventConfigName": "Contact Us – Page Visitor"
    },
    {
      "id": 55729,
      "trackingType": "Custom",
      "triggers": [
        {
          "id": 77053,
          "triggerType": "URL",
          "triggerSelectorType": "URL_CONTAINS",
          "triggerSelectorValue": "[\"ai\"]"
        }
      ],
      "eventConfigName": "AI"
    },
    {
      "id": 55715,
      "trackingType": "Custom",
      "triggers": [
        {
          "id": 77038,
          "triggerType": "URL",
          "triggerSelectorType": "URL_CONTAINS",
          "triggerSelectorValue": "[\"sales\"]"
        }
      ],
      "eventConfigName": "Sales"
    },
    {
      "id": 55722,
      "trackingType": "Custom",
      "triggers": [
        {
          "id": 77046,
          "triggerType": "URL",
          "triggerSelectorType": "URL_CONTAINS",
          "triggerSelectorValue": "[\"artificial-intelligence\"]"
        }
      ],
      "eventConfigName": "Artificial-intelligence"
    },
    "… 23 more"
  ],
  "aam": {
    "email": false,
    "phone_number": false
  },
  "esc": {
    "page_metadata": true
  }
}
```

**runs/inspect/20261103T065218_mattSlack**, step 3: click e536: 200, 2 ms

Sent:

```json
null
```

Answered:

```json
{
  "pixelEventConfigs": [
    {
      "id": 63614,
      "trackingType": "AddToCart",
      "triggers": [
        {
          "id": 87514,
          "triggerType": "URL",
          "triggerSelectorType": "URL_EXACT",
          "triggerSelectorValue": "https://reg.salesforce.com/flow/plus/df26/reg/page/success"
        }
      ]
    },
    {
      "id": 58803,
      "trackingType": "Custom",
      "triggers": [
        {
          "id": 81075,
          "triggerType": "URL",
          "triggerSelectorType": "URL_CONTAINS",
          "triggerSelectorValue": "[\"free-crm\"]"
        }
      ],
      "eventConfigName": "Free CRM "
    },
    {
      "id": 42490,
      "trackingType": "Custom",
      "triggers": [
        {
          "id": 59010,
          "triggerType": "URL",
          "triggerSelectorType": "URL_EXACT",
          "triggerSelectorValue": "https://www.salesforce.com/company/contact-us/"
        }
      ],
      "eventConfigName": "Contact Us – Page Visitor"
    },
    {
      "id": 55729,
      "trackingType": "Custom",
      "triggers": [
        {
          "id": 77053,
          "triggerType": "URL",
          "triggerSelectorType": "URL_CONTAINS",
          "triggerSelectorValue": "[\"ai\"]"
        }
      ],
      "eventConfigName": "AI"
    },
    {
      "id": 55715,
      "trackingType": "Custom",
      "triggers": [
        {
          "id": 77038,
          "triggerType": "URL",
          "triggerSelectorType": "URL_CONTAINS",
          "triggerSelectorValue": "[\"sales\"]"
        }
      ],
      "eventConfigName": "Sales"
    },
    {
      "id": 55722,
      "trackingType": "Custom",
      "triggers": [
        {
          "id": 77046,
          "triggerType": "URL",
          "triggerSelectorType": "URL_CONTAINS",
          "triggerSelectorValue": "[\"artificial-intelligence\"]"
        }
      ],
      "eventConfigName": "Artificial-intelligence"
    },
    "… 23 more"
  ],
  "aam": {
    "email": false,
    "phone_number": false
  },
  "esc": {
    "page_metadata": true
  }
}
```

<!-- facts:end -->

## What it does

<!-- toWrite --> What this request is for on the platform's side, from rea's reading of the code that sends it and the step it fires in.

## What our machine does with it

<!-- toWrite --> Which flow, inspect step or engine action waits for it, reads it, or ignores it, and why.

## What can go wrong

<!-- toWrite --> The errors and statuses it can return, what each means for the run, and what our machine does then.
