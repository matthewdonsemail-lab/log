# Reading the DM inbox: who is waiting on matt

Read every DM conversation on @matthewsoldit and sort it into a pipeline: who is waiting on matt and what they asked, who matt is waiting on, and what to do next for each. It sends nothing and marks nothing read. Replies only go out after matt says what to send.

## Run it from a fresh context

Say: **"go on docs/useCases/twitter/dmInbox.md"**. The agent then reads this page and [README.md](README.md) and runs the steps.

## The steps

| # | Step | Tool | Done when |
| --- | --- | --- | --- |
| 1 | Who is waiting on matt: conversations where the last message isn't his, requests included | `twitterDms` { account: "matthewsoldit", waiting: true, limit: "50" } | a list, newest first, with each conversation id |
| 2 | Read the ones that matter in full | `twitterDms` { account, conversation: "<id>" } | what they asked, and when |
| 3 | Who they are: bio and followers, and if they're already in Twenty (sponsor list, influencers, applicants) | treg `anyapi.x.user.profile`, Twenty | one line per person |
| 4 | Sort it into a table for matt: **reply now** (a real opportunity waiting on him), **waiting on them** (worth one nudge), **no action** (pitches, spam). Each with a suggested move | buzz message, or `RESEARCH/X_DM_PIPELINE_<date>.md` | matt picks what to answer |
| 5 | Send what matt approves, one at a time, dry run first | `twitterDm` then `twitterDmLive` { userId, text, approvedBy: "matt", confirmLive: true } | X's answer is `sent` |

## Real runs

**2026-10-13, the whole inbox.** 44 conversations and 389 messages, 2025-11-23 to 2026-10-11, read in full with twikit before log-cli had a DM read (`.scratch/gg-engagers/all_threads.py`). Sorted into reply now (8, led by @thesmitpatel asking about consulting), waiting on them, and no action. `RESEARCH/X_DM_PIPELINE_2026-10-13.md`.

**2026-10-26, with `twitterDms --waiting`.** One call, about 14 seconds: 14 conversations waiting on matt, 6 of them message requests. The job-related ones were @zachtheoldham (wants to interview matt for a GTME role), @thesmitpatel (consulting), @JashShah1028160 and @ThisathKR. None were replies to the recruiting round.

## What to know

- `twitterDms` reads the legacy inbox and the message requests. X's encrypted Chat (XChat) can't be read, so an empty result for a friend means no old-style thread, not that they never talked.
- A DM send counts as a write against the account's 40 a day.

## Not built yet

- Writing the conversations into Twenty, so each person's thread sits on their record.
