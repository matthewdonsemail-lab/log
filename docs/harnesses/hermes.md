# Hermes

Hermes (Nous Research) is an agent that runs on a server and answers through gateways such as Telegram and Slack, plus its CLI, TUI and desktop app.

- **Connects:**
  - **Config:** `mcp_servers` in `~/.hermes/config.yaml`. A remote server takes `url` and `auth: oauth`; Hermes handles registration, PKCE and refresh, and keeps tokens in `~/.hermes/mcp-tokens/<server>.json`. A local server takes `command`. ([Hermes: MCP](https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp), [MCP config reference](https://hermes-agent.nousresearch.com/docs/reference/mcp-config-reference))
  - **Tool names:** Hermes names tools `mcp_<server>_<tool>`, so log's tools appear as `mcp_log_report` and so on.
  - **Reloading:** after a config change, run `/reload-mcp`.
- **Draws MCP Apps:** Hermes's MCP page doesn't mention MCP Apps or `ui://` resources, and Hermes isn't in the [support matrix](https://modelcontextprotocol.io/extensions/client-matrix). Treat it as text.
  - **Views:** `report` comes back as text, and that is what reaches Telegram.
  - **Sign-in:** happens in the log console or, when log runs on the owner's machine, the window on their screen.
- **Guidance:**
  - **Prompt router:** Hermes has no prompt hooks for it.
  - **Server instructions:** Hermes's MCP page doesn't mention them.
  - **Resources and prompts:** Hermes does wrap a server's resources and prompts as tools (`list_resources`, `read_resource`, `list_prompts`, `get_prompt`), so log's `log://agents` resource can be read.
  - **What's left:** guidance comes through the tool descriptions and `getGuide`.
  - **Skills:** Hermes has its own skills system. Whether log's installable skills load there isn't checked.
- **Approvals:** Hermes routes MCP form elicitation to its approval prompts, which show as buttons on Telegram and Slack. URL elicitation is declined as unsupported.
