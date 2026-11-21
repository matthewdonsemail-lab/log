# Trust and control

log reads and replies to your own social accounts, so it handles sessions and sends messages for you. This page is for anyone checking it before they install it, people and agents alike: what it does, what it never does, where your data lives, and how to check each point yourself.

## What log is for

Answering the people you already talk to: who is waiting on a reply, what they said, and a draft in your own voice that you approve before it goes. It runs on your machine with accounts you signed in to yourself.

## What you control

| Control | What happens | How to check it | Tests that prove it |
|---|---|---|---|
| Approval on every send | Replies are set to `ask` by default. The agent shows you the draft and waits for your yes in chat. You change it per platform with `replies` in log's settings. | Ask your agent to reply to someone: it stops at the draft. | [`src/mcp/server/activePlay.test.ts`](../src/mcp/server/activePlay.test.ts) |
| Sends limited to the loaded play | An agent that loaded a reading workflow can't call a send tool that workflow doesn't name. The check runs in the MCP server, not in the model's instructions. | Load a read-only play, then call a send tool: it is refused. | [`src/mcp/server/activePlay.test.ts`](../src/mcp/server/activePlay.test.ts) |
| Dry run by default | Every command that changes something prints what it would do and stops, until you add `--live`, which also needs `--approvedBy`. | `log twitter dm --account <name> --userId <id> --text "hi"` | [`src/cli/discord/discord.test.ts`](../src/cli/discord/discord.test.ts) |
| Voice gate | Each draft is scored against how you really write to that person, and refused when it doesn't sound like you or repeats an earlier message. | `log voice --to <handle> --text "<draft>"` | [`src/cli/twitter/voice.test.ts`](../src/cli/twitter/voice.test.ts) |
| Daily limits | Every account has a read and write budget (on X, 500 reads and 240 writes a day), pacing and quiet hours. A refusal from the platform stops the run; nothing is retried. | `log governor show` | [`src/directApi/governor/governor.test.ts`](../src/directApi/governor/governor.test.ts) |
| One session per account, one agent per chat | Each account keeps one connection open, the way the platform's own app does. A chat is claimed before anyone answers it, so two agents never answer the same person. | `log watchers status` | [`src/inbox/claims/claims.test.ts`](../src/inbox/claims/claims.test.ts), [`sendFence.test.ts`](../src/inbox/claims/sendFence.test.ts) |
| Incoming messages checked | Prompt injection, token stealers and encoded scripts in messages you receive are held, or marked as untrusted, before your agent reads them. | [docs/guides](guides) | [`src/inbox/judge/judge.test.ts`](../src/inbox/judge/judge.test.ts), [`judgeModel.test.ts`](../src/inbox/judgeModel/judgeModel.test.ts) |
| Audit trail | Every read, draft, approval, send and limit reset is written to `~/.logCli/log.db`. | the `runsList` MCP tool | |

Run them yourself: `bun test src/mcp/server/activePlay.test.ts src/inbox src/directApi/governor src/cli/credentials src/privacy`. Every result is tied to the commit you checked out; the npm release can trail `main`, and the [releases table](../README.md) says what each version contains.

## What log will not do

- Send a message, reply, like or follow you didn't approve.
- Collect or sell other people's data. It reads the conversations on your own accounts.
- Run accounts that aren't yours, or sign in without you.
- Retry after a platform says no. A refusal stops the run until you decide.
- Send your sign-ins anywhere. When you run it locally they stay in `~/.logCli` on your machine.

## Your sign-ins never reach the agent

Your agent asks log to act; log holds the session and makes the request itself. The agent picks an account by name and never handles the session values.

- **Typed by you, in a terminal.** Every command that takes a sign-in (`log twitter cookies save`, `log linkedin cookies save`, `log slack cookies save`, `log discord secrets`, `log credentials save`, `log localAccount add`) runs only in a terminal with a masked prompt. An agent calling log over MCP is refused with `terminalOnly`, and the values are never accepted as flags, where they would land in shell history.
- **Never read back.** `log credentials read` returns only the values that are not secret, such as a provider's URL. No tool returns a session value.
- **Taken out of recordings.** When a run is recorded to document a platform's requests, secrets and signed link tokens are removed before anything is written to the docs.
- **Checked before saving.** A session is tested with the platform before it is saved; a refused one is never written.
- **Tests:** [`src/cli/credentials/credentials.test.ts`](../src/cli/credentials/credentials.test.ts), [`src/cli/discord/secrets.test.ts`](../src/cli/discord/secrets.test.ts), [`src/privacy/redact/redact.test.ts`](../src/privacy/redact/redact.test.ts).

