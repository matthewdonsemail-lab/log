# CometLogoutHandlerQuery

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | login |
| Kind | query |
| doc_id | `9812519355492122` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `viewer.logout_hash`, `viewer.actor` |
| Called from | `CometLogoutHandler.react` |
| rea | `ev_a71121d0640a1fd7bea827bdea508da067de6cbd9731907468d4d4d5a46427fa` |

Seen 14 time(s) in 14 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| connect | Auto-login: typing the email. | 2 | 200 | 353–529 ms | 3562–4436 ms | — |
| connect | says: (no text) / buttons: none | 1 | 200 | 497 ms | 5032 ms | — |
| inspect | step 2: wait 60s | 1 | 200 | 896 ms | 52087 ms | — |
| connect | Page: loginForm /marketplace/selling/ "…" | 1 | 200 | 446 ms | 2319 ms | — |
| inspect | step 1: goto /marketplace/ | 1 | 200 | 382 ms | 11375 ms | — |
| connect | says: <name> / buttons: Back to Previous Page, Account settings | 2 | 200 | 542–680 ms | 720–2677 ms | — |
| inspect | step 1: goto /marketplace/you/selling | 1 | 200 | 455 ms | 6678 ms | — |
| inspect | page has 56 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T110 | 1 | 200 | 316 ms | 2618 ms | — |
| inspect | step 1: goto /me | 1 | 200 | 353 ms | 12251 ms | — |
| inspect | POST 0 /ajax/qm/ (0 ms) | 1 | 200 | 556 ms | 3400 ms | — |
| profile | Opening the profile (facebook.com/me). | 1 | 200 | 565 ms | 10415 ms | — |
| connect | Page: checkpoint /checkpoint/<id>/ | 1 | 200 | 361 ms | 566 ms | — |

<!-- facts:end -->

## What it does

Fetches the logout link's hash (`viewer.logout_hash`) so the menu's Log out works. Fires on page load, including on checkpoint pages.

## What our machine does with it

Nothing. We never log out from the page; `log logout` clears the saved session in Twenty instead.

## What can go wrong

Harmless. Seen on the email step and on checkpoint pages, so it tells us a page loaded with a session, not that the session is healthy.
