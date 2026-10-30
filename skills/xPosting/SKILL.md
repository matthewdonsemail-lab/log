---
name: xPosting
description: Run an X account the way matt runs @matthewsoldit, from any account. Add the account to Twenty with `log twitter cookies save` (masked prompt, checked with X), give it a copy style, then post originals by the social posting playbook (Cap, Parakeet, FilmCraft, the X discipline) and reach people through `log twitter` replies, quotes, likes, dms and the queue. Use to set up an X account, to post or reply on X, and when adding a new X workflow, copy style or editing rule.
---

# xPosting

One page for everything an X account does. Each account in Twenty runs the
same setup. The other skills and docs hold the detail. This page says which
one to open, and where a new workflow or style goes.

## 1. Set up an account (once per account)

| Step | Command | Where it lands |
| --- | --- | --- |
| Copy `auth_token` and `ct0` from a browser signed in to x.com (DevTools → Application → Cookies → `https://x.com`) | none | your clipboard only |
| Save them, checked with X first | `bun bin/log.ts twitter cookies save --account <handle> [--style house] [--name "<label>"]` in a terminal (a masked Clack prompt; never a flag, never over MCP) | Twenty `socialAccounts`: a TWITTER row with `accountName` = handle, `cookies`, `sessionState`, `copyStyle` |
| Check it any time | `log twitter session check --account <handle>` (MCP `twitterSession`) | `sessionState` in Twenty, and the governor in `~/.logCli/twitter/<handle>` |
| X Chat PIN, to read encrypted DMs | `bun bin/log.ts twitter chat pin --account <handle>` in a terminal | `socialAccounts.messengerPin` |

The cookies are saved only when X answers loggedIn for that same handle. A
refused or wrong-account paste saves nothing. Each check merges X's refreshed
cookies back into the row. The cookies live in Twenty only, and are never
printed, committed or put in the knowledge base.

## 2. Original posts: the social posting playbook

Every original post (a video) follows the **Social posting playbook**:
record in Cap, caption with Cap's Parakeet model, cut in FilmCraft by the
awesome-video-editing rules, export at -16 LUFS, then post by the X
discipline (original first, the first 2 hours, the first likes, answer every
comment, the quote an hour later).

- Repo: `listeningkit-frontend`, `docs/okf/operations/social-posting-playbook.md`
  (branch `docs/social-posting-playbook`).
- Twenty: Notes → "Social posting playbook (ListeningKit)".
- Knowledge base: `log kb search "social posting playbook"`.

Post the original with `log twitter post --account <handle> --text "<copy>" --media <video.mp4>` (MCP `twitterPost`, `twitterPostLive`).
It is a dry run first: it checks the copy against the account's style, and checks the file's type and size,
without contacting X. `--live --approvedBy <who>` uploads the file and posts.
A video is uploaded in chunks, and the post is made only once X's own processing says succeeded.
It takes one video or gif, or up to 4 images. Everything after the post goes through log-cli as well:
the replies to its comments, the quote an hour later, and the DMs to the people who liked it.

## 3. Reaching people: `log twitter`

Each job has its own page in `docs/useCases/twitter/`: topic replies,
answering the people who comment on your posts, DMs to the people who like
or repost them, affiliate follow-ups, recruiting, the inbox and followers.
The parts every page uses:

- **Finding:** treg's X search, profile and posts reads (rule 53). X itself is never used to search.
- **One send:** `log twitter reply|quote|like|dm --account <handle> …` is a
  dry run. `--live --approvedBy <who>` sends it. A dm drafted on several
  lines goes out one message per line, with matt's usual gap between them,
  and the queue sends dms the same way (rule 90); `--asOne` only when matt
  asks. A drop stops the rest, and nothing is resent (rule 94).
- **Reading the inbox:** `log twitter dms --account <handle>` syncs: the
  first read takes the whole inbox once (about 20 s) and keeps it in
  `~/.logCli/twitter/<handle>/inboxSync.json`; every read after asks X only
  for what is newer than the newest event held (one request when nothing is
  new, about 1.3 s in the engine) and decrypts only what is new. Each read
  keeps its conversations for `log search` and updates the index in the
  background with only the chunks that changed. `--full` reads everything
  again. The live watcher (`log twitter chat watch --inbox`) writes each
  pushed message into the same store, and the SessionStart hook says who is
  waiting from it with nothing fetched.
- **More than one:** the queue: `log twitter queue build → show → check →
  approve → plan → run → run --live`. It spaces sends at random and backs off
  when X throttles. Before any DM it drops people the account has already
  talked to on X Chat (rule 87).
- **Pacing:** 40 writes a day per account, kept by the account's governor.
  `--force` goes past it only when the owner says so (rule 86).

## 4. Copy styles

Every send and every queue check holds its copy to the account's
`copyStyle` (Twenty `socialAccounts.copyStyle`; empty means `house`):

| Style | Rules |
| --- | --- |
| `house` | matt's: lowercase only, no commas, semicolons, full stops, em or en dashes. URLs are exempt |

To give an account another style, set `copyStyle` in Twenty, or pass
`--style` to `cookies save`. A send names the style that failed and why.
`--skipStyleCheck` skips the check only when the owner approved the copy
word for word.

## 5. Adding to this setup (for the next agent)

Add each new piece in the same place every time, so every account gets it:

- **A new copy style:** add one entry to `COPY_STYLES` in
  `src/twitter/copy/style/client.ts` (its `name`, `summary` and a
  `problems(text)` check), with a test in `style.test.ts` and a row in the
  table above. Accounts pick it up through `copyStyle`.
- **A new X workflow** (a job like topic replies): write
  `docs/useCases/twitter/<job>.md` in the same shape as the others (what to
  read, which tools in order, what counts as done), and add its row to
  `docs/useCases/twitter/README.md`.
- **A posting or editing rule** (recording, captions, the cut, the export,
  when and how to post): change the social posting playbook, in the repo and
  the Twenty note together. Then link anything new from section 2 here.
- **A new X command:** `src/cli/twitter/helpers/<name>.ts` on the direct-API
  engine (`DIRECT_ROUTES`, `COMMAND_RULES`), never a browser (rule 80).

Then run `log kb sync`. This skill, the use cases and the docs go into
Twenty's knowledge base and its Redis search, and every agent finds them
with `log kb search`.
