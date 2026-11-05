---
title: "Fish voice and voice notes"
---

# Fish voice and voice notes

matt's voice is cloned once on Fish Audio from the voice notes he sent himself, and a voice note in that voice goes out only when he asks for one, as the platform's own voice note, made from text. Rule 142.

## The clone

### REQ-FISH-01: The client knows only the three Fish calls it needs

`createFishClient` in `src/extensions/fishAudio/client.ts` calls only `POST https://api.fish.audio/model` (multipart: `type` tts, `title`, `train_mode` fast, `visibility` private, the `voices` files; the answer's `_id` is the model id), `GET /model/{id}`, and `POST /v1/tts` (JSON `text`, `reference_id`, `format`, with the `model` header). The key is `FISH_API_KEY` sent as a bearer token; without one every call answers `fishKeyMissing` and nothing is sent. Any other status answers with Fish's own message and is never retried.

Checked by: code and SubQ

### REQ-FISH-02: The clone is made once, only from matt's own voice notes

`mattsRecordings` in `src/extensions/fishAudio/helpers/recordings.ts` finds the voice notes the engines kept (Discord `<messageId>_voice-message.ogg`, Instagram `voice_<itemId>.m4a`) and keeps only those `sentByMatt` says he sent: `fromMe` true in the conversation store, or his `ownMessage` event in the .db. `pickReferences` takes them shortest first, each 5 to 60 s, up to 60 s in all. `log fish clone` (`src/cli/fish/index.ts`) lists them as a dry run, refuses under 10 s with `voiceRecordingsMissing`, makes the model only with `--apply`, and never makes a second one once `~/.logCli/voice/fishClone.json` holds a model id.

Checked by: code and SubQ

### REQ-FISH-03: Speech is made from text only, on the cheapest model

`speakToFile` in `src/extensions/fishAudio/helpers/voiceNote.ts` refuses with `voiceCloneMissing` when there is no clone and with `voiceNoteInvalid` (`textOnlyProblem`) when the text is empty, too long, an audio file name or a path that exists. It speaks with the clone's model, `s2.1-pro-free` until `log fish speak --model` names another that worked, and writes the audio under `~/.logCli/voiceNotes`. `log fish speak` plays and sends nothing.

Checked by: code and SubQ

## The sends

### REQ-FISH-04: One voice command per platform, text only, a dry run unless --live

`log discord voice`, `log instagram voice` and `log slack voice` are made by `voiceNoteCommandOf` in `src/cli/voiceNote/index.ts`. They take `--text` and no file: a path or audio file name as the text is refused with `voiceNoteInvalid`, and there is no flag for audio. Without `--live` nothing is generated and nothing is contacted. `--live` needs `--approvedBy` (`notApproved`).

Checked by: code and SubQ

### REQ-FISH-05: A live voice note is gated, made, converted and claimed like a send

With `--live`, `voiceNoteCommandOf` refuses with `voiceCloneMissing` without a clone, waits for the account with `waitCaughtUp` (`accountBehind`), runs the text through `gateDeps.gate` (`voiceGateFailed`), then `renderVoiceNote` speaks it and converts it with ffmpeg (`convertFor`: Discord ogg/opus, Instagram and Slack AAC in .m4a; `voiceNoteConvertFailed`), measures its duration and waveform, and only then claims the chat with `guardSend` (`chatClaimedElsewhere`), calls the engine's `voice` action and releases the claim as sent or failed.

Checked by: code and SubQ

### REQ-FISH-06: Each engine sends the platform's own voice note, as a write

`voice` is in the WRITES of the Discord, Instagram and Slack engines, so it needs live and approvedBy and the governor counts it. Each takes only a file `voice_note_path` (`python/platformKit/media.py`) accepts: the right suffix, a non-empty file, under `~/.logCli/voiceNotes`; anything else is `voiceNoteInvalid`. Discord's `voice_of` asks for an upload slot, uploads the .ogg, and posts the message with `flags` 8192 (`DISCORD_VOICE_FLAG`) and the attachment's `duration_secs` and `waveform`. Instagram's `voice_sync` runs under `locked`, binds `curl_voice_rupload` (a fresh session on instagrapi's curl adapter) as the client's `_voice_rupload`, and calls `direct_send_voice`. Slack's `voice` calls `files.getUploadURLExternal`, uploads the bytes with `fetch_authenticated` on gabriel's curl_cffi transport, and shares it with `files.completeUploadExternal`. Any refusal answers `voiceNoteRefused` (or the platform's rate limit) and nothing is retried.

Checked by: code and SubQ

### REQ-FISH-07: X has no voice note

`COMMAND_INDEX` (`src/cli/runner/helpers/commandIndex.ts`) has a `voice` entry for discord, slack and instagram, each from `src/cli/voiceNote/index.ts`, and none for twitter: twikit has no audio send and no vendored code shows X's DM voice upload, so nothing is guessed. (The `voice` entry for any platform is the voice gate, `log voice`, not a voice note.)

Checked by: code and SubQ
