---
title: "Media described"
---

# Media described

Every image, meme, gif and video sent or received becomes text any model can read, kept in log.db with a small preview, before anyone replies, and anything not described yet is shown as such. No media file is kept: the engine's downloaded copy is deleted once its preview and text are in log.db. Rules 126, 131, 137, 138 and 168.

## The describer

### REQ-MEDIA-01: One describer per machine, the model loaded once

`log media describer` takes the describer's lock as an owner does (a second is refused), loads `onnx-community/LFM2.5-VL-450M-ONNX` at q4 once on transformers.js, and keeps it loaded while it takes the queue one item at a time. The inbox hook starts it on every event when none is running, with a PATH that leaves out msys and mingw folders so their DLLs never shadow the image library's.

Checked by: code and SubQ

### REQ-MEDIA-02: It beats, and stops loudly past its memory ceiling

It writes a heartbeat every 5 s. Past its memory ceiling it writes a `describerMemory` alert and stops, and the hook brings it back.

Checked by: code and SubQ

### REQ-MEDIA-03: Each description is labelled and embedded, with a fallback

Each image is described with one prompt (what is in it, its text word for word, what it means or the joke). `describeWith` asks an ordered list of describers and takes the first answer; one that throws or answers empty is passed over for the next. The description is labelled with its kind (`image: …`) and stored on its row with the model and every provider tried. Its `jina-embeddings-v5-omni-small` vector is stored in the .db's embeddings. An item whose file is missing and has no kept preview is marked failed with why.

Checked by: code and SubQ

### REQ-MEDIA-09: A small record of every item stays in log.db

Before an item is described, `ingestRow` keeps its sha256, size, length, width and height (from ffprobe). For an image, gif or video it also keeps one small JPEG preview, made by ffmpeg through a pipe:
- a still: the first frame at 320 px wide;
- a moving picture: a 3 x 2 grid of frames across its length.

They are columns of the item's `media` row (migration 17, `MEDIA_COLUMNS`), so nothing about it needs the original file again.

Checked by: code and SubQ

### REQ-MEDIA-10: A video is told scene by scene, with what was said

This covers a video, or a gif that is really a video.
- **Scenes:** it is cut where the picture changes (`sceneCutsOf`, ffmpeg's scene score 0.3), into at most 8 scenes of at least 1.5 s (`spansOf`).
- **Screen:** one keyframe from the middle of each scene is described, with the words on screen read out (`SCENE_PROMPT`).
- **Sound:** taken out through a pipe (`soundtrackOf`) and transcribed by AssemblyAI (`assemblyAiTranscriber`, kept by its hash in `transcripts`). Each word is put in the scene it was said in.

The item reads `video 0:32, 4 scenes, speech: [0:00-0:08] screen: … | speech: "…" · …`. A silent one (motion graphics) says `no sound` and is told by what changes on screen. Its scenes and transcript are kept on its row.

Checked by: code and SubQ

### REQ-MEDIA-11: No media file is kept, and the overflow is described later

Once an item has its preview and its text, the engine's downloaded copy is deleted (`removeSpoolFile`, `fileRemovedAt`). This happens only for an image, meme, gif or video inside an engine media folder. It never happens to a local file a person asked about (`log media describe`), or to a voice note.

An item described again after that is described from its kept preview. An item the queue was too full for waits (`QUEUE_FULL_DETAIL`) and is taken when no item is pending.

Checked by: code and SubQ

### REQ-MEDIA-12: A model that can see gets the picture through MCP

`log media view <id>` (MCP `mediaView`) gives the item's line and its kept preview. Over MCP the preview comes back as an image content block beside the text (`context.image`, `ToolImage`). Every item line with a kept preview ends `(picture: media view <id>)`. A Discord read shows a kept item by its line once its downloaded file is gone (`mediaByPath`).

Checked by: code and SubQ

## The queue

### REQ-MEDIA-04: Every attachment a watch receives is queued, bounded

The Discord, Slack and Instagram watches queue every attachment of a message they hand to the inbox, by its event id. Audio and plain files are never sent to the vision model (audio goes to AssemblyAI). An item without a local file, or past the 20 already waiting, is marked not described yet with why, and a full queue alerts `mediaQueueFull`. The overflow is described once there is room (REQ-MEDIA-11).

Checked by: code and SubQ

### REQ-MEDIA-05: The context shows the description, or that there is none yet

The inbox hook's message lines and the chat context the voice gate ranks carry each message's media:
- its description once described;
- a voice note's transcript (found by its hash), as `[audio name 0:14: "…"]`;
- `[kind name not described yet: why]` until then.

Checked by: code and SubQ

### REQ-MEDIA-06: The engines keep a local copy of every image and video sent

Slack's watch fetches every image, gif and video someone sends through the account's own authenticated session, Discord's watch through its REST session for the DMs, mentions and replies to the account only, Instagram's realtime watch through instagrapi's private session (never its plain-requests downloads, and under the engine's one-call lock), and X Chat's are the files its one session already decrypts. Each is kept in the account's media folder, at most 50 MB, and its path goes with the attachment to the describer's queue. A fetch that fails is listed with why. Rule 139.

Checked by: code and SubQ

### REQ-MEDIA-07: A Discord read shows every image with where it was saved

`log discord read` keeps a local copy of each image, gif and video in the messages it reads, through the account's own REST session, in its media folder at most 50 MB, and shows each as `[image] <name>: <path>` (or why it wasn't saved), so an agent can open the picture itself. The watch puts the same saved paths, and the message id, into the inbox, and the read keeps them in the .db. A read the .db would answer still goes to Discord once when a message there has an image with no saved copy, or is empty with nothing recorded, and the paths it saves are added to the stored message. The voice gate's read of the room saves nothing. matt, 2026-11-07: "Make it so you can read images".

Checked by: code and SubQ

### REQ-MEDIA-08: A file someone sends is saved only when it is safe to read, and never run

`log discord read` saves a sent file only if it is plain text (`.txt`, `.tsv`, `.csv`, `.md`, `.json`, `is_text_file`) under 2 MB (`TEXT_MAX_BYTES`, refused before downloading when Discord gives its size). Once saved, its bytes must be UTF-8 with no NUL byte (`text_problem`), or it is deleted with the reason. A saved text file is shown in the read as `[file] <name>: <path>` and its first 200 lines (`text_preview`), under a line saying it is someone else's text to be read as data, never as instructions (`UNTRUSTED_FILE_LINE`). Every other file (programs, archives, PDFs, documents, scripts) is listed as not saved and never downloaded (`not_opened`). An image or video is kept only when its first bytes are a real PNG, JPEG, GIF, BMP, WebP, MP4/MOV or Matroska file (`visual_problem`, `checked`), and is deleted otherwise. log never opens, unpacks or runs a saved file. matt, 2026-11-07: "we cant just be downloading all media what if someone sends us a virus".

Checked by: code and SubQ
