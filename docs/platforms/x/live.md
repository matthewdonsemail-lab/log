---
title: "X: how the client stays live, and how it reaches the agent"
---

# X: how the client stays live, and how it reaches the agent

How X's own signed-in web client keeps its counts and notifications current. It was read with rea from X's own scripts, saved through the account's one session (`log twitter session webClient`, `~/.logCli/twitter/<account>/webClient/<time>`). The doc also covers how log does the same thing and puts it in front of the agent (rule 115).

## What X's client does

The notification refresher lives in `bundle.Notifications` (module 726194). It is built when a signed-in page loads.

| Trigger | Least gap | What it starts |
| --- | --- | --- |
| `poll` | none (the timer is 30 s) | the badge counts, the DM updates, and notifications if that page is open |
| `focus` (the tab comes back) | 10 s | the same as `poll` |
| `push` (the service worker gets a push) | 5 s | the badge counts, plus the DM updates for a `/messages` push or notifications for anything else |
| `view` | 60 s | the badge counts |

- The 30 s timer (`w = 3e4`) runs only while the tab is in front, and stops when it goes to the background.
- When push is subscribed, a poll is skipped if the last refresh was under 120 s ago (`S = 12e4`). In practice the client then refreshes every 120 s.
- No two refreshes run within 1 s of each other.
- The badge read is the GraphQL query `ViewerBadgeCounts`, sent with the header `x-twitter-polling: true` (module 845923, `fetchBadgeCount`).
  - Its answer is `viewer_v2.user_results.result.badge_counts`: `ntab_unread_count`, `dm_unread_count`, `xchat_unread_count`, `total_unread_count`.
  - With more than one account signed in, every other account is read the same way, with `x-web-auth-multi-user-id`.
- Notifications are read again only when they are stale. The notifications timeline's `staleIntervalMs` is 5 s.
- X Chat arrives over its own socket (`wss://chat-ws.x.com`). Nothing polls it.

## What log does

- **The push:** the account's X Chat watch (`log twitter chat watch --inbox`, started by the inbox hook) is the socket. That makes the watch our push.
- **The badge poll** (`badge_poll`, `python/twitterApi/engine.py`):
  - Runs inside that watch, through the same one session.
  - Every 120 s it reads `ViewerBadgeCounts` with `x-twitter-polling: true`, which is X's rate while push is subscribed.
  - Each read is counted by the governor.
- **New notifications:** when `ntab_unread_count` rises, the poll reads one page of notifications and keeps only the rows it hadn't seen.
- **The live file:** every changed count and every new like, retweet, reply, quote, mention or follow is one line in `~/.logCli/twitter/<account>/live.jsonl`.
- **A refusal:** a 429, or the governor stopping the read, ends the poll. It is written to the file, and nothing resumes until matt says so (rule 94).
- **The context hook** (`scripts/hooks/xLive.ts`): on SessionStart, on every prompt and after every log tool or shell call, it puts a `>>> X LIVE` block in front of the agent. The block holds:
  - each account's counts;
  - what is new since this Claude session last looked (`src/twitter/live/feed`).
- **Each Claude session keeps its own offsets** (`src/agentHooks/sessionOffsets`, keyed by the hook's `session_id`), so two sessions open at once both see every event once.
  - A new session starts with the current counts, not the history.
  - The queue hook (rule 114) reads per session the same way.
- **It is said loudly.** New activity comes first in the block (`>>> X LIVE, NEW ACTIVITY`), and the agent tells matt at once, before anything else. A count that changed with no new activity adds nothing to the block.
- **It wakes the agent while idle.** A hook only runs on a prompt or a tool call, so on SessionStart the block tells the agent to start a Monitor on every account's `live.jsonl` (`LIVE_MONITOR`) for the whole session. Each like, retweet, reply, quote, mention or follow then wakes the agent the moment it lands.
