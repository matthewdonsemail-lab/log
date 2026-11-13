import { fileURLToPath } from "node:url";
import { fontFaces } from "../../browserView/helpers/build.ts";
import { reportStyle } from "./style.ts";

export const REPORT_WIDGET_ENTRY = fileURLToPath(new URL("../widget/main.ts", import.meta.url));

let built: Promise<string> | null = null;

export async function buildReportScript(): Promise<string> {
  const output = await Bun.build({ entrypoints: [REPORT_WIDGET_ENTRY], target: "browser", format: "esm", minify: true });
  if (!output.success || !output.outputs[0]) throw new Error(`reportBuildFailed: ${output.logs.map((log) => log.message).join("; ")}`);
  return output.outputs[0].text();
}

export function reportPage(script: string): string {
  const safe = script.replace(/<\/script/gi, "<\\/script");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Report</title><style>${fontFaces()}${reportStyle}</style></head><body><main id="app" class="app"></main><script type="module">${safe}</script></body></html>`;
}

export function reportHtml(): Promise<string> {
  built ??= buildReportScript().then(reportPage).catch((error: unknown) => {
    built = null;
    throw error;
  });
  return built;
}
