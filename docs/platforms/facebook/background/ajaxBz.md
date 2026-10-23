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
| rea | `ev_70efc081c67ed7332e21c5498e2db53c87d1066c637ab8bfc22fe41d543c7021` |

Seen 58 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | step 1: goto /marketplace/selling/ | 15 | -1 | -1 ms | 5723–9570 ms | — |
| host | GET 200 /nw/ (319 ms) | 1 | -1 | -1 ms | 2587 ms | — |
| host | step 4: goto /login/ | 3 | -1 | -1 ms | 59–5778 ms | — |
| host | GET 200 /nw/ (344 ms) | 1 | -1 | -1 ms | 3711 ms | — |
| host | step 7: signIn | 1 | -1 | -1 ms | 2322 ms | — |
| host | signIn: email typed | 1 | -1 | -1 ms | 1997 ms | — |
| host | signIn: password typed; submitting with Enter | 2 | -1 | -1 ms | 1037–4859 ms | — |
| host | GET 200 /nw/ (355 ms) | 3 | -1 | -1 ms | 392–2265 ms | — |
| host | step 2: pageText | 1 | -1 | -1 ms | 835 ms | — |
| host | step 4: goto /marketplace/selling/ | 6 | -1 | -1 ms | 58–2707 ms | — |
| host | step 5: pageText | 1 | -1 | -1 ms | 1528 ms | — |
| host | step 7: goto /marketplace/selling/ | 6 | -1 | -1 ms | 57–3042 ms | — |
| host | step 8: pageText | 1 | -1 | -1 ms | 1241 ms | — |
| connect | Opening Marketplace > Selling. | 7 | -1 | -1 ms | 7239–9789 ms | — |
| connect | Page: loginForm /marketplace/selling/ "…" | 1 | -1 | -1 ms | 573 ms | — |
| connect | submitCredentials failed: crashed Error | 1 | -1 | -1 ms | 1666 ms | — |
| connect | Auto-login: submitting (Enter). | 2 | -1 | -1 ms | 26–102 ms | — |
| inspect | step 27: click e1541 | 1 | 200 | 1489 ms | 37737 ms | — |
| inspect | step 5: wait 5s | 1 | 200 | 1403 ms | 80871 ms | — |
| inspect | step 3: goto /marketplace/inbox | 3 | 200, 0 | 0–501 ms | 589944–1455304 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T155857_61594063207669**, step 3: goto /marketplace/inbox: 200, 501 ms

Sent:

```json
{
  "query": {
    "cquick": "_r_uo_",
    "cquick_token": "AUehHkkVOzIG9jI4NoDRWETt25U",
    "ctarget": "https://www.facebook.com"
  },
  "body": {
    "------WebKitFormBoundaryCZUGYBYfOBmqdqCo\r\nContent-Disposition: form-data; name": "\"ts\"\r\n\r\n1792685448099\r\n------WebKitFormBoundaryCZUGYBYfOBmqdqCo\r\nContent-Disposition: form-data; name=\"q\"\r\n\r\n[{\"app_id\":\"2220391788200892\",\"posts\":\"0wS4W1sicWV4Iix7ImwiOiJKe1wicWVpZFwiOlwiNjE1OTQwNjMyMDc2NjlcIixcInUFGQULAHQFCwRmYgUNIGdrc1wiOltdLAE/kFwiOm51bGx9In0sMTc5MjY4NTM4ODA5Mi4yMDAyLDAsODVdLFv dgCmdgAANf5zAMZzAAA2/nMA/nMA5nMAOF9hY3RpbmdfYWNjb3VudKreASA2LDAsMTAwXV0=\",\"user\":\"61594063207669\",\"w… (564 chars)"
  }
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "A4KS55YXP4Y_uBFYlBke3Wn",
  "payload": null,
  "lid": "7699525367192032385"
}
```

**runs/inspect/20261022T113536_61594063207669**, step 5: wait 5s: 200, 1403 ms

Sent:

```json
{
  "query": {
    "cquick": "_r_31_",
    "cquick_token": "AUehHkkVOzIG9jI4NoDRWETtuT0",
    "ctarget": "https://www.facebook.com"
  },
  "body": {
    "------WebKitFormBoundaryRZPZmXHouM5GdwQf\r\nContent-Disposition: form-data; name": "\"ts\"\r\n\r\n1792669129979\r\n------WebKitFormBoundaryRZPZmXHouM5GdwQf\r\nContent-Disposition: form-data; name=\"q\"\r\n\r\n[{\"app_id\":\"2220391788200892\",\"posts\":\"0AS4W1sicWV4Iix7ImwiOiJKe1wicWVpZFwiOlwiNjE1OTQwNjMyMDc2NjlcIixcInUFGQULAHQFCwRmYgUNIGdrc1wiOltdLAE/gFwiOm51bGx9In0sMTc5MjY2OTA2OTk3My40LDAsODVdLP5zAKpzAAA4/nMA/nMA/nMA/nMAsnMAOF9hY3RpbmdfYWNjb3VudKrbASA4LDAsMTAwXV0=\",\"user\":\"61594063207669\",\"webSessio… (556 chars)"
  }
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "AYqhIu2zu9Y1-mrx8O882o2",
  "payload": null,
  "lid": "7699455287860523565"
}
```

**runs/inspect/20261022T110738_61594063207669**, step 27: click e1541: 200, 1489 ms

Sent:

```json
{
  "query": {
    "cquick": "_r_ae_",
    "cquick_token": "AUehHkkVOzIG9jI4NoDRWETt3hw",
    "ctarget": "https://www.facebook.com"
  },
  "body": {
    "------WebKitFormBoundarydB2yf6OsPJSjAwp9\r\nContent-Disposition: form-data; name": "\"ts\"\r\n\r\n1792668006640\r\n------WebKitFormBoundarydB2yf6OsPJSjAwp9\r\nContent-Disposition: form-data; name=\"q\"\r\n\r\n[{\"app_id\":\"2220391788200892\",\"posts\":\"0wS4W1sicWV4Iix7ImwiOiJKe1wicWVpZFwiOlwiNjE1OTQwNjMyMDc2NjlcIixcInUFGQULAHQFCwRmYgUNIGdrc1wiOltdLAE/gFwiOm51bGx9In0sMTc5MjY2Nzk0NjYzNS4yLDAsODVdLP5zAKpzAAA1/nMA/nMA/nMA/nMAsnMAOF9hY3RpbmdfYWNjb3VudKrbASw1OTk5LDAsMTAwXV0=\",\"user\":\"61594063207669\",\"webSe… (560 chars)"
  }
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "AWSt8NCO7-1N8ONdYcbBgw-",
  "payload": null,
  "lid": "7699450463129631828"
}
```

<!-- facts:end -->

## What it does

Telemetry: the page's error and event logging, batched.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
