# Knowledge base

`log kb` keeps everything log knows (its rules, skills, docs, agent memories, known page states and accounts) in one searchable place that people and agents share. People read and edit the articles in a Twenty server; agents search them through a Redis index in milliseconds. Use it when an agent needs context fast, or when you want to save something it should remember. This page describes one way to run it: Twenty and Redis on a private server, reached over a private network.

```mermaid
flowchart LR
  repo["AGENTS.md rules and sections<br/>skills, docs, docs/infra"] --> collect
  memory["Agent memory files<br/>~/.claude/projects/*/memory"] --> collect
  states["Known page states"] --> collect
  accounts["log's Twenty<br/>socialAccounts"] --> collect
  collect["log kb sync<br/>collect and scrub secrets"] -->|new and changed, by content hash| twenty["Knowledge Twenty<br/>knowledgeArticles"]
  person["a person in Twenty"] --> twenty
  remember["log kb remember"] --> twenty
  twenty -->|changed articles, chunked and embedded| redis["kb-redis<br/>kbIdx: BM25 + HNSW"]
  remember --> redis
  redis --> search["log kb search<br/>reciprocal rank fusion"]
```

In short:

1. `log kb sync` collects every source, removes secrets, and writes new or changed articles to Twenty (compared by content hash).
2. Articles a person writes or edits in Twenty are picked up on the next sync.
3. Changed articles are split into chunks, embedded, and indexed in Redis.
4. `log kb search` searches Redis by keyword and by meaning and merges the two.

## Commands

| Command | What it does |
| --- | --- |
| `log kb search "<query>" [--kind <kind>] [--limit <n>]` | Finds the best articles for the query. Keyword search (BM25) and meaning search (HNSW over all-MiniLM-L6-v2) are merged with reciprocal rank fusion, and each article appears once. |
| `log kb show <key>` | Shows one article in full, from Twenty. |
| `log kb remember "<text>" [--title] [--tags]` | Saves a note to Twenty and Redis at once. |
| `log kb sync [--noAccounts]` | Collects every source, writes what changed to Twenty, and re-indexes what changed into Redis. |

Kinds: `rule`, `section`, `skill`, `doc`, `infra`, `memory`, `pageState`, `account`, `note`. The skill `skills/knowledgeBase/SKILL.md` says where each kind comes from.

## One way to run it

| Part | Where | How log reaches it |
| --- | --- | --- |
| Articles | A Twenty server (v2.49.0), object `knowledgeArticles` | Over a private network (for example Tailscale Serve), with the API key in a file under `~/.config/listeningkit/` |
| Search index | `kb-redis`, `redis:8.2.11` with the search and JSON modules and the append-only file on | Over the same private network (Tailscale Serve TCP), with the Redis URL in a file under `~/.config/listeningkit/` |
| Embeddings | The machine running log: `Xenova/all-MiniLM-L6-v2` (384 dimensions), the same model `log search` uses | Local |

If the public address of your Twenty sits behind HTTP Basic Auth, that clashes with Twenty's API key, since both use the `Authorization` header. That's why log talks to Twenty over the private network instead.

Login files live outside the repo, never in it or in the knowledge base.

## Secrets

Nothing secret is written. Every article goes through `scrubSecrets` first. These become `<redacted>`:

- named keys (`password=`, `token:`, `apiKey=`, `pin:`…);
- URLs with a login in them;
- JWTs and private keys;
- any long random string that mixes letters and digits.

`docs/vendors` is never collected. Accounts carry only their status and setup: no cookies, proxy URL, device, email, password or 2FA secret.

## Limits

- Twenty allows 100 API requests a minute. New articles go in batches of 60; a 429 answer waits a minute and retries.
- Redis holds only the index. If `kb-redis` is lost, `log kb sync` rebuilds it from Twenty.
