import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { ViewerError, VIEWER_ERROR_TEXT, viewerFrame, viewerInput, viewerState, voxlOrigins } from "../../../browser/viewer/index.ts";
import type { ViewerView } from "../../../browser/viewer/index.ts";
import { browserViewJson, browserViewLocation, browserViewText } from "../../../cli/browser/index.ts";
import type { BrowserViewLocation } from "../../../cli/browser/index.ts";
import { widgetHtml } from "./helpers/index.ts";
import { APP_TOOLS, BROWSER_VIEW_DONE_TOOL, BROWSER_VIEW_FRAME_TOOL, BROWSER_VIEW_INPUT_TOOL, BROWSER_VIEW_STREAM_TOOL, BROWSER_VIEW_TOOL, BROWSER_VIEW_URI, MCP_APP_MIME_TYPE, UI_EXTENSION_ID } from "./types.ts";
import type { AppToolDefinition, AppToolName, BrowserViewCsp } from "./types.ts";

const ACCOUNT = { type: "string", description: "The account whose browser this is" };
const GENERATION = { type: "string", description: "The viewer generation from browserView: a restarted browser has a new one and older input is refused" };
const LOOPBACK_BINDS = new Set(["127.0.0.1", "localhost", "::1"]);

export const appToolDeps = { state: viewerState, frame: viewerFrame, input: viewerInput };

export function uiCapable(capabilities: unknown): boolean {
  const extensions = (capabilities as { extensions?: Record<string, { mimeTypes?: unknown }> } | undefined)?.extensions;
  const ui = extensions?.[UI_EXTENSION_ID];
  return Array.isArray(ui?.mimeTypes) && ui.mimeTypes.includes(MCP_APP_MIME_TYPE);
}

export function httpLocation(host: string, authenticated: boolean): BrowserViewLocation {
  return LOOPBACK_BINDS.has(host) && !authenticated ? "local" : "remote";
}

export function settleLocation(location: BrowserViewLocation, env: Record<string, string | undefined> = process.env): BrowserViewLocation {
  if (env.LOG_BROWSER_VIEW_LOCATION !== "local" && env.LOG_BROWSER_VIEW_LOCATION !== "remote") env.LOG_BROWSER_VIEW_LOCATION = location;
  return browserViewLocation(env);
}

function appTool(name: AppToolName, title: string, description: string, properties: Record<string, unknown>, required: string[], readOnly: boolean): AppToolDefinition {
  return {
    name,
    title,
    description,
    inputSchema: { type: "object", properties, required, additionalProperties: false },
    annotations: { title, readOnlyHint: readOnly, destructiveHint: false, idempotentHint: readOnly, openWorldHint: !readOnly },
    _meta: { ui: { resourceUri: BROWSER_VIEW_URI, visibility: ["app"] } },
  };
}

export function appTools(): AppToolDefinition[] {
  return [
    appTool(BROWSER_VIEW_STREAM_TOOL, "Browser view stream", "The voxl stream descriptor (its URL, which carries voxl's read-only password, and the page and window geometry), for the browser view only so it never reaches the model. Remote runtimes only.", { account: ACCOUNT, generation: GENERATION }, ["account", "generation"], true),
    appTool(BROWSER_VIEW_FRAME_TOOL, "Browser view frame (fallback)", "The fallback picture for the browser view when voxl cannot stream (a Camoufox account, or no https voxl): the live browser's latest JPEG frame and its revision. withState adds the current view.", { account: ACCOUNT, generation: GENERATION, withState: { type: "boolean", description: "Also return the current view" } }, ["account", "generation"], true),
    appTool(
      BROWSER_VIEW_INPUT_TOOL,
      "Browser view input",
      "The person's own click, text, key or scroll in the live browser, for the browser view only. It reaches the page only while the page still asks for sign-in and the revision still matches, and it is replayed as a recorded step. It never goes through voxl.",
      {
        account: ACCOUNT,
        generation: GENERATION,
        revision: { type: "string", description: "The revision of the page the person acted on" },
        event: { type: "object", description: "{type:'click',x,y} in page pixels, {type:'text',text}, {type:'key',key} or {type:'scroll',deltaY}" },
      },
      ["account", "generation", "revision", "event"],
      false,
    ),
    appTool(BROWSER_VIEW_DONE_TOOL, "Browser view state", "Reads the page again: the view polls it, and calls it when the person says they are finished, to say whether the page still needs them.", { account: ACCOUNT }, ["account"], true),
  ];
}

