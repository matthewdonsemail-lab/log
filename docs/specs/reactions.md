---
title: "Reactions"
---

# Reactions

The account reacts to a message with an emoji on X, Discord, Slack and Instagram through each platform's own engine and its one session, never the browser, as a write like any send. Rule 140.

## The commands

### REQ-REACT-01: One react command per chat platform, a dry run unless --live

`log twitter react`, `log discord react`, `log slack react` and `log instagram react` take the account, the chat, the message's id and the emoji, and `--remove` to take the account's own reaction off. They are made by one factory, `reactCommandOf`. Without `--live` nothing is contacted. `--live` needs `--approvedBy` (refused with `notApproved`), and an empty message or emoji is refused with `reactInvalid`.

Checked by: code and SubQ

### REQ-REACT-02: The chat is claimed first and released after

A live reaction claims the chat with `guardSend` before the engine is called, refuses with `chatClaimedElsewhere` when another session holds it, and releases it as sent or failed once the platform answers, or as failed when the call throws. Rule 133.

Checked by: code and SubQ

## The engines

### REQ-REACT-03: Each engine calls the platform's own reaction call, as a write

The X engine sends X's DM reaction mutation (`user_dm_reaction_mutation_add_mutation`, or the remove one) with the conversation id, an X Chat `a:b` id tried as the pair `a-b`, and refuses with `reactRefused` when X's answer has errors or no data. The Discord engine calls endcord's `send_reaction` or `remove_reaction`. The Slack engine calls `reactions.add` or `reactions.remove` by name, treating `already_reacted` and `no_reaction` as done. The Instagram engine calls instagrapi's `direct_send_reaction` or `direct_delete_reaction` under its one-call lock. `react` is in each engine's writes, so the governor counts it and refuses it without live and approvedBy.

Checked by: code and SubQ

### REQ-REACT-04: An emoji or its name works on every platform

`python/platformKit/reactions.py` turns a name (`joy`, `:fire:`) into its emoji for X, Discord and Instagram with `unicode_of`, and an emoji into its Slack name with `slack_name_of`; one it can't place is refused with `reactInvalid` before the platform is called. Discord also takes a server's own emoji as `name:id`.

Checked by: code and SubQ
