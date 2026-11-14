import { timingSafeEqual } from "node:crypto";
import { existsSync, readFileSync, watch } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { CallToolRequestSchema, ElicitResultSchema, ListResourcesRequestSchema, ListToolsRequestSchema, ReadResourceRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { COMMANDS, defaultSendInspect, runCli } from "../../cli/runner/index.ts";
import type { CommandContext } from "../../cli/runner/types.ts";
import { setLogSink } from "../../observability/processLog/index.ts";
import type { LogLine } from "../../observability/processLog/index.ts";
import type { ActiveCall } from "../../observability/timing/index.ts";
import { FLOWS_DIR, listFlows, loadFlow } from "../../browser/flow/index.ts";
import { browserViews } from "../../browser/inspect/index.ts";
import type { BrowserView } from "../../browser/inspect/index.ts";
import type { FlowDefinition } from "../../browser/flow/index.ts";
import { appendLiveLine, liveLogDir } from "../../observability/liveLog/index.ts";
import { msText, timeCall } from "../../observability/timing/index.ts";
import { accountOfArgv, appendProgress, busyJob, cancelRequested, DEFAULT_WAIT_MS, finishJob, MAX_WAIT_MS, startJob } from "../jobs/index.ts";
import type { JobRecord } from "../jobs/index.ts";
import { oauthFromEnv } from "../oauth/index.ts";
import type { OAuthServer } from "../oauth/index.ts";
import { activePlay, currentToolName, FLOW_LIVE_TOOL, forgetPlayScope, gatedToolOf, guideAnswer, handleOf, PLAY_HANDLE_FIELD, playMeta, playRefusal, actingAsOwnerTools, folderOfPlay, namedByPlay, platformOfTool, playGateMode, stepToolsOf, playScope, processPlayScope, renamedTool, touchPlay, withoutHandle, withPlayFooter, withRenamedNote } from "./helpers/index.ts";
import type { PlayScope } from "./helpers/index.ts";
import { codeOfText, isPlatform } from "../../cli/runner/helpers/index.ts";
import { flowRunInput, FLOW_RUN_TOOL } from "./helpers/index.ts";
import { CALL_TOOL, catalog, catalogTools, getAnswer, isCatalogTool, resolveCall, searchAnswer, SEARCH_TOOL } from "../catalog/index.ts";
import { AGENTS_URI, commandTools, CORE_GUIDE, flowArgv, flowOfTool, guardCall, GUIDE_TOOL, GUIDE_TOPICS, guideTool, listUseCases, readUseCase, withUseCases, hasShell, identityOf, legacyArgsTool, longRunning, parseEnvText, readGuide, SERVER_INSTRUCTIONS, toolsFromCommands, toolsFromFlows } from "./helpers/index.ts";
import type { LogStream } from "./helpers/index.ts";
import type { LogToolInput, ProgressLine, ResultIdentity, ToolResult } from "./types.ts";
import { RESULT_SIZE_META } from "./types.ts";
import { readConsoleEvents } from "../../observability/console/index.ts";
import { viewerState } from "../../browser/viewer/index.ts";
import { accountOfArgs, appTools, BROWSER_VIEW_TOOL, BROWSER_VIEW_URI, browserViewResource, httpLocation, isAppTool, readBrowserViewResource, runAppTool, settleLocation, uiCapable, withBrowserView, withBrowserViewUi } from "../apps/browserView/index.ts";
import { browserViewLocation } from "../../cli/browser/index.ts";
import { readReportResource, REPORT_TOOL, REPORT_URI, reportResource, reportTool, runReport, withReportUi } from "../apps/report/index.ts";
import { isSignInCall, localSignInSurface, signInCall } from "../apps/signIn/index.ts";

export * from "./helpers/index.ts";
export type { GuardResult, LogTool, LogToolInput } from "./types.ts";
export { MAX_RESULT_CHARS, NO_PROMPT, RESULT_SIZE_META, TERMINAL_ONLY, TOOL_RESULT_SCHEMA } from "./types.ts";

export type ReadBrowsers = () => BrowserView[];

function safeViews(read: ReadBrowsers): BrowserView[] {
  try {
    return read();
  } catch {
    return [];
  }
}

export function browserLines(views: BrowserView[]): string[] {
  const where = views.length
    ? `Browsers: ${views.map((v) => `${v.account} on ${v.url || "a page"} (step ${v.step})${v.state ? `, page state ${v.state.id}: ${v.state.what}` : v.failed ? ", its last step failed" : ", no known blocking state"}`).join("; ")}.`
    : "Browsers: none open.";
  const owner = views.find((v) => v.needsMatt)?.needsMatt;
  const next = views.find((v) => v.next)?.next;
  return [where, ...(owner ? [`Needs the owner: ${owner}`] : []), ...(next ? [`Next: call \`${next.tool}\` ${JSON.stringify(next.input)} (rule 79: a known state is resolved, never a reason to stop).`] : [])];
}

function withBrowsers(base: Omit<ToolResult, "browsers" | "next" | "needsMatt">, body: string, isError: boolean, read: ReadBrowsers, images: readonly ToolImage[] = []): CallToolResult {
  const views = safeViews(read);
  const result: ToolResult = { ...base, browsers: views, next: views.find((v) => v.next)?.next ?? null, needsMatt: views.find((v) => v.needsMatt)?.needsMatt ?? null };
  return { isError, content: [{ type: "text", text: [...browserLines(views), "", body].join("\n") }, ...images.map((image) => ({ type: "image" as const, data: image.data, mimeType: image.mimeType }))], structuredContent: result as unknown as Record<string, unknown> };
}

const NO_IDENTITY: ResultIdentity = { platform: null, capability: null };

function refused(message: string, code: string, read: ReadBrowsers, identity: ResultIdentity = NO_IDENTITY): CallToolResult {
  return withBrowsers({ exit: 1, ok: false, code, ...identity, stdout: "", stderr: message, log: [], progress: [] }, message, true, read);
}

function jsonOf(stdout: string): unknown {
  const text = stdout.trim();
  if (!text.startsWith("{") && !text.startsWith("[")) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export const PLAY_META = "log/play";

export const AGENTS_MD = fileURLToPath(new URL("../../../AGENTS.md", import.meta.url));

export type OnLogLine = (tool: string, stream: LogStream, line: string) => void;

const inFlight = new Set<(entry: LogLine) => void>();

export function savedFlows(): FlowDefinition[] {
  return listFlows().flatMap((name) => {
    const flow = loadFlow(name);
    return flow ? [flow] : [];
  });
}

export class JobCancelled extends Error {
  constructor(id: string) {
    super(`jobCancelled: job ${id} was stopped at its next browser step (jobCancel)`);
  }
}

interface Ran {
  base: Omit<ToolResult, "browsers" | "next" | "needsMatt">;
  text: string;
  cancelled: boolean;
  images: ToolImage[];
}

export interface ToolImage {
  data: string;
  mimeType: string;
}

function runGuarded(name: string, argv: string[], context: Partial<CommandContext>, onLine: OnLogLine, progress: ProgressLine[], job: JobRecord | null, identity: ResultIdentity, signal?: AbortSignal): Promise<Ran> {
  return timeCall(name, (call) => runTimed(name, argv, context, onLine, progress, job, call, identity, signal), { account: accountOfArgv(argv) || undefined, job: job?.id });
}

async function runTimed(name: string, argv: string[], context: Partial<CommandContext>, onLine: OnLogLine, progress: ProgressLine[], job: JobRecord | null, call: ActiveCall, identity: ResultIdentity, signal?: AbortSignal): Promise<Ran> {
  const began = performance.now();
  let kept: JobRecord | null = null;
  const out: string[] = [];
  const err: string[] = [];
  const processLog: string[] = [];
  const images: ToolImage[] = [];
  const note = (source: string, line: string) => {
    const entry = { at: new Date().toISOString(), source, line };
    progress.push(entry);
    const holder = job ?? kept;
    if (holder) appendProgress(holder.id, entry);
  };
  const clientCancelled = () => {
    call.attrs.cancelledByClient = true;
    const after = msText(performance.now() - began);
    if (job) {
      onLine(name, "err", `✕ the client cancelled call ${call.callId} after ${after}: job ${job.id} keeps running to its end; follow it with jobStatus { jobId: "${job.id}" }`);
      return;
    }
    kept = startJob({ tool: name, argv, account: accountOfArgv(argv), live: commandOfTool(name)?.live ?? false });
    call.attrs.keptAsJob = kept.id;
    for (const line of progress) appendProgress(kept.id, line);
    onLine(name, "err", `✕ the client cancelled call ${call.callId} after ${after}: it runs to its end so nothing is left half done, and its answer is kept as job ${kept.id}; read it with jobStatus { jobId: "${kept.id}" }`);
  };
  if (signal?.aborted) clientCancelled();
  else signal?.addEventListener("abort", clientCancelled, { once: true });
  const fromProcess = (entry: LogLine) => {
    processLog.push(entry.line);
    note(entry.source, entry.line);
    onLine(name, entry.source, entry.line);
  };
  const send = context.sendInspect ?? defaultSendInspect;
  setLogSink((entry) => inFlight.forEach((listener) => listener(entry)));
  inFlight.add(fromProcess);
  onLine(name, "out", `▶ log ${argv.join(" ")}${job ? `  (job ${job.id})` : ""}  (call ${call.callId})`);
  let code: number;
  let refusal: string | null = null;
  let cancelled = false;
  try {
    code = await runCli(argv, {
      ...context,
      refused: (said) => {
        refusal ??= said;
      },
      ...(job
        ? {
            cancelled: () => cancelRequested(job.id),
            sendInspect: (current, action, args, timeoutMs, expect, options) => {
              if (action !== "stop" && cancelRequested(job.id)) throw new JobCancelled(job.id);
              return send(current, action, args, timeoutMs, expect, options);
            },
          }
        : {}),
      out: (line) => {
        out.push(line);
        note("out", line);
        onLine(name, "out", line);
      },
      err: (line) => {
        err.push(line);
        note("err", line);
        onLine(name, "err", line);
      },
      image: (data, mimeType) => {
        images.push({ data, mimeType });
      },
    });
  } catch (error) {
    cancelled = error instanceof JobCancelled;
    err.push(error instanceof Error ? error.message : String(error));
    refusal = cancelled ? "commandFailed" : "crashed";
    code = 1;
  } finally {
    signal?.removeEventListener("abort", clientCancelled);
    inFlight.delete(fromProcess);
    if (inFlight.size === 0) setLogSink(null);
  }
  if (job && !cancelled && code !== 0 && cancelRequested(job.id)) cancelled = true;
  call.attrs.exit = code;
  const keptJob = kept as JobRecord | null;
  onLine(name, "out", `■ exit ${code} in ${msText(performance.now() - began)} (call ${call.callId}: timing { call: "${call.callId}" } shows where the time went)${keptJob ? `; the client had cancelled it, so its answer is job ${keptJob.id}` : ""}`);
  const text = [out.join("\n"), processLog.length ? `log:\n${processLog.join("\n")}` : "", err.length ? `stderr:\n${err.join("\n")}` : "", `exit ${code}`].filter(Boolean).join("\n\n");
  const stdout = out.join("\n");
  const json = jsonOf(stdout);
  if (keptJob) finishJob(keptJob.id, code === 0 ? "completed" : "failed", { exit: code, ok: code === 0, stdout, stderr: err.join("\n"), cancelledByClient: true }, text);
  const failed = code === 0 ? null : (refusal ?? "commandFailed");
  return { base: { exit: code, ok: code === 0, code: failed, ...identity, stdout, stderr: err.join("\n"), log: processLog, progress, ...(json === undefined ? {} : { json }) }, text, cancelled, images };
}

function commandOfTool(name: string) {
  return commandTools(COMMANDS).find((t) => t.tool === name) ?? null;
}

function flowIdentity(flow: FlowDefinition): ResultIdentity {
  return { platform: isPlatform(flow.platform) ? flow.platform : null, capability: "flow.run" };
}

export function waitOf(input: LogToolInput | undefined): number {
  const asked = input?.waitMs;
  return typeof asked === "number" && Number.isFinite(asked) ? Math.min(Math.max(0, asked), MAX_WAIT_MS) : DEFAULT_WAIT_MS;
}

export async function runToolCall(
  name: string,
  input: LogToolInput | undefined,
  context: Partial<CommandContext> = {},
  onLine: OnLogLine = () => {},
  readBrowsers: ReadBrowsers = browserViews,
  signal?: AbortSignal,
  appCaller: boolean = browserViewLocation() === "remote",
  scope: PlayScope = processPlayScope(),
  shell: boolean = true,
): Promise<CallToolResult> {
  const handle = handleOf(input);
  const given = withoutHandle(input);
  const again = (tool: string, next: LogToolInput | undefined, app: boolean = appCaller) => runToolCall(tool, handle && next ? { ...next, [PLAY_HANDLE_FIELD]: handle } : next, context, onLine, readBrowsers, signal, app, scope, shell);
  if (renamedTool(name)) return withRenamedNote(name, await again(currentToolName(name), input));
  if (isAppTool(name)) return runAppTool(name, given, appCaller);
  if (name === REPORT_TOOL) return runReport(given, appCaller);
  if (name === GUIDE_TOOL) {
    const answer = guideAnswer(input, scope, shell);
    const play = answer.play === undefined ? undefined : playMeta(answer.play);
    return { ...(answer.isError ? { isError: true } : {}), content: [{ type: "text", text: answer.text }], ...(play === undefined ? {} : { _meta: { [PLAY_META]: play } }) };
  }
  if (isCatalogTool(name)) {
    const entries = catalog(COMMANDS, savedFlows());
    if (name === CALL_TOOL) {
      const target = resolveCall(entries, given);
      if (!target.ok) return refused(target.message, "inputInvalid", readBrowsers);
      return again(target.tool, target.input, false);
    }
    const answer = name === SEARCH_TOOL ? searchAnswer(entries, given) : getAnswer(entries, given);
    return withBrowsers({ exit: answer.ok ? 0 : 1, ok: answer.ok, code: answer.ok ? null : "inputInvalid", ...NO_IDENTITY, stdout: answer.text, stderr: answer.ok ? "" : answer.text, log: [], progress: [], json: answer.json }, answer.text, !answer.ok, readBrowsers);
  }
  const { waitMs, ...fields } = given ?? {};
  const flows = savedFlows();
  const gate = (tool: string) => {
    const play = activePlay(scope, handle);
    const pages = listUseCases([tool]);
    const platform = platformOfTool(tool, COMMANDS, flows);
    const mode = playGateMode(tool, actingAsOwnerTools(COMMANDS, flows), pages, platform);
    const refusal = playRefusal(tool, { mode, platform, useCases: pages.filter((u) => namedByPlay(tool, stepToolsOf([u])) || (platform !== null && folderOfPlay(u.id) === platform)).map((u) => u.id), play });
    if (!refusal) touchPlay(play);
    return refusal;
  };
  const flowCall = flowOfTool(flows, name);
  if (flowCall) {
    const built = flowRunInput(flowCall.flow, fields as Record<string, unknown>, flowCall.live);
    if (!built.ok) return refused(built.message, "inputInvalid", readBrowsers, flowIdentity(flowCall.flow));
    const ran = await again(flowCall.live ? FLOW_LIVE_TOOL : FLOW_RUN_TOOL, { ...built.input, confirmLive: fields.confirmLive, confirmBypass: fields.confirmBypass, ...(waitMs === undefined ? {} : { waitMs }) });
    return ran.structuredContent ? { ...ran, structuredContent: { ...ran.structuredContent, ...flowIdentity(flowCall.flow) } } : ran;
  }
  const guard = guardCall(name, given === undefined ? undefined : fields, COMMANDS);
  const entry = commandOfTool(name) ?? legacyArgsTool(currentToolName(name), COMMANDS);
  const identity = entry ? identityOf(entry, guard.ok ? guard.argv : []) : NO_IDENTITY;
  if (!guard.ok) return refused(guard.message, guard.code, readBrowsers, identity);
  const noPlay = gate(gatedToolOf(name, fields as Record<string, unknown>, flows));
  if (noPlay) return refused(noPlay, codeOfText(noPlay), readBrowsers, identity);
  const progress: ProgressLine[] = [];
  const noted = (result: CallToolResult): CallToolResult => (guard.note ? { ...result, content: [...(result.content ?? []), { type: "text" as const, text: guard.note }] } : result);
  if (!entry || !longRunning(entry.command)) {
    const ran = await runGuarded(name, guard.argv, context, onLine, progress, null, identity, signal);
    const answered = noted(withBrowsers(ran.base, ran.text, ran.base.exit !== 0, readBrowsers, ran.images));
    return name === BROWSER_VIEW_TOOL ? withViewer(answered, input) : answered;
  }
  const account = accountOfArgv(guard.argv);
  const holder = busyJob(account);
  if (holder) return refused(`accountBusy: job ${holder.id} (${holder.tool}) holds ${account}, started ${holder.startedAt}. Follow it with jobStatus { jobId: "${holder.id}" }, or stop it with jobCancel (rule 35).`, "accountBusy", readBrowsers, identity);
  const job = startJob({ tool: name, argv: guard.argv, account, live: entry.live });
  const run = runGuarded(name, guard.argv, context, onLine, progress, job, identity, signal).then((ran) => {
    const status = ran.cancelled ? "cancelled" : ran.base.exit === 0 ? "completed" : "failed";
    const done = withBrowsers({ ...ran.base, job: { id: job.id, status, afterLine: progress.length } }, ran.text, ran.base.exit !== 0, readBrowsers);
    finishJob(job.id, status, done.structuredContent as Record<string, unknown>, (done.content as { text: string }[])[0].text);
    return noted(done);
  });
  const wait = waitOf(input);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const finished = await Promise.race([run, new Promise<null>((resolve) => (timer = setTimeout(() => resolve(null), wait)))]);
  clearTimeout(timer);
  if (finished) return finished;
  const running = `Still running as job ${job.id} (${name}). Follow it with jobStatus { jobId: "${job.id}", afterLine: ${progress.length} } (it waits for new lines), stop it at its next browser step with jobCancel { jobId: "${job.id}" }. Lines so far:\n${progress.map((p) => `${p.at.slice(11, 19)}  ${p.line}`).join("\n") || "(none yet)"}`;
  return withBrowsers({ exit: -1, ok: false, code: null, ...identity, stdout: "", stderr: "", log: [], progress: [...progress], job: { id: job.id, status: "running", afterLine: progress.length } }, running, false, readBrowsers);
}

export function withCallFooter(name: string, input: LogToolInput | undefined, result: CallToolResult, scope: PlayScope = processPlayScope()): CallToolResult {
  if (name === GUIDE_TOOL || name === REPORT_TOOL) return result;
  const target = name === CALL_TOOL ? resolveCall(catalog(COMMANDS, savedFlows()), withoutHandle(input)) : null;
  return withPlayFooter(target?.ok ? target.tool : currentToolName(name), result, activePlay(scope, handleOf(input)));
}

async function withViewer(result: CallToolResult, input: LogToolInput | undefined): Promise<CallToolResult> {
  const account = accountOfArgs(input);
  if (result.isError || !account) return result;
  try {
    return withBrowserView(result, await viewerState(account));
  } catch {
    return result;
  }
}

export interface LogMcpOptions {
  logDir?: string | null;
  playOwner?: string;
  watchFlows?: boolean;
  readBrowsers?: ReadBrowsers;
}

export function createLogMcpServer(context: Partial<CommandContext> = {}, options: LogMcpOptions = {}): Server {
  const server = new Server(
    { name: "log", version: "0.1.0" },
    { capabilities: { tools: { listChanged: true }, logging: {}, resources: {} }, instructions: SERVER_INSTRUCTIONS },
  );
  const logDir = options.logDir === undefined ? liveLogDir() : options.logDir;
  const scope = options.playOwner ? playScope(options.playOwner) : processPlayScope();
  const onLine: OnLogLine = (tool, stream, line) => {
    if (logDir) appendLiveLine(logDir, tool, stream, line);
    server.sendLoggingMessage({ level: stream === "err" ? "warning" : "info", logger: `log.${tool}.${stream}`, data: line }).catch(() => {});
  };
  server.oninitialized = () => {
    const client = server.getClientVersion();
    onLine("mcp", "out", `client ${client?.name ?? "unknown"} ${client?.version ?? ""}: ${hasShell(client?.name) ? "has a shell, so long tools say to Monitor the live log" : "no shell, so long tools say to read each result's progress and browsers"}`);
  };
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const shell = hasShell(server.getClientVersion()?.name);
    const tools = [...toolsFromCommands(COMMANDS, { shell }), ...toolsFromFlows(savedFlows(), { shell })];
    const listed = [guideTool(), ...catalogTools(), ...withUseCases(tools, listUseCases(tools.map((t) => t.name)))];
    const capable = uiCapable(server.getClientCapabilities());
    const sized = listed.map((tool) => ({ ...tool, _meta: { ...RESULT_SIZE_META } as Record<string, unknown> }));
    const report = { ...reportTool(), _meta: { ...RESULT_SIZE_META } as Record<string, unknown> };
    return { tools: capable ? [...sized.map(withBrowserViewUi), withReportUi(report), ...appTools()] : [...sized, report] };
  });
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [
      { uri: AGENTS_URI, name: "AGENTS.md", description: "The owner's rules for log-cli, every one numbered and dated, the newest at the bottom. Every tool's description cites the ones it falls under.", mimeType: "text/markdown" },
      ...(uiCapable(server.getClientCapabilities()) ? [browserViewResource(), reportResource()] : []),
    ],
  }));
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    if (request.params.uri === BROWSER_VIEW_URI) return readBrowserViewResource();
    if (request.params.uri === REPORT_URI) return readReportResource();
    if (request.params.uri !== AGENTS_URI) throw new Error(`No resource ${request.params.uri} (the resources are ${AGENTS_URI}, ${BROWSER_VIEW_URI} and ${REPORT_URI})`);
    return { contents: [{ uri: AGENTS_URI, mimeType: "text/markdown", text: readFileSync(AGENTS_MD, "utf8") }] };
  });
  server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
    const input = request.params.arguments as LogToolInput | undefined;
    const run = (given: LogToolInput | undefined) => runToolCall(request.params.name, given, context, onLine, options.readBrowsers ?? browserViews, extra.signal, uiCapable(server.getClientCapabilities()), scope, hasShell(server.getClientVersion()?.name));
    const result = isSignInCall(request.params.name) ? await signInCall(input, run, localSignInSurface(server.getClientCapabilities(), (params) => extra.sendRequest({ method: "elicitation/create", params }, ElicitResultSchema))) : await run(input);
    return withCallFooter(request.params.name, input, result, scope);
  });
  if (options.playOwner) {
    const owner = options.playOwner;
    const close = server.onclose;
    server.onclose = () => {
      forgetPlayScope(owner);
      close?.();
    };
  }
  if (options.watchFlows !== false && existsSync(FLOWS_DIR)) {
    let pending: ReturnType<typeof setTimeout> | null = null;
    try {
      const watcher = watch(FLOWS_DIR, () => {
        if (pending) clearTimeout(pending);
        pending = setTimeout(() => server.sendToolListChanged().catch(() => {}), 300);
      });
      const close = server.onclose;
      server.onclose = () => {
        watcher.close();
        close?.();
      };
    } catch {
    }
  }
  return server;
}

