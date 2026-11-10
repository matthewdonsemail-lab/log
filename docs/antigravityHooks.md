# Antigravity hooks

log-cli's agent hooks enforce safety invariants, keep inboxes and queues live in front of the model, and prevent unmonitored or unlogged commands. While Claude Code and Codex use `.claude/settings.json` and `.codex/hooks.json`, and OpenCode uses a plugin, Google Antigravity (App, CLI, IDE) uses a native JSON configuration in `.agents/hooks.json`.

The adapter script `scripts/hooks/antigravity.ts` bridges Antigravity's JSON hook lifecycle into log-cli's context layer and rule checks.

## Event mapping

| Antigravity Event | Stdin Input | Log-cli Hook Equivalent | Handled By | Output Protocol |
| --- | --- | --- | --- | --- |
| `SessionStart` | Session metadata (`conversationId`, `workspacePaths`, etc.) | `SessionStart` | `scripts/hooks/antigravity.ts SessionStart` | Injects system context via `injectSteps: [{ systemMessage: { systemMessage } }]` |
| `PreInvocation` | `lastUserInput`, invocation number | `UserPromptSubmit` | `scripts/hooks/antigravity.ts PreInvocation` | Injects live inbox/queue/state via `injectSteps: [{ ephemeralMessage }]` |
| `PreToolUse` | `toolCall: { name, args }` | `PreToolUse` (`liveLogs`, `chatNames`) | `scripts/hooks/antigravity.ts PreToolUse` | Returns `{ decision: "allow" }` or `{ decision: "deny", reason }` |
| `PostToolUse` | `toolCall: { name, args }`, `error` | `PostToolUse` | `scripts/hooks/antigravity.ts PostToolUse` | Updates inbox/queue/browser states, returns `{}` |
| `Stop` | `terminationReason`, `fullyIdle` | `Stop` | `scripts/hooks/antigravity.ts Stop` | Returns `{ decision: "allow" }` or `{ decision: "continue", reason }` to resolve blocking browser states |

## Differences from Claude Code / Codex

1. **Protocol & Decisions:**
   - Claude Code indicates refusal via exit code 2 and stderr text.
   - Antigravity uses structured JSON stdout: `{ "decision": "deny", "reason": "..." }` to hard block an action, or `{ "decision": "continue", "reason": "..." }` on `Stop` to prevent early termination when a browser needs resolution.
2. **Context Injection:**
   - Claude Code uses `hookSpecificOutput.additionalContext`.
   - Antigravity uses `injectSteps` array with `systemMessage` (in `SessionStart`) or `ephemeralMessage` (in `PreInvocation`).
3. **Tool Names:**
   - Claude Code exposes `Bash`, `PowerShell`, and `Monitor`.
   - Antigravity exposes `run_command` with `CommandLine` and `Cwd` arguments. `scripts/hooks/antigravity.ts` recognizes both `run_command` and standard shell names to enforce live logging rules (rule 26 and rule 106).
4. **Chat Identification:**
   - Direct Discord/Slack/Instagram MCP tool invocations are inspected for bare numeric IDs; if detected, `chatNameVerdict` issues a `deny` decision requiring human-readable channel names (rule 154).

## Configuration locations

- **Workspace:** `.agents/hooks.json` in the workspace root.
- **Global:** `~/.gemini/config/hooks.json`.
