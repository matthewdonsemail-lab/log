# ajaxBz

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/ajax/bz` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_7d19cfe1e6071070328155d2deff0eba19eac03c7e288867577eea08652d5a6b` |

Seen 164 time(s) in 14 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | step 1: goto /marketplace/selling/ | 22 | -1, 200 | -1–1415 ms | 4829–13611 ms | — |
| host | GET 200 /nw/ (319 ms) | 1 | -1 | -1 ms | 2587 ms | — |
| host | step 4: goto /login/ | 5 | -1, 200 | -1–373 ms | 37–5778 ms | — |
| host | GET 200 /nw/ (344 ms) | 1 | -1 | -1 ms | 3711 ms | — |
| host | step 7: signIn | 1 | -1 | -1 ms | 2322 ms | — |
| host | signIn: email typed | 2 | -1, 200 | -1–1577 ms | 1896–1997 ms | — |
| host | signIn: password typed; submitting with Enter | 9 | -1, 200 | -1–797 ms | 69–17116 ms | — |
| host | GET 200 /nw/ (355 ms) | 3 | -1 | -1 ms | 392–2265 ms | — |
| host | step 2: pageText | 1 | -1 | -1 ms | 835 ms | — |
| host | step 4: goto /marketplace/selling/ | 6 | -1 | -1 ms | 58–2707 ms | — |
| host | step 5: pageText | 2 | -1, 200 | -1–362 ms | 1313–1528 ms | — |
| host | step 7: goto /marketplace/selling/ | 6 | -1 | -1 ms | 57–3042 ms | — |
| host | step 8: pageText | 2 | -1, 200 | -1–353 ms | 1241–5159 ms | — |
| connect | Opening Marketplace > Selling. | 7 | -1 | -1 ms | 7239–9789 ms | — |
| connect | Page: loginForm /marketplace/selling/ "…" | 1 | -1 | -1 ms | 573 ms | — |
| connect | submitCredentials failed: crashed Error | 1 | -1 | -1 ms | 1666 ms | — |
| connect | Auto-login: submitting (Enter). | 2 | -1 | -1 ms | 26–102 ms | — |
| inspect | step 27: click e1541 | 1 | 200 | 1489 ms | 37737 ms | — |
| inspect | step 5: wait 5s | 1 | 200 | 1403 ms | 80871 ms | — |
| inspect | step 3: goto /marketplace/inbox | 3 | 200, 0 | 0–501 ms | 589944–1455304 ms | — |
| warmup | step 17: dwell 2-4s | 1 | 200 | 377 ms | 80196 ms | — |
| inspect | step 3: click e356 | 1 | 200 | 348 ms | 16302 ms | — |
| host | step 13: code | 1 | 200 | 360 ms | 8434 ms | — |
| host | code failed: RuntimeError: controlMissing: no visible textbox "…" | 1 | 200 | 375 ms | 5140 ms | — |
| host | step 20: code | 1 | 200 | 1542 ms | 6077 ms | — |
| host | code: typed the current authenticator code; submitting with Enter | 1 | 200 | 436 ms | 3103 ms | — |
| inspect | step 1: goto /login/ | 5 | 200 | 506–2835 ms | 8286–17100 ms | — |
| inspect | step 2: signIn | 1 | 200 | 3011 ms | 2117 ms | — |
| inspect | signIn: email typed | 2 | 200 | 667–845 ms | 1847–2148 ms | — |
| inspect | signIn: password typed; submitting with Enter | 9 | 200, 0 | 0–2415 ms | 84–31464 ms | — |
| inspect | step 1: goto / | 9 | 200 | 314–1595 ms | 2851–12655 ms | — |
| inspect | Inspect session open. Send steps with: log inspect do <action>. | 13 | 200 | 309–11506 ms | 104–511678 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 5374 ms | 37640 ms | — |
| inspect | code: typed the current authenticator code; submitting with Enter | 1 | 200 | 426 ms | 3584 ms | — |
| inspect | step 2: goto / | 12 | 200 | 329–586 ms | 8560–272967 ms | — |
| inspect | step 3: viewerInput click | 1 | 200 | 378 ms | 1845 ms | — |
| inspect | step 6: viewerInput key | 21 | 200 | 314–1844 ms | 10700–1167810 ms | — |
| inspect | step 8: viewerInput click | 1 | 200 | 422 ms | 1511 ms | — |
| inspect | step 9: viewerInput click | 1 | 200 | 429 ms | 3571 ms | — |
| inspect | step 10: viewerInput text | 4 | 200 | 386–1514 ms | 63152–193498 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/warmup/20261023T074930_<id:2>**, step 17: dwell 2-4s: 200, 377 ms

