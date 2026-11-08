import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const vendorSrc = join(root, "vendor", "reverseChud", "src");
const bridgeDir = join(root, "src", "reddit", "engine");
const NETWORK_MODULES = /from\s+["'](node:)?(http|https|http2|net|tls|dgram|undici|axios|node-fetch|got|ky|ws)["']/;
const SESSION_FILE = "session.ts";
const SOLVER_FILE = "capsolver.ts";
const PINNED_PROFILE = /export const DEFAULT_REDDIT_BROWSER_PROFILE = "chrome_\d+" as const;/;

export function transportProblems(files: Record<string, string>, bridge: Record<string, string>): string[] {
  const problems: string[] = [];
  for (const [name, text] of Object.entries(files)) {
    if (NETWORK_MODULES.test(text)) problems.push(`vendor/reverseChud/src/${name} imports a network module of its own`);
    if (/from\s+["']wreq-js["']/.test(text) && name !== SESSION_FILE) problems.push(`vendor/reverseChud/src/${name} imports wreq-js outside ${SESSION_FILE}`);
    if (name !== SOLVER_FILE && /(^|[^.\w#])fetch\s*\(/m.test(text.replace(/^\s*(async\s+)?fetch\s*\(/gm, ""))) problems.push(`vendor/reverseChud/src/${name} calls the global fetch instead of its session`);
  }
  if (!PINNED_PROFILE.test(files[SESSION_FILE] ?? "")) problems.push(`vendor/reverseChud/src/${SESSION_FILE} doesn't pin one browser profile`);
  for (const [name, text] of Object.entries(bridge)) {
    for (const match of text.matchAll(/from\s+["']([^"']+)["']/g)) {
      const target = match[1];
      if (target.includes("vendor/reverseChud") && !target.endsWith("vendor/reverseChud/src/index.ts")) problems.push(`src/reddit/engine/${name} reaches into reverseChud past its index`);
      if (NETWORK_MODULES.test(match[0]) || target === "wreq-js") problems.push(`src/reddit/engine/${name} opens a network path of its own`);
    }
    if (/(^|[^.\w])fetch\s*\(/m.test(text)) problems.push(`src/reddit/engine/${name} calls fetch instead of reverseChud's session`);
  }
  return problems;
}

function read(dir: string): Record<string, string> {
  return Object.fromEntries(readdirSync(dir).filter((name) => name.endsWith(".ts") && !name.endsWith(".test.ts")).map((name) => [name, readFileSync(join(dir, name), "utf8")]));
}

if (import.meta.main) {
  const problems = transportProblems(read(vendorSrc), read(bridgeDir));
  if (problems.length) {
    for (const problem of problems) console.error(`reverseChudTransport: ${problem}`);
    console.error(`reverseChudTransport: Reddit is reached only through reverseChud's one wreq-js session (${relative(root, join(vendorSrc, SESSION_FILE))}), one pinned browser profile.`);
    process.exit(1);
  }
  console.log("reverseChudTransport: Reddit goes out only through reverseChud's one wreq-js session, one pinned browser profile.");
}
