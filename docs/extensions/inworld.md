---
title: "Inworld"
---

# Inworld

[Inworld](https://docs.inworld.ai) is the default voice provider for [the voice clone](./voiceClone.md) (rule 143). Instant voice cloning is free on every plan, and the free plan includes about 70 minutes of speech.

## The two calls

The client (`src/extensions/inworld/client.ts`) knows only these, each with `Authorization: Basic <INWORLD_API_KEY>` (the Base64 credentials from the Inworld portal, sent as they are):

- `POST https://api.inworld.ai/voices/v1/voices:clone`, JSON `displayName`, `languageCode` (`LOG_VOICE_LANGUAGE`, default `en-IE`; when Inworld answers 400 `INVALID_ARGUMENT` it is sent again as `en-GB`, Inworld's own example of a British accent), `description` naming the accent (`LOG_VOICE_ACCENT`, default Northern Irish), and `voiceSamples`, each `audioData` as base64 wav with its `transcription` when `~/.logCli/transcripts` holds matt's AssemblyAI transcript of that file (Inworld says TTS-2 cloning makes its own and ignores it, so a missing one is not paid for). `log clone voice --apply --replace` makes it again, keeping the old voice id under `previous` (rule 145). Inworld works best with 10 to 30 s and cuts longer clips at 30 s, so log sends matt's own voice notes shortest first up to 30 s in all. The answer's `voice.voiceId` (`{workspace}__{voice}`) is kept in `~/.logCli/voice/clone.json` under `inworld`.
- `POST https://api.inworld.ai/tts/v1/voice`, JSON `text` (up to 2,000 characters; log keeps a voice note under 600), `voiceId`, `modelId`, `language` (the language the clone was made in) and `audioConfig.audioEncoding` (`MP3` or `WAV`). The answer's `audioContent` is base64 audio. On `inworld-tts-2` the text starts with `[say it in a <accent> accent]`: Inworld's steering docs say an instruction tag is removed from the text before synthesis, never spoken, and that steering is supported only on `inworld-tts-2`; `inworld-tts-2-flash` ignores instruction tags, so log sends none to it.

`inworld-tts-2-flash` (Inworld's lowest cost per character) is used unless `--model inworld-tts-2` says otherwise.

## Setting it up

- `INWORLD_API_KEY` in `.env.local`; its name is in `.env.example`.
- `log clone voice`, read the list, then `log clone voice --apply` once, and `log clone speak --text "…"` to hear it.
