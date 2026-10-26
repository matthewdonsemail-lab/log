# Reading the DM inbox: who is waiting on you

Read every DM conversation on the account and sort it into a pipeline: who is waiting on you and what they asked, who you're waiting on, and what to do next for each. It sends nothing and marks nothing read. Replies only go out after the owner says what to send.

## Run it from a fresh context

Say: **"go on docs/useCases/twitter/dmInbox.md"**. The agent then reads this page and [README.md](README.md) and runs the steps.

## The steps

| # | Step | Tool | Done when |
| --- | --- | --- | --- |
| 1 | Who is waiting on you: conversations where the last message isn't yours, message requests included | `twitterDms` { account, waiting: true, limit: "50" } | a list, newest first, with each conversation id |
| 2 | The latest conversations, whoever spoke last | `twitterDms` { account, limit: "10" } | the newest 10 |
| 3 | Read the ones that matter in full | `twitterDms` { account, conversation: "<id>" } | what they asked, and when |
| 4 | Who they are: bio and followers, and whether they're already in your CRM | treg's X profile read, Twenty | one line per person |
| 5 | Sort it into a table: **reply now** (a real opportunity waiting on you), **waiting on them** (worth one nudge), **no action** (pitches, spam). Each with a suggested move | wherever the owner reads | the owner picks what to answer |
| 6 | Send what the owner approves, one at a time, dry run first | `twitterDm` then `twitterDmLive` { userId, text, approvedBy, confirmLive: true } | X's answer is `sent` |

One `twitterDms` call reads the inbox and the message requests in a few seconds.

## What to know

- `twitterDms` reads the inbox, the message requests and X's encrypted Chat. X Chat opens with the account's X Chat PIN, saved once in a masked terminal prompt (`log twitter chat pin --account <account>`); without it X Chat threads show who and when, not what.
- A person can have both an old DM thread and an X Chat thread. Read them together with `twitterDms` { account, with: "<handle>" } before answering, so nothing they said in X Chat is missed.
- To find something said in any conversation, search instead of reading every thread: `search` { query, with, after } after `searchIndex`.
- A DM send counts as a write against the account's 40 a day.

## Not built yet

- Writing the conversations into Twenty, so each person's thread sits on their record.
