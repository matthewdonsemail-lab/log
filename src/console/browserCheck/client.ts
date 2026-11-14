import { ViewerError, viewerFrame, viewerInput, viewerState } from "../../browser/viewer/index.ts";
import type { ViewerView } from "../../browser/viewer/index.ts";
import { browserViewLocation } from "../../cli/browser/index.ts";
import { localAccountsPath, readLocalAccounts } from "../../twenty/graphql/index.ts";
import { credentialValue } from "../connections/index.ts";
import type { ConnectionAccount } from "../connections/index.ts";
import { recordCheck } from "../accountCheck/index.ts";
import { PLATFORM_SITES } from "../../cli/runner/helpers/platforms.ts";
import { sessionGate } from "../../platformKit/sessionCheck/index.ts";
import { db } from "../../inbox/store/index.ts";
import { deleteState, getState, putState } from "../../storage/state/index.ts";
import { BROWSER_ACTIONS, VERIFIED_FOR_MS } from "./types.ts";
import type { BrowserAction, BrowserCheckFrame, BrowserCheckPhase, BrowserCheckView, BrowserToolCaller } from "./types.ts";

type Env = Record<string, string | undefined>;
type Proof = { generation: string; revision: string; at: number };

const PROOF_SCOPE = "browserCheckProof" as const;

function proofOf(accountId: string): Proof | null {
  return getState<Proof>(PROOF_SCOPE, accountId, {}, db())?.body ?? null;
}

function keepProof(accountId: string, proof: Proof): void {
  putState(PROOF_SCOPE, accountId, proof, proof.at, db());
}

function dropProof(accountId: string): void {
  deleteState(PROOF_SCOPE, accountId, db());
}
const GOAL = "Check the account's browser from the console and sign it in where the page asks";

export const browserCheckDeps: { state: typeof viewerState; frame: typeof viewerFrame; input: typeof viewerInput; now: () => number; record: (accountId: string, state: "signedIn") => void } = {
  state: viewerState,
  frame: viewerFrame,
  input: viewerInput,
  now: () => Date.now(),
  record: (accountId, state) => recordCheck(accountId, state),
};

function rowOf(account: ConnectionAccount, env: Env): Record<string, unknown> | null {
  return readLocalAccounts(localAccountsPath(env)).find((row) => String(row.platform ?? "").toLowerCase().replace(/^x$/, "twitter") === account.platform && String(row.accountName ?? row.name ?? "").toLowerCase() === account.name.toLowerCase()) ?? null;
}

function hasLogin(row: Record<string, unknown> | null): boolean {
  return Boolean(row && typeof row.email === "string" && row.email && typeof row.password === "string" && row.password);
}

function missingPhase(account: ConnectionAccount, env: Env): { phase: BrowserCheckPhase; reason: { code: string; message: string } | null } {
  if (!PLATFORM_SITES[account.platform].browser) return { phase: "browserMissing", reason: null };
  const row = rowOf(account, env);
  const driver = String(row?.browserDriver ?? "").trim();
  const adsPower = driver === "adsPower" || (!driver && Boolean(row?.adsPowerProfileId)) || (!driver && (env.LOG_BROWSER_DRIVER ?? "") === "adsPower");
  if (adsPower && !credentialValue("ADSPOWER_HOST", env) && !credentialValue("ADSPOWER_API_KEY", env)) return { phase: "providerSetupRequired", reason: { code: "providerNotConfigured", message: "Configure AdsPower in Extensions before opening this account's browser." } };
  if (adsPower && !row?.adsPowerProfileId) return { phase: "profileRequired", reason: { code: "accountProfileMissing", message: "This account has no AdsPower profile yet. Preparing its profile is the next step." } };
  return { phase: "browserMissing", reason: null };
}

function base(account: ConnectionAccount, viewer: ViewerView | null): BrowserCheckView {
  return {
    accountId: account.id,
    account: account.name,
    phase: "browserMissing",
    location: browserViewLocation(),
    viewerId: viewer?.generation ?? null,
    generation: viewer?.generation ?? null,
    revision: viewer?.revision ?? null,
    pageState: viewer?.pageState ?? null,
    address: viewer?.address ?? null,
    width: viewer?.width ?? null,
    height: viewer?.height ?? null,
    canInteract: false,
    canResolve: false,
    canComplete: false,
    canNavigate: false,
    canGoBack: false,
    stream: viewer?.stream ?? null,
    reason: null,
  };
}

export async function browserCheckView(account: ConnectionAccount, env: Env = process.env): Promise<BrowserCheckView> {
  const viewer = await browserCheckDeps.state(account.name);
  const view = base(account, viewer);
  if (viewer.phase === "browserMissing") return { ...view, ...missingPhase(account, env) };
  if (viewer.phase === "viewerUnavailable") return { ...view, phase: "viewerUnavailable", reason: { code: "viewerUnavailable", message: "This running browser has no live view. It has been left open." } };
  if (viewer.phase === "busy") return { ...view, phase: "busy" };
  if (viewer.phase === "needsAttention") return { ...view, phase: "needsAttention", canNavigate: true, canGoBack: true, reason: { code: "needsPerson", message: "This page needs a person. Input stays off and the run is stopped." } };
  const navigable = { canNavigate: true, canGoBack: true };
  if (viewer.phase === "signInRequired") return { ...view, ...navigable, phase: "signInRequired", canInteract: true, canResolve: hasLogin(rowOf(account, env)) };
  const proof = proofOf(account.id);
  if (proof && proof.generation === viewer.generation && proof.revision === viewer.revision && browserCheckDeps.now() - proof.at < VERIFIED_FOR_MS) return { ...view, ...navigable, phase: "verified", canComplete: true };
  return { ...view, ...navigable, phase: "ready" };
}

