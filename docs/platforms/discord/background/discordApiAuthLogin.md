# discordApiAuthLogin

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/auth/login` |
| Sends | `login`, `undelete`, `login_source`, `gift_code_sku_id` |
| Reads | `message`, `code`, `errors.login`, `user_id`, `token`, `user_settings.locale`, `user_settings.theme` |
| Called from | `runs/inspect/20261113T044840_<name:1>/script0.js:232 625075`, `runs/inspect/20261113T044840_<name:1>/script0.js:124 559868`, `runs/inspect/20261113T044840_<name:1>/script0.js:124 961943`, `runs/inspect/20261113T044840_<name:1>/script1294.js:1 634654` |
| rea | `ev_b899f2654496ca2e1d268edecf85c33fe073f4618a1509e9ef65d918f68fc146` |

Seen 7 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: click e40 | 1 | 200 | 946 ms | 862 ms | — |
| inspect | step 2: snapshot | 3 | 400, 200 | 575–892 ms | 36683–43074 ms | — |
| inspect | step 1: goto /login | 3 | 400, 200 | 607–830 ms | 26209–29525 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T044840_<name:1>**, step 1: goto /login: 400, 607 ms

Sent:

```json
{
  "login": "<username:1>",
  "undelete": false,
  "login_source": null,
  "gift_code_sku_id": null
}
```

Answered:

```json
{
  "message": "<messageText>",
  "code": 50035,
  "errors": {
    "login": {
      "_errors": [
        {
          "code": "INVALID_LOGIN",
          "message": "<messageText>"
        }
      ]
    }
  }
}
```

**runs/inspect/20261030T222341_<name:1>**, step 2: snapshot: 400, 575 ms

Sent:

```json
{
  "login": "<username:1>",
  "undelete": false,
  "login_source": null,
  "gift_code_sku_id": null
}
```

Answered:

```json
{
  "message": "<messageText>",
  "code": 50035,
  "errors": {
    "login": {
      "_errors": [
        {
          "code": "INVALID_LOGIN",
          "message": "<messageText>"
        }
      ]
    }
  }
}
```

**runs/inspect/20261028T062914_<name:1>**, step 5: click e40: 200, 946 ms

Sent:

```json
{
  "login": "<username:1>",
  "undelete": false,
  "login_source": null,
  "gift_code_sku_id": null
}
```

Answered:

```json
{
  "user_id": "<userId:1>",
  "token": "<token>",
  "user_settings": {
    "locale": "en-US",
    "theme": "light"
  }
}
```

<!-- facts:end -->

## What it does

The sign-in itself: email and password sent, the answer carries the user's token (or asks for a captcha, MFA or a new-location check).

## What our machine does with it

The step that pressed Log In is decided on this answer (rule 73): 200 with a token means signed in, and the page then goes to `/channels/@me`. The token is never printed (rule 21).

## What can go wrong

400 with `captcha_key` is a captcha, `mfa: true` is two-step, `ACCOUNT_LOGIN_VERIFICATION_EMAIL` a new-location email to confirm. Each is said to matt, who does the sign-in on Discord.
