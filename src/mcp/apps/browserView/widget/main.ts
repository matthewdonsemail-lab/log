import { App, applyDocumentTheme, applyHostStyleVariables } from "@modelcontextprotocol/ext-apps";
import type { McpUiHostContext } from "@modelcontextprotocol/ext-apps";
import { connectVoxl, voxlSupported } from "./voxl.ts";
import type { VoxlConnection, VoxlStream } from "./voxl.ts";

type Phase = "browserMissing" | "viewerUnavailable" | "signInRequired" | "needsAttention" | "busy" | "ready";
interface View {
  account: string;
  phase: Phase;
  needsHuman: boolean;
  generation: string | null;
  revision: string | null;
  pageState: string | null;
  address: string | null;
  width: number | null;
  height: number | null;
  canInteract: boolean;
  location: "local" | "remote";
  streamKind: "voxl" | "frames" | "none";
}
type Input = { type: "click"; x: number; y: number } | { type: "text"; text: string } | { type: "key"; key: string } | { type: "scroll"; deltaY: number };
interface ToolAnswer {
  isError?: boolean;
  structuredContent?: Record<string, unknown>;
  _meta?: Record<string, unknown>;
}

const KEYS = ["Enter", "Tab", "Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Escape", "Home", "End"];
const TITLES: Record<Phase, string> = { browserMissing: "No browser is open", viewerUnavailable: "Browser view unavailable", signInRequired: "Sign in here", needsAttention: "This page needs a person", busy: "The browser is working", ready: "Signed in" };
const NOTES: Record<Phase, string> = {
  browserMissing: "Ask the agent to open this account's browser, then it shows here.",
  viewerUnavailable: "The browser is open, but its view could not be reached. Nothing was sent to the page.",
  signInRequired: "Click a field in the page and type. Your clicks and keys go to this account's browser, each one a recorded step.",
  needsAttention: "This page is a stop: input is off. Clear it yourself, then tell the agent.",
  busy: "The browser is running a step. It shows here in a moment.",
  ready: "The page no longer asks for sign-in. Press Done so the agent carries on.",
};
const ERRORS: Record<string, string> = {
  browserStateChanged: "The page changed before your input, so it was not sent.",
  browserInputStopped: "The page no longer asks for sign-in, so input is off.",
  browserBusy: "The browser is running another step. Try again in a moment.",
  browserGenerationChanged: "The account's browser was restarted.",
  browserViewerUnavailable: "The browser view could not be reached.",
  browserInputInvalid: "That input was rejected.",
  browserInputFailed: "That input failed in the browser.",
  browserMissing: "No browser is open for this account.",
};
const ICON = {
  screen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
  expand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  shrink: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>',
  pip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><rect x="12" y="11" width="7" height="6" rx="1"/></svg>',
  pointer: '<svg viewBox="0 0 24 24" width="14" height="14" fill="#2A8CFF"><path d="M5 3l14 7-6 2-2 6z"/></svg>',
};

const root = document.getElementById("app") as HTMLElement;
root.innerHTML = `
<div class="head">
  <div class="bar">
    <span class="mark">${ICON.screen}</span>
    <span class="who"><strong data-ref="title">Live browser</strong><span data-ref="account">Waiting for the agent…</span></span>
    <span class="pill" data-ref="pill"><i></i><span data-ref="pillText">Connecting</span></span>
    <button class="icon" data-ref="pip" type="button" title="Picture in picture" aria-label="Picture in picture" hidden>${ICON.pip}</button>
    <button class="icon" data-ref="full" type="button" title="Full screen" aria-label="Full screen" hidden>${ICON.expand}</button>
  </div>
  <div class="address" data-ref="address" role="group" aria-label="Browser address">Waiting for page…</div>
</div>
<div class="stage" data-ref="stage">
  <canvas data-ref="canvas" width="1280" height="800" role="application" aria-label="Live browser. Click into the page, then type."></canvas>
  <textarea class="keys" data-ref="keys" aria-label="Type into the page" autocomplete="off" autocapitalize="off" spellcheck="false"></textarea>
  <button class="take" data-ref="take" type="button" hidden>${ICON.pointer}Click to take control</button>
  <div class="cover" data-ref="cover"><div class="spin" data-ref="spin"></div><h2 data-ref="coverTitle">Connecting to the browser…</h2><p data-ref="coverNote"></p></div>
  <p class="note" data-ref="note" hidden></p>
  <div class="toast" data-ref="toast" role="alert" hidden><strong data-ref="toastTitle"></strong><span data-ref="toastBody"></span></div>
</div>
<div class="foot"><p data-ref="hint">The agent waits while you sign in.</p><button class="done" data-ref="done" type="button" disabled>Done, carry on</button></div>`;
const ref = <T extends HTMLElement>(name: string) => root.querySelector(`[data-ref="${name}"]`) as T;
const canvas = ref<HTMLCanvasElement>("canvas");
const keys = ref<HTMLTextAreaElement>("keys");
const context2d = canvas.getContext("2d");