This is the separation security research recommends for agents: the model chooses what to do, and a trusted layer outside the model supplies the credential ([Kenney et al., 2026](https://arxiv.org/abs/2609.33371)). Leaking a secret into the model's context, through prompts or debug output, is the most common way agent tools expose credentials ([Chen et al., 2026](https://arxiv.org/abs/2604.03070)).

## Where your data lives

| What | Where |
|---|---|
| Sessions and sign-ins | `~/.logCli` on your machine, typed into a masked prompt, never passed as command-line flags |
| Messages and events | `~/.logCli/log.db`, a local SQLite database |
| Settings | `~/.logCli/.env` and `~/.logCli/settings.json` |
| Shared accounts, optional | [Twenty](twenty.md), an open-source CRM you host, if you choose to use it |

## What leaves your machine

Six pinned models and two you train run locally with no key: the prompt-injection model, meaning search, message emotions, picture descriptions, mouse paths and the fact screen, plus your AI-writing detector and your pipeline labeller ([local models](models.md)). Four hosted services are used only when you add their key, and each gets only what its job needs:

| Service | What it receives | When |
|---|---|---|
| SubQ | the draft and the recent messages of that one chat | the voice gate checks a draft |
| SubQ | a DM line the local fact screen marked, the few lines before it, and that person's current facts | `log people facts extract` decides which lasting facts to keep (`LOG_FACTS_DECIDER`) |
| Jina | text from that chat's history, and media descriptions | ranking history for the gate (local fallback when it is off or slow) |
| AssemblyAI | the audio of a voice note or video | transcribing it |
| Inworld or Fish Audio | the text of a voice note you asked for | making it in your cloned voice |

Sign-ins and session values go to none of them. Leave a key out and the feature that needs it is off. The hosted MCP server (`https://mcp.listeningkit.com/mcp`) is optional and uses OAuth; everything on this page also works fully local.

## How it talks to each platform

log uses each platform's own web or app interface with your own signed-in session, one connection per account, at a human pace. These are not the platforms' public developer APIs, so a platform can change them or limit automated use; when one refuses, log stops. It does not create accounts, buy accounts or post from accounts you don't own. The platform pages under [platformGuides](platformGuides) list what each one reads and sends.

## Platform rules

Each platform has its own terms for automated use. log keeps to a human pace, one session per account and daily limits, and stops the moment a platform refuses, but it can't promise a platform will allow every use. You decide what to run on your accounts and stay responsible for it.

## What is not done yet

Stated plainly so you can weigh it:

- **No independent security audit yet.** The controls above are in the code with tests you can run; nobody outside the project has reviewed them.
- **Sessions and keys are encrypted on your machine,** with the key held by Windows, the macOS Keychain or Linux's Secret Service, and a recovery passphrase for a new PC ([encrypted account store](security/encryptedStore.md)). It has been run on Windows; macOS and Linux are written and not yet tested. Browser profiles still rely on your file permissions and disk encryption. A guard before tool calls, a canary token and an attack-set benchmark for the injection judge are on the [roadmap](../README.md).
- **Platforms differ.** X, Instagram, Discord and Slack read and send; LinkedIn, Reddit and Facebook cover fewer actions. The README's platform table lists each.

## Reporting a problem

Open an issue at https://github.com/matthewdonsemail-lab/log/issues. Security problems: mark the issue as security, or contact the maintainer on X at @matthewsoldit.

## Related

- Up: [log's README](../README.md)
- Start here, in order: [Install](install.md) · [Add an account](accounts.md) · [Connect your agent](mcp.md) · [What log does, and what it never does](trust.md)
- Then: [Use cases, the plays step by step](useCases/README.md) · [Your agent app](harnesses/README.md) · [What you can do on each platform](platformGuides/x.md) · [Every command and tool](reference.md) · [How log works](howItWorks.md)
