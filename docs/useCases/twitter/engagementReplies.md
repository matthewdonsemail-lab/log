# Answering the people who engaged with our posts

When one of matt's posts gets comments, the people who commented are the warmest people on X for us. There are two ways to follow up, both public replies from @matthewsoldit:

- **Answer their comment** under matt's post, pointing at the follow-up (a newer post, the VSL, the article).
- **Reply to a fresh post of theirs** where matt has a real take, so the conversation moves onto their timeline.

## Run it from a fresh context

Say: **"go on docs/useCases/twitter/engagementReplies.md for <matt's post url>"** and, if there is one, the follow-up link. The agent then reads this page and [README.md](README.md) and runs the steps.

## The steps

| # | Step | Tool | Done when |
| --- | --- | --- | --- |
| 0 | Session check | `twitterSessionCheck` | `loggedIn` |
| 1 | Who commented on matt's post (not matt himself) | treg `anyapi.x.post.comments` { url } ($0.0005) | a list of commenters with their comment |
| 2 | Drop bots and hype accounts (under 15 followers and no bio, or a one-word "🔥"), anyone matt already answered, and anyone not worth a reply | treg `anyapi.x.user.profile`, matt's past replies | the people worth answering |
| 3a | **Answer the comment:** one line that answers what they said, then the follow-up link | house style | passes `twitterQueueCheck` |
| 3b | **Or their own post:** read their recent posts and pick one from the last few days where matt has a real take | treg `anyapi.x.user.posts` ($0.0005) | one post per person and the line for it |
| 4 | Post the table to matt: who, what they said, the post being replied to, the line | buzz | matt says yes |
| 5 | Queue it with likes and send | README queue steps | `finished` |

Where the comment was a question (for example "what does the first message actually look like"), the answer is the reply. Those unanswered questions are the best openers.

## Real runs

**2026-10-13, the go getters VSL** (`2109844147343687795`). 12 commenters, mostly on the treg posts. Each got its own line answering what they said, pointing at the VSL. Copy was written as spintax (`{a|b}`) so each line can vary:

> @iWatch_AAPL: "what is clay?"
>
> the thing i {skipped|replaced} {here|in this one}. {indexed|ran} all my followers through treg {for cents|for under 50 cents}: https://x.com/matthewsoldit/status/2109844147343687795

House style note: that copy has full stops and commas, which `check` now refuses. Write lines in house style from the start.

**2026-10-09, the log launch posts** (`2102520314483941446`, `2102674211424854426`). Commenters' own recent posts were read and a reply drafted on each:

> manoj_surya_ is building a brand monitoring tool and wants to talk to users of Brandwatch and Octolens.
>
> i built log by listeningkit as a free open source octolens alternative so happy to swap notes on what the paid ones miss

Files: `RESEARCH/LAUNCH_SPINTAX_REPLIES_2026-10-13.md`, `RESEARCH/X_ENGAGEMENT_REPLIES_ROUND1_2026-10-09.md`, `RESEARCH/X_AMPLIFICATION_MATTHEWSOLDIT.md` (which posts got the views), all in `~/.buzz`.

## Not built yet

- Spintax isn't expanded by the queue. Expand each line into plain variations before `twitterQueueBuild`.
- Likers and reposters aren't in treg's comments call. For them, see [engagerDms.md](engagerDms.md).
