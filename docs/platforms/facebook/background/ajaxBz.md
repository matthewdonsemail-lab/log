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
| rea | `ev_03dd59976ffbffa3f633595a9830f9a4e1c3a6e34beb6a3c9d6eaebff43ecccf` |

Seen 93 time(s) in 10 run(s).

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
| inspect | signIn: email typed | 1 | 200 | 845 ms | 1847 ms | — |
| inspect | signIn: password typed; submitting with Enter | 3 | 200, 0 | 0–840 ms | 1023–11159 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/warmup/20261023T074930_61594063207669**, step 17: dwell 2-4s: 200, 377 ms

Sent:

```json
{
  "query": {
    "cquick": "_r_31_",
    "cquick_token": "(taken out)",
    "ctarget": "https://www.facebook.com"
  },
  "body": {
    "------WebKitFormBoundarytLYumdcAb59VtD07\r\nContent-Disposition: form-data; name": "\"ts\"\r\n\r\n1792742541282\r\n------WebKitFormBoundarytLYumdcAb59VtD07\r\nContent-Disposition: form-data; name=\"q\"\r\n\r\n[{\"app_id\":\"2220391788200892\",\"posts\":\"zgS4W1sicWV4Iix7ImwiOiJKe1wicWVpZFwiOlwiNjE1OTQwNjMyMDc2NjlcIixcInUFGQULAHQFCwRmYgUNIGdrc1wiOltdLAE/eFwiOm51bGx9In0sMTc5Mjc0MjQ4MTI1NSwwLDg1XSz cQCmcQAELjT cwD cwD cwD cwCycwA4X2FjdGluZ19hY2NvdW50ptkBJC40LDAsMTAwXV0=\",\"user\":\"61594063207669\",\"webSessio… (556 chars)"
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

**runs/inspect/20261025T063549_61594360734687**, step 1: goto /login/: 200, 1631 ms

Sent:

```json
{
  "query": {
    "ph": "C3"
  },
  "body": {
    "------WebKitFormBoundary4PRdgXhOgUmst6iA\r\nContent-Disposition: form-data; name": "\"ts\"\r\n\r\n1792910178572\r\n------WebKitFormBoundary4PRdgXhOgUmst6iA\r\nContent-Disposition: form-data; name=\"q\"\r\n\r\n[{\"app_id\":\"2220391788200892\",\"posts\":[[\"falco:qe2_js_exposure\",{\"e\":\"{\\\"universe\\\":\\\"fblite_urs_comet_qr_codes\\\",\\\"unit_id\\\":\\\"\\\",\\\"unit_type\\\":5,\\\"param\\\":\\\"should_show_qr_on_login_page\\\"}\",\"r\":1,\"d\":\"fd.ARvwx6PlHSgHPk4FtNScsBxmYnJl74rt5Y7T0B6iaolABoKoxZqLm43SyuebGfLRhNxc9RBequFarFoc8xK4S… (717 chars)"
  }
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "AaKpakR_C1Hsgurdlm25k6o",
  "payload": null,
  "lid": "7700490584250620089"
}
```

**runs/inspect/20261025T063549_61594360734687**, step 2: signIn: 200, 3011 ms

Sent:

```json
{
  "query": {
    "ph": "C3",
    "qpl_active_flow_ids": "175125627,516759801"
  },
  "body": null
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "AbZBj6K3kh_6syLlZsuWs3I",
  "payload": null,
  "lid": "7700490671414194123"
}
```

<!-- facts:end -->

## What it does

Telemetry: the page's error and event logging, batched.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
