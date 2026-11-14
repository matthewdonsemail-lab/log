# Hermes

Hermes (Nous Research) is an agent that runs on a server and answers through gateways such as Telegram and Slack, plus its CLI, TUI and desktop app.

- **Plugin:** log has a Hermes plugin, named `log`, in this repo under [`hermesPlugin/`](../../hermesPlugin/README.md).
  - **Install:** log itself first, with `logMcp` on the PATH. Then `hermes plugins install listeningkit-log --enable`: the Hermes catalog entry `listeningkit-log` installs this folder at a pinned commit, and the plugin is named `log` once installed. To take what is on `main` before the catalog pin moves, `hermes plugins install matthewdonsemail-lab/log/hermesPlugin --enable` (a source outside the catalog, so Hermes's install scan asks for `--force` on its caution findings). `deepmroot/listeningkit-log` is the plugin's first home and is no longer updated; don't install from it.
  - **What it adds:** it starts `logMcp` on the same machine over stdio, marks the server untrusted so every send asks for approval, ships every log play as a skill (generated from `docs/useCases/` by `bun run skills:build`, the same 38 Claude Code gets) and adds a read-only log tab to Hermes's dashboard.
  - **The router hook:** a portable plugin can't register hooks ([sources.md](../proposals/sources.md)), so the hook is a second, native plugin, `logHooks`, in [`hermesPlugin/native/`](../../hermesPlugin/native/plugin.yaml) (`plugin.yaml`, `__init__.py`). Its `pre_llm_call` runs `scripts/hooks/event.ts UserPromptSubmit --host hermes` with the message (and `SessionStart` first on a session's first turn) and returns `{ "context": … }`, cut to 7,500 characters per event. `log launch --setup` copies it into `<Hermes home>/plugins/logHooks` with the log install's path; then `hermes plugins enable logHooks`. The Hermes home is `HERMES_HOME`, else `~/.hermes`, else `%LOCALAPPDATA%\hermes` on Windows (`LOG_HERMES_DIR` overrides all three).
  - **What it doesn't do yet:** it has no hosted option; the hook runs only where log is installed on the same machine as Hermes.
- **Connects:**
  - **Config:** `mcp_servers` in `~/.hermes/config.yaml`. A remote server takes `url` and `auth: oauth`; Hermes handles registration, PKCE and refresh, and keeps tokens in `~/.hermes/mcp-tokens/<server>.json`. A local server takes `command`. ([Hermes: MCP](https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp), [MCP config reference](https://hermes-agent.nousresearch.com/docs/reference/mcp-config-reference))
  - **Tool names:** Hermes names tools `mcp_<server>_<tool>`, so log's tools appear as `mcp_log_report` and so on.
  - **Reloading:** after a config change, run `/reload-mcp`.
- **Draws MCP Apps:** Hermes's MCP page doesn't mention MCP Apps or `ui://` resources, and Hermes isn't in the [support matrix](https://modelcontextprotocol.io/extensions/client-matrix). Treat it as text.
  - **Views:** `report` comes back as text, and that is what reaches Telegram.
  - **Sign-in:** happens in the log console or, when log runs on the owner's machine, the window on their screen.
- **Guidance:**
  - **Prompt router:** with `logHooks` enabled, `pre_llm_call` names the play before each model call. Without it the model routes each request with `getGuide({ ask: "<the owner's words>" })` (as `mcp_log_getGuide`).
  - **Server instructions:** Hermes's MCP page doesn't mention them.
  - **Resources and prompts:** Hermes does wrap a server's resources and prompts as tools (`list_resources`, `read_resource`, `list_prompts`, `get_prompt`), so log's `log://agents` resource can be read.
  - **What's left:** guidance comes through the tool descriptions and `getGuide`.
  - **Skills:** the plugin's skills are named `log:<skill>` by Hermes. Whether Hermes loads them as Claude Code does isn't checked by running it.
- **Approvals:** Hermes routes MCP form elicitation to its approval prompts, which show as buttons on Telegram and Slack. URL elicitation is declined as unsupported.
