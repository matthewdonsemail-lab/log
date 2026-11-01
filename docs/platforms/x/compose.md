---
title: "X: what a reply, quote or post sends"
---

# X: what a reply, quote or post sends

What X's own signed-in web client does when someone replies, quotes or posts, read with rea from X's own scripts, beside what log's engine sends. The engine is changed to match X's client, never the other way round (rule 113).

## How it is read

1. `log twitter session webClient --account <a>` (MCP `twitterSessionWebClient`) loads x.com/home through the account's one X session, the same page twikit loads to sign its calls, and saves it with every script it lists to `~/.logCli/twitter/<account>/webClient/<time>`.
2. rea reads the composer: the module that sends `CreateTweet`, what it puts in `variables` and `features`, which headers go with it, and which calls the client makes around it.
3. What it shows is written below, with the date and the script it came from.

## What hits an account's session

| Source | What it calls | When |
| --- | --- | --- |
| The queue run | each send, and before it the person's thread and the account's notifications (rule 109) | once per planned item, at least the queue's gap apart |
| The X Chat watcher | X's chat socket, its token, the account's keys and the first inbox page | when it starts; restarted only when the engine's code changes and never during a governor cool-off (rule 113) |
| The inbox poll | the inbox, newest first | every 4 to 8 minutes |
| `twitterDms`, `twitterNotifications`, `voice` | reads, 0.8 to 2.5 s apart (rule 110) | when an agent reads someone's context |

On 2026-11-02 matthewsoldit had 30 session starts and 67 chat socket reconnects in an evening, nearly all from the watcher being restarted on code edits, then X answered 226 on a reply to someone the account had never talked to.

## X's composer (read with rea)

Not read yet: the first `log twitter session webClient` run fills this section.
