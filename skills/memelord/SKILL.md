---
name: memelord
description: Reply with a meme that fits the moment, from Memelord's template library (rule 119). Read the chat, search Memelord for the moment (`memelordSearch`, `memelordTrending`, `memelordTemplate`), gate it, and send its media url on its own line, which Discord shows inline. Use when matt asks to answer a chat with memes, or when a chat is joking with clips and a meme is the human answer.
---

# memelord

Memelord is log's first extension: a library of meme templates, video clips
and stickers, found by meaning. log reaches only its four free discovery
tools, so nothing here costs money (rule 41).

## Hard boundaries

- **Free tools only.** `memelordSearch`, `memelordTemplate`, `memelordTrending`
  and `memelordTools`. Nothing that generates, edits or runs a model is
  reachable from log, and `memelordTools` lists the image tools without ever
  running one.
- **The chat comes first.** Read it before picking anything (rule 109): a meme
  answers what was just said, in the way that chat already jokes.
- **Every send is gated** (`voice` with the chat) and paced by the account's
  governor (rule 94). One meme at a time; never a run of them.
- **A price, a promise or a meeting is matt's** (rule 108). A meme can laugh
  about money; it never names a price for him.

## The loop

1. Read the chat: `discordRead` { account, channel, limit: 25 }. Note the
   chat's id from the first line (`… in <channelId>`).
2. Find the moment: the last thing said that a person would answer with a
   reaction (a question to the group, a joke, a win, a fail).
3. Search: `memelordSearch` { query: [the moment in a few words] }. Short
   queries match best: a long sentence often returns one result or none. Use
   `method: "combined"` to add keyword matching, `type: "meme"` for a still
   image, `"video"` for a clip. `memelordTrending` gives what is current, each
   with what it means.
4. Pick one whose name and description fit the moment, and take its media
   url (`.webp`/`.png` for an image, `.mp4` for a clip).
5. Gate it: `voice` { to: <chat>, with: <chat>, context: <the moment and the
   meme picked>, text: <the url, and a line if one fits> }.
6. Send it by the chat's id, so the engine doesn't list every chat first:
   `discordSendLive` { account, channel: <channelId>, text, approvedBy: "matt",
   confirmLive: true }. A url on a line of its own is a message of its own
   (rule 90), and Discord shows it inline.

## Where things are

- Client: `src/extensions/memelord` (the four GET endpoints, the key from
  `MEMELORD_API_KEY` in `.env.local`).
- Command: `log memelord search|template|trending|tools` (`src/cli/memelord`).
- Docs: `docs/extensions/memelord.md`; the use case
  `docs/useCases/discord/memeReply.md`; the spec `docs/specs/memelord.md`.