function confirmed(answer: { isError?: boolean; structuredContent?: unknown }): void {
  const content = (answer.structuredContent ?? {}) as { ok?: unknown; job?: unknown };
  if (answer.isError || content.ok === false) throw new Error("browserOperationRefused");
}

export async function openBrowser(account: ConnectionAccount, callTool: BrowserToolCaller, env: Env = process.env): Promise<BrowserCheckView> {
  const gate = sessionGate(account, { openedByOwner: true });
  if (!gate.ok) throw new Error(gate.code);
  const before = await browserCheckView(account, env);
  if (before.phase !== "browserMissing") return before;
  confirmed(await callTool("inspectStart", { account: account.name, detach: true, goal: GOAL, waitMs: 50000, ...(account.platform === "facebook" ? { url: "https://www.facebook.com/" } : {}) }));
  return browserCheckView(account, env);
}

function sameView(before: BrowserCheckView, input: { generation?: unknown; revision?: unknown }): void {
  if (typeof input.generation === "string" && input.generation !== before.generation) throw new Error("browserGenerationChanged");
  if (typeof input.revision === "string" && before.revision && input.revision !== before.revision) throw new Error("browserStateChanged");
}

export async function actOnBrowser(account: ConnectionAccount, action: unknown, input: { generation?: unknown; revision?: unknown; confirmLive?: unknown }, callTool: BrowserToolCaller, env: Env = process.env): Promise<BrowserCheckView> {
  if (!(BROWSER_ACTIONS as readonly unknown[]).includes(action)) throw new Error("browserInputInvalid");
  const step = action as BrowserAction;
  const before = await browserCheckView(account, env);
  if (step === "linkProfile") {
    if (before.phase !== "profileRequired") return before;
    if (input.confirmLive !== true) throw new Error("liveNotConfirmed");
    confirmed(await callTool("adsPowerSyncLive", { account: account.name, json: true, confirmLive: input.confirmLive }));
    return browserCheckView(account, env);
  }
  if (before.phase === "busy") throw new Error("browserBusy");
  if (!before.generation) throw new Error("browserMissing");
  sameView(before, input);
  if (step === "back" || step === "reload") {
    if (!before.canNavigate || (step === "reload" && !before.address)) throw new Error("browserInputStopped");
    confirmed(await callTool("inspectDo", { account: account.name, action: step === "back" ? "back" : "goto", ...(step === "reload" ? { values: [before.address] } : {}), goal: GOAL, json: true, waitMs: 50000 }));
    return browserCheckView(account, env);
  }
  if (step === "resolve") {
    if (!before.canResolve) throw new Error("browserCheckUnresolved");
    if (input.confirmLive !== true) throw new Error("liveNotConfirmed");
    confirmed(await callTool("inspectDoLive", { account: account.name, action: "signIn", confirmLive: input.confirmLive, goal: GOAL, json: true, waitMs: 50000 }));
    return browserCheckView(account, env);
  }
  if (!["ready", "verified", "signInRequired"].includes(before.phase)) throw new Error("browserInputStopped");
  confirmed(await callTool("inspectDo", { account: account.name, action: "snapshot", goal: GOAL, json: true, waitMs: 50000 }));
  const after = await browserCheckView(account, env);
  if (after.phase === "ready" && after.generation && after.revision) {
    keepProof(account.id, { generation: after.generation, revision: after.revision, at: browserCheckDeps.now() });
    return browserCheckView(account, env);
  }
  return after;
}

export async function saveBrowserState(account: ConnectionAccount, input: { generation?: unknown; revision?: unknown }, callTool: BrowserToolCaller, env: Env = process.env): Promise<BrowserCheckView> {
  const before = await browserCheckView(account, env);
  sameView(before, input);
  if (before.phase !== "verified" || !before.canComplete) throw new Error("browserCheckUnresolved");
  confirmed(await callTool("inspectDo", { account: account.name, action: "saveState", goal: GOAL, json: true, waitMs: 50000 }));
  browserCheckDeps.record(account.id, "signedIn");
  dropProof(account.id);
  return { ...(await browserCheckView(account, env)), phase: "verified", canComplete: true };
}

export async function closeBrowser(account: ConnectionAccount, callTool: BrowserToolCaller, env: Env = process.env): Promise<BrowserCheckView> {
  const before = await browserCheckView(account, env);
  if (!before.generation) return before;
  confirmed(await callTool("inspectDo", { account: account.name, action: "stop", goal: GOAL, json: true, waitMs: 50000 }));
  dropProof(account.id);
  return browserCheckView(account, env);
}

export async function browserCheckFrame(account: ConnectionAccount, generation: unknown): Promise<BrowserCheckFrame> {
  return browserCheckDeps.frame(account.name, generation);
}

export async function sendBrowserInput(account: ConnectionAccount, input: { generation?: unknown; revision?: unknown; event?: unknown }, env: Env = process.env): Promise<BrowserCheckView> {
  await browserCheckDeps.input(account.name, { generation: input.generation, revision: input.revision, event: input.event });
  return browserCheckView(account, env);
}

export function browserErrorCode(error: unknown): string | null {
  return error instanceof ViewerError ? error.code : null;
}
