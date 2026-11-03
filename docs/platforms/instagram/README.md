# Instagram

Instagram is a platform of its own: every command is `log instagram <command> …`, and each one is an MCP tool named `instagram<Command>`. It is worked on the direct-API engine only, vendor/instagrapi, never in the account's browser (rule 128). How it's used day to day: `skills/instagram/SKILL.md`.

## What it can do

| Command | MCP tool | What it does |
| --- | --- | --- |
| `log instagram session check` | `instagramSessionCheck` | Checks Instagram still accepts the saved session; the answer goes to Twenty |
| `log instagram dms` | `instagramDms` | The DM threads, newest first, or one thread's messages with `--with` (kept for `log search` and the voice index) |
| `log instagram send` | `instagramSend`, `instagramSendLive` | Text one message per line, and a photo first with `--photo` (a meme); a dry run unless `--live` with `--approvedBy`; stops the moment they write back (rule 130) |
| `log instagram watch` | `instagramWatch` | Holds Instagram's realtime connection and pushes every new DM to the inbox (the inbox hook runs it) |

## What is here

| Part | Where |
| --- | --- |
| The accounts | Twenty `socialAccounts` with platform `INSTAGRAM` (or the local accounts file) |
| The session | `src/instagram/account/session`, on the shared `src/platformKit/session` |
| The commands | `src/cli/instagram/index.ts` |
| The engine | `python/instagramApi/engine.py`, on `python/platformKit/engine.py`; each account's governor is under `~/.logCli/instagram/<account>` |
| The one session per account | `python/instagramApi/host.py`: one process, one client signed in once, one realtime connection (rule 129) |
| The client | `vendor/instagrapi`, every HTTP call through curl_cffi (`check:instagramTransport`) |
| What Instagram's client sends | `background/`, `operations.json` (from the browser recordings, rule 85) |

## Use cases

- [Reading and answering an Instagram DM](../../useCases/instagram/dmReply.md)
- [Bringing a new platform up, then vendoring its client](../../useCases/instagram/newPlatform.md)

## Not built yet

Notifications, followers, comments and posting aren't on the engine yet. Each is built on the engine first, never done in the browser (rule 128).

Spec: [docs/specs/instagram.md](../../specs/instagram.md).
