# Answering the people who engaged with your posts

When one of your posts gets comments, the people who commented are the warmest people on X for you. There are two ways to follow up, both public replies:

- **Answer their comment** under your post, pointing at the follow-up (a newer post, a video, an article).
- **Reply to a fresh post of theirs** where you have a real take, so the conversation moves onto their timeline.

## Run it from a fresh context

Say: **"go on docs/useCases/twitter/engagementReplies.md for <post url>"** and, if there is one, the follow-up link. The agent then reads this page and [README.md](README.md) and runs the steps.

## The steps

| # | Step | Tool | Done when |
| --- | --- | --- | --- |
| 0 | Session check | `twitterSessionCheck` | `loggedIn` |
| 1 | Who commented on the post (not the account itself) | treg's X comments read | a list of commenters with their comment |
| 2 | Drop bots and hype accounts (few followers and no bio, or a one-word "🔥"), anyone already answered, and anyone not worth a reply | treg's X profile read, the account's past replies | the people worth answering |
| 3a | **Answer the comment:** one line that answers what they said, then the follow-up link | house style | passes `twitterQueueCheck` |
| 3b | **Or their own post:** read their recent posts and pick one from the last few days where you have a real take | treg's X posts read | one post per person and the line for it |
| 4 | Show the owner the table: who, what they said, the post being replied to, the line | wherever the owner reads | the owner says yes |
| 5 | Queue it with likes and send | README queue steps | `finished` |

Where the comment was a question (for example "what does the first message actually look like"), the answer is the reply. Unanswered questions are the best openers.

## What a line looks like

> someone asked: "what is that tool?"
>
> the thing i replaced in this one i ran all my followers through it for cents `<follow-up link>`

## What the runs taught

- **Write in house style from the start.** Copy written with full stops and commas is refused by `check`.
- **Vary the lines.** Spintax (`{a|b}`) is a quick way to draft variations, but expand it into plain lines before `twitterQueueBuild`.

## Not built yet

- Spintax isn't expanded by the queue.
- Likers and reposters aren't in the comments read. For them, see [engagerDms.md](engagerDms.md).
