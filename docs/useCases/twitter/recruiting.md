# Recruiting on X with a reply queue

Find people who just posted that they want work, or who already do the job. Reply to each one publicly from @matthewsoldit with one line in their own language, about their own post, ending with the job link. matt approves the list, then the queue sends the replies slowly with likes mixed in. Applicants then come in through the job page.

Recruiting is public replies only. DMs are a different job: [dmInbox.md](dmInbox.md) and [engagerDms.md](engagerDms.md).

## Run it from a fresh context

Say: **"go on docs/useCases/twitter/recruiting.md for the <role> role"**. The agent then:

1. Reads this page, then [README.md](README.md) for the queue and the rules on every X page.
2. Reads the role in the table below, and the standing orders it names.
3. Runs the steps below to the end. It keeps searching until it has qualified people, posts the table, and sends once matt says yes. It never stops at "nobody qualified" (matt, 2026-10-24).

| Role | Job link | Where the people are | Languages | Standing orders |
| --- | --- | --- | --- | --- |
| Business Development Operations Specialist ("Jarvis") | https://listeningkit.com/career/business-development-operations-specialist | Philippines, India, Africa, Latin America | `lang:tl`, `lang:hi`, `lang:es` | `GUIDES/JARVIS_RECRUITER_STANDING_ORDERS.md` |
| Cold caller / appointment setter (calls US businesses in English) | https://listeningkit.com/career/cold-caller-appointment-setter | Latin America | `lang:es` | this page, and `REPOS/recruitLoop/terms.json` for the terms |

A new role gets a row here: its job link, where to hire, the languages.

## What "qualified" means

All five, checked on every person before they go in the table:

