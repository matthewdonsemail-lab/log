import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { BROWSER_VIEW_DESCRIPTION, browserViewCsp, readBrowserViewResource } from "./browserView/client.ts";
import { BROWSER_VIEW_TOOL, BROWSER_VIEW_URI, MCP_APP_MIME_TYPE } from "./browserView/types.ts";
import { appToolMeta } from "./meta.ts";
import type { AppCsp } from "./meta.ts";
import { readReportResource, REPORT_RESOURCE_DESCRIPTION } from "./report/client.ts";
import { MACHINE_TOOL, REPORT_TOOL, REPORT_URI, REPORT_VIEW_META_KEY } from "./report/types.ts";
import { SIGN_IN_TOOL } from "./signIn/types.ts";

export const VIEW_META_KEY = REPORT_VIEW_META_KEY;
export const CARD_MAX_PRIMARY_ACTIONS = 1;
export const CARD_MAX_ACTIONS = 2;

export interface CardResource {
  [key: string]: unknown;
  contents: { uri: string; mimeType: string; text: string; _meta: Record<string, unknown> }[];
}

export interface AppCard {
  uri: string;
  name: string;
  description: string;
  tools: string[];
  asks: string;
  prompts: string[];
  invoking: string;
  invoked: string;
  uiOnly: boolean;
  csp: () => AppCsp;
  read: () => Promise<CardResource>;
}

export const CARDS: AppCard[] = [
  {
    uri: BROWSER_VIEW_URI,
    name: "Live browser",
    description: BROWSER_VIEW_DESCRIPTION,
    tools: [BROWSER_VIEW_TOOL, SIGN_IN_TOOL],
    asks: "Show or open an account's live browser in the chat so the owner watches it, clicks in it, signs in or uses the page himself.",
    prompts: ["show me the browser for discord", "open the discord browser in the chat", "sign into discord", "show me the live browser for instagram"],
    invoking: "Opening the live browser",
    invoked: "Live browser",
    uiOnly: false,
    csp: () => browserViewCsp(),
    read: () => readBrowserViewResource() as Promise<CardResource>,
  },
  {
    uri: REPORT_URI,
    name: "View",
    description: REPORT_RESOURCE_DESCRIPTION,
    tools: [REPORT_TOOL],
    asks: "Show a view drawn in the chat: a chart, table, dashboard or stats of who messaged the owner, who waits on him, or one person's profile.",
    prompts: ["show me a chart of who messaged me this week", "draw me a dashboard of my dms by sender", "make a table of who is waiting on me", "show me stats of who dmed me on x as a chart"],
    invoking: "Drawing the view",
    invoked: "View drawn",
    uiOnly: true,
    csp: () => ({ connectDomains: [], resourceDomains: [] }),
    read: () => readReportResource() as Promise<CardResource>,
  },
  {
    uri: REPORT_URI,
    name: "View",
    description: REPORT_RESOURCE_DESCRIPTION,
    tools: [MACHINE_TOOL],
    asks: "Draw where the owner stands with someone as a state machine, the route to them, or the network by state.",
    prompts: ["show me where I am with grace_ships", "who could introduce me to linus_k", "show my network as a state machine"],
    invoking: "Drawing the state machine",
    invoked: "State machine drawn",
    uiOnly: true,
    csp: () => ({ connectDomains: [], resourceDomains: [] }),
    read: () => readReportResource() as Promise<CardResource>,
  },
];

export function cardOfTool(name: string): AppCard | null {
  return CARDS.find((card) => card.tools.includes(name)) ?? null;
}

export function cardOfUri(uri: string): AppCard | null {
  return CARDS.find((card) => card.uri === uri) ?? null;
}

export function withCard<T extends { name: string; _meta?: Record<string, unknown> }>(tool: T, capable = true): T {
  const card = cardOfTool(tool.name);
  if (!card || (card.uiOnly && !capable)) return tool;
  return { ...tool, _meta: { ...(tool._meta ?? {}), ...appToolMeta(card.uri, { invoking: card.invoking, invoked: card.invoked }) } };
}

export function cardResources(capable: boolean) {
  return CARDS.filter((card, i) => (capable || !card.uiOnly) && CARDS.findIndex((other) => other.uri === card.uri) === i).map((card) => ({ uri: card.uri, name: card.name, description: card.description, mimeType: MCP_APP_MIME_TYPE }));
}

export async function readCard(uri: string): Promise<CardResource | null> {
  const card = cardOfUri(uri);
  return card ? card.read() : null;
}

export function cardResult(text: string, summary: Record<string, unknown>, view: Record<string, unknown>): CallToolResult {
  return { content: [{ type: "text", text }], structuredContent: summary, _meta: { [VIEW_META_KEY]: view } };
}

export function viewOfResult(result: { structuredContent?: Record<string, unknown>; _meta?: Record<string, unknown> }): Record<string, unknown> {
  const view = result._meta?.[VIEW_META_KEY];
  return view && typeof view === "object" ? (view as Record<string, unknown>) : (result.structuredContent ?? {});
}

export interface CardToolFacts {
  name: string;
  platform: string | null;
  summary: string;
  flags: string[];
  required: string[];
  notes: string;
  effect: string;
}

export function withCardAsks<T extends CardToolFacts>(facts: T[], extra: Record<string, { flags: string[]; required: string[]; title: string }>): CardToolFacts[] {
  const named = new Set(facts.map((fact) => fact.name));
  const out: CardToolFacts[] = facts.map((fact) => {
    const card = cardOfTool(fact.name);
    return card ? { ...fact, notes: [fact.notes, card.asks].filter(Boolean).join(" ") } : fact;
  });
  for (const card of CARDS)
    for (const tool of card.tools) {
      if (named.has(tool) || !extra[tool]) continue;
      out.push({ name: tool, platform: null, summary: extra[tool].title, flags: extra[tool].flags, required: extra[tool].required, notes: card.asks, effect: "read" });
    }
  return out;
}
