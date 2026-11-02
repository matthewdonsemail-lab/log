---
title: "Message split and the opener"
---

# Message split and the opener

How a message to a person goes out: a draft on several lines goes out one message per line in every chat, a one-line draft is split the way matt writes in that chat, and a first message is gated as the opener as a whole before any of it is sent. Rules 90 and 98.

## Splitting

### REQ-SPLIT-01: A draft on several lines goes out one message per line

A draft with more than one non-empty line is sent as one message per line, in order, whatever matt's habit in that chat.

### REQ-SPLIT-02: --asOne sends it as one message

Only `--asOne` sends a draft as one message, and it is never on by default.

### REQ-SPLIT-03: A one-line draft is split the way matt writes in that chat

A one-line draft is split into as many messages as matt usually sends in a row in that chat (at most 4), sized to his usual message length there. With no messages of his in that chat, or when he mostly sends one message there, it goes as one.

### REQ-SPLIT-04: The parts go out with his usual gap

The parts are sent with matt's usual gap between his messages in that chat, kept between 1 and 8 seconds.

### REQ-SPLIT-05: Every chat splits the same way

An X dm sent directly (`log twitter dm`), an X dm sent by the queue and a Discord message (`log discord send`) are all split by the same plan, and the dry run shows the parts.

### REQ-SPLIT-06: A part that is not sent stops the rest

When X or Discord does not answer a part as sent, the parts after it are not sent, and what was sent stays sent and is never resent.

## The opener

### REQ-SPLIT-07: A first message is gated whole as the opener

The voice gate reads the whole draft, every line of it, before it is split, and fails a first message to someone matt has never talked with when it carries an ask (a pitch, a question about his tool, a call or a link to his own stuff). Rule 98.
