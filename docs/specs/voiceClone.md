---
title: "Voice clone and voice notes"
---

# Voice clone and voice notes

matt's voice is cloned once per voice provider from the voice notes he sent himself, and a voice note in that voice goes out only when he asks for one, as the platform's own voice note, made from text. The voice layer is provider-agnostic: Inworld and Fish Audio are providers behind one interface. Every voice note is shaped like his own voice notes and listened back before it goes. Rules 142 to 151.

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

`mattsRecordings` in `src/extensions/voiceClone/helpers/recordings.ts` keeps only the kept voice notes `sentByMatt` says he sent (`fromMe` in the conversation store, or his `ownMessage` in the .db). `pickReferences` takes them shortest first, each at least 5 s, within the provider's most. `log clone voice` (`cloneCommand`, `src/cli/clone/index.ts`) lists them as a dry run, refuses under the provider's least with `voiceRecordingsMissing`, converts them to wav with `wavOf` when the provider wants wav, clones only with `--apply`, and never clones twice on a provider that log.db already holds (`readClone`, `writeClone`, the `voiceClone` row keyed by provider, REQ-STORAGE-17) unless `--replace` says to (REQ-VOICE-CLONE-11). `log fish` is refused with the `log clone` form it became.

Checked by: code and SubQ

### REQ-VOICE-CLONE-05: Speech is made from text only, on the cheapest model

`speakToFile` in `src/extensions/voiceClone/helpers/voiceNote.ts` refuses with `voiceCloneMissing` when the provider has no clone and with `voiceNoteInvalid` (`textOnlyProblem`) when the text is empty, too long, an audio file name or a path that exists. It speaks with the clone's model, the provider's cheapest unless `log clone speak --model` names another of its models, and writes the audio under `~/.logCli/voiceNotes`. `log clone speak` plays and sends nothing.

Checked by: code and SubQ

## The sends

### REQ-VOICE-CLONE-06: One voice command per platform, text only, a dry run unless --live

`log discord voice`, `log instagram voice` and `log slack voice` are made by `voiceNoteCommandOf` in `src/cli/voiceNote/index.ts`. They take `--text`, `--provider` and no file: a path or audio file name as the text is refused with `voiceNoteInvalid`, and there is no flag for audio. Without `--live` nothing is generated and nothing is contacted. `--live` needs `--approvedBy` (`notApproved`).

Checked by: code and SubQ

### REQ-VOICE-CLONE-07: A live voice note is gated, made, converted and claimed like a send

With `--live`, `voiceNoteCommandOf` refuses with `voiceCloneMissing` without a clone on the chosen provider, starts `renderVoiceNote` at once, so the note is spoken with that provider and converted with ffmpeg (`convertFor`: Discord ogg/opus, Instagram and Slack AAC in .m4a; `voiceNoteConvertFailed`), its duration and waveform measured, while the account catches up (`waitCaughtUp`, `accountBehind`) and the text goes through `gateDeps.gate` (`voiceGateFailed`) unless `--mattsWords` says they are matt's own dictated words (REQ-VOICE-CLONE-10). A refusal from either stops the send and the note made in the meantime is never sent; a render that throws is `voiceProcessingFailed`. Only once both have passed and the note is made does it claim the chat with `guardSend` (`chatClaimedElsewhere`), calls the engine's `voice` action and releases the claim as sent or failed.

Checked by: code and SubQ

### REQ-VOICE-CLONE-08: Each engine sends the platform's own voice note, as a write

`voice` is in the WRITES of the Discord, Instagram and Slack engines, so it needs live and approvedBy and the governor counts it. Each takes only a file `voice_note_path` (`python/platformKit/media.py`) accepts: the right suffix, a non-empty file, under `~/.logCli/voiceNotes`; anything else is `voiceNoteInvalid`. Discord's `voice_of` asks for an upload slot, uploads the .ogg, and posts the message with `flags` 8192 (`DISCORD_VOICE_FLAG`) and the attachment's `duration_secs` and `waveform`. Instagram's `voice_sync` runs under `locked`, binds `curl_voice_rupload` (a fresh session on instagrapi's curl adapter) as the client's `_voice_rupload`, and calls `direct_send_voice`. Slack's `voice` calls `files.getUploadURLExternal`, uploads the bytes with `fetch_authenticated` on gabriel's curl_cffi transport, and shares it with `files.completeUploadExternal`. Any refusal answers `voiceNoteRefused` (or the platform's rate limit) and nothing is retried.

Checked by: code and SubQ

### REQ-VOICE-CLONE-09: An X voice note is an X Chat voice message

