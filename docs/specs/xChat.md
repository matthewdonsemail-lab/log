---
title: "X Chat"
---

# X Chat

X Chat is X's encrypted DM inbox, separate from the old DM API. log reads it only through its own engine and vendored twikit, with the account's PIN from Twenty, uses it to keep cold dms away from people matt already talks to, and treats a reaction or a read receipt as a follow-up to send. Rules 87, 88 and 100.

## Prior conversations

### REQ-XCHAT-01: A dm queue check reads the account's X Chat inbox

`log twitter queue check` on a queue with pending dms reads the account's own X Chat inbox through the engine (`xchatContacts`: every conversation's participants other than the account). Rule 87.

Checked by: code and SubQ

### REQ-XCHAT-02: A pending dm to someone already in a conversation is dropped

Every pending dm whose recipient is already in an X Chat conversation with the account is set to skipped with the reason `priorConversation`, and the queue is saved. Rule 87.

Checked by: code and SubQ

### REQ-XCHAT-03: A failed X Chat read refuses the check

When the X Chat inbox cannot be read, the check is refused (`xChatCheckFailed`) rather than passing the dms through unchecked. Rule 87.

Checked by: code and SubQ

### REQ-XCHAT-04: --skipXChatCheck is the only way past it

The X Chat drop is skipped only with `--skipXChatCheck`, which is used only when matt asks. Rule 87.

Checked by: code and SubQ

## Reading X Chat

### REQ-XCHAT-05: X Chat is unlocked with the account's PIN from Twenty

The account's X Chat PIN is read from Twenty (`socialAccounts.messengerPin`) and handed to the engine only as a file in the run's private folder; the engine unlocks the account's keys with it (`unlock_xchat`) before decrypting. Rule 88.

Checked by: code and SubQ

### REQ-XCHAT-06: The PIN is saved only from a masked prompt, after it unlocks

`log twitter chat pin` asks for the PIN twice in a masked Clack prompt, checks it opens the account's keys through the engine (`xchatUnlock`), and only then saves it to Twenty. It is never printed. Rule 88.

Checked by: code and SubQ

### REQ-XCHAT-07: A person's old DM thread and X Chat thread are one conversation

`log twitter dms` merges a person's old DM thread and X Chat thread into one row, and `--with <handle>` reads both into one timeline. Rule 88.

Checked by: code and SubQ

## Follow-ups

### REQ-XCHAT-08: A reaction as their last event is a follow-up

When someone's last event in a thread is a reaction to matt's message, it is not a reply waiting on him: it is listed as a follow-up to send. Rule 100.

Checked by: code and SubQ

### REQ-XCHAT-09: A read receipt past matt's last message is a follow-up

When matt sent last and their read marker (the old DM API's `last_read_event_id`, or X Chat's read-marker events) is at or past his last message, the thread is marked `openedByThem` and listed as a follow-up to send. Rule 100.

Checked by: code and SubQ

### REQ-XCHAT-10: --waiting lists the follow-ups apart

`log twitter dms --waiting` lists the people waiting on a reply, and lists the follow-ups apart from them; with `--json` they are in `followUps`. Rule 100.

Checked by: code and SubQ

### REQ-XCHAT-11: twikit sends in X Chat the way X Chat's own app does

`vendor/twikit` sends an X Chat message as X Chat's engine (`dm-core`) does, read from its own code (rule 151). `xchat_latest_key` reads the conversation's key change events with `GetInboxPageConversationDataQuery` and opens its newest key with chat-xdk's `extract_conversation_keys`. `upload_xchat_media` encrypts the file with `encrypt_stream`, starts the upload with `InitializeXChatMediaUploadMutation`, POSTs the parts as `application/octet-stream` to the conversation's `xchat_media` path on ton.x.com with `concurrent=true`, the `resumeId` and a `partNumber` from 0, and closes it with `FinalizeXChatMediaUploadMutation`; an error in either answer, or a part answered 400 or more, raises. `send_xchat_message` encrypts with `encrypt_message` under that key and sends `SendMessageCreateMutation` with the payload's `message_id`, `encrypted_content` and `encoded_event_signature`, raising when X answers no `encoded_message_event`. `send_xchat_voice` uploads the audio and sends it as the one attachment, media type `XCHAT_MEDIA_AUDIO` (4) with `duration_millis`. The operations are in `client/gql.py` (`XCHAT_SEND_MESSAGE_CREATE`, `XCHAT_INITIALIZE_MEDIA_UPLOAD`, `XCHAT_FINALIZE_MEDIA_UPLOAD`). Rule 151.

Checked by: code and SubQ

### REQ-XCHAT-12: A dm can go to an X Chat group

`planSend` in `src/twitter/post/send/client.ts` accepts, for a dm only, a target that is an X Chat group id (`g` and digits); any other action, and any other non-digit target, is refused `userIdInvalid`. The dm command in `src/cli/twitter/helpers/send.ts` reads the account's saved PIN for a group target, refuses `xchatPinMissing` without one, and passes it to the engine as `chatPin`. In `python/twitterApi/engine.py` a dm whose `userId` is a group id goes to `xchat_group_text`, which opens X Chat with `xchat_read_keys` when it isn't open and sends the text with `client.send_xchat_message`. `xchat_voice` takes a group id as the conversation. `send_xchat_voice` in twikit makes one message id and passes it to both `upload_xchat_media` (as Initialize's `message_id`) and `send_xchat_message`, which signs the message under it through chat-xdk's `encrypt_message(message_id=...)` and refuses a payload signed under any other id. `initialize_xchat_media_upload` sends no content type. `upload_xchat_media` posts each part as `application/octet-stream` to the `resume_upload_url` Initialize answered (with `partNumber`) when it is on ton.x.com, else to the media URL with `concurrent`, `resumeId` and `partNumber`, carrying the bearer, a Cookie of `auth_token` and `ct0` and the CSRF token. Rule 153.

Checked by: code and SubQ

### REQ-XCHAT-13: Everyone in the inbox list is named

`name_people` in `python/twitterApi/engine.py` runs on the threads the inbox shows, in `synced_inbox` and `inbox`: every person with a numeric id and no handle is named from a handle any stored conversation already has, the old DM users, or `handle_of` (X's user lookup through the account's one session), and the names it finds are kept with `remember_handles`. `handle_of` keeps no failed lookup, and twikit's `User` reads `name` and `screen_name` from the answer's `core` block when `legacy` has none. Rule 154.

Checked by: code and SubQ
