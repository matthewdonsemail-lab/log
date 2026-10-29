# API keys and logins: where each one lives

Every key log-cli uses is a text file in `C:\Users\mande\.config\listeningkit\`,
one key per file. Never put one in the repo, the knowledge base, a Twenty
note or a chat. This page and the knowledge base say where a key lives,
never what it is. Read a key in a script, and never print it.

| File | What it is | Who reads it |
| --- | --- | --- |
| `subq-api-key.txt` | SubQ's API key (Decisions API `subq.ai/v1/systemone`: `log inspect` readings, `log voice`, persona reads) | `subqKey()` in `src/subq/decisions` (after `SUBQ_API_KEY` in the environment, before `.env.local`) |
| `treg-api-key.txt` | treg's API token (X search, profiles, posts, comments: every lookup, rule 53) | a copy for reference: the `treg` CLI reads its own `~/.treg/config.json`, written by `treg login`. After a new login, copy the token across again |
| `twenty-listeningkit-api-key.txt` | node02's Twenty API key for `log kb` (workspace key "log-cli knowledge base") | `log kb` |
| `twenty-basic-auth.txt` | the Basic Auth login for `twenty.listeningkit.com` | a person, in the browser |
| `kb-redis-url.txt` | the kb-redis URL with its password | `log kb` |
| `cloudflare-api-token.txt` | the Cloudflare API token (zones, DNS, tunnels) | tunnel fixes (`docs/infra/node02.md`) |
| `x-cookies-howto.txt` | no key: which x.com cookie to paste at each prompt of `log twitter cookies save` | a person |

log-cli's own Twenty key and the other provider keys (2Captcha, Byteful,
CaptchaKraken) stay in log-cli's `.env` and `.env.local`, as named in
`.env.example`. The X, Facebook and Discord accounts' sessions live only in
Twenty `socialAccounts` (rule 13).

## Adding a key

1. Put the key alone in a new file, `C:\Users\mande\.config\listeningkit\<service>-api-key.txt`.
2. Have the code read it after the environment variable and before `.env.local`, as `subqKey()` does.
3. Add its row to this table, then run `log kb sync` so every agent finds it with `log kb search "<service> key"`.
