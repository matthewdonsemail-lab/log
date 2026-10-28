# discordApiAuthConditionalStart

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/auth/conditional/start` |
| Sends | — |
| Reads | `challenge`, `ticket` |
| Called from | `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:160 app_store_parental_revocation`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script892.js:1 parse`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script1090.js:2 anonymous`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:158 2242` |
| rea | `ev_33e2568e1e78723051f88f7f79de321247cbda8fd0bbde8d27f56f9d7abb4f98` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: goto /login | 1 | 200 | 432 ms | 5774 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 3: goto /login: 200, 432 ms

Sent:

```json
null
```

Answered:

```json
{
  "challenge": "{\"publicKey\":{\"challenge\":\"uAUvFkCei5fkBkGVVT5WFupqaUa3DLocQ8shWXI7sIA\",\"timeout\":300000,\"rpId\":\"discord.com\",\"allowCredentials\":[],\"userVerification\":\"required\",\"extensions\":{\"uvm\":true}},\"mediation\":\"conditional\"}",
  "ticket": "8aecfcc2-4ff4-45cc-bedb-24245f34b530"
}
```

<!-- facts:end -->

## What it does

Starts the login page's conditional sign-in (passkey autofill): the server hands back a challenge the browser could answer with a saved passkey.

## What our machine does with it

Not used: matt signs in himself (matt, 2026-10-28), so our step only records it.

## What can go wrong

If it fails the page still shows the email and password form, so sign-in goes on the normal way.
