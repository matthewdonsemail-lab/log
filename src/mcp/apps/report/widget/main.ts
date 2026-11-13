import { App, applyDocumentTheme, applyHostStyleVariables } from "@modelcontextprotocol/ext-apps";
import type { McpUiHostContext } from "@modelcontextprotocol/ext-apps";
import type { ReportSpec } from "../types.ts";
import { reportBodyHtml } from "./render.ts";

interface ToolAnswer {
  isError?: boolean;
  structuredContent?: Record<string, unknown>;
  content?: { type: string; text?: string }[];
}

const ICON = {
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  expand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  shrink: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>',
};

const root = document.getElementById("app") as HTMLElement;
root.innerHTML = `
<header class="head">
  <span class="mark">${ICON.chart}</span>
  <span class="titles"><h1 data-ref="title"></h1><span data-ref="subtitle"></span></span>
  <button class="icon" data-ref="full" type="button" title="Full screen" aria-label="Full screen" hidden>${ICON.expand}</button>
</header>
<div class="body" data-ref="body" aria-busy="true"></div>
<div class="toast" data-ref="toast" role="alert" hidden></div>`;
const ref = <T extends HTMLElement>(name: string) => root.querySelector(`[data-ref="${name}"]`) as T;

const SKELETON = `<div class="waiting" role="status" aria-label="Building the report"><span class="spin"></span><div class="skeleton tiles"><i></i><i></i><i></i></div><div class="skeleton card"></div><div class="skeleton card short"></div></div>`;

const state: { spec: ReportSpec | null; mode: string; pendingTitle: string | null } = { spec: null, mode: "inline", pendingTitle: null };
const app = new App({ name: "logReport", version: "1.0.0" }, { availableDisplayModes: ["inline", "fullscreen"] }, { autoResize: true });

function modes(): string[] {
  return app.getHostContext()?.availableDisplayModes ?? [];
}

let toastTimer: number | null = null;
function toast(text: string): void {
  const box = ref("toast");
  box.textContent = text;
  box.hidden = false;
  if (toastTimer !== null) clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => (box.hidden = true), 5000);
}

function render(): void {
  const spec = state.spec;
  ref("title").textContent = spec?.title ?? state.pendingTitle ?? "Report";
  const subtitle = ref("subtitle");
  subtitle.textContent = spec?.subtitle ?? "";
  subtitle.hidden = !spec?.subtitle;
  const body = ref("body");
  if (spec) {
    body.innerHTML = reportBodyHtml(spec);
    body.setAttribute("aria-busy", "false");
  } else if (body.getAttribute("aria-busy") === "true" && !body.innerHTML) {
    body.innerHTML = SKELETON;
  }
  const full = ref("full");
  full.hidden = !modes().includes("fullscreen");
  full.innerHTML = state.mode === "fullscreen" ? ICON.shrink : ICON.expand;
  full.title = state.mode === "fullscreen" ? "Exit full screen" : "Full screen";
  root.dataset.mode = state.mode;
  document.documentElement.style.overflow = state.mode === "fullscreen" ? "auto" : "hidden";
}

function isSpec(value: unknown): value is ReportSpec {
  return Boolean(value && typeof value === "object" && typeof (value as ReportSpec).title === "string" && Array.isArray((value as ReportSpec).blocks));
}

async function setMode(mode: "inline" | "fullscreen"): Promise<void> {
  if (!modes().includes(mode)) return;
  try {
    state.mode = (await app.requestDisplayMode({ mode })).mode;
  } catch {
    toast("The host did not change the display mode.");
  }
  render();
}

ref("full").addEventListener("click", () => void setMode(state.mode === "fullscreen" ? "inline" : "fullscreen"));

function hostChanged(context: McpUiHostContext): void {
  if (context.theme) applyDocumentTheme(context.theme);
  if (context.styles?.variables) applyHostStyleVariables(context.styles.variables);
  if (context.displayMode) state.mode = context.displayMode;
  render();
}

app.ontoolinput = (params) => {
  const title = (params.arguments as { title?: unknown } | undefined)?.title;
  if (typeof title === "string") state.pendingTitle = title;
  render();
};
app.ontoolresult = (result) => {
  const answer = result as ToolAnswer;
  if (answer.isError) {
    const body = ref("body");
    body.setAttribute("aria-busy", "false");
    body.innerHTML = `<p class="prose muted">This report could not be drawn. The agent was told why and can send it again.</p>`;
    toast(`Report refused: ${/^(report[A-Za-z]+):/.exec(answer.content?.[0]?.text ?? "")?.[1] ?? "reportFieldInvalid"}`);
    return;
  }
  const spec = answer.structuredContent;
  if (isSpec(spec)) state.spec = spec;
  render();
};
app.onhostcontextchanged = (context) => hostChanged(context as McpUiHostContext);
app.onteardown = async () => ({});

render();
await app.connect();
const initial = app.getHostContext();
if (initial) hostChanged(initial);
