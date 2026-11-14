# discordApiAuthLogin

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/auth/login` |
| Sends | `login`, `undelete`, `login_source`, `gift_code_sku_id` |
| Reads | `captcha_key`, `captcha_sitekey`, `captcha_service`, `captcha_session_id`, `captcha_rqdata`, `captcha_rqtoken`, `message`, `code`, `errors.login` |
| Called from | `runs/inspect/20261113T231616_deepman2/script3.js:232 625075`, `runs/inspect/20261113T231616_deepman2/script3.js:124 559868`, `runs/inspect/20261113T231616_deepman2/script3.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_f4269990b7ccccd40fc015033270f73cf4ebc6efa44479ec94268c55e592c909` |

Seen 11 time(s) in 5 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: click e40 | 1 | 200 | 946 ms | 862 ms | — |
| inspect | step 2: snapshot | 3 | 400, 200 | 575–892 ms | 36683–43074 ms | — |
| inspect | step 1: goto /login | 5 | 400, 200 | 607–1295 ms | 26209–1038889 ms | — |
| inspect | signIn: password typed; submitting with Enter | 1 | 400 | 302 ms | 7 ms | — |
| inspect | step 6: wait 45s | 1 | 400 | 1231 ms | 6118 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T231616_deepman2**, signIn: password typed; submitting with Enter: 400, 302 ms

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
  "captcha_key": [
    "captcha-required"
  ],
  "captcha_sitekey": "a9b5fb07-92ff-493f-86fe-352a2803b3df",
  "captcha_service": "hcaptcha",
  "captcha_session_id": "4470ad4c-0d24-45e3-a0c9-7a688a2a32fe",
  "captcha_rqdata": "wKwDrumyQdGu7kTi8t9/HKy5upWMuWHEVmT/8KYgM9z1F2RBZdh+KvEXZC4gdNwMbHNLe6ULlM2dJUQ1EnEe9KkaQBcUuAZebCFkDOjBE9XcqBsQxKnFz4BSDZVyiNOJ6mALj8GT/vdHHtb8rTfgriUMN0yatFsBV3lywaX78wW93K0STipjqLsvmjKyoEOT",
  "captcha_rqtoken": "(taken out)"
}
```

**runs/inspect/20261113T231616_deepman2**, step 6: wait 45s: 400, 1231 ms

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

<!-- facts:end -->

## What it does

The sign-in itself: email and password sent, the answer carries the user's token (or asks for a captcha, MFA or a new-location check).

## What our machine does with it

The step that pressed Log In is decided on this answer (rule 73): 200 with a token means signed in, and the page then goes to `/channels/@me`. The token is never printed (rule 21).

## What can go wrong

400 with `captcha_key` is a captcha, `mfa: true` is two-step, `ACCOUNT_LOGIN_VERIFICATION_EMAIL` a new-location email to confirm. Each is said to matt, who does the sign-in on Discord.
