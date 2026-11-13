import { App as HostApp, applyDocumentTheme } from "@modelcontextprotocol/ext-apps";
import type { McpUiHostContext } from "@modelcontextprotocol/ext-apps";
import { Component, StrictMode } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorNote, KitProvider, Page, setHost } from "./kit.tsx";
import type { KitHost } from "./kit.tsx";
import { viewFromModule } from "./run.ts";
import type { ViewComponent } from "./run.ts";

interface ViewPayload {
  title?: string;
  subtitle?: string;
  compiled?: string;
  data?: Record<string, unknown>;
}

interface ToolAnswer {
  isError?: boolean;
  structuredContent?: Record<string, unknown>;
  content?: { type: string; text?: string }[];
}

class Boundary extends Component<{ children: ReactNode; title?: string }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {}
  render() {
    if (this.state.error)
      return (
        <Page title={this.props.title}>
          <ErrorNote error={`This view broke while drawing: ${this.state.error.message}`} />
        </Page>
      );
    return this.props.children;
  }
}

const textOf = (answer: ToolAnswer): string => (answer.content ?? []).map((part) => part.text ?? "").join("\n");

function answerData(answer: ToolAnswer): unknown {
  if (answer.isError) throw new Error(textOf(answer) || "the tool refused");
  if (answer.structuredContent) {
    const inner = answer.structuredContent as { stdout?: unknown };
    if (typeof inner.stdout === "string") {
      try {
        return JSON.parse(inner.stdout);
      } catch {
        return inner.stdout;
      }
    }
    return answer.structuredContent;
  }
  const text = textOf(answer);
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

const app = new HostApp({ name: "logView", version: "1.0.0" }, {}, { autoResize: true });
const root = createRoot(document.getElementById("root") as HTMLElement);

const host: KitHost = {
  call: async (name, args) => answerData((await app.callServerTool({ name, arguments: args })) as ToolAnswer),
  data: {},
};

function loading() {
  root.render(
    <div className="sb-skeleton" aria-busy="true">
      <i />
      <i />
    </div>,
  );
}

type Factory = Parameters<typeof viewFromModule>[0];

function load(compiled: string): ViewComponent {
  const holder = window as unknown as { __logViewFactory?: Factory };
  holder.__logViewFactory = undefined;
  const script = document.createElement("script");
  script.textContent = `window.__logViewFactory = function (require, module, exports) {\n${compiled}\n};`;
  document.head.appendChild(script);
  script.remove();
  const factory = holder.__logViewFactory ?? (new Function("require", "module", "exports", compiled) as Factory);
  holder.__logViewFactory = undefined;
  return viewFromModule(factory);
}

function draw(payload: ViewPayload) {
  const data = payload.data ?? {};
  const bound: KitHost = { ...host, data };
  setHost(bound);
  let View: ViewComponent;
  try {
    View = load(payload.compiled ?? "");
  } catch (error) {
    root.render(
      <Page title={payload.title}>
        <ErrorNote error={error instanceof Error ? error.message : String(error)} />
      </Page>,
    );
    return;
  }
  root.render(
    <StrictMode>
      <KitProvider value={bound}>
        <Boundary title={payload.title}>
          <View data={data} title={payload.title} subtitle={payload.subtitle} />
        </Boundary>
      </KitProvider>
    </StrictMode>,
  );
}

function themed(context: McpUiHostContext | undefined) {
  if (!context?.theme) return;
  applyDocumentTheme(context.theme);
  document.documentElement.style.colorScheme = context.theme;
}

app.ontoolresult = (result) => {
  const answer = result as ToolAnswer;
  if (answer.isError) {
    root.render(
      <Page>
        <ErrorNote error={textOf(answer) || "The view was refused."} />
      </Page>,
    );
    return;
  }
  draw((answer.structuredContent ?? {}) as ViewPayload);
};
app.onhostcontextchanged = (context) => themed(context as McpUiHostContext);
app.onteardown = async () => ({});

const baked = document.getElementById("log:view-data")?.textContent;
if (baked) draw(JSON.parse(baked) as ViewPayload);
else {
  loading();
  await app.connect();
  themed(app.getHostContext());
}
