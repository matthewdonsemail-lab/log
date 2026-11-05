---
name: fishAudio
description: Send a voice note in matt's own cloned voice, as Discord's, Instagram's or Slack's native voice note, only when matt asks for one (rule 142). Clone once (`fishClone`), test (`fishSpeak`), then read the chat, draft in his words, gate, dry run (`discordVoice`, `instagramVoice`, `slackVoice`) and send live.
---

# fishAudio

Fish Audio holds one voice: matt's, cloned from the voice notes he sent
himself. log uses it to send voice notes he asks for, as each platform's own
voice note.

## Hard boundaries

- **Only when matt asks.** A voice note goes out only when he says to send
  one. Never on the agent's own initiative, never as a reply style.
- **Only his voice, only from text.** The clone is made from his own voice
  notes (fromMe), never anyone else's. Every send takes text and makes the
  audio itself; an audio file is never accepted.
- **Free model first.** Speech uses `s2.1-pro-free`. `s2.1-pro` costs money,
  and only matt decides to spend (rule 41).
- **Like any send.** Gated (rule 137), claimed (rule 133), counted as a write,
  and a refusal stops with nothing retried (rule 94).

## The routine

1. No clone yet: `fishClone` lists the recordings it would use; `fishClone`
   with apply makes it once. `fishSpeak` says a test line to a file.
2. Read the chat, draft what he says in his words, gate it with `voice`.
3. Dry run with `discordVoice`, `instagramVoice` or `slackVoice`.
4. Send with the `…Live` tool, approvedBy matt.
5. Tell matt the words, the length and where it went.

X has no voice note path. Docs: `docs/extensions/fishAudio.md`,
`docs/useCases/inbox/voiceNote.md`, spec `docs/specs/fishVoice.md`.