const state: { account: string | null; view: View | null; revision: string | null; live: boolean; hasControl: boolean; pending: boolean; queue: Input[]; stream: VoxlStream | null; voxl: VoxlConnection | null; timer: number | null; tick: number; finished: boolean; autoMode: boolean; mode: string; streamAsked: boolean } = {
  account: null, view: null, revision: null, live: false, hasControl: false, pending: false, queue: [], stream: null, voxl: null, timer: null, tick: 0, finished: false, autoMode: false, mode: "inline", streamAsked: false,
};

const app = new App({ name: "logBrowserView", version: "1.0.0" }, { availableDisplayModes: ["inline", "fullscreen", "pip"] }, { autoResize: true });

let toastTimer: number | null = null;
function toast(code: string): void {
  ref("toastTitle").textContent = ERRORS[code] ?? "The browser operation failed.";
  ref("toastBody").textContent = ERRORS[code] ? "" : code;
  ref("toast").hidden = false;
  if (toastTimer !== null) clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => (ref("toast").hidden = true), 4000);
}

function modes(): string[] {
  return app.getHostContext()?.availableDisplayModes ?? [];
}

function render(): void {
  const view = state.view;
  const phase = view?.phase;
  const connecting = !view || (Boolean(view.generation) && !state.live && phase !== "browserMissing" && phase !== "viewerUnavailable");
  ref("account").textContent = view ? `${view.account}${view.pageState ? ` · ${view.pageState}` : ""}` : "Waiting for the agent…";
  ref("title").textContent = phase ? TITLES[phase] : "Live browser";
  if (view?.location === "local") {
    renderLocal(view);
    return;
  }
  ref("address").textContent = view?.address ?? "Waiting for page…";
  const pill = ref("pill");
  pill.dataset.tone = phase === "needsAttention" ? "stop" : state.live ? "live" : "";
  ref("pillText").textContent = phase === "needsAttention" ? "Stopped" : state.live ? (state.voxl ? "Live stream" : "Screenshots (fallback)") : "Not connected";
  canvas.dataset.live = String(state.live);
  canvas.dataset.input = String(Boolean(view?.canInteract) && state.live);
  ref("cover").hidden = state.live && !connecting;
  ref("spin").hidden = !connecting && phase !== "busy";
  ref("coverTitle").textContent = connecting ? "Connecting to the browser…" : phase ? TITLES[phase] : "";
  ref("coverNote").textContent = phase && !connecting ? NOTES[phase] : "";
  ref("take").hidden = !(state.live && view?.canInteract && !state.hasControl);
  const note = ref("note");
  note.hidden = !(state.live && phase && phase !== "signInRequired");
  note.textContent = phase ? NOTES[phase] : "";
  const done = ref<HTMLButtonElement>("done");
  done.disabled = !view || state.pending || state.finished;
  done.textContent = state.finished ? "Agent told" : "Done, carry on";
  ref("hint").textContent = state.finished ? "The agent was told to carry on." : phase === "needsAttention" ? "Input is off on this page." : "The agent waits while you sign in.";
  const available = modes();
  ref("full").hidden = !available.includes("fullscreen");
  ref("pip").hidden = !available.includes("pip") || state.mode === "pip";
  ref("full").innerHTML = state.mode === "fullscreen" ? ICON.shrink : ICON.expand;
  root.dataset.mode = state.mode;
}

function renderLocal(view: View): void {
  const asks = view.phase === "signInRequired" || view.phase === "needsAttention";
  ref("pill").dataset.tone = view.phase === "needsAttention" ? "stop" : "";
  ref("pillText").textContent = "On this machine";
  ref("title").textContent = asks ? "Sign-in on this machine" : TITLES[view.phase];
  ref("address").textContent = view.address ?? "The browser window on this machine";
  canvas.dataset.live = "false";
  ref("cover").hidden = false;
  ref("spin").hidden = true;
  ref("coverTitle").textContent = asks ? "Finish in the browser window" : TITLES[view.phase];
  ref("coverNote").textContent = view.phase === "signInRequired" ? "The sign-in is open in the browser window on this machine. Finish there, then press Done so the agent carries on." : view.phase === "needsAttention" ? "The page in the browser window on this machine needs you, and the run is stopped until you clear it there." : NOTES[view.phase];
  ref("take").hidden = true;
  ref("note").hidden = true;
  ref("full").hidden = true;
  ref("pip").hidden = true;
  const done = ref<HTMLButtonElement>("done");
  done.disabled = state.pending || state.finished;
  done.textContent = state.finished ? "Agent told" : "Done, carry on";
  ref("hint").textContent = state.finished ? "The agent was told to carry on." : "The agent waits while you finish in the window.";
  root.dataset.mode = state.mode;
}

