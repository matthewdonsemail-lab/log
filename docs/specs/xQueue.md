---
title: "X queue"
---

# X queue

An X account sends more than one thing only through its queue (`log twitter queue build|plan|run|add|edit`, MCP `twitterQueue…`), at random times, one queue and one run per account, a refusal from X stops the run, and the queue hook puts what the run did in front of the agent. Rules 94, 104, 107 and 114.

## Planning

### REQ-QUEUE-01: Every planned send gets a random time at least minGap apart

`queue plan` draws each like and reply a time inside the window from the system random source, at least minGap seconds apart, and refuses a minGap under 30 seconds.

Checked by: code and SubQ

### REQ-QUEUE-02: A run refuses a queue that is not approved as it stands

A run refuses a queue with no approval, or one whose items changed after it was approved (the fingerprint of the account and every item's action, target and copy no longer matches).

Checked by: code and SubQ

## Running

### REQ-QUEUE-03: A run sends one item at a time, in time order

The run takes the next event in time order, waits for its time, sends it and waits for X's answer before it takes the next one. It never sends two items at once.

The run is `queueRunMachine` (`src/twitter/queue/run/machine.ts`), built with `setup()`, named guards and actions, and `onError` on every invoke; `runQueue` starts it and sends `BEGIN`. The machine drives the run: in `waiting` it takes the next event (`taking`, `choosing`), and its waits and checks are invoked actors (`waitDue` for the poll until the event is due, `pause` for a nudge's 20 to 60 s, `awaitAdded` while `--keepOpen` waits for more, `checkContext` for the read right before a reply); the send is the `sendItem` actor in `liking` or `replying`, and X's answer picks the next state (`waiting`, `retrying` for a network drop, or `halted`). A cancel ends in `stopped`, a throw from any actor ends in `crashed` and `runQueue` throws it as before. The pacing, the order, the gates, the governor use, the queue log lines and the saves are the same as the loop it replaced: `src/twitter/queue/run/runRecord.test.ts` and `src/cli/twitter/queueRun.test.ts` record them and were written against the loop first.

Checked by: code and SubQ

### REQ-QUEUE-04: Two sends are never closer than minGap

When the next event is due less than minGap seconds after the last send, the run moves it to at least minGap after that send instead of sending it.

Checked by: SubQ

### REQ-QUEUE-05: One run per queue

A run takes the queue's lock, a row in `queueLocks` in `log.db` (`takeQueueLock`), and is refused with `queueBusy` while another live run holds it. A lock whose process is gone is taken over. The run releases it when it ends (`releaseQueueLock`).

Checked by: code and SubQ

## Adding while it runs

### REQ-QUEUE-06: queue add hands new items to a running run

When a run holds the queue's lock, `queue add` hands the addition to the run as a `queueIncoming` row (`sendIncoming`), which the run takes in one transaction (`takeIncoming`), instead of changing the queue itself.

Checked by: code and SubQ

### REQ-QUEUE-07: The run takes additions in as it waits and fits them minGap apart

While it waits for the next send, the run takes in what was added, gives each new item a time inside the addition's window at least minGap from what is planned (`fitTimes`), and moves what was planned after it back to keep the gap (`spaceOut`).

Checked by: code and SubQ

### REQ-QUEUE-08: An addition due sooner goes first

When an added item is due before the send the run is waiting on (within minGap of it), the run stops waiting and sends the added item first.

Checked by: SubQ

### REQ-QUEUE-09: One queue holds every kind of send

An addition keeps its own action (dm, reply or quote), so an account's dms, replies and quotes go out through the same queue and the same run.

Checked by: SubQ

### REQ-QUEUE-10: --keepOpen keeps the run going for more

With `--keepOpen`, a run that has sent everything stays running and takes in what is added, until it is cancelled. Without it, the run finishes when nothing is left.

Checked by: code and SubQ

## Queue hook

### REQ-QUEUE-11: The hook reads each queue's log since this session's last look

The queue hook reads every queue's log lines (`queueLog` in `log.db`) after this Claude session's own cursor (`queue:<session>`), so each session sees each event once.

Checked by: code and SubQ

### REQ-QUEUE-12: Held items, sends, refusals, stops and starts go into the agent's context

The hook picks held items, sends, refusals, network drops, stops, cancels, falling behind and starts out of the log and puts them into the agent's context under `>>> QUEUE`, on SessionStart, every prompt and every log tool or shell call.

Checked by: code and SubQ

### REQ-QUEUE-13: The hook says what to do

For a held item the hook says to read the person again, redraft, gate it, stop the run, put it back with `twitterQueueEdit` and run again. For a refusal it says loudly that the run stopped at X's answer, that the item stays pending and that nothing goes out on that account until matt says so; for any other stop it says the same.

Checked by: code and SubQ

## Refusals

### REQ-QUEUE-14: A refusal from X stops the run, and only a network drop is tried again

When X refuses a send (a 429, 226 looks automated, 344 daily limit, an empty result, a soft block, the governor, a dead session, or any other answer where X did not send it), the run stops at once: the item stays pending (not sent, not skipped), the run ends halted with the refusal (X's code, its message and the time) and a stop line saying so, and it never waits and asks X again by itself. Nothing goes out on that account until matt starts a run again (rule 94). A dropped connection with no answer from X (a connection reset, a timeout, the live poll's network test, never a 429) is not a refusal: it is tried again after a short wait, at most `MAX_DROPS` drops in a row, then the run stops with the item pending. A post that is gone (385, 433) is skipped, not a refusal of the account, and so is a reply whose author is over the follower cap (REQ-QUEUE-15).

Checked by: code and SubQ

## Who gets a reply

### REQ-QUEUE-15: A reply goes only to an author with 1500 followers or fewer

matt (2026-11-03): an account that is too large isn't worth it yet, and under 1500 followers is ideal. Before a reply likes, follows or sends anything, the engine reads the author's follower count (`author_too_big`, `MAX_AUTHOR_FOLLOWERS` 1500 in `python/twitterApi/engine.py`). An author over the cap gets nothing: the answer is `event: tooBig`, `code: authorTooBig`, with their count. The queue run treats it like a gone post. The item is marked skipped, the event is dropped with `tooBig`, a `TOO BIG` line says who and how many followers, and the run goes on to the next item. It is never a refusal that stops the run. A spec can lift the cap only when matt asks: with `maxAuthorFollowers`, or with `force` on a reply he named himself (rule 86). Rule 121.

Checked by: code and SubQ

### REQ-QUEUE-16: A queue sends voice notes, and a dm or voice item is judged against its tweet

`QUEUE_ACTIONS` in `src/twitter/queue/plan/types.ts` includes `voice`, and `toAPerson` treats `dm` and `voice` alike: a voice item is built with the person's user id (`buildQueue`), aimed at that id (`targetOfItem`), planned as one send with no like, and checked for an id and words rather than through `planSend`. In `src/cli/twitter/helpers/queue.ts` a voice item waits for the account to catch up, reads the account's X Chat PIN (`xchatPinMissing` without one), says its text with the clone (`voiceNoteDeps.render`), claims the chat (`guardSend`) and sends it with the engine's `xchatVoice`, releasing the claim after. The send-time gate passes `spoken` for a voice item, and `said` from the item's `postText` whenever it has one, which a dm or voice item built from a target with `post_text` keeps. Rule 156.

Checked by: code and SubQ
