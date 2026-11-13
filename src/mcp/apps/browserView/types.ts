export const BROWSER_VIEW_URI = "ui://log/browserView";
export const BROWSER_VIEW_TOOL = "browserView";
export const BROWSER_VIEW_FRAME_TOOL = "browserViewFrame";
export const BROWSER_VIEW_INPUT_TOOL = "browserViewInput";
export const BROWSER_VIEW_DONE_TOOL = "browserViewDone";
export const BROWSER_VIEW_STREAM_TOOL = "browserViewStream";
export const APP_TOOLS = [BROWSER_VIEW_STREAM_TOOL, BROWSER_VIEW_FRAME_TOOL, BROWSER_VIEW_INPUT_TOOL, BROWSER_VIEW_DONE_TOOL] as const;
export type AppToolName = (typeof APP_TOOLS)[number];
export const MCP_APP_MIME_TYPE = "text/html;profile=mcp-app";
export const UI_EXTENSION_ID = "io.modelcontextprotocol/ui";

export interface BrowserViewCsp {
  connectDomains: string[];
  resourceDomains: string[];
}

export interface AppToolDefinition {
  name: AppToolName;
  title: string;
  description: string;
  inputSchema: { type: "object"; properties: Record<string, unknown>; required: string[]; additionalProperties: false };
  annotations: { title: string; readOnlyHint: boolean; destructiveHint: boolean; idempotentHint: boolean; openWorldHint: boolean };
  _meta: { ui: { resourceUri: string; visibility: ["app"] } };
}
