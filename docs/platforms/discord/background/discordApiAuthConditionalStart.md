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
| Called from | `runs/inspect/20261113T231616_deepman2/script3.js:232 625075`, `runs/inspect/20261113T231616_deepman2/script3.js:124 559868`, `runs/inspect/20261113T231616_deepman2/script3.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_3d20419bfde4fad72718c51420bf8f91635ff1736a688c34805bffb28e4bce6c` |

Seen 5 time(s) in 5 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: goto /login | 1 | 200 | 432 ms | 5774 ms | — |
| inspect | step 1: goto /channels/@me | 2 | 200 | 176–299 ms | 5477–12301 ms | — |
| inspect | step 1: goto /login | 2 | 200 | 204–270 ms | 3231–5548 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261109T193816_deepman2**, step 1: goto /login: 200, 204 ms

Sent:

```json
null
```

Answered:

```json
{
  "challenge": "{\"publicKey\":{\"challenge\":\"981bWzPGQCQj6omn7Clthd0P8_mTQVVqPWLM_g8kJeQ\",\"timeout\":300000,\"rpId\":\"discord.com\",\"allowCredentials\":[],\"userVerification\":\"required\",\"extensions\":{\"uvm\":true}},\"mediation\":\"conditional\"}",
  "ticket": "(taken out)"
}
```

**runs/inspect/20261109T193411_deepman2**, step 1: goto /channels/@me: 200, 176 ms

Sent:

```json
null
```

Answered:

```json
{
  "challenge": "{\"publicKey\":{\"challenge\":\"Oz351MwxWTk4e8MU_VyBdo6hCB7hkG2t2hABLtGLQ-A\",\"timeout\":300000,\"rpId\":\"discord.com\",\"allowCredentials\":[],\"userVerification\":\"required\",\"extensions\":{\"uvm\":true}},\"mediation\":\"conditional\"}",
  "ticket": "(taken out)"
}
```

<!-- facts:end -->

## What it does

Starts the login page's conditional sign-in (passkey autofill): the server hands back a challenge the browser could answer with a saved passkey.

## What our machine does with it

Not used: matt signs in himself (matt, 2026-10-28), so our step only records it.

## What can go wrong

If it fails the page still shows the email and password form, so sign-in goes on the normal way.
