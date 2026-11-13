import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { CONSOLE_SCREENS } from "../../src/console/screens/index.ts";
import type { ConsoleScreen } from "../../src/console/screens/index.ts";

export interface NavEntry {
  to: string;
  label: string;
}

export interface ParityFiles {
  read: (rel: string) => string | null;
}

const WEB = "site/apps/web/src";

export function navOf(layout: string): NavEntry[] {
  const block = /const NAV[^=]*=\s*\[([\s\S]*?)\n\]/.exec(layout)?.[1] ?? "";
  return [...block.matchAll(/\{\s*to:\s*'([^']+)',\s*label:\s*'([^']+)'/g)].map((match) => ({ to: match[1], label: match[2] }));
}

export function pageFileOf(app: string, route: string): string | null {
  const escaped = route.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
  const element = new RegExp(`<Route path="${escaped}" element=\\{[^\\n]*?<(\\w+)`).exec(app)?.[1];
  if (!element) return null;
  const from = new RegExp(`import \\{[^}]*\\b${element}\\b[^}]*\\} from '\\./([^']+)'`).exec(app)?.[1];
  return from ? `${WEB}/${from}.tsx` : null;
}

function localImports(rel: string, text: string): string[] {
  return [...text.matchAll(/from '\.\/([\w]+)'/g)].map((match) => `${dirname(rel)}/${match[1]}`);
}

function webReads(files: ParityFiles, page: string, api: string): boolean {
  const text = files.read(page);
  if (text === null) return false;
  if (text.includes(`'${api}`) || text.includes(`\`${api}`)) return true;
  return localImports(page, text).some((base) => [".ts", ".tsx"].some((ext) => {
    const imported = files.read(`${base}${ext}`);
    return imported !== null && (imported.includes(`'${api}`) || imported.includes(`\`${api}`));
  }));
}

function importsLoader(text: string | null, prefix: string, domain: string): boolean {
  return text !== null && text.includes(`from "${prefix}${domain}/index.ts"`);
}

export function consoleParityProblems(files: ParityFiles, screens: readonly ConsoleScreen[] = CONSOLE_SCREENS): string[] {
  const problems: string[] = [];
  const layout = files.read(`${WEB}/pages/console/ConsoleLayout.tsx`);
  const app = files.read(`${WEB}/App.tsx`);
  if (layout === null || app === null) return [`${WEB}/pages/console/ConsoleLayout.tsx or ${WEB}/App.tsx is missing`];
  const nav = navOf(layout);
  if (!nav.length) problems.push("ConsoleLayout.tsx has no NAV entries the check can read");
  const navText = nav.map((entry) => `${entry.label} ${entry.to}`).join(", ");
  const screenText = screens.map((screen) => `${screen.label} ${screen.route}`).join(", ");
  if (navText !== screenText) problems.push(`the web NAV (${navText}) and CONSOLE_SCREENS in src/console/screens (${screenText}) differ: every web page needs its clack screen, in the same order`);
  const api = files.read("src/console/web/helpers/api.ts");
  const command = files.read("src/cli/console/index.ts");
  for (const screen of screens) {
    if (files.read(`src/console/${screen.domain}/index.ts`) === null) problems.push(`src/console/${screen.domain}/index.ts is missing: ${screen.label}'s loader`);
    const clack = `src/cli/console/helpers/${screen.domain}Screen.ts`;
    const clackText = files.read(clack);
    if (clackText === null) problems.push(`${clack} is missing: ${screen.label} has no clack screen`);
    else if (!importsLoader(clackText, "../../../console/", screen.domain)) problems.push(`${clack} doesn't read src/console/${screen.domain}: the clack screen must use the same loader as the web page`);
    if (command === null || !new RegExp(`\\b${screen.domain}: run\\w+Screen\\b`).test(command)) problems.push(`src/cli/console/index.ts doesn't open ${screen.label}'s clack screen from its menu`);
    if (!importsLoader(api, "../../", screen.domain)) problems.push(`src/console/web/helpers/api.ts doesn't answer ${screen.api} from src/console/${screen.domain}`);
    const page = pageFileOf(app, screen.route);
    if (!page) problems.push(`App.tsx has no page for ${screen.route}`);
    else if (!webReads(files, page, screen.api)) problems.push(`${page} (or a ./data module it imports) doesn't fetch ${screen.api}: the web page must read the same loader as the clack screen`);
  }
  return problems;
}

if (import.meta.main) {
  const root = join(import.meta.dir, "..", "..");
  const files: ParityFiles = { read: (rel) => (existsSync(join(root, rel)) ? readFileSync(join(root, rel), "utf8").replace(/\r\n/g, "\n") : null) };
  const problems = consoleParityProblems(files);
  if (problems.length) {
    console.error(`Console parity:\n${problems.map((problem) => `  - ${problem}`).join("\n")}`);
    process.exit(1);
  }
  console.log(`consoleParity: ${CONSOLE_SCREENS.length} web console pages each have a clack screen, and both read the same src/console loader.`);
}
