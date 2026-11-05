---
title: "Voice clone and voice notes"
---

# Voice clone and voice notes

matt's voice is cloned once per voice provider from the voice notes he sent himself, and a voice note in that voice goes out only when he asks for one, as the platform's own voice note, made from text. The voice layer is provider-agnostic: Inworld and Fish Audio are providers behind one interface. Rules 142 to 145.

## The providers

### REQ-VOICE-CLONE-01: One interface, a provider picked by flag, setting or default

`src/extensions/voiceClone` holds the shared interface (`VoiceProviderClient`: its models, cheapest model, clone limits, the reference format it takes, `clone` and `speak`) and `voiceProvider`, which returns the provider's client from `PROVIDER_CLIENTS`. `providerOf` in `src/extensions/voiceClone/helpers/provider.ts` picks the provider from `--provider`, else `LOG_VOICE_PROVIDER` (the environment or `.env.local`), else `inworld`, and refuses any other name. The voice note commands and `log clone` call only this shared layer, never a provider's own client.

Checked by: code and SubQ

### REQ-VOICE-CLONE-02: Inworld clones and speaks through its own two calls

`createInworldClient` in `src/extensions/inworld/client.ts` calls only `POST https://api.inworld.ai/voices/v1/voices:clone` (JSON `displayName`, `languageCode`, `description`, `voiceSamples` with base64 `audioData` and an optional `transcription`; the answer's `voice.voiceId`) and `POST https://api.inworld.ai/tts/v1/voice` (JSON `text`, `voiceId`, `modelId`, an optional `language`, `audioConfig.audioEncoding`; the answer's base64 `audioContent`), with `Authorization: Basic` and `INWORLD_API_KEY`. Its references go as wav, 3 to 30 s in all, and its cheapest model is `inworld-tts-2-flash`. Without a key it answers `voiceKeyMissing` and sends nothing.

Checked by: code and SubQ

### REQ-VOICE-CLONE-03: Fish Audio clones and speaks through its own three calls

`createFishClient` in `src/extensions/fishAudio/client.ts` calls only `POST https://api.fish.audio/model` (multipart `type` tts, `title`, `train_mode` fast, `visibility` private, the `voices` files; the answer's `_id`), `GET /model/{id}`, and `POST /v1/tts` (JSON `text`, `reference_id`, `format`, with the `model` header), with `FISH_API_KEY` as a bearer token. Its references go as they are, 10 to 60 s in all, and its cheapest model is `s2.1-pro-free`.

Checked by: code and SubQ

## The clone

### REQ-VOICE-CLONE-04: The clone is made once per provider, only from matt's own voice notes

`mattsRecordings` in `src/extensions/voiceClone/helpers/recordings.ts` keeps only the kept voice notes `sentByMatt` says he sent (`fromMe` in the conversation store, or his `ownMessage` in the .db). `pickReferences` takes them shortest first, each at least 5 s, within the provider's most. `log clone voice` (`cloneCommand`, `src/cli/clone/index.ts`) lists them as a dry run, refuses under the provider's least with `voiceRecordingsMissing`, converts them to wav with `wavOf` when the provider wants wav, clones only with `--apply`, and never clones twice on a provider that `~/.logCli/voice/clone.json` already holds (`readClone`, `writeClone`, keyed by provider) unless `--replace` says to (REQ-VOICE-CLONE-11). `log fish` is refused with the `log clone` form it became.

Checked by: code and SubQ

### REQ-VOICE-CLONE-05: Speech is made from text only, on the cheapest model

`speakToFile` in `src/extensions/voiceClone/helpers/voiceNote.ts` refuses with `voiceCloneMissing` when the provider has no clone and with `voiceNoteInvalid` (`textOnlyProblem`) when the text is empty, too long, an audio file name or a path that exists. It speaks with the clone's model, the provider's cheapest unless `log clone speak --model` names another of its models, and writes the audio under `~/.logCli/voiceNotes`. `log clone speak` plays and sends nothing.

Checked by: code and SubQ

## The sends

### REQ-VOICE-CLONE-06: One voice command per platform, text only, a dry run unless --live

`log discord voice`, `log instagram voice` and `log slack voice` are made by `voiceNoteCommandOf` in `src/cli/voiceNote/index.ts`. They take `--text`, `--provider` and no file: a path or audio file name as the text is refused with `voiceNoteInvalid`, and there is no flag for audio. Without `--live` nothing is generated and nothing is contacted. `--live` needs `--approvedBy` (`notApproved`).

Checked by: code and SubQ

### REQ-VOICE-CLONE-07: A live voice note is gated, made, converted and claimed like a send

With `--live`, `voiceNoteCommandOf` refuses with `voiceCloneMissing` without a clone on the chosen provider, waits for the account with `waitCaughtUp` (`accountBehind`), runs the text through `gateDeps.gate` (`voiceGateFailed`) unless `--mattsWords` says they are matt's own dictated words (REQ-VOICE-CLONE-10), then `renderVoiceNote` speaks it with that provider and converts it with ffmpeg (`convertFor`: Discord ogg/opus, Instagram and Slack AAC in .m4a; `voiceNoteConvertFailed`), measures its duration and waveform, and only then claims the chat with `guardSend` (`chatClaimedElsewhere`), calls the engine's `voice` action and releases the claim as sent or failed.

Checked by: code and SubQ

### REQ-VOICE-CLONE-08: Each engine sends the platform's own voice note, as a write

`voice` is in the WRITES of the Discord, Instagram and Slack engines, so it needs live and approvedBy and the governor counts it. Each takes only a file `voice_note_path` (`python/platformKit/media.py`) accepts: the right suffix, a non-empty file, under `~/.logCli/voiceNotes`; anything else is `voiceNoteInvalid`. Discord's `voice_of` asks for an upload slot, uploads the .ogg, and posts the message with `flags` 8192 (`DISCORD_VOICE_FLAG`) and the attachment's `duration_secs` and `waveform`. Instagram's `voice_sync` runs under `locked`, binds `curl_voice_rupload` (a fresh session on instagrapi's curl adapter) as the client's `_voice_rupload`, and calls `direct_send_voice`. Slack's `voice` calls `files.getUploadURLExternal`, uploads the bytes with `fetch_authenticated` on gabriel's curl_cffi transport, and shares it with `files.completeUploadExternal`. Any refusal answers `voiceNoteRefused` (or the platform's rate limit) and nothing is retried.

