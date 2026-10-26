# Checking who really follows matt

Before a slide, a page or a message says someone follows matt (or that matt follows them), check it live on X. Engaging with matt isn't following him. This page reads it on matt's own session and sends nothing.

## Run it from a fresh context

Say: **"go on docs/useCases/twitter/followers.md for <handles>"**, or "for everyone named on <page>". The agent then reads this page and [README.md](README.md) and runs the steps.

## The steps

| # | Step | Tool | Done when |
| --- | --- | --- | --- |
| 0 | Session check | `twitterSessionCheck` | `loggedIn` |
| 1 | For each handle: do they follow matt, does matt follow them | `twitterFollows` { account: "matthewsoldit", handles: "a,b,c" } | one answer per handle, from X |
| 2 | Take anyone who doesn't follow matt off the "followers" line, or reword the line | the page or copy | every name on it is true today |

Handles come from treg research or from matt, never guessed (rule 53). The read is 1.5 s per handle, so a long list takes a minute.

## Real runs

**2026-10-15, the ego map.** The "my circle" rings on screen 14 named people who had only engaged with matt. Two of them, @omarmsimon and @abbyfinan, didn't follow him, and matt caught it. Since then every named follower gets this check before it goes on screen.

**2026-10-19, new followers.** 52 new followers were pulled with treg and scored. 17 of them landed in the buy, collaborate, sponsor or affiliate band. Then the leaders those 17 engage with were mapped from their posts (cold email leaders like @coldemailchris and @NickAbraham12, agent builders, AI job networks). `RESEARCH/NEW_FOLLOWERS_LEADERS_2026-10-19.md`.

The full list of matt's followers was read on his session with twikit (`.scratch/gg-engagers/real_followers.py`, written to `real_followers.json`). That list is the source for "my followers", not who engaged.

## Not built yet

- A `log twitter followers` read that pulls the full list on the account's session. Today it's treg, or the script above.
