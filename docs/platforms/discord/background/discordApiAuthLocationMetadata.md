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
| Called from | `runs/inspect/20261113T141543_<name:1>/script1.js:232 625075`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 559868`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 961943`, `runs/inspect/20261113T141543_<name:1>/script1294.js:1 634654` |
| rea | `ev_a9fa69c7432fa1fcc41058ba491790444cfcec72f4c96150b3d2566a4e5def67` |

Seen 5 time(s) in 5 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: goto /login | 1 | 200 | 321 ms | 5482 ms | — |
| inspect | step 1: goto /login | 3 | 200 | 385–1094 ms | 4449–7476 ms | — |
| inspect | step 1: goto /channels/@me | 1 | 200 | 688 ms | 10902 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T141543_<name:1>**, step 1: goto /login: 200, 1094 ms

Sent:

```json
null
```

Answered:

```json
{
  "consent_required": false,
  "country_code": "VN",
  "minimum_age": 15,
  "promotional_email_opt_in": {
    "required": true,
    "pre_checked": false
  }
}
```

**runs/inspect/20261030T222341_<name:1>**, step 1: goto /channels/@me: 200, 688 ms

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

**runs/inspect/20261028T062914_<name:1>**, step 3: goto /login: 200, 321 ms

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
