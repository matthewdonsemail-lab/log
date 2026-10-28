# discordApiAuthLocationMetadata

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/auth/location-metadata` |
| Sends | — |
| Reads | `consent_required`, `country_code`, `minimum_age`, `promotional_email_opt_in.required`, `promotional_email_opt_in.pre_checked` |
| Called from | `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:160 app_store_parental_revocation`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script892.js:1 parse`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script1090.js:2 anonymous`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:158 2242` |
| rea | `ev_e208e1d63df9bbb04398aa88d2771a6062f0f3aca2a2cbbaaf2634aa520f45d6` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: goto /login | 1 | 200 | 321 ms | 5482 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 3: goto /login: 200, 321 ms

Sent:

```json
null
```

Answered:

```json
{
  "consent_required": false,
  "country_code": "VN",
  "minimum_age": null,
  "promotional_email_opt_in": {
    "required": true,
    "pre_checked": false
  }
}
```

<!-- facts:end -->

## What it does

Tells the login page where the request comes from (country, consent needed), so it shows the right consent and age text.

## What our machine does with it

Read only as a recording: the account has no proxy (like Reddit), so this is this machine's own exit.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
