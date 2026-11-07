---
title: "Media described"
---

# Media described

Every image, meme, gif and video sent or received is described by one local vision model into the .db before anyone replies, and anything not described yet is shown as such. Rules 126, 131, 137 and 138.

## The describer

### REQ-MEDIA-01: One describer per machine, the model loaded once

`log media describer` takes the describer's lock as an owner does (a second is refused), loads `onnx-community/LFM2.5-VL-450M-ONNX` at q4 once on transformers.js, and keeps it loaded while it takes the queue one item at a time. The inbox hook starts it on every event when none is running, with a PATH that leaves out msys and mingw folders so their DLLs never shadow the image library's.

Checked by: code and SubQ

### REQ-MEDIA-02: It beats, and stops loudly past its memory ceiling

It writes a heartbeat every 5 s. Past its memory ceiling it writes a `describerMemory` alert and stops, and the hook brings it back.

Checked by: code and SubQ

### REQ-MEDIA-03: Each description is labelled and embedded

Each item is described with one prompt (what is in it, its text word for word, what it means or the joke), a video from three frames taken with ffmpeg, labelled with its kind (`image: …`, `video: frame 1 of 3: …`), stored on its row, and its `jina-embeddings-v5-omni-small` vector stored in the .db's embeddings. An item whose file is missing is marked failed with why.

Checked by: code and SubQ

## The queue

### REQ-MEDIA-04: Every attachment a watch receives is queued, bounded

The Discord, Slack and Instagram watches queue every attachment of a message they hand to the inbox, by its event id. Audio and plain files are never sent to the vision model (audio goes to AssemblyAI). An item without a local file, or past the 20 already waiting, is marked not described yet with why, and a full queue alerts `mediaQueueFull`.

Checked by: code and SubQ

### REQ-MEDIA-05: The context shows the description, or that there is none yet

The inbox hook's message lines and the chat context the voice gate ranks carry each message's media: its description once described, `[kind name not described yet: why]` until then.

Checked by: code and SubQ

### REQ-MEDIA-06: The engines keep a local copy of every image and video sent

Slack's watch fetches every image, gif and video someone sends through the account's own authenticated session, Discord's watch through its REST session for the DMs, mentions and replies to the account only, Instagram's realtime watch through instagrapi's private session (never its plain-requests downloads, and under the engine's one-call lock), and X Chat's are the files its one session already decrypts. Each is kept in the account's media folder, at most 50 MB, and its path goes with the attachment to the describer's queue. A fetch that fails is listed with why. Rule 139.

Checked by: code and SubQ

### REQ-MEDIA-07: A Discord read shows every image with where it was saved

`log discord read` keeps a local copy of each image, gif and video in the messages it reads, through the account's own REST session, in its media folder at most 50 MB, and shows each as `[image] <name>: <path>` (or why it wasn't saved), so an agent can open the picture itself. The watch puts the same saved paths, and the message id, into the inbox, and the read keeps them in the .db. A read the .db would answer still goes to Discord once when a message there has an image with no saved copy, or is empty with nothing recorded, and the paths it saves are added to the stored message. The voice gate's read of the room saves nothing. matt, 2026-11-07: "Make it so you can read images".

Checked by: code and SubQ
