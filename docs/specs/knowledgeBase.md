---
title: "Knowledge base"
---

# Knowledge base

The knowledge base holds everything an agent should look up before it guesses: AGENTS.md's rules and sections, the skills, the docs, the Claude memory files, the known page states and the accounts. It lives in your own Twenty server and is searched through your own Redis by keyword and meaning at once. `log kb sync`, `log kb search`, `log kb remember` and `log kb show` (MCP `kbSync`, `kbSearch`, `kbRemember`, `kbShow`). Rule 93 (with rule 38 for the pages it leaves out).

## Where it lives

### REQ-KB-01: The articles live in Twenty's knowledgeArticles

Every article is a `knowledgeArticles` row in ListeningKit's Twenty, with its key, kind, title, body, source, tags, author and content hash. Twenty is reached at the URL in `KB_TWENTY_URL`, over a private network rather than a public login gate. There is no default host: without `KB_TWENTY_URL`, `kbConfig` says it is missing.

Checked by: code (anchors)

### REQ-KB-02: The logins are files outside the repo

The Twenty API key and the Redis URL come from the environment or from files in `~/.config/listeningkit/`, never from the repo, and a command that can't find one says which is missing.

Checked by: code and SubQ

## Search

### REQ-KB-03: Search is keyword and meaning at once, fused

`log kb search "<query>"` runs Redis's BM25 keyword search and its HNSW vector search (over the query's local all-MiniLM-L6-v2 embedding) on the `kbIdx` index in parallel, and fuses them with reciprocal rank fusion. `--kind` keeps one kind of article. Each article appears once, at its best chunk.

Checked by: code and SubQ

## Sync

### REQ-KB-04: Sync collects every source

`log kb sync` collects AGENTS.md's numbered rules and its other sections, every skill, every doc under `docs/` (those under `docs/infra/` as infra), every Claude memory file, the known page states, and the accounts from log-cli's Twenty (unless `--noAccounts`).

Checked by: code and SubQ

### REQ-KB-05: Some pages and fields are never collected

Docs under `docs/vendors/` are never collected, nor pages about platform enforcement (rule 38). An account's article carries its home, status, states and whether a proxy is attached, never a credential, a proxy URL or a cookie.

Checked by: code and SubQ

### REQ-KB-06: Sync writes only what changed

Each article's content hash decides: a new key is created in Twenty, a changed hash is updated, and an unchanged one is left alone.

Checked by: code and SubQ

### REQ-KB-07: Redis is re-indexed from Twenty, only what changed

After writing, every article Twenty holds (including one a person wrote or edited there) is re-indexed into Redis when its hash differs from the one Redis holds, and an article Redis holds that Twenty no longer has is dropped from Redis.

Checked by: SubQ

## Notes and reading

### REQ-KB-08: Remember saves a note to Twenty and Redis at once

`log kb remember "<text>"` saves the text as a `note` article with a dated key in Twenty and indexes it in Redis in the same call.

Checked by: code and SubQ

### REQ-KB-09: Show reads one article in full

`log kb show <key>` prints one article in full, and a key that doesn't exist is refused with `kbArticleMissing`.

Checked by: SubQ

## Secrets

### REQ-KB-10: Secrets are scrubbed before anything is written

Every collected article's body and every note are scrubbed before they are written: named keys, tokens, passwords and PINs, URLs carrying a login, JWTs, private keys and long random strings are replaced with a redaction mark.

Checked by: code and SubQ
