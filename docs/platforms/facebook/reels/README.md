# Facebook Reels: the requests

The `reels` domain of Facebook's client (rule 48, rule 49): the requests a
Reels session makes, one doc each, built by `log capture --docs` from the
runs' recordings, with rea's reading of each request's code.

Recorded by the warm-up's reel activity: `log warmup facebook reel --account <a>`
(the account's browser primed with it, each step checked, the outline in the
run's `warmup_facebook_reel.json`). The first recording: run
20261020T050610 on Bethlehem.
The request names it records set the domain's pattern
(`src/rea/facebookClient/helpers/domainOf.ts`), which is a first guess
(`Reel` in the name) until then.
