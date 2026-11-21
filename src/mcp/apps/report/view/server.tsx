import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { transform } from "sucrase";
import { MACHINE_FONT, machineCss } from "../../../../relate/machine/theme.ts";
import { KitProvider, setHost } from "./kit.tsx";
import type { KitHost } from "./kit.tsx";
import { VIEW_MODULES, viewFromModule } from "./run.ts";

export const VIEW_IMPORTS = ["log", "react"] as const;
export const VIEW_CODE_LIMIT = 60_000;

const WIDGET_ENTRY = fileURLToPath(new URL("./widget.tsx", import.meta.url));
const KIT_CSS = fileURLToPath(new URL("./kit.css", import.meta.url));
const GEIST = fileURLToPath(new URL("../../../../../site/apps/web/public/fonts/geist-latin-wght-normal.woff2", import.meta.url));
const SATOSHI = new URL("../../../../../site/apps/web/public/fonts/satoshi-webfont/", import.meta.url);
const STARTERS = new URL("./starters/", import.meta.url);

export type Compiled = { ok: true; compiled: string } | { ok: false; error: string };

const COMPILED_DYNAMIC_IMPORT = /Promise\.resolve\(\)\.then\(\(\)\s*=>\s*_interopRequireWildcard\(require\(/;
const NATIVE_DYNAMIC_IMPORT = /\bimport\s*\(/;
const REQUIRE_CALL = /\brequire\(\s*([^)]*)\)/g;

export function dynamicImportIn(compiled: string): string | null {
  if (COMPILED_DYNAMIC_IMPORT.test(compiled) || NATIVE_DYNAMIC_IMPORT.test(compiled)) return `viewImportRefused: a view can't load a module with import(): import from ${VIEW_IMPORTS.map((n) => `"${n}"`).join(" and ")} at the top`;
  for (const [, argument] of compiled.matchAll(REQUIRE_CALL)) {
    const name = /^["']([^"']+)["']$/.exec(argument.trim())?.[1];
    if (!name || !VIEW_MODULES.includes(name)) return `viewImportRefused: a view can't require ${argument.trim() || "a module"}: import from ${VIEW_IMPORTS.map((n) => `"${n}"`).join(" and ")} at the top`;
  }
  return null;
}

export function compileView(code: string): Compiled {
  const imports = [...code.matchAll(/^\s*import\s[\s\S]*?from\s+["']([^"']+)["']/gm)].map((m) => m[1]);
  const outside = imports.filter((name) => !(VIEW_IMPORTS as readonly string[]).includes(name));
  if (outside.length) return { ok: false, error: `a view imports only from "log" and "react"; it imported ${outside.map((n) => `"${n}"`).join(", ")}` };
  try {
    const out = transform(code, { transforms: ["jsx", "typescript", "imports"], jsxRuntime: "automatic", production: true, filePath: "App.jsx" });
    const refused = dynamicImportIn(out.code);
    if (refused) return { ok: false, error: refused };
    return { ok: true, compiled: out.code };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export function starterCode(name: string): string {
  return readFileSync(fileURLToPath(new URL(`${name}.jsx`, STARTERS)), "utf8");
}

const ENTITY: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#x27;": "'", "&#39;": "'", "&nbsp;": " " };

export function htmlText(html: string): string {
  return html
    .replace(/<svg[\s\S]*?<\/svg>/g, "")
    .replace(/<h1[^>]*>/g, "\n# ")
    .replace(/<h2[^>]*>/g, "\n## ")
    .replace(/<\/(td|th)>/g, " | ")
    .replace(/<tr[^>]*>/g, "\n| ")
    .replace(/<\/(p|div|section|header|li|h1|h2|h3|blockquote|table|tr)>/g, "\n")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<\/(span|strong|time|b|em|small)>/g, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&(amp|lt|gt|quot|#x27|#39|nbsp);/g, (m) => ENTITY[m] ?? m)
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter((line, i, all) => line || (all[i - 1] ?? "") !== "")
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function staticMarkup(compiled: string, data: Record<string, unknown>, title: string | undefined, subtitle: string | undefined, host: KitHost): string {
  setHost(host);
  const View = viewFromModule(new Function("require", "module", "exports", compiled) as Parameters<typeof viewFromModule>[0]);
  return renderToStaticMarkup(
    <KitProvider value={host}>
      <View data={data} title={title} subtitle={subtitle} />
    </KitProvider>,
  );
}

export function viewText(compiled: string, data: Record<string, unknown>, title?: string, subtitle?: string): string {
  return htmlText(staticMarkup(compiled, data, title, subtitle, { call: async () => Promise.reject(new Error("no live calls in text")), data }));
}

export function viewMarkup(compiled: string, data: Record<string, unknown>, title?: string, subtitle?: string): string {
  return staticMarkup(compiled, data, title, subtitle, { call: async () => Promise.reject(new Error("no live calls in a drawn view")), data, ask: async () => {} });
}

const DARK_MEDIA = "@media (prefers-color-scheme: dark) {";

function closingBrace(css: string, open: number): number {
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) return i;
  }
  return css.length;
}

export function scopeKitCss(css: string, scope = ".logview"): string {
  let out = css
    .replace(/:root,\s*\[data-sb-theme='classic'\]/g, scope)
    .replace(/:root/g, scope)
    .replace(/html, body/g, scope)
    .replace(/#root/g, scope);
  for (let at = out.indexOf(DARK_MEDIA); at !== -1; at = out.indexOf(DARK_MEDIA, at)) {
    const open = at + DARK_MEDIA.length - 1;
    const close = closingBrace(out, open);
    const inner = out.slice(open + 1, close).replace(/([^{}]+)\{/g, (_, selectors: string) => `${selectors.split(",").map((s) => `.dark ${s.trim()}`).join(", ")} {`);
    out = out.slice(0, at) + inner + out.slice(close + 1);
  }
  return out;
}

const HERMES_FRAME = ".logview { display: block; margin: 8px 0; border-radius: 16px; overflow: hidden; max-width: 1100px; line-height: 1.45; } .logview .sb-page { padding: 20px 22px 24px; } .logview button { font: inherit; }";

export function hermesKitCss(): string {
  return `${geistFace()}${scopeKitCss(readFileSync(KIT_CSS, "utf8"))}${scopeKitCss(machineCss())}${HERMES_FRAME}`;
}

let built: Promise<string> | null = null;

async function widgetScript(): Promise<string> {
  const output = await Bun.build({ entrypoints: [WIDGET_ENTRY], target: "browser", format: "esm", minify: true, define: { "process.env.NODE_ENV": '"production"' } });
  if (!output.success || !output.outputs[0]) throw new Error(`viewBuildFailed: ${output.logs.map((log) => log.message).join("; ")}`);
  return output.outputs[0].text();
}

function faceOf(family: string, file: string, weight: string, format: "woff" | "woff2", style = "normal"): string {
  if (!existsSync(file)) return "";
  return `@font-face{font-family:"${family}";font-style:${style};font-weight:${weight};font-display:swap;src:url(data:font/${format};base64,${readFileSync(file).toString("base64")}) format("${format}")}`;
}

function geistFace(): string {
  const machine = MACHINE_FONT.files.map(({ file, weight, style }) => faceOf(MACHINE_FONT.face, fileURLToPath(new URL(file, SATOSHI)), String(weight), "woff", style));
  return `${faceOf("Geist", GEIST, "100 900", "woff2")}${machine.join("")}`;
}

export function viewPage(script: string, baked?: unknown): string {
  const safe = script.replace(/<\/script/gi, "<\\/script");
  const data = baked ? `<script type="application/json" id="log:view-data">${JSON.stringify(baked).replace(/</g, "\\u003c")}</script>` : "";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>log</title><style>${geistFace()}${readFileSync(KIT_CSS, "utf8")}</style>${data}</head><body><div id="root"></div><script type="module">${safe}</script></body></html>`;
}

export function viewHtml(): Promise<string> {
  built ??= widgetScript().then((script) => viewPage(script)).catch((error: unknown) => {
    built = null;
    throw error;
  });
  return built;
}

export async function previewHtml(baked: unknown): Promise<string> {
  return viewPage(await widgetScript(), baked);
}
