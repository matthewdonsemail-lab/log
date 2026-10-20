# loginDeviceBasedRegularLogin

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | login |
| Kind | endpoint |
| doc_id | — |
| Path | `/login/device-based/regular/login/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_9928887669abb1013b2c1f5d55f3da899ff8e67afc76c7a403f7081cfcb3b5d7` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| connect | Auto-login: submitting (Enter). | 1 | 302 | 6885 ms | 104 ms | — |

<!-- facts:end -->

## What it does

The sign-in itself: the login form's POST to `/login/device-based/regular/login/`. It fires 93-120 ms after we press Enter, takes 2.0-2.6 s, and answers 302 (a redirect).

## What our machine does with it

The connect machine's auto-login submits with Enter (`python/login/autoLogin.py`), then reads the next page (`loggedIn`, `checkpoint`, `twoStepCode`, `wrongPassword`...). The redirect target is Facebook's decision; our page read follows it.

## What can go wrong

Where the 302 points is the cause line for every sign-in outcome: `/checkpoint/` means Facebook stopped the account at this exact request. A 200 instead of a 302 means the form came back (wrong password or a captcha on the form). No sighting after Enter means the submit never left the page.