async function call(name: string, args: Record<string, unknown>): Promise<ToolAnswer> {
  return (await app.callServerTool({ name, arguments: args })) as ToolAnswer;
}

function errorOf(answer: ToolAnswer): string {
  const error = answer.structuredContent?.error;
  return typeof error === "string" ? error : "browserViewerUnavailable";
}

async function drawJpeg(data: string): Promise<void> {
  const bytes = Uint8Array.from(atob(data), (char) => char.charCodeAt(0));
  const bitmap = await createImageBitmap(new Blob([bytes], { type: "image/jpeg" }));
  try {
    if (canvas.width !== bitmap.width || canvas.height !== bitmap.height) {
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
    }
    context2d?.drawImage(bitmap, 0, 0);
  } finally {
    bitmap.close();
  }
}

function adopt(view: View | null): void {
  if (!view) return;
  const restarted = state.view?.generation !== view.generation;
  state.view = view;
  if (restarted) {
    state.live = false;
    state.hasControl = false;
    state.revision = view.revision;
    state.stream = null;
    state.streamAsked = false;
    stopVoxl();
  }
  if (view.revision && !state.pending) state.revision = view.revision;
  if (view.location === "remote" && view.phase === "signInRequired" && !state.autoMode && modes().includes("fullscreen")) {
    state.autoMode = true;
    void setMode("fullscreen");
  }
}

function stopVoxl(): void {
  state.voxl?.close();
  state.voxl = null;
}

function startVoxl(): void {
  if (state.voxl || !state.stream || !voxlSupported()) return;
  state.voxl = connectVoxl(state.stream, canvas, () => {
    if (!state.live) {
      state.live = true;
      render();
    }
  }, () => {
    state.voxl = null;
    state.stream = null;
    render();
  });
}

async function poll(): Promise<void> {
  state.timer = null;
  const view = state.view;
  if (!state.account) return;
  try {
    if (!view?.generation || view.location === "local") {
      const answer = await call("browserViewDone", { account: state.account });
      adopt((answer.structuredContent?.view as View | undefined) ?? null);
    } else if (view.streamKind === "voxl" && !state.stream && !state.streamAsked && voxlSupported()) {
      state.streamAsked = true;
      const answer = await call("browserViewStream", { account: state.account, generation: view.generation });
      const stream = answer.structuredContent?.stream as VoxlStream | undefined;
      if (!answer.isError && stream?.kind === "voxl") state.stream = stream;
    } else if (state.stream && voxlSupported()) {
      startVoxl();
      const answer = await call("browserViewDone", { account: state.account });
      adopt((answer.structuredContent?.view as View | undefined) ?? null);
    } else {
      const answer = await call("browserViewFrame", { account: state.account, generation: view.generation, withState: state.tick++ % 4 === 0 });
      if (answer.isError) {
        const code = errorOf(answer);
        state.live = false;
        if (code === "browserGenerationChanged" || code === "browserMissing") {
          const fresh = await call("browserViewDone", { account: state.account });
          adopt((fresh.structuredContent?.view as View | undefined) ?? null);
        }
      } else {
        const frame = answer.structuredContent as { data: string; revision: string; view: View | null };
        await drawJpeg(frame.data);
        if (!state.pending) state.revision = frame.revision;
        state.live = true;
        adopt(frame.view);
      }
    }
  } catch {
    state.live = false;
  }
  if (state.view?.location === "remote" && state.stream) startVoxl();
  render();
  state.timer = window.setTimeout(() => void poll(), state.view?.generation && state.view.location === "remote" ? 500 : 2500);
}

function schedule(): void {
  if (state.timer === null) state.timer = window.setTimeout(() => void poll(), 0);
}

async function pump(): Promise<void> {
  if (state.pending || !state.queue.length || !state.view?.canInteract || !state.account) return;
  const event = state.queue.shift()!;
  state.pending = true;
  render();
  try {
    const answer = await call("browserViewInput", { account: state.account, generation: state.view.generation, revision: state.revision, event });
    if (answer.isError) {
      state.queue = [];
      toast(errorOf(answer));
    } else {
      const view = answer.structuredContent?.view as View | undefined;
      state.pending = false;
      adopt(view ?? null);
    }
  } catch {
    state.queue = [];
    toast("browserViewerUnavailable");
  } finally {
    state.pending = false;
    render();
  }
  if (state.queue.length) window.setTimeout(() => void pump(), state.queue[0]?.type === "text" ? 120 : 0);
}

