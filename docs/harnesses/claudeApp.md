# Claude

Claude has two harnesses that work differently with log: the Claude app (web, desktop and mobile) and Claude Code.

## The Claude app

- **Connects:** as a custom connector. A Pro or Max user adds the hosted URL under Customize > Connectors; on Team and Enterprise, an owner adds it in organization settings. Claude reaches the server from Anthropic's cloud, not the owner's device, so only the hosted server (`https://mcp.listeningkit.com/mcp`, OAuth) works here. A local `logMcp` doesn't. ([Claude: remote MCP connectors](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp))
- **Draws MCP Apps:** yes. Claude (web) and Claude Desktop are both listed in the [MCP extension support matrix](https://modelcontextprotocol.io/extensions/client-matrix). Anthropic launched these as interactive connectors on 2026-01-26. ([Anthropic](https://claude.com/resources/articles/interactive-tools-in-claude))
  - `report` draws the view inline.
  - `browserView` draws the account's live browser inline from a remote runtime.
- **Guidance:**
  - **Prompt router:** there are no prompt hooks, so the model routes each request with `getGuide({ ask: "<the owner's words>" })`. The hosted server serves `getGuide` and says so in its instructions and in the tool's description.
  - **Server instructions:** whether Claude passes them to the model isn't documented, which is why `getGuide`'s description says it too.
- **Not verified:**
  - which widget actions Claude supports: asking (`ui/message`), pointing (`ui/update-model-context`), full screen, open link and download
  - whether `instructions` reach the model

## Claude Code

- **Connects:** to either. The hosted server works through `claude mcp add` with the URL; `logMcp` runs on the same machine over stdio, which is how this repo's own sessions run it.
- **Draws MCP Apps:** no. Claude Code isn't marked in the [support matrix](https://modelcontextprotocol.io/extensions/client-matrix).
  - `report` returns the view as text: the server renders the same view to text.
  - Signing in happens in the window on the owner's screen or in the log console.
- **Guidance:**
  - **Prompt router:** yes. log installs Claude Code hooks (`src/agentHooks/registry`): its `UserPromptSubmit` hook routes each prompt to a use case, and `SessionStart` restores the session's play.
  - **Server instructions:** Claude Code reads them. (This repo's own sessions show them as the log MCP's server instructions.)
