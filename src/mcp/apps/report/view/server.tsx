import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { transform } from "sucrase";
import { KitProvider, setHost } from "./kit.tsx";
import { VIEW_MODULES, viewFromModule } from "./run.ts";

export const VIEW_IMPORTS = ["log", "react"] as const;
export const VIEW_CODE_LIMIT = 60_000;

const WIDGET_ENTRY = fileURLToPath(new URL("./widget.tsx", import.meta.url));
const KIT_CSS = fileURLToPath(new URL("./kit.css", import.meta.url));
const GEIST = fileURLToPath(new URL("../../../../../site/apps/web/public/fonts/geist-latin-wght-normal.woff2", import.meta.url));
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

export function viewText(compiled: string, data: Record<string, unknown>, title?: string, subtitle?: string): string {
  const host = { call: async () => Promise.reject(new Error("no live calls in text")), data };
  setHost(host);
  const View = viewFromModule(new Function("require", "module", "exports", compiled) as Parameters<typeof viewFromModule>[0]);
  return htmlText(renderToStaticMarkup(
    <KitProvider value={host}>
      <View data={data} title={title} subtitle={subtitle} />
    </KitProvider>,
  ));
}

let built: Promise<string> | null = null;

async function widgetScript(): Promise<string> {
  const output = await Bun.build({ entrypoints: [WIDGET_ENTRY], target: "browser", format: "esm", minify: true, define: { "process.env.NODE_ENV": '"production"' } });
  if (!output.success || !output.outputs[0]) throw new Error(`viewBuildFailed: ${output.logs.map((log) => log.message).join("; ")}`);
  return output.outputs[0].text();
}

function geistFace(): string {
  if (!existsSync(GEIST)) return "";
  return `@font-face{font-family:"Geist";font-style:normal;font-weight:100 900;font-display:swap;src:url(data:font/woff2;base64,${readFileSync(GEIST).toString("base64")}) format("woff2")}`;
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
