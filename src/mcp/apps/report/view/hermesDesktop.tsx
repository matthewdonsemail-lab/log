import "../../widgetKit/jitless.ts";
import { host, TRANSCRIPT_DIRECTIVE_AREA } from "@hermes/plugin-sdk";
import kitCss from "logViewCss";
import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { composerActions } from "../../../../../vendor/hermesGenui/web/src/host/actions.ts";
import genui from "../../../../../vendor/hermesGenui/web/src/plugin.tsx";
import { MACHINE_BLOCK } from "../../../../relate/machine/types.ts";
import { MACHINE_GENUI_ENTRY } from "./genuiMachine.tsx";
import { APP_DIRECTIVE, appApi, parseAppDirective } from "./appBridge.ts";
import { injectAppStyles, LogApp } from "./hermesApp.tsx";
import { cleanViewHtml } from "./hermesClean.ts";

export const HERMES_PLUGIN_ID = "log";
export const VIEW_DIRECTIVE = "logview";
export const BROWSER_DIRECTIVE = "logbrowser";
export const BROWSER_TOOL = "browserView";
const STYLE_ID = "logViewKit";
const VIEW_ID = /^[0-9a-f]{8}$/;

type Load = (id: string) => Promise<unknown>;
type Send = (text: string) => void;
type State = { kind: "loading" } | { kind: "drawn"; html: string } | { kind: "failed" };

function injectStyles(): void {
  let el = document.getElementById(STYLE_ID);
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = kitCss;
}

export function storedHtml(stored: unknown): string | null {
  const html = (stored as { html?: unknown } | null)?.html;
  return typeof html === "string" && html.trim() ? html : null;
}

function Note({ text }: { text: string }) {
  return (
    <div className="logview">
      <div className="sb-page">
        <span className="sb-stat-hint">{text}</span>
      </div>
    </div>
  );
}

export function LogView({ id, streaming, load, send }: { id: string | undefined; streaming: boolean; load: Load; send: Send }) {
  const valid = typeof id === "string" && VIEW_ID.test(id);
  const [state, setState] = useState<State>({ kind: "loading" });
  useEffect(() => {
    if (streaming || !valid) return;
    let live = true;
    load(id as string)
      .then((stored) => {
        const html = storedHtml(stored);
        if (live) setState(html ? { kind: "drawn", html: cleanViewHtml(html) } : { kind: "failed" });
      })
      .catch(() => {
        if (live) setState({ kind: "failed" });
      });
    return () => {
      live = false;
    };
  }, [id, streaming, valid]);
  if (!valid && !streaming) return <Note text="This view can't be found." />;
  if (streaming || state.kind === "loading") return <Note text="Drawing the view..." />;
  if (state.kind === "failed") return <Note text="This view can't be loaded here." />;
  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = (event.target as Element | null)?.closest?.("[data-ask]") as HTMLElement | null;
    const prompt = target?.dataset.ask;
    if (!prompt) return;
    event.preventDefault();
    send(prompt);
  };
  return <div className="logview" onClick={onClick} dangerouslySetInnerHTML={{ __html: state.html }} />;
}

export default {
  id: HERMES_PLUGIN_ID,
  name: "log",
  register(ctx: { rest: (path: string, opts?: { method?: string; body?: unknown }) => Promise<unknown>; register: (contribution: unknown) => unknown }) {
    genui.registerBlock(MACHINE_BLOCK, MACHINE_GENUI_ENTRY);
    genui.register(ctx);
    injectStyles();
    injectAppStyles();
    const apps = appApi(ctx.rest);
    void apps.warm();
    const load: Load = (id) => ctx.rest(`/views/${id}`);
    const send: Send = (text) => composerActions(host?.composer).send(text);
    const sent = (text: string) => {
      send(text);
      return true;
    };
    const open = (url: string) => Boolean(window.open(url, "_blank", "noopener,noreferrer"));
    const app = (attrs: Record<string, string> | undefined, streaming: boolean, fallbackTool?: string) => {
      const parsed = parseAppDirective(attrs, fallbackTool);
      return <LogApp directive={parsed.ok ? parsed.directive : null} problem={parsed.ok ? undefined : parsed.problem} streaming={streaming} api={apps} send={sent} open={open} />;
    };
    ctx.register({
      id: "logViewTag",
      area: TRANSCRIPT_DIRECTIVE_AREA,
      data: {
        name: VIEW_DIRECTIVE,
        render: ({ attrs, streaming }: { attrs: Record<string, string>; streaming: boolean }) => <LogView id={attrs?.id} streaming={Boolean(streaming)} load={load} send={send} />,
      },
    });
    ctx.register({
      id: "logAppTag",
      area: TRANSCRIPT_DIRECTIVE_AREA,
      data: {
        name: APP_DIRECTIVE,
        render: ({ attrs, streaming }: { attrs: Record<string, string>; streaming: boolean }) => app(attrs, Boolean(streaming)),
      },
    });
    ctx.register({
      id: "logBrowserTag",
      area: TRANSCRIPT_DIRECTIVE_AREA,
      data: {
        name: BROWSER_DIRECTIVE,
        render: ({ attrs, streaming }: { attrs: Record<string, string>; streaming: boolean }) => app({ account: attrs?.account ?? "" }, Boolean(streaming), BROWSER_TOOL),
      },
    });
  },
};