`COMMAND_INDEX` (`src/cli/runner/helpers/commandIndex.ts`) has a `voice` entry for discord, slack, instagram and twitter, each from `src/cli/voiceNote/index.ts` (the `voice` entry for any platform is the voice gate, `log voice`, not a voice note). `twitterVoiceCommand` opens the X account, refuses with `xchatPinMissing` when its X Chat PIN isn't saved, and sends through `context.directTwitter` the engine action `xchatVoice` with the person's handle (`screenName`) or `userId`, the note's `path` and `seconds`, `live`, `approvedBy` and the saved `chatPin`. `PLATFORM_AUDIO.twitter` is AAC in .m4a. In `python/twitterApi/engine.py`, `xchatVoice` is in `WRITES`, `xchat_voice` takes only a voice note under the voice notes folder (`media_kit.voice_note_path`), opens X Chat with the PIN when it isn't open, finds the user, makes the conversation id from the two ids in ascending order, and calls `send_xchat_voice` with the file, its milliseconds and a `voice-note-<time>.m4a` name. Rule 151 (it replaces rule 142's "X isn't built").

Checked by: code and SubQ

### REQ-VOICE-CLONE-10: matt's own dictated words skip the gate's read, never the artifact check

`voiceNoteCommandOf` in `src/cli/voiceNote/index.ts` takes `--mattsWords`: the text is matt's own words, dictated by him for this voice note. The voice gate grades speech as typed text and as a reply, so with `--mattsWords` a live send never calls `gateDeps.gate` and says on its progress line that the gate's read was skipped; the dry run says so too. `watermarkReadingOf` still reads the text before anything else, with or without the flag, and refuses `aiArtifacts`. Without `--mattsWords` the gate runs as REQ-VOICE-CLONE-07 says. Everything else (approval, clone, catch-up, render, claim, engine) is the same. Rule 144.

Checked by: code and SubQ

### REQ-VOICE-CLONE-11: The clone is made in matt's accent, and can be made again keeping the old one

`voiceSettingsOf` in `src/extensions/voiceClone/helpers/provider.ts` reads the accent from `LOG_VOICE_ACCENT` (default `Irish`) and the language from `LOG_VOICE_LANGUAGE` (default `en-IE`), with `en-GB` as the fallback. Inworld's `cloneVoice` (`cloneBodyOf`, `src/extensions/inworld/client.ts`) sends that `languageCode`, a `description` naming the accent (`accentDescriptionOf`), and each sample's `transcription` when `cloneDeps.transcript` finds matt's AssemblyAI transcript by the file's hash (`readTranscript(hashOf(bytes))`); when Inworld answers 400 with `INVALID_ARGUMENT` or a language error it sends the same clone once more in the fallback language, and keeps the language Inworld accepted on the clone (`language`, with `accent`). `log clone voice --apply --replace` (`cloneCommand`, `src/cli/clone/index.ts`) clones again over an existing clone, and `replacedClone` (`src/extensions/voiceClone/helpers/store.ts`) keeps the old one, voice id included, under `previous`, never deleting it; without `--replace` an existing clone is answered as it is. `speakToFile` sends the clone's `language`. No accent instruction is sent with the text (rule 147): `steeredText` in `src/extensions/inworld/client.ts` only adds breaths (`withBreaths`) on a model in `INWORLD_STEERING_MODELS` (`inworld-tts-2`) and leaves the text as it is on `inworld-tts-2-flash`. The accent defaults to `Irish`. Rules 145, 147.

Checked by: code and SubQ

### REQ-VOICE-CLONE-12: The clone speaks at matt's speed on the preferred model, and can be made from recordings he names

`voiceSettingsOf` in `src/extensions/voiceClone/helpers/provider.ts` reads the speed from `LOG_VOICE_SPEED` through `speedOf`, which defaults to `DEFAULT_SPEED` (1.15) and keeps it within `SPEED_RANGE` (0.8 to 1.5); `speakToFile` passes it as `speed` through `paceOf`, which drifts it a little per text (REQ-VOICE-CLONE-16), and Inworld sends it as `audioConfig.speakingRate`. A clone records the provider's `preferred` model (`inworldProvider`: `inworld-tts-2`), else its cheapest, as its `model`, and `speakToFile` speaks with that model unless a `--model` is passed. `log clone voice --from <file>[,<file>]` (`cloneCommand`, `namedRecordings`, `src/cli/clone/index.ts`) clones from those files instead of matt's voice notes, each one's words read from a `.txt` of the same name beside it (`cloneDeps.sidecar`). Rule 146.

Checked by: code and SubQ

### REQ-VOICE-CLONE-13: Every spoken file is shaped like matt's own voice notes

`speakToFile` in `src/extensions/voiceClone/helpers/voiceNote.ts` always asks the provider for wav and runs `voiceSteps.process` on it before anything else uses it; by default that is `processLikeMatt` in `src/extensions/voiceClone/helpers/realism.ts`, given the paths of `mattsRecordings()` and a seed from the text. `processLikeMatt` reads the voice through ffmpeg with `REALISM.shape` (phone squash and a top-end shelf) and `phoneCurveFilter` (`REALISM.phoneCurve`, the tone curve measured between his own voice notes and the clone: the phone mic's low cut under 160 Hz, its dip around 2 to 3 kHz and its dull top over 5 kHz), and `shapeLikeMatt` moves its level by a smooth random drift of `REALISM.movementDb`, sways a low-pass around `REALISM.cutoffHz`, saturates it with `tanh` at `REALISM.drive`, lays matt's own room tone under it (`roomTone` from `quietPieces` of his recordings, never a generated sound, none from a recording whose floor is under `REALISM.silentFloorDb`) at `REALISM.snrDb` under the voice's level, and peaks it at `REALISM.peakDb`; the same seed gives the same samples (`seeded`). A failure is `voiceProcessingFailed` and nothing is sent. On `inworld-tts-2` the text gets breaths (`withBreaths`, `src/extensions/voiceClone/helpers/spoken.ts`). Rule 147.

Checked by: code and SubQ

### REQ-VOICE-CLONE-14: A voice note says what was written, checked by listening back

Before speaking, `speakToFile` refuses with `pronunciationUnknown` any acronym `unknownAcronyms` finds that `SPOKEN_LEXICON` (`src/extensions/voiceClone/types.ts`) doesn't hold, and sends the provider `speakableText(text)`, which writes each lexicon word as its `write` form (`op` as `OP`) outside bracket tags. After shaping it calls `voiceSteps.listen` (by default `listenTo`, which transcribes the file with AssemblyAI keeping word timings, `src/media/voiceNotes/client.ts`, and keeps the transcript by the file's hash) and refuses `spokenCheckFailed` when it can't. `readSpoken` lines the written words up with the heard ones (`aligned`) and fails when a lexicon word is not heard as one of its `heard` forms, is spelled out as letters, takes more than `WORD_MOST_MS` when it is said as a word, or when more than `SPOKEN_MOST_ERROR` of the words differ; `speakToFile` then deletes the file and refuses `spokenMismatch` with what was heard. `renderVoiceNote` uses `speakToFile`, so every `log discord|instagram|slack voice` is checked before it is converted, claimed or sent, and `log clone speak` too. Rule 147.

Checked by: code and SubQ

### REQ-VOICE-CLONE-15: A translation is gated on its original and spoken in its own language

`voiceNoteCommandOf` in `src/cli/voiceNote/index.ts` takes `--translationOf "<original>"` and `--language <code>`. With `--translationOf` the voice gate (`gateDeps.gate`) grades the original words instead of the text, since it compares a draft with matt's own writing; `watermarkReadingOf` reads the text and the original together and refuses `aiArtifacts`. `--translationOf` without `--language`, `--translationOf` with `--mattsWords`, and a `--language` that isn't a code like `zh-CN` are refused `voiceNoteInvalid` before anything is gated or made. The language goes through `voiceNoteDeps.render` and `renderVoiceNote` to `speakToFile`, which speaks in it instead of the clone's own `language`. `wordsOf` in `src/extensions/voiceClone/helpers/spoken.ts` reads Han, Hiragana, Katakana and Hangul one character at a time beside Latin words, so `readSpoken` checks a translated note as it checks an English one. Rule 148.

Checked by: code and SubQ

### REQ-VOICE-CLONE-16: No breath at the start, and breaths and pace that vary

`withBreaths` in `src/extensions/voiceClone/helpers/spoken.ts` never puts `[breathe]` before the first sentence. It splits on `.!?` and `。！？`, and puts a breath before a later sentence only once the spoken length since the last one (a Chinese, Japanese or Korean character counting half) reaches a gap drawn from `seeded(seed)` between `BREATH_WORDS.least` and `BREATH_WORDS.most`; text that already has a `[breathe]` is left as it is. `steeredText` in `src/extensions/inworld/client.ts` seeds it from the text on `inworld-tts-2` only. `speakToFile` sends the speed through `paceOf` in `src/extensions/voiceClone/helpers/voiceNote.ts`, which moves `LOG_VOICE_SPEED` by at most `PACE_JITTER` from a seed of the text, kept within `SPEED_RANGE`. The voice note command gates with `spoken: true` (REQ-VOICE-13 in `voiceGate.md`). Rule 149.

Checked by: code and SubQ

