# ChatGPT

- **Connects:** to the hosted server only, as a custom MCP server, with OAuth 2.1 when it needs the user's account. ([OpenAI: build an MCP server](https://developers.openai.com/plugins/build/mcp-server))
- **Draws MCP Apps:** yes.
  - ChatGPT implements the MCP Apps standard. OpenAI recommends the standard `ui/*` bridge by default, and keeps `window.openai` as an optional ChatGPT-only layer. ([MCP Apps in ChatGPT](https://developers.openai.com/apps-sdk/mcp-apps-in-chatgpt))
  - The standard bridge pieces OpenAI names are calling a tool from the view (`tools/call`), a follow-up message (`ui/message`) and model-visible context (`ui/update-model-context`). So log's view can ask the next question and tell the model what the person is pointing at.
  - Full screen, open link and download aren't named on that page. ChatGPT's own download is `window.openai.getFileDownloadUrl`.
- **What log sends it:**
  - Each widget tool carries `_meta.ui.resourceUri`.
  - Each resource is `text/html;profile=mcp-app` with `_meta.ui.csp`.
  - log's `report` and `browserView` already send these.
- **Guidance:**
  - **Server instructions:** used. OpenAI says ChatGPT and Codex use a server's instructions alongside the tool metadata.
  - **Prompt router:** no prompt hooks, so it doesn't run here. The instructions and tool descriptions carry the route instead.
  - **Skills:** the [support matrix](https://modelcontextprotocol.io/extensions/client-matrix) marks Skills over MCP as partial.
- **Not verified in ChatGPT itself:**
  - log's view: inline script, the full-screen request and CSV download
  - the sign-in stream: voxl over its `connectDomains`
