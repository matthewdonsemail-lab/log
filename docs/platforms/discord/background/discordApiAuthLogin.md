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
| Called from | `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1.js:208 app_store_parental_revocation`, `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1036.js:1 parse`, `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1221.js:2 anonymous`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1245.js:2 anonymous` |
| rea | `ev_9d4607252f6e6d7bb80eebe8778b219811a8790dd69d5d1e99c5d4a4778c41ec` |

Seen 4 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: click e40 | 1 | 200 | 946 ms | 862 ms | — |
| inspect | step 2: snapshot | 3 | 400, 200 | 575–892 ms | 36683–43074 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder**, step 2: snapshot: 400, 575 ms

Sent:

```json
{
  "login": "matthewdonsemail@gmail.com",
  "undelete": false,
  "login_source": null,
  "gift_code_sku_id": null
}
```

Answered:

```json
{
  "message": "Invalid Form Body",
  "code": 50035,
  "errors": {
    "login": {
      "_errors": [
        {
          "code": "INVALID_LOGIN",
          "message": "Login or password is invalid."
        }
      ]
    }
  }
}
```

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 5: click e40: 200, 946 ms

Sent:

```json
{
  "login": "matthewdonsemail@gmail.com",
  "undelete": false,
  "login_source": null,
  "gift_code_sku_id": null
}
```

Answered:

```json
{
  "user_id": "1434443116663930960",
  "token": "(taken out)",
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
