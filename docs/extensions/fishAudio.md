---
title: "Fish Audio"
---

# Fish Audio

[Fish Audio](https://fish.audio/?aff=Q6W4DNSLJCSXG) ([API docs](https://docs.fish.audio)) is a voice provider for [the voice clone](./voiceClone.md), picked with `--provider fishAudio` or `LOG_VOICE_PROVIDER=fishAudio` (rule 143). It was the first provider (rule 142). Creating a voice model through its API needs API credit: on 2026-11-05 it answered 403, "API model creation limit reached (0/0)", so [Inworld](https://inworld.ai/signup?ref=FSNLMJ2H) became the default.

## The three calls

The client (`src/extensions/fishAudio/client.ts`) knows only these, each with `FISH_API_KEY` as a bearer token:

- `POST https://api.fish.audio/model`, multipart: `type` tts, `title`, `train_mode` fast, `visibility` private, and the `voices` files (matt's own voice notes as they are, 10 to 60 s). The answer's `_id` is the voice id.
- `GET https://api.fish.audio/model/{id}`: the model's state.
- `POST https://api.fish.audio/v1/tts`, JSON `text`, `reference_id`, `format`, with the `model` header: `s2.1-pro-free` ($0, the default) or `s2.1-pro` ($15 per million UTF-8 bytes, only when `--model` names it).

## Setting it up

- `FISH_API_KEY` in `.env.local`; its name is in `.env.example`.
- `log clone voice --provider fishAudio --apply` once, when the account has credit (matt's call, rule 41).