Sent:

```json
{
  "query": {
    "cquick": "_r_31_",
    "cquick_token": "(taken out)",
    "ctarget": "https://www.facebook.com"
  },
  "body": {
    "------WebKitFormBoundarytLYumdcAb59VtD07\r\nContent-Disposition: form-data; name": "\"ts\"\r\n\r\n1792742541282\r\n------WebKitFormBoundarytLYumdcAb59VtD07\r\nContent-Disposition: form-data; name=<name:1>"q\"\r\n\r\n[{\"app_id\":\"2220391788200892\",\"posts\":\"zgS4W1sicWV4Iix7ImwiOiJKe1wicWVpZFwiOlwiNjE1OTQwNjMyMDc2NjlcIixcInUFGQULAHQFCwRmYgUNIGdrc1wiOltdLAE/eFwiOm51bGx9In0sMTc5Mjc0MjQ4MTI1NSwwLDg1XSz cQCmcQAELjT cwD cwD cwD cwCycwA4X2FjdGluZ19hY2NvdW50ptkBJC40LDAsMTAwXV0=\",\"user\":\"<userId:1>\",\"webSessio… (556 chars)"
  }
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "A-enHRPtqdcp945eGeLpZG8",
  "payload": null,
  "lid": "7699770584893673991"
}
```

**runs/inspect/20261111T081957_<id:1>**, step 1: goto /: 200, 763 ms

Sent:

```json
{
  "query": {
    "ph": "C3"
  },
  "body": {
    "------WebKitFormBoundaryvsGfqxCzNyFVtVCD\r\nContent-Disposition: form-data; name": "\"ts\"\r\n\r\n1794385229324\r\n------WebKitFormBoundaryvsGfqxCzNyFVtVCD\r\nContent-Disposition: form-data; name=<name:1>"q\"\r\n\r\n[{\"app_id\":\"2220391788200892\",\"posts\":[[\"falco:bd_pdc_signals\",{\"e\":\"{\\\"asid\\\":\\\"8cd6f825-fc6d-4c75-b723-3a56a222c650\\\",\\\"ct\\\":1794385227,\\\"sjd\\\":\\\"L SYLA34745Vh0ij0QnqFgix0UMAg1hMLF q rNWFvWwh9xgmlhTZ2gVMgjdI9fAxDub7fXk9iREWSk5SLB0F1U1twI8CqvOY08OG0ZvSGk7itkQkNI3lwg7BoBZOpRWUK6SFyoDV2fUFcy… (851 chars)"
  }
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "AOB8emiI69vnb9_h63piKCq",
  "payload": null,
  "lid": "7706825875642828341"
}
```

**runs/inspect/20261111T081957_<id:1>**, Inspect session open. Send steps with: log inspect do <action>.: 200, 329 ms

Sent:

```json
{
  "query": {
    "ph": "C3",
    "qpl_active_flow_ids": "175125627,516759801"
  },
  "body": {
    "------WebKitFormBoundaryhNGkCv0ZQW1sxlHs\r\nContent-Disposition: form-data; name": "\"ts\"\r\n\r\n1794385259346\r\n------WebKitFormBoundaryhNGkCv0ZQW1sxlHs\r\nContent-Disposition: form-data; name=<name:1>"q\"\r\n\r\n[{\"app_id\":\"2220391788200892\",\"posts\":[[\"falco:bd_pdc_signals\",{\"e\":\"{\\\"asid\\\":\\\"8cd6f825-fc6d-4c75-b723-3a56a222c650\\\",\\\"ct\\\":1794385227,\\\"sjd\\\":\\\"L SYLA34745Vh0ij0QnqFhFnWKml3UeIfzDRR1dlaQyVtGFA9wJNCjUSnNGLYDHGg6eiR7Bt0CFbygtiyGNe4l6YnUxLMtNZ4Dg5knLZRkPy54JIBPqmPmi n16W7G4vv2Z 3iTBPBobosE… (851 chars)"
  }
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "ABI88fY3M3zR8BeTG-utGKp",
  "payload": null,
  "lid": "7706826004805605434"
}
```

<!-- facts:end -->

## What it does

Telemetry: the page's error and event logging, batched.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `platformKit/connect` or `facebook/marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