function loadEnv(root: string): void {
  process.chdir(root);
  const envPath = join(root, ".env.local");
  if (existsSync(envPath)) {
    for (const [key, value] of Object.entries(parseEnvText(readFileSync(envPath, "utf8")))) process.env[key] ??= value;
  }
}

export async function startLogMcpServer(root: string): Promise<void> {
  loadEnv(root);
  console.log = console.error;
  console.info = console.error;
  settleLocation("local");
  await createLogMcpServer().connect(new StdioServerTransport());
}

export interface LogMcpHttpOptions {
  host?: string;
  port?: number;
  token?: string | null;
  oauth?: OAuthServer | null;
  context?: Partial<CommandContext>;
  server?: LogMcpOptions;
}

const LOOPBACK = new Set(["127.0.0.1", "localhost", "::1"]);

function authorized(request: Request, token: string | null, oauth: OAuthServer | null): boolean {
  if (!token && !oauth) return true;
  const given = /^Bearer (.+)$/.exec(request.headers.get("authorization") ?? "")?.[1] ?? "";
  if (!given) return false;
  if (token) {
    const a = Buffer.from(given);
    const b = Buffer.from(token);
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }
  return oauth ? oauth.verifyBearer(given) : false;
}

export function serveLogMcpHttp(options: LogMcpHttpOptions = {}): { url: string; stop: () => void } {
  const host = options.host ?? "127.0.0.1";
  const token = options.token ?? null;
  const oauth = options.oauth ?? null;
  if (!LOOPBACK.has(host) && !token && !oauth) throw new Error(`log MCP over HTTP on ${host} needs a token or OAuth: set LOG_MCP_TOKEN, or LOG_MCP_PUBLIC_URL with Twenty (only loopback runs without one)`);
  const sessions = new Map<string, WebStandardStreamableHTTPServerTransport>();
  const server = Bun.serve({
    hostname: host,
    port: options.port ?? 7337,
    async fetch(request) {
      const url = new URL(request.url);
      if (url.pathname === "/api/console/events") {
        const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
        if (!token || !authorized(request, token, null)) return Response.json({ error: "consoleWorkspaceAccessDenied" }, { status: 401, headers });
        if (request.method !== "GET") return Response.json({ error: "consoleMethodNotAllowed" }, { status: 405, headers: { ...headers, Allow: "GET" } });
        try {
          return Response.json(readConsoleEvents(), { headers });
        } catch {
          return Response.json({ error: "consoleWorkspaceUnavailable" }, { status: 503, headers });
        }
      }
      if (oauth) {
        const answered = await oauth.handle(request);
        if (answered) return answered;
      }
      if (url.pathname !== "/mcp") return new Response("Not found: the MCP endpoint is /mcp", { status: 404 });
      if (!authorized(request, token, oauth)) return oauth ? oauth.unauthorized() : new Response("Unauthorized", { status: 401, headers: { "WWW-Authenticate": "Bearer" } });
      const id = request.headers.get("mcp-session-id");
      let transport = id ? sessions.get(id) : undefined;
      if (id && !transport) return Response.json({ jsonrpc: "2.0", error: { code: -32001, message: "Session not found: initialize again" }, id: null }, { status: 404 });
      if (!transport) {
        const fresh: WebStandardStreamableHTTPServerTransport = new WebStandardStreamableHTTPServerTransport({
          sessionIdGenerator: () => crypto.randomUUID(),
          onsessioninitialized: (sessionId) => void sessions.set(sessionId, fresh),
          onsessionclosed: (sessionId) => void sessions.delete(sessionId),
          enableDnsRebindingProtection: !LOOPBACK.has(host) || oauth !== null,
          allowedHosts: [...(LOOPBACK.has(host) ? ["127.0.0.1", "localhost", "[::1]"].flatMap((h) => [h, `${h}:${server.port}`]) : [host, `${host}:${server.port}`]), ...(oauth ? [oauth.publicHost] : [])],
        });
        await createLogMcpServer(options.context ?? {}, { ...(options.server ?? {}), playOwner: `http:${crypto.randomUUID()}` }).connect(fresh);
        transport = fresh;
      }
      return transport.handleRequest(request);
    },
  });
  return { url: `http://${host}:${server.port}/mcp`, stop: () => server.stop(true) };
}

export async function startLogMcpHttp(root: string, options: { host?: string; port?: number }): Promise<void> {
  loadEnv(root);
  const oauth = oauthFromEnv();
  settleLocation(httpLocation(options.host ?? "127.0.0.1", Boolean(process.env.LOG_MCP_TOKEN || oauth)));
  const served = serveLogMcpHttp({ ...options, token: process.env.LOG_MCP_TOKEN || null, oauth });
  const how = [process.env.LOG_MCP_TOKEN ? "the static bearer token" : "", oauth ? `OAuth through Twenty, resource ${oauth.resource}` : ""].filter(Boolean).join(" or ") || "loopback, no token";
  console.error(`log MCP over HTTP: ${served.url} (${how})`);
  await new Promise(() => {});
}