1. **Language and freshness:** the post really is in the role's language (X sometimes tags English, pidgin or Swahili as `tl`), and it was posted in the last 3 days.
2. **Location:** the profile's location is in the role's regions. No location means no contact: hold them and list them separately. Never anyone in the US, Canada, UK, Europe or Australia.
3. **A real person:** not a news, brand, job board, government or meme account.
4. **Work signal:** they say they're looking for work or freelancing, or the bio or post shows the skill. For BDO that's VA, sales, admin, ops, CRM, data, automation or AI tools. For the cold caller it's call center, telemarketing, sales, setter or closer work they did themselves.
5. **Never contacted:** not in any `OUTBOX/RECRUITMENT_SEND_LOG_*.tsv`, not replied to by matt before (see the README's one-reply rule), not afahmy_dev.

## The steps

| # | Step | Tool | Done when |
| --- | --- | --- | --- |
| 0 | Is the account signed in | `twitterSessionCheck` { account: "matthewsoldit" } | `loggedIn` |
| 1 | Search: the role's language plus one work word per query, last 3 days, `-filter:retweets -filter:replies` | treg `anyapi.x.search.posts` (about $0.00075 a call) | a pool of authors, minus everyone already contacted |
| 2 | Read every profile | treg `anyapi.x.user.profile` | location, bio and followers for each one |
| 3 | Qualify them with the five checks | by hand, or SubQ in recruitLoop | a keep list, plus a "no location" hold list |
| 4 | Write one line per person, in their language, about their post, ending with the link | matt's voice, house style | every line passes `twitterQueueCheck` |
| 5 | Post the table in #agency-recruitment-handoff: handle, location, why, post url, the line | `buzz messages send` | matt says yes |
| 6 | Queue it: build, set each item's text, check, approve, plan with likes, dry run, live run | the README's queue steps | the run is `finished` |
| 7 | Log and report: every reply url, or X's event | `OUTBOX/RECRUITMENT_SEND_LOG_<date>.tsv`, a buzz message tagging matt | all rows say sent, skipped or blocked |
| 8 | Check applicants | Twenty `agencyCareerApplications` | new applicants reported |

### Search terms that worked

A language-only search (`lang:es` alone) brings back noise: TV, football and greetings. Each query needs one work word.

- **es:** busco trabajo, necesito trabajo, busco chamba, trabajo remoto, ventas, vendedor, call center, telemarketing, cold calling, setter, closer, high ticket, bilingüe, agente outbound, cobranza, teleperformance, foundever, konecta, atento, sitel, alorica, taskus
- **tl:** naghahanap ng trabaho, virtual assistant, VA, onlinejobs, freelancer
- **hi:** नौकरी चाहिए, job chahiye, virtual assistant, CRM, data entry
- **any:** CRM, lead gen, n8n, Make, GoHighLevel, Airtable

### Lines that went out

> nakita ko na naghahanap ka ng work naghi-hire kami ng remote business development operations specialist apply ka dito https://listeningkit.com/career/business-development-operations-specialist

> vi tu post y por si te interesa buscamos cold callers remotos que llamen en inglés a negocios de ee uu para agendar citas 👉 https://listeningkit.com/career/cold-caller-appointment-setter

## Real runs

| Date | Role | Searched | Qualified | Sent | Notes |
| --- | --- | --- | --- | --- | --- |
| 2026-10-09 | cold caller, Jarvis | `lang:es` keyword search, replies under the model tweet | 3 cold caller, 5 Jarvis | 8 | first runs. The 5 Jarvis replies went to India/Nigeria and unknown-location accounts, and Americans were messaged. Checking location before every send became a rule |
| 2026-10-24 | Jarvis (first try) | 20 posts per language, no work word | 0 of 21 | 0 | every post came from one minute (03:10). A random sample of the language, not candidates. Never search without a work word |
| 2026-10-24 | Jarvis | 60 queries, 572 authors, about $0.17 | 9, plus 6 held | 8 | one had replies locked |
| 2026-10-24 | cold caller | 102 queries, 622 people | 6, plus 4 held (no location) | 6 | the hand loop lost one reply to "x created no tweet". The rest went through the queue with likes, and the queue rule was born |
| 2026-10-24 onward | cold caller, unattended | recruitLoop, every 6 h | SubQ, at most 15 a run | 32 sent, 1 blocked (the 18:07 run) | see below |

Notes for each run: `RESEARCH/JARVIS_QUALIFIED_SWEEP_2026-10-24.md`, `RESEARCH/COLD_CALLER_LATAM_SWEEP_2026-10-24.md`, `RESEARCH/X_HIRING_CANDIDATES_ROUND2_2026-10-09.md`. Sends: `OUTBOX/RECRUITMENT_SEND_LOG_2026-10-24.tsv`. All paths are in the buzz workspace (`~/.buzz`).

## The unattended loop (recruitLoop)

`~/.buzz/REPOS/recruitLoop/coldCaller.ts` runs the cold caller steps with nobody watching. The Windows task `ListeningKit Cold Caller Loop` starts it every 6 hours.

1. treg search on the 102 terms in `terms.json`, posts from the last 2 days. Anyone in `state/seen.json` or a send log is skipped.
2. treg profile reads.
3. SubQ scores fit ≥ 0.7, latam ≥ 0.6 and person ≥ 0.7. At most 15 a run.
4. Claude (haiku) writes one Spanish line per person about their own post, ending with the link.
5. The queue: build, set each text, check, approve as matt (his standing yes for this loop), plan with likes, run live. Alerts go to matt.

Each run's files are in `state/runs/<timestamp>/` (candidates, decisions, targets, queue). Read a run's result with `twitterQueueStatus` { queue: "<run>/queue.json" }. The loop still calls twitter-controller's `sequence.py` and `random_run.py`. Moving it to `log twitter queue` is the next change. The queue file is the same, so its queues already load in log-cli.

- Dry run (no queue, no send): `bun ~/.buzz/REPOS/recruitLoop/coldCaller.ts --dry`

## Not built yet

- Knowing who answered a recruiting reply. For now applicants show up in Twenty `agencyCareerApplications`.
- recruitLoop writes its sends to the log as `queued` and never updates them. Read the real result from the run's queue with `twitterQueueStatus`.

Sources: `GUIDES/JARVIS_RECRUITER_STANDING_ORDERS.md`, `GUIDES/JARVIS_ROLE_RECRUITING.md`, `GUIDES/X_OUTREACH_TREG_TO_TWITTER_CONTROLLER.md`, the #agency-recruitment-handoff thread of 2026-10-24, and `REPOS/recruitLoop/README.md` (all in `~/.buzz`).
