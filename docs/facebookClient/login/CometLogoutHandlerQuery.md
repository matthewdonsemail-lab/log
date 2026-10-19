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

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| connect | Auto-login: typing the email. | 1 | 200 | 529 ms | 3562 ms | — |
| connect | says: <name> / buttons: Back to Previous Page, Account settings | 1 | 200 | 680 ms | 2677 ms | — |
| connect | Page: checkpoint /checkpoint/<id>/ | 1 | 200 | 361 ms | 566 ms | — |

<!-- facts:end -->

## What it does

Fetches the logout link's hash (`viewer.logout_hash`) so the menu's Log out works. Fires on page load, including on checkpoint pages.

## What our machine does with it

Nothing. We never log out from the page; `log logout` clears the saved session in Twenty instead.

## What can go wrong

Harmless. Seen on the email step and on checkpoint pages, so it tells us a page loaded with a session, not that the session is healthy.
