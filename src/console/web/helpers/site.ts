import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, resolve, sep } from "node:path";

export const LOCAL_MODE_SCRIPT = `<script>window.logConsoleMode="local"</script>`;

export function withLocalMode(html: string): string {
  return html.includes("</head>") ? html.replace("</head>", `${LOCAL_MODE_SCRIPT}</head>`) : `${LOCAL_MODE_SCRIPT}${html}`;
}

export function siteBuilt(siteDir: string): boolean {
  return existsSync(join(siteDir, "index.html"));
}

export function siteFileOf(siteDir: string, pathname: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded.includes("\0")) return null;
  const root = resolve(siteDir);
  const path = resolve(root, `.${decoded}`);
  if (path !== root && !path.startsWith(`${root}${sep}`)) return null;
  return existsSync(path) && statSync(path).isFile() ? path : null;
}

export function siteAnswer(siteDir: string, pathname: string): Response {
  const headers = { "X-Content-Type-Options": "nosniff" };
  const file = pathname === "/" || pathname === "/index.html" ? null : siteFileOf(siteDir, pathname);
  if (file) return new Response(Bun.file(file), { headers });
  if (extname(pathname)) return new Response("Not found", { status: 404, headers });
  const html = withLocalMode(readFileSync(join(siteDir, "index.html"), "utf8"));
  return new Response(html, { headers: { ...headers, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
