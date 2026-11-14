import { randomUUID } from "node:crypto";
import type { CallToolResult, ElicitRequestURLParams } from "@modelcontextprotocol/sdk/types.js";
import { viewerState } from "../../../browser/viewer/index.ts";
import { browserViewJson, browserViewLocation } from "../../../cli/browser/index.ts";
import type { BrowserViewLocation } from "../../../cli/browser/index.ts";
import { PLATFORM_LABELS } from "../../../cli/runner/helpers/platforms.ts";
import { signInText } from "../../../platformKit/signIn/index.ts";
import type { AccountNotConfigured, SignInResult } from "../../../platformKit/signIn/index.ts";
import { issueSignInLink, localConsoleOrigin, OWNER_REQUESTER } from "../../../platformKit/signInLink/index.ts";
import type { SignInLink } from "../../../platformKit/signInLink/index.ts";
import { uiCapable } from "../browserView/client.ts";
import { SIGN_IN_TOOL } from "./types.ts";
import type { SignInRung, SignInSurface } from "./types.ts";

type Answer = { ok?: unknown; signIn?: SignInResult; next?: unknown } & Partial<AccountNotConfigured>;

export function isSignInCall(name: string): boolean {
  return name === SIGN_IN_TOOL;
}

export function urlElicitationCapable(capabilities: unknown): boolean {
  const elicitation = (capabilities as { elicitation?: { url?: unknown } } | undefined)?.elicitation;
  return Boolean(elicitation && typeof elicitation.url === "object" && elicitation.url !== null);
}

export function signInRungOf(capabilities: unknown): SignInRung {
  if (uiCapable(capabilities)) return "app";
  if (urlElicitationCapable(capabilities)) return "url";
  return "text";
}

export function localSignInSurface(capabilities: unknown, send: (params: ElicitRequestURLParams) => Promise<{ action?: unknown }>, location: BrowserViewLocation = browserViewLocation()): SignInSurface {
  return { rung: signInRungOf(capabilities), location, requester: OWNER_REQUESTER, origin: localConsoleOrigin(), elicit: (url, message, elicitationId) => send({ mode: "url", url, message, elicitationId }) };
}

function answerOf(result: CallToolResult): Answer | null {
  const json = (result.structuredContent as { json?: unknown } | undefined)?.json;
  return json && typeof json === "object" && !Array.isArray(json) ? (json as Answer) : null;
}

function linkLine(link: SignInLink, platform: string): string {
  return `Open ${link.url} to finish signing in to ${platform}. The link works once, until ${link.expiresAt}, and only for the person who asked: the console page checks who is signed in to it.`;
}

function withText(result: CallToolResult, text: string, structured: Record<string, unknown>): CallToolResult {
  const rest = (result.content ?? []).slice(1);
  return { ...result, content: [{ type: "text", text }, ...rest], structuredContent: structured };
}

async function surfaced(answer: Answer & { signIn: SignInResult }, surface: SignInSurface): Promise<{ lines: string[]; extra: Record<string, unknown> }> {
  const signIn = answer.signIn;
  const label = PLATFORM_LABELS[signIn.platform];
  let link: SignInLink;
  try {
    link = issueSignInLink({ accountId: signIn.accountId, account: signIn.account, platform: signIn.platform }, surface.requester, surface.origin, surface.links);
  } catch {
    return { lines: [`No sign-in link could be made here (no console origin or no person to make it for). The owner signs in to ${label} in the account's browser in the workspace.`], extra: { signInSurface: "text" } };
  }
  const extra: Record<string, unknown> = { signInLink: link, signInSurface: surface.rung };
  if (surface.rung === "app") {
    try {
      extra.view = browserViewJson(await (surface.view ?? viewerState)(signIn.account), surface.location);
      return { lines: [`The live browser shows here: the owner signs in to ${label} in it.`, `Without the inline view: ${linkLine(link, label)}`], extra };
    } catch {
      extra.signInSurface = "text";
      return { lines: [linkLine(link, label)], extra };
    }
  }
  if (surface.rung === "url" && surface.elicit) {
    try {
      const asked = await surface.elicit(link.url, `Finish signing in to ${label} (${signIn.account}) in the log console.`, randomUUID());
      extra.elicitation = typeof asked?.action === "string" ? asked.action : "unknown";
      return { lines: [`The owner was asked to open the sign-in page (${String(extra.elicitation)}).`, linkLine(link, label)], extra };
    } catch {
      extra.signInSurface = "text";
    }
  }
  return { lines: [linkLine(link, label)], extra };
}

export async function signInCall(input: Record<string, unknown> | undefined, run: (input: Record<string, unknown>) => Promise<CallToolResult>, surface: SignInSurface): Promise<CallToolResult> {
  const asked = input?.json === true;
  const result = await run({ ...(input ?? {}), json: true });
  const answer = answerOf(result);
  if (!answer) return result;
  const structured = { ...((result.structuredContent ?? {}) as Record<string, unknown>) };
  let lines: string[] = [];
  let json: Record<string, unknown> = { ...answer };
  if (answer.signIn) {
    lines = [signInText(answer.signIn)];
    if (answer.signIn.state === "waitingForOwner" && surface.location === "remote") {
      const shown = await surfaced(answer as Answer & { signIn: SignInResult }, surface);
      lines.push(...shown.lines.map((line) => `  ${line}`));
      json = { ...json, ...shown.extra };
    }
  } else if (answer.error === "accountNotConfigured" && answer.next) {
    lines = [`accountNotConfigured: ${answer.next.says}`, ...(answer.next.cli ? [`  ${answer.next.cli}`] : [])];
  } else {
    return result;
  }
  const { view, ...forJson } = json;
  const stdout = asked ? JSON.stringify(forJson, null, 2) : lines.join("\n");
  return withText(result, stdout, { ...structured, stdout, json: forJson, ...(view === undefined ? {} : { view }) });
}