export function isAppTool(name: string): name is AppToolName {
  return (APP_TOOLS as readonly string[]).includes(name);
}

export function withBrowserViewUi<T extends { name: string; _meta?: Record<string, unknown> }>(tool: T): T {
  if (tool.name !== BROWSER_VIEW_TOOL) return tool;
  return { ...tool, _meta: { ...(tool._meta ?? {}), ui: { resourceUri: BROWSER_VIEW_URI } } };
}

function refusal(code: string, message: string): CallToolResult {
  return { isError: true, content: [{ type: "text", text: `${code}: ${message}` }], structuredContent: { error: code, message } };
}

function failed(error: unknown): CallToolResult {
  if (error instanceof ViewerError) return refusal(error.code, VIEWER_ERROR_TEXT[error.code]);
  return refusal("browserViewerUnavailable", VIEWER_ERROR_TEXT.browserViewerUnavailable);
}

function accountOf(input: Record<string, unknown>): string | null {
  return typeof input.account === "string" && /^[A-Za-z0-9_.@+-]{1,128}$/.test(input.account) ? input.account : null;
}

export async function runAppTool(name: AppToolName, input: Record<string, unknown> | undefined, allowed: boolean, location: BrowserViewLocation = browserViewLocation()): Promise<CallToolResult> {
  if (!allowed) return refusal("browserViewAppOnly", "This tool is called by the browser view in an MCP Apps host, not by the model.");
  const fields = input ?? {};
  const account = accountOf(fields);
  if (!account) return refusal("browserInputInvalid", "account is required");
  if (location === "local" && name !== BROWSER_VIEW_DONE_TOOL) return refusal("browserViewLocal", "The browser runs on this machine: the person uses its own window, so the view neither streams it nor sends input.");
  try {
    if (name === BROWSER_VIEW_STREAM_TOOL) {
      const view = await appToolDeps.state(account);
      if (typeof fields.generation !== "string" || fields.generation !== view.generation) return refusal("browserGenerationChanged", VIEWER_ERROR_TEXT.browserGenerationChanged);
      if (!view.stream) return refusal("browserStreamUnavailable", "This browser has no voxl stream; the view uses screenshot frames.");
      return { content: [{ type: "text", text: `voxl stream for ${account}` }], structuredContent: { generation: view.generation, stream: view.stream } };
    }
    if (name === BROWSER_VIEW_FRAME_TOOL) {
      const frame = await appToolDeps.frame(account, fields.generation);
      const view = fields.withState === true ? browserViewJson(await appToolDeps.state(account), location) : null;
      return { content: [{ type: "text", text: `frame ${frame.revision.slice(0, 12)}` }], structuredContent: { ...frame, view } };
    }
    if (name === BROWSER_VIEW_INPUT_TOOL) {
      const view = await appToolDeps.input(account, { generation: fields.generation, revision: fields.revision, event: fields.event });
      return { content: [{ type: "text", text: `${view.account}: ${view.phase}` }], structuredContent: { view: browserViewJson(view, location) } };
    }
    const view = await appToolDeps.state(account);
    return { content: [{ type: "text", text: browserViewText(view, location) }], structuredContent: { view: browserViewJson(view, location), done: !view.needsHuman && view.phase !== "busy" } };
  } catch (error) {
    return failed(error);
  }
}

export function browserViewCsp(env: Record<string, string | undefined> = process.env): BrowserViewCsp {
  return { connectDomains: voxlOrigins(env.LOG_VOXL_URL?.trim()), resourceDomains: [] };
}

export function browserViewResource() {
  return { uri: BROWSER_VIEW_URI, name: "Live browser", description: "An account's live browser, so a person can sign in without leaving the chat", mimeType: MCP_APP_MIME_TYPE };
}

export async function readBrowserViewResource(env: Record<string, string | undefined> = process.env) {
  return {
    contents: [{ uri: BROWSER_VIEW_URI, mimeType: MCP_APP_MIME_TYPE, text: await widgetHtml(), _meta: { ui: { csp: browserViewCsp(env), prefersBorder: true } } }],
  };
}

export function accountOfArgs(input: Record<string, unknown> | undefined): string | null {
  return input ? accountOf(input) : null;
}

export function withBrowserView(result: CallToolResult, view: ViewerView, location: BrowserViewLocation = browserViewLocation()): CallToolResult {
  const structured = (result.structuredContent ?? {}) as Record<string, unknown>;
  return { ...result, structuredContent: { ...structured, json: browserViewJson(view, location) } };
}