Checked by: code and SubQ

### REQ-VOICE-CLONE-09: X has no voice note

`COMMAND_INDEX` (`src/cli/runner/helpers/commandIndex.ts`) has a `voice` entry for discord, slack and instagram, each from `src/cli/voiceNote/index.ts`, and none for twitter: twikit has no audio send and no vendored code shows X's DM voice upload, so nothing is guessed. (The `voice` entry for any platform is the voice gate, `log voice`, not a voice note.)

Checked by: code and SubQ

### REQ-VOICE-CLONE-10: matt's own dictated words skip the gate's read, never the artifact check

`voiceNoteCommandOf` in `src/cli/voiceNote/index.ts` takes `--mattsWords`: the text is matt's own words, dictated by him for this voice note. The voice gate grades speech as typed text and as a reply, so with `--mattsWords` a live send never calls `gateDeps.gate` and says on its progress line that the gate's read was skipped; the dry run says so too. `watermarkReadingOf` still reads the text before anything else, with or without the flag, and refuses `aiArtifacts`. Without `--mattsWords` the gate runs as REQ-VOICE-CLONE-07 says. Everything else (approval, clone, catch-up, render, claim, engine) is the same. Rule 144.

Checked by: code and SubQ

### REQ-VOICE-CLONE-11: The clone is made in matt's accent, and can be made again keeping the old one

`voiceSettingsOf` in `src/extensions/voiceClone/helpers/provider.ts` reads the accent from `LOG_VOICE_ACCENT` (default `Northern Irish`) and the language from `LOG_VOICE_LANGUAGE` (default `en-IE`), with `en-GB` as the fallback. Inworld's `cloneVoice` (`cloneBodyOf`, `src/extensions/inworld/client.ts`) sends that `languageCode`, a `description` naming the accent (`accentDescriptionOf`), and each sample's `transcription` when `cloneDeps.transcript` finds matt's AssemblyAI transcript by the file's hash (`readTranscript(hashOf(bytes))`); when Inworld answers 400 with `INVALID_ARGUMENT` or a language error it sends the same clone once more in the fallback language, and keeps the language Inworld accepted on the clone (`language`, with `accent`). `log clone voice --apply --replace` (`cloneCommand`, `src/cli/clone/index.ts`) clones again over an existing clone, and `replacedClone` (`src/extensions/voiceClone/helpers/store.ts`) keeps the old one, voice id included, under `previous`, never deleting it; without `--replace` an existing clone is answered as it is. `speakToFile` sends the clone's `language` and the accent, and `accentSteerOf` puts `[say it in a <accent> accent] ` before the text only on a model in `INWORLD_STEERING_MODELS` (`inworld-tts-2`): Inworld removes an instruction tag before synthesis and supports steering only there, while `inworld-tts-2-flash` gets none. Rule 145.

Checked by: code and SubQ
