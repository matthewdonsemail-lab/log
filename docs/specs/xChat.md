---
title: "X Chat"
---

# X Chat

X Chat is X's encrypted DM inbox, separate from the old DM API. log reads it only through its own engine and vendored twikit, with the account's PIN from Twenty, uses it to keep cold dms away from people matt already talks to, and treats a reaction or a read receipt as a follow-up to send. Rules 87, 88 and 100.

## Prior conversations

### REQ-XCHAT-01: A dm queue check reads the account's X Chat inbox

`log twitter queue check` on a queue with pending dms reads the account's own X Chat inbox through the engine (`xchatContacts`: every conversation's participants other than the account). Rule 87.

### REQ-XCHAT-02: A pending dm to someone already in a conversation is dropped

Every pending dm whose recipient is already in an X Chat conversation with the account is set to skipped with the reason `priorConversation`, and the queue is saved. Rule 87.

### REQ-XCHAT-03: A failed X Chat read refuses the check

When the X Chat inbox cannot be read, the check is refused (`xChatCheckFailed`) rather than passing the dms through unchecked. Rule 87.

### REQ-XCHAT-04: --skipXChatCheck is the only way past it

The X Chat drop is skipped only with `--skipXChatCheck`, which is used only when matt asks. Rule 87.

## Reading X Chat

### REQ-XCHAT-05: X Chat is unlocked with the account's PIN from Twenty

The account's X Chat PIN is read from Twenty (`socialAccounts.messengerPin`) and handed to the engine only as a file in the run's private folder; the engine unlocks the account's keys with it (`unlock_xchat`) before decrypting. Rule 88.

### REQ-XCHAT-06: The PIN is saved only from a masked prompt, after it unlocks

`log twitter chat pin` asks for the PIN twice in a masked Clack prompt, checks it opens the account's keys through the engine (`xchatUnlock`), and only then saves it to Twenty. It is never printed. Rule 88.

### REQ-XCHAT-07: A person's old DM thread and X Chat thread are one conversation

`log twitter dms` merges a person's old DM thread and X Chat thread into one row, and `--with <handle>` reads both into one timeline. Rule 88.

## Follow-ups

### REQ-XCHAT-08: A reaction as their last event is a follow-up

When someone's last event in a thread is a reaction to matt's message, it is not a reply waiting on him: it is listed as a follow-up to send. Rule 100.

### REQ-XCHAT-09: A read receipt past matt's last message is a follow-up

When matt sent last and their read marker (the old DM API's `last_read_event_id`, or X Chat's read-marker events) is at or past his last message, the thread is marked `openedByThem` and listed as a follow-up to send. Rule 100.

### REQ-XCHAT-10: --waiting lists the follow-ups apart

`log twitter dms --waiting` lists the people waiting on a reply, and lists the follow-ups apart from them; with `--json` they are in `followUps`. Rule 100.
