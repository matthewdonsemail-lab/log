# discordApiAuthLocationMetadata

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/auth/location-metadata` |
| Sends | — |
| Reads | `consent_required`, `country_code`, `minimum_age`, `promotional_email_opt_in.required`, `promotional_email_opt_in.pre_checked` |
| Called from | `runs/inspect/20261114T184328_deepman2/script0.js:232 625075`, `runs/inspect/20261114T184328_deepman2/script0.js:124 559868`, `runs/inspect/20261114T184328_deepman2/script0.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_f6daff8038b4f477b27b852e31fc1f2f76f7dd725b1883891e74b824ed6f0ac3` |

Seen 12 time(s) in 12 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: goto /login | 1 | 200 | 321 ms | 5482 ms | — |
| inspect | step 1: goto /login | 9 | 200 | 147–1094 ms | 1050–7476 ms | — |
| inspect | step 1: goto /channels/@me | 2 | 200 | 212–688 ms | 1973–10902 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261114T184328_deepman2**, step 1: goto /login: 200, 157 ms

Sent:

```json
null
```

Answered:

```json
{
  "consent_required": false,
  "country_code": "CA",
  "minimum_age": 13,
  "promotional_email_opt_in": {
    "required": true,
    "pre_checked": false
  }
}
```

**runs/inspect/20261109T193411_deepman2**, step 1: goto /channels/@me: 200, 212 ms

Sent:

```json
null
```

Answered:

```json
{
  "consent_required": false,
  "country_code": "CA",
  "minimum_age": 13,
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
