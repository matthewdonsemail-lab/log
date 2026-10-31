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

Who wrote last is already in context at the start of a session: the SessionStart hook reads it from the account's local inbox store, with nothing fetched. `twitterDms` keeps that store up to date the way X's own app does: the first read takes the whole inbox once (about 20 s), and every read after asks X only for what is newer (about 5 s), decrypting only what is new and adding it to the conversation search. `full: true` reads everything again.

## What to know

- `twitterDms` reads the inbox, the message requests and X's encrypted Chat. X Chat opens with the account's X Chat PIN, saved once in a masked terminal prompt (`log twitter chat pin --account <account>`); without it X Chat threads show who and when, not what.
- A person can have both an old DM thread and an X Chat thread. Read them together with `twitterDms` { account, with: "<handle>" } before answering, so nothing they said in X Chat is missed.
- Every X Chat message opens with the saved PIN: a reaction shows as `(reacted 🔥)`, an edit as `(edited) …`, a photo as `(image: name.jpg)`, a shared post or link as its URL, and a read marker is hidden, so "they read it and haven't answered" never looks like a message waiting on you. A message still showing "could not open" is reopened the next time its chat is read, and each sync reopens a few on its own. Group chats are read with `twitterDms` { account, conversation: "g…" }.
- **Opened with no reply is a follow-up.** When their last event is a reaction to the owner's message (`(reacted ❤️)`), or their read receipt is past his last message, they opened it and didn't type back. It isn't a reply waiting on him: `twitterDms` { waiting: true, limit: "200" } lists it apart ("they opened it, no reply yet: follow up"), and the follow-up is the network-maxing kind (networkMaxing.md, "Everyone who opened it"). X Chat read receipts come through as events of an unknown type, sent by the reader right after the other side's message; they're never shown as messages.
- Before answering, check who actually wrote last: a thread where the owner's message is the newest real one isn't waiting on him, even if the list put it there.
- X has its own daily limit on tweets and messages (code 344; the governor allows 240 writes a day, likes, reposts and follows included, and X can still stop it before that), and going past the governor doesn't get past it. Spend the day's writes on people who answered first. After a 344 nothing more goes out until the owner says so.
- To find something said in any conversation, search instead of reading every thread: `search` { query, with, after } after `searchIndex`.
- A DM send counts as a write against the account's 240 a day.

## Not built yet

- Writing the conversations into Twenty, so each person's thread sits on their record.
