# OpenCode hooks

log-cli's agent hooks are written for Claude Code and Codex by `src/agentHooks/registry` (`bun run check:agentHooks --write` keeps `.claude/settings.json` and `.codex/hooks.json` in step with it). OpenCode has no hook files of its own, so the same hook contract is mapped onto OpenCode's plugin API by `.opencode/plugins/logHooks`, which OpenCode loads automatically for this repository. Nothing in `src/` changed: the plugin calls the same HTTP endpoints and the same two refusing command scripts.

## What the plugin maps

| OpenCode | log-cli hook |
| --- | --- |
| `session.created` event | `POST /hooks/SessionStart` with `source: "startup"` |
| `session.compaction.started` event | `POST /hooks/SessionStart` with `source: "compact"` |
| `session.hook("prompt")` | `POST /hooks/UserPromptSubmit`, with the prompt as `prompt` |
| `tool.execute.before` on a `log` tool | `scripts/hooks/chatNames.ts` (chat named by a bare id is refused) |
| `tool.execute.before` on a shell tool | `scripts/hooks/liveLogs.ts` (a buffered log run or a hand-run `log …` is refused) |
| `tool.hook("execute.after")` | `POST /hooks/PostToolUse` with the tool name mapped to its Claude name |
| `session.execution.succeeded`, `session.execution.failed`, `session.execution.interrupted`, `session.idle` events | `POST /hooks/Stop`; a `decision: "block"` answer is delivered as a synthetic message |

Tool names are mapped back to the ones the hooks match on: `bash`, `shell` and `powershell` are `bash` on Linux and macOS and `PowerShell` on Windows; a log MCP tool (`log.twitterDm`, `log_twitterDm`, `mcp__log__twitterDm`) is `mcp__log__twitterDm`, which is what `chatNameVerdict`, `liveLogs` and the `PostToolUse` matcher read. A `log` tool reached through the Code Mode `execute` tool is found in its code (`tools.log.twitterDm(`), so those calls are hooked too.

A refusal is raised from `tool.execute.before`, so OpenCode fails that tool call and shows the hook's text to the model, the way Claude Code's exit code 2 does.

## Getting the answers in front of the model

Claude Code puts a hook's `hookSpecificOutput.additionalContext` in front of the model by itself. OpenCode has no such field, and a plugin's `session.hook("context")` additions to the system parts are not delivered to the model. So each answer is written where OpenCode does deliver it:

- `session.instructions.entry.put` under `log.hooks.start` for what SessionStart answers (which accounts are signed in, which remain uncommitted, the inbox, the plays), and under `log.hooks.live` for what a prompt or a tool answers. OpenCode renders each as a `<context key="…">` block and announces it when it changes, which is what keeps the inbox, the queue, X's own counts and the page states in front of the agent while it works.
- The prompt itself, and the tool's own result, when an instruction entry can't be written: the prompt text gains the answer, or the tool's result gains it under `output`.

A Stop answer that blocks is delivered as a synthetic message, because a turn that must not end has to be woken.

## Claude Code against OpenCode

Claude Code's design is one list (`AGENT_HOOKS`) written into `.claude/settings.json`: five events, each hook either an `http` request to the context layer or a `bun` script. Its contract is `hookSpecificOutput.additionalContext` to add context, exit 2 with stderr to refuse, and `{"decision":"block","reason"}` on Stop. OpenCode has none of that, so each piece is carried by something different:

| Claude Code | OpenCode | Carried by |
| --- | --- | --- |
| `SessionStart` matcher `startup` | `session.created` | `session.instructions.entry` under `log.hooks.start` |
| `SessionStart` matcher `resume` | first `prompt` of a session this plugin has not started | the same, posted as `source: "resume"` |
| `SessionStart` matcher `compact` | `session.compaction.started` | the same, posted as `source: "compact"` |
| `SessionStart` matcher `clear` | none | nothing to fire on |
| `UserPromptSubmit` | `session.hook("prompt")` | `session.instructions.entry` under `log.hooks.live` |
| `PreToolUse` (refusing) | `tool.execute.before` | a thrown error, which fails the call and shows the hook's text |
| `PostToolUse` | `tool.hook("execute.after")` | the same instruction entry, or the tool's own result |
| `Stop` | `session.execution.succeeded/failed/interrupted`, `session.idle` | a synthetic message when the answer blocks |
| `transcript_path` | the session's own messages, written as JSONL | `helpers/transcript.ts`, so the play reminder still finds the last `getGuide` |
| `matcher` regexes | TypeScript conditionals on the mapped tool name | `helpers/names.ts` |

Three things about OpenCode make the mapping harder than it looks, and each is handled:

- **A log tool is not always a log tool.** Called directly it arrives as `log_twitterDm`/`mcp__log__twitterDm`; called through the Code Mode `execute` tool it arrives as `execute` with the tool inside `input.code`. Both are read, in the live hook and in the transcript, so a Code Mode call is still a hooked call.
- **A child session is not a session.** A subagent's session emits `session.created` too; its `parentID` is read first and skipped, so a subagent is never given the full SessionStart block.
- **The end of a turn is not `session.idle`.** OpenCode emits `session.execution.succeeded` when a turn's work finishes and leaves `session.idle` unsent for a session no client is watching, so the Stop hook hangs off the execution events, at most once every two seconds per session.

## The hook server

Every HTTP mapping goes to the context layer service on `127.0.0.1:47317` (`LOG_CONTEXT_PORT` moves it), the same one Claude Code uses. When the plugin loads and the service is not answering, it starts `scripts/contextLayer/service.ts` once and waits up to six seconds for it. If it still is not up, the plugin says so once and carries on: no hook blocks a session, and a missing server only means the hooks add no context.

## Confirming it fired

- `curl -s http://127.0.0.1:47317/health` says whether the service is up.
- `log timing` lists the `hook:*` spans, one per hook event a host asked for, with what each hook cost.
- In OpenCode, a denied call shows the hook's own text as the tool's error, and an answered hook shows up as a `<context key="log.hooks.live">` block.

## What it does not carry

- `clear` has no OpenCode event, so the SessionStart hook for it never fires.
- OpenCode's `session.idle` is not sent for a session a client is not watching; the execution events cover it instead.
- The transcript is written for one purpose: the play reminder. It holds only the session's log tool calls, not its whole conversation.