function enqueue(input: Input): void {
  if (!state.live || !state.view?.canInteract || state.queue.length >= 100) return;
  const last = state.queue.at(-1);
  if (input.type === "text" && last?.type === "text" && last.text.length + input.text.length <= 2048) last.text += input.text;
  else state.queue.push(input);
  void pump();
}

function pagePoint(event: MouseEvent): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width;
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height;
  if (state.voxl && state.stream) return { x: x - state.stream.window.left, y: y - state.stream.window.top };
  return { x, y };
}

canvas.addEventListener("click", (event) => {
  if (!state.view?.canInteract) return;
  keys.focus({ preventScroll: true });
  state.hasControl = true;
  enqueue({ type: "click", ...pagePoint(event) });
  render();
});
canvas.addEventListener("wheel", (event) => {
  if (!state.view?.canInteract) return;
  event.preventDefault();
  enqueue({ type: "scroll", deltaY: Math.max(-600, Math.min(600, event.deltaY)) });
}, { passive: false });
keys.addEventListener("input", () => {
  const text = keys.value;
  keys.value = "";
  if (text && text.length <= 2048) enqueue({ type: "text", text });
});
keys.addEventListener("keydown", (event) => {
  if (event.isComposing || event.altKey || event.metaKey || event.ctrlKey || !state.view?.canInteract) return;
  if (KEYS.includes(event.key)) {
    event.preventDefault();
    enqueue({ type: "key", key: event.key });
  }
});
ref("take").addEventListener("click", () => {
  state.hasControl = true;
  keys.focus({ preventScroll: true });
  render();
});

async function setMode(mode: "inline" | "fullscreen" | "pip"): Promise<void> {
  if (!modes().includes(mode)) return;
  try {
    const answer = await app.requestDisplayMode({ mode });
    state.mode = answer.mode;
  } catch {
  }
  render();
}

ref("full").addEventListener("click", () => void setMode(state.mode === "fullscreen" ? "inline" : "fullscreen"));
ref("pip").addEventListener("click", () => void setMode("pip"));
ref("done").addEventListener("click", async () => {
  if (!state.account) return;
  state.pending = true;
  render();
  try {
    const answer = await call("browserViewDone", { account: state.account });
    adopt((answer.structuredContent?.view as View | undefined) ?? null);
    const finished = answer.structuredContent?.done === true;
    const view = state.view;
    const text = finished
      ? `I finished in ${state.account}'s browser: the page no longer asks for sign-in${view?.address ? ` (now on ${view.address})` : ""}. Check it with browserView and carry on.`
      : `I'm done in ${state.account}'s browser, but the page still shows ${view?.pageState ?? view?.phase ?? "an unknown state"}. Check it with browserView before carrying on.`;
    await app.updateModelContext({ content: [{ type: "text", text }] }).catch(() => undefined);
    const sent = await app.sendMessage({ role: "user", content: [{ type: "text", text }] });
    state.finished = !sent.isError;
    if (sent.isError) toast("The host did not take the message. Tell the agent you are done.");
    if (state.mode !== "inline") await setMode("inline");
  } catch {
    toast("The host did not take the message. Tell the agent you are done.");
  } finally {
    state.pending = false;
    render();
  }
});

function hostChanged(context: McpUiHostContext): void {
  if (context.theme) applyDocumentTheme(context.theme);
  if (context.styles?.variables) applyHostStyleVariables(context.styles.variables);
  if (context.displayMode) state.mode = context.displayMode;
  render();
}

app.ontoolinput = (params) => {
  const account = (params.arguments as { account?: unknown } | undefined)?.account;
  if (typeof account === "string") state.account = account;
  render();
};
app.ontoolresult = (result) => {
  const answer = result as ToolAnswer;
  const view = (answer.structuredContent?.json as View | undefined) ?? null;
  if (view) {
    state.account = view.account;
    adopt(view);
  }
  render();
  schedule();
};
app.onhostcontextchanged = (context) => hostChanged(context as McpUiHostContext);
app.onteardown = async () => {
  stopVoxl();
  if (state.timer !== null) clearTimeout(state.timer);
  state.account = null;
  return {};
};

render();
await app.connect();
const initial = app.getHostContext();
if (initial) hostChanged(initial);
