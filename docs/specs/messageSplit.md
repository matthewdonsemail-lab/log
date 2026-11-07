---
title: "Message split and the opener"
---

# Message split and the opener

How a message to a person goes out: a draft on several lines goes out one message per line in every chat, a one-line draft is split the way matt writes in that chat, and a first message is gated as the opener as a whole before any of it is sent. Rules 90 and 98.

## Splitting

### REQ-SPLIT-01: A draft on several lines goes out one message per line

A draft with more than one non-empty line is sent as one message per line, in order, whatever matt's habit in that chat.

Checked by: code and SubQ

### REQ-SPLIT-02: --asOne sends it as one message

Only `--asOne` sends a draft as one message, and it is never on by default.

Checked by: code and SubQ

### REQ-SPLIT-03: A one-line draft is split the way matt writes in that chat

A one-line draft is split into as many messages as matt usually sends in a row in that chat (at most 4), sized to his usual message length there. With no messages of his in that chat, or when he mostly sends one message there, it goes as one.

Checked by: code and SubQ

### REQ-SPLIT-04: The parts go out with his usual gap

The parts are sent with matt's usual gap between his messages in that chat, kept between 1 and 8 seconds.

Checked by: code and SubQ

### REQ-SPLIT-05: Every chat splits the same way

An X dm sent directly (`log twitter dm`), an X dm sent by the queue and a Discord message (`log discord send`) are all split by the same plan, and the dry run shows the parts.

Checked by: code and SubQ

### REQ-SPLIT-06: A part that is not sent stops the rest

When X or Discord does not answer a part as sent, the parts after it are not sent, and what was sent stays sent and is never resent.

Checked by: code and SubQ

### REQ-SPLIT-09: The line gap is the gap, and the governor doesn't stack its own on it

The discord send loop passes `continuesSend: true` with every part after the first. In `run` in `python/platformKit/engine.py`, a write with `continuesSend` gets its governor from `governor_for(..., continues_send=True)`, whose `mean_gap_s` is the config's `min_gap_s`. So the governor still enforces its floor, its hourly, daily and write caps and its cooldown, but draws no second random gap on top of the line gap the send already waited. The first part, and any send that isn't a continuation, keeps the governor's full lognormal gap, counted from the account's last write (`write_gap_from_writes`, `last_mutation_ts` in `vendor/fbk/src/governor.py`), so a read or a catch-up call just before it doesn't make it wait. Every read on these engines (`read=True` in `governor_for`) is paced at `READ_MIN_GAP_S` 0.8 s and `READ_MEAN_GAP_S` 1.6 s instead of the write gap. matt, 2026-11-07: "we're not achieving p99", after a read of 4 messages took 16 s and a send waited 47 s on a gap drawn from the catch-up's last call. matt, 2026-11-07: a two-line send took 46 s, the second line 33 s after the first. Rule 161.

Checked by: code and SubQ

### REQ-SPLIT-08: A send stops the moment they write back

Before each part after the first, the send reads what the platform's push channel put in the inbox for that chat since the send began. If the other person wrote, the parts left are not sent, and the answer leads with `>>> INTERRUPTED`: what they said and the parts not sent. This holds for an X dm sent directly or by the queue (matched in either inbox), a Discord message, a Slack message and an Instagram message. Rule 130.

Checked by: code and SubQ

## The opener

### REQ-SPLIT-07: A first message is gated whole as the opener

The voice gate reads the whole draft, every line of it, before it is split, and fails a first message to someone matt has never talked with when it carries an ask (a pitch, a question about his tool, a call or a link to his own stuff). Rule 98.

Checked by: code and SubQ
