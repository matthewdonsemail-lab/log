# Grok (xAI API)

- **Connects:**
  - **Request:** a remote MCP server is an entry in the request's `tools` array: `{ "type": "mcp", "server_url", "server_label" }`. Optional fields are `server_description`, `allowed_tools`, `authorization` (sent as the Authorization header) and `headers`. ([xAI: remote MCP](https://docs.x.ai/developers/tools/remote-mcp))
  - **Hosted only:** only Streamable HTTP and SSE work, and xAI's servers make the connection, so only the hosted log works. `logMcp` on a laptop doesn't.
  - **Not supported:** `require_approval` and `connector_id` from OpenAI's Responses API.
  - **Default tools:** with no `allowed_tools`, every tool log exposes goes into the model's context. Narrowing it to the tools a job needs keeps that small.
- **Draws MCP Apps:** xAI's page doesn't mention MCP Apps, resources, prompts or server instructions, and Grok isn't in the [support matrix](https://modelcontextprotocol.io/extensions/client-matrix).
  - **Views:** `report` comes back as text.
  - **Sign-in:** happens in the log console.
- **Guidance:** there's no prompt router and no confirmed instructions, so guidance comes through the tool descriptions and `getGuide`. `server_description` is the one field the API offers for describing log to the model.
- **The Grok app:** whether grok.com takes custom MCP connectors isn't documented on xAI's page.
